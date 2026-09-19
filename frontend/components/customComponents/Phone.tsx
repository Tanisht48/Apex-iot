
import "react-phone-number-input/style.css";
import * as RPNInput from "react-phone-number-input";
import { forwardRef, useCallback } from "react";
import { Control, FieldValues, Path } from "react-hook-form";

import flags from "react-phone-number-input/flags";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface PhoneProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  control: Control<TFormValues> | undefined;
  label: string;
  placeholder: string;
  disabled?: boolean; // Add disabled prop here
}
// #region PhoneInput Component
const PhoneInput = <TFormValues extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  disabled = false, // Default value to false
}: PhoneProps<TFormValues>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {/* <FormLabel className="text-kblack-text text-[16px]" htmlFor={name}>
            {label}
          </FormLabel> */}
          <FormControl>
            <RPNInput.default
              defaultCountry="IN"
              className={cn("flex")}
              flagComponent={FlagComponent}
              countrySelectComponent={CountrySelect}
              inputComponent={InputComponent}
              placeholder={placeholder}
              {...field}
              disabled={disabled} // Pass the disabled prop here
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export { PhoneInput };
// #endregion PhoneInput Component

// #region FlagComponent
const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm ">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};
FlagComponent.displayName = "FlagComponent";
// #endregion FlagComponent

// #region CountrySelect
type CountrySelectOption = { label: string; value: RPNInput.Country };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: CountrySelectOption[];
};

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const handleSelect = useCallback(
    (country: RPNInput.Country) => {
      onChange(country);
    },
    [onChange]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          className={cn("flex gap-1 rounded-e-none rounded-s px-3")} // Set height to 2.35rem
          style={{ backgroundColor: 'hsl(336, 10%, 10%, 1)' }}
          disabled={disabled}
        >
          <FlagComponent country={value} countryName={value} />
          <ChevronsUpDown
            className={cn(
              "-mr-2 h-4 w-4 opacity-50",
              disabled ? "hidden" : "opacity-100"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandList>
            <ScrollArea className="h-72">
              <CommandInput placeholder="Search country..." />
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {options
                  .filter((x) => x.value)
                  .map((option) => (
                    <CommandItem
                      className="gap-2"
                      key={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <FlagComponent
                        country={option.value}
                        countryName={option.label}
                      />
                      <span className="flex-1 text-sm">{option.label}</span>
                      {option.value && (
                        <span className="text-foreground/50 text-sm">
                          {`+${RPNInput.getCountryCallingCode(option.value)}`}
                        </span>
                      )}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          option.value === value ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
// #endregion CountrySelect

// #region InputComponent
const InputComponent = forwardRef<HTMLInputElement, ExtendedInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const phoneNumber = e.target.value;

      // Sanitize the input by removing any non-numeric and non-plus characters
      const sanitizedValue = phoneNumber.replace(/[^+\d]/g, '');

      // Truncate the sanitized value to a maximum length of 14
      const truncatedValue = sanitizedValue.length > 14 ? sanitizedValue.slice(0, 14) : sanitizedValue;

      // Call the original onChange handler with the sanitized and truncated value
      if (onChange) {
        onChange({
          ...e,
          target: {
            ...e.target,
            value: truncatedValue, // Pass the truncated value to onChange
          },
        });
      }
    };

    return (
      <>
      <style jsx global>{`
        input:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px hsl(336, 10%, 10%) inset !important;
        -webkit-text-fill-color: white !important;
}
        input:-moz-autofill {
          background-color: hsl(336, 10%, 10%, 1) !important;
          color: white !important;
        }
        input:-ms-input-placeholder {
          background-color: hsl(336, 10%, 10%, 1) !important;
          color: white !important;
        }
      `}</style>
      <input
        name={props.name}
        value={value}
        onChange={handleChange}
        className={cn(
          "outline-none w-full px-3 py-2 text-1xl text-white",
          "rounded-r",
          "min-h-[40px] max-h-[50px]",
       
        )}
        style={{ backgroundColor: 'hsl(336, 10%, 10%, 1) !important'  }}
        placeholder="Phone number"
        ref={ref}
        {...props} // Spread other props here
      />
      </>
    );
  }
);


InputComponent.displayName = "InputComponent";

interface ExtendedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  defaultCountry?: string; // Optional, but can be used if needed for other validations
}
// #endregion InputComponent