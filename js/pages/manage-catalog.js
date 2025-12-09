import { db, ref, set, get, update, remove, onValue } from '../utils/firebase.js';

export const manageCatalogPage = {
    async init() {
        this.setupEventListeners();
        this.populateCatalogNames();
    },

    setupEventListeners() {
        const catalogForm = document.getElementById('catalogEntryForm');
        const catalogNameSelect = document.getElementById('CatalogName');
        const qtyReceivedInput = document.getElementById('QuantityReceived');
        const issueQtyInput = document.getElementById('IssueQuantity');
        const insertBtn = document.getElementById('Insbtn');

        // Catalog name change listener
        catalogNameSelect.addEventListener('change', async () => {
            await this.onCatalogNameChange();
        });

        // Quantity input listeners for auto-calculation
        qtyReceivedInput.addEventListener('input', () => {
            this.recalcStockQty();
        });
        issueQtyInput.addEventListener('input', () => {
            this.recalcStockQty();
        });

        // Insert button listener
        insertBtn.addEventListener('click', async () => {
            await this.handleInsert();
        });
    },

    async populateCatalogNames() {
        const catalogNameSelect = document.getElementById('CatalogName');
        const dbRef = ref(db, 'Catalogs/');
        
        await get(dbRef).then(snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const catalogNames = new Set();
                for (const key in data) {
                    if (data[key].CatalogName) {
                        catalogNames.add(data[key].CatalogName);
                    }
                }
                
                // Keep existing options and add new ones
                const existingOptions = new Set(
                    Array.from(catalogNameSelect.options).map(opt => opt.value)
                );
                
                catalogNames.forEach(name => {
                    if (!existingOptions.has(name)) {
                        const option = document.createElement('option');
                        option.value = name;
                        option.textContent = name;
                        catalogNameSelect.appendChild(option);
                    }
                });
            }
        });
    },

    async onCatalogNameChange() {
        const catName = document.getElementById('CatalogName').value;
        const dbRef = ref(db, 'Catalogs/');
        let lastEntry = null;
        
        await get(dbRef).then(snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const entries = Object.values(data).filter(e => e.CatalogName === catName);
                if (entries.length > 0) {
                    entries.sort((a, b) => 
                        new Date(a.ReceiptDate || a.DeliveryDate || '1970-01-01') - 
                        new Date(b.ReceiptDate || b.DeliveryDate || '1970-01-01')
                    );
                    lastEntry = entries[entries.length - 1];
                }
            }
        });

        const qtyReceivedInput = document.getElementById('QuantityReceived');
        const issueQtyInput = document.getElementById('IssueQuantity');
        const stockQtyInput = document.getElementById('StockQuantity');

        if (lastEntry) {
            qtyReceivedInput.value = '';
            issueQtyInput.value = '';
            stockQtyInput.value = lastEntry.StockQuantity || 0;
            stockQtyInput.readOnly = true;
        } else {
            qtyReceivedInput.value = '';
            issueQtyInput.value = '';
            stockQtyInput.value = '';
            stockQtyInput.readOnly = false;
        }
    },

    recalcStockQty() {
        const catName = document.getElementById('CatalogName').value;
        const qtyReceived = Number(document.getElementById('QuantityReceived').value) || 0;
        const issueQty = Number(document.getElementById('IssueQuantity').value) || 0;
        const stockQtyInput = document.getElementById('StockQuantity');
        const dbRef = ref(db, 'Catalogs/');

        get(dbRef).then(snapshot => {
            let lastStock = 0;
            let entries = [];
            if (snapshot.exists()) {
                const data = snapshot.val();
                entries = Object.values(data).filter(e => e.CatalogName === catName);
                if (entries.length > 0) {
                    entries.sort((a, b) => 
                        new Date(a.ReceiptDate || a.DeliveryDate || '1970-01-01') - 
                        new Date(b.ReceiptDate || b.DeliveryDate || '1970-01-01')
                    );
                    lastStock = Number(entries[entries.length - 1].StockQuantity) || 0;
                }
            }

            // If first entry, allow manual input
            if (entries.length === 0) {
                stockQtyInput.readOnly = false;
                return;
            }

            // Otherwise, auto-calculate
            stockQtyInput.value = lastStock + qtyReceived - issueQty;
            stockQtyInput.readOnly = true;
        });
    },

    async handleInsert() {
        const catName = document.getElementById('CatalogName').value;
        const receiptDate = document.getElementById('ReceiptDate').value;
        const deliveryDate = document.getElementById('DeliveryDate').value;
        const distributionDestination = document.getElementById('DistributionDestination').value;
        const requester = document.getElementById('Requester').value;

        if (!catName || !receiptDate || !deliveryDate || !distributionDestination || !requester) {
            alert("Please fill in all required fields.");
            return;
        }

        const dbRef = ref(db, 'Catalogs/');
        let lastEntry = null;
        let lastStock = 0;
        let lastQtyReceived = 0;

        await get(dbRef).then(snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const entries = Object.values(data).filter(e => e.CatalogName === catName);
                if (entries.length > 0) {
                    entries.sort((a, b) => 
                        new Date(a.ReceiptDate || a.DeliveryDate || '1970-01-01') - 
                        new Date(b.ReceiptDate || b.DeliveryDate || '1970-01-01')
                    );
                    lastEntry = entries[entries.length - 1];
                    lastStock = Number(lastEntry.StockQuantity) || 0;
                    lastQtyReceived = Number(lastEntry.QuantityReceived) || 0;
                }
            }
        });

        let qtyReceived = document.getElementById('QuantityReceived').value;
        let issueQty = document.getElementById('IssueQuantity').value;

        // If not first entry and qtyReceived is blank, use last value
        if (lastEntry && (qtyReceived === '' || qtyReceived === null)) {
            qtyReceived = lastQtyReceived;
        }

        // If not first entry and issueQty is blank, default to 0
        if (lastEntry && (issueQty === '' || issueQty === null)) {
            issueQty = 0;
        }

        // Calculate stock
        let stockQty;
        if (lastEntry) {
            stockQty = lastStock + Number(qtyReceived) - Number(issueQty);
        } else {
            stockQty = Number(qtyReceived) - Number(issueQty);
        }

        const data = {
            CatalogName: catName,
            ReceiptDate: receiptDate,
            QuantityReceived: qtyReceived,
            DeliveryDate: deliveryDate,
            IssueQuantity: issueQty,
            StockQuantity: stockQty,
            DistributionDestination: distributionDestination,
            Requester: requester,
            Remarks: document.getElementById('Remarks').value,
        };

        try {
            await set(ref(db, "Catalogs/" + catName + "_" + Date.now()), data);
            alert("Catalog entry inserted successfully");
            document.getElementById('catalogEntryForm').reset();
            // Refresh catalog entries if that page is rendered
            if (window.renderCatalogTable) {
                window.renderCatalogTable();
            }
        } catch (error) {
            alert("Failed to insert data: " + error);
        }
    }
};
