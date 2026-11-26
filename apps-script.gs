// Paste into the sheet: Extensions → Apps Script. Two jobs:
// 1. A "Map" menu that fills Lat/Lng columns on the Master tab from the Address column.
// 2. doGet(): deployed as a web app, it hands the map the Master tab's PUBLIC_COLUMNS as JSON,
//    so the sheet itself can stay private.
const TAB = 'Master';

// Only these columns leave the sheet. Remove one here (e.g. 'Notes') to keep it off the map.
// After changing this file: Deploy → Manage deployments → Edit → Version: New version → Deploy.
const PUBLIC_COLUMNS = ['Name', 'Project Name', 'Record Type', 'Category', 'Tier / Priority', 'Tier',
  'Status', 'Zone', 'Address', 'Start Date', 'End Date', 'General Contractor', 'Project Value',
  'Notes', 'Icon', 'Lat', 'Lng'];

function doGet() {
  const range = SpreadsheetApp.getActive().getSheetByName(TAB).getDataRange();
  const shown = range.getDisplayValues(); // text as it appears in the sheet ("Nov 2026", "20B")
  const raw = range.getValues();          // full-precision numbers for Lat/Lng
  const cols = shown[0].map((h, i) => [String(h).trim(), i]).filter(([h]) => PUBLIC_COLUMNS.includes(h));
  const rows = [];
  for (let r = 1; r < shown.length; r++) {
    const row = {};
    for (const [h, i] of cols) row[h] = (h === 'Lat' || h === 'Lng') ? raw[r][i] : shown[r][i];
    if (Object.values(row).some(v => v !== '')) rows.push(row);
  }
  return ContentService.createTextOutput(JSON.stringify(rows)).setMimeType(ContentService.MimeType.JSON);
}
const TIME_LIMIT_MS = 5 * 60 * 1000; // Apps Script stops at 6 min; leave room to save.

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Map')
    .addItem('Fill coordinates', 'fillCoordinates')
    .addItem('Auto-fill every hour', 'installHourlyTrigger')
    .addItem('Import coordinates', 'importCoordinates')
    .addToUi();
}

// Copies Lat/Lng from an imported tab whose first columns are Address, Lat, Lng (e.g. a CSV
// added with File → Import → Insert new sheet) into Master rows with the same Address and no Lat yet.
function importCoordinates() {
  const ss = SpreadsheetApp.getActive();
  const source = ss.getSheets().find(s => s.getName() !== TAB && s.getLastRow() > 1 &&
    s.getRange(1, 1, 1, 3).getDisplayValues()[0].join('|') === 'Address|Lat|Lng');
  if (!source) throw new Error('No tab with Address, Lat, Lng headers found. Import the CSV as a new sheet first.');

  const found = new Map();
  for (const [a, lat, lng] of source.getRange(2, 1, source.getLastRow() - 1, 3).getValues()) {
    if (typeof lat === 'number' && typeof lng === 'number') found.set(String(a).trim(), [lat, lng]);
  }

  const sheet = ss.getSheetByName(TAB);
  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const addrCol = header.indexOf('Address'), latCol = header.indexOf('Lat');
  if (addrCol < 0 || latCol < 0 || header[latCol + 1] !== 'Lng') throw new Error('Master needs Address, Lat and Lng columns.');
  const n = sheet.getLastRow() - 1;
  const addresses = sheet.getRange(2, addrCol + 1, n, 1).getValues();
  const coordsRange = sheet.getRange(2, latCol + 1, n, 2);
  const coords = coordsRange.getValues();
  let filled = 0;
  for (let i = 0; i < n; i++) {
    const hit = coords[i][0] === '' && found.get(String(addresses[i][0]).trim());
    if (hit) { coords[i] = hit; filled++; }
  }
  coordsRange.setValues(coords);
  ss.toast(`Filled ${filled} rows from "${source.getName()}". You can delete that tab now.`, 'Map', 30);
}

function fillCoordinates() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(TAB);
  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const addrCol = header.indexOf('Address');
  if (addrCol < 0) throw new Error('No "Address" column on ' + TAB);

  let latCol = header.indexOf('Lat');
  if (latCol < 0 || header[latCol + 1] !== 'Lng') {
    latCol = header.length;
    sheet.getRange(1, latCol + 1, 1, 2).setValues([['Lat', 'Lng']]);
  }
  const n = sheet.getLastRow() - 1;
  if (n < 1) return;

  const addresses = sheet.getRange(2, addrCol + 1, n, 1).getValues();
  const coordsRange = sheet.getRange(2, latCol + 1, n, 2);
  const coords = coordsRange.getValues();
  const geocoder = Maps.newGeocoder().setRegion('us');
  const start = Date.now();
  let filled = 0, notFound = 0, left = 0, stopped = '';

  try {
    for (let i = 0; i < n; i++) {
      const address = String(addresses[i][0]).trim();
      if (!address || coords[i][0] !== '') continue; // only blank rows; clear a cell to redo it
      const ll = /^\s*(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)\s*$/.exec(address); // Address already "lat, lng"
      if (ll) { coords[i] = [Number(ll[1]), Number(ll[2])]; filled++; continue; }
      if (stopped || Date.now() - start > TIME_LIMIT_MS) { left++; continue; }
      try {
        const hit = geocodeWithRetry(geocoder, address);
        if (hit) { coords[i] = [hit.geometry.location.lat, hit.geometry.location.lng]; filled++; }
        else { coords[i] = ['not found', '']; notFound++; }
      } catch (e) {
        stopped = e.message; // e.g. daily quota used up: keep what we have, count the rest as left
        left++;
      }
      Utilities.sleep(GEOCODE_PAUSE_MS);
    }
  } finally {
    coordsRange.setValues(coords); // save progress even if something above throws
  }
  SpreadsheetApp.getActive().toast(
    `Filled ${filled}. Not found: ${notFound}.` + (left ? ` ${left} left, run it again${stopped ? ' later' : ''}.` : '') +
    (stopped ? ` Stopped: ${stopped}` : ''), 'Map', 30);
}

const GEOCODE_PAUSE_MS = 500;

function geocodeWithRetry(geocoder, address) {
  for (let attempt = 1; ; attempt++) {
    try {
      return geocoder.geocode(address).results[0];
    } catch (e) {
      if (attempt >= 4 || !/short time/i.test(e.message)) throw e;
      Utilities.sleep(2000 * attempt); // Google asked us to slow down: back off and retry
    }
  }
}

function installHourlyTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'fillCoordinates')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('fillCoordinates').timeBased().everyHours(1).create();
  SpreadsheetApp.getActive().toast('New rows will get coordinates within an hour.', 'Map', 10);
}
