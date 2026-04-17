import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export default function GlobalDialog() {
    const { dialog, closeDialog } = useAppStore();

    const Icon = {
        danger: AlertCircle,
        info: Info,
        success: CheckCircle2,
        warning: AlertTriangle,
    }[dialog.type || 'info'];

    const colors = {
        danger: 'bg-red-500 shadow-red-500/20 text-white',
        info: 'bg-indigo-500 shadow-indigo-500/20 text-white',
        success: 'bg-emerald-500 shadow-emerald-500/20 text-white',
        warning: 'bg-amber-500 shadow-amber-500/20 text-white',
    }[dialog.type || 'info'];

    const handleConfirm = () => {
        if (dialog.onConfirm) dialog.onConfirm();
        closeDialog();
    };

    const handleCancel = () => {
        if (dialog.onCancel) dialog.onCancel();
        closeDialog();
    };

    return (
        <Transition show={dialog.show} as={Fragment}>
            <Dialog as="div" className="relative z-[200]" onClose={closeDialog}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" />
                </TransitionChild>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <DialogPanel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6 border border-slate-200 dark:border-slate-800">
                                <div className="sm:flex sm:items-start">
                                    <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl shadow-lg ${colors} sm:mx-0 sm:h-10 sm:w-10 transition-colors`}>
                                        <Icon className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest leading-6">
                                            {dialog.title}
                                        </h3>
                                        <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                            {dialog.message}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 sm:mt-8 sm:flex sm:flex-row-reverse gap-2">
                                    <button
                                        type="button"
                                        className={`inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all sm:w-auto shadow-lg active:scale-95
                                            ${dialog.type === 'danger' 
                                                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20' 
                                                : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/20'}`}
                                        onClick={handleConfirm}
                                    >
                                        {dialog.confirmLabel}
                                    </button>
                                    {dialog.onConfirm && (
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-xl bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-black text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all sm:mt-0 sm:w-auto uppercase tracking-widest active:scale-95"
                                            onClick={handleCancel}
                                        >
                                            {dialog.cancelLabel}
                                        </button>
                                    )}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
