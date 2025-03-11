import { Toaster, toast } from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const ToasterConfig = () => {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      containerStyle={{
        margin: '8px'
      }}
      toastOptions={{
        duration: 4000,
        className: 'font-medium group relative',
        style: {
          background: '#fff',
          color: '#333',
          padding: '16px 32px 16px 16px',
          borderRadius: '12px',
          border: '2px solid #64748b',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          cursor: 'pointer',
        },
        onClick: () => toast.dismiss(),
        icon: (
          <div className="absolute right-2 top-2 p-1 hover:bg-black/10 rounded-full cursor-pointer">
            <XCircleIcon 
              className="w-5 h-5 text-current"
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss();
              }} 
            />
          </div>
        ),

        success: {
          style: {
            background: '#16a34a',
            border: '2px solid #15803d',
            color: '#ffffff',
          },
          icon: (
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6" />
              <div className="absolute right-2 top-2 p-2 hover:bg-white/10 rounded-full cursor-pointer">
                <XCircleIcon 
                  className="w-8 h-8 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss();
                  }} 
                />
              </div>
            </div>
          ),
        },
        
        error: {
          style: {
            background: '#dc2626',
            border: '2px solid #b91c1c',
            color: '#ffffff',
          },
          icon: <XCircleIcon className="w-6 h-6" />,
        },

        loading: {
          style: {
            background: '#2563eb',
            border: '2px solid #1d4ed8',
            color: '#ffffff',
          },
          icon: <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"/>,
        },

        custom: {
          style: {
            background: '#9333ea',
            border: '2px solid #7e22ce',
            color: '#ffffff',
          },
          icon: <ExclamationCircleIcon className="w-6 h-6" />,
        },
      }}
    />
  );
};

export default ToasterConfig; 