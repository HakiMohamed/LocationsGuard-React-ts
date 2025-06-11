import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, IconButton, TextField, Switch, Tooltip, Box, Typography } from '@mui/material';
import { Edit, Delete, Send, PlayArrow, Stop } from '@mui/icons-material';
import { workflowService } from '../../services/workflow.service';
import { Workflow } from '../../types/workflow';
import WorkflowSendDialog from './WorkflowSendDialog';
import WorkflowForm from './WorkflowForm';

const WorkflowList: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sendDialog, setSendDialog] = useState<{ open: boolean, workflow?: Workflow }>({ open: false });
  const [showForm, setShowForm] = useState(false);
  const [editWorkflow, setEditWorkflow] = useState<Workflow | null>(null);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const data = await workflowService.getAll();
      setWorkflows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkflows(); }, []);

  const handleActivate = async (id: string) => {
    await workflowService.activate(id);
    fetchWorkflows();
  };
  const handleDeactivate = async (id: string) => {
    await workflowService.deactivate(id);
    fetchWorkflows();
  };
  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this workflow?')) {
      await workflowService.delete(id);
      fetchWorkflows();
    }
  };

  const filtered = workflows.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
    { field: 'order', headerName: 'Order', width: 100 },
    { field: 'isActive', headerName: 'Active', width: 100, renderCell: (params: GridRenderCellParams<Workflow>) => (
      <Switch checked={params.value} onChange={() =>
        params.value ? handleDeactivate(params.id as string) : handleActivate(params.id as string)
      } />
    )},
    { 
      field: 'createdAt', 
      headerName: 'Created', 
      width: 180,
      renderCell: (params: GridRenderCellParams<Workflow>) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleString();
      }
    },
    {
      field: 'actions', headerName: 'Actions', width: 180, renderCell: (params: GridRenderCellParams<Workflow>) => (
        <Box>
          <Tooltip title="Send">
            <IconButton onClick={() => setSendDialog({ open: true, workflow: params.row })}><Send /></IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton color="primary" onClick={() => setEditWorkflow(params.row)}><Edit /></IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton color="error" onClick={() => handleDelete(params.id as string)}><Delete /></IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Pagination state for DataGrid v7
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  return (
    <Box>
      <Box display="flex" p={2} alignItems="center" mb={2}>
        <Typography variant="h5" flex={1}>Workflows</Typography>
        <TextField
          size="small"
          label="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
          Create Workflow
        </Button>
      </Box>
      <DataGrid
        autoHeight
        rows={filtered}
        columns={columns}
        getRowId={row => row._id}
        loading={loading}
        pagination
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 20, 50]}
        disableRowSelectionOnClick
      />
      {sendDialog.open && sendDialog.workflow && (
        <WorkflowSendDialog
          workflow={sendDialog.workflow}
          onClose={() => setSendDialog({ open: false })}
        />
      )}
      {showForm && (
        <WorkflowForm
          onClose={() => setShowForm(false)}
          onSave={() => {
            setShowForm(false);
            fetchWorkflows();
          }}
        />
      )}
      {editWorkflow && (
        <WorkflowForm
          workflow={editWorkflow}
          onClose={() => setEditWorkflow(null)}
          onSave={() => {
            setEditWorkflow(null);
            fetchWorkflows();
          }}
        />
      )}
    </Box>
  );
};

export default WorkflowList; 