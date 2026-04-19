import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PageProps, Outlet } from '@/types';
import { useAppStore } from '@/stores/useAppStore';
import { Plus, Edit2, Trash2, X, Save, Store, MapPin, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props extends PageProps {
    outlets: Outlet[];
}

export default function OutletIndex() {
    const { outlets } = usePage<Props>().props;
    const [showModal, setShowModal] = useState(false);
    const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);

    const form = useForm({
        name: '',
        address: '',
        phone: '',
        email: '',
        is_active: true,
    });

    const openCreate = () => {
        setEditingOutlet(null);
        form.reset();
        setShowModal(true);
    };

    const openEdit = (outlet: Outlet) => {
        setEditingOutlet(outlet);
        form.setData({
            name: outlet.name,
            address: outlet.address || '',
            phone: outlet.phone || '',
            email: outlet.email || '',
            is_active: outlet.is_active,
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingOutlet) {
            form.put(route('outlets.update', editingOutlet.id), {
                onSuccess: () => { setShowModal(false); toast.success('Cabang berhasil diperbarui'); },
                onError: () => toast.error('Gagal memperbarui cabang', { description: 'Periksa kembali isian formulir.' })
            });
        } else {
            form.post(route('outlets.store'), {
                onSuccess: () => { setShowModal(false); toast.success('Cabang baru berhasil ditambahkan'); },
                onError: () => toast.error('Gagal menambahkan cabang', { description: 'Periksa kembali isian formulir.' })
            });
        }
    };

    const confirm = useAppStore(state => state.confirm);

    const handleDelete = (outlet: Outlet) => {
        confirm({
            title: 'Hapus Cabang',
            message: `Apakah Anda yakin ingin menghapus cabang "${outlet.name}"? Penghapusan cabang dapat berdampak pada data transaksi dan stok yang terasosiasi.`,
            confirmLabel: 'Ya, Hapus Cabang',
            type: 'danger',
            onConfirm: () => {
                form.delete(route('outlets.destroy', outlet.id), {
                    onSuccess: () => toast.success('Cabang berhasil dihapus'),
                    onError: () => toast.error('Gagal menghapus cabang')
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Cabang / Outlet" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Manajemen Cabang</h1>
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Kelola Lokasi & Outlet Operasional</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest"
                    >
                        <Plus className="w-3.5 h-3.5" /> CABANG BARU
                    </button>
                </div>

                <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Nama Cabang</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Kontak</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Alamat</th>
                                    <th className="text-center px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Status</th>
                                    <th className="text-right px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {outlets.length > 0 ? outlets.map((outlet) => (
                                    <tr key={outlet.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-indigo-600">
                                                    <Store className="w-4 h-4" />
                                                </div>
                                                <span className="text-gray-900 dark:text-white font-bold uppercase tracking-tight">{outlet.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 space-y-0.5">
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <Phone className="w-3 h-3" />
                                                <span>{outlet.phone || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <Mail className="w-3 h-3" />
                                                <span>{outlet.email || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 font-medium max-w-xs truncate">{outlet.address || '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${outlet.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-gray-100 text-gray-600'}`}>
                                                {outlet.is_active ? 'Aktif' : 'Non-Aktif'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(outlet)} className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-indigo-600 border border-gray-200 dark:border-gray-700 transition-colors">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDelete(outlet)} className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 border border-gray-200 dark:border-gray-700 transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-gray-500 font-medium">Belum ada data cabang.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-md rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{editingOutlet ? 'Edit Cabang' : 'Cabang Baru'}</h3>
                            <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Nama Cabang *</label>
                                <input type="text" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                {form.errors.name && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase">{form.errors.name}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Telepon</label>
                                    <input type="text" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Email</label>
                                    <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Alamat Lengkap</label>
                                <textarea value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} rows={2}
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-xs font-bold resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase">Outlet Aktif</span>
                                </label>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-colors">BATAL</button>
                                <button type="submit" disabled={form.processing}
                                    className="flex-1 py-2.5 rounded-lg bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                                    <Save className="w-3.5 h-3.5" /> {form.processing ? '...' : 'SIMPAN'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
