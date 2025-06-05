import React, { useState } from 'react';
import { useWhatsApp } from '../../contexts/WhatsAppContext';
import { ArrowPathIcon, PhoneIcon, PaperAirplaneIcon, QrCodeIcon, SignalIcon, SignalSlashIcon } from '@heroicons/react/24/outline';
import { QRCodeSVG } from 'qrcode.react';
import WhatsAppConversations from '../../components/WhatsAppConversations';
import WorkflowList from '../../components/workflows/WorkflowList';

const WhatsAppPage: React.FC = () => {
  const { status, logs = [], isLoading, refreshStatus, refreshLogs, disconnect, sendMessage } = useWhatsApp();
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number || !message) return;
    await sendMessage(number, message);
    setMessage('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Manager</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshStatus}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Refresh
            </button>
            {status?.connected && (
              <button
                onClick={disconnect}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <SignalSlashIcon className="w-5 h-5" />
                Disconnect
              </button>
            )}
          </div>
        </div>
        
        <nav className="flex space-x-8 mt-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('conversations')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'conversations' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Conversations
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'logs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Logs
          </button>
          <button
            onClick={() => setActiveTab('workflows')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'workflows' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Workflows
          </button>
        </nav>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Connection Status Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-1">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${status?.connected ? 'bg-green-100' : 'bg-red-100'}`}>
                  {status?.connected ? (
                    <SignalIcon className="h-6 w-6 text-green-600" />
                  ) : (
                    <SignalSlashIcon className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Status</dt>
                    <dd className="flex items-baseline">
                      <div className="text-lg font-semibold text-gray-900">
                        {status?.connected ? 'Connected' : 'Disconnected'}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            {!status?.connected && status?.hasQr && status?.qr && (
              <div className="bg-gray-50 px-5 py-4">
                <div className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                  <QrCodeIcon className="h-4 w-4 mr-2" />
                  Scan QR Code to Connect
                </div>
                <div className="flex justify-center p-2 bg-white rounded border border-gray-200">
                  <QRCodeSVG value={status.qr} size={160} level="H" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={refreshStatus}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Refresh Status
                </button>
                <button
                  onClick={refreshLogs}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Refresh Logs
                </button>
              </div>
            </div>
          </div>

          {/* Send Message Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-3">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Send Message</h3>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="number"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Type your message here..."
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'conversations' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <WhatsAppConversations />
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">System Logs</h3>
              <button
                onClick={refreshLogs}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          <div className="bg-gray-50 p-4 h-96 overflow-y-auto">
            {!logs || logs.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No logs available
              </div>
            ) : (
              <ul className="space-y-3">
                {logs.map((log, index) => (
                  <li key={index} className="text-sm text-gray-700 bg-white p-3 rounded-md shadow-xs">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-2 w-2 rounded-full bg-indigo-500 mt-1.5 mr-2"></div>
                      <div className="font-mono break-all">{log}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {activeTab === 'workflows' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <WorkflowList />
        </div>
      )}
    </div>
  );
};

export default WhatsAppPage;