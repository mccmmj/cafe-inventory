# Cafe Inventory: User & Operator Guide

Welcome to the Cafe Inventory application! This guide provides a clear and concise overview of the app's features to help you manage your inventory efficiently.

---

## 1. Getting Started: Logging In

To access the inventory system, you must log in with a valid Google account. The application uses Google for secure and easy authentication.

## 2. The Dashboard

The Dashboard is the first screen you'll see after logging in. It provides a high-level, at-a-glance summary of your inventory status.

-   **Inventory Stats:** A series of cards at the top shows key metrics:
    -   *Total Items:* The total number of unique products you are tracking.
    -   *Items in Stock:* The number of products that currently have a stock level above zero.
    -   *Low Stock:* The number of products that have fallen below their set "Low Stock Threshold".
    -   *Out of Stock:* The number of products with a stock level of zero.
-   **Top 5 Used Items:** A horizontal bar chart that displays the five products with the highest usage, helping you understand which items are most popular or consumed fastest.
-   **Low Stock Alerts:** A table that lists all items currently at or below their low stock threshold, allowing you to prioritize reordering.

## 3. The Inventory Page

This is the core of the application where you can view and manage all your inventory items in detail.

-   **View Toggle:** Switch between two different layouts for viewing your inventory:
    -   *Table View:* A dense, spreadsheet-like layout ideal for quick scanning.
    -   *Card View:* A more visual layout that displays each item in its own card.
-   **Controls & Search:**
    -   *Search Bar:* Quickly find any item by typing its name.
    -   *Filter by Status:* Filter the list to show only items with a specific status (In Stock, Low Stock, Out of Stock).
-   **Adding a New Item:**
    -   Click the **"Add New Item"** button to open a form.
    -   Fill in the details: Product Name, Category, SKU, Quantity, Low Stock Threshold, etc.
    -   Click **"Add Item"** to save the new product to your inventory.
-   **Managing Existing Items:** Each item in the list has a set of actions:
    -   **Adjust Stock:** Update the quantity of an item. You can record usage, add new stock (correction), or account for spoilage. Each adjustment is logged with a reason for tracking purposes.
    -   **Edit Item:** Modify the details of an item, such as its name, category, or low stock threshold.
    -   **Delete Item:** Permanently remove an item from your inventory. A confirmation step is required to prevent accidental deletion.

## 4. The Settings Page

Here you can manage your personal preferences and export your data.

-   **Profile & Appearance:**
    -   Displays the email address of the currently logged-in user.
    -   Includes the **"Sign Out"** button to securely log out of the application.
-   **Notification Preferences:**
    -   Toggle the **"Daily Summary Email"** to subscribe or unsubscribe from daily email reports detailing low and out-of-stock items.
-   **Data Export:**
    -   Download your data in CSV format.
    -   You can export the entire master inventory list or the full activity log, which contains a history of all stock adjustments. 