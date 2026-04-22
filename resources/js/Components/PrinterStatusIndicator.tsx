import React, { useState, useEffect } from 'react';
import { Printer, AlertCircle, RefreshCw } from 'lucide-react';
import { printerService, PrinterSettings } from '@/Utils/printer';

interface Props {
    settings: PrinterSettings;
}

const PrinterStatusIndicator: React.FC<Props> = ({ settings }) => {
    const [status, setStatus] = useState<'online' | 'offline' | 'error' | 'checking'>('checking');
    
    const checkPrinter = async () => {
        if (settings.pos_print_method !== 'direct') {
            setStatus('online'); // Standard browser printing is always "ready"
            return;
        }

        setStatus('checking');
        const result = await printerService.getStatus(settings);
        setStatus(result);
    };

    useEffect(() => {
        checkPrinter();
        
        // Poll every 15 seconds if using direct printing
        let interval: any;
        if (settings.pos_print_method === 'direct') {
            interval = setInterval(checkPrinter, 15000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [settings.pos_print_method, settings.pos_print_proxy_url, settings.pos_printer_ip]);

    if (settings.pos_print_method === 'browser') {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <Printer className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Printer: Browser</span>
            </div>
        );
    }

    return (
        <div 
            onClick={checkPrinter}
            className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all active:scale-95
                ${status === 'online' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600' : 
                  status === 'checking' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-500' :
                  'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-500'}
            `}
            title={status === 'online' ? 'Printer Terhubung' : status === 'checking' ? 'Mengecek...' : 'Printer Terputus'}
        >
            {status === 'checking' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : status === 'online' ? (
                <Printer className="w-3.5 h-3.5" />
            ) : (
                <AlertCircle className="w-3.5 h-3.5" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
                {status === 'online' ? 'Thermal: Ready' : status === 'checking' ? 'Checking' : 'Thermal: Offline'}
            </span>
            {status === 'online' && (
                <span className="relative flex h-1.5 w-1.5 focus:outline-none">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
            )}
        </div>
    );
};

export default PrinterStatusIndicator;
