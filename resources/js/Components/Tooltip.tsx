import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'right' | 'left' | 'top' | 'bottom';
    enabled?: boolean;
}

export default function Tooltip({ text, children, position = 'right', enabled = true }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            let top = 0;
            let left = 0;

            const offset = 12; // Gap between trigger and tooltip

            if (position === 'right') {
                top = rect.top + rect.height / 2;
                left = rect.right + offset;
            } else if (position === 'left') {
                top = rect.top + rect.height / 2;
                left = rect.left - offset;
            } else if (position === 'top') {
                top = rect.top - offset;
                left = rect.left + rect.width / 2;
            } else if (position === 'bottom') {
                top = rect.bottom + offset;
                left = rect.left + rect.width / 2;
            }

            setCoords({ top, left });
        }
    };

    useEffect(() => {
        if (isVisible) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isVisible, position]);

    if (!enabled) return <>{children}</>;

    const positionStyles = {
        right: 'translate-y-[-50%]',
        left: 'translate-x-[-100%] translate-y-[-50%]',
        top: 'translate-x-[-50%] translate-y-[-100%]',
        bottom: 'translate-x-[-50%]',
    };

    const arrowPositionClasses = {
        right: '-left-1 top-1/2 -translate-y-1/2 border-r-indigo-900 dark:border-r-indigo-800',
        left: '-right-1 top-1/2 -translate-y-1/2 border-l-indigo-900 dark:border-l-indigo-800',
        top: '-bottom-1 left-1/2 -translate-x-1/2 border-t-indigo-900 dark:border-t-indigo-800',
        bottom: '-top-1 left-1/2 -translate-x-1/2 border-b-indigo-900 dark:border-b-indigo-800',
    };

    return (
        <div 
            ref={triggerRef}
            className="inline-flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div 
                    style={{ 
                        left: `${coords.left}px`, 
                        top: `${coords.top}px`,
                        position: 'fixed'
                    }}
                    className={`z-[9999] px-3 py-1.5 rounded-lg bg-indigo-950 dark:bg-indigo-900 text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-2xl pointer-events-none transition-all duration-200 transform ${positionStyles[position]}`}
                >
                    {text}
                    <div className={`absolute w-2 h-2 border-4 border-transparent ${arrowPositionClasses[position]}`} />
                </div>
            )}
        </div>
    );
}
