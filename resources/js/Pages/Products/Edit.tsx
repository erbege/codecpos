import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { PageProps, Category, Product } from '@/types';
import { ArrowLeft, Save, Plus, Trash2, Camera, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Props extends PageProps {
    product: Product;
    categories: Category[];
}

interface FormData {
    _method: string;
    category_id: string;
    name: string;
    sku: string;
    barcode: string;
    price: string;
    cost_price: string;
    stock: string;
    min_stock: string;
    image: File | null;
    is_active: boolean;
    has_variants: boolean;
    variants: any[];
}

export default function ProductEdit() {
    const { product, categories } = usePage<Props>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm<FormData>({
        _method: 'put',
        category_id: product.category_id.toString(),
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || '',
        price: product.price.toString(),
        cost_price: product.cost_price.toString(),
        stock: product.stock.toString(),
        min_stock: product.min_stock.toString(),
        image: null,
        is_active: product.is_active,
        has_variants: product.has_variants,
        variants: product.variants?.length ? product.variants.map((v: any) => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            stock: v.stock,
            price: v.price || '',
            image: null as File | null,
            preview: v.image ? `/storage/${v.image}` : null
        })) : []
    });

    const addVariant = () => {
        setData('variants', [...data.variants, { name: '', sku: '', stock: 0, price: '', image: null, preview: null }]);
    };

    const removeVariant = (index: number) => {
        const newVariants = [...data.variants];
        const removed = newVariants.splice(index, 1);
        // If it was a new blob preview, revoke it
        if (removed[0].preview && removed[0].preview.startsWith('blob:')) {
            URL.revokeObjectURL(removed[0].preview);
        }
        setData('variants', newVariants);
    };

    const updateVariant = (index: number, field: string, value: any) => {
        const newVariants = [...data.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setData('variants', newVariants);
    };

    const handleVariantImage = (index: number, file: File | null) => {
        const newVariants = [...data.variants];
        // Clean up old blob preview
        if (newVariants[index].preview && newVariants[index].preview.startsWith('blob:')) {
            URL.revokeObjectURL(newVariants[index].preview);
        }
        
        if (file) {
            newVariants[index].image = file;
            newVariants[index].preview = URL.createObjectURL(file);
        } else {
            newVariants[index].image = null;
            newVariants[index].preview = null;
        }
        setData('variants', newVariants);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Since we are uploading files, we use POST with _method: 'put'
        post(`/products/${product.id}`);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Produk: ${product.name}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/products"
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-transparent transition-colors shadow-sm dark:shadow-none"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Produk</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{product.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-2xl bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 p-6 space-y-6 shadow-sm dark:shadow-none">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                             <div className="w-full md:w-1/3 flex flex-col items-center">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 w-full">Foto Utama Produk</p>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative w-full aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-400 transition-all group cursor-pointer overflow-hidden bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center"
                                >
                                    {(data.image || product.image) ? (
                                        <>
                                            <img 
                                                src={data.image ? URL.createObjectURL(data.image) : `/storage/${product.image}`} 
                                                className="w-full h-full object-cover" 
                                                alt="Preview" 
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera className="w-8 h-8 text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400">
                                            <Camera className="w-10 h-10 mb-2 group-hover:text-cyan-500 transition-colors" />
                                            <span className="text-xs">Klik untuk ubah</span>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => setData('image', e.target.files?.[0] || null)}
                                />
                                {errors.image && <p className="mt-2 text-xs text-red-500">{errors.image}</p>}
                            </div>

                            <div className="flex-1 w-full space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2 flex items-center gap-6 pb-4 border-b border-gray-100 dark:border-gray-800/50">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Memiliki Varian?</p>
                                            <p className="text-sm text-gray-500">Kelola stok independen per warna, ukuran, dll.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer ml-auto">
                                            <input
                                                type="checkbox"
                                                checked={data.has_variants}
                                                onChange={(e) => {
                                                    const hasVariants = e.target.checked;
                                                    setData((prev: any) => ({
                                                        ...prev,
                                                        has_variants: hasVariants,
                                                        variants: hasVariants && prev.variants.length === 0 ? [{ name: '', sku: '', stock: 0, price: '', image: null, preview: null }] : prev.variants
                                                    }));
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-cyan-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Produk *</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500/50"
                                        />
                                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kategori *</label>
                                        <select
                                            value={data.category_id}
                                            onChange={(e) => setData('category_id', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500/50"
                                        >
                                            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    </div>

                                    {!data.has_variants && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">SKU *</label>
                                            <input
                                                type="text"
                                                value={data.sku}
                                                onChange={(e) => setData('sku', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {data.has_variants && (
                        <div className="rounded-2xl bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kelola Varian</h2>
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-500/20"
                                >
                                    <Plus className="w-4 h-4" /> Tambah Varian
                                </button>
                            </div>

                            <div className="space-y-4">
                                {data.variants.map((variant, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                         <div className="md:col-span-2">
                                            <div 
                                                className="relative aspect-square w-full max-w-[80px] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 flex items-center justify-center cursor-pointer group"
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = 'image/*';
                                                    input.onchange = (e) => {
                                                        const file = (e.target as HTMLInputElement).files?.[0];
                                                        if (file) handleVariantImage(index, file);
                                                    };
                                                    input.click();
                                                }}
                                            >
                                                {variant.preview ? (
                                                    <>
                                                        <img src={variant.preview} className="w-full h-full object-cover" alt="" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                                            <Camera className="w-4 h-4" />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <Camera className="w-5 h-5 text-gray-300 group-hover:text-cyan-500" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="md:col-span-3">
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Nama Varian</label>
                                            <input
                                                type="text"
                                                value={variant.name}
                                                onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">SKU</label>
                                            <input
                                                type="text"
                                                value={variant.sku}
                                                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Harga Diff</label>
                                            <input
                                                type="number"
                                                value={variant.price}
                                                onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                                            />
                                        </div>
                                        <div className="md:col-span-1 pt-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeVariant(index)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Link href="/products" className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500">Batal</Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
