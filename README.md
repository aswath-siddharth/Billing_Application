# Grocery Billing Application

A modern, desktop-based billing system built with **Electron**, **React**, **Vite**, **TailwindCSS**, **ShadCN UI**, and **SQLite**.  
Designed for grocery shops, supermarkets, and retail stores that require:

- Fast billing  
- Tamil + English item names  
- GST auto-calculation  
- Customer management  
- Daily & monthly reports  
- Thermal receipt printing  
- Financial year (FY) handling  
- Backup & restore  

---

## Features

### **Billing**
- Autocomplete item search  
- Add/remove items to cart  
- Auto GST calculation  
- Cash / UPI / Credit payment modes  
- Optional customer selection  
- Generates printable thermal receipt  
- Saves every bill into SQLite  

### **Items Management**
- Add/edit/delete items  
- English + Tamil names  
- GST% configuration  
- Export/Import items  

### **Customer Management**
- Add customers with phone & GST No.  
- Lookup past customers easily  
- Assign customers to invoices  

### **Reports**
- Daily & Monthly sales report  
- GST split: **CGST / SGST**  
- Export to **Excel / PDF**  
- View bills by date range  

### **Financial Years**
- Create new FY  
- Maintains separate DB per FY  
- Automatic switching  

### **Thermal Printing**
- Supports **58mm & 80mm** thermal printers  
- Includes `thermal.css`  
- A4 invoice printing optional  

---

## Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React + Vite + TypeScript |
| Desktop Runtime | Electron |
| UI Components | ShadCN UI |
| Styling | TailwindCSS |
| State Management | Zustand |
| Database | SQLite (better-sqlite3) |
| Reports/Printing | Thermal CSS + window.print() |

---

## Installation

###  Clone the Project  
git clone https://github.com/aswath-siddharth/Billing_Application.git

###  Install Dependencies  
npm install

###  Start the App (Dev Mode)  
npm run dev


Electron will launch automatically.

---

## Folder Structure

billing-app/
│── electron/ # Electron main process
│── src/
│ ├── routes/ # Billing, Items, Reports, Customers, FY
│ ├── stores/ # Zustand stores (items, bills, customers, FY)
│ ├── components/ # Forms, thermal preview, UI helpers
│ ├── utils/ # GST helpers, export, backup tools
│ ├── styles/ # Thermal & Tailwind styles
│ ├── mainRenderer.tsx # React entrypoint
│── public/
│── package.json
│── vite.config.ts
│── tailwind.config.cjs


---

## Build Production (EXE Installer)

npm run build
npm run electron:build

## Backup & Restore

### **Backup**  
Creates a ZIP file of the current financial year database.

### **Restore**  
Imports the ZIP and replaces the DB automatically.

Handled by:  
src/utils/backup.ts


---

## Thermal Printing

- Uses `src/styles/thermal.css`  
- `ReceiptPreview.tsx` provides print layout  
- Supports **58mm / 80mm thermal printers**  
- Optional **A4 PDF printing**  

---

## License

This project is for personal or commercial use by the owner.  
Redistribution requires permission.
