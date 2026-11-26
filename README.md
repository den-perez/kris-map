# kris-map

A live map of Austin Metro projects. It reads the **Master** tab of the Google Sheet each time the page opens, so edits to the sheet show up on the next refresh.

**Map:** https://den-perez.github.io/kris-map/

## How it works

- `index.html` loads the Master tab as CSV and draws one pin per row that has `Lat` and `Lng`.
- Layers come from `Record Type` and `Tier / Priority`: Tier 1–4, Facility Accounts, Contractors.
- The sheet must stay shared as "Anyone with the link can view".

## One-time setup in the sheet (coordinates)

1. Open the sheet → **Extensions → Apps Script**, paste in `apps-script.gs`, save.
2. Reload the sheet. A **Map** menu appears.
3. **Map → Fill coordinates.** Approve the permissions prompt. It adds `Lat` and `Lng` columns to Master and fills them from `Address`. If it says rows are left, run it again.
4. Optional: **Map → Auto-fill every hour** so new rows get coordinates on their own.

Rows whose address can't be found get `not found` in `Lat`. Fix the address, clear that cell, and run it again.

## Adding a project

Add a row to Master with an Address. Run **Map → Fill coordinates** (or wait for the hourly run), then refresh the map.
