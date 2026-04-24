import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Tag, ArrowLeft, Plus, Trash2, Search, Package, Globe, Store } from 'lucide-react';
import { useState, useMemo } from 'react';

interface Props extends PageProps {
    products: any[];
    outlets: any[];
    promotion?: any;
}

export default function PromotionForm({ isEdit = false }: { isEdit?: boolean }) {
    const { products, outlets, promotion } = usePage<Props>().props;
    const [productSearch, setProductSearch] = useState('');

    const { data, setData, post, put, processing, errors } = useForm({
        name: promotion?.name || '',
        code: promotion?.code || '',
        description: promotion?.description || '',
        scope: promotion?.scope || 'product',
        discount_type: promotion?.discount_type || 'percentage',
        discount_value: promotion?.discount_value || '',
        max_discount: promotion?.max_discount || '',
        min_purchase: promotion?.min_purchase || '',
        start_date: promotion?.start_date ? new Date(promotion.start_date).toISOString().slice(0, 16) : '',
        end_date: promotion?.end_date ? new Date(promotion.end_date).toISOString().slice(0, 16) : '',
        max_usage: promotion?.max_usage || '',
        priority: promotion?.priority || 0,
        items: promotion?.items?.map((i: any) => ({
            product_id: i.product_id,
            product_variant_id: i.product_variant_id,
            max_qty: i.max_qty || '',
            _name: i.product?.name + (i.product_variant?.name ? ` - ${i.product_variant.name}` : ''),
        })) || [] as any[],
        apply_all_outlets: promotion ? (promotion.outlets?.length === 0) : true,
        outlet_ids: promotion?.outlets?.map((o: any) => o.id) || [] as number[],
    });

    const filteredProducts = useMemo(() => {
        if (!productSearch) return [];
        const q = productSearch.toLowerCase();
        const results: any[] = [];
        products.forEach(p => {
            if (p.has_variants && p.variants?.length > 0) {
                p.variants.forEach((v: any) => {
                    const name = `${p.name} - ${v.name}`;
                    if (name.toLowerCase().includes(q) || v.sku?.toLowerCase().includes(q)) {
                        results.push({ product_id: p.id, product_variant_id: v.id, name, sku: v.sku });
                    }
                });
            } else {
                if (p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)) {
                    results.push({ product_id: p.id, product_variant_id: null, name: p.name, sku: p.sku });
                }
            }
        });
        return results.slice(0, 10);
    }, [productSearch, products]);

    const addItem = (item: any) => {
        const exists = data.items.some((i: any) => i.product_id === item.product_id && i.product_variant_id === item.product_variant_id);
        if (exists) return;
        setData('items', [...data.items, { product_id: item.product_id, product_variant_id: item.product_variant_id, max_qty: '', _name: item.name }]);
        setProductSearch('');
    };

    const removeItem = (idx: number) => {
        setData('items', data.items.filter((_: any, i: number) => i !== idx));
    };

    const updateItemQty = (idx: number, val: string) => {
        const items = [...data.items];
        items[idx] = { ...items[idx], max_qty: val };
        setData('items', items);
    };

    const toggleOutlet = (outletId: number) => {
        const ids = data.outlet_ids.includes(outletId)
            ? data.outlet_ids.filter((id: number) => id !== outletId)
            : [...data.outlet_ids, outletId];
        setData('outlet_ids', ids);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...data,
            items: data.items.map((i: any) => ({ product_id: i.product_id, product_variant_id: i.product_variant_id, max_qty: i.max_qty || null })),
            max_usage: data.max_usage || null,
            max_discount: data.max_discount || null,
            min_purchase: data.min_purchase || null,
            priority: data.priority || 0,
        };
        if (isEdit && promotion) {
            put(`/promotions/${promotion.id}`, { data: payload } as any);
        } else {
            post('/promotions', { data: payload } as any);
        }
    };

    const inputCls = "w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white";
    const labelCls = "block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5";
    const errCls = "text-xs text-red-500 mt-1";

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? 'Edit Promo' : 'Buat Promo Baru'} />
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Link href="/promotions" className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 transition-all">
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{isEdit ? 'Edit Promo' : 'Buat Promo Baru'}</h1>
                        <p className="text-sm text-gray-500">Konfigurasi diskon promo untuk produk atau transaksi</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2"><Tag className="w-4 h-4 text-indigo-500" /> Informasi Dasar</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Nama Promo *</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputCls} placeholder="Grand Opening Sale" />
                                {errors.name && <p className={errCls}>{errors.name}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Kode Promo (Opsional)</label>
                                <input type="text" value={data.code} onChange={e => setData('code', e.target.value.toUpperCase())} className={inputCls} placeholder="GRANDOPEN" />
                                {errors.code && <p className={errCls}>{errors.code}</p>}
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Deskripsi (Opsional)</label>
                            <textarea value={data.description} onChange={e => setData('description', e.target.value)} className={inputCls} rows={2} placeholder="Deskripsi singkat promo..." />
                        </div>
                    </div>

                    {/* Discount Config */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Konfigurasi Diskon</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Scope *</label>
                                <div className="flex gap-2">
                                    {[{ v: 'product', l: 'Produk Tertentu', icon: Package }, { v: 'global', l: 'Global (Checkout)', icon: Globe }].map(s => (
                                        <button key={s.v} type="button" onClick={() => setData('scope', s.v as any)}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${data.scope === s.v ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-400' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'}`}>
                                            <s.icon className="w-4 h-4" />{s.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Tipe Diskon *</label>
                                <div className="flex gap-2">
                                    {[{ v: 'percentage', l: 'Persentase (%)' }, { v: 'fixed', l: 'Nominal (Rp)' }].map(t => (
                                        <button key={t.v} type="button" onClick={() => setData('discount_type', t.v as any)}
                                            className={`flex-1 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${data.discount_type === t.v ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-400' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'}`}>
                                            {t.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelCls}>Nilai Diskon *</label>
                                <input type="number" step="0.01" value={data.discount_value} onChange={e => setData('discount_value', e.target.value as any)} className={inputCls} placeholder={data.discount_type === 'percentage' ? '15' : '25000'} />
                                {errors.discount_value && <p className={errCls}>{errors.discount_value}</p>}
                            </div>
                            {data.discount_type === 'percentage' && (
                                <div>
                                    <label className={labelCls}>Maks. Potongan (Opsional)</label>
                                    <input type="number" value={data.max_discount} onChange={e => setData('max_discount', e.target.value as any)} className={inputCls} placeholder="50000" />
                                </div>
                            )}
                            <div>
                                <label className={labelCls}>Min. Belanja (Opsional)</label>
                                <input type="number" value={data.min_purchase} onChange={e => setData('min_purchase', e.target.value as any)} className={inputCls} placeholder="500000" />
                            </div>
                        </div>
                    </div>

                    {/* Period & Limits */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Periode & Batasan</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelCls}>Tanggal Mulai *</label>
                                <input type="datetime-local" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className={inputCls} />
                                {errors.start_date && <p className={errCls}>{errors.start_date}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Tanggal Berakhir *</label>
                                <input type="datetime-local" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className={inputCls} />
                                {errors.end_date && <p className={errCls}>{errors.end_date}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Maks. Transaksi (Opsional)</label>
                                <input type="number" value={data.max_usage} onChange={e => setData('max_usage', e.target.value as any)} className={inputCls} placeholder="Unlimited" />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Prioritas</label>
                            <input type="number" value={data.priority} onChange={e => setData('priority', parseInt(e.target.value) || 0)} className={`${inputCls} max-w-[120px]`} />
                            <p className="text-xs text-gray-400 mt-1">Angka lebih tinggi = prioritas lebih tinggi (non-stackable)</p>
                        </div>
                    </div>

                    {/* Product Selection (scope=product only) */}
                    {data.scope === 'product' && (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2"><Package className="w-4 h-4 text-purple-500" /> Produk Target</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)} className={`${inputCls} pl-10`} placeholder="Cari produk atau varian..." />
                                {filteredProducts.length > 0 && (
                                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                        {filteredProducts.map((item, idx) => (
                                            <button key={idx} type="button" onClick={() => addItem(item)} className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex justify-between items-center">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</span>
                                                <span className="text-xs text-gray-400">{item.sku}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {errors.items && <p className={errCls}>{errors.items}</p>}
                            {data.items.length > 0 && (
                                <table className="w-full text-sm">
                                    <thead className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <tr><th className="text-left py-2">Produk</th><th className="text-center py-2 w-40">Maks Qty (Opsional)</th><th className="w-10"></th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {data.items.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="py-2 font-bold text-gray-900 dark:text-white">{item._name}</td>
                                                <td className="py-2 text-center">
                                                    <input type="number" value={item.max_qty} onChange={e => updateItemQty(idx, e.target.value)} className="w-28 mx-auto px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-center" placeholder="∞" />
                                                </td>
                                                <td className="py-2"><button type="button" onClick={() => removeItem(idx)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Outlet Selection */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2"><Store className="w-4 h-4 text-emerald-500" /> Outlet Target</h2>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={data.apply_all_outlets} onChange={e => setData('apply_all_outlets', e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Berlaku untuk semua outlet</span>
                        </label>
                        {!data.apply_all_outlets && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {outlets.map((outlet: any) => (
                                    <label key={outlet.id} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${data.outlet_ids.includes(outlet.id) ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                                        <input type="checkbox" checked={data.outlet_ids.includes(outlet.id)} onChange={() => toggleOutlet(outlet.id)} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{outlet.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <Link href="/promotions" className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Batal</Link>
                        <button type="submit" disabled={processing} className="px-8 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 active:scale-[0.98]">
                            {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Promo'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
