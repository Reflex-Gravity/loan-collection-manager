export enum CaseStage {
  SOFT = "SOFT",
  HARD = "HARD",
  LEGAL = "LEGAL",
}

export enum CaseStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum ActionType {
  CALL = "CALL",
  SMS = "SMS",
  EMAIL = "EMAIL",
  WHATSAPP = "WHATSAPP",
}

export enum ActionOutcome {
  NO_ANSWER = "NO_ANSWER",
  PROMISE_TO_PAY = "PROMISE_TO_PAY",
  PAID = "PAID",
  WRONG_NUMBER = "WRONG_NUMBER",
}

export enum LoanStatus {
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
  DEFAULT = "DEFAULT",
}

// rules service

export type RuleOperator =
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "eq"
  | "neq"
  | "between"
  | "in";

export interface RuleCondition {
  field: string;
  operator: RuleOperator;
  value: unknown;
}

export interface Rule<R> {
  id: string;
  priority: number;
  condition: RuleCondition;
  action: R;
  description: string;
}

export interface RuleResult<R> {
  matchedRuleId: string;
  action: R;
  reason: string;
}

export interface CaseAssignmentAction {
  stage: CaseStage;
  assignedTo: string;
}
