import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface CompleteMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, mileage?: number) => void;
  defaultDate: string;
  defaultMileage?: number;
}

const CompleteMaintenanceModal: React.FC<CompleteMaintenanceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  defaultDate,
  defaultMileage
}) => {
  const [date, setDate] = useState(defaultDate);
  const [mileage, setMileage] = useState(defaultMileage ? defaultMileage.toString() : '');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!date) {
      setError('Veuillez remplir la date.');
      return;
    }
    if (mileage && isNaN(Number(mileage))) {
      setError('Le kilométrage doit être un nombre.');
      return;
    }
    setError('');
    onConfirm(date, mileage ? Number(mileage) : undefined);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 mb-4">
                  Marquer la maintenance comme réalisée
                </Dialog.Title>
                <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 rounded">
                  <strong>Important :</strong> Veuillez saisir la date de réalisation et le kilométrage exact auquel cette maintenance a été effectuée. Ces informations sont essentielles pour le suivi et le calcul des prochaines maintenances.
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de réalisation</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage <span className="text-gray-400 font-normal">(optionnel)</span></label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={mileage}
                    onChange={e => setMileage(e.target.value)}
                    min={0}
                  />
                </div>
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    onClick={onClose}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow"
                    onClick={handleConfirm}
                  >
                    Confirmer
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CompleteMaintenanceModal; 