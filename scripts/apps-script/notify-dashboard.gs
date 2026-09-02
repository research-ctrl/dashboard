/**
 * Paste this into each chapter's Google Sheet:
 *   Extensions -> Apps Script -> replace Code.gs with this file
 *
 * Then set the two constants below, click Run once on installTrigger(),
 * and approve the permission prompt. From then on every save in the sheet
 * pings the dashboard, which drops its cache and pushes the new rows to
 * every open browser.
 *
 * This is what makes the board live without any polling: nothing is
 * requested until an editor actually changes something.
 */

// The deployed app, e.g. https://dashboard-xyz.vercel.app
const WEBHOOK_URL = 'https://YOUR-APP.vercel.app/api/sheets/changed';

// Must match SHEETS_WEBHOOK_SECRET in the Vercel environment variables.
const WEBHOOK_SECRET = 'PASTE-THE-SAME-SECRET-HERE';

function notifyDashboard() {
  const name = SpreadsheetApp.getActiveSpreadsheet().getName();

  const url =
    WEBHOOK_URL +
    '?secret=' + encodeURIComponent(WEBHOOK_SECRET) +
    '&source=' + encodeURIComponent(name);

  UrlFetchApp.fetch(url, {
    method: 'post',
    muteHttpExceptions: true,
  });
}

/** Run this once, by hand, to install the triggers. */
function installTrigger() {
  const sheet = SpreadsheetApp.getActive();

  // Clear old triggers so running this twice does not double up.
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    ScriptApp.deleteTrigger(trigger);
  });

  // onChange covers added rows, deleted rows and structural edits.
  ScriptApp.newTrigger('notifyDashboard')
    .forSpreadsheet(sheet)
    .onChange()
    .create();

  // onEdit covers ordinary cell edits.
  ScriptApp.newTrigger('notifyDashboard')
    .forSpreadsheet(sheet)
    .onEdit()
    .create();

  Logger.log('Triggers installed for ' + sheet.getName());
}

/** Optional: run this to check the webhook answers before relying on it. */
function testWebhook() {
  const response = UrlFetchApp.fetch(
    WEBHOOK_URL + '?secret=' + encodeURIComponent(WEBHOOK_SECRET) + '&source=test',
    { method: 'post', muteHttpExceptions: true }
  );
  Logger.log(response.getResponseCode() + ' ' + response.getContentText());
}
