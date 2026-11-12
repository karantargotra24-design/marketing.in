/**
 * ScapeMedia — website lead catcher (Google Apps Script web app)
 *
 * What it does: the website's "Send via WhatsApp" button opens this web app's URL
 * with the form fields. It saves the lead to the "Leads" tab, emails you, then
 * forwards the visitor to WhatsApp with their message pre-filled.
 *
 * SETUP (one time, ~3 minutes):
 * 1. Open the sheet "ScapeMedia — Website Leads" → Extensions → Apps Script.
 * 2. Delete the sample code, paste this whole file, click Save.
 * 3. Deploy → New deployment → type "Web app".
 *      Execute as: Me    Who has access: Anyone
 *    Click Deploy, allow the permissions, copy the Web app URL (ends in /exec).
 * 4. Send that URL to Claude (or paste it into window.SM_SHEET in the website file).
 */

const WA_NUMBER = '919682514271';   // your WhatsApp, country code + number
const SHEET_NAME = 'Leads';
const EMAIL_ALERTS = true;          // email you on every new lead

function doGet(e) {
  const p = (e && e.parameter) || {};
  const name = clean_(p.name, 80);
  const phone = String(p.phone || '').replace(/\D/g, '').slice(-10);
  const service = clean_(p.service, 80);
  const message = clean_(p.message, 600);
  const source = clean_(p.source || 'Website form', 60);

  const waText = p.text ? String(p.text).slice(0, 1200)
    : `Hi Karan, I'm ${name || '—'}. I'm interested in: ${service || '—'}.${message ? ' ' + message : ''} My WhatsApp: ${phone || '—'}`;
  const waUrl = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(waText);

  // Only log real leads (name + 10-digit number). Duplicate clicks within 2 min are ignored.
  if (name.length > 1 && phone.length === 10 && !p.hp) {
    const cache = CacheService.getScriptCache();
    const key = 'lead_' + phone;
    if (!cache.get(key)) {
      cache.put(key, '1', 120);
      const lock = LockService.getScriptLock();
      lock.waitLock(10000);
      try {
        const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
        sh.appendRow([
          new Date(), name,
          '=HYPERLINK("https://wa.me/91' + phone + '","+91 ' + phone + '")',
          service, message, source,
          clean_(p.page, 200), clean_(p.utm_source, 60), clean_(p.utm_medium, 60),
          clean_(p.utm_campaign, 100), clean_(p.ref, 200), 'New', '', ''
        ]);
      } finally { lock.releaseLock(); }
      if (EMAIL_ALERTS) {
        try {
          MailApp.sendEmail(Session.getEffectiveUser().getEmail(),
            '🔥 New lead: ' + name + ' — ' + (service || source),
            'Name: ' + name + '\nWhatsApp: +91 ' + phone + '\nInterested in: ' + service +
            '\nMessage: ' + (message || '—') + '\nSource: ' + source +
            '\n\nReply now: https://wa.me/91' + phone +
            '\nSheet: ' + SpreadsheetApp.getActive().getUrl());
        } catch (err) { /* email quota hit — lead is still saved */ }
      }
    }
  }

  const html =
    '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0B0B0C;color:#fff;font:16px system-ui,sans-serif;text-align:center}' +
    'a{display:inline-block;margin-top:18px;background:#25D366;color:#04210f;font-weight:700;padding:14px 26px;border-radius:999px;text-decoration:none}' +
    'p{color:#9a9aa3}</style></head><body><div><h2>Thanks' + (name ? ', ' + esc_(name.split(' ')[0]) : '') + '! 🙌</h2>' +
    '<p>Opening WhatsApp so you can send your message to Karan…</p>' +
    '<a id="go" href="' + esc_(waUrl) + '" target="_top">Continue to WhatsApp</a></div>' +
    '<script>setTimeout(function(){try{window.top.location.href=' + JSON.stringify(waUrl) + '}catch(e){}},400)</script>' +
    '</body></html>';
  return HtmlService.createHtmlOutput(html).setTitle('ScapeMedia')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Blocks spreadsheet formula injection and trims length.
function clean_(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max || 200);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
function esc_(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Run once from the editor to check everything works (adds a TEST row + email).
function testLead() {
  doGet({ parameter: { name: 'Test Lead', phone: '9999999999', service: 'Meta Ads', message: 'Setup test', source: 'Manual test' } });
}
