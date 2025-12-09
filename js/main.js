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

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    // Simple tab switching - no routing
    $('.sidebar-nav-btn').on('click', function(e) {
        e.preventDefault();
        $('.sidebar-nav-btn').removeClass('active');
        $(this).addClass('active');
        const tab = $(this).data('tab');
        $('.tab-section').hide();
        $('#tab-' + tab).show();
        
        // Initialize the page module when tab is clicked
        if (pages[tab] && pages[tab].init) {
            try {
                pages[tab].init();
            } catch (error) {
                console.error(`Error initializing ${tab} page:`, error);
            }
        }
    });
    
    // Initialize first tab on load
    const firstTab = 'manageCatalog';
    if (pages[firstTab] && pages[firstTab].init) {
        try {
            pages[firstTab].init();
        } catch (error) {
            console.error(`Error initializing ${firstTab} page:`, error);
        }
    }
});
