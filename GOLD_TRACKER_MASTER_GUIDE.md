# Personal Gold Tracker — Master Guide

> **Purpose:** This is the practical, easy-to-understand master guide for the Personal Gold Tracker. It explains what the system means, how the numbers are calculated, what happens after each action, and how to handle simple, medium, complex, and real-life jewellery scenarios.
>
> **Current baseline:** Final Phase 12 architecture, including Phases 0.1–12. This guide is written for the actual application model rather than as a generic gold-accounting guide.

---

## 1. What Is Gold Tracker?

Personal Gold Tracker is a personal jewellery, bullion, precious-metal, gemstone, transaction, lifecycle, reporting, backup, and multi-device management system.

Think of it as a **digital jewellery register + gold accounting ledger + asset history book + gemstone register + audit system** in one application.

The most important principle is:

> **An asset is the physical thing you own. A transaction is an event that changes, moves, creates, or closes that asset.**

Examples of assets:
- Gold ring
- Gold chain
- Pair of bangles
- Gold coin
- Gold bar
- Bullion
- Silver article/bar
- Digital holding

Examples of events:
- Purchase
- Gift received
- Gift given
- Inheritance received
- Owner transfer
- Location transfer
- Sale
- Correction
- Reversal
- Split
- Merge

---

# 2. The Five Concepts You Must Understand First

## 2.1 Asset

An asset is the actual item or holding.

Example:

`AST-001 — 22K Gold Ring — 10.00 g gross`

The asset can have:
- Gross weight
- Stone weight
- Net gold weight
- Purity/fineness
- Fine gold weight
- Purchase cost
- Owner
- Location/locker
- Documents
- Stones
- Lifecycle history
- Audit information

## 2.2 Transaction

A transaction records what happened.

Example:

`TX-001 — PURCHASE — AST-001 — ₹75,000`

The transaction history is the chronological story of the vault.

## 2.3 Gross Weight

Gross weight is the complete physical weight measured on the scale.

Example:

Ring on scale = **8.50 g**

Gross weight = **8.50 g**

## 2.4 Stone / Other Non-Gold Weight

Stones and other non-gold components are not gold.

Example:

Gross = 8.50 g
Diamond = 0.50 ct

1 carat = 0.20 g, so:

0.50 ct × 0.20 = **0.10 g** stone weight

Therefore:

Net gold weight = 8.50 − 0.10 = **8.40 g**

## 2.5 Fine Gold Weight

Fine gold weight is the amount of 24K-equivalent gold contained in the net gold.

For 22K / 916 fineness:

`Fine Gold = Net Gold Weight × 916 / 1000`

Example:

8.40 × 0.916 = **7.6944 g fine gold**

This distinction is extremely important:

> **Gross weight, net gold weight, and fine gold weight are three different numbers. Do not treat them as interchangeable.**

---

# 3. Purity Reference

The current data model supports these purity/fineness combinations:

| Karat | Fineness | Approx. percentage |
|---|---:|---:|
| 24K | 999 | 99.9% |
| 22K | 916 | 91.6% |
| 21K | 875 | 87.5% |
| 20K | 750 | 75.0% |
| 18K | 750 | 75.0% |
| 14K | 585 | 58.5% |
| 10K | 417 | 41.7% |

> **Important:** The application's master data is the final authority for the purity option and fineness actually selected in your workbook. Do not manually assume a purity value if the Master Data has been configured differently.

---

# 4. How the Application Is Organized

The major functional areas are:

1. Authentication
2. Dashboard
3. Asset Register
4. Master Data
5. Transaction History
6. Validation / Reconciliation
7. Reports
8. Charts / Pivots
9. SIP Plans
10. Life Goals
11. Quick Transaction Entry
12. Asset Lifecycle
13. Stone/Gemstone details
14. Backup / Restore
15. Cloud Sync

Use this mental model:

`MASTER DATA → ASSET → TRANSACTION → LEDGER → RECONCILIATION → DASHBOARD/REPORTS`

For structural changes:

`ASSET → SPLIT/MERGE → NEW ASSET(S) → LIFECYCLE → LEDGER/REPORTS`

---

# 5. First-Time Setup — Beginner Walkthrough

## Example 5.1 — Start From Zero

Suppose you own one 22K gold ring.

### Step 1 — Sign in
Use **Continue with Google**.

### Step 2 — Check Master Data
Make sure the required owner, category, asset type, metal type, purity, location, payment mode, and other dropdown values exist.

### Step 3 — Create the acquisition
Use the normal acquisition workflow or Quick Entry where appropriate.

### Step 4 — Enter the physical information
Example:
- Name: Gold Ring
- Type: Jewellery
- Category: Ring
- Metal: Gold
- Gross: 10.00 g
- Stone: 0 g
- Purity: 22K
- Fineness: 916

### Step 5 — Enter purchase information
Example:
- Date: 2026-09-01
- Source: ABC Jewellers
- Rate: ₹7,000/g
- Making: ₹5,000
- Other charges: ₹500
- GST: as per actual invoice

### Step 6 — Review
Always read the review before saving.

### Step 7 — Save
The asset and transaction are recorded.

### Step 8 — Verify
Check:
- Asset Register
- Transaction History
- Dashboard
- Reconciliation

### Expected result
One active asset exists, its acquisition is in the ledger, and the relevant portfolio totals update without duplicate counting.

---

# 6. SIMPLE EXAMPLES

These examples are designed for someone learning the system for the first time.

## Simple 1 — Plain 22K Gold Ring

Input:
- Gross = 10.00 g
- Stone = 0
- Purity = 22K / 916

Calculation:
- Net gold = 10.00 g
- Fine gold = 10 × 916/1000 = **9.16 g**

Expected:
- One asset created
- 10 g gross
- 10 g net gold
- 9.16 g fine gold
- Transaction recorded

---

## Simple 2 — 24K Gold Coin

Input:
- Gross = 20.00 g
- Stone = 0
- Fineness = 999

Calculation:
- Net = 20.00 g
- Fine ≈ 20 × 0.999 = **19.98 g**

Expected:
- Coin remains a single asset
- No stone deduction
- Fine gold follows selected fineness

---

## Simple 3 — Gold Chain With No Stones

Input:
- Gross = 25.30 g
- Other non-gold = 0
- Purity = 22K / 916

Calculation:
- Net = 25.30 g
- Fine = 25.30 × 0.916 = **23.1748 g**

Expected:
- Chain appears in holdings
- Fine gold contributes to the gold total

---

## Simple 4 — Location Transfer

Existing:
- AST-001: Gold Ring
- Location: Home Safe

Action:
- Location Transfer → Bank Locker

Expected:
- The physical asset remains the same asset
- Its location changes
- The transaction history records the movement
- Gold weight is not duplicated

---

## Simple 5 — Owner Transfer / Gift Given

Existing:
- AST-002: 22K Chain
- Owner: Vipul

Action:
- Gift/Owner Transfer to another person

Expected:
- Ownership event is recorded
- The old holding is not silently retained as a duplicate active asset
- History remains available for audit/lifecycle purposes

---

## Simple 6 — Sale

Existing:
- AST-003: Gold Coin

Action:
- SALE

Expected:
- Sale event recorded
- Asset moves out of active holdings according to the application lifecycle rules
- Historical transaction remains available
- Dashboard active holdings decrease accordingly

---

# 7. MEDIUM EXAMPLES

## Medium 1 — Ring With Diamond

Input:
- Gross = 8.50 g
- Diamond = 0.50 ct
- Purity = 22K / 916

Stone conversion:
- 0.50 ct × 0.20 = **0.10 g**

Gold calculation:
- Gross = 8.50 g
- Stone = 0.10 g
- Net gold = **8.40 g**
- Fine gold = 8.40 × 0.916 = **7.6944 g**

Expected:
- Diamond appears in Stone Inventory
- 0.50 ct is preserved as carat weight
- 0.10 g physical stone weight is used for the gold-weight calculation
- Diamond weight is never added to gold weight

---

## Medium 2 — Ring With Multiple Stones

Input:
- Gross = 12.00 g
- Diamond A = 0.20 ct
- Diamond B = 0.30 ct
- Ruby = 0.50 ct

Total stone carat = **1.00 ct**

Physical stone weight = 1.00 × 0.20 = **0.20 g**

Net gold = 12.00 − 0.20 = **11.80 g**

If 22K/916:

Fine gold = 11.80 × 0.916 = **10.8088 g**

Expected:
- Three stone records or equivalent individual records
- Total stone inventory = 1.00 ct
- Gold calculation uses 0.20 g stone weight
- No gemstone carat is treated as 1 gram of gold

---

## Medium 3 — Jewellery With Certification

Example diamond:
- Type: Diamond
- Quantity: 1
- Weight: 0.75 ct
- Cut: Round
- Color: G
- Clarity: VS1
- Certificate Issuer: GIA
- Certificate Number: actual certificate number

Expected:
- Certificate details remain attached to the stone record
- Stone remains traceable to the parent asset
- Stone Inventory can be used for review

---

## Medium 4 — Purchase → Location Transfer → Sale

Timeline:

Day 1: Purchase ring
↓
Day 2: Move ring from Home Safe to Bank Locker
↓
Day 90: Sell ring

Expected history:
1. Purchase
2. Location Transfer
3. Sale

The application should preserve the chronology rather than replacing the original purchase record.

---

## Medium 5 — Correction

Original entry:
- Gross = 10.00 g

Actual invoice:
- Gross = 10.20 g

Use a **CORRECTION** rather than silently changing historical records in a way that destroys the audit trail.

Expected:
- Correction is visible in history
- Final data reflects the corrected value
- Audit trail explains why the change occurred

---

# 8. COMPLEX EXAMPLES

## Complex 1 — Diamond Necklace With Full Stone Details

Scenario:
- Necklace gross = 48.75 g
- 12 diamonds
- Total diamonds = 3.20 ct
- Ruby = 1.00 ct
- Other non-gold weight = 0.50 g
- Purity = 22K / 916

Stone weight:
- Total stones = 4.20 ct
- Physical stone weight = 4.20 × 0.20 = **0.84 g**

Net gold:
- 48.75 − 0.84 − 0.50 = **47.41 g**

Fine gold:
- 47.41 × 0.916 = **43.40756 g**

Expected:
- Stone inventory preserves individual stone information
- Gold calculation excludes stone/non-gold weight
- Fine gold is based on net gold and selected fineness
- Reports remain consistent

---

## Complex 2 — Purchase → Stones → Split → Sale

Scenario:

A 30 g gold necklace contains stones. Later, the necklace is redesigned into two pieces.

### Stage 1 — Purchase
Create parent asset:

`AST-100 — Necklace — 30.00 g gross`

### Stage 2 — Add/record stones
Record each stone or stone group with quantity, carat, physical weight, and certificate details where available.

### Stage 3 — Split
Split parent into:
- Child A — Pendant
- Child B — Chain

The parent becomes archived according to lifecycle rules.

### Stage 4 — Sell Child A
Sell the pendant.

Expected lifecycle:

`AST-100 Parent`
→ `AST-101 Pendant`
→ `SALE`

and

`AST-100 Parent`
→ `AST-102 Chain`

Expected controls:
- Parent-child lineage remains visible
- Sold child does not remain in active holdings
- Unsold child remains active
- Gold is not counted twice
- Stone allocation must remain traceable

---

## Complex 3 — Multiple Assets → Merge

Scenario:

You melt:
- Ring A = 8.00 g
- Chain B = 15.00 g
- Coin C = 10.00 g

into a new bar.

Workflow:

`Ring A`
`Chain B`  → **MERGE** → `New Bar`
`Coin C`

Expected:
- Source assets are archived according to merge rules
- New asset is created
- New asset references all source asset IDs
- Lifecycle report shows the complete relationship
- Source assets are not simultaneously counted as active holdings

---

## Complex 4 — Split Followed by Merge

Scenario:

1. Necklace A is purchased.
2. Necklace A is split into A1 and A2.
3. A1 is later merged with Ring B.
4. New asset C is created.
5. C is sold.

Expected lifecycle:

`A → A1 → C → SALE`

and

`B → C → SALE`

This is an important audit test because the final asset has more than one ancestor.

---

# 9. EXTREME / ADVANCED EXAMPLES

## Extreme 1 — Split → Merge → Sale → Reconciliation

Starting asset:
- Gross = 50.00 g
- Stones = 2.00 g
- Net gold = 48.00 g
- Purity = 22K / 916

Fine gold:
- 48 × 0.916 = **43.968 g**

Split into:
- Child A = 20.00 g gross
- Child B = 30.00 g gross

Later merge Child A with another 10.00 g asset to create Asset C.

Then sell Asset C.

UAT must verify:
1. Parent is not active after split.
2. Child records have correct lineage.
3. Merge references all source assets.
4. Sold output is no longer active.
5. No source asset is double-counted.
6. Transaction History contains every structural event.
7. Lifecycle report reconstructs the chain.
8. Reconciliation reports no orphan or impossible relationship.

---

## Extreme 2 — Complex Diamond Jewellery Through Lifecycle

Start:
- Necklace gross = 60.00 g
- Diamonds = 5.00 ct = 1.00 g physical weight
- Other non-gold = 0.50 g
- 22K / 916

Net gold:
- 60.00 − 1.00 − 0.50 = **58.50 g**

Fine gold:
- 58.50 × 0.916 = **53.586 g**

Then:
1. Split necklace into two child assets.
2. Allocate stones for manual review where the physical stone distribution is not automatically provable.
3. Merge one child with another ring.
4. Sell the merged result.
5. Run reconciliation.
6. Review Stone Inventory.
7. Review Lifecycle.
8. Export to Excel.

Expected:
- Gold weight and stone weight remain separate throughout.
- No stone is silently duplicated during split/merge.
- Lifecycle remains traceable.
- Any allocation requiring human judgement is clearly reviewable.

---

# 10. REAL-LIFE EXAMPLES

## Real-Life 1 — Wedding Jewellery Portfolio

Suppose a family has:
- 2 necklaces
- 4 bangles
- 2 rings
- 1 chain
- 1 pair of earrings
- 2 gold coins

Each item should normally be recorded as its own identifiable asset where separate physical ownership/history matters.

Recommended process:

1. Create clean Master Data.
2. Create each physical asset.
3. Enter actual invoice information.
4. Enter gross/net/stones accurately.
5. Record owner and location.
6. Attach document references.
7. Add stone certificates where available.
8. Verify Dashboard.
9. Run Reconciliation.
10. Create a backup.

---

## Real-Life 2 — Jewellery Moved Between Home and Bank

Monday:
- Ring at Home Safe.

Tuesday:
- Ring moved to Bank Locker.

Friday:
- Ring returned Home.

Use **Location Transfer** each time.

Do not create a second ring.

Expected history:

`Original Asset`
→ `Home → Bank`
→ `Bank → Home`

Gold weight remains unchanged.

---

## Real-Life 3 — Family Gift

Father gives a 22K chain to the user.

Record:
- Gift received
- Previous owner
- New owner
- Relationship
- Date
- Asset information
- Supporting document/note where applicable

The important question is not merely "How much gold do I have?" but also:

> **Where did this asset come from, who owned it, and when did ownership change?**

---

## Real-Life 4 — Inherited Jewellery

A grandmother's necklace is inherited.

Record the asset as an inheritance-related event and preserve:
- Previous owner
- Relationship
- Original source
- Document reference if available
- Inheritance status
- Generation information where applicable
- Current owner

Do not destroy the historical story simply because ownership has changed.

---

## Real-Life 5 — Selling One Item From a Large Collection

Portfolio:
- 15 active assets.

Sell one ring.

Expected:
- 14 remaining active assets, assuming all other assets remain active
- Sold ring remains historically traceable
- Dashboard active holdings reduce appropriately
- Sale appears in Transaction History
- Reports remain consistent

---

## Real-Life 6 — Jewellery Remodelling

A jeweller takes:
- Old chain
- Old ring

and produces:
- New necklace

Recommended conceptual workflow:

`Old Chain + Old Ring`
→ `MERGE / structural transformation as applicable`
→ `New Necklace`

If the actual physical process is a melt/remake, document the event and preserve the source IDs. Never simply delete the old assets.

---

## Real-Life 7 — Diamond Ring With Missing Certificate

You own a diamond ring but cannot find its certificate.

Record the stone details you know and leave certificate information accurately incomplete rather than inventing a certificate number.

Then use reconciliation/audit reporting to identify the missing certificate reference.

Expected:
- Asset remains traceable
- Stone remains recorded
- Missing documentation can be identified as an audit issue

---

## Real-Life 8 — Physical Audit of the Locker

Expected list:
- 10 assets

Physically found:
- 9 assets

One asset is missing.

Record the physical audit result and identify the missing asset.

The correct response is **not** to delete the asset from the system.

Instead:
- Keep the historical record
- Mark the appropriate audit status
- Investigate
- Correct the record only after the real-world situation is known

---

## Real-Life 9 — Purchase With Invoice

Invoice says:
- Gold jewellery = 18.20 g gross
- Stones = 0.40 ct
- Purity = 22K
- Gold rate = ₹X/g
- Making charges = ₹Y
- Other charges = ₹Z
- GST = ₹T

Enter the actual invoice values.

The system should preserve the purchase cost components and the physical gold accounting separately.

Do not use the total invoice amount as a replacement for the physical weight fields.

---

## Real-Life 10 — Two Devices

Morning:
- Add a coin on phone.

Later:
- Open laptop.

Expected:
- The cloud-backed workbook reflects the saved coin.
- The laptop should receive the current cloud state.

If two devices edit the same workbook version and a stale revision is detected:

> **The system should protect the newer cloud data instead of silently overwriting it.**

Reload the cloud version and re-enter the intended change.

---

# 11. STONE/GEMSTONE MASTER EXAMPLES

## Stone Example A — Diamond

Input:
- Type: Diamond
- Quantity: 1
- Weight: 0.50 ct
- Physical weight: 0.10 g
- Shape: Round
- Color: G
- Clarity: VS1
- Certificate issuer: GIA

Expected:
- Stone inventory = 0.50 ct
- Physical stone weight = 0.10 g
- Gold calculation deducts 0.10 g where the stone is part of the asset's non-gold weight

## Stone Example B — Two Diamonds

Input:
- 2 stones
- 0.20 ct each

Total:
- 0.40 ct
- 0.08 g physical weight

## Stone Example C — Ruby

Input:
- Type: Ruby
- Quantity: 3
- Total weight: 1.50 ct

Record it as gemstone data. Do not assume that every stone has diamond-specific cut/color/clarity values.

---

# 12. SPLIT — EASY EXPLANATION

## What does Split mean?

One physical/registered asset becomes multiple child assets.

Example:

`1 Necklace`
↓
`Pendant + Chain`

The original parent remains part of history but should not be counted as an active duplicate of its children.

## What to check after Split

- Parent archived/status handled correctly
- Child IDs are unique
- Child weights are correct
- Parent-child references exist
- Stone allocation is correct or flagged for review
- Active totals do not double-count the parent
- Lifecycle report is correct

---

# 13. MERGE — EASY EXPLANATION

## What does Merge mean?

Multiple source assets are combined into one new asset.

Example:

`Ring A + Ring B + Chain C`
↓
`New Gold Bar`

## What to check

- All source IDs are preserved
- Source assets are no longer double-counted as active
- New asset has a unique ID
- New asset references its sources
- Lifecycle report is correct
- Transaction History contains the merge event

---

# 14. DASHBOARD — HOW TO READ IT

Use the Dashboard as a summary, not as the detailed audit ledger.

If you see a gold total, ask:

1. Is it gross weight or fine gold?
2. Are archived assets excluded?
3. Are sold assets excluded from active holdings?
4. Are stones deducted correctly?
5. Are split/merge source assets being double-counted?
6. Does the number agree with Asset Register and reports?

For important decisions, cross-check the Dashboard against the detailed reports.

---

# 15. TRANSACTION HISTORY — THE STORY OF YOUR VAULT

Transaction History may contain:

- PURCHASE
- OPENING BALANCE
- GIFT RECEIVED
- GIFT GIVEN
- INHERITANCE RECEIVED
- INHERITANCE TRANSFERRED
- OWNER TRANSFER
- LOCATION TRANSFER
- SALE
- CORRECTION
- REVERSAL
- ASSET SPLIT
- ASSET MERGE
- OTHER

For every important event, ask:

> What asset changed, what happened, when did it happen, and what is the resulting active state?

---

# 16. RECONCILIATION — YOUR SAFETY CHECK

Reconciliation is where you look for inconsistencies.

Typical checks include:
- Mathematical anomalies
- Missing master-data references
- Orphan records
- Lifecycle inconsistencies
- Missing document information
- Stone-related inconsistencies

### Example

Asset says:
- Gross = 8.50 g
- Stone = 1.00 g
- Net = 8.40 g

This is mathematically inconsistent because:

8.50 − 1.00 = 7.50 g

A reconciliation check should identify the discrepancy.

Never ignore a validation error merely because the Dashboard looks correct.

---

# 17. BACKUP AND RESTORE

## Backup example

Before a major restructuring:

1. Verify current data.
2. Run reconciliation.
3. Download a JSON backup.
4. Store it safely.
5. Perform the structural change.

## Restore example

If a catastrophic mistake occurs:

1. Stop making further changes.
2. Confirm the correct backup.
3. Start Restore.
4. Understand that restoring replaces the current cloud workbook state.
5. Use the automatic pre-restore safety backup if needed.
6. Re-check Dashboard, Assets, Transactions, Stones, Lifecycle, and Reconciliation.

> **Backup is a safety copy. Cloud sync is synchronization. They are not the same thing.**

---

# 18. MULTI-DEVICE AND CONFLICT EXAMPLE

## Safe case

Phone saves:
`Purchase Coin`

Laptop is open and listening to the same workbook.

Expected:
- Laptop receives the updated cloud state.

## Conflict case

Laptop loads revision 10.
Phone saves revision 11.
Laptop attempts to save based on revision 10.

Expected:
- Laptop save is rejected as stale.
- The cloud revision is protected.
- User is asked to reload the cloud version.
- The application must not silently concatenate or overwrite conflicting data.

This is especially important for financial/weight records.

---

# 19. QUICK ENTRY — REAL-WORLD USE

Quick Entry is for fast everyday transactions.

Typical flow:

`Select Type`
→ `Select Asset`
→ `Enter Details`
→ `Review`
→ `Save`

### Example

You move a ring from Home Safe to Bank Locker while outside the house.

Instead of opening a complex workflow:

1. Tap Quick Tx.
2. Select Location Transfer.
3. Select Ring.
4. Select new location.
5. Review.
6. Save.

For complex structural operations such as Split/Merge, use the advanced workflow.

---

# 20. SIP PLAN EXAMPLE

A Gold SIP plan can represent a recurring gold investment plan.

Example:
- Monthly amount = ₹5,000
- Frequency = Monthly
- Tenure = 24 months
- Completed installments = 6
- Missed installments = 0
- Total invested = ₹30,000
- Accumulated grams = actual recorded grams
- Status = ACTIVE

The SIP record is conceptually different from a physical jewellery asset. Keep investment-plan information separate from physical asset records.

---

# 21. LIFE GOAL EXAMPLE

Example goal:

**Child Education**
- Target weight = 250 g
- Target value = ₹X
- Target year = 2045
- Allocated asset IDs = selected assets

The goal is a planning layer. It should not create duplicate gold assets.

---

# 22. WHAT NOT TO DO

## Do not create duplicate assets for a location move
Wrong:

`Ring at Home`
+ another asset
`Ring at Bank`

Correct:

One ring + Location Transfer transactions.

## Do not delete an asset just because it was sold
Preserve the historical record according to the application's archive/lifecycle model.

## Do not convert carats directly into gold grams
0.50 ct is not 0.50 g.

Using the application's stated conversion:

0.50 ct = 0.10 g physical stone weight.

## Do not overwrite historical events unnecessarily
Use the appropriate transaction/correction mechanism so the audit trail remains understandable.

## Do not manually alter cloud data outside the application's workflow
That can break relationships between assets, transactions, stones, and lifecycle records.

## Do not assume a dashboard number is correct without reconciliation
The detailed ledger and validation reports are essential for auditing.

---

# 23. GOLD ACCOUNTING QUICK REFERENCE

## Formula 1 — Stone physical weight

`Stone grams = Carat × 0.20`

Example:

`0.75 ct × 0.20 = 0.15 g`

## Formula 2 — Net gold weight

`Net Gold = Gross Weight − Stone Weight − Other Non-Gold Weight`

Example:

`20.00 − 0.20 − 0.10 = 19.70 g`

## Formula 3 — Fine gold

`Fine Gold = Net Gold × Fineness / 1000`

Example for 916:

`19.70 × 916 / 1000 = 18.0452 g`

## Formula 4 — Purchase cost model

The asset model records purchase cost using the conceptual structure:

`(Net Gold Weight × Purchase Rate) + Making Charges + Other Charges + GST`

Use actual invoice values and the application's configured fields.

---

# 24. COMPLETE END-TO-END REAL-LIFE MASTER EXAMPLE

This is the single example to use when learning the entire system.

## Day 1 — Purchase

Buy a diamond ring.

Input:
- Gross = 8.50 g
- Diamond = 0.50 ct
- Stone physical weight = 0.10 g
- Purity = 22K / 916

Calculation:
- Net gold = 8.40 g
- Fine gold = 7.6944 g

Create the asset and purchase transaction.

## Day 2 — Store It

Location:
- Home Safe

No new asset is created.

## Day 30 — Move It

Location Transfer:
- Home Safe → Bank Locker

## Day 90 — Remodelling

The ring is combined with another gold item as part of a remodelling process.

Use the appropriate structural workflow and preserve the source relationship.

## Day 91 — New Asset

A new jewellery asset exists with its own ID and lineage.

## Day 180 — Sell New Asset

Record Sale.

## Day 181 — Audit

Check:
- Asset Register
- Transaction History
- Dashboard
- Stone Inventory
- Lifecycle
- Reconciliation

## Day 182 — Export

Export reports to Excel.

## Day 183 — Backup

Create a JSON backup.

This complete chain demonstrates the main philosophy of Gold Tracker:

`Physical Item → Accounting → Location → Structural Change → Lineage → Sale → Audit → Reporting → Backup`

---

# 25. UAT LEARNING PATH

If you are testing the application for the first time, do not begin with the most complicated scenario.

Use this order:

### Level 1 — Simple
1. Login
2. Create master data
3. Create plain gold asset
4. Purchase
5. Location transfer
6. Sale
7. Dashboard check
8. Transaction History check

### Level 2 — Medium
9. Jewellery with stones
10. Multiple stones
11. Certificate information
12. Correction
13. Gift/owner transfer
14. Backup/restore

### Level 3 — Complex
15. Split
16. Merge
17. Split → Sale
18. Merge → Sale
19. Split → Merge
20. Stone allocation through lifecycle

### Level 4 — Real-Life
21. Full family jewellery portfolio
22. Locker audit
23. Inheritance
24. Remodelling
25. Multi-device workflow
26. Conflict scenario
27. Full reconciliation
28. Excel export

---

# 26. FINAL CROSS-CHECK METHOD

Whenever you are unsure whether the system is correct, use this chain:

**1. Asset Register**

What physical assets exist?

↓

**2. Transaction History**

What happened to them?

↓

**3. Gold Accounting**

Are gross, stone, net, purity, and fine gold correct?

↓

**4. Stone Inventory**

Are gemstones correctly recorded?

↓

**5. Lifecycle**

Are split/merge relationships correct?

↓

**6. Reconciliation**

Are there errors or orphan records?

↓

**7. Dashboard**

Do summary numbers agree?

↓

**8. Reports**

Do detailed reports agree?

↓

**9. Excel Export**

Does the exported data agree with the application?

↓

**10. Backup**

Can the current state be safely preserved?

If all ten agree, confidence in the recorded portfolio is high.

---

# 27. TROUBLESHOOTING — EASY QUESTIONS

## "Why is gross weight higher than net gold?"

Because gross can include stones and other non-gold material.

## "Why is fine gold lower than net gold?"

Because 22K/916 gold is not 100% pure gold.

## "Why isn't my sold asset on active holdings?"

Because sold assets should not continue to count as active holdings under the lifecycle model.

## "Why did my stone not increase gold weight?"

Because stones are tracked separately from gold.

## "Why can't I save while offline?"

The current release intentionally blocks writes while offline to avoid unsafe conflict resolution and mathematical corruption.

## "Why did my laptop reject a save?"

A newer cloud revision may have been saved by another device. Reload the cloud version and re-enter the intended change.

## "Why do I see a reconciliation issue?"

Something may be mathematically inconsistent, missing from master data, missing a relationship, or otherwise failing an integrity rule. Use the issue recommendation rather than guessing.

---

# 28. GOLD TRACKER GOLDEN RULES

1. **One physical asset should have one stable identity.**
2. **Transactions describe events; they are not duplicate assets.**
3. **Gross weight is not net gold weight.**
4. **Net gold weight is not fine gold weight.**
5. **Stone carats are not gold grams.**
6. **Keep gemstone records separate from gold accounting.**
7. **Never intentionally double-count split/merge sources.**
8. **Preserve lifecycle history.**
9. **Use correction/reversal mechanisms rather than destroying audit history.**
10. **Reconcile before trusting a large portfolio change.**
11. **Back up before major structural changes.**
12. **Cloud Sync and Backup are different protections.**
13. **If a conflict occurs, protect the cloud revision instead of silently overwriting it.**
14. **Use actual invoices/certificates and never invent missing data.**
15. **When in doubt, trace the chain: Asset → Transaction → Calculation → Lifecycle → Reconciliation → Report.**

---

# 29. MASTER GUIDE QUICK CHEAT SHEET

| Situation | Correct concept/workflow |
|---|---|
| Buy jewellery | Acquisition / Purchase |
| Receive family jewellery | Gift Received / Inheritance Received |
| Give jewellery | Gift Given / Ownership Transfer |
| Move jewellery | Location Transfer |
| Fix an entry | Correction |
| Undo an event where supported | Reversal |
| Sell jewellery | Sale |
| Break one asset into several | Split |
| Combine several assets | Merge |
| Track diamond | Stone Record |
| Track certificate | Stone certificate fields |
| Check discrepancies | Reconciliation / Validation |
| See all events | Transaction History |
| See current holdings | Asset Register / Dashboard |
| See gemstone holdings | Stone Inventory |
| Follow asset ancestry | Lifecycle |
| Preserve a point-in-time state | Backup |
| Recover from a backup | Restore |
| Fast everyday entry | Quick Entry |
| Use phone + laptop | Cloud Sync |
| Two devices disagree | Conflict handling |

---

# 30. Final Understanding

If you remember only one diagram, remember this:

```text
                         MASTER DATA
                              │
                              ▼
                           ASSET
                              │
             ┌────────────────┼────────────────┐
             ▼                ▼                ▼
        TRANSACTION        STONES          DOCUMENTS
             │                │                │
             └────────────────┼────────────────┘
                              ▼
                       CALCULATIONS
                 Gross → Net → Fine Gold
                              │
                              ▼
                       LIFECYCLE EVENTS
                     Split / Merge / Sale
                              │
                              ▼
                        RECONCILIATION
                              │
                              ▼
                  DASHBOARD + REPORTS
                              │
                              ▼
                       EXCEL EXPORT
                              │
                              ▼
                           BACKUP
```

The goal of Gold Tracker is not simply to answer **"How much gold do I have?"**

It should let you answer:

- What do I own?
- What is each item actually made of?
- How much net gold is present?
- How much fine gold is present?
- Which stones are present?
- Where is each asset?
- Who owns it?
- Where did it come from?
- What happened to it over time?
- Was it split or merged?
- Was it sold or transferred?
- Can I prove the history?
- Do the numbers reconcile?
- Can I recover the data if something goes wrong?

That is the complete operating philosophy of the Personal Gold Tracker.

---

## Document Status

**Guide:** GOLD_TRACKER_MASTER_GUIDE.md  
**Application baseline:** Phase 12 final release  
**Purpose:** Owner/User reference, training, UAT preparation, and real-life operating guide  
**Important:** Where application behavior and this guide ever differ, the current production code and validated business rules are the technical authority; update this guide rather than creating a second competing explanation.
