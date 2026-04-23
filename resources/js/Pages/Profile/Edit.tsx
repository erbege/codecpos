import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { User, Mail, Lock, Key, Shield, Save, Trash2, AlertTriangle, CheckCircle, Store } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { useAppStore } from '@/stores/useAppStore';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const user = usePage().props.auth.user;

    // Profile form
    const profileForm = useForm({
        name: user.name,
        email: user.email,
        pin: '',
    });

    // Password form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const currentPasswordRef = useRef<HTMLInputElement>(null);
    const newPasswordRef = useRef<HTMLInputElement>(null);

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                profileForm.setData('pin', '');
                toast.success('Profil berhasil diperbarui', {
                    description: 'Informasi akun dan PIN telah disimpan.',
                });
            },
            onError: (errors) => {
                const messages = Object.values(errors).flat();
                toast.error('Gagal memperbarui profil', {
                    description: messages.length > 0 ? String(messages[0]) : 'Periksa kembali data yang diinput.',
                });
            },
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                toast.success('Password berhasil diperbarui', {
                    description: 'Gunakan password baru saat login berikutnya.',
                });
            },
            onError: (errors) => {
                if (errors.password) {
                    passwordForm.reset('password', 'password_confirmation');
                    newPasswordRef.current?.focus();
                }
                if (errors.current_password) {
                    passwordForm.reset('current_password');
                    currentPasswordRef.current?.focus();
                }
                const messages = Object.values(errors).flat();
                toast.error('Gagal memperbarui password', {
                    description: messages.length > 0 ? String(messages[0]) : 'Periksa kembali data yang diinput.',
                });
            },
        });
    };

    const confirm = useAppStore(state => state.confirm);

    const handleDeleteAccount = () => {
        confirm({
            title: 'Hapus Akun Permanen',
            message: 'Apakah Anda yakin ingin menghapus akun ini? Semua data dan resource akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.',
            confirmLabel: 'Ya, Hapus Akun Saya',
            type: 'danger',
            onConfirm: () => {
                router.delete(route('profile.destroy'), {
                    preserveScroll: true,
                });
            },
        });
    };

    // Shared input styles
    const inputClass = "w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all";

    return (
        <AuthenticatedLayout>
            <Head title="Profil Saya" />

            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none uppercase">
                            Profil <span className="text-indigo-600">Saya</span>
                        </h1>
                        <p className="text-xs text-indigo-500 font-bold mt-2 uppercase tracking-[0.2em] bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full inline-block border border-indigo-100 dark:border-indigo-500/20">
                            Kelola Akun, Keamanan & Kredensial Login
                        </p>
                    </div>
                    
                    {/* Account Badge */}
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-500/30">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">{user.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Profile & PIN */}
                    <div className="lg:col-span-7 space-y-6">
                        <form onSubmit={handleProfileSubmit}>
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/20 dark:shadow-none animate-in fade-in slide-in-from-left-4 duration-700">
                                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-50/80 to-white dark:from-gray-800/20 dark:to-transparent">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase">Informasi Akun</h3>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Identitas & Kredensial PIN Kasir</p>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={profileForm.processing}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        Simpan
                                    </button>
                                </div>
                                
                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                                                <User className="w-3.5 h-3.5" /> Nama Lengkap
                                            </label>
                                            <input
                                                type="text"
                                                value={profileForm.data.name}
                                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                                className={inputClass}
                                                placeholder="Nama lengkap Anda"
                                                required
                                            />
                                            {profileForm.errors.name && <p className="text-[10px] text-red-500 font-bold uppercase">{profileForm.errors.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                                                <Mail className="w-3.5 h-3.5" /> Alamat Email
                                            </label>
                                            <input
                                                type="email"
                                                value={profileForm.data.email}
                                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                                className={inputClass}
                                                placeholder="email@domain.com"
                                                required
                                            />
                                            {profileForm.errors.email && <p className="text-[10px] text-red-500 font-bold uppercase">{profileForm.errors.email}</p>}
                                        </div>
                                    </div>

                                    {mustVerifyEmail && user.email_verified_at === undefined && (
                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-500/5 border border-dashed border-amber-200 dark:border-amber-500/30">
                                            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Email belum terverifikasi</p>
                                                <p className="text-[11px] text-amber-600 dark:text-amber-500 font-medium mt-0.5">Klik kirim ulang email verifikasi untuk memverifikasi alamat email Anda.</p>
                                            </div>
                                        </div>
                                    )}

                                    {status === 'verification-link-sent' && (
                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-dashed border-emerald-200 dark:border-emerald-500/30">
                                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Link verifikasi baru telah dikirim ke email Anda.</p>
                                        </div>
                                    )}

                                    {/* PIN Section */}
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                <Key className="w-3.5 h-3.5" /> PIN Kasir (6-Digit Angka)
                                            </label>
                                            <div className="relative">
                                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="password"
                                                    maxLength={6}
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={profileForm.data.pin}
                                                    onChange={(e) => profileForm.setData('pin', e.target.value.replace(/\D/g, ''))}
                                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-lg font-bold text-gray-900 dark:text-white tracking-[0.5em] text-center focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                                                    placeholder="••••••"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium italic leading-relaxed">
                                                Kosongkan jika tidak ingin mengubah PIN. PIN digunakan untuk otorisasi shift dan akses kasir.
                                            </p>
                                            {profileForm.errors.pin && <p className="text-[10px] text-red-500 font-bold uppercase">{profileForm.errors.pin}</p>}
                                        </div>
                                    </div>

                                    {/* Role & Outlet Info (Read-only) */}
                                    {(user.roles || user.outlet) && (
                                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {user.roles && user.roles.length > 0 && (
                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                                                        <Shield className="w-4 h-4 text-indigo-500" />
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Peran</p>
                                                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{user.roles[0].name}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {user.outlet && (
                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                                                        <Store className="w-4 h-4 text-indigo-500" />
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Cabang</p>
                                                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{user.outlet.name}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Password & Danger Zone */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Password Card */}
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/20 dark:shadow-none animate-in fade-in slide-in-from-right-4 duration-700">
                                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-emerald-50/80 to-white dark:from-emerald-900/10 dark:to-transparent">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                            <Lock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase">Keamanan</h3>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ubah Password Login</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-8 space-y-5">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Password Saat Ini</label>
                                        <input
                                            ref={currentPasswordRef}
                                            type="password"
                                            value={passwordForm.data.current_password}
                                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                            className={inputClass}
                                            placeholder="Password lama Anda"
                                            autoComplete="current-password"
                                        />
                                        {passwordForm.errors.current_password && <p className="text-[10px] text-red-500 font-bold uppercase">{passwordForm.errors.current_password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Password Baru</label>
                                        <input
                                            ref={newPasswordRef}
                                            type="password"
                                            value={passwordForm.data.password}
                                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                                            className={inputClass}
                                            placeholder="Minimal 8 karakter"
                                            autoComplete="new-password"
                                        />
                                        {passwordForm.errors.password && <p className="text-[10px] text-red-500 font-bold uppercase">{passwordForm.errors.password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Konfirmasi Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.data.password_confirmation}
                                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                            className={inputClass}
                                            placeholder="Ketik ulang password baru"
                                            autoComplete="new-password"
                                        />
                                        {passwordForm.errors.password_confirmation && <p className="text-[10px] text-red-500 font-bold uppercase">{passwordForm.errors.password_confirmation}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={passwordForm.processing}
                                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50 uppercase tracking-widest"
                                    >
                                        <Lock className="w-4 h-4" />
                                        {passwordForm.processing ? 'Menyimpan...' : 'Perbarui Password'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Danger Zone */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/20 dark:shadow-none animate-in fade-in slide-in-from-right-4 duration-700">
                            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 bg-gradient-to-r from-red-50/80 to-white dark:from-red-900/10 dark:to-transparent">
                                <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase">Zona Bahaya</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Tindakan Permanen & Tidak Dapat Dibatalkan</p>
                                </div>
                            </div>
                            
                            <div className="p-8">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50/30 dark:bg-red-500/5 border border-dashed border-red-200 dark:border-red-500/30">
                                    <div>
                                        <p className="text-sm font-bold text-red-800 dark:text-red-300">Hapus Akun</p>
                                        <p className="text-[11px] text-red-500 font-medium mt-1 leading-tight">Semua data, transaksi, dan resource akan dihapus secara permanen.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDeleteAccount}
                                        className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-md shadow-red-500/20 flex-shrink-0"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
