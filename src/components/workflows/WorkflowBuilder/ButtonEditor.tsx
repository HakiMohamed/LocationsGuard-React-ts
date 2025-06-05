import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Button as ButtonType } from '../../../services/workflow.service';
import { Workflow } from '../../../types/workflow';

interface ButtonEditorProps {
  button: ButtonType;
  availableWorkflows: Workflow[];
  onChange: (button: ButtonType) => void;
  onSave: () => void;
}

const ButtonEditor: React.FC<ButtonEditorProps> = ({ button, availableWorkflows, onChange, onSave }) => {
  const [editedButton, setEditedButton] = useState<ButtonType>(button);

  useEffect(() => {
    setEditedButton(button);
  }, [button]);

  const handleChange = (field: keyof ButtonType, value: string) => {
    const updatedButton = { ...editedButton, [field]: value };
    setEditedButton(updatedButton);
    onChange(updatedButton);
  };

  const handleSave = () => {
    onChange(editedButton);
    onSave();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Edit Button</Typography>
      <TextField
        label="Button Text"
        fullWidth
        margin="normal"
        value={editedButton.text}
        onChange={(e) => handleChange('text', e.target.value)}
      />
      <TextField
        label="Reply Message"
        fullWidth
        margin="normal"
        multiline
        rows={2}
        value={editedButton.replyMessage || ''}
        onChange={(e) => handleChange('replyMessage', e.target.value)}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Next Workflow</InputLabel>
        <Select
          value={editedButton.nextWorkflowId || ''}
          label="Next Workflow"
          onChange={(e) => handleChange('nextWorkflowId', e.target.value)}
        >
          <MenuItem value="">None</MenuItem>
          {availableWorkflows.map((workflow) => (
            <MenuItem key={workflow._id} value={workflow._id}>
              {workflow.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save Button
        </Button>
      </Box>
    </Box>
  );
};

export default ButtonEditor; 