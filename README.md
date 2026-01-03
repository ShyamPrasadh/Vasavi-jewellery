# Sri Vasavi Jewellery Management System

A professional, real-time application designed for jewellery inventory management, pricing calculations, and pawn loan interest tracking. Built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**.

---

## 🚀 Key Modules

### 1. Gold Price Calculator
Provides a high-precision breakup of jewellery pricing based on live market rates.
- **Live Sync:** Integrates with GoldAPI.io for real-time 22KT and 24KT INR rates.
- **Product Categories:** Supports RINGS, EARRINGS, CHAINS, HARAMS, NECKLACES, and COINS.
- **Dynamic Breakup:** Shows Gold Value, Wastage Cost, and Labour charges separately.

### 2. Pawn Loan Management
A robust tool for tracking pawned items and calculating multi-entry interest.
- **Flexible Principal:** Support for initial principal and secondary "Extra Cash" entries added at any date.
- **Precise Duration:** Calculates months and days (as fractional months) between the pawn date and current date.
- **Financial Summary:** Generates a professional settlement statement with total payable amounts.
- **Printable Receipts:** Built-in PDF/Print preview for customer records.

### 3. Reference Rate Table
A centralized table displaying standard wastage and labour charges across different weight tiers and product categories.

---

## 🧮 Calculation Logic

### **Value Addition (VA) Logic**
The system uses a tier-based lookup to ensure fair and consistent pricing.

1.  **Lookup Mechanism:** The application searches for the **closest lower weight tier** (e.g., if weight is 7g, it uses the 6g tier).
2.  **Parameters:**
    *   `Waste`: Grams of gold added as wastage.
    *   `Lab`: Fixed labour/making charge in INR.
3.  **Formulas:**
    *   **Gold Value** = `Net Weight × Gold Rate`
    *   **Wastage Cost** = `Waste Grams × Gold Rate`
    *   **VA Amount** = `Wastage Cost + Labour Charge`
    *   **VA %** = `(VA Amount / Gold Value) × 100`
    *   **Total Amount** = `Gold Value + VA Amount`

### **Pawn Interest Logic**
Calculated on a monthly simple interest basis.

1.  **Time Calculation:**
    *   `Total Months = (Year Difference × 12) + Month Difference`
    *   `Days Adjustment = (Day Difference / 30)`
    *   `Final Duration = Total Months + Days Adjustment`
2.  **Interest Formula:**
    *   `Interest = (Principal × Monthly Rate × Duration) / 100`
3.  **Handling Extra Cash:** Each additional cash entry is treated as a separate interest-bearing entity from its specific "Date Added" up to the current date.

---

## 🛠️ Developer Guide

### Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Modern premium aesthetic)
- **Icons:** Lucide React
- **Type Safety:** TypeScript

### Environment Setup
1. Clone the repository.
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

### API Integration
Live gold rates are fetched via `/api/gold-rate`, which proxies requests to GoldAPI.io and provides a fallback rate if the API is unavailable.

---

## 🎨 Design Philosophy
- **Premium Aesthetic:** Uses a "Gold & Charcoal" theme (`#D4AF37` and `#333333`) to reflect the luxury nature of the business.
- **Precision First:** Wastage is tracked to 3 decimal places (milligrams) for complete transparency.
- **Mobile Optimized:** All interfaces are fully responsive for use on tablets and smartphones during customer interactions.
