/**
 * Node.js test runner for BudgetPulse property tests
 * Runs property-based tests using fast-check in a Node.js environment
 */

// Mock localStorage for Node.js environment
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, value) => {
    mockStorage[key] = String(value);
  },
  removeItem: (key) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
};

// Mock window and console for the modules
global.window = { localStorage: global.localStorage };

// Load fast-check
const fc = require("fast-check");

// Load StorageService by evaluating the file
const fs = require("fs");
const path = require("path");

const storageServiceCode = fs.readFileSync(
  path.join(__dirname, "../js/storage-service.js"),
  "utf8"
);
// Use Function constructor to evaluate in global scope
const evalInGlobal = new Function(
  storageServiceCode + "; return StorageService;"
);
const StorageService = evalInGlobal();

// Make StorageService available globally for DataManager
global.StorageService = StorageService;

// Load DataManager
const dataManagerCode = fs.readFileSync(
  path.join(__dirname, "../js/data-manager.js"),
  "utf8"
);
const evalDataManager = new Function(dataManagerCode + "; return DataManager;");
const DataManager = evalDataManager();

// Test utilities
let passed = 0;
let failed = 0;
const failures = [];

function clearStorage() {
  localStorage.removeItem("budgetpulse_transactions");
  localStorage.removeItem("budgetpulse_budgets");
}

// ============================================================
// PROPERTY TESTS
// ============================================================

// Helper: Generate valid date string in YYYY-MM-DD format (safe for all months)
const validDateArbForRoundTrip = fc
  .tuple(
    fc.integer({ min: 2020, max: 2030 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }) // Use 28 to avoid invalid dates
  )
  .map(([year, month, day]) => {
    const m = String(month).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  });

// **Feature: budget-tracker, Property 1: Transaction Serialization Round Trip**
// Validates: Requirements 10.1, 10.2, 10.3
function testTransactionSerializationRoundTrip() {
  const testName = "Property 1: Transaction Serialization Round Trip";

  try {
    // Generator for valid transaction objects
    const transactionArb = fc.record({
      id: fc.uuid(),
      date: validDateArbForRoundTrip,
      description: fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => s.trim().length > 0),
      amount: fc.integer({ min: 1, max: 100000000 }).map((n) => n / 100), // Convert cents to dollars for 2 decimal precision
      type: fc.constantFrom("income", "expense"),
    });

    clearStorage();

    fc.assert(
      fc.property(
        fc.array(transactionArb, { minLength: 0, maxLength: 20 }),
        (transactions) => {
          // Save transactions to storage (serialization)
          StorageService.saveTransactions(transactions);

          // Retrieve transactions from storage (deserialization)
          const retrieved = StorageService.getTransactions();

          // Assert: arrays have same length
          if (transactions.length !== retrieved.length) {
            return false;
          }

          // Assert: all fields are equal for each transaction
          for (let i = 0; i < transactions.length; i++) {
            const original = transactions[i];
            const loaded = retrieved[i];

            if (
              original.id !== loaded.id ||
              original.date !== loaded.date ||
              original.description !== loaded.description ||
              original.amount !== loaded.amount ||
              original.type !== loaded.type
            ) {
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );

    console.log(`✅ ${testName}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${testName}`);
    console.log(`   Error: ${error.message}`);
    failed++;
    failures.push({ name: testName, error: error.message });
  }
}

// **Feature: budget-tracker, Property 2: Budget Limit Persistence Round Trip**
// Validates: Requirements 1.1, 6.3
function testBudgetLimitPersistenceRoundTrip() {
  const testName = "Property 2: Budget Limit Persistence Round Trip";

  try {
    // Generator for valid month keys (YYYY-MM format)
    const monthKeyArb = fc
      .tuple(
        fc.integer({ min: 2020, max: 2030 }),
        fc.integer({ min: 1, max: 12 })
      )
      .map(([year, month]) => StorageService.generateMonthKey(year, month));

    // Generator for positive budget values (in cents, converted to dollars)
    const budgetValueArb = fc
      .integer({ min: 1, max: 1000000000 })
      .map((n) => n / 100);

    clearStorage();

    fc.assert(
      fc.property(monthKeyArb, budgetValueArb, (monthKey, budgetValue) => {
        // Save budget limit to storage
        StorageService.saveBudgetLimit(monthKey, budgetValue);

        // Retrieve budget limit from storage
        const retrieved = StorageService.getBudgetLimit(monthKey);

        // Assert: retrieved value equals saved value
        return retrieved === budgetValue;
      }),
      { numRuns: 100 }
    );

    console.log(`✅ ${testName}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${testName}`);
    console.log(`   Error: ${error.message}`);
    failed++;
    failures.push({ name: testName, error: error.message });
  }
}

// Helper: Generate valid date string in YYYY-MM-DD format
const validDateArb = fc
  .tuple(
    fc.integer({ min: 2020, max: 2030 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }) // Use 28 to avoid invalid dates
  )
  .map(([year, month, day]) => {
    const m = String(month).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  });

// **Feature: budget-tracker, Property 3: Transaction Addition Increases Count**
// Validates: Requirements 2.1
function testTransactionAdditionIncreasesCount() {
  const testName = "Property 3: Transaction Addition Increases Count";

  try {
    // Generator for valid transaction input (without ID - DataManager generates it)
    const transactionInputArb = fc.record({
      date: validDateArb,
      description: fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => s.trim().length > 0),
      amount: fc.integer({ min: 1, max: 100000000 }).map((n) => n / 100),
      type: fc.constantFrom("income", "expense"),
    });

    // Generator for existing transaction lists
    const existingTransactionsArb = fc.array(
      fc.record({
        id: fc.uuid(),
        date: validDateArb,
        description: fc
          .string({ minLength: 1, maxLength: 100 })
          .filter((s) => s.trim().length > 0),
        amount: fc.integer({ min: 1, max: 100000000 }).map((n) => n / 100),
        type: fc.constantFrom("income", "expense"),
      }),
      { minLength: 0, maxLength: 20 }
    );

    fc.assert(
      fc.property(
        existingTransactionsArb,
        transactionInputArb,
        (existingTransactions, newTransaction) => {
          // Setup: clear storage and set initial transactions
          clearStorage();
          StorageService.saveTransactions(existingTransactions);
          DataManager.init();

          const initialCount = DataManager.transactions.length;

          // Action: add a new transaction
          DataManager.addTransaction(newTransaction);

          const finalCount = DataManager.transactions.length;

          // Assert: list length increased by exactly one
          return finalCount === initialCount + 1;
        }
      ),
      { numRuns: 100 }
    );

    console.log(`✅ ${testName}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${testName}`);
    console.log(`   Error: ${error.message}`);
    failed++;
    failures.push({ name: testName, error: error.message });
  }
}

// **Feature: budget-tracker, Property 4: Transaction Deletion Decreases Count**
// Validates: Requirements 2.4
function testTransactionDeletionDecreasesCount() {
  const testName = "Property 4: Transaction Deletion Decreases Count";

  try {
    // Generator for transaction lists with at least one item
    const transactionsWithAtLeastOneArb = fc.array(
      fc.record({
        id: fc.uuid(),
        date: validDateArb,
        description: fc
          .string({ minLength: 1, maxLength: 100 })
          .filter((s) => s.trim().length > 0),
        amount: fc.integer({ min: 1, max: 100000000 }).map((n) => n / 100),
        type: fc.constantFrom("income", "expense"),
      }),
      { minLength: 1, maxLength: 20 }
    );

    fc.assert(
      fc.property(transactionsWithAtLeastOneArb, (transactions) => {
        // Setup: clear storage and set initial transactions
        clearStorage();
        StorageService.saveTransactions(transactions);
        DataManager.init();

        const initialCount = DataManager.transactions.length;

        // Pick a random transaction to delete
        const randomIndex = Math.floor(Math.random() * transactions.length);
        const transactionToDelete = transactions[randomIndex];

        // Action: delete the transaction
        const deleted = DataManager.deleteTransaction(transactionToDelete.id);

        const finalCount = DataManager.transactions.length;

        // Assert: deletion succeeded, count decreased by one, and transaction is gone
        const transactionGone = !DataManager.transactions.some(
          (t) => t.id === transactionToDelete.id
        );

        return deleted && finalCount === initialCount - 1 && transactionGone;
      }),
      { numRuns: 100 }
    );

    console.log(`✅ ${testName}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${testName}`);
    console.log(`   Error: ${error.message}`);
    failed++;
    failures.push({ name: testName, error: error.message });
  }
}

// **Feature: budget-tracker, Property 5: Income Calculation Correctness**
// Validates: Requirements 4.1
function testIncomeCalculationCorrectness() {
  const testName = "Property 5: Income Calculation Correctness";

  try {
    // Generator for transaction lists with mixed types
    const transactionsArb = fc.array(
      fc.record({
        id: fc.uuid(),
        date: validDateArb,
        description: fc
          .string({ minLength: 1, maxLength: 100 })
          .filter((s) => s.trim().length > 0),
        amount: fc.integer({ min: 1, max: 100000000 }).map((n) => n / 100),
        type: fc.constantFrom("income", "expense"),
      }),
      { minLength: 0, maxLength: 30 }
    );

    fc.assert(
      fc.property(transactionsArb, (transactions) => {
        // Calculate expected income manually
        const expectedIncome = transactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        // Action: calculate using DataManager
        const calculatedIncome = DataManager.calculateTotalIncome(transactions);

        // Assert: equals sum of amounts where type is 'income'
        return Math.abs(calculatedIncome - expectedIncome) < 0.001;
      }),
      { numRuns: 100 }
    );

    console.log(`✅ ${testName}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${testName}`);
    console.log(`   Error: ${error.message}`);
    failed++;
    failures.push({ name: testName, error: error.message });
  }
}

// **Feature: budget-tracker, Property 6: Expense Calculation Correctness**
// Validates: Requirements 4.2
function testExpenseCalculationCorrectness() {
  const testName = "Property 6: Expense Calculation Correctness";

  try {
    // Generator for transaction lists with mixed types
    const transactionsArb = fc.array(
      fc.record({
        id: fc.uuid(),
        date: validDateArb,
        description: fc
          .string({ minLength: 1, maxLength: 100 })
          .filter((s) => s.trim().length > 0),
        amount: fc.integer({ min: 1, max: 100000000 }).map((n) => n / 100),
        type: fc.constantFrom("income", "expense"),
      }),
      { minLength: 0, maxLength: 30 }
    );

    fc.assert(
      fc.property(transactionsArb, (transactions) => {
        // Calculate expected expenses manually
        const expectedExpenses = transactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        // Action: calculate using DataManager
        const calculatedExpenses =
          DataManager.calculateTotalExpenses(transactions);

        // Assert: equals sum of amounts where type is 'expense'
        return Math.abs(calculatedExpenses - expectedExpenses) < 0.001;
      }),
      { numRuns: 100 }
    );

    console.log(`✅ ${testName}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${testName}`);
    console.log(`   Error: ${error.message}`);
    failed++;
    failures.push({ name: testName, error: error.message });
  }
}

// **Feature: budget-tracker, Property 7: Remaining Budget Calculation**
// Validates: Requirements 4.3
function testRemainingBudgetCalculation() {
  const testName = "Property 7: Remaining Budget Calculation";

  try {
    // Generator for budget limits and expense totals
    const budgetLimitArb = fc
      .integer({ min: 0, max: 1000000000 })
      .map((n) => n / 100);
    const totalExpensesArb = fc
      .integer({ min: 0, max: 1000000000 })
      .map((n) => n / 100);

    fc.assert(
      fc.property(
        budgetLimitArb,
        totalExpensesArb,
        (budgetLimit, totalExpenses) => {
          // Calculate expected remaining budget
          const expectedRemaining = budgetLimit - totalExpenses;

          // Action: calculate using DataManager
          const calculatedRemaining = DataManager.calculateRemainingBudget(
            budgetLimit,
            totalExpenses
          );

          // Assert: equals budgetLimit minus totalExpenses
          return Math.abs(calculatedRemaining - expectedRemaining) < 0.001;
        }
      ),
      { numRuns: 100 }
    );

    console.log(`✅ ${testName}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${testName}`);
    console.log(`   Error: ${error.message}`);
    failed++;
    failures.push({ name: testName, error: error.message });
  }
}

// **Feature: budget-tracker, Property 8: Budget Status Determination**
// Validates: Requirements 4.4, 4.5
function testBudgetStatusDetermination() {
  const testName = "Property 8: Budget Status Determination";

  try {
    // Generator for budget limits and expense totals
    const budgetLimitArb = fc
      .integer({ min: 0, max: 1000000000 })
      .map((n) => n / 100);
    const totalExpensesArb = fc
      .integer({ min: 0, max: 1000000000 })
      .map((n) => n / 100);

    fc.assert(
      fc.property(
        budgetLimitArb,
        totalExpensesArb,
        (budgetLimit, totalExpenses) => {
          // Determine expected status
          const expectedStatus =
            totalExpenses <= budgetLimit ? "within" : "over";

          // Action: determine using DataManager
          const calculatedStatus = DataManager.getBudgetStatus(
            budgetLimit,
            totalExpenses
          );

          // Assert: 'within' iff expenses <= limit, 'over' otherwise
          return calculatedStatus === expectedStatus;
        }
      ),
      { numRuns: 100 }
    );

    console.log(`✅ ${testName}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${testName}`);
    console.log(`   Error: ${error.message}`);
    failed++;
    failures.push({ name: testName, error: error.message });
  }
}

// **Feature: budget-tracker, Property 9: Month Filtering Correctness**
// Validates: Requirements 3.1
function testMonthFilteringCorrectness() {
  const testName = "Property 9: Month Filtering Correctness";

  try {
    // Generator for transactions across multiple months (2024-2025)
    const filterDateArb = fc
      .tuple(
        fc.integer({ min: 2024, max: 2025 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 28 })
      )
      .map(([year, month, day]) => {
        const m = String(month).padStart(2, "0");
        const d = String(day).padStart(2, "0");
        return `${year}-${m}-${d}`;
      });

    const transactionsArb = fc.array(
      fc.record({
        id: fc.uuid(),
        date: filterDateArb,
        description: fc
          .string({ minLength: 1, maxLength: 100 })
          .filter((s) => s.trim().length > 0),
        amount: fc.integer({ min: 1, max: 100000000 }).map((n) => n / 100),
        type: fc.constantFrom("income", "expense"),
      }),
      { minLength: 0, maxLength: 30 }
    );

    // Generator for target month/year
    const monthYearArb = fc.record({
      year: fc.integer({ min: 2024, max: 2025 }),
      month: fc.integer({ min: 1, max: 12 }),
    });

    fc.assert(
      fc.property(
        transactionsArb,
        monthYearArb,
        (transactions, { year, month }) => {
          // Setup: clear storage and set transactions
          clearStorage();
          StorageService.saveTransactions(transactions);
          DataManager.init();

          // Action: filter by month
          const filtered = DataManager.getTransactionsForMonth(year, month);

          // Calculate expected transactions manually
          const expected = transactions.filter((t) => {
            const date = new Date(t.date);
            return date.getFullYear() === year && date.getMonth() + 1 === month;
          });

          // Assert: all results have dates in that month
          const allInMonth = filtered.every((t) => {
            const date = new Date(t.date);
            return date.getFullYear() === year && date.getMonth() + 1 === month;
          });

          // Assert: no valid transactions excluded (same count as expected)
          const correctCount = filtered.length === expected.length;

          // Assert: all expected transactions are present
          const allExpectedPresent = expected.every((exp) =>
            filtered.some((f) => f.id === exp.id)
          );

          return allInMonth && correctCount && allExpectedPresent;
        }
      ),
      { numRuns: 100 }
    );

    console.log(`✅ ${testName}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${testName}`);
    console.log(`   Error: ${error.message}`);
    failed++;
    failures.push({ name: testName, error: error.message });
  }
}

// Run all tests
console.log("\n🧪 BudgetPulse Property Tests\n");
console.log("=".repeat(50));

// **Feature: budget-tracker, Property 10: Transaction Validation Rejects Invalid Input**
// Validates: Requirements 2.2, 2.3
function testTransactionValidationRejectsInvalidInput() {
  const testName = "Property 10: Transaction Validation Rejects Invalid Input";

  try {
    // Generator for invalid inputs: empty descriptions
    const emptyDescriptionArb = fc.record({
      date: validDateArb,
      description: fc.constantFrom("", "   ", "\t", "\n"),
      amount: fc.integer({ min: 1, max: 100000000 }).map((n) => n / 100),
      type: fc.constantFrom("income", "expense"),
    });

    // Generator for invalid inputs: non-positive amounts
    const nonPositiveAmountArb = fc.record({
      date: validDateArb,
      description: fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => s.trim().length > 0),
      amount: fc.oneof(
        fc.constant(0),
        fc.constant(-1),
        fc.integer({ min: -1000000, max: 0 }),
        fc.constant(NaN),
        fc.constant("invalid")
      ),
      type: fc.constantFrom("income", "expense"),
    });

    // Generator for invalid inputs: missing type
    const missingTypeArb = fc.record({
      date: validDateArb,
      description: fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => s.trim().length > 0),
      amount: fc.integer({ min: 1, max: 100000000 }).map((n) => n / 100),
      type: fc.constantFrom("", null, undefined, "invalid"),
    });

    // Generator for invalid inputs: missing date
    const missingDateArb = fc.record({
      date: fc.constantFrom("", null, undefined),
      description: fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => s.trim().length > 0),
      amount: fc.integer({ min: 1, max: 100000000 }).map((n) => n / 100),
      type: fc.constantFrom("income", "expense"),
    });

    // Test empty descriptions
    fc.assert(
      fc.property(emptyDescriptionArb, (input) => {
        const result = DataManager.validateTransaction(input);
        return (
          result.isValid === false &&
          result.errors.some((e) => e.field === "description")
        );
      }),
      { numRuns: 50 }
    );

    // Test non-positive amounts
    fc.assert(
      fc.property(nonPositiveAmountArb, (input) => {
        const result = DataManager.validateTransaction(input);
        return (
          result.isValid === false &&
          result.errors.some((e) => e.field === "amount")
        );
      }),
      { numRuns: 50 }
    );

    // Test missing/invalid type
    fc.assert(
      fc.property(missingTypeArb, (input) => {
        const result = DataManager.validateTransaction(input);
        return (
          result.isValid === false &&
          result.errors.some((e) => e.field === "type")
        );
      }),
      { numRuns: 50 }
    );

    // Test missing date
    fc.assert(
      fc.property(missingDateArb, (input) => {
        const result = DataManager.validateTransaction(input);
        return (
          result.isValid === false &&
          result.errors.some((e) => e.field === "date")
        );
      }),
      { numRuns: 50 }
    );

    console.log(`✅ ${testName}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${testName}`);
    console.log(`   Error: ${error.message}`);
    failed++;
    failures.push({ name: testName, error: error.message });
  }
}

testTransactionSerializationRoundTrip();
testBudgetLimitPersistenceRoundTrip();
testTransactionAdditionIncreasesCount();
testTransactionDeletionDecreasesCount();
testIncomeCalculationCorrectness();
testExpenseCalculationCorrectness();
testRemainingBudgetCalculation();
testBudgetStatusDetermination();
testMonthFilteringCorrectness();
testTransactionValidationRejectsInvalidInput();

console.log("=".repeat(50));
console.log(`\nSummary: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
