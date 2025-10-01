# 📌 Grocery Ledger App — Requirements

## 🎯 Overview
A **web-based grocery ledger app** for 5 friends to manage a shared monthly fund of ₹5000.  
The app runs on the web, hosted on **GitHub Pages**, and uses **JSON file storage (no database)**.  

---

## ⚙️ Tech Stack
- **Frontend**: HTML, CSS, JavaScript (vanilla, no frameworks required).  
- **Storage**: JSON file (`data.json`) + browser `localStorage` for runtime updates.  
- **Hosting**: GitHub Pages.  

---

## 🏗 Features

### 1. Start New Month
- A button: **“Start New Month”**  
- Resets the fund to **₹5000**  
- Clears all expenses  
- Resets each friend’s `spent` value to `0`  

### 2. Add Expense
- Form with fields:  
  - **Spender** (Dropdown: Abhik, Kanika, Rohit, Priya, Arjun)  
  - **Amount** (Number input)  
  - **Description** (Text input)  
  - **Date** (Auto-filled with today’s date, editable)  
- On submit:  
  - Deduct from `remaining` fund  
  - Add to that friend’s total spent  
  - Append entry to expense ledger  

### 3. Expense Ledger
- A table showing all expenses:  
  - Date | Spender | Amount | Description  

### 4. Summary Dashboard
- Shows:  
  - **Total Fund (₹5000)**  
  - **Remaining Balance**  
  - **Total Spent by Each Friend**  

### 5. Data Management
- **Export JSON** → Download current state as JSON  
- **Import JSON** → Upload a JSON file to restore previous state  

---

## 📂 File Structure
```
grocery-ledger/
│── index.html         # UI
│── style.css          # Styling
│── app.js             # Main logic
│── data.json          # Initial fund + empty ledger
│── requirements.md    # (this file)
```

---

## 📖 Data Format (`data.json`)
```json
{
  "month": "2025-10",
  "fund": 5000,
  "remaining": 5000,
  "friends": [
    { "name": "Abhik", "spent": 0 },
    { "name": "Parag", "spent": 0 },
    { "name": "Rajdeep", "spent": 0 },
    { "name": "Sohal", "spent": 0 },
    { "name": "Soumik", "spent": 0 }
  ],
  "expenses": []
}
```

---

## 🎨 UI Structure

### Header
```
🛒 Grocery Ledger
[ Start New Month Button ]
```

### Add Expense Form
```
Spender: [Dropdown]
Amount: [Input]
Description: [Input]
Date: [Auto Today]
[ Add Expense Button ]
```

### Expense Ledger
```
| Date       | Spender | Amount | Description |
|------------|---------|--------|-------------|
| 2025-10-01 | Abhik   | 300    | Milk & Bread|
```

### Summary Dashboard
```
Total Fund: ₹5000
Remaining : ₹1500
- Abhik: ₹300
- Kanika: ₹0
- Rohit: ₹3000
- Priya: ₹200
- Arjun: ₹0
```

### Import / Export
```
[ Import JSON ]   [ Export JSON ]
```

---

## 🛠️ Task Breakdown (for AI assistants)
1. **HTML Layout**  
   - Create header, add expense form, ledger table, summary section, import/export buttons.  
2. **CSS Styling**  
   - Clean, minimal layout with responsive design (cards, tables).  
3. **JavaScript Logic**  
   - Load JSON (fund, friends, expenses).  
   - Implement “Start New Month” reset.  
   - Add Expense → update remaining + friend’s spent + ledger.  
   - Render table & summary dynamically.  
   - Export JSON (download) + Import JSON (upload & parse).  
   - Persist state in `localStorage`.  
4. **JSON File**  
   - Preload with initial structure (fund=5000, empty expenses).  

---

✅ This file defines **all requirements** clearly and in Markdown format.  
