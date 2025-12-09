import { manageCatalogPage } from './pages/manage-catalog.js';
import { placeOrderPage } from './pages/place-order.js';
import { catalogEntriesPage } from './pages/catalog-entries.js';
import { orderEntriesPage } from './pages/order-entries.js';
import { reportsPage } from './pages/reports.js';
import { stockCalendarPage } from './pages/stock-calendar.js';
import { analyticsPage } from './pages/analytics.js';
import Router from './utils/router.js';

const pages = {
    manageCatalog: manageCatalogPage,
    placeOrder: placeOrderPage,
    catalogEntries: catalogEntriesPage,
    orderEntries: orderEntriesPage,
    reports: reportsPage,
    stockCalendar: stockCalendarPage,
    analytics: analyticsPage
};

let router;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    // Create and initialize router
    router = new Router(pages);
    router.init();
});

// Expose router globally for accessing navigation if needed
window.router = router;
