// Paste into the sheet: Extensions → Apps Script. Adds a "Map" menu that fills Lat/Lng
// columns on the Master tab from the Address column, using Google's geocoder.
const TAB = 'Master';
const TIME_LIMIT_MS = 5 * 60 * 1000; // Apps Script stops at 6 min; leave room to save.

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Map')
    .addItem('Fill coordinates', 'fillCoordinates')
    .addItem('Auto-fill every hour', 'installHourlyTrigger')
    .addToUi();
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
  let filled = 0, notFound = 0, left = 0;

  for (let i = 0; i < n; i++) {
    const address = String(addresses[i][0]).trim();
    if (!address || coords[i][0] !== '') continue; // only blank rows; clear a cell to redo it
    if (Date.now() - start > TIME_LIMIT_MS) { left++; continue; }
    const hit = geocoder.geocode(address).results[0];
    if (hit) { coords[i] = [hit.geometry.location.lat, hit.geometry.location.lng]; filled++; }
    else { coords[i] = ['not found', '']; notFound++; }
  }
  coordsRange.setValues(coords);
  SpreadsheetApp.getActive().toast(
    `Filled ${filled}. Not found: ${notFound}.` + (left ? ` ${left} left, run it again.` : ''), 'Map', 10);
}

function installHourlyTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'fillCoordinates')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('fillCoordinates').timeBased().everyHours(1).create();
  SpreadsheetApp.getActive().toast('New rows will get coordinates within an hour.', 'Map', 10);
}
