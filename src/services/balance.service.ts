export type Expense = {
  id: string;
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
  const balancesCents: Record<string, number> = {};

  // init
  for (const u of users) {
    balancesCents[u] = 0;
  }

  for (const exp of expenses) {
    const { paidBy, amount, participants } = exp;

    if (!participants.length) continue;

    const total = Math.round(amount * 100); // convert to cents
    const n = participants.length;

    const base = Math.floor(total / n); // base share in cents
    let remainder = total - base * n;   // leftover cents

    // payer gets full amount
    balancesCents[paidBy] += total;

    // distribute shares
    for (let i = 0; i < n; i++) {
      const u = participants[i];

      const extra = remainder > 0 ? 1 : 0; // 1 cent adjustment
      balancesCents[u] -= (base + extra);

      if (remainder > 0) remainder--;
    }
  }

  // convert back to rupees
  const balances: BalanceMap = {};
  for (const u in balancesCents) {
    balances[u] = balancesCents[u] / 100;
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