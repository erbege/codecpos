import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { PageProps, Customer, PaginatedData } from '@/types';
import { Search, Plus, Edit2, Trash2, Users, X, Save } from 'lucide-react';
import { useState } from 'react';

interface Props extends PageProps {
    customers: PaginatedData<Customer>;
    filters: { search?: string };
}

export default function CustomersIndex() {
    const { customers, filters } = usePage<Props>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const form = useForm({ name: '', phone: '', email: '', address: '' });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/customers', { search }, { preserveState: true });
    };

    const openCreate = () => {
        setEditingCustomer(null);
        form.reset();
        setShowModal(true);
    };

    const openEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        form.setData({
            name: customer.name,
            phone: customer.phone || '',
            email: customer.email || '',
            address: customer.address || '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCustomer) {
            form.put(`/customers/${editingCustomer.id}`, { onSuccess: () => setShowModal(false) });
        } else {
            form.post('/customers', { onSuccess: () => setShowModal(false) });
        }
    };

    const confirm = useAppStore(state => state.confirm);

    const handleDelete = (customer: Customer) => {
        confirm({
            title: 'Hapus Pelanggan',
            message: `Apakah Anda yakin ingin menghapus data pelanggan "${customer.name}"? Riwayat transaksi pelanggan ini akan tetap tersimpan namun tidak lagi terasosiasi dengan akun ini.`,
            confirmLabel: 'Ya, Hapus Data',
            type: 'danger',
            onConfirm: () => {
                router.delete(`/customers/${customer.id}`);
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Customers" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Data Pelanggan</h1>
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Database CRM & Loyalitas Pelanggan</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest"
                    >
                        <Plus className="w-3.5 h-3.5" /> PELANGGAN BARU
                    </button>
                </div>

                <form onSubmit={handleSearch} className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Nama, Telepon, atau Email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-200 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </form>

                <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Nama</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Telepon</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Email</th>
                                    <th className="text-right px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Transaksi</th>
                                    <th className="text-right px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.data.length > 0 ? customers.data.map((customer) => (
                                    <tr key={customer.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-colors">
                                        <td className="px-4 py-3 text-gray-900 dark:text-white font-bold">{customer.name}</td>
                                        <td className="px-4 py-3 text-gray-500 font-medium">{customer.phone || '-'}</td>
                                        <td className="px-4 py-3 text-gray-500">{customer.email || '-'}</td>
                                        <td className="px-4 py-3 text-right text-indigo-600 font-black">{customer.sales_count || 0}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(customer)} className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-700 transition-colors">
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => handleDelete(customer)} className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700 transition-colors">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-16 text-center">
                                            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                                            <p className="text-gray-500 dark:text-gray-400">Belum ada customer</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {customers.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-transparent">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{customers.from}-{customers.to} / {customers.total}</p>
                            <div className="flex gap-1">
                                {customers.links.map((link, i) => (
                                    <a key={i} href={link.url || '#'}
                                        className={`px-3 py-1 rounded text-[10px] font-black transition-all ${link.active ? 'bg-indigo-500 text-white' : link.url ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-gray-300 cursor-not-allowed'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-md rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{editingCustomer ? 'Edit Pelanggan' : 'Pelanggan Baru'}</h3>
                            <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Nama Lengkap *</label>
                                <input type="text" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)}
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
