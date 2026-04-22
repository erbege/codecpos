import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Mail, Lock, LogIn, User as UserIcon, Keyboard, ArrowLeft, ShieldCheck } from 'lucide-react';
import NumericKeypad from '@/Components/NumericKeypad';
import { toast } from 'sonner';

interface UserSelect {
    id: number;
    name: string;
    email: string;
}

export default function Login({
    status,
    canResetPassword,
    users = [],
}: {
    status?: string;
    canResetPassword: boolean;
    users: UserSelect[];
}) {
    const [loginMode, setLoginMode] = useState<'pin' | 'classic'>('pin');
    const [selectedUser, setSelectedUser] = useState<UserSelect | null>(null);
    const [pin, setPin] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isError, setIsError] = useState(false);

    const classicForm = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const pinForm = useForm({
        user_id: '',
        pin: '',
        remember: true,
    });

    const handleClassicSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        classicForm.post(route('login'), {
            onFinish: () => classicForm.reset('password'),
        });
    };

    const handlePinInput = (digit: string) => {
        if (pin.length < 6 && !isProcessing) {
            setIsError(false);
            const newPin = pin + digit;
            setPin(newPin);
            if (newPin.length === 6 && selectedUser) {
                submitPin(selectedUser.id, newPin);
            }
        }
    };

    const submitPin = (userId: number, finalPin: string) => {
        setIsProcessing(true);
        router.post(route('login'), {
            user_id: userId,
            pin: finalPin,
            remember: true
        }, {
            onError: (errors) => {
                setIsProcessing(false);
                setIsError(true);
                setPin('');
                toast.error(errors.email || 'PIN yang Anda masukkan salah.');
                // Reset error animation after a while
                setTimeout(() => setIsError(false), 500);
            },
            onFinish: () => {
                setIsProcessing(false);
            }
        });
    };

    return (
        <GuestLayout>
            <Head title="Log In" />

            <div className="mb-8">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {loginMode === 'pin' ? (selectedUser ? 'Masukkan PIN' : 'Pilih Akun Kasir') : 'Login Administrator'}
                </h2>
                <p className="text-slate-500 dark:text-slate-500 text-xs font-bold uppercase mt-1">
                    {loginMode === 'pin' 
                        ? (selectedUser ? `Verifikasi akses untuk ${selectedUser.name}` : 'Silakan pilih akun untuk mulai bertugas') 
                        : 'Masuk menggunakan email dan password'}
                </p>
            </div>

            {status && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold">
                    {status}
                </div>
            )}

            {loginMode === 'pin' ? (
                <div className="space-y-6">
                    {!selectedUser ? (
                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                                    Pilih Nama Operator
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                        <UserIcon className="w-4 h-4" />
                                    </div>
                                    <select
                                        onChange={(e) => {
                                            const user = users.find(u => u.id === parseInt(e.target.value));
                                            if (user) setSelectedUser(user);
                                        }}
                                        defaultValue=""
                                        className="w-full pl-12 pr-10 py-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>-- Pilih Akun Bertugas --</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 flex gap-4 items-center animate-pulse">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                    <ShieldCheck className="w-5 h-5 text-indigo-500" />
                                </div>
                                <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold leading-relaxed uppercase tracking-tight">
                                    Silakan pilih nama kasir yang akan bertugas untuk membuka akses verifikasi PIN.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex flex-col items-center gap-6">
                                <div className={`flex items-center gap-4 justify-center py-2 ${isError ? 'animate-shake' : ''}`}>
                                    {[...Array(6)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`
                                                w-4 h-4 rounded-full transition-all duration-300 border-2
                                                ${pin.length > i 
                                                    ? 'bg-indigo-500 border-indigo-600 scale-125 shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-pop' 
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}
                                            `} 
                                        />
                                    ))}
                                </div>
                                
                                {isProcessing ? (
                                    <div className="flex items-center gap-2 text-indigo-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">
                                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        Memverifikasi...
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => { setSelectedUser(null); setPin(''); setIsError(false); }}
                                        className="text-[10px] font-black text-slate-400 hover:text-indigo-500 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                    >
                                        <ArrowLeft className="w-3 h-3" /> Ganti Akun
                                    </button>
                                )}
                            </div>

                            <div className={isProcessing ? 'opacity-50 pointer-events-none' : ''}>
                                <NumericKeypad 
                                    onInput={handlePinInput}
                                    onDelete={() => { setIsError(false); setPin(prev => prev.slice(0, -1)); }}
                                    onClear={() => { setIsError(false); setPin(''); }}
                                    className="max-w-[300px] mx-auto"
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button 
                            onClick={() => setLoginMode('classic')}
                            className="w-full py-4 text-[10px] font-black text-slate-400 hover:text-indigo-500 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                        >
                            <Mail className="w-3.5 h-3.5" /> Login Via Email & Password
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleClassicSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={classicForm.data.email}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-slate-900 dark:text-white pl-11 pr-4 py-3.5 rounded-xl text-sm font-bold transition-all focus:ring-4 focus:ring-indigo-500/10"
                                autoComplete="username"
                                autoFocus
                                onChange={(e) => classicForm.setData('email', e.target.value)}
                                required
                            />
                        </div>
                        {classicForm.errors.email && <p className="mt-2 text-xs font-bold text-red-500 ml-1 italic">{classicForm.errors.email}</p>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                            {canResetPassword && (
                                <Link href={route('password.request')} className="text-[10px] font-black text-slate-600 uppercase hover:text-indigo-500 transition-colors">Lupa Password?</Link>
                            )}
                        </div>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={classicForm.data.password}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-slate-900 dark:text-white pl-11 pr-4 py-3.5 rounded-xl text-sm font-bold transition-all focus:ring-4 focus:ring-indigo-500/10"
                                autoComplete="current-password"
                                onChange={(e) => classicForm.setData('password', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2 space-y-4">
                        <button
                            type="submit"
                            disabled={classicForm.processing}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-xl shadow-indigo-500/10 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                        >
                            {classicForm.processing ? 'Mencoba Masuk...' : (
                                <>
                                    LOGIN SEKARANG <LogIn className="w-4 h-4 stroke-[3]" />
                                </>
                            )}
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => setLoginMode('pin')}
                            className="w-full py-4 text-[10px] font-black text-slate-400 hover:text-indigo-500 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                        >
                            <Keyboard className="w-3.5 h-3.5" /> Kembali Ke Login PIN
                        </button>
                    </div>
                </form>
            )}
        </GuestLayout>
    );
}
