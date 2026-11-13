# Personal Borrowed Money Tracker

**Record Owner:** Hari Satya Sai Puvvala  
**Application Type:** Personal Financial Record Management Web Application  
**Tech Stack:** React 18, Vite, JavaScript, CSS Design System, Lucide React

---

## 1. Overview & Verified Benchmark

The **Personal Borrowed Money Tracker** is a dedicated, responsive financial record management dashboard built specifically to maintain records of borrowed money, family dues, and repayments.

- **Grand Total Recorded:** **₹5,72,630** (Verified baseline across all initial records)
- **Close Family Total:** **₹4,35,830** (Harsha, Bhagravi, Srinu Pedhananna, Chakravathi, Bindu, Sai Hyd, Sowji, Madhu Pedhananna)
- **Outer Family Total:** **₹91,000** (Vishu & Sailaja, Janadhana, ChinnaBullema and Family, Saradi Uncle Garu, Anjineyalu Garu, Mohan, Yerammma)
- **Friends Total:** **₹45,800** (Vasu Uncle, Prasad Uncle, Subbarao Uncle)

> **Important Accounting Principle:**  
> The **Total Recorded Amount** is the aggregate sum of all historical transactions entered. It is **not** automatically the amount currently owed. Transactions categorized as **Family Debt** (such as father's ceremony and old dues), **Indirect / Not Directly Received** (such as Yerammma's ₹10,000 record), or **Unconfirmed** are kept distinct from **Confirmed Personal Debt**.

---

## 2. Special Visual Highlights & Classifications

1. **Srinu Pedhananna (Highlighted Record):**
   - Distinctive border, warm background, and **"IMPORTANT FAMILY RECORD"** badge.
   - Primary Ceremony Transaction: **₹2,00,000** (`Father's function and ceremony related expenses`) is prominently displayed and never merged with other transactions.
   - 3 separate unconfirmed personal transactions (`₹2,000`, `₹300`, `₹1,000`) bringing his verified total to **₹2,03,300**.
2. **Yerammma:**
   - Classified as **"Indirect / Not Directly Received"** (`₹10,000`).
   - Does not count as money personally received by Hari unless explicitly reclassified.
3. **Father's Old Dues (Vasu Uncle & Subbarao Uncle):**
   - Vasu Uncle: Father's outstanding due (`₹10,000`) and function-related expense (`₹2,500`) are classified under **Family Debt**.
   - Subbarao Uncle: Old father's due (`₹25,000`) is classified under **Family Debt** and kept distinct from personal dues (`₹6,000`).
4. **Date Policy:**
   - **Zero historical dates are invented or required.** All historical records remain date-free based on memory. Optional dates can be entered for new transactions if known.

---

## 3. How to Run Locally

### Prerequisites
- Node.js (v18+ or v24+)
- npm

### Installation & Launch
1. Open terminal in `d:/PersonalBorrow`.
2. Install dependencies (already installed):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000/
   ```
5. To run the automated verification audit test suite:
   ```bash
   node test/verifyAll.test.js
   ```

---

## 4. User Guide & Features

### A. How to Add a Person
1. Click the **"Add Person"** button in the header or on the All People page.
2. Enter the person's name (e.g. `Kiran Uncle`).
3. Select their category (`Close Family`, `Outer Family`, or `Friends`).
4. (Optional) Enter relationship notes (e.g. `Mother's side cousin`).
5. Click **"Save Person"**. The app immediately adds the person to the selected category and prevents duplicate names.

### B. How to Add a Transaction
1. Click **"Add Transaction"** in the header, on any person's card, or in their details modal.
2. Select the person from the dropdown.
3. Enter the amount in ₹ INR (must be > 0).
4. Enter the reason (leave empty to default to *"Not specified"*).
5. Choose the **Debt Classification**:
   - `Personal Debt` (direct personal liability)
   - `Family Debt` (father's ceremony or past dues)
   - `Indirect / Not Directly Received` (money not directly received)
   - `Informational Record` (record keeping only)
   - `Unconfirmed` (requires later verification)
6. (Optional) Enter date and additional notes.
7. Click **"Save Transaction"**. Totals update immediately without page refresh.

### C. How to Record Repayments
1. Click on any person's card to open their **Person Details Modal**.
2. Click **"Record Repayment"**.
3. Enter the repayment amount.
4. If the person has no confirmed personal debt (e.g. only family dues or unconfirmed amounts), the app requires you to check a confirmation box to apply payment towards family dues.
5. The confirmed outstanding balance updates dynamically.

### D. How to Edit and Delete Records
- **Edit Person:** Open Person Details → Click **"Edit Person"** to change name, category, or notes.
- **Edit Transaction:** Open Person Details → Locate the transaction → Click the pencil icon.
- **Delete Transaction:** Click the trash icon. A confirmation modal will appear to prevent accidental deletion.
- **Edit / Delete Repayment:** Switch to the Repayments tab in the person modal and use the action buttons.

### E. Financial Calculation Engine
- **Integer Paise Representation:** All arithmetic internally converts Rupee values to integer paise (`1 INR = 100 paise`), eliminating IEEE-754 floating-point rounding errors.
- **Indian Rupee Notation:** Formats numbers cleanly (e.g., `₹1,23,670`, `₹2,00,000`, `₹5,72,630`).
- **Dynamic Recalculation:** Summary cards, category headers, and individual balance cards update reactively upon any create, update, or delete action.

### F. Exporting & Restoring Backups
- **JSON Backup:** Navigate to **Settings** → Click **"Download Full JSON Backup"**. This downloads an offline JSON snapshot containing all people, transactions, repayments, classifications, and relationship notes.
- **CSV Export:** In **Settings** or **Transaction History**, export transactions or person summaries as spreadsheets.
- **Restore Backup:** In **Settings**, upload your JSON file. The system validates the schema, previews the record counts, creates a safety backup of your current data, and restores your records upon confirmation.
- **Reset to Benchmark:** Click **"Reset to Initial Records"** in Settings or in the Verification Audit to restore the initial verified dataset of ₹5,72,630.

---

## 5. Storage Architecture & Multi-Layer Persistence

1. **Dual-Layer Storage Protection (LocalStorage + IndexedDB Mirror):**
   - Every creation, update, or deletion commits immediately to synchronous `localStorage` AND mirrors asynchronously to persistent `IndexedDB`.
   - If `localStorage` is cleared or evicted by the browser, the application automatically recovers data from `IndexedDB` on startup.
2. **Atomic Unified State & Safety Backup Keys:**
   - In addition to individual keys, the system maintains `pbmt_unified_state_v1` and `pbmt_safety_backup_v1` to prevent partial key losses or corruption.
3. **Browser Storage Eviction Shield (`navigator.storage.persist()`):**
   - The app automatically requests persistent storage permission from modern browsers (Chrome, Edge, Safari, Firefox), protecting records from automatic eviction under disk pressure.
4. **Automatic Rolling Snapshots:**
   - Every data mutation creates a rolling timestamped snapshot in IndexedDB. Previous snapshots can be browsed and restored with a single click in **Settings**.
5. **Multi-Tab Synchronization & Unload Flushes:**
   - Storage event listeners ensure multiple open tabs stay in lockstep without overwriting each other.
   - Page unload and backgrounding listeners flush any pending state to persistent disk.
6. **Device Sync & Mobile WebViews:**
   - Browser storage is specific to the browser profile on that device.
   - When using on mobile devices, avoid opening links in temporary in-app webviews (e.g., inside WhatsApp/Instagram). Always open in standard Chrome or Safari, or tap "Add to Home Screen".
   - Maintain regular portable `.json` backups via **Settings → Download Full JSON Backup** to transfer records between phone and PC.
