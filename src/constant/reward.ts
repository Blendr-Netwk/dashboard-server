import { DAY,MINTUES } from "./time";

const DURATION_UNIT = MINTUES

export const REWARD_DURATION = 1 * DURATION_UNIT

export const REWARD_PENALTY = 0.75

export const REWARD_LENDS = [
  {
    id: "1",
    lendPeriod: 1 * DURATION_UNIT,
    amount: 1,
    multiply: 1,
  },
  {
    id: "2",
    lendPeriod: 2 * DURATION_UNIT,
    amount: 1,
    multiply: 1.05,
  },
  {
    id: "3",
    lendPeriod: 3 * DURATION_UNIT,
    amount: 1,
    multiply: 1.1,
  },
  {
    id: "4",
    lendPeriod: 4 * DURATION_UNIT,
    amount: 1,
    multiply: 1.15,
  },
  {
    id: "5",
    lendPeriod: 5 * DURATION_UNIT,
    amount: 1,
    multiply: 1.2,
  },
]
