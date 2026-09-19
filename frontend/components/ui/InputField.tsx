import React from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { PhoneInput } from '@/components/customComponents/Phone';
import { InputType } from './InputType'; // Import the InputType enum
import TimePickerWrapper from './TimePicker';

interface InputFieldProps {
  name: string;
  label: string;
  placeholder: string;
  control: any;
  rules?: object;
  inputType: InputType; // Add inputType to the props
  readonly?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ name, label, placeholder, control, rules, inputType , readonly }) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <FormItem>
          <div className="grid grid-cols-3 items-center gap-4">
            <FormLabel className="col-span-1">{label}</FormLabel>
            <div className="col-span-2 flex flex-col gap-2">
              <FormControl>
                {inputType === InputType.PHONE ? (
                  // Render PhoneInput if inputType is PHONE
                  <PhoneInput {...(field as any)} />
                ) : inputType === InputType.TIME ? (
                  // Render TimePicker if inputType is TIME
                  <TimePickerWrapper
                  value={field.value || '00:00'}
                  onChange={(value) => field.onChange(value)}
                  placeholder={placeholder}
                />
                ) : (
                  // Render regular Input for other types
                  <Input placeholder={placeholder} {...field} readOnly={readonly}/>
                )}
              </FormControl>
              <FormMessage />
            </div>
          </div>
        </FormItem>
      )}
    />
  );
};

export default InputField;

