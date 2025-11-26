/**
 * AppController - Orchestrates all modules and handles user interactions
 * Main entry point for the BudgetPulse application
 *
 * This module uses the IIFE pattern to avoid global namespace pollution
 * while exposing a clean public API for application control.
 *
 * Requirements: 6.4, 9.2, 9.3, 2.1, 2.2, 2.3, 2.4, 1.1, 1.2, 1.4, 3.1
 */
const AppController = (function () {
  "use strict";

  // ============================================================
  // PRIVATE STATE
  // ============================================================

  /**
   * Flag to track if the app has been initialized
   * @type {boolean}
   */
  let initialized = false;

  /**
   * Storage key for first run check
   * @type {string}
   */
  const FIRST_RUN_KEY = "budgetpulse_initialized";

  // ============================================================
  // INITIALIZATION
  // Requirements: 6.4, 9.2, 9.3
  // ============================================================

  /**
   * Initializes the application on page load
   * Sets up all modules, event listeners, and loads initial data
   *
   * Requirements: 9.2 - organize JavaScript using module pattern
   * Requirements: 9.3 - separate concerns with distinct functions
   */
  function init() {
    if (initialized) {
      console.warn("AppController: Already initialized");
      return;
    }

    // Initialize DataManager (loads transactions from storage)
    DataManager.init();

    // Load seed data if this is the first run
    loadSeedDataIfFirstRun();

    // Initialize UI components
    UIRenderer.initializeMonthSelector();

    // Initialize chart
    const chartCanvas = document.getElementById("budget-chart");
    if (chartCanvas) {
      ChartManager.initializeChart(chartCanvas);
    }

    // Wire up event listeners
    setupEventListeners();

    // Set initial selected month in DataManager
    const selectedMonth = UIRenderer.getSelectedMonth();
    if (selectedMonth) {
      DataManager.setSelectedMonth(selectedMonth.year, selectedMonth.month);
    }

    // Refresh UI with current data
    refreshUI();

    initialized = true;
    console.log("BudgetPulse initialized successfully");
  }

  /**
   * Loads seed data if this is the first time the app is run
   * Populates localStorage with example transactions for demonstration
   *
   * Requirements: 6.4 - populate localStorage with example seed data on first run
   */
  function loadSeedDataIfFirstRun() {
    // Check if app has been initialized before
    const hasRun = localStorage.getItem(FIRST_RUN_KEY);
    if (hasRun) {
      return;
    }

    // Get current date info for seed data
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStr = String(month).padStart(2, "0");

    // Create sample transactions for current month
    const seedTransactions = [
      {
        date: `${year}-${monthStr}-01`,
        description: "Monthly Salary",
        amount: 5000,
        type: "income",
      },
      {
        date: `${year}-${monthStr}-03`,
        description: "Freelance Project",
        amount: 800,
        type: "income",
      },
      {
        date: `${year}-${monthStr}-05`,
        description: "Rent Payment",
        amount: 1500,
        type: "expense",
      },
      {
        date: `${year}-${monthStr}-07`,
        description: "Grocery Shopping",
        amount: 250,
        type: "expense",
      },
      {
        date: `${year}-${monthStr}-10`,
        description: "Utility Bills",
        amount: 150,
        type: "expense",
      },
      {
        date: `${year}-${monthStr}-12`,
        description: "Internet & Phone",
        amount: 100,
        type: "expense",
      },
      {
        date: `${year}-${monthStr}-15`,
        description: "Dining Out",
        amount: 75,
        type: "expense",
      },
    ];

    // Add seed transactions
    seedTransactions.forEach((transaction) => {
      DataManager.addTransaction(transaction);
    });

    // Set default budget limit for current month
    DataManager.setBudgetLimit(year, month, 3000);

    // Mark as initialized
    localStorage.setItem(FIRST_RUN_KEY, "true");

    console.log("Seed data loaded for first run");
  }

  // ============================================================
  // EVENT LISTENERS SETUP
  // ============================================================

  /**
   * Sets up all event listeners for user interactions
   * Wires up form submission, delete buttons, month change, and budget change
   */
  function setupEventListeners() {
    // Transaction form submission
    const transactionForm = UIRenderer.elements.transactionForm;
    if (transactionForm) {
      transactionForm.addEventListener("submit", handleAddTransaction);
    }

    // Delete button clicks (using event delegation on transaction list)
    const transactionList = UIRenderer.elements.transactionList;
    if (transactionList) {
      transactionList.addEventListener("click", function (event) {
        const deleteBtn = event.target.closest(".btn-danger");
        if (deleteBtn) {
          const transactionId = deleteBtn.dataset.transactionId;
          if (transactionId) {
            handleDeleteTransaction(transactionId);
          }
        }
      });
    }

    // Month selector change
    const monthSelect = UIRenderer.elements.monthSelect;
    if (monthSelect) {
      monthSelect.addEventListener("change", function (event) {
        const parsed = UIRenderer.parseMonthValue(event.target.value);
        if (parsed) {
          handleMonthChange(parsed.year, parsed.month);
        }
      });
    }

    // Budget limit change
    const setBudgetBtn = document.getElementById("set-budget-btn");
    if (setBudgetBtn) {
      setBudgetBtn.addEventListener("click", function () {
        const budgetInput = UIRenderer.elements.budgetLimitInput;
        if (budgetInput) {
          const limit = parseFloat(budgetInput.value);
          handleBudgetLimitChange(limit);
        }
      });
    }

    // Also handle Enter key on budget input
    const budgetInput = UIRenderer.elements.budgetLimitInput;
    if (budgetInput) {
      budgetInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          const limit = parseFloat(budgetInput.value);
          handleBudgetLimitChange(limit);
        }
      });
    }
  }

  // ============================================================
  // UI REFRESH
  // ============================================================

  /**
   * Refreshes all UI components after data changes
   * Updates transaction list, summary, and chart
   */
  function refreshUI() {
    const selectedMonth = DataManager.getSelectedMonth();
    const { year, month } = selectedMonth;

    // Get transactions for selected month
    const monthTransactions = DataManager.getTransactionsForMonth(year, month);

    // Calculate summary values
    const budgetLimit = DataManager.getBudgetLimit(year, month);
    const totalIncome = DataManager.calculateTotalIncome(monthTransactions);
    const totalExpenses = DataManager.calculateTotalExpenses(monthTransactions);
    const remainingBudget = DataManager.calculateRemainingBudget(
      budgetLimit,
      totalExpenses
    );
    const status = DataManager.getBudgetStatus(budgetLimit, totalExpenses);

    // Create summary object
    const summary = {
      budgetLimit: budgetLimit,
      totalIncome: totalIncome,
      totalExpenses: totalExpenses,
      remainingBudget: remainingBudget,
      status: status,
    };

    // Update UI components
    UIRenderer.renderTransactionList(monthTransactions);
    UIRenderer.renderSummary(summary);
    UIRenderer.updateBudgetLimitDisplay(budgetLimit);

    // Update chart
    ChartManager.updateChart(totalIncome, totalExpenses);
  }

  // ============================================================
  // EVENT HANDLERS
  // Requirements: 2.1, 2.2, 2.3, 2.4, 1.1, 1.2, 1.4, 3.1
  // ============================================================

  /**
   * Handles transaction form submission
   * Validates input, adds transaction, and refreshes UI
   *
   * @param {Event} event - Form submit event
   * Requirements: 2.1 - create new transaction record and save to localStorage
   * Requirements: 2.2 - display validation errors and prevent submission
   * Requirements: 2.3 - reject non-positive amounts with error message
   */
  function handleAddTransaction(event) {
    event.preventDefault();

    // Clear previous validation errors
    UIRenderer.clearValidationErrors();

    // Get form values
    const dateInput = UIRenderer.elements.dateInput;
    const typeInput = UIRenderer.elements.typeInput;
    const descriptionInput = UIRenderer.elements.descriptionInput;
    const amountInput = UIRenderer.elements.amountInput;

    const transactionData = {
      date: dateInput ? dateInput.value : "",
      type: typeInput ? typeInput.value : "",
      description: descriptionInput ? descriptionInput.value : "",
      amount: amountInput ? amountInput.value : "",
    };

    // Validate input
    const validation = DataManager.validateTransaction(transactionData);

    if (!validation.isValid) {
      // Display validation errors
      validation.errors.forEach((error) => {
        UIRenderer.showValidationError(error.field, error.message);
      });
      return;
    }

    // Add transaction with parsed amount
    const transaction = {
      date: transactionData.date,
      type: transactionData.type,
      description: transactionData.description.trim(),
      amount: parseFloat(transactionData.amount),
    };

    DataManager.addTransaction(transaction);

    // Clear form and refresh UI
    UIRenderer.clearTransactionForm();
    refreshUI();
  }

  /**
   * Handles transaction deletion
   * Removes transaction and refreshes all UI components
   *
   * @param {string} id - ID of transaction to delete
   * Requirements: 2.4 - remove transaction from localStorage and update displays
   */
  function handleDeleteTransaction(id) {
    const deleted = DataManager.deleteTransaction(id);
    if (deleted) {
      refreshUI();
    }
  }

  /**
   * Handles month change from selector
   * Filters transactions and updates all displays for new month
   *
   * @param {number} year - Selected year
   * @param {number} month - Selected month (1-12)
   * Requirements: 1.2 - display budget limit for selected month
   * Requirements: 3.1 - display only transactions within selected month
   */
  function handleMonthChange(year, month) {
    DataManager.setSelectedMonth(year, month);
    refreshUI();
  }

  /**
   * Handles budget limit change
   * Validates input, saves to storage, and refreshes summary
   *
   * @param {number} limit - New budget limit value
   * Requirements: 1.1 - save budget limit to localStorage for selected month
   * Requirements: 1.4 - reject non-positive numbers and maintain current limit
   */
  function handleBudgetLimitChange(limit) {
    // Validate positive number
    if (isNaN(limit) || limit <= 0) {
      // Keep current value - don't update
      const selectedMonth = DataManager.getSelectedMonth();
      const currentLimit = DataManager.getBudgetLimit(
        selectedMonth.year,
        selectedMonth.month
      );
      UIRenderer.updateBudgetLimitDisplay(currentLimit);
      return;
    }

    // Save new budget limit
    const selectedMonth = DataManager.getSelectedMonth();
    DataManager.setBudgetLimit(selectedMonth.year, selectedMonth.month, limit);

    // Refresh UI to show updated summary
    refreshUI();
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    init: init,
    loadSeedDataIfFirstRun: loadSeedDataIfFirstRun,
    handleAddTransaction: handleAddTransaction,
    handleDeleteTransaction: handleDeleteTransaction,
    handleMonthChange: handleMonthChange,
    handleBudgetLimitChange: handleBudgetLimitChange,
    refreshUI: refreshUI,
  };
})();

// ============================================================
// AUTO-INITIALIZE ON DOM READY
// ============================================================

/**
 * Initialize the application when the DOM is fully loaded
 */
document.addEventListener("DOMContentLoaded", function () {
  AppController.init();
});
