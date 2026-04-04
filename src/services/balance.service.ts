export type ExpenseParticipant = string | { userId: string; amountOwed: number };

export type Expense = {
  id: string;
  paidBy: string;
  amount: number;
  participants: ExpenseParticipant[]; 
  createdAt: any;
};

export type BalanceMap = Record<string, number>;

// entry point
export function getBalances(
  users: any[],
  expenses: Expense[]
): BalanceMap {
  const raw = calculateBalances(users, expenses);
  const normalized = normalizeBalances(raw);
  validate(normalized);
  return normalized;
}

// core logic
export function calculateBalances(
  users: any[],
  expenses: Expense[]
): BalanceMap {
  const balancesCents: Record<string, number> = {};

  for (const u of users) {
    const id = u.id || u._id || u;
    balancesCents[id] = 0;
  }

  for (const exp of expenses) {
    const { paidBy, amount, participants } = exp;

    if (!participants || !participants.length) continue;

    const total = Math.round(amount * 100); 
    const n = participants.length;

    if (balancesCents[paidBy] === undefined) balancesCents[paidBy] = 0;
    balancesCents[paidBy] += total;

    const isExactMath = typeof participants[0] === 'object' && participants[0] !== null;

    if (isExactMath) {
      for (const p of participants) {
        const part = p as { userId: string; amountOwed: number };
        const pId = part.userId;
        const owedCents = Math.round((part.amountOwed || 0) * 100);
        
        if (balancesCents[pId] === undefined) balancesCents[pId] = 0;
        balancesCents[pId] -= owedCents;
      }
    } else {
      const base = Math.floor(total / n); // base share in cents
      let remainder = total - base * n;   // leftover cents

      for (let i = 0; i < n; i++) {
        const u = participants[i] as string;
        if (balancesCents[u] === undefined) balancesCents[u] = 0;

        const extra = remainder > 0 ? 1 : 0; // 1 cent adjustment
        balancesCents[u] -= (base + extra);

        if (remainder > 0) remainder--;
      }
    }
  }

  // convert back to rupees
  const balances: BalanceMap = {};
  for (const u in balancesCents) {
    balances[u] = balancesCents[u] / 100;
  }

  return balances;
}

// round off
export function normalizeBalances(balances: BalanceMap): BalanceMap {
  const result: BalanceMap = {};

  for (const key in balances) {
    result[key] = Math.round(balances[key] * 100) / 100;
  }

  return result;
}


export function validate(balances: BalanceMap) {
  const sum = Object.values(balances).reduce((a, b) => a + b, 0);

  if (Math.abs(sum) > 0.05) {
    console.warn(`Balance mismatch: sum is off by ${sum}. Check manual expense entries.`);
  }
}