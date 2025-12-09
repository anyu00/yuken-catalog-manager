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
    setupTabSwitching();
    
    // Initialize default page
    await manageCatalogPage.init();
    
    // Show default tab
    showTab('manageCatalog');
});

function setupTabSwitching() {
    const sidebarNavBtns = document.querySelectorAll('.sidebar-nav-btn');
    
    sidebarNavBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const tabName = btn.dataset.tab;
            
            if (tabName) {
                // Update active state
                sidebarNavBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Show tab and initialize page
                await showTab(tabName);
            }
        });
    });
}

async function showTab(tabName) {
    // Hide all tabs
    const tabSections = document.querySelectorAll('.tab-section');
    tabSections.forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Show selected tab
    const tabEl = document.getElementById(`tab-${tabName}`);
    if (tabEl) {
        tabEl.style.display = '';
        
        // Initialize page if it has init method
        if (pages[tabName] && pages[tabName].init) {
            try {
                await pages[tabName].init();
            } catch (error) {
                console.error(`Error initializing ${tabName} page:`, error);
            }
        }
    }
}

// Make showTab global for any inline calls
window.showTab = showTab;
