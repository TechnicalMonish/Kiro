# Implementation Plan

- [x] 1. Set up project structure and base HTML

  - [x] 1.1 Create index.html with semantic HTML structure

    - Create header with app name "BudgetPulse" and tagline
    - Create main sections: budget panel, transaction form, transaction list, chart section
    - Include CDN links for Chart.js and Font Awesome
    - Set up basic meta tags and viewport for responsive design
    - _Requirements: 8.1, 8.3, 9.1_

  - [x] 1.2 Create base CSS with dark theme and layout
    - Implement CSS custom properties for colors (dark theme with accent colors)
    - Set up CSS Grid/Flexbox layout for responsive design
    - Style cards with rounded corners and subtle shadows
    - Add hover effects for interactive elements
    - Implement mobile-responsive breakpoints
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [x] 2. Implement Storage Service module

  - [x] 2.1 Create StorageService with localStorage operations

    - Implement `getTransactions()` to retrieve and parse transactions from localStorage
    - Implement `saveTransactions(transactions)` to serialize and store transactions
    - Implement `getBudgetLimit(monthKey)` to retrieve budget for specific month
    - Implement `saveBudgetLimit(monthKey, limit)` to store budget for specific month
    - Implement `generateMonthKey(year, month)` utility function
    - Wrap in IIFE/module pattern to avoid global pollution
    - Add comments explaining each function
    - _Requirements: 6.1, 6.2, 6.3, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3_

  - [x] 2.2 Write property test for transaction serialization round trip

    - **Property 1: Transaction Serialization Round Trip**
    - Generate random valid transactions with fast-check
    - Serialize to JSON, deserialize back
    - Assert all fields (id, date, description, amount, type) are equal
    - **Validates: Requirements 10.1, 10.2, 10.3**

  - [x] 2.3 Write property test for budget persistence round trip
    - **Property 2: Budget Limit Persistence Round Trip**
    - Generate random month keys and positive budget values
    - Save to storage, retrieve from storage
    - Assert retrieved value equals saved value
    - **Validates: Requirements 1.1, 6.3**

- [x] 3. Implement Data Manager module

  - [x] 3.1 Create DataManager with state and transaction operations

    - Implement state management for transactions, budgetLimits, selectedMonth
    - Implement `addTransaction(transaction)` that generates ID and adds to list
    - Implement `deleteTransaction(id)` that removes transaction by ID
    - Implement `getTransactionsForMonth(year, month)` filtering function
    - Integrate with StorageService for persistence
    - _Requirements: 2.1, 2.4, 3.1_

  - [x] 3.2 Write property test for transaction addition

    - **Property 3: Transaction Addition Increases Count**
    - Generate random valid transactions and existing lists
    - Add transaction to list
    - Assert list length increased by exactly one
    - **Validates: Requirements 2.1**

  - [x] 3.3 Write property test for transaction deletion

    - **Property 4: Transaction Deletion Decreases Count**
    - Generate random transaction lists with at least one item
    - Delete a random transaction
    - Assert list length decreased by one and transaction is gone
    - **Validates: Requirements 2.4**

  - [x] 3.4 Write property test for month filtering

    - **Property 9: Month Filtering Correctness**
    - Generate transactions across multiple months
    - Filter by specific month
    - Assert all results have dates in that month and no valid transactions excluded
    - **Validates: Requirements 3.1**

  - [x] 3.5 Implement calculation functions

    - Implement `calculateTotalIncome(transactions)` summing income types
    - Implement `calculateTotalExpenses(transactions)` summing expense types
    - Implement `calculateRemainingBudget(budgetLimit, totalExpenses)`
    - Implement `getBudgetStatus(budgetLimit, totalExpenses)` returning 'within' or 'over'
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 3.6 Write property test for income calculation

    - **Property 5: Income Calculation Correctness**
    - Generate random transaction lists with mixed types
    - Calculate total income
    - Assert equals sum of amounts where type is 'income'
    - **Validates: Requirements 4.1**

  - [x] 3.7 Write property test for expense calculation

    - **Property 6: Expense Calculation Correctness**
    - Generate random transaction lists with mixed types
    - Calculate total expenses
    - Assert equals sum of amounts where type is 'expense'
    - **Validates: Requirements 4.2**

  - [x] 3.8 Write property test for remaining budget calculation

    - **Property 7: Remaining Budget Calculation**
    - Generate random budget limits and expense totals
    - Calculate remaining budget
    - Assert equals budgetLimit minus totalExpenses
    - **Validates: Requirements 4.3**

  - [x] 3.9 Write property test for budget status determination

    - **Property 8: Budget Status Determination**
    - Generate random budget limits and expense totals
    - Determine status
    - Assert 'within' iff expenses <= limit, 'over' otherwise
    - **Validates: Requirements 4.4, 4.5**

  - [x] 3.10 Implement transaction validation

    - Implement `validateTransaction(data)` returning ValidationResult
    - Validate required fields: date, description, amount, type
    - Validate amount is positive number
    - Return appropriate error messages for each validation failure
    - _Requirements: 2.2, 2.3_

  - [x] 3.11 Write property test for transaction validation
    - **Property 10: Transaction Validation Rejects Invalid Input**
    - Generate invalid inputs: empty descriptions, non-positive amounts, missing fields
    - Validate each input
    - Assert isValid is false with appropriate errors
    - **Validates: Requirements 2.2, 2.3**

- [x] 4. Checkpoint - Ensure core logic tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement UI Renderer module

  - [x] 5.1 Create UIRenderer with DOM manipulation functions

    - Implement `renderTransactionList(transactions)` to populate transaction table
    - Implement `renderSummary(summary)` to update summary statistics display
    - Implement `renderBudgetStatus(status)` to show within/over budget indicator
    - Implement `clearTransactionForm()` to reset form after submission
    - Implement `showValidationError(field, message)` for inline errors
    - Implement `clearValidationErrors()` to remove error displays
    - Style income transactions with green indicator, expenses with red
    - Add delete button with Font Awesome icon to each transaction row
    - _Requirements: 3.2, 3.3, 3.4, 4.4, 4.5, 7.4_

  - [x] 5.2 Implement month selector functionality
    - Create month/year dropdown or date picker
    - Implement `updateMonthSelector(year, month)` to set current selection
    - Default to current month on page load
    - _Requirements: 1.2_

- [x] 6. Implement Chart Manager module

  - [x] 6.1 Create ChartManager with Chart.js integration
    - Implement `initializeChart(canvasElement)` to create bar chart instance
    - Implement `updateChart(income, expenses)` to refresh chart data
    - Implement `destroyChart()` for cleanup
    - Configure chart with dark theme colors matching app design
    - Add fallback display if Chart.js fails to load
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7. Implement App Controller and wire everything together

  - [x] 7.1 Create AppController to orchestrate all modules

    - Implement `init()` to initialize app on page load
    - Implement `loadSeedDataIfFirstRun()` to populate demo data on first visit
    - Wire up event listeners for form submission, delete buttons, month change, budget change
    - Implement `refreshUI()` to update all UI components after data changes
    - _Requirements: 6.4, 9.2, 9.3_

  - [x] 7.2 Implement transaction form handling

    - Implement `handleAddTransaction(event)` to process form submission
    - Validate input using DataManager
    - Display validation errors or add transaction and refresh UI
    - Clear form on successful submission
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 7.3 Implement delete transaction handling

    - Implement `handleDeleteTransaction(id)` to remove transaction
    - Update localStorage and refresh all UI components
    - _Requirements: 2.4_

  - [x] 7.4 Implement month change handling

    - Implement `handleMonthChange(year, month)` to switch displayed month
    - Filter transactions for selected month
    - Update summary, transaction list, and chart
    - _Requirements: 1.2, 3.1_

  - [x] 7.5 Implement budget limit change handling
    - Implement `handleBudgetLimitChange(limit)` to update budget
    - Validate positive number input
    - Save to localStorage and refresh summary display
    - _Requirements: 1.1, 1.4_

- [x] 8. Implement seed data and first-run experience

  - [x] 8.1 Create seed data generator
    - Create sample transactions for current month (mix of income and expenses)
    - Set default budget limit for current month
    - Only populate on first run (check localStorage flag)
    - _Requirements: 6.4_

- [x] 9. Final polish and responsive design

  - [x] 9.1 Refine responsive layout

    - Test and adjust layout for mobile widths (< 768px)
    - Ensure chart resizes properly
    - Stack sections vertically on mobile
    - _Requirements: 7.5_

  - [x] 9.2 Add final UI polish
    - Verify all hover effects work correctly
    - Ensure consistent spacing and alignment
    - Test icon display from Font Awesome
    - _Requirements: 7.3, 7.4_

- [x] 10. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
