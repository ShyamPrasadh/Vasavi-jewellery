# Gold Loan View Toggle Implementation

## Overview
Added a view toggle feature to the Gold Loan page, allowing users to switch between a graphical **Card View** (grid) and a detailed **List View** (table).

## Changes

### 1. New State Management
- Added `viewMode` state (`'card' | 'list'`) to track the user's preference.
- Imported `LayoutGrid` and `List` icons from `lucide-react`.

### 2. Header Enhancements
- Updated the section header to include a toggle switch next to the "Filter" button.
- The toggle highlights the active view mode with a gold background.

### 3. Card View (Default)
- Retained the existing grid layout for loan cards.
- Restructured the card content:
  - **Header**: Bill Number and Status (Active/Overdue/Closed).
  - **Body**: Customer Name, Product details.
  - **Footer**: Principal Amount, Interest Due.
- Added visual indicators for "Overdue" status in red.

### 4. List View (Table)
- Implemented a responsive table layout for efficiently viewing many loans.
- Columns:
  - Bill #
  - Customer (Name & Phone)
  - Product (Type & Weight)
  - Pledged On (Date)
  - Principal (Right-aligned)
  - Interest (Right-aligned)
  - Status (Active/Overdue/Closed badges)
  - Action (Arrow icon)
- Rows are clickable to open the details modal, same as cards.

### 5. Technical Improvements
- Fixed TypeScript errors related to `dateFrom` null checks and `viewingLoan` types.
- Corrected extensive nesting structure issues in the component to ensure valid JSX.

## Usage
- Click the **Grid Icon** to view loans as cards.
- Click the **List Icon** to view loans as a table.
- Both views support all existing filters and search functionality.
