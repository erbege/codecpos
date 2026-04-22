import { toast } from 'sonner';

export interface PrinterSettings {
    pos_print_method: 'browser' | 'direct';
    pos_printer_connection: 'network_lan' | 'bluetooth_usb';
    pos_printer_ip: string;
    pos_printer_port: string;
    pos_print_proxy_url: string;
    shop_name?: string;
    shop_address?: string;
    shop_phone?: string;
}

/**
 * Utility to handle printing across the application.
 * Supports standard browser print and direct ESC/POS printing.
 */
export const printerService = {
    /**
     * Main print function
     */
    async print(settings: PrinterSettings, content: any, type: 'sale' | 'shift') {
        if (settings.pos_print_method === 'browser') {
            return this.printBrowser();
        }

        return this.printDirect(settings, content, type);
    },

    /**
     * Check printer connectivity status
     */
    async getStatus(settings: PrinterSettings): Promise<'online' | 'offline' | 'error'> {
        try {
            const proxyUrl = settings.pos_print_proxy_url || 'http://localhost:8080';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

            const response = await fetch(`${proxyUrl}/status`, { 
                method: 'GET',
                signal: controller.signal 
            });
            
            clearTimeout(timeoutId);
            return response.ok ? 'online' : 'error';
        } catch (error) {
            return 'offline';
        }
    },

    /**
     * Standard browser print
     */
    printBrowser() {
        window.print();
        return true;
    },

    /**
     * Direct printing via local proxy
     */
    async printDirect(settings: PrinterSettings, data: any, type: 'sale' | 'shift') {
        try {
            const proxyUrl = settings.pos_print_proxy_url || 'http://localhost:8080';
            
            // Build the ESC/POS payload as a list of operations
            // This follows common "Web Thermal Printer" plugin protocols (e.g. Parzibyte, etc.)
            const operations = this.generateEscPosOperations(settings, data, type);

            const payload = {
                printerName: settings.pos_printer_connection === 'network_lan' 
                    ? `tcp://${settings.pos_printer_ip}:${settings.pos_printer_port}`
                    : "", // Proxy usually defaults to current selected USB/BT if empty
                operations: operations
            };

            const response = await fetch(`${proxyUrl}/print`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Printer Proxy Error');
            
            toast.success('Struk berhasil dikirim ke printer thermal.');
            return true;
        } catch (error) {
            console.error('Direct Print Failed:', error);
            toast.error('Gagal cetak langsung. Pastikan Plugin Printer aktif.', {
                description: 'Mencoba beralih ke Dialog Browser...',
            });
            // Fallback to browser print if direct fails
            return this.printBrowser();
        }
    },

    /**
     * Helper to convert sale/shift data into raw ESC/POS command sequences
     */
    generateEscPosOperations(settings: PrinterSettings, data: any, type: 'sale' | 'shift') {
        const ops = [];

        // 1. Initialize & Open Drawer
        ops.push({ type: "initialize" });
        ops.push({ type: "cash_drawer" }); // ESC p 0 25 250
        
        // 2. Header
        ops.push({ type: "align", content: "center" });
        ops.push({ type: "text_bold", content: true });
        ops.push({ type: "text_size", content: 2 }); // Double size
        ops.push({ type: "text", content: (settings.shop_name || "CodecPOS").toUpperCase() + "\n" });
        ops.push({ type: "text_size", content: 1 });
        ops.push({ type: "text_bold", content: false });
        
        if (settings.shop_address) ops.push({ type: "text", content: settings.shop_address + "\n" });
        if (settings.shop_phone) ops.push({ type: "text", content: "Telp: " + settings.shop_phone + "\n" });
        
        ops.push({ type: "text", content: "--------------------------------\n" });

        if (type === 'sale') {
            this.buildSaleOps(ops, data);
        } else {
            this.buildShiftOps(ops, data);
        }

        // Footer
        ops.push({ type: "align", content: "center" });
        ops.push({ type: "text", content: "\nTerima Kasih Atas Kunjungan Anda\n" });
        ops.push({ type: "feed", content: 3 });
        ops.push({ type: "cut" });

        return ops;
    },

    buildSaleOps(ops: any[], sale: any) {
        ops.push({ type: "align", content: "left" });
        ops.push({ type: "text", content: `No: ${sale.invoice_number}\n` });
        ops.push({ type: "text", content: `Tgl: ${new Date(sale.created_at).toLocaleString('id-ID')}\n` });
        ops.push({ type: "text", content: `Kasir: ${sale.user?.name || 'Staff'}\n` });
        ops.push({ type: "text", content: `Pelanggan: ${sale.customer?.name || 'Umum'}\n` });
        ops.push({ type: "text", content: "--------------------------------\n" });

        // Items
        sale.items.forEach((item: any) => {
            const name = item.product?.name || item.variant?.name || 'Produk';
            const qty = item.quantity;
            const price = Math.round(Number(item.price));
            const subtotal = Math.round(Number(item.total));
            
            ops.push({ type: "text", content: `${name.substring(0, 32)}\n` });
            ops.push({ type: "text", content: `${qty} x ${price.toLocaleString('id-ID')} = ${subtotal.toLocaleString('id-ID')}\n` });
        });

        ops.push({ type: "text", content: "--------------------------------\n" });
        ops.push({ type: "text_bold", content: true });
        ops.push({ type: "text", content: `TOTAL: Rp ${Math.round(Number(sale.total)).toLocaleString('id-ID')}\n` });
        ops.push({ type: "text_bold", content: false });
        ops.push({ type: "text", content: `Bayar: Rp ${Math.round(Number(sale.paid_amount)).toLocaleString('id-ID')}\n` });
        ops.push({ type: "text", content: `Kembali: Rp ${Math.round(Number(sale.change)).toLocaleString('id-ID')}\n` });
    },

    buildShiftOps(ops: any[], shift: any) {
        ops.push({ type: "align", content: "center" });
        ops.push({ type: "text_bold", content: true });
        ops.push({ type: "text", content: "REKAPITULASI SHIFT KASIR\n" });
        ops.push({ type: "text_bold", content: false });
        ops.push({ type: "align", content: "left" });
        
        ops.push({ type: "text", content: `Kasir: ${shift.user?.name || 'Staff'}\n` });
        ops.push({ type: "text", content: `Mulai: ${new Date(shift.start_time).toLocaleString('id-ID')}\n` });
        if (shift.end_time) ops.push({ type: "text", content: `Selesai: ${new Date(shift.end_time).toLocaleString('id-ID')}\n` });
        
        ops.push({ type: "text", content: "--------------------------------\n" });
        ops.push({ type: "text", content: `Modal Awal:  Rp ${Math.round(Number(shift.starting_cash)).toLocaleString('id-ID')}\n` });
        
        if (shift.expected_ending_cash) {
            ops.push({ type: "text", content: `Estimasi:    Rp ${Math.round(Number(shift.expected_ending_cash)).toLocaleString('id-ID')}\n` });
        }
        
        if (shift.actual_ending_cash) {
            ops.push({ type: "text", content: `Kas Aktual:  Rp ${Math.round(Number(shift.actual_ending_cash)).toLocaleString('id-ID')}\n` });
            const diff = Number(shift.actual_ending_cash) - (Number(shift.expected_ending_cash) || 0);
            ops.push({ type: "text", content: `Selisih:     Rp ${Math.round(diff).toLocaleString('id-ID')}\n` });
        }
        
        ops.push({ type: "text", content: "--------------------------------\n" });
        if (shift.notes) ops.push({ type: "text", content: `Catatan: ${shift.notes}\n` });
    }
};
