import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log In" />

            <div className="mb-8">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Selamat Datang</h2>
                <p className="text-slate-500 dark:text-slate-500 text-xs font-bold uppercase mt-1">Silakan login ke akun Anda</p>
            </div>

            {status && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
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
                            value={data.email}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-slate-900 dark:text-white pl-11 pr-4 py-3.5 rounded-xl text-sm font-bold transition-all focus:ring-4 focus:ring-indigo-500/10"
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                    </div>
                    {errors.email && <p className="mt-2 text-xs font-bold text-red-500 ml-1 italic">{errors.email}</p>}
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
                            value={data.password}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-slate-900 dark:text-white pl-11 pr-4 py-3.5 rounded-xl text-sm font-bold transition-all focus:ring-4 focus:ring-indigo-500/10"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                    </div>
                    {errors.password && <p className="mt-2 text-xs font-bold text-red-500 ml-1 italic">{errors.password}</p>}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-xl shadow-indigo-500/10 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                    >
                        {processing ? 'Mencoba Masuk...' : (
                            <>
                                LOGIN SEKARANG <LogIn className="w-4 h-4 stroke-[3]" />
                            </>
                        )}
                    </button>
                    
                    <p className="mt-6 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        Hubungi Administrator untuk mendapatkan akses akun
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
