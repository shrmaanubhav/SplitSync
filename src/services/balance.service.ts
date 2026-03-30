export type Expense = {
  id: string;
  groupId: string;
  paidBy: string;
  amount: number;
  participants: string[];
  createdAt: number;
};

export type BalanceMap = Record<string, number>;

/**
 * Entry point
 */
export function getBalances(
  users: string[],
  expenses: Expense[]
): BalanceMap {
  const raw = calculateBalances(users, expenses);
  const normalized = normalizeBalances(raw);
  validate(normalized);
  return normalized;
}

/**
 * Core logic
 */
export function calculateBalances(
  users: string[],
  expenses: Expense[]
): BalanceMap {
  const balances: BalanceMap = {};

  // init
  for (const u of users) {
    balances[u] = 0;
  }

  for (const exp of expenses) {
    const { paidBy, amount, participants } = exp;

    if (!participants.length) continue;

    const share = amount / participants.length;

    // payer gets full credit
    balances[paidBy] = (balances[paidBy] || 0) + amount;

    // each participant owes share
    for (const user of participants) {
      balances[user] = (balances[user] || 0) - share;
    }
  }

  return balances;
}

/**
 * Round to 2 decimals to avoid float drift
 */
export function normalizeBalances(balances: BalanceMap): BalanceMap {
  const result: BalanceMap = {};

  for (const key in balances) {
    result[key] = Math.round(balances[key] * 100) / 100;
  }

  return result;
}

/**
 * Ensure sum ≈ 0
 */
export function validate(balances: BalanceMap) {
  const sum = Object.values(balances).reduce((a, b) => a + b, 0);

  if (Math.abs(sum) > 0.01) {
    throw new Error('Balance mismatch: sum != 0');
  }
}