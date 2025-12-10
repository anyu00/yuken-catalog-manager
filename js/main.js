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
    // Tab switching for modern design
    // Support both old (.sidebar-nav-btn) and new (.category-btn) selectors for compatibility
    const tabButtons = document.querySelectorAll('.category-btn[data-tab], .sidebar-nav-btn[data-tab]');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Hide all content sections
            const sections = document.querySelectorAll('.content-section, .tab-section');
            sections.forEach(section => section.style.display = 'none');
            
            // Show active section - support both naming conventions
            const activeSection = document.getElementById('tab-' + tab) || 
                                 document.getElementById(tab + '-content') ||
                                 document.querySelector(`[data-page="${tab}"]`);
            if (activeSection) {
                activeSection.style.display = 'block';
            }
            
            // Initialize the page module when tab is clicked
            if (pages[tab] && pages[tab].init) {
                try {
                    pages[tab].init();
                } catch (error) {
                    console.error(`Error initializing ${tab} page:`, error);
                }
            }
        });
    });
    
    // Initialize first tab on load
    const firstTab = 'manageCatalog';
    const firstButton = document.querySelector(`[data-tab="${firstTab}"]`);
    if (firstButton) {
        firstButton.classList.add('active');
        const firstSection = document.getElementById('tab-' + firstTab) || 
                            document.getElementById(firstTab + '-content');
        if (firstSection) {
            firstSection.style.display = 'block';
        }
    }
    
    if (pages[firstTab] && pages[firstTab].init) {
        try {
            pages[firstTab].init();
        } catch (error) {
            console.error(`Error initializing ${firstTab} page:`, error);
        }
    }
});
