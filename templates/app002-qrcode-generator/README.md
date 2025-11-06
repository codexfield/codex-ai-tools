# QR Code Generator (front-end)

Lightweight, purely front-end QR code generator. Open `index.html` in a browser.

Features
- Supports URL, plain text, vCard contact, SMS and Email payloads
- Live preview, adjustable size, download as PNG
- Language switcher: English, Japanese, Korean, French, Traditional Chinese
- Light/dark theme toggle
- Input validation and length limits to reduce abuse

Notes
- The page uses `qrcode` library via CDN (https://cdn.jsdelivr.net/npm/qrcode). If you need offline use, replace the script tag in `index.html` with a locally bundled `qrcode.min.js`.
- URLs with `javascript:` are blocked. Text length and contact size are limited.
- To run: simply open `index.html` in a modern browser (no build required).

Security and limits
- URL length limited to ~2048 chars. Text limited to 800 chars. Contact to ~1200 chars. These are intended to keep generated QR payloads reasonable and avoid huge images.
