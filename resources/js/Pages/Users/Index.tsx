import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PageProps, User, Outlet } from '@/types';
import { useAppStore } from '@/stores/useAppStore';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    X, 
    Save, 
    User as UserIcon, 
    Mail, 
    Shield, 
    Store, 
    Key 
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props extends PageProps {
    users: User[];
    outlets: Outlet[];
    roles: any[];
}

export default function UserIndex() {
    const { users, outlets, roles } = usePage<Props>().props;
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const form = useForm({
        name: '',
        email: '',
        password: '',
        outlet_id: '',
        role: '',
    });

    const openCreate = () => {
        setEditingUser(null);
        form.reset();
        setShowModal(true);
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        form.setData({
            name: user.name,
            email: user.email,
            password: '',
            outlet_id: user.outlet_id?.toString() || '',
            role: (user as any).roles?.[0]?.name || '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            form.put(route('users.update', editingUser.id), {
                onSuccess: () => { setShowModal(false); toast.success('Data pengguna berhasil diperbarui'); },
                onError: () => toast.error('Gagal memperbarui pengguna', { description: 'Periksa formulir dan pastikan email belum digunakan.' })
            });
        } else {
            form.post(route('users.store'), {
                onSuccess: () => { setShowModal(false); toast.success('Pengguna baru berhasil ditambahkan'); },
                onError: () => toast.error('Gagal menambahkan pengguna', { description: 'Periksa formulir dan pastikan email belum digunakan.' })
            });
        }
    };

    const confirm = useAppStore(state => state.confirm);

    const handleDelete = (user: User) => {
        confirm({
            title: 'Hapus Pengguna',
            message: `Apakah Anda yakin ingin menghapus akun "${user.name}"? Pengguna ini tidak akan bisa lagi mengakses sistem CodecPOS.`,
            confirmLabel: 'Ya, Hapus Akun',
            type: 'danger',
            onConfirm: () => {
                form.delete(route('users.destroy', user.id), {
                    onSuccess: () => toast.success('Akun pengguna berhasil dihapus'),
                    onError: () => toast.error('Gagal menghapus akun pengguna')
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Pengguna" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Manajemen Pengguna</h1>
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Kelola Akun, Peran & Penempatan Cabang</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest"
                    >
                        <Plus className="w-3.5 h-3.5" /> TAMBAH USER
                    </button>
                </div>

                <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Pengguna</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Cabang</th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Peran (Role)</th>
                                    <th className="text-right px-4 py-3 text-gray-500 font-bold uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-black">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-gray-900 dark:text-white font-bold uppercase tracking-tight leading-none mb-1">{user.name}</p>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                        <Mail className="w-2.5 h-2.5" />
                                                        <span>{user.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.outlet ? (
                                                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-tighter bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md w-fit">
                                                    <Store className="w-3 h-3" />
                                                    <span>{user.outlet.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 font-bold uppercase tracking-tighter">SEMUA CABANG / PUSAT</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-black uppercase tracking-tighter bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md w-fit border border-slate-200 dark:border-slate-700">
                                                <Shield className="w-3 h-3 text-indigo-500" />
                                                <span>{(user as any).roles?.[0]?.name || 'No Role'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(user)} className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-indigo-600 border border-gray-200 dark:border-gray-700 transition-colors">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDelete(user)} className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 border border-gray-200 dark:border-gray-700 transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-12 text-center text-gray-500 font-medium uppercase tracking-widest text-[10px]">Belum ada data pengguna.</td>
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
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</h3>
                            <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Nama Lengkap *</label>
                                    <input type="text" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required
                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-xs font-black focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                    {form.errors.name && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase">{form.errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Email *</label>
                                    <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} required
                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-xs font-black focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                    {form.errors.email && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase">{form.errors.email}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Password {editingUser && '(Kosongkan jika tidak diubah)'}</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <input type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} required={!editingUser}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-xs font-black focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                </div>
                                {form.errors.password && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase">{form.errors.password}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Penugasan Cabang</label>
                                    <select value={form.data.outlet_id} onChange={(e) => form.setData('outlet_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-xs font-black focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                        <option value="">Semua Cabang (Akses Global)</option>
                                        {outlets.map(o => <option key={o.id} value={o.id}>{o.name.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Peran / Role *</label>
                                    <select value={form.data.role} onChange={(e) => form.setData('role', e.target.value)} required
                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-xs font-black focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                        <option value="">Pilih Peran</option>
                                        {roles.map(r => <option key={r.id} value={r.name}>{r.name.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-colors">BATAL</button>
                                <button type="submit" disabled={form.processing}
                                    className="flex-1 py-2.5 rounded-lg bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                                    <Save className="w-3.5 h-3.5" /> {form.processing ? '...' : 'SIMPAN PENGGUNA'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
