import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import NumericKeypad from './NumericKeypad';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { ArrowLeft, ShieldCheck, User, X } from 'lucide-react';

interface UserSelect {
    id: number;
    name: string;
    email: string;
}

interface SwitchUserModalProps {
    show: boolean;
    onClose: () => void;
    users: UserSelect[];
}

export default function SwitchUserModal({ show, onClose, users }: SwitchUserModalProps) {
    const [selectedUser, setSelectedUser] = useState<UserSelect | null>(null);
    const [pin, setPin] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (!show) {
            setSelectedUser(null);
            setPin('');
            setIsError(false);
        }
    }, [show]);

    const handlePinInput = (digit: string) => {
        if (pin.length < 6 && !isProcessing) {
            setIsError(false);
            const newPin = pin + digit;
            setPin(newPin);
            if (newPin.length === 6 && selectedUser) {
                submitSwitch(selectedUser.id, newPin);
            }
        }
    };

    const submitSwitch = (userId: number, finalPin: string) => {
        setIsProcessing(true);
        router.post(route('switch-user'), {
            user_id: userId,
            pin: finalPin,
            remember: true
        }, {
            onSuccess: () => {
                setIsProcessing(false);
                toast.success('Berhasil mengganti kasir.');
                onClose();
            },
            onError: (errors) => {
                setIsProcessing(false);
                setIsError(true);
                setPin('');
                toast.error(errors.email || 'PIN yang Anda masukkan salah.');
                setTimeout(() => setIsError(false), 500);
            },
            onFinish: () => {
                setIsProcessing(false);
            }
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex items-center justify-between mb-8 overflow-hidden">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {selectedUser ? 'Konfirmasi PIN' : 'Ganti Kasir'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-500 text-[10px] font-bold uppercase mt-1">
                            {selectedUser 
                                ? `Masukkan PIN untuk ${selectedUser.name}` 
                                : 'Pilih akun kasir pengganti'}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center justify-center"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!selectedUser ? (
                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-1">
                                Pilih Operator
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <select
                                    onChange={(e) => {
                                        const user = users.find(u => u.id === parseInt(e.target.value));
                                        if (user) setSelectedUser(user);
                                    }}
                                    defaultValue=""
                                    className="w-full pl-12 pr-10 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Pilih nama kasir...</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100/50 dark:border-amber-500/20 rounded-2xl p-4 flex gap-3 items-start animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                <ShieldCheck className="w-4 h-4 text-amber-500" />
                            </div>
                            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed uppercase tracking-tight">
                                Pilih akun Anda dari daftar di atas untuk melanjutkan verifikasi PIN keamanan.
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
                                            w-3.5 h-3.5 rounded-full transition-all duration-300 border-2
                                            ${pin.length > i 
                                                ? 'bg-indigo-500 border-indigo-600 scale-125 shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}
                                        `} 
                                    />
                                ))}
                            </div>
                            
                            <div className="flex flex-col items-center gap-3">
                                {isProcessing ? (
                                    <div className="flex items-center gap-2 text-indigo-500 font-bold uppercase tracking-widest text-[9px] animate-pulse">
                                        <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        Memverifikasi...
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => { setSelectedUser(null); setPin(''); setIsError(false); }}
                                        className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 hover:text-indigo-500 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                    >
                                        <ArrowLeft className="w-3 h-3" /> Ganti Akun
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={isProcessing ? 'opacity-50 pointer-events-none grayscale' : ''}>
                            <NumericKeypad 
                                onInput={handlePinInput}
                                onDelete={() => { setIsError(false); setPin(prev => prev.slice(0, -1)); }}
                                onClear={() => { setIsError(false); setPin(''); }}
                                className="max-w-[280px] mx-auto"
                            />
                        </div>
                    </div>
                )}
                
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                        Perhatian: Melakukan perpindahan kasir akan mengakhiri sesi kasir saat ini sepenuhnya demi keamanan data.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
