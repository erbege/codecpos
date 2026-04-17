import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Package, 
    History, 
    Download, 
    FileText, 
    ArrowLeft,
    Calendar,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    AlertCircle,
    User,
    Layers
} from 'lucide-react';

interface Props {
    stock: Array<{
        id: number;
        sku: string;
        name: string;
        category: string;
        stock: number;
        min_stock: number;
        value: number;
    }>;
    movements: {
        data: Array<{
            id: number;
            product: { name: string; sku: string };
            user: { name: string };
            type: string;
            quantity: number;
            reference_type: string;
            notes: string;
            created_at: string;
        }>;
        links: any[];
    };
    filters: {
        date_from: string;
        date_to: string;
        outlet_id: number | string | null;
    };
    outlets: Array<{
        id: number;
        name: string;
    }>;
    auth: any;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function Inventory({ stock, movements, filters, outlets, auth }: Props) {
    const [activeTab, setActiveTab] = useState<'status' | 'movements'>('status');

    const handleFilterChange = (key: string, value: string | number | null) => {
        router.get(route('reports.inventory'), {
            ...filters,
            [key]: value
        }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Stok & Inventori" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route('reports.index')} className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-indigo-600 transition-colors shadow-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Stok & Inventori</h1>
                            <p className="text-sm text-gray-500">Pantau ketersediaan barang dan riwayat pergerakan stok</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md active:scale-95">
                            <Download className="w-4 h-4" /> EXCEL
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition-all shadow-md active:scale-95">
                            <FileText className="w-4 h-4" /> PDF
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-wrap items-center gap-6">
                    {activeTab === 'movements' && (
                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            <div className="flex items-center gap-2">
                                <input 
                                    type="date" 
                                    value={filters.date_from}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                    className="bg-transparent border-gray-200 dark:border-gray-800 rounded-lg text-[11px] font-bold focus:ring-0 dark:text-gray-300 px-2 py-1"
                                />
                                <span className="text-gray-400">s/d</span>
                                <input 
                                    type="date" 
                                    value={filters.date_to}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                    className="bg-transparent border-gray-200 dark:border-gray-800 rounded-lg text-[11px] font-bold focus:ring-0 dark:text-gray-300 px-2 py-1"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                        <Filter className="w-4 h-4 text-indigo-500" />
                        <select 
                            value={filters.outlet_id || ''}
                            onChange={(e) => handleFilterChange('outlet_id', e.target.value)}
                            className="bg-transparent border-none text-[11px] font-bold focus:ring-0 p-0 text-gray-700 dark:text-gray-300 flex-1"
                        >
                            <option value="">Semua Outlet</option>
                            {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
                    <div className="flex border-b border-gray-200 dark:border-gray-800 p-1 bg-gray-50/50 dark:bg-gray-800/50">
                        <button 
                            onClick={() => setActiveTab('status')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all
                                ${activeTab === 'status' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}
                            `}
                        >
                            <Layers className="w-4 h-4" /> Status Stok Saat Ini
                        </button>
                        <button 
                            onClick={() => setActiveTab('movements')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all
                                ${activeTab === 'movements' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}
                            `}
                        >
                            <History className="w-4 h-4" /> Riwayat Mutasi Stok
                        </button>
                    </div>

                    <div className="flex-1 p-6">
                        {activeTab === 'status' && (
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] uppercase font-black text-gray-400 tracking-widest bg-gray-50/50 dark:bg-gray-800/30">
                                    <tr>
                                        <th className="px-4 py-4">SKU / Nama Produk</th>
                                        <th className="px-4 py-4">Kategori</th>
                                        <th className="px-4 py-4 text-center">Sisa Stok</th>
                                        <th className="px-4 py-4 text-center">Status</th>
                                        <th className="px-4 py-4 text-right">Nilai Barang</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {stock.length > 0 ? stock.map((item) => {
                                        const isLow = item.stock <= item.min_stock;
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="px-4 py-4">
                                                    <p className="text-[10px] font-black text-gray-400 mb-0.5">{item.sku}</p>
                                                    <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{item.name}</p>
                                                </td>
                                                <td className="px-4 py-4 text-xs font-bold text-gray-500 uppercase">{item.category}</td>
                                                <td className="px-4 py-4 text-center font-black text-gray-700 dark:text-gray-200">
                                                    {item.stock} <span className="text-[10px] text-gray-400">UNIT</span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    {isLow ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 text-[9px] font-black uppercase ring-1 ring-inset ring-red-500/20">
                                                            <AlertCircle className="w-2.5 h-2.5" /> Stok Menipis
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase ring-1 ring-inset ring-emerald-500/20">
                                                            Tersedia
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right font-black text-indigo-600">
                                                    {formatCurrency(Number(item.value))}
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan={5} className="px-4 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada data barang</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'movements' && (
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] uppercase font-black text-gray-400 tracking-widest bg-gray-50/50 dark:bg-gray-800/30">
                                    <tr>
                                        <th className="px-4 py-4">Waktu</th>
                                        <th className="px-4 py-4">Produk</th>
                                        <th className="px-4 py-4 text-center">Tipe</th>
                                        <th className="px-4 py-4 text-center">Qty</th>
                                        <th className="px-4 py-4">Oleh</th>
                                        <th className="px-4 py-4">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {movements.data.length > 0 ? movements.data.map((m) => (
                                        <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="px-4 py-4 text-[10px] font-bold text-gray-500">
                                                {new Date(m.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-xs">{m.product.name}</p>
                                                <p className="text-[10px] text-gray-400">{m.product.sku}</p>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase
                                                    ${m.type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}
                                                `}>
                                                    {m.type === 'in' ? 'Masuk' : 'Keluar'}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-4 text-center font-black ${m.type === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {m.type === 'in' ? '+' : '-'}{Math.abs(m.quantity)}
                                            </td>
                                            <td className="px-4 py-4 flex items-center gap-1.5 grayscale opacity-70">
                                                <User className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase">{m.user.name}</span>
                                            </td>
                                            <td className="px-4 py-4 text-[10px] text-gray-500 italic max-w-xs truncate">{m.notes || '-'}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={6} className="px-4 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada mutasi stok</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center mt-auto">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Total Nilai Aset Inventori : {formatCurrency(stock.reduce((acc, curr) => acc + Number(curr.value), 0))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
