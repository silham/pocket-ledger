<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Project Name

Pocket Ledger

## Core Idea

Pocket Ledger is a mobile-first Progressive Web App for tracking personal day-to-day spending, multiple money accounts, budgets, and personal debts.

The app helps users quickly record where their money goes, monitor account balances, manage people they owe money to, and track people who owe them money.

The main goal is to make personal finance tracking simple, fast, and practical for daily use.

The user should be able to add a common transaction in less than 10 seconds.

---

## App Type

This project is a:

- Mobile-first web application
- Progressive Web App
- Personal finance tracker
- Daily spending tracker
- Budget management app
- Personal debt and lending tracker

The app should work well on mobile browsers and should be installable as a PWA.

---

## Target Users

The app is mainly for individuals who want to manage their personal money more clearly.

Typical users may want to:

- Track daily expenses
- Track income
- Manage cash, bank, wallet, and card accounts
- Know how much they spent this month
- Control spending through budgets
- Track people who owe them money
- Track money they owe to others
- Settle personal debts easily

---

## Core Features

### 1. Dashboard

The dashboard should give the user a quick financial overview.

It should show:

- Total balance across all accounts
- Today's spending
- This month's spending
- This month's income
- Net cash flow
- Total amount the user owes to others
- Total amount others owe to the user
- Budget usage summary
- Recent transactions

The dashboard should be simple, card-based, and optimized for mobile screens.

---

### 2. Multiple Accounts

The app should allow users to create and manage multiple money accounts.

Example accounts:

- Cash
- Bank account
- Digital wallet
- Savings account
- Credit card
- Other account

Users should be able to:

- Add accounts
- Edit accounts
- Archive accounts
- View account balances
- Transfer money between accounts
- Adjust account balance when needed

Each transaction should affect the correct account balance.

---

### 3. Transactions

The app should support different transaction types.

Required transaction types:

- Expense
- Income
- Transfer
- Lend
- Borrow
- Settlement
- Adjustment

Each transaction should include:

- Amount
- Date
- Account
- Category, if applicable
- Person, if applicable
- Note, optional

Transactions should be listed clearly and grouped by date.

Users should be able to filter transactions by type.

---

### 4. Expenses

Users should be able to record daily expenses quickly.

An expense should:

- Reduce the selected account balance
- Increase spending for the selected category
- Appear in daily and monthly spending summaries

Example:

User spends Rs. 450 for lunch from Cash.

The app should reduce the Cash account balance by Rs. 450 and record the amount under the Food category.

---

### 5. Income

Users should be able to record income.

An income transaction should:

- Increase the selected account balance
- Appear in monthly income summaries
- Be assigned to an income category

Example income categories:

- Salary
- Freelance
- Business
- Gift
- Refund
- Other

---

### 6. Transfers

Users should be able to transfer money between accounts.

A transfer should:

- Reduce the balance of the source account
- Increase the balance of the destination account
- Not be counted as an expense or income

Example:

User transfers Rs. 10,000 from Cash to Bank.

Cash decreases by Rs. 10,000 and Bank increases by Rs. 10,000.

---

### 7. People Management

The app should allow users to manage people involved in borrowing and lending.

Users should be able to:

- Add people
- Edit people
- Archive people
- View each person's ledger
- Track the net balance with each person

Each person can have:

- Name
- Phone number, optional
- Email, optional
- Notes, optional
- Active or archived status

People should not be permanently deleted if they have transaction history. They should be archived instead.

---

### 8. Money Others Owe Me

Users should be able to record money they lend to others.

When the user lends money:

- The selected account balance should decrease
- The selected person's balance should increase
- The person should appear as owing money to the user

Example:

User lends Rs. 2,000 to Shazan from Cash.

Cash decreases by Rs. 2,000.

Shazan owes the user Rs. 2,000.

---

### 9. Money I Owe Others

Users should be able to record money they borrow from others.

When the user borrows money:

- The selected account balance should increase
- The selected person's balance should decrease
- The person should appear as someone the user owes money to

Example:

User borrows Rs. 1,500 from Roshan and receives it as Cash.

Cash increases by Rs. 1,500.

The user owes Roshan Rs. 1,500.

---

### 10. Settlements

Users should be able to settle debts partially or fully.

Settlement cases:

- Someone pays money back to the user
- The user pays money back to someone else

If someone pays the user back:

- The receiving account balance should increase
- That person's owed balance should decrease

If the user pays someone back:

- The paying account balance should decrease
- The user's owed balance should decrease

The app should support partial settlements and full settlements.

---

### 11. Person Ledger

Each person should have a dedicated ledger page.

The person ledger should show:

- Person name
- Net balance
- Whether the person owes the user or the user owes the person
- Full transaction history with that person
- Lending records
- Borrowing records
- Settlement records

Balance meaning:

- Positive balance means the person owes the user
- Negative balance means the user owes the person
- Zero balance means settled

---

### 12. Categories

The app should support spending and income categories.

Users should be able to:

- Add categories
- Edit categories
- Archive categories
- Assign categories to transactions
- Set budgets for categories

Default expense categories may include:

- Food
- Transport
- Education
- Subscriptions
- Shopping
- Health
- Entertainment
- Family
- Bills
- Mobile/Data
- Travel
- University
- Business
- Other

Default income categories may include:

- Salary
- Freelance
- Business
- Gift
- Refund
- Other

---

### 13. Budgets

The app should allow users to create budgets.

Budget types:

- Overall monthly budget
- Category-based budget

Users should be able to:

- Set a monthly spending limit
- Set category-level spending limits
- View used amount
- View remaining amount
- See warning states when spending is close to the limit
- See exceeded states when spending passes the budget

Example:

Food budget: Rs. 20,000

If the user spends Rs. 16,000 on Food, the app should show that 80% of the Food budget has been used.

---

### 14. Reports and Insights

The app should provide simple financial reports.

Reports may include:

- Spending by category
- Monthly income vs expenses
- Daily spending trend
- Account balance summary
- People debt summary
- Budget usage summary

Reports should be easy to understand and mobile-friendly.

---

### 15. PWA Support

The app should be installable as a Progressive Web App.

PWA requirements:

- App manifest
- App icon
- Mobile install support
- Theme color
- Offline fallback page
- Basic caching for important pages

In the first version, full offline sync is not required.

However, the app structure should allow offline transaction entry to be added later.

---

## Main User Flows

### Flow 1: Add Expense

1. User taps the Add button.
2. User selects Expense.
3. User enters amount.
4. User selects account.
5. User selects category.
6. User adds optional note.
7. User saves the transaction.
8. App updates account balance and dashboard.

---

### Flow 2: Add Income

1. User taps the Add button.
2. User selects Income.
3. User enters amount.
4. User selects account.
5. User selects income category.
6. User saves the transaction.
7. App updates account balance and income summary.

---

### Flow 3: Transfer Money

1. User selects Transfer.
2. User enters amount.
3. User selects source account.
4. User selects destination account.
5. User saves the transfer.
6. App reduces source account balance and increases destination account balance.

---

### Flow 4: Lend Money

1. User selects Lend.
2. User selects or adds a person.
3. User enters amount.
4. User selects account.
5. User saves the record.
6. App reduces account balance.
7. App records that the person owes the user money.

---

### Flow 5: Borrow Money

1. User selects Borrow.
2. User selects or adds a person.
3. User enters amount.
4. User selects receiving account.
5. User saves the record.
6. App increases account balance.
7. App records that the user owes the person money.

---

### Flow 6: Settle Debt

1. User opens a person ledger.
2. User taps Settle.
3. User enters amount.
4. User selects settlement direction.
5. User selects account.
6. User saves the settlement.
7. App updates account balance and person balance.

---

## Navigation Structure

The app should use a mobile-first bottom navigation.

Recommended navigation:

- Home
- Transactions
- Add
- People
- More

The Add button should be prominent because transaction entry is the most frequent action.

The More section can include:

- Accounts
- Categories
- Budgets
- Reports
- Settings

---

## UX Principles

The app should follow these principles:

1. Mobile-first design
2. Fast transaction entry
3. Clear financial summaries
4. Minimal typing
5. Large touch-friendly controls
6. Simple forms
7. Clear transaction history
8. No unnecessary complexity
9. Reliable money calculations
10. Easy debt tracking with people

The app should feel lightweight, fast, and easy to use daily.

---

## MVP Scope

The first version should include:

- User authentication
- Dashboard
- Account management
- Category management
- People management
- Add expense
- Add income
- Add transfer
- Add lend record
- Add borrow record
- Add settlement record
- Person ledger
- Basic budget tracking
- Transaction history
- PWA install support

The first version does not need:

- Bank integrations
- Receipt scanning
- AI features
- Multi-user shared wallets
- Advanced analytics
- Full offline sync
- Multi-currency support

---

## Future Features

Possible future improvements:

- Offline transaction entry
- Sync when back online
- Recurring transactions
- Bill reminders
- CSV export
- PDF reports
- Receipt image upload
- OCR receipt scanning
- AI spending insights
- Smart category suggestions
- WhatsApp reminder message generator
- Shared expense groups
- Multi-currency support
- Monthly financial summary notifications

---

## Development Priority

Build the app in this order:

1. Project setup
2. Authentication
3. Basic layout and mobile navigation
4. Account management
5. Category management
6. People management
7. Transaction creation
8. Balance calculation logic
9. Dashboard summaries
10. Person ledger
11. Budget tracking
12. Transaction filtering
13. Reports
14. PWA support

Correct financial logic is more important than advanced UI in the first version.

Prioritize reliability, simplicity, and speed.
