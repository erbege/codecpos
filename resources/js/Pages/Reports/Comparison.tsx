import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { PageProps, Outlet } from '@/types';
import { 
    ArrowLeftRight, 
    ChevronRight, 
    Package, 
    AlertCircle, 
    CheckCircle2, 
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Store,
    LayoutGrid,
    ListFilter
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface ComparisonItem {
    sku: string;
    name: string;
    stock: number;
    price: number;
}

interface MismatchItem {
    sku: string;
    name: string;
    a: { stock: number; price: number };
    b: { stock: number; price: number };
    diff_price: boolean;
    diff_stock: boolean;
}

interface Props extends PageProps {
    outlets: Outlet[];
    data: {
        only_in_a: ComparisonItem[];
        only_in_b: ComparisonItem[];
        mismatch: MismatchItem[];
    };
    filters: {
        outlet_a_id: string | null;
        outlet_b_id: string | null;
    };
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function Comparison() {
    const { outlets, data, filters } = usePage<Props>().props;
    const [activeTab, setActiveTab] = useState<'a' | 'b' | 'diff'>('diff');
    const [searchTerm, setSearchTerm] = useState('');

    const outletA = outlets.find(o => o.id === Number(filters.outlet_a_id));
    const outletB = outlets.find(o => o.id === Number(filters.outlet_b_id));

    const handleOutletChange = (side: 'a' | 'b', id: string) => {
        const newFilters = { ...filters, [`outlet_${side}_id`]: id };
        router.get(route('reports.comparison'), newFilters, {
            preserveState: true,
            replace: true
        });
    };

    const filteredOnlyA = data.only_in_a.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredOnlyB = data.only_in_b.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredMismatch = data.mismatch.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const countA = data.only_in_a.length;
    const countB = data.only_in_b.length;
    const countDiff = data.mismatch.length;

    return (
        <AuthenticatedLayout>
            <Head title="Perbandingan Antar Outlet" />

            <div className="space-y-6 max-w-[1600px] mx-auto">
                {/* Header & Selectors */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                                <div className="p-2 bg-indigo-500 rounded-xl">
                                    <ArrowLeftRight className="w-5 h-5 text-white" />
                                </div>
                                Komparasi Produk & Stok
                            </h1>
                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Analisis perbedaan ketersediaan antar cabang</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2 px-2">
                                <Store className="w-4 h-4 text-indigo-500" />
                                <select 
                                    value={filters.outlet_a_id || ''} 
                                    onChange={(e) => handleOutletChange('a', e.target.value)}
                                    className="bg-transparent border-none text-sm font-bold text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer min-w-[180px]"
                                >
                                    <option value="">Pilih Outlet A</option>
                                    {outlets.map(o => (
                                        <option key={o.id} value={o.id}>{o.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm">
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                            </div>
                            <div className="flex items-center gap-2 px-2">
                                <Store className="w-4 h-4 text-violet-500" />
                                <select 
                                    value={filters.outlet_b_id || ''} 
                                    onChange={(e) => handleOutletChange('b', e.target.value)}
                                    className="bg-transparent border-none text-sm font-bold text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer min-w-[180px]"
                                >
                                    <option value="">Pilih Outlet B</option>
                                    {outlets.map(o => (
                                        <option key={o.id} value={o.id}>{o.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {!filters.outlet_a_id || !filters.outlet_b_id ? (
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800 p-20 text-center space-y-4">
                        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Store className="w-12 h-12 text-indigo-500 opacity-40" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pilih Dua Outlet Untuk Memulai</h3>
                        <p className="text-gray-400 max-w-sm mx-auto">Silakan pilih dua cabang yang ingin Anda bandingkan ketersediaan produk, harga, dan stoknya.</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button 
                                onClick={() => setActiveTab('a')}
                                className={`p-6 rounded-3xl border-2 transition-all text-left group ${activeTab === 'a' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'bg-white dark:bg-gray-900 border-transparent hover:border-indigo-500/30'}`}
                            >
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${activeTab === 'a' ? 'text-indigo-200' : 'text-indigo-500'}`}>Hanya di {outletA?.name || 'A'}</p>
                                <div className="flex items-center justify-between">
                                    <h4 className="text-3xl font-black">{countA}</h4>
                                    <Package className={`w-8 h-8 opacity-20 group-hover:scale-110 transition-transform ${activeTab === 'a' ? 'text-white' : 'text-indigo-500'}`} />
                                </div>
                            </button>
                            
                            <button 
                                onClick={() => setActiveTab('b')}
                                className={`p-6 rounded-3xl border-2 transition-all text-left group ${activeTab === 'b' ? 'bg-violet-600 border-violet-600 text-white shadow-xl shadow-violet-500/20' : 'bg-white dark:bg-gray-900 border-transparent hover:border-violet-500/30'}`}
                            >
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${activeTab === 'b' ? 'text-violet-200' : 'text-violet-500'}`}>Hanya di {outletB?.name || 'B'}</p>
                                <div className="flex items-center justify-between">
                                    <h4 className="text-3xl font-black">{countB}</h4>
                                    <Package className={`w-8 h-8 opacity-20 group-hover:scale-110 transition-transform ${activeTab === 'b' ? 'text-white' : 'text-violet-500'}`} />
                                </div>
                            </button>

                            <button 
                                onClick={() => setActiveTab('diff')}
                                className={`p-6 rounded-3xl border-2 transition-all text-left group ${activeTab === 'diff' ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white dark:bg-gray-900 border-transparent hover:border-emerald-500/30'}`}
                            >
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${activeTab === 'diff' ? 'text-emerald-200' : 'text-emerald-500'}`}>Perbedaan Data</p>
                                <div className="flex items-center justify-between">
                                    <h4 className="text-3xl font-black">{countDiff}</h4>
                                    <AlertTriangle className={`w-8 h-8 opacity-20 group-hover:scale-110 transition-transform ${activeTab === 'diff' ? 'text-white' : 'text-emerald-500'}`} />
                                </div>
                            </button>
                        </div>

                        {/* Search & Action Bar */}
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Cari SKU atau nama produk..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* List Area */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm transition-all duration-500">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sku & Identitas Produk</th>
                                            {activeTab === 'diff' ? (
                                                <>
                                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">{outletA?.name}</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">{outletB?.name}</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status Selisih</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Stok</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Harga Jual</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Tersedia Di</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                        {activeTab === 'diff' && filteredMismatch.map((item, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-300">
                                                <td className="px-8 py-5">
                                                    <div className="space-y-0.5">
                                                        <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 tracking-tighter uppercase">{item.sku}</span>
                                                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${item.diff_stock ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' : 'text-gray-400'}`}>Stok: {item.a.stock}</span>
                                                        <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${item.diff_price ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10' : 'text-gray-400'}`}>{formatCurrency(item.a.price)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${item.diff_stock ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' : 'text-gray-400'}`}>Stok: {item.b.stock}</span>
                                                        <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${item.diff_price ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10' : 'text-gray-400'}`}>{formatCurrency(item.b.price)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        {item.diff_price && (
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-rose-500 uppercase px-2 py-0.5 border border-rose-100 dark:border-rose-500/20 rounded-full">
                                                                <ArrowLeftRight className="w-2.5 h-2.5" /> Beda Harga
                                                            </span>
                                                        )}
                                                        {item.diff_stock && (
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase px-2 py-0.5 border border-amber-100 dark:border-amber-500/20 rounded-full">
                                                                <ListFilter className="w-2.5 h-2.5" /> Selisih Stok
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {(activeTab === 'a' || activeTab === 'b') && (activeTab === 'a' ? filteredOnlyA : filteredOnlyB).map((item, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-300">
                                                <td className="px-8 py-5">
                                                    <div className="space-y-0.5">
                                                        <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 tracking-tighter uppercase">{item.sku}</span>
                                                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right font-black text-gray-700 dark:text-gray-300">{item.stock}</td>
                                                <td className="px-8 py-5 text-right font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(item.price)}</td>
                                                <td className="px-8 py-5 text-center px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight ${activeTab === 'a' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10' : 'bg-violet-50 text-violet-600 dark:bg-violet-500/10'}`}>
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Only {activeTab === 'a' ? outletA?.name : outletB?.name}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {((activeTab === 'a' && filteredOnlyA.length === 0) || 
                                  (activeTab === 'b' && filteredOnlyB.length === 0) || 
                                  (activeTab === 'diff' && filteredMismatch.length === 0)) && (
                                    <div className="py-20 text-center space-y-3">
                                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-40" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tidak ada data ditemukan dalam kategori ini</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
