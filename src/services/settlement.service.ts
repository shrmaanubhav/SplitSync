import { BalanceMap } from './balance.service';

export type Settlement = {
  from: string;
  to: string;
  amount: number;
};

export function getSettlements(balances: BalanceMap): Settlement[] {
  const settlements: Settlement[] = [];

  const creditors: { user: string; amount: number }[] = [];
  const debtors: { user: string; amount: number }[] = [];

  // split users
  for (const user in balances) {
    const amt = balances[user];

    if (amt > 0) creditors.push({ user, amount: amt });
    else if (amt < 0) debtors.push({ user, amount: -amt });
  }

  // sort (optional but cleaner)
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let i = 0; // debtor
  let j = 0; // creditor

  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];

    const settleAmount = Math.min(d.amount, c.amount);

    settlements.push({
      from: d.user,
      to: c.user,
      amount: round(settleAmount),
    });

    d.amount -= settleAmount;
    c.amount -= settleAmount;

    if (d.amount === 0) i++;
    if (c.amount === 0) j++;
  }

  return settlements;
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}