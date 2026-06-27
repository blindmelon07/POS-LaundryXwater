# Jaz Pure Water Refilling Station
## POS Management System — User Guide

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard](#2-dashboard)
3. [POS Terminal](#3-pos-terminal)
4. [Sales History](#4-sales-history)
5. [Products & Price List](#5-products--price-list)
6. [Expenses Tracker](#6-expenses-tracker)
7. [Customers](#7-customers)
8. [Deliveries](#8-deliveries)
9. [Container Tracking](#9-container-tracking)
10. [Inventory](#10-inventory)
11. [Reports](#11-reports)
12. [Daily Z-Report](#12-daily-z-report)
13. [Users & Roles](#13-users--roles)
14. [Business Settings](#14-business-settings)
15. [User Roles & Permissions](#15-user-roles--permissions)
16. [Login Credentials](#16-login-credentials)

---

## 1. Getting Started

### Accessing the System

Open your browser and go to the system URL. You will be redirected to the **Login** page.

### Logging In

1. Enter your **Email Address**
2. Enter your **Password**
3. (Optional) Check **Remember me** to stay logged in
4. Click **Sign in**

> The system will take you directly to the **Dashboard** after a successful login.

### Logging Out

Click your profile name at the bottom of the sidebar, then select **Log out**.

---

## 2. Dashboard

The Dashboard gives you a real-time overview of the business performance at a glance.

### Today's Performance (Top Row)

| Card | What it shows |
|------|---------------|
| Revenue | Total sales income collected today |
| Gallons Sold | Total gallons of water sold today |
| Net Profit | Revenue minus today's expenses |
| Month Gallons | Running total gallons sold this month |

### This Month (Second Row)

| Card | What it shows |
|------|---------------|
| Month Revenue | Total income for the current month |
| Month Expenses | Total expenses for the current month |
| Month Net Profit | Revenue minus expenses for the month |

### 7-Day Chart

A bar chart comparing **Revenue (blue)** vs **Expenses (red)** for the last 7 days. Hover over a bar to see the exact value.

### Recent Sales

Lists the most recent transactions made today, showing sale number, customer name, gallons, payment method, and total amount. Click **View all** to go to the full Sales History.

---

## 3. POS Terminal

The POS Terminal is where cashiers process walk-in and over-the-counter sales.

> **Access:** Only users with the `use pos` permission can access this page.

### Processing a Sale

#### Step 1 — Add Products to Cart

- Products are displayed as tiles grouped by category:
  - **Water Refills** — Slim Wholesale, Slim Regular, Slim Commercial
  - **Services & Others** — Containers, Delivery fees, etc.
- **Tap/click** a product tile to add it to the cart.
- Each click adds **1 unit**. Click multiple times to add more.

#### Step 2 — Adjust Cart Items

Inside the cart (right panel):
- Use the **− / +** buttons to change quantity.
- For **container sales**, enter the number of **containers returned** by the customer.
- Click the **✕** button on an item to remove it.
- Click **Clear all** to empty the entire cart.

#### Step 3 — Fill in Checkout Details

| Field | Description |
|-------|-------------|
| Customer Name | Type the customer's name, or leave blank for Walk-in |
| Payment | Select Cash, GCash, or Card |
| Discount | Enter a discount amount (₱) if applicable |
| Amount Paid | Enter the amount given by the customer |
| Change | Calculated automatically |

#### Step 4 — Charge

Click **Charge ₱X.XX** to complete the sale. The cart will reset automatically after a successful transaction.

---

## 4. Sales History

View, filter, and manage all recorded sales transactions.

> **Access:** Users with the `view sales` permission.

### Filters

| Filter | How to use |
|--------|------------|
| Date | Pick a specific day to view |
| Month | Select a month to view all sales for that period |
| Payment | Filter by Cash, GCash, or Card |

Click **Export** to download the filtered sales as a CSV file.

### Viewing a Sale Receipt

Click the **eye icon** on any row to open the full receipt details including all items, discounts, amount paid, and change.

### Deleting a Sale

Click the **trash icon** on a row. You will be asked to confirm before deletion.

> **Warning:** Deleting a sale is permanent and cannot be undone.

---

## 5. Products & Price List

Manage the products and prices displayed on the POS Terminal.

> **Access:** Users with the `manage products` permission.

### Product Types

| Type | Description |
|------|-------------|
| Slim Wholesale | 19L slim jug — wholesale price |
| Slim Regular | 19L slim jug — regular retail price |
| Slim Commercial | 19L slim jug — commercial/bulk price |
| Container Slim | 19L slim container sold separately |
| Container Round | 5-gallon round container sold separately |
| Delivery | Delivery service charge |
| Other | Miscellaneous products/services |

### Adding a Product

1. Click **Add Product**
2. Fill in Name, Type, Price, and Unit
3. (Optional) Add Notes
4. Make sure **Active** is checked for it to appear on the POS
5. Click **Add Product**

### Editing a Product

Click the **pencil icon** on any product row to open the edit form.

### Deactivating a Product

Edit a product and uncheck **Active**. The product will be hidden from the POS Terminal but kept in the records.

### Deleting a Product

Click the **trash icon**. This permanently removes the product.

---

## 6. Expenses Tracker

Record and monitor all business expenses.

> **Access:** Users with the `manage expenses` permission.

### Expense Categories

- Utilities (electricity, water supply)
- Supplies (cups, seals, labels)
- Maintenance (equipment repair)
- Salaries (staff wages)
- Rent
- Other

### Adding an Expense

1. Click **Add Expense**
2. Fill in Date, Amount, Description, and Category
3. (Optional) Enter Receipt number and Notes
4. Click **Add Expense**

### Filtering Expenses

- Filter by **Month** to see expenses for a specific period
- Filter by **Category** to see a specific type of expense

The **This month total** shown on the page header reflects the sum of all expenses for the currently filtered month.

Click **Export** to download the expense list as CSV.

---

## 7. Customers

Manage your registered customer accounts.

### Customer Types

| Type | Description |
|------|-------------|
| Regular | Standard walk-in or recurring customer |
| Wholesale | Buys in bulk at wholesale prices |
| Commercial | Business/office accounts |

### Summary Cards

At the top of the Customers page:
- **Total Customers** — number of registered customers
- **Slim Containers Out** — total slim jugs currently at customers
- **Round Containers Out** — total round jugs currently at customers

### Adding a Customer

1. Click **Add Customer**
2. Fill in Name, Phone, Type, and Address
3. Enter initial container counts if applicable
4. Click **Add Customer**

### Searching Customers

Type in the search bar and press **Enter** to search by name or phone number. Use the **Type** dropdown to filter by customer type.

### Customer Profile

Click the **eye icon** to view a customer's full profile including:
- Contact information
- Total amount spent
- Number of transactions
- Containers currently with them
- Full purchase history

---

## 8. Deliveries

Schedule and track water delivery orders.

### Summary Cards

- **Today's Deliveries** — number of deliveries scheduled for today
- **Pending Orders** — orders not yet marked as delivered

### Delivery Statuses

| Status | Meaning |
|--------|---------|
| Pending | Order created, not yet dispatched |
| Out for Delivery | Driver is on the way |
| Delivered | Successfully delivered and paid |
| Cancelled | Order was cancelled |

### Creating a New Delivery

1. Click **New Delivery**
2. (Optional) Select an existing customer to auto-fill their details
3. Fill in Customer Name, Address, Phone, and Payment method
4. Set Scheduled Date and Time
5. Click the product buttons to add items to the order
6. Adjust quantities using **− / +** buttons
7. Click **Schedule Delivery**

### Updating a Delivery Status

Click the **Update** button on any delivery row, select the new status, and save. When marking as **Delivered**, enter the amount paid.

---

## 9. Container Tracking

Monitor water containers (jugs) currently held by customers.

### Summary Cards

| Card | Description |
|------|-------------|
| Slim Containers Out | 19L slim jugs at customers (sold count vs returned) |
| Round Containers Out | 5-gallon round jugs at customers |
| Total Containers Out | Combined total |
| Customers with Containers | How many customers have unreturned containers |

### Updating Container Count

Click the **pencil icon** on any customer row to manually update how many slim and round containers they currently hold.

> Containers are also automatically updated when sales with container returns are processed on the POS.

---

## 10. Inventory

Track supply levels for items used in the business.

> **Access:** Users with the `manage inventory` permission.

### Low Stock Alerts

Items with quantity at or below their **Min Stock** level are highlighted in amber and marked **Low**. A banner alert appears at the top of the page when any item is low.

### Adding an Inventory Item

1. Click **Add Item**
2. Fill in Name, Category, Unit, and starting Quantity
3. (Optional) Set Min Stock Alert level and Cost per Unit
4. Click **Add Item**

### Adjusting Stock

Click **Adjust** on any item to change its quantity:

| Type | Effect |
|------|--------|
| Add Stock | Increases quantity by the entered amount |
| Remove Stock | Decreases quantity by the entered amount |
| Set to Exact Value | Overrides quantity to a specific number |

Always enter a **Reason** for the adjustment (e.g., "Purchased from supplier", "Damaged", "Physical count").

### Adjustment History

Click the **clock/history icon** on any item to view its recent stock adjustment log.

---

## 11. Reports

View annual financial performance broken down by month.

> **Access:** Users with the `view reports` permission.

### Annual Summary Cards

- Full Year Revenue
- Full Year Expenses
- Full Year Profit
- Profit Margin (%)
- Total Gallons Sold

### Monthly Bar Chart

Visual comparison of Revenue (blue) vs Expenses (red) for each month of the selected year.

### Monthly Breakdown Table

Detailed table showing per-month:
- Revenue
- Expenses
- Gross Profit
- Profit Margin
- Gallons Sold
- Number of Transactions

A **Full Year** total row is shown at the bottom.

### Changing Year

Use the year dropdown at the top-right to switch between available years.

Click **Export CSV** to download the full year report.

---

## 12. Daily Z-Report

The Z-Report is the end-of-day summary of all transactions for a specific date.

> **Access:** Users with the `view reports` permission.

### What the Z-Report Shows

- **Summary** — total transactions, gallons, gross revenue, discounts, expenses, and net profit
- **Sales by Payment Method** — breakdown of Cash, GCash, Card totals
- **Gallons by Type** — how many gallons sold per product type
- **Expenses** — all expenses logged for the day
- **Transaction Log** — full list of every sale with time, sale number, customer, and amount

### Selecting a Date

Use the date picker at the top-right to view the Z-Report for any previous day. Defaults to today.

### Printing

Click **Print** to open the browser print dialog. The report is formatted for clean printing.

---

## 13. Users & Roles

Manage staff accounts and their access levels.

> **Access:** Users with the `manage users` permission (Admin only).

### Adding a User

1. Click **Add User**
2. Fill in Full Name, Email, and Password
3. Select a Role (Admin or Cashier)
4. Click **Create User**

### Editing a User

Click the **pencil icon** to update a user's name, email, or password. Leave the password field blank to keep the existing password.

### Changing a User's Role

Click the **user-check icon** to open the role assignment form and select a new role.

### Deleting a User

Click the **trash icon**. This permanently removes the user account.

---

## 14. Business Settings

Configure the store information printed on receipts and used throughout the system.

> **Access:** Admin only.

### Store Information

| Field | Description |
|-------|-------------|
| Business Name | Name printed on receipts |
| Address | Physical store address |
| Phone Number | Contact number |
| Email | Business email address |

### Receipt Settings

| Field | Description |
|-------|-------------|
| Footer Message | Text printed at the bottom of receipts (e.g., "Thank you!") |
| Currency Symbol | Defaults to ₱ |
| Tax Rate | Set to 0 if VAT is not applicable |

Click **Save Settings** to apply changes. The button is disabled until a change is made.

---

## 15. User Roles & Permissions

| Permission | Admin | Cashier |
|------------|-------|---------|
| View Dashboard | ✅ | ✅ |
| Use POS Terminal | ✅ | ✅ |
| View Sales History | ✅ | ✅ |
| Delete Sales | ✅ | ❌ |
| Manage Products | ✅ | ❌ |
| Manage Expenses | ✅ | ✅ |
| Manage Inventory | ✅ | ❌ |
| View Reports / Z-Report | ✅ | ✅ |
| Manage Users & Roles | ✅ | ❌ |
| Business Settings | ✅ | ❌ |

---

## 16. Login Credentials

> **Important:** Change these default passwords immediately after first login.

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pos.com | admin1234 |
| Cashier | cashier@pos.com | cashier1234 |

### Changing Your Password

1. Click your name at the bottom of the sidebar
2. Go to **Settings → Security**
3. Enter your current password and your new password
4. Click **Save**

---

## Tips & Reminders

- Always **close the day** by printing the Z-Report before ending operations.
- **Containers** returned on the POS automatically update container tracking counts.
- The **Dashboard net profit** updates in real time as sales and expenses are recorded.
- Use **Exports** (Sales, Expenses, Reports) for monthly reconciliation and accounting.
- Only the **Admin** can delete sales, manage products, and change settings.

---

*Jaz Pure Water Refilling Station POS System*
*For technical support, contact your system administrator.*
