import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Shield, CheckCircle2, Circle } from 'lucide-react';

interface Props extends PageProps {
    roles: any[];
    permissions: any[];
}

export default function RoleIndex() {
    const { roles, permissions } = usePage<Props>().props;

    // Group permissions by category for easier display
    const groupedPermissions = permissions.reduce((acc: any, p: any) => {
        const category = p.name.split('.')[0] || 'Lainnya';
        if (!acc[category]) acc[category] = [];
        acc[category].push(p);
        return acc;
    }, {});

    return (
        <AuthenticatedLayout>
            <Head title="Peran & Izin" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Peran & Izin Akses</h1>
                    <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Pemetaan Hak Akses Sistem Berdasarkan Role</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {roles.map((role) => (
                        <div key={role.id} className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm flex flex-col">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-indigo-500" />
                                    <h3 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest">{role.name}</h3>
                                </div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">ID: {role.id}</span>
                            </div>

                            <div className="p-4 flex-1 space-y-4 overflow-y-auto max-h-[400px]">
                                {Object.entries(groupedPermissions).map(([category, items]: [string, any]) => (
                                    <div key={category} className="space-y-2">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-1">{category}</h4>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {items.map((p: any) => {
                                                const hasPermission = role.permissions.some((rp: any) => rp.id === p.id);
                                                return (
                                                    <div key={p.id} className={`flex items-center gap-2 px-2 py-1.5 rounded border transition-colors ${hasPermission ? 'bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-900/30' : 'bg-gray-50/30 dark:bg-gray-800/20 border-transparent opacity-60'}`}>
                                                        {hasPermission ? (
                                                            <CheckCircle2 className="w-3 h-3 text-indigo-600 dark:text-indigo-500" />
                                                        ) : (
                                                            <Circle className="w-3 h-3 text-gray-300 dark:text-gray-700" />
                                                        )}
                                                        <span className={`text-[10px] uppercase font-bold tracking-tight ${hasPermission ? 'text-gray-900 dark:text-gray-200' : 'text-gray-400'}`}>
                                                            {p.name.split('.')[1] || p.name}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
