import { Injectable, OnModuleInit } from '@nestjs/common';
import * as rulesConfig from '../config/rules.json';
import { Rule, RuleCondition, RuleResult } from '@lcm/shared';

@Injectable()
export class RulesService<T, R> implements OnModuleInit {
  private rules: Rule<R>[] = [];

  onModuleInit() {
    // 1. Load and Type-Cast Rules on Startup
    // This explicit cast fixes "unsafe member access" by telling TS this is a Rule[]
    this.rules = (rulesConfig as unknown as Rule<R>[]).sort(
      (a, b) => a.priority - b.priority,
    );
  }

  public evaluate(entity: T): RuleResult<R> | null {
    for (const rule of this.rules) {
      if (this.checkCondition(rule.condition, entity)) {
        return {
          matchedRuleId: rule.id,
          action: rule.action,
          reason: rule.description,
        };
      }
    }
    return null;
  }

  private checkCondition(condition: RuleCondition, entity: T): boolean {
    const value = this.getValue(entity, condition.field);
    const target = condition.value;

    // Ensure value is comparable (basic type safety checks)
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
  private getValue(obj: unknown, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
      // Check if current is a valid object before accessing
      if (typeof current === 'object' && current !== null && key in current) {
        // Safely cast to Record to access the key
        current = (current as Record<string, unknown>)[key];
      } else {
        return null;
      }
    }

    return current;
  }
}
