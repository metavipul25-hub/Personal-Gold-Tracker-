# Gold Tracker System

A modern financial management and inventory tracking spreadsheet application for precious metals, physical gold, jewellery, coins, and bullion.

## Features

- **Multi-Sheet Financial Interface**: Seamless workbook navigation across Master Data, Asset Register, Transaction History, Portfolio Valuation, Life Goals, and Real-Time Visual Dashboards.
- **Precision Weight & Fineness Accounting**: Automated calculation of Gross Weight, Stone Weight deductions, Karat-to-Fineness conversions, and 24K Pure Gold equivalent weights.
- **Transaction Accounting & Lineage**: Full audit trail for Purchases, Sales, Gifting, Inheritances, Asset Splits, Merges, and Reversals.
- **Cloud & Offline Resilience**: Firestore synchronization with atomic save safety, optimistic states, and instant JSON backup/restore capabilities.
- **Excel (.xlsx) Export**: One-click complete workbook export with multi-tab sheets and formula formatting.
- **Data Validation & Error Boundaries**: Built-in verification preventing invalid inputs or data corruption.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Visualization**: Recharts, Lucide React
- **Cloud Persistence**: Firebase / Cloud Firestore
- **Exporting**: SheetJS (xlsx)

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm, yarn, or pnpm

### Installation

1. Clone or download this repository:
   ```bash
   git clone <your-github-repo-url>
   cd <repo-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```
