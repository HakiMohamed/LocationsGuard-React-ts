import React, { useMemo } from 'react';
import ReactFlow, { MiniMap, Controls, Background, Node, Edge, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { Workflow, WorkflowStep, Button } from '../../types/workflow';

interface WorkflowGraphProps {
  workflow: Workflow;
  workflows?: Workflow[];
}

// Nœud personnalisé pour les étapes
const StepNode = ({ data }: { data: { step: WorkflowStep } }) => {
  const { step } = data;
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[250px] border-2 border-indigo-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="space-y-3">
        <div className="font-semibold text-indigo-600">{step.isStartStep ? 'Start' : 'Step'}</div>
        <div className="text-sm text-gray-700">{step.message}</div>
        {step.buttons.length > 0 && (
          <div className="mt-2 space-y-2">
            {step.buttons.map((btn) => (
              <div key={btn.id} className="bg-gray-50 p-2 rounded text-sm">
                <div className="font-medium text-gray-900">{btn.text}</div>
                {btn.replyMessage && (
                  <div className="text-gray-600 text-xs mt-1">{btn.replyMessage}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

// Nœud personnalisé pour les workflows liés
const WorkflowNode = ({ data }: { data: { workflow: Workflow } }) => {
  const { workflow } = data;
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[250px] border-2 border-dashed border-green-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="space-y-2">
        <div className="font-semibold text-green-600">Linked Workflow</div>
        <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
        <div className="text-xs text-gray-600">{workflow.description}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

const nodeTypes = {
  step: StepNode,
  workflow: WorkflowNode,
};

const getNodesAndEdges = (workflow: Workflow, workflows?: Workflow[]) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeSpacing = { x: 300, y: 200 };

  // Créer les nœuds pour les étapes
  workflow.steps.forEach((step, idx) => {
    nodes.push({
      id: step.id,
      type: 'step',
      data: { step },
      position: { 
        x: 100 + idx * nodeSpacing.x, 
        y: 100 + (idx % 2) * nodeSpacing.y 
      },
    });

    // Créer les connexions pour les boutons
    step.buttons.forEach((btn, bidx) => {
      if (btn.nextStepId) {
        edges.push({
          id: `e-${step.id}-${btn.nextStepId}-${bidx}`,
          source: step.id,
          target: btn.nextStepId,
          label: btn.text,
          animated: true,
          style: { stroke: '#6366f1' },
          labelStyle: { fill: '#6366f1', fontWeight: 500 },
          labelBgStyle: { fill: '#eef2ff' },
        });
      }

      if (btn.nextWorkflowId) {
        const targetWf = workflows?.find(w => w._id === btn.nextWorkflowId);
        if (targetWf) {
          const nodeId = `wf-${btn.nextWorkflowId}`;
          if (!nodes.find(n => n.id === nodeId)) {
            nodes.push({
              id: nodeId,
              type: 'workflow',
              data: { workflow: targetWf },
              position: { 
                x: 100 + (idx + 1) * nodeSpacing.x, 
                y: 100 + ((idx + 1) % 2) * nodeSpacing.y 
              },
            });
          }
          edges.push({
            id: `e-${step.id}-wf-${btn.nextWorkflowId}-${bidx}`,
            source: step.id,
            target: nodeId,
            label: btn.text,
            animated: true,
            style: { stroke: '#10b981', strokeDasharray: '4 2' },
            labelStyle: { fill: '#10b981', fontWeight: 500 },
            labelBgStyle: { fill: '#f0fdf4' },
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
    <div className="w-full h-[600px] bg-gray-50 rounded-lg">
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'step':
                return '#eef2ff';
              case 'workflow':
                return '#f0fdf4';
              default:
                return '#eee';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default WorkflowGraph; 