import React, { useState } from 'react';
import { Box, TextField, Typography, Checkbox, FormControlLabel, Button, Divider } from '@mui/material';
import { Button as ButtonType } from '../../../services/workflow.service';
import ButtonEditor from './ButtonEditor';
import ConditionBuilder, { Condition } from './ConditionBuilder';

export interface Step {
  id: string;
  message: string;
  isStart: boolean;
  buttons: ButtonType[];
  conditions: Condition[];
  nextStepId?: string;
}

interface StepEditorProps {
  step: Step;
  availableWorkflows: any[];
  availableFields: string[];
  onChange: (step: Step) => void;
  onSave: () => void;
}

const StepEditor: React.FC<StepEditorProps> = ({
  step,
  availableWorkflows,
  availableFields,
  onChange,
  onSave
}) => {
  const [editingButton, setEditingButton] = useState<ButtonType | null>(null);

  const handleMessageChange = (message: string) => {
    onChange({ ...step, message });
  };

  const handleStartChange = (isStart: boolean) => {
    onChange({ ...step, isStart });
  };

  const handleButtonChange = (button: ButtonType) => {
    const updatedButtons = step.buttons.map(b => b.id === button.id ? button : b);
    onChange({
      ...step,
      buttons: updatedButtons
    });
    setEditingButton(null);
  };

  const handleAddButton = () => {
    const newButton: ButtonType = {
      id: `btn_${Date.now()}`,
      text: '',
      replyMessage: '',
      nextWorkflowId: ''
    };
    const updatedButtons = [...step.buttons, newButton];
    onChange({
      ...step,
      buttons: updatedButtons
    });
    setEditingButton(newButton);
  };

  const handleRemoveButton = (buttonId: string) => {
    onChange({
      ...step,
      buttons: step.buttons.filter(b => b.id !== buttonId)
    });
  };

  const handleConditionsChange = (conditions: Condition[]) => {
    onChange({ ...step, conditions });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Edit Step</Typography>
      
      <TextField
        label="Message"
        fullWidth
        margin="normal"
        multiline
        rows={3}
        value={step.message}
        onChange={(e) => handleMessageChange(e.target.value)}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={step.isStart}
            onChange={(e) => handleStartChange(e.target.checked)}
          />
        }
        label="Mark as Start Step"
      />

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" gutterBottom>Buttons</Typography>
      {step.buttons.map((button) => (
        <Box key={button.id} sx={{ mb: 2 }}>
          {editingButton?.id === button.id ? (
            <ButtonEditor
              button={button}
              availableWorkflows={availableWorkflows}
              onChange={handleButtonChange}
              onSave={() => setEditingButton(null)}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>{button.text || 'Unnamed Button'}</Typography>
              <Button size="small" onClick={() => setEditingButton(button)}>
                Edit
              </Button>
              <Button size="small" color="error" onClick={() => handleRemoveButton(button.id)}>
                Remove
              </Button>
            </Box>
          )}
        </Box>
      ))}
      
      <Button
        variant="outlined"
        color="primary"
        onClick={handleAddButton}
        sx={{ mt: 2 }}
      >
        Add Button
      </Button>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" gutterBottom>Conditions</Typography>
      <ConditionBuilder
        conditions={step.conditions}
        onChange={handleConditionsChange}
        availableFields={availableFields}
      />

      <Box sx={{ mt: 3 }}>
        <Button variant="contained" color="primary" onClick={onSave}>
          Save Step
        </Button>
      </Box>
    </Box>
  );
};

export default StepEditor; 