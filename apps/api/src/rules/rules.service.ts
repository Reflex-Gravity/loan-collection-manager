import { Injectable, OnModuleInit } from '@nestjs/common';
import rulesConfig from '../config/rules.json';
import { Rule, RuleCondition, RuleResult } from '@lcm/shared';

@Injectable()
export class RulesService<T, R> implements OnModuleInit {
  private rules: Rule<R>[] = [];

  onModuleInit() {
    // 1. Load and Type-Cast Rules on Startup
    this.rules = (rulesConfig as Rule<R>[]).sort(
      (a, b) => b.priority - a.priority,
    );
  }

  public evaluate(entity: T): {
    matchedRules: RuleResult<R>[] | null;
    decision: RuleResult<R> | null;
  } {
    const matchedRules = [];
    for (const rule of this.rules) {
      if (this.checkCondition(rule.condition, entity)) {
        const value = this.getValue(entity, rule.condition.field);
        matchedRules.push({
          matchedRuleId: rule.id,
          action: rule.action,
          priority: rule.priority,
          reason:
            value !== null
              ? rule.reason.replaceAll('%%field%%', String(value))
              : rule.reason,
        });
      }
    }
    if (matchedRules.length === 0) {
      return { matchedRules: null, decision: null };
    }

    // pick higher priority rule
    const decision = [...matchedRules].sort(
      (a, b) => a.priority - b.priority,
    )[0];
    decision.reason = matchedRules.map((rule) => rule.reason).join('; ');
    return { matchedRules, decision };
  }

  private checkCondition(condition: RuleCondition, entity: T): boolean {
    const value = this.getValue(entity, condition.field);
    const target = condition.value;

    // validations (basic type safety checks)
    if (value === null || value === undefined) return false;

    switch (condition.operator) {
      case 'gt':
        return Number(value) > Number(target);
      case 'gte':
        return Number(value) >= Number(target);
      case 'lt':
        return Number(value) < Number(target);
      case 'lte':
        return Number(value) <= Number(target);
      case 'eq':
        return value == target;
      case 'neq':
        return value != target;
      case 'between':
        return (
          Array.isArray(target) &&
          target.length === 2 &&
          Number(value) >= Number(target[0]) &&
          Number(value) <= Number(target[1])
        );
      case 'in':
        // Safe array check
        return Array.isArray(target) && target.includes(value);
      default:
        return false;
    }
  }

  // resolves and returns the value based on the json path
  private getValue(obj: unknown, path: string): string | number | null {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
      if (typeof current === 'object' && current !== null && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return null;
      }
    }

    if (typeof current === 'string' || typeof current === 'number') {
      return current;
    }
    return null;
  }
}
