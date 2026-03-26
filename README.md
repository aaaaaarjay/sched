# Online Scheduler with Google Sheets Backend

## Status
✅ **Fully implemented** - local fallback + online sync via Google Apps Script (GAS).

## Quick Setup
1. **Sheet**: https://docs.google.com/spreadsheets/d/17cKxYPpqYT5AzzynZ4fdmx-bmtYNKwpn6R6dfb-GAQU/edit (tabs: Schedule, Bookings)
2. **GAS**: https://script.google.com/macros/s/AKfycbwXjJNP2EDhIRwrvmEsdfRzcA5NyIlkeR3IG7KhHJXiFdo_TlJDTNCvFwRW8gIpKW43/exec
3. Open `index.html` - **works immediately** (localStorage fallback if online fails)

## Features
- 🔄 **Online Sync**: All adds/books/removes sync to Sheet A1 cells (JSON)
- 💾 **Offline Fallback**: localStorage caches data
- ⏳ Loading states, error toasts
- 🔐 Admin (password: 80BA3F306F97)

## Test
```
start index.html
```
- Admin login → add slots → client book → check Sheet for updates!

## CORS Fixed
- GET/POST hybrid fetchProxy handles GAS quirks
- Graceful fallbacks

Live demo ready!
