// SelectField.tsx
import React from 'react';
import { Controller } from 'react-hook-form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface SelectFieldProps {
  name: string;
  label: string;
  control: any;
  options: { value: string; label: string }[];
}

const SelectField: React.FC<SelectFieldProps> = ({ name, label, control, options }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <div className="grid grid-cols-3 items-center gap-4">
            <FormLabel className="col-span-1">{label}</FormLabel>
            <div className="col-span-2 flex flex-col gap-2">
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </div>
          </div>
        </FormItem>
      )}
    />
  );
};

export default SelectField;
