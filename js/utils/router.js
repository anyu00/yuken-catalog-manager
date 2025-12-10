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
        if (this.currentPage === tabName) {
            console.log('⏭️ Already on tab:', tabName);
            return;
        }

        const path = this.getPathFromTab(tabName); 
        console.log('🔗 Navigating to path:', path, '(tab:', tabName + ')');
        window.history.pushState({ tab: tabName }, '', path);

        await this.showTab(tabName);
    }

    // Show a tab and initialize its page module
    async showTab(tabName) {
        console.log('👀 Showing tab:', tabName);
        
        // Hide all tabs
        const tabSections = document.querySelectorAll('.tab-section');
        console.log('   Hiding', tabSections.length, 'tab sections');
        tabSections.forEach(tab => {
            tab.style.display = 'none';
        });

        // Update active sidebar button
        const sidebarBtns = document.querySelectorAll('.sidebar-nav-btn');
        sidebarBtns.forEach(btn => btn.classList.remove('active'));

        const activeBtn = document.querySelector(`.sidebar-nav-btn[data-tab="${tabName}"]`);
        if (activeBtn) {
            console.log('   Highlighting button for tab:', tabName);
            activeBtn.classList.add('active');
        } else {
            console.warn('   ⚠️ No button found for tab:', tabName);
        }

        // Show selected tab
        const tabEl = document.getElementById(`tab-${tabName}`);
        if (tabEl) {
            console.log('   Showing tab element: #tab-' + tabName);
            tabEl.style.display = '';
        } else {
            console.warn('   ⚠️ No tab element found: #tab-' + tabName);
        } 

        // Initialize page module
        if (this.pages[tabName] && this.pages[tabName].init) {
            try {
                console.log('   🚀 Initializing page module:', tabName);
                await this.pages[tabName].init();
                this.currentPage = tabName;
                this.notifyListeners(tabName);
                console.log('   ✅ Tab ready:', tabName);
            } catch (error) {
                console.error(`❌ Error initializing ${tabName} page:`, error);
            }
        } else {
            console.warn('   ⚠️ No init function for tab:', tabName);
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
        console.log('🔧 Router initialized');
        console.log('📍 Current path:', window.location.pathname);
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', async (event) => {
            const tabName = event.state?.tab || this.getTabFromPath(window.location.pathname);
            console.log('⬅️ Popstate - navigating to:', tabName);
            await this.showTab(tabName);
        });

        // Handle sidebar navigation
        const buttons = document.querySelectorAll('.sidebar-nav-btn');
        console.log('🔘 Found', buttons.length, 'sidebar buttons');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const tabName = btn.dataset.tab;
                console.log('👆 Clicked button for tab:', tabName);
                if (tabName) {
                    await this.navigateTo(tabName);
                }
            });
        });

        // Load initial page from URL
        const initialTab = this.getTabFromPath(window.location.pathname);
        console.log('📄 Loading initial tab:', initialTab);
        this.showTab(initialTab);
    }

    // Get display name for a tab
    getDisplayName(tabName) {
        return routeDisplayNames[tabName] || tabName;
    }
}

export default Router;
