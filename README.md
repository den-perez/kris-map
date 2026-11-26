# kris-map

A live map of Austin Metro projects. It reads the **Master** tab of the Google Sheet each time the page opens, so edits to the sheet show up on the next refresh.

**Map:** https://den-perez.github.io/kris-map/

## How it works

- `index.html` loads the Master tab as CSV and draws one pin per row that has `Lat` and `Lng`.
- Layers come from `Record Type` and `Tier / Priority`: Tier 1–4, Facility Accounts, Contractors. A row whose `Status` contains "Completed" or "Cancelled" goes to the Completed/Cancelled layer instead. Pin colors match the original My Maps.
- The icon inside each pin comes from `Category` (factory for Manufacturing, school for Education, and so on).

## Choosing an icon for a row

Add a column named `Icon` to Master (anywhere). Type one of these names in it to override the category icon for that row. Leave it blank to keep the category icon; a name not on this list is ignored.

`account_balance` `apartment` `bed` `bolt` `church` `circle` `construction` `corporate_fare` `directions_bus` `dns` `engineering` `factory` `flight` `front_loader` `handyman` `home` `hotel` `local_hospital` `local_shipping` `location_city` `oil_barrel` `park` `recycling` `restaurant` `school` `science` `shopping_cart` `solar_power` `stadium` `store` `train` `warehouse` `water_drop`

Spaces and capitals are fine: `Shopping Cart` works. Preview any of them at https://fonts.google.com/icons. To add more, put the name in both the font link and the `ICONS` list in `index.html`.
- The sheet must stay shared as "Anyone with the link can view".

## One-time setup in the sheet (coordinates)

1. Open the sheet → **Extensions → Apps Script**, paste in `apps-script.gs`, save.
2. Reload the sheet. A **Map** menu appears.
3. **Map → Fill coordinates.** Approve the permissions prompt. It adds `Lat` and `Lng` columns to Master and fills them from `Address`. If it says rows are left, run it again.
4. Optional: **Map → Auto-fill every hour** so new rows get coordinates on their own.

Rows whose address can't be found get `not found` in `Lat`. Fix the address, clear that cell, and run it again.

## Adding a project

Add a row to Master with an Address. Run **Map → Fill coordinates** (or wait for the hourly run), then refresh the map.
