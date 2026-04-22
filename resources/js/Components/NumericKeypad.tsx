import React from 'react';
import { Delete, X } from 'lucide-react';

interface NumericKeypadProps {
    onInput: (value: string) => void;
    onDelete: () => void;
    onClear: () => void;
    className?: string;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({ onInput, onDelete, onClear, className = '' }) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'];

    return (
        <div className={`grid grid-cols-3 gap-3 ${className}`}>
            {keys.map((key) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => {
                        if (key === 'C') onClear();
                        else if (key === 'DEL') onDelete();
                        else onInput(key);
                    }}
                    className={`
                        h-16 rounded-2xl flex items-center justify-center text-xl font-black transition-all 
                        active:scale-90 active:opacity-70 duration-75 select-none
                        ${key === 'C' 
                            ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500 border border-rose-100 dark:border-rose-500/20' 
                            : key === 'DEL' 
                                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500 border border-amber-100 dark:border-amber-500/20' 
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm active:bg-indigo-50 dark:active:bg-indigo-500/10 active:text-indigo-600'}
                    `}
                >
                    {key === 'DEL' ? <Delete className="w-5 h-5" /> : key === 'C' ? <X className="w-5 h-5" /> : key}
                </button>
            ))}
        </div>
    );
};

export default NumericKeypad;
