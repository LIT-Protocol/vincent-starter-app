import { Input } from '@/components/ui/input';
import React from 'react';

import { Label } from '@/components/ui/label';

export const DEFAULT_VALUE = '1.00';

export interface FrequencySelectProps {
  disabled?: boolean;
  onChange?: (value: string) => void;
  required?: boolean;
  value?: string;
}

export const InputAmount: React.FC<FrequencySelectProps> = ({
  disabled,
  onChange,
  value,
  required,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Label
        htmlFor="dcaAmount"
        className="text-sm font-medium"
        style={{
          fontFamily: 'Poppins, system-ui, sans-serif',
          color: 'var(--footer-text-color, #121212)',
        }}
      >
        DCA Amount
      </Label>
      <div className="flex flex-row items-center gap-2">
        <Input
          id="dcaAmount"
          required={required}
          className="h-10"
          type="number"
          step="0.01"
          min="0"
          placeholder="1.00"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          style={{
            fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
          }}
        />
        <span
          className="text-sm font-medium whitespace-nowrap"
          style={{
            fontFamily: 'Poppins, system-ui, sans-serif',
            color: 'var(--footer-text-color, #121212)',
          }}
        >
          USD
        </span>
      </div>
    </div>
  );
};
