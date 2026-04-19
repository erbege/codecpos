import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { PageProps, Category } from '@/types';
import { ArrowLeft, Save, Plus, Trash2, Camera, X, Tag, DollarSign, Package, RefreshCw, Copy } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface Props extends PageProps {
    categories: Category[];
    taxSettings: {
        tax_per_item: boolean;
        tax_percentage: number;
    }
}

export default function ProductCreate() {
    const { categories, taxSettings } = usePage<Props>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => { nameRef.current?.focus(); }, []);

    const generateSmartSKU = (productName: string, categoryId: string, variantName: string = '') => {
        const category = categories.find(c => c.id.toString() === categoryId?.toString())?.name || 'GEN';
        const catCode = category.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();

        const nameWords = productName.trim().split(/\s+/).filter(w => 
            w.length > 0 && w.toLowerCase() !== category.toLowerCase()
        );
        
        const p1 = nameWords[0] ? nameWords[0].replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase() : (productName ? productName.substring(0,3).toUpperCase() : 'PRD');
        const p2 = nameWords[1] ? nameWords[1].replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase() : '';
        const nameCode = p2 ? `${p1}-${p2}` : p1;

        let varCode = '';
        if (variantName) {
            const varWords = variantName.trim().split(/\s+/).filter(w => w.length > 0);
            const v1 = varWords[0] ? varWords[0].replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase() : 'VAR';
            const v2 = varWords[1] ? varWords[1].replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase() : '';
            varCode = v2 ? `-${v1}-${v2}` : `-${v1}`;
        }

        const unique = Math.random().toString(36).substring(2, 6).toUpperCase();

        return `${catCode}-${nameCode}${varCode}-${unique}`.replace(/-+/g, '-').replace(/-$/, '');
    };

    const { data, setData, post, processing, errors } = useForm({
        category_id: categories.length === 1 ? categories[0].id.toString() : '',
        name: '',
        sku: generateSmartSKU('', categories.length === 1 ? categories[0].id.toString() : ''),
        barcode: '',
        price: '',
        cost_price: '',
        margin: '0',
        stock: '0',
        min_stock: '0',
        image: null as File | null,
        is_active: true,
        has_variants: false,
        variants: [] as { name: string, sku: string, stock: number, price: string, image: File | null, preview: string | null }[]
    });

    const addVariant = () => {
        setData('variants', [...data.variants, { name: '', sku: generateSmartSKU(data.name, data.category_id, ''), stock: 0, price: '', image: null, preview: null }]);
    };

    const duplicateVariant = (index: number) => {
        const variantToCopy = data.variants[index];
        const newVariants = [...data.variants];
        newVariants.splice(index + 1, 0, {
            ...variantToCopy,
            name: `${variantToCopy.name} (Copy)`,
            sku: generateSmartSKU(data.name, data.category_id, `${variantToCopy.name} Copy`),
            image: null,
            preview: null
        });
        setData('variants', newVariants);
    };

    const removeVariant = (index: number) => {
        const newVariants = [...data.variants];
        const removed = newVariants.splice(index, 1);
        if (removed[0].preview) URL.revokeObjectURL(removed[0].preview);
        setData('variants', newVariants);
    };

    const updateVariant = (index: number, field: string, value: any) => {
        const newVariants = [...data.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setData('variants', newVariants);
    };

    const handleCostChange = (val: string) => {
        const cost = parseFloat(val) || 0;
        const margin = parseFloat(data.margin) || 0;
        let price = cost + margin;
        if (taxSettings.tax_per_item) {
            price = (cost + margin) * (1 + taxSettings.tax_percentage / 100);
        }
        setData(d => ({ ...d, cost_price: val, price: price.toFixed(0) }));
    };

    const handleMarginChange = (val: string) => {
        const margin = parseFloat(val) || 0;
        const cost = parseFloat(data.cost_price) || 0;
        let price = cost + margin;
        if (taxSettings.tax_per_item) {
            price = (cost + margin) * (1 + taxSettings.tax_percentage / 100);
        }
        setData(d => ({ ...d, margin: val, price: price.toFixed(0) }));
    };

    const handlePriceChange = (val: string) => {
        const price = parseFloat(val) || 0;
        const cost = parseFloat(data.cost_price) || 0;
        let margin = 0;
        if (taxSettings.tax_per_item) {
            margin = (price / (1 + taxSettings.tax_percentage / 100)) - cost;
        } else {
            margin = price - cost;
        }
        setData(d => ({ ...d, price: val, margin: margin.toFixed(2) }));
    };

    const handleVariantImage = (index: number, file: File | null) => {
        const newVariants = [...data.variants];
        if (newVariants[index].preview) URL.revokeObjectURL(newVariants[index].preview);
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
        post('/products', {
            onSuccess: () => toast.success('Produk berhasil ditambahkan'),
            onError: () => toast.error('Gagal menyimpan produk', { description: 'Periksa kembali data yang diinput.' }),
        });
    };

    const inputClass = "w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all";
    const labelClass = "block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5";

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Produk" />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/products"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Tambah Produk</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/products" className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors uppercase tracking-wider">Batal</Link>
                        <button
                            onClick={handleSubmit}
                            disabled={processing}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 text-white font-black text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 uppercase tracking-wider"
                        >
                            <Save className="w-3.5 h-3.5" />
                            {processing ? 'Simpan...' : 'Simpan'}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* ═══ SECTION 1: Identitas Produk ═══ */}
                    <div className="rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800/50 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Tag className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Identitas</span>
                            
                            {/* Variant Toggle - inline in header */}
                            <div className="ml-auto flex items-center gap-3">
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Punya Varian?</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.has_variants}
                                        onChange={(e) => {
                                            const hasVariants = e.target.checked;
                                            setData((prev) => ({
                                                ...prev,
                                                has_variants: hasVariants,
                                                variants: hasVariants && prev.variants.length === 0 ? [{ name: '', sku: generateSmartSKU(data.name, data.category_id, ''), stock: 0, price: '', image: null, preview: null }] : prev.variants
                                            }));
                                        }}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-indigo-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            {/* Compact Image Upload */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative w-[72px] h-[72px] flex-shrink-0 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-all group cursor-pointer overflow-hidden bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center"
                            >
                                {data.image ? (
                                    <>
                                        <img src={URL.createObjectURL(data.image)} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Camera className="w-4 h-4 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <Camera className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => setData('image', e.target.files?.[0] || null)} />

                            {/* Fields Grid */}
                            <div className="flex-1 grid grid-cols-6 gap-x-3 gap-y-2">
                                {/* Name: spans 4 cols */}
                                <div className="col-span-6 md:col-span-4">
                                    <label className={labelClass}>Nama Produk *</label>
                                    <input
                                        ref={nameRef}
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={inputClass}
                                        placeholder="Helm Bogo Retro"
                                    />
                                    {errors.name && <p className="text-[10px] text-red-500 mt-0.5">{errors.name}</p>}
                                </div>

                                {/* Category: spans 2 cols */}
                                <div className="col-span-3 md:col-span-2">
                                    <label className={labelClass}>Kategori *</label>
                                    <select
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">Pilih</option>
                                        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>

                                {/* SKU */}
                                {!data.has_variants && (
                                    <div className="col-span-3 md:col-span-2">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">SKU *</label>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => setData('sku', generateSmartSKU(data.name, data.category_id))} className="text-[9px] text-indigo-500 hover:text-indigo-600 flex items-center gap-1 font-bold"><RefreshCw className="w-2.5 h-2.5" /> Generate</button>
                                                <button type="button" onClick={() => setData('sku', '')} className="text-[9px] text-red-500 hover:text-red-600 flex items-center gap-1 font-bold"><X className="w-2.5 h-2.5" /> Kosongkan</button>
                                            </div>
                                        </div>
                                        <input type="text" value={data.sku} onChange={(e) => setData('sku', e.target.value)} className={inputClass} placeholder="PRD-XXXXXX" />
                                    </div>
                                )}

                                {/* Barcode */}
                                <div className={`col-span-3 ${data.has_variants ? 'md:col-span-2' : 'md:col-span-2'}`}>
                                    <label className={labelClass}>Barcode</label>
                                    <input type="text" value={data.barcode} onChange={(e) => setData('barcode', e.target.value)} className={inputClass} placeholder="Opsional" />
                                </div>

                                {/* Active toggle */}
                                <div className="col-span-3 md:col-span-2 flex items-end pb-0.5">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Produk Aktif</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ SECTION 2: Harga & Stok ═══ */}
                    <div className="rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800/50 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Harga & Stok</span>
                            {taxSettings.tax_per_item && (
                                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold tracking-wide border border-emerald-200/50">
                                    PPN {taxSettings.tax_percentage}% Inklusif
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-6 gap-x-3 gap-y-2">
                            {/* Harga Beli */}
                            <div className="col-span-3 md:col-span-1">
                                <label className={labelClass}>H. Beli *</label>
                                <input type="number" value={data.cost_price} onChange={(e) => handleCostChange(e.target.value)} className={inputClass} placeholder="0" />
                                {errors.cost_price && <p className="text-[10px] text-red-500 mt-0.5">{errors.cost_price}</p>}
                            </div>

                            {/* Margin */}
                            <div className="col-span-3 md:col-span-1">
                                <label className={labelClass}>Margin *</label>
                                <input type="number" value={data.margin} onChange={(e) => handleMarginChange(e.target.value)} className={inputClass} placeholder="0" />
                                {errors.margin && <p className="text-[10px] text-red-500 mt-0.5">{errors.margin}</p>}
                            </div>

                            {/* Harga Jual */}
                            <div className="col-span-6 md:col-span-2">
                                <label className={labelClass}>
                                    H. Jual {taxSettings.tax_per_item ? `(inc. ppn)` : ''} *
                                </label>
                                <input
                                    type="number"
                                    value={data.price}
                                    onChange={(e) => handlePriceChange(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-sm font-black focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all"
                                    placeholder="0"
                                />
                                {taxSettings.tax_per_item && data.price && (
                                    <p className="text-xs text-gray-500 font-medium mt-1">
                                        DPP: Rp {new Intl.NumberFormat('id-ID').format(Math.round(Number(data.price) / (1 + taxSettings.tax_percentage / 100)))}
                                        {' · '}PPN: Rp {new Intl.NumberFormat('id-ID').format(Math.round(Number(data.price) - Number(data.price) / (1 + taxSettings.tax_percentage / 100)))}
                                    </p>
                                )}
                                {errors.price && <p className="text-[10px] text-red-500 mt-0.5">{errors.price}</p>}
                            </div>

                            {/* Stok */}
                            {!data.has_variants && (
                                <div className="col-span-3 md:col-span-1">
                                    <label className={labelClass}>Stok Awal</label>
                                    <input type="number" value={data.stock} onChange={(e) => setData('stock', e.target.value)} className={inputClass} />
                                </div>
                            )}

                            {/* Min Stok */}
                            <div className="col-span-3 md:col-span-1">
                                <label className={labelClass}>Stok Min.</label>
                                <input type="number" value={data.min_stock} onChange={(e) => setData('min_stock', e.target.value)} className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* ═══ SECTION 3: Varian (Conditional) ═══ */}
                    {data.has_variants && (
                        <div className="rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800/50 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Varian ({data.variants.length})</span>
                                    <span className="text-xs text-gray-500 font-medium ml-2">Kosongkan harga untuk mengikuti harga induk</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Tambah Varian
                                </button>
                            </div>

                            <div className="space-y-2">
                                {data.variants.map((variant, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                                        {/* Mini image */}
                                        <div
                                            className="w-10 h-10 flex-shrink-0 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 flex items-center justify-center cursor-pointer group"
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file'; input.accept = 'image/*';
                                                input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) handleVariantImage(index, file); };
                                                input.click();
                                            }}
                                        >
                                            {variant.preview ? (
                                                <img src={variant.preview} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <Camera className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-500" />
                                            )}
                                        </div>

                                        {/* Fields */}
                                        <div className="flex-1 grid grid-cols-12 gap-2">
                                            <div className="col-span-4">
                                                <input type="text" value={variant.name} onChange={(e) => updateVariant(index, 'name', e.target.value)} className={`${inputClass} !py-1.5 text-xs`} placeholder="Nama varian" />
                                            </div>
                                            <div className="col-span-3">
                                                <div className="relative">
                                                    <input type="text" value={variant.sku} onChange={(e) => updateVariant(index, 'sku', e.target.value)} className={`${inputClass} !py-1.5 text-xs pr-12`} placeholder="SKU" />
                                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                                                        <button type="button" onClick={() => updateVariant(index, 'sku', generateSmartSKU(data.name, data.category_id, variant.name))} className="p-1 text-gray-400 hover:text-indigo-500 transition-colors" title="Generate SKU"><RefreshCw className="w-3 h-3" /></button>
                                                        <button type="button" onClick={() => updateVariant(index, 'sku', '')} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Kosongkan"><X className="w-3 h-3" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <input type="number" value={variant.price} onChange={(e) => updateVariant(index, 'price', e.target.value)} className={`${inputClass} !py-1.5 text-xs placeholder:text-gray-300 dark:placeholder:text-gray-600`} placeholder={`Rp ${new Intl.NumberFormat('id-ID').format(Number(data.price) || 0)}`} />
                                            </div>
                                            <div className="col-span-2">
                                                <input type="number" value={variant.stock} onChange={(e) => updateVariant(index, 'stock', e.target.value)} className={`${inputClass} !py-1.5 text-xs`} placeholder="Stok" />
                                            </div>
                                            <div className="col-span-1 flex items-center justify-center gap-1">
                                                <button type="button" onClick={() => duplicateVariant(index)} className="p-1 text-gray-400 hover:text-indigo-500 transition-colors" title="Duplikat baris ini">
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                                <button type="button" onClick={() => removeVariant(index)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Hapus varian">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
