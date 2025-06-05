import React from 'react';
import { Box, TextField, Typography, Button, MenuItem, FormControl, InputLabel, Select, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

export interface Condition {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'exists';
  value: string;
}

interface ConditionBuilderProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
  availableFields: string[];
}

const ConditionBuilder: React.FC<ConditionBuilderProps> = ({ conditions, onChange, availableFields }) => {
  const handleAddCondition = () => {
    const newCondition: Condition = {
      id: `cond_${Date.now()}`,
      field: '',
      operator: 'equals',
      value: ''
    };
    onChange([...conditions, newCondition]);
  };

  const handleRemoveCondition = (id: string) => {
    onChange(conditions.filter(cond => cond.id !== id));
  };

  const handleConditionChange = (id: string, field: keyof Condition, value: string) => {
    onChange(conditions.map(cond => 
      cond.id === id ? { ...cond, [field]: value } : cond
    ));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Condition Builder</Typography>
      
      {conditions.map((condition) => (
        <Box key={condition.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2">Condition</Typography>
            <IconButton size="small" onClick={() => handleRemoveCondition(condition.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Field</InputLabel>
            <Select
              value={condition.field}
              label="Field"
              onChange={(e) => handleConditionChange(condition.id, 'field', e.target.value)}
            >
              {availableFields.map((field) => (
                <MenuItem key={field} value={field}>
                  {field}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Operator</InputLabel>
            <Select
              value={condition.operator}
              label="Operator"
              onChange={(e) => handleConditionChange(condition.id, 'operator', e.target.value)}
            >
              <MenuItem value="equals">Equals</MenuItem>
              <MenuItem value="contains">Contains</MenuItem>
              <MenuItem value="greater">Greater Than</MenuItem>
              <MenuItem value="less">Less Than</MenuItem>
              <MenuItem value="exists">Exists</MenuItem>
            </Select>
          </FormControl>

          {condition.operator !== 'exists' && (
            <TextField
              label="Value"
              fullWidth
              margin="normal"
              value={condition.value}
              onChange={(e) => handleConditionChange(condition.id, 'value', e.target.value)}
            />
          )}
        </Box>
      ))}

      <Button
        variant="outlined"
        color="primary"
        onClick={handleAddCondition}
        sx={{ mt: 2 }}
      >
        Add Condition
      </Button>
    </Box>
  );
};

export default ConditionBuilder; 