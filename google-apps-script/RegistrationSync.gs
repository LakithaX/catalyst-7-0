/** Standalone sync worker. Install in the destination Sheet's Apps Script project.
 * Set Script Properties SUPABASE_URL and SUPABASE_SECRET_KEY, then run
 * installRegistrationSync() once. See docs/google-sheets-sync.md.
 * This replaces the old public registration receiver; do not deploy as a web app.
 */
var CATALYST_SHEET_ID = '1czkQD3vo7NQ0vi2xU8RCCjXYBsYJkM_n5FbFotml61k';
var CATALYST_TAB = 'Registrations';
var CATALYST_HEADERS = ["Registration ID","Delegate Reference","Registered At","Full Name","Gender","NIC Number","AIESEC Email","Personal Email","Phone","University","Other University","Study Year","Semester","Faculty","Other Faculty","Programme","Rank","Function","Other Function","Warrior Persona","Aspiration","Motivation","Final Note","CV Partner Consent","Status","Checked In At","Updated At","Last Synced At"];

function registrationSyncRpc(name, body) {
  var properties = PropertiesService.getScriptProperties();
  var url = (properties.getProperty('SUPABASE_URL') || '').trim().replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
  var key = (properties.getProperty('SUPABASE_SECRET_KEY') || '').trim();
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in Script Properties.');
  var headers = {apikey: key};
  if (key.indexOf('sb_secret_') !== 0) headers.Authorization = 'Bearer ' + key;
  var response = UrlFetchApp.fetch(url + '/rest/v1/rpc/' + name, {
    method: 'post', contentType: 'application/json', headers: headers,
    payload: JSON.stringify(body || {}), muteHttpExceptions: true
  });
  if (response.getResponseCode() >= 300) throw new Error('Supabase ' + name + ' failed (HTTP ' + response.getResponseCode() + '). Check migration and worker credentials.');
  return response.getContentText() ? JSON.parse(response.getContentText()) : null;
}

function registrationSyncSheet() {
  var book = SpreadsheetApp.openById(CATALYST_SHEET_ID);
  var sheet = book.getSheetByName(CATALYST_TAB);
  if (!sheet) sheet = book.insertSheet(CATALYST_TAB);
  if (sheet.getMaxColumns() < CATALYST_HEADERS.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), CATALYST_HEADERS.length - sheet.getMaxColumns());
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, CATALYST_HEADERS.length).setValues([CATALYST_HEADERS]);
    sheet.getRange(1, 1, 1, CATALYST_HEADERS.length).setFontWeight('bold').setBackground('#eeeeee').setWrap(true);
    sheet.setFrozenRows(1); sheet.setFrozenColumns(2);
    sheet.setColumnWidths(1, CATALYST_HEADERS.length, 190); sheet.setRowHeight(1, 44);
    sheet.getRange(1, 1, sheet.getMaxRows(), CATALYST_HEADERS.length).createFilter();
  }
  var actual = sheet.getRange(1, 1, 1, CATALYST_HEADERS.length).getValues()[0];
  if (JSON.stringify(actual) !== JSON.stringify(CATALYST_HEADERS)) throw new Error('Registrations headers have changed. Restore the expected columns before syncing.');
  return sheet;
}

function installRegistrationSync() {
  // Verify access before enabling the schedule. Re-running does not duplicate it.
  registrationSyncSheet();
  registrationSyncRpc('sheet_sync_batch');
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'syncRegistrations') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('syncRegistrations').timeBased().everyMinutes(1).create();
  syncRegistrations();
}

function syncRegistrations() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    var jobs = registrationSyncRpc('sheet_sync_batch');
    if (!jobs.length) return;
    var sheet = registrationSyncSheet();
    var ids = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues() : [];
    var rowsById = {};
    ids.forEach(function(row, i) {
      if (rowsById[row[0]]) throw new Error('Duplicate registration ID in sheet. Remove duplicates before syncing.');
      if (row[0]) rowsById[row[0]] = i + 2;
    });
    jobs.forEach(function(job) {
      var row = rowsById[job.registration_id] || sheet.getLastRow() + 1;
      try {
        if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 100);
        var values = job.cells.concat([new Date().toISOString()]).map(function(value) {
          var text = value === null ? '' : String(value);
          // Escape user-entered formulas; preserve phone numbers, NICs and IDs as text.
          return /^[=+\-@\t\r\n]/.test(text) ? "'" + text : text;
        });
        sheet.getRange(row, 1, 1, CATALYST_HEADERS.length).setNumberFormat('@').setValues([values]);
        SpreadsheetApp.flush();
        rowsById[job.registration_id] = row;
      } catch (error) {
        registrationSyncRpc('sheet_sync_ack', {p_id: job.registration_id, p_version: job.version, p_error: 'Google Sheets write failed. Check Apps Script executions and spreadsheet access.'});
        return;
      }
      // Ack only after a durable write. A failed ack retries the same ID next run.
      registrationSyncRpc('sheet_sync_ack', {p_id: job.registration_id, p_version: job.version});
    });
    var filter = sheet.getFilter();
    if (filter && filter.getRange().getNumRows() < sheet.getLastRow()) {
      filter.remove(); sheet.getRange(1, 1, sheet.getMaxRows(), CATALYST_HEADERS.length).createFilter();
    }
  } finally { lock.releaseLock(); }
}
