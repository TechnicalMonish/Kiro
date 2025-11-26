/**
 * DataManager - Manages application state and business logic
 * Handles transactions, budget calculations, and validation
 *
 * This module uses the IIFE pattern to avoid global namespace pollution
 * while exposing a clean public API for transaction and budget management.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 4.1, 4.2, 4.3, 4.4, 4.5
 */
const DataManager = (function () {
  "use strict";

  // ============================================================
  // STATE MANAGEMENT
  // ============================================================

  /**
   * Application state
   * - transactions: Array of all transaction objects
   * - budgetLimits: Object mapping month keys to budget limits
   * - selectedMonth: Currently selected month/year for viewing
   */
  let transactions = [];
  let budgetLimits = {};
  let selectedMonth = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================

  /**
   * Initializes the DataManager by loading data from storage
   */
  function init() {
    transactions = StorageService.getTransactions();
  }

  // ============================================================
  // TRANSACTION OPERATIONS
  // Requirements: 2.1, 2.4, 3.1
  // ============================================================

  /**
   * Generates a unique ID for a new transaction
   * Uses timestamp + random string for uniqueness
   *
   * @returns {string} Unique transaction ID
   */
  function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Adds a new transaction to the list
   * Generates a unique ID and persists to storage
   *
   * @param {Object} transactionData - Transaction data without ID
   * @returns {Object} The created transaction with generated ID
   * Requirements: 2.1 - create new transaction record and save to localStorage
   */
  function addTransaction(transactionData) {
    const transaction = {
      id: generateId(),
      date: transactionData.date,
      description: transactionData.description,
      amount: transactionData.amount,
      type: transactionData.type,
    };

    transactions.push(transaction);
    StorageService.saveTransactions(transactions);

    return transaction;
  }

  /**
   * Deletes a transaction by ID
   * Removes from list and updates storage
   *
   * @param {string} id - ID of transaction to delete
   * @returns {boolean} True if transaction was found and deleted
   * Requirements: 2.4 - remove transaction from localStorage
   */
  function deleteTransaction(id) {
    const initialLength = transactions.length;
    transactions = transactions.filter((t) => t.id !== id);

    if (transactions.length < initialLength) {
      StorageService.saveTransactions(transactions);
      return true;
    }

    return false;
  }

  /**
   * Gets all transactions for a specific month
   * Filters transactions by year and month from their date
   *
   * @param {number} year - The year to filter by
   * @param {number} month - The month to filter by (1-12)
   * @returns {Array} Transactions that fall within the specified month
   * Requirements: 3.1 - display only transactions within selected month
   */
  function getTransactionsForMonth(year, month) {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
  }

  /**
   * Gets all transactions
   *
   * @returns {Array} All transactions
   */
  function getAllTransactions() {
    return [...transactions];
  }

  // ============================================================
  // BUDGET OPERATIONS
  // ============================================================

  /**
   * Sets the budget limit for a specific month
   *
   * @param {number} year - The year
   * @param {number} month - The month (1-12)
   * @param {number} limit - The budget limit value
   */
  function setBudgetLimit(year, month, limit) {
    const monthKey = StorageService.generateMonthKey(year, month);
    budgetLimits[monthKey] = limit;
    StorageService.saveBudgetLimit(monthKey, limit);
  }

  /**
   * Gets the budget limit for a specific month
   *
   * @param {number} year - The year
   * @param {number} month - The month (1-12)
   * @returns {number} Budget limit for the month, or 0 if not set
   */
  function getBudgetLimit(year, month) {
    const monthKey = StorageService.generateMonthKey(year, month);
    if (budgetLimits[monthKey] !== undefined) {
      return budgetLimits[monthKey];
    }
    const stored = StorageService.getBudgetLimit(monthKey);
    budgetLimits[monthKey] = stored;
    return stored;
  }

  // ============================================================
  // SELECTED MONTH OPERATIONS
  // ============================================================

  /**
   * Sets the currently selected month
   *
   * @param {number} year - The year
   * @param {number} month - The month (1-12)
   */
  function setSelectedMonth(year, month) {
    selectedMonth = { year, month };
  }

  /**
   * Gets the currently selected month
   *
   * @returns {Object} Object with year and month properties
   */
  function getSelectedMonth() {
    return { ...selectedMonth };
  }

  // ============================================================
  // CALCULATION FUNCTIONS
  // Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
  // ============================================================

  /**
   * Calculates total income from a list of transactions
   * Sums amounts where type is 'income'
   *
   * @param {Array} transactionList - Array of transactions to sum
   * @returns {number} Total income amount
   * Requirements: 4.1 - calculate and display total income
   */
  function calculateTotalIncome(transactionList) {
    return transactionList
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Calculates total expenses from a list of transactions
   * Sums amounts where type is 'expense'
   *
   * @param {Array} transactionList - Array of transactions to sum
   * @returns {number} Total expenses amount
   * Requirements: 4.2 - calculate and display total expenses
   */
  function calculateTotalExpenses(transactionList) {
    return transactionList
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Calculates remaining budget
   *
   * @param {number} budgetLimit - The budget limit
   * @param {number} totalExpenses - Total expenses
   * @returns {number} Remaining budget (can be negative if over budget)
   * Requirements: 4.3 - calculate remaining budget as limit minus expenses
   */
  function calculateRemainingBudget(budgetLimit, totalExpenses) {
    return budgetLimit - totalExpenses;
  }

  /**
   * Determines budget status based on expenses vs limit
   *
   * @param {number} budgetLimit - The budget limit
   * @param {number} totalExpenses - Total expenses
   * @returns {string} 'within' if expenses <= limit, 'over' otherwise
   * Requirements: 4.4, 4.5 - display within/over budget status
   */
  function getBudgetStatus(budgetLimit, totalExpenses) {
    return totalExpenses <= budgetLimit ? "within" : "over";
  }

  // ============================================================
  // VALIDATION
  // Requirements: 2.2, 2.3
  // ============================================================

  /**
   * Validates transaction input data
   * Checks for required fields and valid values
   *
   * @param {Object} data - Transaction input data to validate
   * @returns {Object} ValidationResult with isValid and errors array
   * Requirements: 2.2 - display validation errors and prevent submission
   * Requirements: 2.3 - reject non-positive amounts with error message
   */
  function validateTransaction(data) {
    const errors = [];

    // Check required fields
    if (!data.date || data.date.trim() === "") {
      errors.push({ field: "date", message: "Date is required" });
    }

    if (!data.description || data.description.trim() === "") {
      errors.push({ field: "description", message: "Description is required" });
    }

    // Validate amount
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push({
        field: "amount",
        message: "Amount must be a positive number",
      });
    }

    // Validate type
    if (!data.type || (data.type !== "income" && data.type !== "expense")) {
      errors.push({
        field: "type",
        message: "Please select income or expense",
      });
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    // Initialization
    init: init,

    // State accessors (for testing/debugging)
    get transactions() {
      return [...transactions];
    },
    get budgetLimits() {
      return { ...budgetLimits };
    },
    get selectedMonth() {
      return { ...selectedMonth };
    },

    // Transaction operations
    addTransaction: addTransaction,
    deleteTransaction: deleteTransaction,
    getTransactionsForMonth: getTransactionsForMonth,
    getAllTransactions: getAllTransactions,

    // Budget operations
    setBudgetLimit: setBudgetLimit,
    getBudgetLimit: getBudgetLimit,

    // Selected month operations
    setSelectedMonth: setSelectedMonth,
    getSelectedMonth: getSelectedMonth,

    // Calculations
    calculateTotalIncome: calculateTotalIncome,
    calculateTotalExpenses: calculateTotalExpenses,
    calculateRemainingBudget: calculateRemainingBudget,
    getBudgetStatus: getBudgetStatus,

    // Validation
    validateTransaction: validateTransaction,
  };
})();
