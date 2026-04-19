import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { PageProps, Category, PaginatedData } from '@/types';
import { useAppStore } from '@/stores/useAppStore';
import { Plus, Edit2, Trash2, FolderTree, X, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props extends PageProps {
    categories: PaginatedData<Category>;
}

export default function CategoriesIndex() {
    const { categories } = usePage<Props>().props;
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const form = useForm({ name: '', description: '', is_active: true });

    const openCreate = () => {
        setEditingCategory(null);
        form.reset();
        setShowModal(true);
    };

    const openEdit = (category: Category) => {
        setEditingCategory(category);
        form.setData({
            name: category.name,
            description: category.description || '',
            is_active: category.is_active,
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            form.put(`/categories/${editingCategory.id}`, { 
                onSuccess: () => { setShowModal(false); toast.success('Kategori berhasil diperbarui'); },
                onError: () => toast.error('Gagal memperbarui kategori', { description: 'Periksa kembali isian formulir.' }) 
            });
        } else {
            form.post('/categories', { 
                onSuccess: () => { setShowModal(false); toast.success('Kategori berhasil ditambahkan'); },
                onError: () => toast.error('Gagal menyimpan kategori', { description: 'Periksa kembali isian formulir.' }) 
            });
        }
    };

    const confirm = useAppStore(state => state.confirm);

    const handleDelete = (category: Category) => {
        confirm({
            title: 'Hapus Kategori',
            message: `Apakah Anda yakin ingin menghapus kategori "${category.name}"? Semua produk dalam kategori ini akan kehilangan kategorinya.`,
            confirmLabel: 'Ya, Hapus Kategori',
            type: 'danger',
            onConfirm: () => {
                router.delete(`/categories/${category.id}`, {
                    onSuccess: () => toast.success('Kategori berhasil dihapus'),
                    onError: () => toast.error('Gagal menghapus kategori')
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Kategori" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Kategori</h1>
                        <p className="text-sm text-gray-500 font-medium">Manajemen Klasifikasi Produk</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest"
                    >
                        <Plus className="w-3.5 h-3.5" /> KATEGORI BARU
                    </button>
                </div>

                <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    <th className="text-left px-5 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wider">Nama</th>
                                    <th className="text-left px-5 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wider">Slug</th>
                                    <th className="text-left px-5 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wider">Deskripsi</th>
                                    <th className="text-right px-5 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wider">Produk</th>
                                    <th className="text-center px-5 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wider">Status</th>
                                    <th className="text-right px-5 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.data.length > 0 ? categories.data.map((cat) => (
                                    <tr 
                                        key={cat.id} 
                                        onClick={() => openEdit(cat)}
                                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-5 py-4 text-gray-900 dark:text-white font-semibold text-sm">{cat.name}</td>
                                        <td className="px-5 py-4 text-gray-400 font-mono text-[11px]">{cat.slug}</td>
                                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">{cat.description || '-'}</td>
                                        <td className="px-5 py-4 text-right text-gray-600 dark:text-gray-300 font-semibold">{cat.products_count || 0}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${cat.is_active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50' : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200/50'}`}>
                                                {cat.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); openEdit(cat); }} 
                                                    className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-gray-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-700 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(cat); }} 
                                                    className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors shadow-sm"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-16 text-center">
                                            <FolderTree className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                                            <p className="text-gray-500 dark:text-gray-400">Belum ada kategori</p>
                                        </td>
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
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{editingCategory ? 'Edit Kategori' : 'Kategori Baru'}</h3>
                            <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Nama Kategori</label>
                                <input type="text" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                                {form.errors.name && <p className="mt-1 text-xs text-red-500">{form.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Deskripsi Singkat</label>
                                <textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} rows={2}
                                    className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-xs hover:bg-gray-200 transition-colors">Batal</button>
                                <button type="submit" disabled={form.processing}
                                    className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">
                                    <Save className="w-3.5 h-3.5" /> {form.processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
