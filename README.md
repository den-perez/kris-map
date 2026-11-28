# kris-map

A live map of construction projects. Each time the page opens it asks the sheet's Apps Script web app for the **Master** tab, so edits to the sheet show up on the next refresh. The sheets themselves stay private: the web app runs as the sheet owner and returns only the columns the map needs.

**Map:** https://den-perez.github.io/kris-map/

## Using the map

The panel on the left (the **List** button on phones) has:

- **Sheet dropdown** to switch between sheets.
- **Search box.** It matches name, address, category, contractor, status, zone, value and notes. Several words must all match: `hospital round rock`. For a state, search its abbreviation (`TX`), since addresses don't spell it out. As you type it suggests matching project names, contractors, categories, zones and statuses; pick one to search for it.
- **Clear filters** appears under the dropdowns whenever a search or dropdown is narrowing the list; it resets those (the tier boxes stay as they are).
- **Status, Category and Zone dropdowns** to show only one value of each (e.g. Active hospitals). A dropdown turns blue while it's narrowing the list. A dropdown only appears when the sheet has at least two different values in that column.
- **Start dropdown**: projects starting within the next 3, 6 or 12 months (counting this month), or already started. Rows with no readable `Start Date` are left out while it's set.
- **New or updated**: each time the map loads, it compares the sheet with the copy this device saved last time. Projects that appeared get a **New** tag and ones whose details changed get **Updated**, in the list and as a yellow dot on the pin, for a week. The **New or updated (N)** dropdown shows only those. It appears once something has changed; the first visit on a device has nothing to compare with. Each device keeps its own marks, and a renamed project counts as new.
- **Tier checkboxes** to show or hide each layer, with how many projects match the search in each. The first time, all start unchecked, so the map is empty until you pick a tier (on phones the panel opens by itself so the boxes are in view). After that each device remembers the tiers you last had ticked, per sheet. **Select all** and **Deselect all** above the boxes tick or clear every tier at once (both show while only some are ticked). Each time you check or uncheck one, or change the search, the map zooms to fit the pins shown.
- **Sort** dropdown for the list: tier then value (default), name, start date, or nearest to me (asks for your location and shows miles).
- **Count line**: how many projects match and their total `Project Value` (e.g. "38 of 300 projects · $4.2B"). Rows without a value count as $0.
- **Project list**, sorted by the Sort dropdown. Click a project to highlight it, zoom to it, open its details and make its pin bounce. Only the first 200 are listed; search to narrow it down. The map always shows every match.

On phones, a **Key** in the bottom-left corner of the map shows what each pin color means (tap to open or close it). On the map, nearby pins merge into numbered bubbles (the number is how many projects are inside). Click a bubble or zoom in to split it. Pins at the same spot fan out when clicked. Each pin's details have a **Directions** link that opens Google Maps, and phone numbers in the details can be tapped to call. The target button under the zoom buttons centers the map on where you are (the browser asks for permission the first time). The **Satellite** button below it switches to aerial photos with road and place labels (and **Map** switches back); each device remembers the choice.

**How fresh the data is:** the bottom of the panel says "Data as of N min ago", which is when the web app last read the sheet (it keeps a copy for up to 10 minutes).

**Fast reopening:** each device keeps the last copy of each sheet's map data it loaded (typically well under 1 MB). While you're signed in, the map shows that copy at once and swaps in the sheet's latest a few seconds later if anything changed, without moving the map or losing your filters. Without a connection it keeps showing the saved copy and says so. **Sign out** deletes the saved copies, and so does losing access (the page reloads to the sign-in screen).

**Add to Home Screen:** on a phone, use the browser's Share menu → **Add to Home Screen** (iPhone) or **Install app** (Android). The map then opens full-screen from its own icon. The first time, sign in again inside the app.

**Sharing a view:** the address bar keeps the current search, dropdowns and ticked tiers, so the link opens the same view for someone else. The **Share** button (top right) opens the phone's share sheet, or copies the link on a computer. They still have to sign in with a Google account that's on the sheet's Access tab. Switching sheets with the dropdown starts that sheet's view fresh.

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
6. Add a tab named **Access** and list the Google email of each person allowed to see the map in column A, one per row (a header like `Email` in A1 is fine). Until this tab exists nobody gets any data. To remove someone, delete their row; they lose access on their next visit.

Rows whose address can't be found get `not found` in `Lat`. Fix the address, clear that cell, and run Fill coordinates again.

**Changing the script later:** saving isn't enough for the web app. Use **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. That keeps the same URL.

**Caching:** the web app keeps a copy of the data for 10 minutes so most map loads skip reading the sheet. Typing in the Master tab, Fill coordinates and Import coordinates clear that copy, so those changes show on the next refresh. Changes that don't come from typing (another sheet's `IMPORTRANGE`, a formula recalculating, edits through other tools) can take up to 10 minutes to appear.

## What the map can see

Only the columns in `PUBLIC_COLUMNS` at the top of `apps-script.gs` leave the sheet: names, address, category, tier, status, zone, dates, contractor, value, notes, icon and coordinates. Other columns and other tabs stay private. To hide a column (for example `Notes`), remove it from that list and redeploy as above.

The map page and web app URL are public, but the web app hands out data only to visitors signed in with Google whose email is on that sheet's **Access** tab. Each sheet has its own list. Viewers never get access to the sheet itself. After signing in with Google, the sheet's script gives that device a 7-day pass, renewed each day they use the map, so regular viewers rarely see the sign-in screen. The Access tab is still checked on every visit, so removing someone takes effect on their next load. **Sign out** at the bottom of the panel deletes the pass. To cancel everyone's pass at once, open the sheet's Apps Script → **Project Settings → Script properties** and delete `PASS_SECRET`.

### Google sign-in setup (once)

The sign-in button needs an OAuth client ID from Google Cloud:

1. https://console.cloud.google.com → create a project (e.g. "Projects Map").
2. **APIs & Services → OAuth consent screen**: External, app name, your email. No scopes needed.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** → Web application. Under **Authorized JavaScript origins** add `https://den-perez.github.io`.
4. Put the Client ID (ends in `.apps.googleusercontent.com`) in `CLIENT_ID` in both `index.html` and `apps-script.gs`, and redeploy each sheet's script (new version).

## Pins

- Layers come from `Record Type` and `Tier / Priority`: Tier 1–4, Facility Accounts, Contractors. A row whose `Status` contains "Completed" or "Cancelled" goes to the Completed/Cancelled layer instead. Empty layers are hidden. Tier pin colors match the original My Maps; Facility Accounts are purple and Contractors black so they stand out from the map. Completed/Cancelled pins are blue-gray. Cluster bubbles are white with a dark ring, so they can't be mistaken for a pin color.
- The icon inside each pin comes from `Category` (factory for Manufacturing, school for Education, and so on).

### Choosing an icon for a row

Add a column named `Icon` to Master (anywhere). Type one of these names in it to override the category icon for that row. Leave it blank to keep the category icon; a name not on this list is ignored.

`account_balance` `apartment` `bed` `bolt` `church` `circle` `construction` `corporate_fare` `directions_bus` `dns` `engineering` `factory` `flight` `front_loader` `handyman` `home` `hotel` `local_hospital` `local_shipping` `location_city` `oil_barrel` `park` `recycling` `restaurant` `school` `science` `shopping_cart` `solar_power` `stadium` `store` `train` `warehouse` `water_drop`

Spaces and capitals are fine: `Shopping Cart` works. Preview any of them at https://fonts.google.com/icons. To add more, put the name in both the font link and the `ICONS` list in `index.html`.

## Adding a project

Add a row to Master with an Address. Run **Map → Fill coordinates** (or wait for the hourly run), then refresh the map.
