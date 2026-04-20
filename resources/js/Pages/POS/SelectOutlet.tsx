import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps, Outlet } from '@/types';
import { LayoutGrid, MapPin, Phone, Mail, ChevronRight } from 'lucide-react';

interface Props extends PageProps {
    outlets: Outlet[];
}

export default function SelectOutlet({ auth, outlets }: Props) {
    const handleSelect = (outletId: number) => {
        router.post(route('pos.set-outlet'), { outlet_id: outletId });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pilih Outlet - POS" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl tracking-tight">
                            Pilih Outlet Kasir
                        </h2>
                        <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
                            Silakan pilih cabang atau outlet untuk memulai transaksi penjualan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {outlets.map((outlet) => (
                            <button
                                key={outlet.id}
                                onClick={() => handleSelect(outlet.id)}
                                className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:border-indigo-500 transition-all duration-300 text-left overflow-hidden ring-1 ring-transparent hover:ring-indigo-500/20"
                            >
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
                                
                                <div className="relative flex items-center justify-between mb-6">
                                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
                                        <LayoutGrid className="w-6 h-6 text-white" />
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                </div>

                                <div className="relative">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {outlet.name}
                                    </h3>
                                    
                                    <div className="space-y-3">
                                        {outlet.address && (
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                    {outlet.address}
                                                </span>
                                            </div>
                                        )}
                                        {outlet.phone && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {outlet.phone}
                                                </span>
                                            </div>
                                        )}
                                        {outlet.email && (
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {outlet.email}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                    Masuk ke POS Outlet
                                </div>
                            </button>
                        ))}
                    </div>

                    {outlets.length === 0 && (
                        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
                            <p className="text-gray-500">Belum ada outlet yang terdaftar.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
