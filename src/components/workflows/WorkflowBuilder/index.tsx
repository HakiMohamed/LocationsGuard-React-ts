import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { workflowService } from '../../../services/workflow.service';
import { Workflow } from '../../../types/workflow';
import StepEditor, { Step } from './StepEditor';
import WorkflowPreview from './WorkflowPreview';
import { toast } from 'react-hot-toast';

const WorkflowBuilder: React.FC = () => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [availableWorkflows, setAvailableWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);

  const availableFields = [
    'message',
    'button',
    'timestamp',
    'userInput',
    'previousStep'
  ];

  useEffect(() => {
    loadAvailableWorkflows();
  }, []);

  const loadAvailableWorkflows = async () => {
    try {
      const data = await workflowService.getAll();
      setAvailableWorkflows(data);
    } catch (error) {
      toast.error('Failed to load workflows');
    }
  };

  const handleAddStep = () => {
    const newStep: Step = {
      id: `step_${Date.now()}`,
      message: '',
      isStart: steps.length === 0,
      buttons: [],
      conditions: []
    };
    setSteps([...steps, newStep]);
    setSelectedStep(newStep);
  };

  const handleStepChange = (updatedStep: Step) => {
    setSteps(steps.map(step => 
      step.id === updatedStep.id ? updatedStep : step
    ));
    setSelectedStep(updatedStep);
  };

  const handleStepClick = (step: Step) => {
    setSelectedStep(step);
  };

  const handleSaveWorkflow = async () => {
    if (steps.length === 0) {
      toast.error('Please add at least one step');
      return;
    }

    if (!steps.some(step => step.isStart)) {
      toast.error('Please mark a step as the start step');
      return;
    }

    setLoading(true);
    try {
      const workflowData: Omit<Workflow, '_id'> = {
        name: 'New Workflow',
        description: 'A workflow created using the workflow builder',
        isActive: false,
        steps: steps.map(step => ({
          id: step.id,
          message: step.message,
          isStartStep: step.isStart,
          buttons: step.buttons.map(btn => ({
            id: btn.id,
            text: btn.text,
            replyMessage: btn.replyMessage,
            nextWorkflowId: btn.nextWorkflowId
          })),
          conditions: step.conditions
        }))
      };

      await workflowService.create(workflowData);
      toast.success('Workflow saved successfully');
      setSteps([]);
      setSelectedStep(null);
    } catch (error) {
      toast.error('Failed to save workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Workflow Builder</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddStep}
        >
          Add Step
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 2 }}>
          <Paper sx={{ p: 2, minHeight: 400 }}>
            {steps.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">
                  Click "Add Step" to start building your workflow
                </Typography>
              </Box>
            ) : (
              <WorkflowPreview
                steps={steps}
                onStepClick={handleStepClick}
              />
            )}
          </Paper>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 2, minHeight: 400 }}>
            {selectedStep ? (
              <StepEditor
                step={selectedStep}
                availableWorkflows={availableWorkflows}
                availableFields={availableFields}
                onChange={handleStepChange}
                onSave={() => setSelectedStep(null)}
              />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">
                  Select a step to edit
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {steps.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveWorkflow}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Workflow'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default WorkflowBuilder; 