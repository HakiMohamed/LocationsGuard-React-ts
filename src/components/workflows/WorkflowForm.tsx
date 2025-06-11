import React, { useState, useEffect } from 'react';
import { workflowService, Button } from '../../services/workflow.service';
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Workflow } from '../../types/workflow';


interface WorkflowFormProps {
  workflow?: Workflow | null;
  onClose: () => void;
  onSave: () => void;
}

const WorkflowForm: React.FC<WorkflowFormProps> = ({ workflow, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState<Button[]>([]);
  const [availableWorkflows, setAvailableWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setDescription(workflow.description || '');
      if (workflow.steps && workflow.steps.length > 0) {
        setMessage(workflow.steps[0].message);
        setButtons(workflow.steps[0].buttons || []);
      } else {
        setMessage('');
        setButtons([]);
      }
    }
    loadAvailableWorkflows();
  }, [workflow]);

  const loadAvailableWorkflows = async () => {
    try {
      const data = await workflowService.getAll();
      setAvailableWorkflows(data.filter(w => !workflow || w._id !== workflow._id));
    } catch (error) {
      toast.error('Failed to load workflows');
    }
  };

  const handleAddButton = () => {
    setButtons([
      ...buttons,
      {
        id: `btn_${Date.now()}`,
        text: '',
        replyMessage: '',
        nextWorkflowId: ''
      }
    ]);
  };

  const handleRemoveButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const handleButtonChange = (index: number, field: keyof Button, value: string) => {
    const newButtons = [...buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setButtons(newButtons);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !message.trim()) {
      toast.error('Name, description, and message are required');
      return;
    }

    setLoading(true);
    try {
      const workflowData = {
        name,
        description,
        isActive: workflow?.isActive ?? false,
        steps: [
          {
            id: `step_${Date.now()}`,
            message,
            isStartStep: true,
            buttons
          }
        ]
      };

      if (workflow) {
        await workflowService.update(workflow._id!, workflowData);
        toast.success('Workflow updated successfully');
      } else {
        await workflowService.create(workflowData);
        toast.success('Workflow created successfully');
      }
      onSave();
    } catch (error) {
      toast.error(workflow ? 'Failed to update workflow' : 'Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {workflow ? 'Edit Workflow' : 'Create New Workflow'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Buttons</label>
              <button
                type="button"
                onClick={handleAddButton}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Button
              </button>
            </div>

            <div className="mt-2 space-y-4">
              {buttons.map((button, index) => (
                <div key={button.id} className="p-4 border border-gray-200 rounded-md space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium text-gray-700">Bouton {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveButton(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Texte du bouton</label>
                    <input
                      type="text"
                      value={button.text}
                      onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message de réponse</label>
                    <textarea
                      value={button.replyMessage}
                      onChange={(e) => handleButtonChange(index, 'replyMessage', e.target.value)}
                      placeholder="Entrez le message qui sera envoyé lorsque ce bouton est cliqué"
                      rows={2}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lier à un autre workflow</label>
                    <select
                      value={button.nextWorkflowId}
                      onChange={(e) => handleButtonChange(index, 'nextWorkflowId', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Aucun</option>
                      {availableWorkflows
                        .filter(w => !workflow || w._id !== workflow._id)
                        .map((w) => (
                          <option key={w._id} value={w._id}>
                            {w.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : workflow ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkflowForm; 