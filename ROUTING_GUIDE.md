# URL Routing Guide

## Overview

The Yuken Catalog Manager now has **URL-based routing** that maps each tab to specific URLs, making it behave like a real multi-page application with proper browser history support.

## Supported Routes

| URL | Tab | Japanese Name |
|-----|-----|---------------|
| `/` | manageCatalog | カタログ管理 |
| `/catalog` | manageCatalog | カタログ管理 |
| `/manage` | manageCatalog | カタログ管理 |
| `/order` | placeOrder | 注文する |
| `/place-order` | placeOrder | 注文する |
| `/catalog-entries` | catalogEntries | カタログエントリ |
| `/catalogs` | catalogEntries | カタログエントリ |
| `/order-entries` | orderEntries | 注文エントリ |
| `/orders` | orderEntries | 注文エントリ |
| `/reports` | reports | レポート |
| `/analytics` | analytics | アナリティクス |
| `/calendar` | stockCalendar | カレンダー |
| `/stock-calendar` | stockCalendar | カレンダー |

## How It Works

### Router Module (`js/utils/router.js`)

The `Router` class handles:
- **URL to Tab Mapping**: Converts URL paths to tab names
- **History Management**: Uses browser History API for back/forward button support
- **Page Initialization**: Loads and initializes the appropriate page module
- **State Management**: Keeps track of current page state

### URL Examples

When you click on tabs or navigate, the URL will change:

```
Home Page:        http://localhost:8000/
Manage Catalog:   http://localhost:8000/catalog
Place Order:      http://localhost:8000/order
Catalog Entries:  http://localhost:8000/catalog-entries
Order Entries:    http://localhost:8000/orders
Reports:          http://localhost:8000/reports
Analytics:        http://localhost:8000/analytics
Calendar:         http://localhost:8000/calendar
```

### Browser Navigation

- **Click Tab** → URL changes → Page initializes
- **Click Back Button** → URL changes → Previous page loaded
- **Click Forward Button** → URL changes → Next page loaded
- **Direct URL** → App loads that page automatically
- **Refresh Page** → Current page persists and reloads

## Usage

### Basic Navigation

Users can navigate by:

1. **Clicking Sidebar Buttons** (automatic URL change)
2. **Direct URL Entry** (e.g., typing `/order` in address bar)
3. **Browser Back/Forward Buttons**
4. **Bookmarking URLs** for quick access

### Programmatic Navigation

In your JavaScript code:

```javascript
// Navigate to a page
await router.navigateTo('catalogEntries');

// Get current page name
const currentPage = router.currentPage;

// Listen for route changes
router.onChange((tabName) => {
    console.log(`Navigated to: ${tabName}`);
});
```

## Server Deployment

### For Apache Servers

The `.htaccess` file in the root directory handles client-side routing:

```apache
# Rewrite all requests to index.html
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
```

This ensures that direct URL requests like `/catalog` are handled by the browser's JavaScript router instead of looking for server files.

### For Nginx Servers

Add this to your Nginx configuration:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### For Node.js / Express Servers

```javascript
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
```

### For Static Hosting (GitHub Pages, Vercel, etc.)

These platforms automatically handle SPA routing, so no special configuration needed.

## Features

✅ **Browser History Support** - Back/forward buttons work correctly
✅ **URL Bookmarking** - Users can bookmark specific pages
✅ **Direct URL Access** - Navigate by typing URLs directly
✅ **Clean URLs** - No # hash routes, real URLs like `/catalog`
✅ **Page Persistence** - Refreshing maintains current page
✅ **Dynamic Tab Highlighting** - Sidebar shows active page

## Architecture

```
Router (js/utils/router.js)
├── Route Mapping (URL ↔ Tab Name)
├── History Management (pushState/popstate)
├── Page Initialization (init() methods)
└── Navigation Events

Main.js
├── Creates Router instance
├── Passes page modules to Router
└── Initializes on page load

Browser
├── URL changes → popstate event
├── Back/Forward → handled by Router
└── User clicks → navigateTo()
```

## Migration from Old System

The new routing system **replaces** the old manual tab switching:

**Old Way:**
```javascript
showTab('catalogEntries');  // Just showed tab
```

**New Way:**
```javascript
router.navigateTo('catalogEntries');  // Changes URL AND shows tab
```

The sidebar button clicks are automatically handled by the Router.

## Future Enhancements

Possible improvements:

1. **Query Parameters**: `/reports?dateRange=30`
2. **Deep Linking**: `/catalog/details/{id}`
3. **Breadcrumbs**: Show navigation path
4. **Page Titles**: Dynamically update `<title>`
5. **Meta Tags**: Update for social sharing
6. **Analytics Tracking**: Track page views

## Testing

To test routing locally:

1. Open `index.html` in browser (file:// URLs won't work for routing)
2. Use a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js with http-server
   npx http-server
   ```
3. Visit `http://localhost:8000`
4. Click tabs or type URLs like `http://localhost:8000/catalog`

---

**Implementation Date**: December 9, 2025
**Version**: 1.0.0
**Status**: Production Ready
