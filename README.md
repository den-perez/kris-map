# kris-map

A live map of construction projects. Each time the page opens it asks the sheet's Apps Script web app for the **Master** tab, so edits to the sheet show up on the next refresh. The sheets themselves stay private: the web app runs as the sheet owner and returns only the columns the map needs.

**Map:** https://den-perez.github.io/kris-map/

## Using the map

The panel on the left (the **List** button on phones) has:

- **Sheet dropdown** to switch between sheets.
- **Search box.** It matches name, address, category, contractor, status, zone, value and notes. Several words must all match: `hospital round rock`. For a state, search its abbreviation (`TX`), since addresses don't spell it out. As you type it suggests matching project names, contractors, categories, zones and statuses; pick one to search for it.
- **Tier checkboxes** to show or hide each layer, with how many projects match the search in each. All start unchecked, so the map is empty until you pick a tier. Each time you check or uncheck one, or change the search, the map zooms to fit the pins shown.
- **Project list**, sorted by tier and then largest value first. Click a project to zoom to it and open its details. Only the first 200 are listed; search to narrow it down. The map always shows every match.

## Sheets

Each sheet has its own link:

- Austin Metro: https://den-perez.github.io/kris-map/?sheet=austin (default)
- US: https://den-perez.github.io/kris-map/?sheet=us

The sheet needs an `Address` column. A name column can be `Name` or `Project Name`; a tier column can be `Tier / Priority` or `Tier`. An Address written as `lat, lng` (e.g. `31.80693, -106.6574`) is used as the pin location directly.

## Setting up a sheet

1. Open the sheet → **Extensions → Apps Script**. Delete what's there, paste in `apps-script.gs`, save.
2. **Deploy → New deployment.** Click the gear next to "Select type" → **Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Click **Deploy**, approve the permissions prompt, and copy the **Web app URL** (ends in `/exec`).
3. Put that URL in the `SHEETS` list near the top of the script in `index.html` (add a new line for a new sheet).
4. Reload the sheet. A **Map** menu appears. Run **Map → Fill coordinates**; if it says rows are left, run it again. Optional: **Map → Auto-fill every hour** so new rows get coordinates on their own.
5. Turn off link sharing on the sheet (**Share → General access → Restricted**). The map keeps working through the web app.
6. Run **Map → Set map password**. The map asks for it the first time someone opens it on a device and remembers it after that. Until a password is set the web app returns no data. To lock everyone out, set a new password and share it only with the people who should still have access.

Rows whose address can't be found get `not found` in `Lat`. Fix the address, clear that cell, and run Fill coordinates again.

**Changing the script later:** saving isn't enough for the web app. Use **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. That keeps the same URL.

**Caching:** the web app keeps a copy of the data for 10 minutes so most map loads skip reading the sheet. Typing in the Master tab, Fill coordinates and Import coordinates clear that copy, so those changes show on the next refresh. Changes that don't come from typing (another sheet's `IMPORTRANGE`, a formula recalculating, edits through other tools) can take up to 10 minutes to appear.

## What the map can see

Only the columns in `PUBLIC_COLUMNS` at the top of `apps-script.gs` leave the sheet: names, address, category, tier, status, zone, dates, contractor, value, notes, icon and coordinates. Other columns and other tabs stay private. To hide a column (for example `Notes`), remove it from that list and redeploy as above.

The map page and web app URL are public, but the web app hands out data only with the map password (each sheet has its own). Anyone you give the password can see everything the map shows, and can pass it on, so change it if it spreads too far. The password is remembered in the browser; clear the site's data to forget it.

## Pins

- Layers come from `Record Type` and `Tier / Priority`: Tier 1–4, Facility Accounts, Contractors. A row whose `Status` contains "Completed" or "Cancelled" goes to the Completed/Cancelled layer instead. Empty layers are hidden. Pin colors match the original My Maps.
- The icon inside each pin comes from `Category` (factory for Manufacturing, school for Education, and so on).

### Choosing an icon for a row

Add a column named `Icon` to Master (anywhere). Type one of these names in it to override the category icon for that row. Leave it blank to keep the category icon; a name not on this list is ignored.

`account_balance` `apartment` `bed` `bolt` `church` `circle` `construction` `corporate_fare` `directions_bus` `dns` `engineering` `factory` `flight` `front_loader` `handyman` `home` `hotel` `local_hospital` `local_shipping` `location_city` `oil_barrel` `park` `recycling` `restaurant` `school` `science` `shopping_cart` `solar_power` `stadium` `store` `train` `warehouse` `water_drop`

Spaces and capitals are fine: `Shopping Cart` works. Preview any of them at https://fonts.google.com/icons. To add more, put the name in both the font link and the `ICONS` list in `index.html`.

## Adding a project

Add a row to Master with an Address. Run **Map → Fill coordinates** (or wait for the hourly run), then refresh the map.
