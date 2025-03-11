import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import { fr } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  startDate?: Date | null;
  endDate?: Date | null;
  minDate?: Date;
  isStart?: boolean;
  filterDate?: (date: Date) => boolean;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onChange,
  startDate,
  endDate,
  minDate,
  isStart,
  filterDate
}) => {
  const datePickerCustomStyles = {
    input: "w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
    calendar: "!font-sans !text-base !border-0 !shadow-none !rounded-2xl !p-6 !bg-white !w-full max-w-[700px]", // Set max-width to 700px
    dayButton: "!w-[30px] !h-[30px] !mx-0.5 hover:!bg-gray-50 rounded-lg", // Set fixed width/height to 30px
    selectedDay: "!bg-indigo-500 !text-white hover:!bg-indigo-600",
    currentMonth: "!text-lg !font-semibold !mb-4",
    navigationButton: "!p-2 hover:!bg-gray-100 !rounded-full",
    weekday: "!w-[30px] !text-center", // Match day width for weekday headers
    month: "!mx-auto", // Center month in the available space
  };

  // Add custom styles to override the default DatePicker styles
  const customStyles = `
    .react-datepicker {
      width: 100%;
      max-width: 700px;
    }
    .react-datepicker__month-container {
      width: 100%;
    }
    .react-datepicker__month {
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .react-datepicker__week {
      display: flex;
      justify-content: center;
      width: 100%;
    }
    .react-datepicker__day {
      width: 30px !important;
      height: 30px !important;
      line-height: 30px !important;
      margin: 2px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .react-datepicker__day-name {
      width: 30px;
      margin: 2px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `;

  const renderDayContents = (day: number, date: Date) => {
    const isReserved = filterDate ? !filterDate(date) : false;
    
    return (
      <div className={`
        relative flex items-center justify-center w-[30px] h-[30px] rounded-lg
        transition-all duration-200 group text-base
        ${isReserved 
          ? 'bg-red-50 text-gray-400 cursor-not-allowed' 
          : 'hover:bg-indigo-50 cursor-pointer'
        }
      `}>
        <span className={isReserved ? 'line-through' : ''}>{day}</span>
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1.5 
          bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 
          transition-opacity whitespace-nowrap pointer-events-none z-50">
          {isReserved ? 'Réservé' : 'Disponible'}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{customStyles}</style>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-[700px] transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <Dialog.Title as="h3" className="text-2xl font-semibold text-gray-900">
                      {isStart ? 'Date de début' : 'Date de fin'}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <DatePicker
                      selected={selectedDate}
                      onChange={onChange}
                      selectsStart={isStart}
                      selectsEnd={!isStart}
                      startDate={startDate}
                      endDate={endDate}
                      minDate={minDate || new Date()}
                      dateFormat="dd/MM/yyyy"
                      locale={fr}
                      inline
                      renderDayContents={renderDayContents}
                      filterDate={filterDate}
                      calendarClassName={datePickerCustomStyles.calendar}
                    />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default DatePickerModal;