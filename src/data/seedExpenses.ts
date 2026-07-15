import { EXPENSE, ExpenseCategory } from "../constants/expense.js";

export type SeedExpense = {
  amount: number;
  description: string;
  category: ExpenseCategory;
  daysAgo: number;
};

const CATEGORIES = [
  ExpenseCategory.FOOD,
  ExpenseCategory.TRANSPORT,
  ExpenseCategory.BILLS,
  ExpenseCategory.OTHER,
] as const;

const DESCRIPTIONS: Record<ExpenseCategory, string[]> = {
  [ExpenseCategory.FOOD]: [
    "Lunch at cafe",
    "Groceries",
    "Dinner takeout",
    "Team lunch",
    "Street food breakfast",
    "Coffee shop work session",
    "Weekend brunch",
    "Meal prep ingredients",
    "Bakery breakfast",
    "Evening snacks",
  ],
  [ExpenseCategory.TRANSPORT]: [
    "Metro card top-up",
    "Auto to office",
    "Parking fee",
    "Cab to meeting",
    "Bike fuel",
    "Ride share home",
    "Bus tickets",
    "Airport transfer",
    "Toll charges",
    "Shared scooter ride",
  ],
  [ExpenseCategory.BILLS]: [
    "Electricity bill",
    "Internet bill",
    "Mobile recharge",
    "Water bill",
    "Gas cylinder refill",
    "Streaming plan",
    "Credit card payment",
    "Society maintenance",
    "Gym monthly fee",
    "Insurance installment",
  ],
  [ExpenseCategory.OTHER]: [
    "Cloud subscription",
    "Pharmacy medicines",
    "Stationery",
    "Laundry service",
    "Haircut",
    "Gift purchase",
    "Domain renewal",
    "E-book purchase",
    "Household supplies",
    "Phone accessories",
  ],
};

const AMOUNT_RANGES: Record<ExpenseCategory, { min: number; max: number }> = {
  [ExpenseCategory.FOOD]: { min: 35, max: 780 },
  [ExpenseCategory.TRANSPORT]: { min: 40, max: 350 },
  [ExpenseCategory.BILLS]: { min: 99, max: 2400 },
  [ExpenseCategory.OTHER]: { min: 55, max: 999 },
};

export const SEED_EXPENSE_COUNT = 300;

export function seedExpenseDate(daysAgo: number): Date {
  const date = new Date();
  date.setHours(EXPENSE.SEED_NOON_HOUR, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function amountFor(category: ExpenseCategory, index: number): number {
  const { min, max } = AMOUNT_RANGES[category];
  const spread = max - min;
  return min + ((index * 37) % (spread + 1));
}

/** Deterministic high-volume seed rows for POST /api/expenses/seed. */
export function generateSeedExpenses(
  count: number = SEED_EXPENSE_COUNT,
): SeedExpense[] {
  const safeCount = Math.max(1, Math.floor(count));
  const expenses: SeedExpense[] = [];

  for (let index = 0; index < safeCount; index += 1) {
    const category = CATEGORIES[index % CATEGORIES.length];
    const descriptions = DESCRIPTIONS[category];
    const description = descriptions[index % descriptions.length];
    const daysAgo = index % 90;

    expenses.push({
      amount: amountFor(category, index),
      description: `${description} #${index + 1}`,
      category,
      daysAgo,
    });
  }

  return expenses;
}
