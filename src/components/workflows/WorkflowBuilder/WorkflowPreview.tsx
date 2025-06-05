import React from 'react';
import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import { Step } from './StepEditor';

interface WorkflowPreviewProps {
  steps: Step[];
  onStepClick: (step: Step) => void;
}

const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({ steps, onStepClick }) => {
  const startStep = steps.find(step => step.isStart);

  const renderStep = (step: Step) => {
    return (
      <Paper
        key={step.id}
        sx={{
          p: 2,
          mb: 2,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
        onClick={() => onStepClick(step)}
      >
        <Typography variant="subtitle1" gutterBottom>
          {step.isStart ? 'Start Step' : 'Step'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {step.message}
        </Typography>

        {step.buttons.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {step.buttons.map((button) => (
                <Button
                  key={button.id}
                  variant="outlined"
                  size="small"
                  disabled
                >
                  {button.text}
                </Button>
              ))}
            </Box>
          </>
        )}

        {step.conditions.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Conditions: {step.conditions.length}
            </Typography>
          </>
        )}
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Workflow Preview</Typography>
      
      {!startStep ? (
        <Typography color="text.secondary">
          No start step defined. Please mark a step as the start step.
        </Typography>
      ) : (
        <Box>
          {renderStep(startStep)}
          
          {steps
            .filter(step => !step.isStart)
            .map(step => renderStep(step))}
        </Box>
      )}
    </Box>
  );
};

export default WorkflowPreview; 