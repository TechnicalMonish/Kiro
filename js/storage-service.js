/**
 * StorageService - Handles all localStorage operations
 * Provides methods for persisting and retrieving transactions and budget data
 *
 * This module uses the IIFE (Immediately Invoked Function Expression) pattern
 * to avoid polluting the global namespace while exposing a clean public API.
 *
 * Requirements: 6.1, 6.2, 6.3, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3
 */
const StorageService = (function () {
  "use strict";

  // Storage keys used for localStorage
  const TRANSACTIONS_KEY = "budgetpulse_transactions";
  const BUDGETS_KEY = "budgetpulse_budgets";

  /**
   * Retrieves all transactions from localStorage
   * Deserializes JSON data back to transaction objects
   *
   * @returns {Array} Array of transaction objects, or empty array if none exist
   * Requirements: 10.2 - deserialize JSON data back to transaction objects
   */
  function getTransactions() {
    try {
      const data = localStorage.getItem(TRANSACTIONS_KEY);
      if (data === null) {
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      console.error("Error retrieving transactions from localStorage:", error);
      return [];
    }
  }

  /**
   * Saves transactions array to localStorage
   * Serializes transaction objects to JSON format
   *
   * @param {Array} transactions - Array of transaction objects to save
   * Requirements: 6.1, 6.2 - immediately persist transactions to localStorage
   * Requirements: 10.1 - serialize transaction objects to JSON format
   */
  function saveTransactions(transactions) {
    try {
      const data = JSON.stringify(transactions);
      localStorage.setItem(TRANSACTIONS_KEY, data);
    } catch (error) {
      console.error("Error saving transactions to localStorage:", error);
      throw error;
    }
  }

  /**
   * Retrieves the budget limit for a specific month
   *
   * @param {string} monthKey - Month key in format "YYYY-MM"
   * @returns {number} Budget limit for the month, or 0 if not set
   * Requirements: 1.2, 1.3 - retrieve budget limit for selected month
   */
  function getBudgetLimit(monthKey) {
    try {
      const data = localStorage.getItem(BUDGETS_KEY);
      if (data === null) {
        return 0;
      }
      const budgets = JSON.parse(data);
      return budgets[monthKey] !== undefined ? budgets[monthKey] : 0;
    } catch (error) {
      console.error("Error retrieving budget limit from localStorage:", error);
      return 0;
    }
  }

  /**
   * Saves a budget limit for a specific month
   *
   * @param {string} monthKey - Month key in format "YYYY-MM"
   * @param {number} limit - Budget limit value to save
   * Requirements: 6.3 - immediately persist budget limit to localStorage keyed by month/year
   */
  function saveBudgetLimit(monthKey, limit) {
    try {
      const data = localStorage.getItem(BUDGETS_KEY);
      let budgets = {};
      if (data !== null) {
        budgets = JSON.parse(data);
      }
      budgets[monthKey] = limit;
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    } catch (error) {
      console.error("Error saving budget limit to localStorage:", error);
      throw error;
    }
  }

  /**
   * Generates a month key string from year and month values
   * Used for consistent key formatting across the application
   *
   * @param {number} year - The year (e.g., 2025)
   * @param {number} month - The month (1-12)
   * @returns {string} Month key in format "YYYY-MM"
   */
  function generateMonthKey(year, month) {
    return `${year}-${String(month).padStart(2, "0")}`;
  }

  // Public API - expose methods for use by other modules
  return {
    getTransactions: getTransactions,
    saveTransactions: saveTransactions,
    getBudgetLimit: getBudgetLimit,
    saveBudgetLimit: saveBudgetLimit,
    generateMonthKey: generateMonthKey,
  };
})();
