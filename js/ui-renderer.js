/**
 * UIRenderer - Handles all DOM manipulation and UI updates
 * Renders transactions, summaries, and manages form state
 *
 * This module uses the IIFE pattern to avoid global namespace pollution
 * while exposing a clean public API for UI rendering operations.
 *
 * Requirements: 3.2, 3.3, 3.4, 4.4, 4.5, 7.4, 1.2
 */
const UIRenderer = (function () {
  "use strict";

  // ============================================================
  // DOM ELEMENT REFERENCES
  // ============================================================

  /**
   * Cached DOM element references for performance
   * These are initialized when the module loads
   */
  const elements = {
    // Transaction list elements
    transactionList: document.getElementById("transaction-list"),
    transactionTable: document.getElementById("transaction-table"),
    emptyMessage: document.getElementById("empty-message"),

    // Summary elements
    totalIncome: document.getElementById("total-income"),
    totalExpenses: document.getElementById("total-expenses"),
    remainingBudget: document.getElementById("remaining-budget"),
    budgetStatus: document.getElementById("budget-status"),

    // Form elements
    transactionForm: document.getElementById("transaction-form"),
    dateInput: document.getElementById("transaction-date"),
    typeInput: document.getElementById("transaction-type"),
    descriptionInput: document.getElementById("transaction-description"),
    amountInput: document.getElementById("transaction-amount"),

    // Error message elements
    dateError: document.getElementById("date-error"),
    typeError: document.getElementById("type-error"),
    descriptionError: document.getElementById("description-error"),
    amountError: document.getElementById("amount-error"),

    // Month selector
    monthSelect: document.getElementById("month-select"),

    // Budget input
    budgetLimitInput: document.getElementById("budget-limit"),
  };

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  /**
   * Formats a number as currency (USD)
   *
   * @param {number} amount - The amount to format
   * @returns {string} Formatted currency string (e.g., "$1,234.56")
   */
  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  /**
   * Formats a date string for display
   *
   * @param {string} dateString - ISO date string (YYYY-MM-DD)
   * @returns {string} Formatted date string (e.g., "Jan 15, 2025")
   */
  function formatDate(dateString) {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // ============================================================
  // TRANSACTION LIST RENDERING
  // Requirements: 3.2, 3.3, 3.4, 7.4
  // ============================================================

  /**
   * Renders the transaction list in the table
   * Shows date, description, type with color indicator, and amount
   * Adds delete button with Font Awesome icon to each row
   *
   * @param {Array} transactions - Array of transaction objects to display
   * Requirements: 3.2 - show date, description, type with color indicator, and amount
   * Requirements: 3.3 - display income with green color indicator
   * Requirements: 3.4 - display expense with red color indicator
   * Requirements: 7.4 - display icons for actions including delete
   */
  function renderTransactionList(transactions) {
    const tbody = elements.transactionList;

    // Clear existing rows
    tbody.innerHTML = "";

    // Show/hide empty message based on transaction count
    if (transactions.length === 0) {
      elements.emptyMessage.style.display = "block";
      elements.transactionTable.style.display = "none";
      return;
    }

    elements.emptyMessage.style.display = "none";
    elements.transactionTable.style.display = "table";

    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Create table rows for each transaction
    sortedTransactions.forEach((transaction) => {
      const row = createTransactionRow(transaction);
      tbody.appendChild(row);
    });
  }

  /**
   * Creates a table row element for a transaction
   *
   * @param {Object} transaction - Transaction object
   * @returns {HTMLTableRowElement} The created table row
   */
  function createTransactionRow(transaction) {
    const row = document.createElement("tr");
    row.dataset.transactionId = transaction.id;

    // Date cell
    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(transaction.date);
    row.appendChild(dateCell);

    // Description cell
    const descCell = document.createElement("td");
    descCell.textContent = transaction.description;
    row.appendChild(descCell);

    // Type cell with color indicator
    const typeCell = document.createElement("td");
    const typeSpan = document.createElement("span");
    typeSpan.className = `transaction-type ${transaction.type}`;

    // Add icon based on type
    const icon = document.createElement("i");
    icon.className =
      transaction.type === "income" ? "fas fa-arrow-up" : "fas fa-arrow-down";
    typeSpan.appendChild(icon);

    const typeText = document.createTextNode(
      " " + transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)
    );
    typeSpan.appendChild(typeText);
    typeCell.appendChild(typeSpan);
    row.appendChild(typeCell);

    // Amount cell with color based on type
    const amountCell = document.createElement("td");
    const amountSpan = document.createElement("span");
    amountSpan.className = `transaction-amount ${transaction.type}`;
    amountSpan.textContent =
      (transaction.type === "income" ? "+" : "-") +
      formatCurrency(transaction.amount);
    amountCell.appendChild(amountSpan);
    row.appendChild(amountCell);

    // Action cell with delete button
    const actionCell = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger";
    deleteBtn.dataset.transactionId = transaction.id;
    deleteBtn.setAttribute("aria-label", "Delete transaction");
    deleteBtn.title = "Delete transaction";

    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fas fa-trash-alt";
    deleteBtn.appendChild(deleteIcon);

    actionCell.appendChild(deleteBtn);
    row.appendChild(actionCell);

    return row;
  }

  // ============================================================
  // SUMMARY RENDERING
  // Requirements: 4.4, 4.5
  // ============================================================

  /**
   * Renders the summary statistics display
   * Updates total income, total expenses, and remaining budget
   *
   * @param {Object} summary - Summary data object
   * @param {number} summary.budgetLimit - The budget limit
   * @param {number} summary.totalIncome - Total income amount
   * @param {number} summary.totalExpenses - Total expenses amount
   * @param {number} summary.remainingBudget - Remaining budget amount
   * @param {string} summary.status - Budget status ('within' or 'over')
   */
  function renderSummary(summary) {
    // Update total income
    if (elements.totalIncome) {
      elements.totalIncome.textContent = formatCurrency(summary.totalIncome);
    }

    // Update total expenses
    if (elements.totalExpenses) {
      elements.totalExpenses.textContent = formatCurrency(
        summary.totalExpenses
      );
    }

    // Update remaining budget
    if (elements.remainingBudget) {
      elements.remainingBudget.textContent = formatCurrency(
        summary.remainingBudget
      );

      // Add visual indicator for negative remaining budget
      if (summary.remainingBudget < 0) {
        elements.remainingBudget.classList.add("expense");
        elements.remainingBudget.classList.remove("income");
      } else {
        elements.remainingBudget.classList.remove("expense");
        elements.remainingBudget.classList.add("income");
      }
    }

    // Update budget status
    renderBudgetStatus(summary.status);
  }

  /**
   * Renders the budget status indicator
   * Shows green "Within Budget" or red "Over Budget"
   *
   * @param {string} status - 'within' or 'over'
   * Requirements: 4.4 - display green "Within Budget" status
   * Requirements: 4.5 - display red "Over Budget" status
   */
  function renderBudgetStatus(status) {
    if (!elements.budgetStatus) return;

    // Clear existing classes and content
    elements.budgetStatus.className = "budget-status";
    elements.budgetStatus.innerHTML = "";

    // Add appropriate class and content based on status
    if (status === "within") {
      elements.budgetStatus.classList.add("within");

      const icon = document.createElement("i");
      icon.className = "fas fa-check-circle";
      elements.budgetStatus.appendChild(icon);

      const text = document.createTextNode(" Within Budget");
      elements.budgetStatus.appendChild(text);
    } else {
      elements.budgetStatus.classList.add("over");

      const icon = document.createElement("i");
      icon.className = "fas fa-exclamation-circle";
      elements.budgetStatus.appendChild(icon);

      const text = document.createTextNode(" Over Budget");
      elements.budgetStatus.appendChild(text);
    }
  }

  // ============================================================
  // FORM HANDLING
  // ============================================================

  /**
   * Clears the transaction form after successful submission
   * Resets all input fields to their default values
   */
  function clearTransactionForm() {
    if (elements.transactionForm) {
      elements.transactionForm.reset();
    }

    // Set date to today by default
    if (elements.dateInput) {
      const today = new Date().toISOString().split("T")[0];
      elements.dateInput.value = today;
    }

    // Clear any validation errors
    clearValidationErrors();
  }

  /**
   * Shows a validation error message for a specific field
   * Adds error styling to the input and displays the message
   *
   * @param {string} field - Field name ('date', 'type', 'description', 'amount')
   * @param {string} message - Error message to display
   */
  function showValidationError(field, message) {
    // Map field names to error elements
    const errorElements = {
      date: elements.dateError,
      type: elements.typeError,
      description: elements.descriptionError,
      amount: elements.amountError,
    };

    // Map field names to input elements
    const inputElements = {
      date: elements.dateInput,
      type: elements.typeInput,
      description: elements.descriptionInput,
      amount: elements.amountInput,
    };

    const errorElement = errorElements[field];
    const inputElement = inputElements[field];

    if (errorElement) {
      errorElement.textContent = message;
    }

    if (inputElement) {
      inputElement.classList.add("error");
    }
  }

  /**
   * Clears all validation error messages and styling
   * Removes error classes from inputs and clears error text
   */
  function clearValidationErrors() {
    // Clear error messages
    const errorElements = [
      elements.dateError,
      elements.typeError,
      elements.descriptionError,
      elements.amountError,
    ];

    errorElements.forEach((el) => {
      if (el) {
        el.textContent = "";
      }
    });

    // Remove error classes from inputs
    const inputElements = [
      elements.dateInput,
      elements.typeInput,
      elements.descriptionInput,
      elements.amountInput,
    ];

    inputElements.forEach((el) => {
      if (el) {
        el.classList.remove("error");
      }
    });
  }

  // ============================================================
  // MONTH SELECTOR
  // Requirements: 1.2
  // ============================================================

  /**
   * Initializes the month selector with the current month
   * Sets the default value to the current month on page load
   *
   * Requirements: 1.2 - default to current month on page load
   */
  function initializeMonthSelector() {
    if (!elements.monthSelect) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth() returns 0-11

    updateMonthSelector(year, month);
  }

  /**
   * Updates the month selector to show the specified month/year
   * Sets the value of the month input element
   *
   * @param {number} year - The year (e.g., 2025)
   * @param {number} month - The month (1-12)
   * Requirements: 1.2 - display budget limit for selected month
   */
  function updateMonthSelector(year, month) {
    if (!elements.monthSelect) return;

    // Format as YYYY-MM for the month input
    const monthStr = String(month).padStart(2, "0");
    elements.monthSelect.value = `${year}-${monthStr}`;
  }

  /**
   * Gets the currently selected month from the month selector
   *
   * @returns {Object|null} Object with year and month, or null if not set
   */
  function getSelectedMonth() {
    if (!elements.monthSelect || !elements.monthSelect.value) {
      return null;
    }

    const [year, month] = elements.monthSelect.value.split("-").map(Number);
    return { year, month };
  }

  /**
   * Parses a month input value string into year and month
   *
   * @param {string} value - Month input value in format "YYYY-MM"
   * @returns {Object|null} Object with year and month, or null if invalid
   */
  function parseMonthValue(value) {
    if (!value || typeof value !== "string") {
      return null;
    }

    const parts = value.split("-");
    if (parts.length !== 2) {
      return null;
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return null;
    }

    return { year, month };
  }

  /**
   * Updates the budget limit input display
   *
   * @param {number} limit - The budget limit to display
   */
  function updateBudgetLimitDisplay(limit) {
    if (elements.budgetLimitInput) {
      elements.budgetLimitInput.value = limit > 0 ? limit.toFixed(2) : "";
    }
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    // Transaction list rendering
    renderTransactionList: renderTransactionList,

    // Summary rendering
    renderSummary: renderSummary,
    renderBudgetStatus: renderBudgetStatus,

    // Form handling
    clearTransactionForm: clearTransactionForm,
    showValidationError: showValidationError,
    clearValidationErrors: clearValidationErrors,

    // Month selector
    initializeMonthSelector: initializeMonthSelector,
    updateMonthSelector: updateMonthSelector,
    getSelectedMonth: getSelectedMonth,
    parseMonthValue: parseMonthValue,

    // Budget display
    updateBudgetLimitDisplay: updateBudgetLimitDisplay,

    // Utility functions (exposed for potential external use)
    formatCurrency: formatCurrency,
    formatDate: formatDate,

    // Element references (for AppController to attach event listeners)
    elements: elements,
  };
})();
