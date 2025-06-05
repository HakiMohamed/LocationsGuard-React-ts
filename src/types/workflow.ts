export type ConditionOperator = 'equals' | 'contains' | 'greater' | 'less' | 'exists';

export interface Condition {
  field: string;
  operator: ConditionOperator;
  value: any;
}

export interface Button {
  id: string;
  text: string;
  replyMessage?: string;
  nextWorkflowId?: string;
  conditions?: Condition[];
}

export interface WorkflowStep {
  id: string;
  message: string;
  buttons: Button[];
  isStartStep?: boolean;
  nextStepId?: string;
  conditions?: Condition[];
}

export interface Workflow {
  _id?: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isActive: boolean;
  userResponses?: Record<string, any>;
  variables?: Record<string, string>;
  createdAt?: string;
} 