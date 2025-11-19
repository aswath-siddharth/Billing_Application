# Grocery Billing System

A complete desktop billing application for grocery shops with Tamil bill printing, GST reporting, and customer management.

## Features

- **Item Management**: Add/delete items with English names for search and Tamil names for billing
- **Customer Management**: Maintain customer details with Tamil names and GST numbers
- **Billing System**: 
  - Type items in English to add to cart
  - Automatic SGST and CGST calculation
  - Tamil bill printing
- **Financial Year Management**: Create and manage financial years
- **Reports**:
  - Monthly GST Report (with SGST and CGST breakdown)
  - Monthly Sales Report
- **Local Storage**: All data stored locally using IndexedDB

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Run the application in development mode:
```bash
npm run dev
```

This will:
- Start the Vite dev server
- Launch the Electron application

### Building for Production

Build the desktop application:
```bash
npm run build:desktop
```

The built application will be in the `release` folder.

## Usage

### 1. Set Up Financial Year

1. Go to **Financial Years** tab
2. Click **Add Financial Year** and select a start date
3. The system will automatically calculate the end date (1 year later)
4. Set the financial year as **Active** to start billing

### 2. Add Items

1. Go to **Items** tab
2. Fill in the form:
   - **English Name**: For searching while billing (e.g., "Rice")
   - **Tamil Name**: For printing on bills (e.g., "அரிசி")
   - **Unit Price**: Price per unit
   - **Unit**: Nos, Kg, L, etc.
   - **GST %**: GST rate (e.g., 5, 12, 18)
   - **HSN Code**: Optional
3. Click **Add Item**

### 3. Add Customers (Optional)

1. Go to **Customers** tab
2. Fill in customer details:
   - Name (English)
   - Tamil Name (for bill printing)
   - Phone, GST Number, Address (optional)
3. Click **Add Customer**

### 4. Generate Bills

1. Go to **Billing** tab
2. Type item name in English in the search box
3. Press Enter or click to add items to cart
4. Adjust quantities using +/- buttons
5. Select or enter customer details
6. Choose payment mode
7. Click **Generate Bill**
8. Click **Print Bill** to print in Tamil

### 5. View Reports

1. Go to **Reports** tab
2. View monthly GST and Sales reports for the active financial year

## Technical Details

- **Framework**: React + TypeScript
- **Desktop**: Electron
- **Database**: Dexie (IndexedDB wrapper)
- **State Management**: Zustand
- **Styling**: CSS with Tamil font support (Noto Sans Tamil)

## Data Storage

All data is stored locally in your browser's IndexedDB. No data is sent to any server.

## License

Private use only.
