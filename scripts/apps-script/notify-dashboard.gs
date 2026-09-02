/**
 * Paste this into each chapter's Google Sheet:
 *   Extensions -> Apps Script -> replace Code.gs with this file
 *
 * Then fill in the three constants below, click Run once on installTrigger(),
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

/**
 * Vercel Deployment Protection keeps the board behind SSO. Google's servers
 * cannot log in, so without this token the webhook receives the Vercel login
 * page instead of the route and the board silently stops updating.
 *
 * Generate it at:
 *   Vercel -> Project -> Settings -> Deployment Protection
 *          -> Protection Bypass for Automation -> Add Secret
 */
const VERCEL_BYPASS_TOKEN = 'PASTE-THE-VERCEL-BYPASS-TOKEN-HERE';

function buildRequest_(source) {
  const url =
    WEBHOOK_URL +
    '?secret=' + encodeURIComponent(WEBHOOK_SECRET) +
    '&source=' + encodeURIComponent(source);

  const headers = {};
  if (VERCEL_BYPASS_TOKEN && VERCEL_BYPASS_TOKEN.indexOf('PASTE') !== 0) {
    headers['x-vercel-protection-bypass'] = VERCEL_BYPASS_TOKEN;
  }

  return {
    url: url,
    options: {
      method: 'post',
      headers: headers,
      muteHttpExceptions: true,
      // Do not chase a redirect. A 302 here means the bypass token is missing
      // or wrong; following it would land on Vercel's login page, return 200,
      // and hide the failure.
      followRedirects: false,
    },
  };
}

function notifyDashboard() {
  const name = SpreadsheetApp.getActiveSpreadsheet().getName();
  const request = buildRequest_(name);

  const response = UrlFetchApp.fetch(request.url, request.options);
  const code = response.getResponseCode();

  if (code === 200) return;

  if (code === 302 || code === 401) {
    Logger.log(
      'Dashboard NOT updated (HTTP ' + code + '). ' +
      'A 302 means Deployment Protection blocked it - check VERCEL_BYPASS_TOKEN. ' +
      'A 401 means WEBHOOK_SECRET does not match Vercel.'
    );
  } else {
    Logger.log(
      'Dashboard NOT updated. HTTP ' + code + ' ' +
      response.getContentText().slice(0, 200)
    );
  }
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

/**
 * Run this before relying on the triggers. It prints exactly what went wrong
 * rather than failing quietly in the background.
 */
function testWebhook() {
  const request = buildRequest_('test');
  const response = UrlFetchApp.fetch(request.url, request.options);
  const code = response.getResponseCode();
  const body = response.getContentText();

  if (code === 200) {
    Logger.log('OK - dashboard notified. ' + body);
  } else if (code === 302) {
    Logger.log(
      'BLOCKED by Vercel Deployment Protection (302). ' +
      'Set VERCEL_BYPASS_TOKEN to the Protection Bypass for Automation secret.'
    );
  } else if (code === 401) {
    Logger.log(
      'REJECTED (401). WEBHOOK_SECRET does not match SHEETS_WEBHOOK_SECRET in Vercel.'
    );
  } else {
    Logger.log('Unexpected HTTP ' + code + ' ' + body.slice(0, 300));
  }
}
