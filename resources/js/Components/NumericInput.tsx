import React, { InputHTMLAttributes, useEffect, useState, forwardRef } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: string | number;
    onChange: (value: string) => void;
    className?: string;
}

const NumericInput = forwardRef<HTMLInputElement, Props>(({ value, onChange, className = '', ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    const formatNumber = (val: string | number) => {
        if (val === null || val === undefined || val === '') return '';
        // Remove everything except numbers
        const numStr = val.toString().replace(/\D/g, '');
        if (numStr === '') return '';
        
        return new Intl.NumberFormat('id-ID').format(Number(numStr));
    };

    useEffect(() => {
        setDisplayValue(formatNumber(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow numbers
        const rawValue = e.target.value.replace(/\D/g, '');
        onChange(rawValue);
    };

    return (
        <input
            {...props}
            ref={ref}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            className={className}
        />
    );
});

NumericInput.displayName = 'NumericInput';

export default NumericInput;
