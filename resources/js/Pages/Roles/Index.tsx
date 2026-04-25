import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Shield, CheckCircle2, Circle, Lock, Settings, Plus, Save, Trash2, X, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { toast } from 'sonner';
import { useAppStore } from '@/stores/useAppStore';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface Props extends PageProps {
    roles: Role[];
    permissions: Permission[];
}

export default function RoleIndex() {
    const { roles, permissions } = usePage<Props>().props;
    const { confirm: appConfirm } = useAppStore();
    
    // State for creating a NEW role
    const [showCreateModal, setShowCreateModal] = useState(false);
    const createForm = useForm({
        name: '',
        permissions: [] as string[],
    });

    // State for EDITING existing roles locally before saving
    // We use a Record of roles to track changes
    const [localRoles, setLocalRoles] = useState<Record<number, string[]>>(() => {
        const initial: Record<number, string[]> = {};
        roles.forEach(role => {
            initial[role.id] = role.permissions.map(p => p.name);
        });
        return initial;
    });

    const [savingRoleId, setSavingRoleId] = useState<number | null>(null);

    // Group permissions by category for easier display
    const groupedPermissions = useMemo(() => {
        return permissions.reduce((acc: Record<string, Permission[]>, p) => {
            const category = p.name.split('.')[0] || 'Umum';
            if (!acc[category]) acc[category] = [];
            acc[category].push(p);
            return acc;
        }, {});
    }, [permissions]);

    const handleTogglePermission = (roleId: number, permissionName: string) => {
        const role = roles.find(r => r.id === roleId);
        if (role?.name === 'admin') {
            toast.error('Role admin terkunci demi keamanan sistem.');
            return;
        }

        setLocalRoles(prev => {
            const current = prev[roleId] || [];
            if (current.includes(permissionName)) {
                return { ...prev, [roleId]: current.filter(p => p !== permissionName) };
            } else {
                return { ...prev, [roleId]: [...current, permissionName] };
            }
        });
    };

    const handleSaveRole = (role: Role) => {
        setSavingRoleId(role.id);
        const permissions = localRoles[role.id];

        const form = useForm({
            name: role.name,
            permissions: permissions,
        });

        form.put(route('roles.update', role.id), {
            onSuccess: () => {
                setSavingRoleId(null);
                toast.success(`Izin untuk peran ${role.name.toUpperCase()} berhasil diperbarui.`);
            },
            onError: () => {
                setSavingRoleId(null);
                toast.error('Gagal memperbarui izin.');
            }
        });
    };

    const handleDeleteRole = (role: Role) => {
        appConfirm({
            title: 'Hapus Peran',
            message: `Apakah Anda yakin ingin menghapus peran "${role.name.toUpperCase()}"? Tindakan ini tidak dapat dibatalkan.`,
            confirmLabel: 'Ya, Hapus',
            cancelLabel: 'Batal',
            type: 'danger',
            onConfirm: () => {
                const form = useForm({});
                form.delete(route('roles.destroy', role.id), {
                    onSuccess: () => toast.success('Peran berhasil dihapus.'),
                    onError: (errors: any) => toast.error(errors.error || 'Gagal menghapus peran.')
                });
            }
        });
    };

    const handleCreateRole = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('roles.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
                toast.success('Peran baru berhasil dibuat.');
            },
            onError: () => toast.error('Gagal membuat peran baru.')
        });
    };

    const togglePermissionForCreate = (name: string) => {
        const current = createForm.data.permissions;
        if (current.includes(name)) {
            createForm.setData('permissions', current.filter(p => p !== name));
        } else {
            createForm.setData('permissions', [...current, name]);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Hak Akses & Peran - Keamanan" />

            <div className="max-w-7xl mx-auto space-y-6 pb-20">
                <div className="py-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Manajemen Akses</h1>
                        <p className="text-sm font-semibold text-gray-400">Konfigurasi peran (roles) dan izin (permissions) sistem</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest"
                    >
                        <Plus className="w-4 h-4" /> Tambah Peran
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {roles.map((role) => {
                        const localPerms = localRoles[role.id] || [];
                        const isAdmin = role.name === 'admin';
                        const isChanged = JSON.stringify(localPerms.sort()) !== JSON.stringify(role.permissions.map(p => p.name).sort());

                        return (
                            <div key={role.id} className={`rounded-3xl bg-white dark:bg-gray-900 border overflow-hidden shadow-xl shadow-indigo-500/5 flex flex-col group transition-all 
                                ${isAdmin ? 'border-gray-200 dark:border-gray-800 opacity-90' : 'border-gray-200 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-500/30'}`}>
                                
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAdmin ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500'}`}>
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest">{role.name}</h3>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">ROLE ID: 0{role.id}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {isAdmin ? (
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 px-2.5 py-1.5 rounded-xl">
                                                <Lock className="w-3 h-3" /> System Restricted
                                            </div>
                                        ) : (
                                            <>
                                                {isChanged && (
                                                    <button
                                                        onClick={() => handleSaveRole(role)}
                                                        disabled={savingRoleId === role.id}
                                                        className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-xl transition-all shadow-sm"
                                                    >
                                                        <Save className="w-3.5 h-3.5" /> {savingRoleId === role.id ? 'Simpan...' : 'Simpan Perubahan'}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteRole(role)}
                                                    className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-rose-500 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 space-y-8 overflow-y-auto max-h-[500px]">
                                    {isAdmin && (
                                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-start gap-4">
                                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-800 dark:text-amber-400 font-bold leading-relaxed uppercase tracking-tight">
                                                Izin untuk role admin dikunci secara permanen untuk mencegah Admin kehilangan akses ke dashboard secara tidak sengaja.
                                            </p>
                                        </div>
                                    )}

                                    {Object.entries(groupedPermissions).map(([category, items]) => (
                                        <div key={category} className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{category}</h4>
                                                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800"></div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {items.map((p) => {
                                                    const hasPermission = localPerms.includes(p.name);
                                                    return (
                                                        <div 
                                                            key={p.id} 
                                                            onClick={() => !isAdmin && handleTogglePermission(role.id, p.name)}
                                                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all cursor-pointer group/item
                                                                ${hasPermission 
                                                                    ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' 
                                                                    : 'bg-gray-50/30 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800 opacity-60'}`}
                                                        >
                                                            {hasPermission ? (
                                                                <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-sm">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-5 h-5 rounded-full border-2 border-gray-200 dark:border-gray-700 group-hover/item:border-indigo-300 transition-colors" />
                                                            )}
                                                            <span className={`text-[10px] uppercase font-black tracking-widest ${hasPermission ? 'text-gray-900 dark:text-gray-200' : 'text-gray-500'}`}>
                                                                {p.name.split('.')[1] || p.name}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${isChanged ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            {isChanged ? 'Terdapat perubahan yang belum disimpan' : 'Semua izin sinkron'}
                                        </p>
                                    </div>
                                    {isChanged && (
                                        <button onClick={() => setLocalRoles(prev => ({ ...prev, [role.id]: role.permissions.map(p => p.name) }))} className="text-[9px] font-black text-rose-500 uppercase tracking-widest underline decoration-2 underline-offset-4">Batalkan</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Create Role Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="2xl">
                <form onSubmit={handleCreateRole} className="p-8 space-y-8">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Tambah Peran Baru</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Definisikan akses untuk kasir atau staf baru</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-4">
                        <InputLabel htmlFor="name" value="Nama Peran / Jabatan" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400" />
                        <TextInput
                            id="name"
                            type="text"
                            value={createForm.data.name}
                            onChange={(e) => createForm.setData('name', e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-black text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-300"
                            placeholder="Contoh: Supervisor, Akuntan, dll."
                            autoFocus
                        />
                        {createForm.errors.name && <p className="text-[10px] text-rose-500 font-bold uppercase">{createForm.errors.name}</p>}
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pilih Izin Awal</h4>
                        <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-8">
                                {Object.entries(groupedPermissions).map(([category, items]) => (
                                    <div key={category} className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{category}</p>
                                            <div className="flex-1 h-px bg-indigo-500/10"></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {items.map((p) => {
                                                const selected = createForm.data.permissions.includes(p.name);
                                                return (
                                                    <div 
                                                        key={p.id} 
                                                        onClick={() => togglePermissionForCreate(p.name)}
                                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all cursor-pointer text-[10px] font-bold uppercase tracking-tight
                                                            ${selected 
                                                                ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400' 
                                                                : 'bg-white dark:bg-transparent border-gray-100 dark:border-gray-800 text-gray-400'}`}
                                                    >
                                                        {selected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-200" />}
                                                        {p.name.split('.')[1] || p.name}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <SecondaryButton type="button" onClick={() => setShowCreateModal(false)} className="flex-1 justify-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">Batal</SecondaryButton>
                        <PrimaryButton disabled={createForm.processing} className="flex-1 justify-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">Simpan Peran</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
