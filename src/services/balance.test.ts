import { getSettlements } from './settlement.service';

const balances = {
  A: 200,
  B: 200,
  C: -400,
};

console.log(getSettlements(balances));