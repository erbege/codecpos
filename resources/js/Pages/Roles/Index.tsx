import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Shield, CheckCircle2, Circle, Lock, Settings } from 'lucide-react';

interface Props extends PageProps {
    roles: any[];
    permissions: any[];
}

export default function RoleIndex() {
    const { roles, permissions } = usePage<Props>().props;

    // Group permissions by category for easier display
    const groupedPermissions = permissions.reduce((acc: any, p: any) => {
        const category = p.name.split('.')[0] || 'Umum';
        if (!acc[category]) acc[category] = [];
        acc[category].push(p);
        return acc;
    }, {});

    return (
        <AuthenticatedLayout>
            <Head title="Hak Akses & Peran - Keamanan" />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="py-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Manajemen Akses</h1>
                        <p className="text-sm font-semibold text-gray-400">Konfigurasi peran (roles) dan izin (permissions) sistem</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400">
                        <Lock className="w-5 h-5" />
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {roles.map((role) => (
                        <div key={role.id} className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl shadow-indigo-500/5 flex flex-col group transition-all hover:border-indigo-200 dark:hover:border-indigo-500/30">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest">{role.name}</h3>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">ROLE ID: 0{role.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 bg-white dark:bg-gray-800 border border-indigo-50 dark:border-indigo-500/20 px-2 py-1 rounded-lg">
                                    <Settings className="w-3 h-3" /> Configured
                                </div>
                            </div>

                            <div className="p-6 flex-1 space-y-8 overflow-y-auto max-h-[500px]">
                                {Object.entries(groupedPermissions).map(([category, items]: [string, any]) => (
                                    <div key={category} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{category}</h4>
                                            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800"></div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {items.map((p: any) => {
                                                const hasPermission = role.permissions.some((rp: any) => rp.id === p.id);
                                                return (
                                                    <div 
                                                        key={p.id} 
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all 
                                                            ${hasPermission 
                                                                ? 'bg-indigo-50/30 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-900/30' 
                                                                : 'bg-gray-50/30 dark:bg-gray-800/20 border-transparent opacity-40 shadow-inner'}`}
                                                    >
                                                        {hasPermission ? (
                                                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                            </div>
                                                        ) : (
                                                            <Circle className="w-5 h-5 text-gray-200 dark:text-gray-700" />
                                                        )}
                                                        <span className={`text-[10px] uppercase font-black tracking-widest ${hasPermission ? 'text-gray-900 dark:text-gray-200' : 'text-gray-400'}`}>
                                                            {p.name.split('.')[1] || p.name}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Penerapan hak akses ini bersifat global segera setelah disimpan.</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
