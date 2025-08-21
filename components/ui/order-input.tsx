'use client';

import { useState, useEffect } from 'react';

interface OrderInputProps {
  value?: number | null;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  existingOrders?: number[];
  min?: number;
  max?: number;
  label?: string;
  error?: string;
}

export function OrderInput({
  value,
  onChange,
  onBlur,
  placeholder = 'Enter order...',
  disabled = false,
  className,
  existingOrders = [],
  min = 1,
  max = 999,
  label,
  error,
}: OrderInputProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);

  // Initialize input value when value prop changes
  useEffect(() => {
    setInputValue(value?.toString() || '');
  }, [value]);

  // Validate input value
  const validateInput = (input: string): boolean => {
    if (!input.trim()) return true; // Empty is valid (will be null)

    const num = parseInt(input);
    if (isNaN(num)) return false;
    if (num < min || num > max) return false;
    if (existingOrders.includes(num)) return false;

    return true;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const valid = validateInput(newValue);
    setIsValid(valid);

    if (valid && newValue.trim()) {
      const num = parseInt(newValue);
      onChange(num);
    } else if (valid && !newValue.trim()) {
      onChange(null);
    }
  };

  // Handle increment
  const handleIncrement = () => {
    const currentValue = value || 0;
    let newValue = currentValue + 1;

    // Find next available order
    while (existingOrders.includes(newValue) && newValue <= max) {
      newValue++;
    }

    if (newValue <= max) {
      setInputValue(newValue.toString());
      setIsValid(true);
      onChange(newValue);
    }
  };

  // Handle decrement
  const handleDecrement = () => {
    const currentValue = value || 1;
    let newValue = currentValue - 1;

    // Find previous available order
    while (existingOrders.includes(newValue) && newValue >= min) {
      newValue--;
    }

    if (newValue >= min) {
      setInputValue(newValue.toString());
      setIsValid(true);
      onChange(newValue);
    }
  };

  // Handle blur
  const handleBlur = () => {
    if (!inputValue.trim()) {
      onChange(null);
    }
    onBlur?.();
  };

  // Check if increment is disabled
  const isIncrementDisabled =
    disabled || value === max || (value && existingOrders.includes(value + 1) && value + 1 > max) || false;

  // Check if decrement is disabled
  const isDecrementDisabled =
    disabled || value === min || (value && existingOrders.includes(value - 1) && value - 1 < min) || false;

  return (
    <div className={className}>
      {label && <label className='text-sm text-gray-700 mb-2 block'>{label}</label>}

      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={handleDecrement}
          disabled={isDecrementDisabled}
          className='w-8 h-10 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:text-gray-900 transition-colors'
        >
          −
        </button>

        <div className='flex-1'>
          <input
            type='number'
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            className={`w-full px-3 py-2 border focus:outline-none bg-white text-center text-gray-900 ${
              !isValid || error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-400'
            }`}
          />
        </div>

        <button
          type='button'
          onClick={handleIncrement}
          disabled={isIncrementDisabled}
          className='w-8 h-10 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:text-gray-900 transition-colors'
        >
          +
        </button>
      </div>

      <div className='mt-2 space-y-1'>
        {existingOrders.length > 0 && (
          <p className='text-xs text-gray-500'>Existing orders: {existingOrders.sort((a, b) => a - b).join(', ')}</p>
        )}

        {error && <p className='text-sm text-red-600'>{error}</p>}

        {!error && !isValid && inputValue.trim() && (
          <p className='text-sm text-red-600'>
            {(() => {
              const num = parseInt(inputValue);
              if (isNaN(num)) return 'Please enter a valid number';
              if (num < min) return `Order must be at least ${min}`;
              if (num > max) return `Order must be at most ${max}`;
              if (existingOrders.includes(num)) return 'This order is already taken';
              return 'Invalid order value';
            })()}
          </p>
        )}
      </div>
    </div>
  );
}
