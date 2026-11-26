# kris-map

A live map of construction projects. Each time the page opens it asks the sheet's Apps Script web app for the **Master** tab, so edits to the sheet show up on the next refresh. The sheets themselves stay private: the web app runs as the sheet owner and returns only the columns the map needs.

**Map:** https://den-perez.github.io/kris-map/

## Sheets

A dropdown at the top left switches between sheets. Each has its own link:

- Austin Metro: https://den-perez.github.io/kris-map/?sheet=austin (default)
- US: coming once its web app is deployed

The sheet needs an `Address` column. A name column can be `Name` or `Project Name`; a tier column can be `Tier / Priority` or `Tier`. An Address written as `lat, lng` (e.g. `31.80693, -106.6574`) is used as the pin location directly.

## Setting up a sheet

1. Open the sheet → **Extensions → Apps Script**. Delete what's there, paste in `apps-script.gs`, save.
2. **Deploy → New deployment.** Click the gear next to "Select type" → **Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Click **Deploy**, approve the permissions prompt, and copy the **Web app URL** (ends in `/exec`).
3. Put that URL in the `SHEETS` list near the top of the script in `index.html` (add a new line for a new sheet).
4. Reload the sheet. A **Map** menu appears. Run **Map → Fill coordinates**; if it says rows are left, run it again. Optional: **Map → Auto-fill every hour** so new rows get coordinates on their own.
5. Turn off link sharing on the sheet (**Share → General access → Restricted**). The map keeps working through the web app.

Rows whose address can't be found get `not found` in `Lat`. Fix the address, clear that cell, and run Fill coordinates again.

**Changing the script later:** saving isn't enough for the web app. Use **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. That keeps the same URL.

## What the map can see

Only the columns in `PUBLIC_COLUMNS` at the top of `apps-script.gs` leave the sheet: names, address, category, tier, status, zone, dates, contractor, value, notes, icon and coordinates. Other columns and other tabs stay private. To hide a column (for example `Notes`), remove it from that list and redeploy as above.

The web app URL is public, since the map has to reach it, so anyone who finds it can get the same data the map shows.

## Pins

- Layers come from `Record Type` and `Tier / Priority`: Tier 1–4, Facility Accounts, Contractors. A row whose `Status` contains "Completed" or "Cancelled" goes to the Completed/Cancelled layer instead. Empty layers are hidden. Pin colors match the original My Maps.
- The icon inside each pin comes from `Category` (factory for Manufacturing, school for Education, and so on).

### Choosing an icon for a row

Add a column named `Icon` to Master (anywhere). Type one of these names in it to override the category icon for that row. Leave it blank to keep the category icon; a name not on this list is ignored.

`account_balance` `apartment` `bed` `bolt` `church` `circle` `construction` `corporate_fare` `directions_bus` `dns` `engineering` `factory` `flight` `front_loader` `handyman` `home` `hotel` `local_hospital` `local_shipping` `location_city` `oil_barrel` `park` `recycling` `restaurant` `school` `science` `shopping_cart` `solar_power` `stadium` `store` `train` `warehouse` `water_drop`

Spaces and capitals are fine: `Shopping Cart` works. Preview any of them at https://fonts.google.com/icons. To add more, put the name in both the font link and the `ICONS` list in `index.html`.

## Adding a project

Add a row to Master with an Address. Run **Map → Fill coordinates** (or wait for the hourly run), then refresh the map.
