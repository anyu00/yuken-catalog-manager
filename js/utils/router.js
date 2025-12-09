// Simple client-side router for single-page application
// Maps URLs to tab names and initializes appropriate page modules

const routeMap = {
    '/': 'manageCatalog',
    '/catalog': 'manageCatalog',
    '/manage': 'manageCatalog',
    '/order': 'placeOrder',
    '/place-order': 'placeOrder',
    '/catalog-entries': 'catalogEntries',
    '/catalogs': 'catalogEntries',
    '/order-entries': 'orderEntries',
    '/orders': 'orderEntries',
    '/reports': 'reports',
    '/analytics': 'analytics',
    '/calendar': 'stockCalendar',
    '/stock-calendar': 'stockCalendar',
};

const routeDisplayNames = {
    'manageCatalog': 'カタログ管理',
    'placeOrder': '注文する',
    'catalogEntries': 'カタログエントリ',
    'orderEntries': '注文エントリ',
    'reports': 'レポート',
    'stockCalendar': 'カレンダー',
    'analytics': 'アナリティクス',
};

export class Router {
    constructor(pages) {
        this.pages = pages;
        this.currentPage = null;
        this.listeners = [];
    }

    // Get tab name from URL path
    getTabFromPath(path) {
        // Remove leading/trailing slashes and query params
        const cleanPath = '/' + path.replace(/^\/|\/$/g, '').split('?')[0].toLowerCase();
        return routeMap[cleanPath] || routeMap['/'];
    }

    // Generate URL path from tab name
    getPathFromTab(tabName) {
        // Find the first route that maps to this tab
        for (const [path, tab] of Object.entries(routeMap)) {
            if (tab === tabName) {
                return path === '/' ? '/' : path;
            }
        }
        return '/';
    }

    // Navigate to a specific tab/page
    async navigateTo(tabName) {
        if (this.currentPage === tabName) return;

        const path = this.getPathFromTab(tabName);
        window.history.pushState({ tab: tabName }, '', path);

        await this.showTab(tabName);
    }

    // Show a tab and initialize its page module
    async showTab(tabName) {
        // Hide all tabs
        const tabSections = document.querySelectorAll('.tab-section');
        tabSections.forEach(tab => {
            tab.style.display = 'none';
        });

        // Update active sidebar button
        const sidebarBtns = document.querySelectorAll('.sidebar-nav-btn');
        sidebarBtns.forEach(btn => btn.classList.remove('active'));

        const activeBtn = document.querySelector(`.sidebar-nav-btn[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Show selected tab
        const tabEl = document.getElementById(`tab-${tabName}`);
        if (tabEl) {
            tabEl.style.display = '';
        }

        // Initialize page module
        if (this.pages[tabName] && this.pages[tabName].init) {
            try {
                await this.pages[tabName].init();
                this.currentPage = tabName;
                this.notifyListeners(tabName);
            } catch (error) {
                console.error(`Error initializing ${tabName} page:`, error);
            }
        }
    }

    // Listen for route changes
    onChange(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(tabName) {
        this.listeners.forEach(callback => callback(tabName));
    }

    // Initialize router and handle browser back/forward
    init() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', async (event) => {
            const tabName = event.state?.tab || this.getTabFromPath(window.location.pathname);
            await this.showTab(tabName);
        });

        // Handle sidebar navigation
        document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const tabName = btn.dataset.tab;
                if (tabName) {
                    await this.navigateTo(tabName);
                }
            });
        });

        // Load initial page from URL
        const initialTab = this.getTabFromPath(window.location.pathname);
        this.showTab(initialTab);
    }

    // Get display name for a tab
    getDisplayName(tabName) {
        return routeDisplayNames[tabName] || tabName;
    }
}

export default Router;
