import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="mb-8">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Buat Akun Baru</h2>
                <p className="text-slate-500 dark:text-slate-500 text-xs font-bold uppercase mt-1">Daftar untuk mulai menggunakan POS</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                            <User className="w-4 h-4" />
                        </div>
                        <input
                            id="name"
                            name="name"
                            value={data.name}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-slate-900 dark:text-white pl-11 pr-4 py-3 rounded-xl text-sm font-bold transition-all focus:ring-4 focus:ring-indigo-500/10"
                            autoComplete="name"
                            autoFocus
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                    </div>
                    {errors.name && <p className="mt-1 text-[10px] font-bold text-red-500 ml-1 italic">{errors.name}</p>}
                </div>

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
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-slate-900 dark:text-white pl-11 pr-4 py-3 rounded-xl text-sm font-bold transition-all focus:ring-4 focus:ring-indigo-500/10"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                    </div>
                    {errors.email && <p className="mt-1 text-[10px] font-bold text-red-500 ml-1 italic">{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                            <Lock className="w-4 h-4" />
                        </div>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-slate-900 dark:text-white pl-11 pr-4 py-3 rounded-xl text-sm font-bold transition-all focus:ring-4 focus:ring-indigo-500/10"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                    </div>
                    {errors.password && <p className="mt-1 text-[10px] font-bold text-red-500 ml-1 italic">{errors.password}</p>}
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                            <Lock className="w-4 h-4" />
                        </div>
                        <input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-slate-900 dark:text-white pl-11 pr-4 py-3 rounded-xl text-sm font-bold transition-all focus:ring-4 focus:ring-indigo-500/10"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="pt-4 space-y-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-xl shadow-indigo-500/10 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                    >
                        {processing ? 'Mendaftarkan...' : (
                            <>
                                DAFTAR SEKARANG <UserPlus className="w-4 h-4 stroke-[3]" />
                            </>
                        )}
                    </button>
                    
                    <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        Sudah punya akun? <Link href="/login" className="text-indigo-500 hover:text-indigo-400">Login di sini</Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
