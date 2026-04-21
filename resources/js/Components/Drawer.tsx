import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, PropsWithChildren } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
    show: boolean;
    onClose: () => void;
    title?: string;
    width?: string;
}

export default function Drawer({ show, onClose, title, width = 'max-w-md', children }: PropsWithChildren<DrawerProps>) {
    return (
        <Transition show={show} as={Fragment}>
            <Dialog as="div" className="relative z-[150]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <TransitionChild
                                as={Fragment}
                                enter="transform transition ease-out duration-200"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in duration-150"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <DialogPanel className={`pointer-events-auto w-screen ${width}`}>
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800">
                                        <div className="px-4 py-2 sm:px-6 border-b border-slate-200 dark:border-slate-800">
                                            <div className="flex items-start justify-between">
                                                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                                    {title}
                                                </h2>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative rounded-md text-slate-400 hover:text-slate-500 focus:outline-none transition-colors"
                                                        onClick={onClose}
                                                    >
                                                        <span className="absolute -inset-2.5" />
                                                        <span className="sr-only">Close panel</span>
                                                        <X className="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative flex-1 p-0">
                                            {children}
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
