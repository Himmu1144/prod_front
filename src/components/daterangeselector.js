import React, { useState, forwardRef, useImperativeHandle } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from 'lucide-react';

const DateRangeSelector = forwardRef(({ onDateRangeChange, dateField = 'created_at', onDateFieldChange }, ref) => {
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

  const displayText = startDate && endDate 
    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
    : "Select date range";

  const handleRadioChange = (value) => {
    if (dateField === value) {
      onDateFieldChange && onDateFieldChange('');
    } else {
      onDateFieldChange && onDateFieldChange(value);
    }
  };

  const CustomCalendarFooter = () => (
    <div className="p-2 border-t border-gray-200 mt-2 flex">
      <div className="flex items-center justify-center space-x-4">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name="dateField"
            value="created_at"
            checked={dateField === 'created_at'}
            onClick={() => handleRadioChange('created_at')}
            className="form-radio text-red-500 h-4 w-4"
          />
          <span className="ml-2 text-sm text-gray-700">Created Date</span>
        </label>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name="dateField"
            value="updated_at"
            checked={dateField === 'updated_at'}
            onClick={() => handleRadioChange('updated_at')}
            className="form-radio text-red-500 h-4 w-4"
          />
          <span className="ml-2 text-sm text-gray-700">Updated Date</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <style>
        {`
          .react-datepicker-popper {
            z-index: 50 !important;
            background-color: white !important;
          }
          .react-datepicker-wrapper {
            width: 100%;
          }
          .date-range-calendar-container {
            background-color: white !important;
          }
          .date-range-calendar {
            background-color: white !important;
          }
          .react-datepicker {
            background-color: white !important;
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
        calendarClassName="date-range-calendar"
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
        renderCustomHeader={({ monthDate, customHeaderCount, decreaseMonth, increaseMonth }) => (
          <div>
            <div className="flex justify-between items-center p-2">
              <button onClick={decreaseMonth} className="p-1 hover:bg-gray-100 rounded">
                {"<"}
              </button>
              <span className="text-center font-semibold">
                {monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={increaseMonth} className="p-1 hover:bg-gray-100 rounded">
                {">"}
              </button>
            </div>
          </div>
        )}
        calendarContainer={({ children }) => (
          <div className="date-range-calendar-container bg-white shadow-lg rounded-md border border-gray-200">
            {children}
            <CustomCalendarFooter />
          </div>
        )}
      />
    </div>
  );
});

export default DateRangeSelector;