import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';
import { workflowService } from '../../services/workflow.service';
import { Workflow } from '../../types/workflow';

interface WorkflowSendDialogProps {
  workflow: Workflow;
  onClose: () => void;
}

const WorkflowSendDialog: React.FC<WorkflowSendDialogProps> = ({ workflow, onClose }) => {
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSend = async () => {
    setError('');
    setSuccess('');
    if (!number.match(/^\+?\d{8,15}$/)) {
      setError('Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    try {
      await workflowService.send(workflow._id!, number);
      setSuccess('Workflow sent successfully!');
      setNumber('');
    } catch (e) {
      setError('Failed to send workflow.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Send Workflow</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          {workflow.name}
        </Typography>
        <TextField
          label="Phone Number"
          value={number}
          onChange={e => setNumber(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="+1234567890"
          disabled={loading}
        />
        {error && <Typography color="error">{error}</Typography>}
        {success && <Typography color="primary">{success}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSend} variant="contained" color="primary" disabled={loading}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkflowSendDialog; 