import React, { useState, useEffect } from 'react';

interface TimePickerWrapperProps {
  value?: string; // Time in "HH:mm" format
  onChange: (value: string) => void; // Callback for time change
  placeholder?: string;
  format?: string; // Optional format prop to customize the time format
}

const TimePickerWrapper: React.FC<TimePickerWrapperProps> = ({ value = '00:00', onChange, placeholder = 'HH:mm', format = 'HH:mm' }) => {
  const [time, setTime] = useState<string>(value);

  useEffect(() => {
    if (validateTime(value)) {
      setTime(value);
    }
  }, [value]);

  const validateTime = (time: string) => {
    // Check if time is in "HH:mm" format
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
  };

  const handleTimeChange = (type: 'hours' | 'minutes', value: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const newTime = type === 'hours'
      ? `${value.padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      : `${String(hours).padStart(2, '0')}:${value.padStart(2, '0')}`;
    setTime(newTime);
    onChange(newTime);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        <select
          value={time.split(':')[0]}
          onChange={(e) => handleTimeChange('hours', e.target.value)}
          className="w-16 text-center rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={String(i).padStart(2, '0')}>
              {String(i).padStart(2, '0')}
            </option>
          ))}
        </select>
        <span className="text-xl">:</span>
        <select
          value={time.split(':')[1]}
          onChange={(e) => handleTimeChange('minutes', e.target.value)}
          className="w-16 text-center rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {Array.from({ length: 60 }, (_, i) => (
            <option key={i} value={String(i).padStart(2, '0')}>
              {String(i).padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TimePickerWrapper;
