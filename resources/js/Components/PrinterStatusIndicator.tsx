import React, { useState, useEffect } from 'react';
import { Printer, AlertCircle, RefreshCw, Globe, Bluetooth } from 'lucide-react';
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
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" title="Metode: Browser Printing">
                <Globe className="w-4 h-4 text-gray-500" />
            </div>
        );
    }

    return (
        <div 
            onClick={checkPrinter}
            className={`
                flex items-center justify-center w-8 h-8 rounded-full border cursor-pointer transition-all active:scale-95
                ${status === 'online' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600' : 
                  status === 'checking' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-500' :
                  'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-500'}
            `}
            title={status === 'online' ? 'Direct/Bluetooth Terhubung' : status === 'checking' ? 'Mengecek...' : 'Direct/Bluetooth Terputus'}
        >
            {status === 'checking' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
                <Bluetooth className={`w-4 h-4 ${status === 'online' ? 'animate-pulse' : ''}`} />
            )}
        </div>
    );
};

export default PrinterStatusIndicator;
