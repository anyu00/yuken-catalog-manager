# Yuken Catalog Manager - Modularization Guide

## Current Status ✅

I've created the foundation for modularizing your application:

### ✅ Created Directories
- `js/` - JavaScript modules directory
- `js/pages/` - Individual page/tab modules  
- `js/utils/` - Utility modules (Firebase, data management)
- `css/` - Stylesheets directory

### ✅ Created Files
1. **`css/styles.css`** - All extracted CSS from the HTML file
2. **`js/utils/firebase.js`** - Firebase initialization and configuration

## Next Steps - Create Page Modules

You have **7 tabs** to modularize. Create these files in `js/pages/`:

###1. `manage-catalog.js` - Catalog Management Page
Extract from HTML lines containing:
- Form handling (id="catalogEntryForm")
- Event listeners for CatalogName change, QuantityReceived, IssueQuantity input
- `recalcStockQty()` function
- `Insbtn` click handler
- Auto-calculation logic

```javascript
import { db, ref, set, get, update } from '../utils/firebase.js';

export const manageCatalogPage = {
    async init() {
        // Setup event listeners for catalog form
        // Populate CatalogName select options
    },
    
    async handleInsert() {
        // Save catalog entry to Firebase
    }
};
```

### 2. `place-order.js` - Place Order Page
Extract:
- Form handling (id="orderForm")
- `OrderBtn` click handler
- Rich text formatting functions (formatOrderMsg, formatOrderMsgColor, formatOrderMsgFontSize)
- Order placement logic

```javascript
import { db, ref, set } from '../utils/firebase.js';

export const placeOrderPage = {
    async init() {
        // Setup order form event listeners
        // Populate OrderCatalogName select
    },
    
    async handlePlaceOrder() {
        // Save order to Firebase
    }
};
```

### 3. `catalog-entries.js` - Catalog Entries Display
Extract:
- `renderCatalogTablesAccordion()` function
- Inline editing logic for catalog table
- Delete and sample data generation buttons

```javascript
import { db, ref, onValue, update, remove } from '../utils/firebase.js';

export const catalogEntriesPage = {
    async init() {
        // Render accordion tables
        // Setup inline editing
    }
};
```

### 4. `order-entries.js` - Order Entries Display
Extract:
- `renderOrderTablesAccordion()` function
- Inline editing for orders
- Delete and sample generation

### 5. `reports.js` - Reports Page (Stock Chart)
Extract:
- Stock chart rendering
- `renderCatalogTable()` function
- Chart update logic

### 6. `stock-calendar.js` - Calendar Page
Extract:
- `initializeCalendar()` function
- FullCalendar initialization
- Event loading and display logic

### 7. `analytics.js` - Analytics Dashboard
Extract:
- All analytics rendering functions
- Date range filtering
- Chart.js visualizations
- Modal customization logic

## Data Manager Module

Create `js/utils/data-manager.js`:

```javascript
import { db, ref, set, get, update, remove, onValue } from './firebase.js';

export const catalogManager = {
    async saveCatalogEntry(data) {
        const key = `${data.CatalogName}_${Date.now()}`;
        return await set(ref(db, `Catalogs/${key}`), data);
    },
    
    async getLastEntry(catalogName) {
        // Get the latest catalog entry by name
    },
    
    // Other CRUD operations...
};

export const orderManager = {
    async saveOrderEntry(data) {
        // Save order logic
    },
    
    // Other CRUD operations...
};
```

## Main Entry Point

Create `js/main.js`:

```javascript
import { manageCatalogPage } from './pages/manage-catalog.js';
import { placeOrderPage } from './pages/place-order.js';
import { catalogEntriesPage } from './pages/catalog-entries.js';
import { orderEntriesPage } from './pages/order-entries.js';
import { reportsPage } from './pages/reports.js';
import { stockCalendarPage } from './pages/stock-calendar.js';
import { analyticsPage } from './pages/analytics.js';

const pages = {
    manageCatalog: manageCatalogPage,
    placeOrder: placeOrderPage,
    catalogEntries: catalogEntriesPage,
    orderEntries: orderEntriesPage,
    reports: reportsPage,
    stockCalendar: stockCalendarPage,
    analytics: analyticsPage
};

document.addEventListener('DOMContentLoaded', () => {
    setupTabSwitching();
    manageCatalogPage.init();
});

function setupTabSwitching() {
    document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const tabName = btn.dataset.tab;
            
            // Update active state
            document.querySelectorAll('.sidebar-nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Hide all tabs
            document.querySelectorAll('.tab-section').forEach(tab => {
                tab.style.display = 'none';
            });
            
            // Show selected tab
            const tabEl = document.getElementById(`tab-${tabName}`);
            if (tabEl) {
                tabEl.style.display = '';
                if (pages[tabName]) {
                    await pages[tabName].init();
                }
            }
        });
    });
}
```

## Updated HTML

Update your `index.html`:

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <!-- Existing meta tags and external resources -->
    <link rel="stylesheet" href="css/styles.css">
    <!-- ... other external libs ... -->
</head>
<body>
    <!-- Your existing sidebar and tabs HTML -->
    
    <!-- Replace inline scripts with: -->
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <script type="module" src="js/main.js"></script>
</body>
</html>
```

## Benefits of This Structure

✅ **Maintainability** - Each page is in its own file
✅ **Reusability** - Utilities (Firebase, data manager) are shared
✅ **Scalability** - Easy to add new features
✅ **Testability** - Individual modules can be tested
✅ **Performance** - Modules can be lazy-loaded in future
✅ **Organization** - Clear separation of concerns

## File Structure After Completion

```
Yuken Catalog Manager/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   ├── pages/
│   │   ├── manage-catalog.js
│   │   ├── place-order.js
│   │   ├── catalog-entries.js
│   │   ├── order-entries.js
│   │   ├── reports.js
│   │   ├── stock-calendar.js
│   │   └── analytics.js
│   └── utils/
│       ├── firebase.js
│       └── data-manager.js
└── [existing files]
```

## Tips for Implementation

1. **Extract gradually** - Take one page at a time
2. **Test each module** - Ensure functionality works before moving to next
3. **Keep variable scope in mind** - Page modules should be self-contained
4. **Use consistent naming** - All page modules export an object with `init()` method
5. **Handle Firebase refs properly** - Import from utils/firebase.js

---

**Status**: Foundation created, ready for page module development
**Functionality**: Will remain 100% identical to original
**Next**: Create the 7 page modules following the patterns above
