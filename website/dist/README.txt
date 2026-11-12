ScapeMedia website - Hostinger upload

1. hPanel -> Websites -> your site -> File Manager -> open public_html
2. Delete the default files there (default.php / index.php) if present
3. Upload scapemedia-hostinger.zip into public_html, right-click -> Extract
   (make sure index.html, .htaccess, favicon.svg, robots.txt sit directly inside public_html, not in a sub-folder)
4. hPanel -> Security -> SSL: install the free SSL for the domain
5. Open https://yourdomain and test: Services, Courses, WhatsApp buttons

To change WhatsApp number or turn on Google Sheets leads, edit index.html:
  window.SM_WA="919682514271"
  window.SM_SHEET=""   <- paste the Apps Script /exec URL here
