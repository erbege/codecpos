import React, { useState } from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'right' | 'left' | 'top' | 'bottom';
    enabled?: boolean;
}

export default function Tooltip({ text, children, position = 'right', enabled = true }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    if (!enabled) return <>{children}</>;

    const positionClasses = {
        right: 'left-full ml-3 top-1/2 -translate-y-1/2',
        left: 'right-full mr-3 top-1/2 -translate-y-1/2',
        top: 'bottom-full mb-3 left-1/2 -translate-x-1/2',
        bottom: 'top-full mt-3 left-1/2 -translate-x-1/2',
    };

    const arrowPositionClasses = {
        right: '-left-1 top-1/2 -translate-y-1/2 border-r-indigo-900 dark:border-r-indigo-800',
        left: '-right-1 top-1/2 -translate-y-1/2 border-l-indigo-900 dark:border-l-indigo-800',
        top: '-bottom-1 left-1/2 -translate-x-1/2 border-t-indigo-900 dark:border-t-indigo-800',
        bottom: '-top-1 left-1/2 -translate-x-1/2 border-b-indigo-900 dark:border-b-indigo-800',
    };

    return (
        <div 
            className="relative flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className={`absolute z-[100] px-3 py-1.5 rounded-lg bg-indigo-950 dark:bg-indigo-900 text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl pointer-events-none animate-in fade-in zoom-in duration-200 ${positionClasses[position]}`}>
                    {text}
                    <div className={`absolute w-2 h-2 border-4 border-transparent ${arrowPositionClasses[position]}`} />
                </div>
            )}
        </div>
    );
}
