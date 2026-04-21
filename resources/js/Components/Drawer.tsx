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
                        <div className="pointer-events-none fixed inset-0 flex items-end justify-center lg:inset-y-0 lg:right-0 lg:items-stretch lg:justify-end">
                            <TransitionChild
                                as={Fragment}
                                enter="transform transition ease-out duration-300 lg:duration-200"
                                enterFrom="translate-y-full lg:translate-y-0 lg:translate-x-full"
                                enterTo="translate-y-0 lg:translate-x-0"
                                leave="transform transition ease-in duration-200 lg:duration-150"
                                leaveFrom="translate-y-0 lg:translate-x-0"
                                leaveTo="translate-y-full lg:translate-y-0 lg:translate-x-full"
                            >
                                <DialogPanel className={`pointer-events-auto w-full lg:w-screen ${width} max-h-[95vh] lg:max-h-none`}>
                                    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-slate-900 shadow-2xl rounded-t-[2.5rem] lg:rounded-t-none lg:rounded-l-2xl border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800">
                                        {/* Mobile Handle */}
                                        <div className="flex lg:hidden justify-center pt-3 pb-1">
                                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                        </div>

                                        <div className="px-4 py-3 sm:px-6 border-b border-slate-200 dark:border-slate-800">
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
                                        <div className="relative flex-1 overflow-y-auto pb-20 lg:pb-0">
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
