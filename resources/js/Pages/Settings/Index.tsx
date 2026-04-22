import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Save, Percent, Building, Phone, Mail, FileText, MapPin, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import NumericInput from '@/Components/NumericInput';

interface Props extends PageProps {
    settings: {
        tax_enabled: boolean;
        tax_percentage: number;
        shop_name: string;
        shop_address: string;
        shop_phone: string;
        shop_email: string;
        shop_npwp: string;
        shop_footer_notes: string;
        base_starting_cash: number;
        tax_per_item: boolean;
        enable_shift_management: boolean;
    };
}

export default function SettingsIndex() {
    const { settings } = usePage<Props>().props;

    const form = useForm({
        tax_enabled: settings.tax_enabled,
        tax_percentage: settings.tax_percentage,
        shop_name: settings.shop_name,
        shop_address: settings.shop_address,
        shop_phone: settings.shop_phone,
        shop_email: settings.shop_email,
        shop_npwp: settings.shop_npwp,
        shop_footer_notes: settings.shop_footer_notes,
        base_starting_cash: settings.base_starting_cash,
        tax_per_item: settings.tax_per_item,
        enable_shift_management: settings.enable_shift_management,
    });

    const handleSubmit = (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        form.post('/settings', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pengaturan berhasil disimpan', {
                    description: 'Semua konfigurasi telah diperbarui.',
                });
            },
            onError: (errors) => {
                const messages = Object.values(errors).flat();
                toast.error('Gagal menyimpan pengaturan', {
                    description: messages.length > 0 ? messages[0] : 'Periksa kembali data yang diinput.',
                });
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pengaturan Sistem" />

            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">Konfigurasi <span className="text-indigo-500">Sistem</span></h1>
                        <p className="text-sm text-gray-500 font-medium mt-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">Parameters Operasional & Kebijakan Toko</p>
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => form.reset()}
                            className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-xs hover:bg-gray-200 transition-all"
                        >
                            Reset Data
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            Simpan Perubahan
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Shop Identity */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-left-4 duration-700">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-transparent">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                    <Building className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-800 dark:text-white tracking-tight">Identitas Toko</h3>
                                    <p className="text-sm text-gray-500">Informasi yang akan dicetak pada struk & laporan</p>
                                </div>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                                            <Building className="w-3.5 h-3.5" /> Nama Toko
                                        </label>
                                        <input
                                            type="text"
                                            value={form.data.shop_name}
                                            onChange={(e) => form.setData('shop_name', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Nama Usaha Anda"
                                        />
                                        {form.errors.shop_name && <p className="text-[10px] text-red-500 font-bold uppercase">{form.errors.shop_name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                                            <FileText className="w-3.5 h-3.5" /> Nomor NPWP (Opsional)
                                        </label>
                                        <input
                                            type="text"
                                            value={form.data.shop_npwp}
                                            onChange={(e) => form.setData('shop_npwp', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="00.000.000.0-000.000"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                                            <Phone className="w-3.5 h-3.5" /> Nomor Telepon
                                        </label>
                                        <input
                                            type="text"
                                            value={form.data.shop_phone}
                                            onChange={(e) => form.setData('shop_phone', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="021-XXXXXXX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                                            <Mail className="w-3.5 h-3.5" /> Email Toko
                                        </label>
                                        <input
                                            type="email"
                                            value={form.data.shop_email}
                                            onChange={(e) => form.setData('shop_email', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="admin@tokosaya.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                                        <MapPin className="w-3.5 h-3.5" /> Alamat Lengkap
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={form.data.shop_address}
                                        onChange={(e) => form.setData('shop_address', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all resize-none"
                                        placeholder="Jl. Raya Utama No. 123..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                                        <MessageSquare className="w-3.5 h-3.5" /> Catatan Kaki Struk (Receipt Footer)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={form.data.shop_footer_notes}
                                        onChange={(e) => form.setData('shop_footer_notes', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all resize-none"
                                        placeholder="Terima kasih telah berbelanja..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Parameters */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-4 duration-700">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-transparent">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <Percent className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-800 dark:text-white tracking-tight">Kebijakan Pajak</h3>
                                    <p className="text-sm text-gray-500">Konfigurasi PPN / VAT</p>
                                </div>
                            </div>
                            
                            <div className="p-8 space-y-8">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Aktifkan Pajak</p>
                                        <p className="text-xs text-gray-500 font-medium mt-1">Otomatisasi kalkulasi PPN</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={form.data.tax_enabled}
                                            onChange={(e) => form.setData('tax_enabled', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>

                                {form.data.tax_enabled && (
                                    <div className="space-y-3 animate-slide-in">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Besaran PPN (%)</label>
                                        <div className="relative">
                                            <NumericInput
                                                value={form.data.tax_percentage}
                                                onChange={(val) => form.setData('tax_percentage', parseFloat(val) || 0)}
                                                className="w-full pl-6 pr-12 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xl font-black text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none text-emerald-500 font-black text-lg">%</div>
                                        </div>
                                        {form.errors.tax_percentage && <p className="text-[10px] text-red-500 font-bold uppercase">{form.errors.tax_percentage}</p>}

                                        <div className={`flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 mt-4 transition-all duration-500 ${!form.data.tax_enabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">Pajak Per Item Produk</p>
                                                <p className="text-xs text-gray-500 font-medium mt-1">Breakdown PPN per produk & Hitung Margin</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={form.data.tax_per_item}
                                                    onChange={(e) => form.setData('tax_per_item', e.target.checked)}
                                                    disabled={!form.data.tax_enabled}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-500"></div>
                                            </label>
                                        </div>
                                        {form.errors.tax_per_item && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{form.errors.tax_per_item}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-4 duration-700">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-transparent">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                    <Save className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-800 dark:text-white tracking-tight">Preferensi Kasir</h3>
                                    <p className="text-sm text-gray-500">Konfigurasi Pengelolaan Shift</p>
                                </div>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Modal Awal Standar (Rp)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 font-bold">Rp</div>
                                        <NumericInput
                                            value={form.data.base_starting_cash}
                                            onChange={(val) => form.setData('base_starting_cash', parseFloat(val) || 0)}
                                            className="w-full pl-12 pr-6 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium italic leading-relaxed pt-1">Digunakan sebagai saran modal awal jika tidak ada saldo shift sebelumnya untuk dibawa (Carry-over).</p>
                                    {form.errors.base_starting_cash && <p className="text-[10px] text-red-500 font-bold uppercase">{form.errors.base_starting_cash}</p>}
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-500/5 border border-dashed border-indigo-200 dark:border-indigo-500/30">
                                        <div>
                                            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Wajibkan Manajemen Shift</p>
                                            <p className="text-[11px] text-indigo-500 font-medium mt-1 leading-tight">Jika aktif, kasir wajib mencatat saldo kas laci setiap awal dan akhir tugas.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={form.data.enable_shift_management ?? true}
                                                onChange={(e) => form.setData('enable_shift_management', e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-500 shadow-sm shadow-indigo-500/20"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
