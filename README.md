# 💰 BudgetPulse

<div align="center">

![BudgetPulse](https://img.shields.io/badge/BudgetPulse-Personal%20Finance%20Tracker-4f46e5?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-10b981?style=for-the-badge)
![License](https://img.shields.io/badge/license-ISC-06b6d4?style=for-the-badge)

**Take control of your finances with a beautiful, modern budget tracking application.**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [Usage](#-usage) • [Testing](#-testing)

</div>

---

## 📖 Overview

BudgetPulse is a sleek, client-side personal finance tracker that helps you manage monthly budgets, track income and expenses, and visualize your financial data. Built with vanilla web technologies, it runs entirely in your browser with no server required—your data stays private on your device.

## ✨ Features

### 💵 Budget Management

- Set custom monthly budget limits
- Track spending against your budget in real-time
- Visual status indicators (Within Budget / Over Budget)
- Month-by-month budget history

### 📊 Transaction Tracking

- Add income and expense transactions with descriptions
- Categorize transactions by type (Income/Expense)
- Delete transactions with one click
- Automatic date-based filtering by month

### 📈 Financial Insights

- Real-time summary statistics (Total Income, Total Expenses, Remaining Budget)
- Interactive bar chart comparing income vs expenses
- Color-coded indicators for quick financial health assessment

### 🎨 Modern UI/UX

- Beautiful dark theme with accent colors
- Fully responsive design (mobile, tablet, desktop)
- Smooth animations and hover effects
- Accessible and intuitive interface

### 💾 Data Persistence

- Automatic localStorage persistence
- Data survives browser sessions
- Pre-populated demo data on first run
- No account or server required

## 🖼️ Demo

Simply open `index.html` in your browser to start using BudgetPulse immediately. On first run, sample transactions are loaded to demonstrate the app's capabilities.

## 🚀 Installation

### Quick Start (No Build Required)

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/budgetpulse.git
   cd budgetpulse
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in your preferred browser
   open index.html        # macOS
   start index.html       # Windows
   xdg-open index.html    # Linux
   ```

That's it! No npm install, no build step, no server setup required.

### Development Setup (For Testing)

If you want to run the property-based tests:

```bash
# Install dev dependencies
npm install

# Run tests
npm test
```

## 🛠️ Tech Stack

### Frontend

| Technology            | Purpose                                      |
| --------------------- | -------------------------------------------- |
| **HTML5**             | Semantic markup with accessibility features  |
| **CSS3**              | Custom properties, Grid, Flexbox, animations |
| **JavaScript (ES6+)** | Modular architecture with IIFE pattern       |

### External Libraries (CDN)

| Library          | Version | Purpose                                       |
| ---------------- | ------- | --------------------------------------------- |
| **Chart.js**     | 4.4.1   | Interactive bar charts for data visualization |
| **Font Awesome** | 6.5.1   | Icons for UI elements                         |

### Testing

| Tool           | Purpose                          |
| -------------- | -------------------------------- |
| **fast-check** | Property-based testing framework |
| **Node.js**    | Test runner environment          |

### Architecture

```
budgetpulse/
├── index.html              # Main application entry point
├── styles.css              # Dark theme styles & responsive design
├── js/
│   ├── storage-service.js  # localStorage operations & serialization
│   ├── data-manager.js     # Business logic & state management
│   ├── ui-renderer.js      # DOM manipulation & rendering
│   ├── chart-manager.js    # Chart.js integration
│   └── app-controller.js   # Event handling & orchestration
├── tests/
│   ├── properties.test.html # Browser-based property tests
│   └── run-tests.js        # Node.js test runner
└── package.json            # Project metadata & scripts
```

### Design Patterns

- **Module Pattern (IIFE)** - Encapsulation and namespace protection
- **Separation of Concerns** - Distinct modules for storage, data, UI, and control
- **Event Delegation** - Efficient event handling for dynamic content
- **Observer Pattern** - UI updates triggered by data changes

## 📱 Usage

### Setting a Monthly Budget

1. Select the month using the month picker
2. Enter your budget limit in the input field
3. Click "Set" or press Enter

### Adding Transactions

1. Fill in the transaction form:
   - **Date**: When the transaction occurred
   - **Type**: Income or Expense
   - **Description**: What the transaction was for
   - **Amount**: Transaction value
2. Click "Add Transaction"

### Viewing Financial Summary

- **Total Income**: Sum of all income transactions for the selected month
- **Total Expenses**: Sum of all expense transactions for the selected month
- **Remaining Budget**: Budget limit minus total expenses
- **Status**: Green "Within Budget" or red "Over Budget" indicator

### Navigating Months

- Use the month selector to view different months
- Each month maintains its own budget limit and transactions

### Deleting Transactions

- Click the trash icon next to any transaction to remove it

## 🧪 Testing

BudgetPulse includes comprehensive property-based tests to ensure correctness:

```bash
# Run all property tests
npm test
```

### Test Coverage

| Property                                 | Description                                     | Requirements     |
| ---------------------------------------- | ----------------------------------------------- | ---------------- |
| **Transaction Serialization Round Trip** | JSON serialize/deserialize preserves all fields | 10.1, 10.2, 10.3 |
| **Budget Limit Persistence Round Trip**  | Save/load budget maintains exact value          | 1.1, 6.3         |
| **Transaction Addition Increases Count** | Adding transaction increases list by one        | 2.1              |
| **Transaction Deletion Decreases Count** | Deleting transaction decreases list by one      | 2.4              |
| **Income Calculation Correctness**       | Sum of income transactions is accurate          | 4.1              |
| **Expense Calculation Correctness**      | Sum of expense transactions is accurate         | 4.2              |
| **Remaining Budget Calculation**         | Budget minus expenses is correct                | 4.3              |
| **Budget Status Determination**          | Within/over status is accurate                  | 4.4, 4.5         |
| **Month Filtering Correctness**          | Only transactions from selected month shown     | 3.1              |
| **Transaction Validation**               | Invalid inputs are properly rejected            | 2.2, 2.3         |

## 🎯 Use Cases

### Personal Budget Tracking

Track your monthly income and expenses to understand where your money goes and stay within your budget.

### Freelancer Income Management

Monitor project payments and business expenses to maintain healthy cash flow.

### Household Budget Planning

Set family budget limits and track shared expenses across different categories.

### Savings Goal Tracking

Set a low expense budget to maximize savings and monitor progress monthly.

### Financial Awareness

Visualize spending patterns with charts to make informed financial decisions.

## 🌐 Browser Support

| Browser | Support   |
| ------- | --------- |
| Chrome  | ✅ Latest |
| Firefox | ✅ Latest |
| Safari  | ✅ Latest |
| Edge    | ✅ Latest |

## 📄 License

This project is licensed under the ISC License.

---

<div align="center">

**Built with ❤️ for better financial health**

[⬆ Back to Top](#-budgetpulse)

</div>
