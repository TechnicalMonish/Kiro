/**
 * ChartManager - Manages Chart.js instance and chart updates
 * Handles income vs expenses visualization with dark theme styling
 *
 * This module uses the IIFE pattern to avoid global namespace pollution
 * while exposing a clean public API for chart operations.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
const ChartManager = (function () {
  "use strict";

  // ============================================================
  // PRIVATE STATE
  // ============================================================

  /**
   * Chart.js instance reference
   * @type {Chart|null}
   */
  let chart = null;

  /**
   * Reference to the canvas element
   * @type {HTMLCanvasElement|null}
   */
  let canvasElement = null;

  /**
   * Flag indicating if Chart.js is available
   * @type {boolean}
   */
  let chartJsAvailable = typeof Chart !== "undefined";

  // ============================================================
  // CHART CONFIGURATION
  // Dark theme colors matching app design from styles.css
  // ============================================================

  /**
   * Color configuration matching the app's dark theme
   * These values correspond to CSS custom properties in styles.css
   */
  const colors = {
    income: "#10b981", // --color-income
    incomeBg: "rgba(16, 185, 129, 0.7)",
    expense: "#ef4444", // --color-expense
    expenseBg: "rgba(239, 68, 68, 0.7)",
    textPrimary: "#eaeaea", // --text-primary
    textSecondary: "#a0a0a0", // --text-secondary
    gridColor: "rgba(255, 255, 255, 0.1)",
    bgSecondary: "#1a1a2e", // --bg-secondary
  };

  /**
   * Creates the Chart.js configuration object
   * Configures a bar chart with dark theme styling
   *
   * @param {number} income - Total income amount
   * @param {number} expenses - Total expenses amount
   * @returns {Object} Chart.js configuration object
   */
  function createChartConfig(income, expenses) {
    return {
      type: "bar",
      data: {
        labels: ["Income", "Expenses"],
        datasets: [
          {
            label: "Amount ($)",
            data: [income, expenses],
            backgroundColor: [colors.incomeBg, colors.expenseBg],
            borderColor: [colors.income, colors.expense],
            borderWidth: 2,
            borderRadius: 8,
            barThickness: 60,
            maxBarThickness: 80,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: colors.bgSecondary,
            titleColor: colors.textPrimary,
            bodyColor: colors.textSecondary,
            borderColor: colors.gridColor,
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function (context) {
                const value = context.parsed.y;
                return formatCurrency(value);
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: colors.textSecondary,
              font: {
                size: 14,
                weight: "600",
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: colors.gridColor,
            },
            ticks: {
              color: colors.textSecondary,
              font: {
                size: 12,
              },
              callback: function (value) {
                return formatCurrency(value);
              },
            },
          },
        },
        animation: {
          duration: 500,
          easing: "easeOutQuart",
        },
      },
    };
  }

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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Shows the fallback display when Chart.js is unavailable
   * Updates the fallback element with income and expense values
   *
   * @param {number} income - Total income amount
   * @param {number} expenses - Total expenses amount
   */
  function showFallback(income, expenses) {
    const fallbackElement = document.getElementById("chart-fallback");
    const canvasEl = document.getElementById("budget-chart");
    const fallbackIncome = document.getElementById("fallback-income");
    const fallbackExpenses = document.getElementById("fallback-expenses");

    if (canvasEl) {
      canvasEl.style.display = "none";
    }

    if (fallbackElement) {
      fallbackElement.style.display = "block";
    }

    if (fallbackIncome) {
      fallbackIncome.textContent = formatCurrency(income);
      fallbackIncome.style.color = colors.income;
    }

    if (fallbackExpenses) {
      fallbackExpenses.textContent = formatCurrency(expenses);
      fallbackExpenses.style.color = colors.expense;
    }
  }

  /**
   * Hides the fallback display and shows the canvas
   */
  function hideFallback() {
    const fallbackElement = document.getElementById("chart-fallback");
    const canvasEl = document.getElementById("budget-chart");

    if (fallbackElement) {
      fallbackElement.style.display = "none";
    }

    if (canvasEl) {
      canvasEl.style.display = "block";
    }
  }

  // ============================================================
  // PUBLIC API
  // Requirements: 5.1, 5.2, 5.3, 5.4
  // ============================================================

  /**
   * Initializes the chart with a canvas element
   * Creates a bar chart instance showing income and expenses
   *
   * @param {HTMLCanvasElement} canvas - The canvas element to render the chart on
   * Requirements: 5.1 - display a bar chart showing total income and total expenses
   */
  function initializeChart(canvas) {
    // Check if Chart.js is available
    chartJsAvailable = typeof Chart !== "undefined";

    if (!chartJsAvailable) {
      console.warn(
        "ChartManager: Chart.js is not available. Showing fallback display."
      );
      showFallback(0, 0);
      return;
    }

    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      console.error("ChartManager: Invalid canvas element provided.");
      showFallback(0, 0);
      return;
    }

    // Store canvas reference
    canvasElement = canvas;

    // Destroy existing chart if any
    if (chart) {
      destroyChart();
    }

    // Hide fallback and show canvas
    hideFallback();

    try {
      // Get 2D context
      const ctx = canvas.getContext("2d");

      // Create new chart instance with initial values of 0
      chart = new Chart(ctx, createChartConfig(0, 0));
    } catch (error) {
      console.error("ChartManager: Failed to initialize chart:", error);
      showFallback(0, 0);
    }
  }

  /**
   * Updates the chart with new income and expense values
   * Refreshes the chart data to reflect current totals
   *
   * @param {number} income - Total income amount
   * @param {number} expenses - Total expenses amount
   * Requirements: 5.2 - update chart when new transaction is added
   * Requirements: 5.3 - update chart when transaction is deleted
   * Requirements: 5.4 - update chart when selected month changes
   */
  function updateChart(income, expenses) {
    // Validate inputs - default to 0 if invalid
    const validIncome =
      typeof income === "number" && !isNaN(income) && income >= 0 ? income : 0;
    const validExpenses =
      typeof expenses === "number" && !isNaN(expenses) && expenses >= 0
        ? expenses
        : 0;

    // If Chart.js is not available, update fallback display
    if (!chartJsAvailable || !chart) {
      showFallback(validIncome, validExpenses);
      return;
    }

    try {
      // Update chart data
      chart.data.datasets[0].data = [validIncome, validExpenses];

      // Trigger chart update with animation
      chart.update("active");
    } catch (error) {
      console.error("ChartManager: Failed to update chart:", error);
      showFallback(validIncome, validExpenses);
    }
  }

  /**
   * Destroys the chart instance and cleans up resources
   * Should be called when the chart is no longer needed
   */
  function destroyChart() {
    if (chart) {
      try {
        chart.destroy();
      } catch (error) {
        console.error("ChartManager: Error destroying chart:", error);
      }
      chart = null;
    }
  }

  /**
   * Checks if Chart.js is available
   *
   * @returns {boolean} True if Chart.js is loaded and available
   */
  function isChartJsAvailable() {
    return typeof Chart !== "undefined";
  }

  /**
   * Gets the current chart instance (for testing purposes)
   *
   * @returns {Chart|null} The current Chart.js instance or null
   */
  function getChartInstance() {
    return chart;
  }

  // ============================================================
  // RETURN PUBLIC API
  // ============================================================

  return {
    // Core chart operations
    initializeChart: initializeChart,
    updateChart: updateChart,
    destroyChart: destroyChart,

    // Utility methods
    isChartJsAvailable: isChartJsAvailable,
    getChartInstance: getChartInstance,
  };
})();
