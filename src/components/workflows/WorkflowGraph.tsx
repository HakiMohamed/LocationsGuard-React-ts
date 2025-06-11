import React, { useMemo } from 'react';
import ReactFlow, { MiniMap, Controls, Background, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Workflow } from '../../types/workflow';

interface WorkflowGraphProps {
  workflow: Workflow;
  workflows?: Workflow[]; // Pour afficher le nom lors des nextWorkflowId
}

const getNodesAndEdges = (workflow: Workflow, workflows?: Workflow[]) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Map des steps
  workflow.steps.forEach((step, idx) => {
    nodes.push({
      id: step.id,
      type: step.isStartStep ? 'input' : 'default',
      data: { label: step.message },
      position: { x: 100 + idx * 250, y: 100 },
      style: step.isStartStep ? { border: '2px solid #4f46e5', background: '#eef2ff' } : {},
    });
    // Pour chaque bouton, créer un edge
    step.buttons.forEach((btn, bidx) => {
      // Lien vers un autre step du même workflow
      if (btn.nextStepId) {
        edges.push({
          id: `e-${step.id}-${btn.nextStepId}-${bidx}`,
          source: step.id,
          target: btn.nextStepId,
          label: btn.text,
          animated: true,
          style: { stroke: '#6366f1' },
        });
      }
      // Lien vers un autre workflow
      if (btn.nextWorkflowId) {
        const targetWf = workflows?.find(w => w._id === btn.nextWorkflowId);
        edges.push({
          id: `e-${step.id}-wf-${btn.nextWorkflowId}-${bidx}`,
          source: step.id,
          target: `wf-${btn.nextWorkflowId}`,
          label: btn.text + (targetWf ? ` → ${targetWf.name}` : ''),
          animated: true,
          style: { stroke: '#10b981', strokeDasharray: '4 2' },
        });
        // Ajoute un node pour le workflow cible si pas déjà
        if (!nodes.find(n => n.id === `wf-${btn.nextWorkflowId}`)) {
          nodes.push({
            id: `wf-${btn.nextWorkflowId}`,
            type: 'output',
            data: { label: targetWf ? targetWf.name : btn.nextWorkflowId },
            position: { x: 100 + (idx + bidx + 1) * 250, y: 300 },
            style: { border: '2px dashed #10b981', background: '#f0fdf4' },
          });
        }
      }
    });
  });
  return { nodes, edges };
};

const WorkflowGraph: React.FC<WorkflowGraphProps> = ({ workflow, workflows }) => {
  const { nodes, edges } = useMemo(() => getNodesAndEdges(workflow, workflows), [workflow, workflows]);

  return (
    <div style={{ width: '100%', height: 500 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default WorkflowGraph; 