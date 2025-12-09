# Yuken Catalog Manager

A modern, modular web application for managing catalogs and orders with real-time Firebase integration. This is the refactored modular architecture version with separated concerns and maintainable code structure.

## 📋 Project Overview

The Yuken Catalog Manager is a comprehensive dashboard application that helps manage:
- **Catalog Management**: Add, edit, and track catalog entries with automatic stock calculations
- **Order Management**: Place orders with rich text support
- **Data Visualization**: Real-time charts and calendar views
- **Advanced Analytics**: 16+ analytics cards with customizable dashboard
- **Real-time Synchronization**: Firebase Realtime Database integration

## 🏗️ Architecture

This project has been refactored from a monolithic 1771-line HTML file into a modular, maintainable structure:

```
Yuken Catalog Manager/
├── index.html                 # Main HTML entry point (simplified)
├── css/
│   └── styles.css            # Centralized styling
├── js/
│   ├── main.js               # Application entry point & tab orchestration
│   ├── utils/
│   │   └── firebase.js       # Firebase initialization & database methods
│   └── pages/
│       ├── manage-catalog.js    # Catalog management page
│       ├── place-order.js       # Order placement page
│       ├── catalog-entries.js   # Catalog display with inline editing
│       ├── order-entries.js     # Order display with inline editing
│       ├── reports.js           # Stock chart visualization
│       ├── stock-calendar.js    # Calendar with event management
│       └── analytics.js         # Advanced analytics dashboard
├── .gitignore
├── README.md (this file)
└── MODULARIZATION_GUIDE.md
```

## 🔑 Key Features

### 1. **Catalog Management**
- Add new catalog entries with automatic stock calculation
- Auto-populate previous quantities when selecting existing catalogs
- Form validation and error handling

### 2. **Order Placement**
- Rich text editor for order messages (bold, italic, color, font size)
- Quick order submission
- Message formatting support

### 3. **Data Visualization**
- **Reports Tab**: Bar charts showing stock quantities and received quantities
- **Calendar Tab**: FullCalendar integration with event details modal
- **Analytics Tab**: 16+ customizable cards including:
  - Total stock and average stock
  - Stock trends over time
  - Stock movement (received vs issued)
  - Low stock alerts
  - Order analytics by item and requester
  - Top issued/ordered catalogs
  - Catalog comparison charts

### 4. **Real-time Data Management**
- Inline editing of table cells
- Automatic sync with Firebase
- Delete functionality for entries
- Sample data generation for testing
- Sticky table headers for better UX

### 5. **Advanced Analytics**
- Date range filtering (7/30/90 days or custom)
- Customizable dashboard with localStorage persistence
- Multiple chart types (bar, line, etc.)
- Dynamic card selection and display

## 🛠️ Technologies Used

**Frontend:**
- HTML5 & CSS3 (Glass morphism design)
- JavaScript ES6+ (Modules)
- jQuery for DOM manipulation
- Bootstrap 4.5.2 for responsive layout
- Font Awesome 6.4.2 for icons

**Data Visualization:**
- Chart.js for dynamic charts
- FullCalendar 5.11.0 for calendar management

**Backend & Database:**
- Firebase Realtime Database for data storage
- Real-time synchronization and updates

## 📦 Installation & Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No build process required - uses ES6 modules natively

### Steps
1. Clone this repository:
   ```bash
   git clone <repository-url>
   ```

2. Open `index.html` in a web browser

3. The application will automatically initialize and connect to Firebase

## 🚀 Usage

### Managing Catalogs
1. Click **カタログ管理** in the sidebar
2. Select a catalog name from the dropdown
3. Fill in receipt date, quantities, and delivery date
4. Stock quantity is calculated automatically
5. Click **INSERT** to save

### Placing Orders
1. Click **注文する** in the sidebar
2. Select a catalog and enter order quantity
3. Format message using the toolbar (bold, italic, color, size, indent)
4. Click **注文する** to submit

### Viewing Catalogs & Orders
1. Click **カタログエントリ** or **注文エントリ** tabs
2. Expand sections by clicking on catalog names
3. Click on table cells to edit inline
4. Changes sync automatically to Firebase

### Analytics Dashboard
1. Click **アナリティクス** tab
2. Use the date range selector (7/30/90 days or custom)
3. Click **カスタマイズ** to show/hide specific cards
4. Selection is saved in browser localStorage

## 🔧 Module Structure

### **main.js**
- Application initialization and DOM ready handling
- Tab switching orchestration
- Page module lifecycle management

### **firebase.js**
- Firebase configuration
- Database reference exports
- Centralized Firebase method imports

### **Page Modules**
Each page module follows a consistent pattern:
```javascript
export const pageName = {
    async init() {
        // Initialize page when tab is selected
    },
    // Additional methods...
};
```

## 📊 Database Schema

### Catalogs Collection
```
Catalogs/{CatalogName}_{timestamp}/
├── CatalogName: string
├── ReceiptDate: date
├── QuantityReceived: number
├── DeliveryDate: date
├── IssueQuantity: number
├── StockQuantity: number
├── DistributionDestination: string
├── Requester: string
└── Remarks: string
```

### Orders Collection
```
Orders/{CatalogName}_{timestamp}/
├── CatalogName: string
├── OrderQuantity: number
├── Requester: string
├── Message: string (HTML)
└── OrderDate: date
```

## 🎨 Styling

The application uses a modern **glass morphism** design with:
- Gradient backgrounds
- Semi-transparent cards with backdrop blur effects
- Responsive layout that works on mobile and desktop
- Custom color scheme with primary color #232946

See `css/styles.css` for detailed styling.

## 📝 Development Notes

### Adding New Features
1. Create a new module in `js/pages/`
2. Export an object with an `init()` method
3. Add navigation button to sidebar in `index.html`
4. Import and add to pages object in `main.js`

### Modifying Styles
- All styles are in `css/styles.css`
- Use CSS custom properties for consistent theming
- Maintain responsive design with media queries

### Firebase Integration
- All Firebase operations go through `firebase.js`
- Import methods as needed in page modules
- Follow the same patterns for consistency

## 🔄 Refactoring History

**Original State**: Monolithic 1771-line HTML file with embedded CSS and JavaScript

**Refactored State**: Modular architecture with:
- Separated concerns (HTML, CSS, JS)
- Individual page modules
- Centralized utilities
- Improved maintainability

**No Functionality Changes**: All features preserved exactly as original

## 📄 License

[Add appropriate license information]

## 👥 Contributors

- Development Team: Yuken

## 📞 Support

For issues or questions, please refer to the project documentation or contact the development team.

---

**Last Updated**: December 9, 2025
**Version**: 1.0.0 (Modular Architecture)
**Repository**: Yuken Catalog Manager
