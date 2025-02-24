import React, { useState, forwardRef, useImperativeHandle } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from 'lucide-react';

const DateRangeSelector = forwardRef(({ onDateRangeChange }, ref) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  useImperativeHandle(ref, () => ({
    reset: () => {
      setDateRange([null, null]);
      onDateRangeChange({ startDate: null, endDate: null });
    }
  }));

  const handleDateChange = (update) => {
    setDateRange(update);
    
    if (update[0] && update[1]) {
      onDateRangeChange({
        startDate: update[0].toISOString().split('T')[0],
        endDate: update[1].toISOString().split('T')[0]
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Generate display text for the input
  const displayText = startDate && endDate 
    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
    : "Select date range";

  return (
    <div className="relative">
      <style>
        {`
          .react-datepicker-popper {
            z-index: 50 !important;
          }
          .react-datepicker-wrapper {
            width: 100%;
          }
        `}
      </style>
      <DatePicker
        selectsRange={true}
        startDate={startDate}
        endDate={endDate}
        onChange={handleDateChange}
        isClearable={true}
        className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
        customInput={
          <div className="flex items-center w-full cursor-pointer">
            <Calendar className="h-4 w-4 text-gray-500 mr-2 shrink-0" />
            <input 
              value={displayText}
              readOnly
              className="w-full outline-none cursor-pointer"
              placeholder="Select date range"
            />
          </div>
        }
      />
    </div>
  );
});

export default DateRangeSelector;
