/**
 * Paste this into each chapter's Google Sheet:
 *   Extensions -> Apps Script -> replace everything in Code.gs with this file
 *
 * Fill in the two constants below, save, run testWebhook() once and check the
 * log says OK, then run installTrigger() once and approve the prompt.
 *
 * From then on every save pings the dashboard, which drops its cache, pushes
 * the change to every open browser, and records which column was touched so
 * the board can show who last updated what.
 */

// The deployed app, e.g. https://dashboard-xyz.vercel.app
const WEBHOOK_URL = 'https://YOUR-APP.vercel.app/api/sheets/changed';

// Must match SHEETS_WEBHOOK_SECRET in the Vercel environment variables.
const WEBHOOK_SECRET = 'PASTE-THE-SAME-SECRET-HERE';

/**
 * Only needed if Vercel Deployment Protection is turned back on. While it is
 * off, leave this as it is — it is ignored.
 */
const VERCEL_BYPASS_TOKEN = 'PASTE-THE-VERCEL-BYPASS-TOKEN-HERE';

function buildUrl_(params) {
  var query = [];
  for (var key in params) {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }
  }
  return WEBHOOK_URL + '?' + query.join('&');
}

function requestOptions_() {
  var headers = {};
  if (VERCEL_BYPASS_TOKEN && VERCEL_BYPASS_TOKEN.indexOf('PASTE') !== 0) {
    headers['x-vercel-protection-bypass'] = VERCEL_BYPASS_TOKEN;
  }

  return {
    method: 'post',
    headers: headers,
    muteHttpExceptions: true,
    // Do not chase a redirect. A 302 means Deployment Protection blocked it;
    // following it would return 200 from a login page and hide the failure.
    followRedirects: false
  };
}

/**
 * Runs on every edit. `event` is supplied by the trigger and tells us the
 * exact cell, so we can send the column header the edit landed in.
 *
 * The dashboard reads the person's name out of that header — "Amount opex
 * (Lincoln)" — rather than from the Google account, which is often empty and
 * would name the sheet's owner rather than whoever owns the column.
 */
function notifyDashboard(event) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  var params = {
    secret: WEBHOOK_SECRET,
    spreadsheetId: spreadsheet.getId(),
    source: spreadsheet.getName()
  };

  if (event && event.range) {
    var sheet = event.range.getSheet();
    params.tab = sheet.getName();

    var column = event.range.getColumn();
    if (column <= sheet.getLastColumn()) {
      params.column = sheet.getRange(1, column).getDisplayValue();
    }

    // Sent so the dashboard can fall back to the tab's owner when the edited
    // column has no name in brackets — CRM project columns, for instance.
    params.firstColumn = sheet.getRange(1, 1).getDisplayValue();
  }

  var response = UrlFetchApp.fetch(buildUrl_(params), requestOptions_());
  var code = response.getResponseCode();

  if (code === 200) return;

  if (code === 302) {
    Logger.log('Dashboard NOT updated (302). Deployment Protection blocked it — turn it off, or set VERCEL_BYPASS_TOKEN.');
  } else if (code === 401) {
    Logger.log('Dashboard NOT updated (401). WEBHOOK_SECRET does not match Vercel.');
  } else {
    Logger.log('Dashboard NOT updated. HTTP ' + code + ' ' + response.getContentText().slice(0, 200));
  }
}

/**
 * Run this FIRST, by hand, and read the log. It sends a pretend edit so you
 * can see the whole path work before relying on the triggers.
 */
function testWebhook() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheets()[0];

  var params = {
    secret: WEBHOOK_SECRET,
    spreadsheetId: spreadsheet.getId(),
    source: spreadsheet.getName(),
    tab: sheet.getName(),
    column: sheet.getRange(1, 1).getDisplayValue(),
    firstColumn: sheet.getRange(1, 1).getDisplayValue()
  };

  var response = UrlFetchApp.fetch(buildUrl_(params), requestOptions_());
  var code = response.getResponseCode();
  var body = response.getContentText();

  if (code === 200) {
    Logger.log('OK — dashboard notified. ' + body);
  } else if (code === 302) {
    Logger.log('BLOCKED by Vercel Deployment Protection (302). Turn it off in Vercel, or set VERCEL_BYPASS_TOKEN.');
  } else if (code === 401) {
    Logger.log('REJECTED (401). WEBHOOK_SECRET does not match SHEETS_WEBHOOK_SECRET in Vercel.');
  } else {
    Logger.log('Unexpected HTTP ' + code + ' ' + body.slice(0, 300));
  }
}

/** Run this SECOND, once testWebhook says OK. */
function installTrigger() {
  var spreadsheet = SpreadsheetApp.getActive();

  // Clear old triggers so running this twice does not double up.
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    ScriptApp.deleteTrigger(trigger);
  });

  // onEdit carries the edited cell, which is what names the column and owner.
  ScriptApp.newTrigger('notifyDashboard')
    .forSpreadsheet(spreadsheet)
    .onEdit()
    .create();

  // onChange catches added and deleted rows. It carries no cell reference, so
  // those refresh the board without naming a column.
  ScriptApp.newTrigger('notifyDashboard')
    .forSpreadsheet(spreadsheet)
    .onChange()
    .create();

  Logger.log('Triggers installed for ' + spreadsheet.getName());
}
