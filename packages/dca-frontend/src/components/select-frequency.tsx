import React from 'react';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const FREQUENCIES = [
  {
    label: 'Daily',
    value: '1 day',
  },
  {
    label: 'Weekly',
    value: '1 week',
  },
  {
    label: 'Monthly',
    value: '1 month',
  },
];

export interface FrequencySelectProps {
  disabled?: boolean;
  onChange?: (value: string) => void;
  required?: boolean;
  value?: string;
}

export const SelectFrequency: React.FC<FrequencySelectProps> = ({
  disabled,
  onChange,
  value,
  required,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Label
        htmlFor="frequency"
        className="text-sm font-medium"
        style={{
          fontFamily: 'Poppins, system-ui, sans-serif',
          color: 'var(--footer-text-color, #121212)',
        }}
      >
        Frequency
      </Label>
      <Select required={required} value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id="frequency"
          className="w-full h-10"
          style={{
            fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
          }}
        >
          <SelectValue placeholder="Select frequency" />
        </SelectTrigger>
        <SelectContent>
          {FREQUENCIES.map((frequency) => (
            <SelectItem
              key={frequency.value}
              value={frequency.value}
              style={{
                fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
              }}
            >
              {frequency.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
