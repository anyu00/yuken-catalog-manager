import { db, ref, get, update, remove, onValue } from '../utils/firebase.js';

export const catalogEntriesPage = {
    async init() {
        this.setupEventListeners();
        await this.renderCatalogTablesAccordion();
    },

    setupEventListeners() {
        const deleteAllBtn = document.getElementById('deleteAllCatalogBtn');
        const generateSampleBtn = document.getElementById('generateSampleCatalogBtn');

        if (deleteAllBtn) {
            deleteAllBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete ALL catalog data?')) {
                    this.deleteAllCatalogData();
                }
            });
        }

        if (generateSampleBtn) {
            generateSampleBtn.addEventListener('click', () => {
                this.generateSampleCatalogData();
            });
        }

        // Setup inline editing event listeners
        this.setupInlineEditingListeners();
    },

    setupInlineEditingListeners() {
        // Delegate click events for editable cells
        const container = document.getElementById('catalogEntriesAccordion');
        if (container) {
            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('editable')) {
                    this.makeEditable(e.target);
                }
            });

            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-row')) {
                    const tr = e.target.closest('tr');
                    const key = tr.dataset.key;
                    if (confirm('Are you sure you want to delete this entry?')) {
                        remove(ref(db, 'Catalogs/' + key));
                    }
                }
            });
        }
    },

    makeEditable(cell) {
        if (cell.querySelector('input')) return;

        const oldValue = cell.textContent;
        const field = cell.dataset.field;
        const tr = cell.closest('tr');
        const key = tr.dataset.key;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control form-control-sm';
        input.style.minWidth = '80px';
        input.style.maxWidth = '160px';
        input.value = oldValue;

        cell.textContent = '';
        cell.appendChild(input);
        input.focus();

        const saveEdit = () => {
            const newValue = input.value;
            if (newValue !== oldValue) {
                const updateObj = {};
                updateObj[field] = newValue;
                update(ref(db, 'Catalogs/' + key), updateObj).then(() => {
                    cell.textContent = newValue;
                    cell.classList.add('cell-updated');
                    setTimeout(() => cell.classList.remove('cell-updated'), 800);
                });
            } else {
                cell.textContent = oldValue;
            }
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                cell.textContent = oldValue;
            }
        });

        input.addEventListener('blur', saveEdit);
    },

    async renderCatalogTablesAccordion() {
        const container = document.getElementById('catalogEntriesAccordion');
        container.innerHTML = '';

        const dbRef = ref(db, 'Catalogs/');
        onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const catalogs = {};

                for (const key in data) {
                    const catName = data[key].CatalogName;
                    if (!catalogs[catName]) catalogs[catName] = [];
                    catalogs[catName].push({ ...data[key], _key: key });
                }

                container.innerHTML = '';

                Object.keys(catalogs).forEach((catName, idx) => {
                    // Sort entries by date
                    const sortedEntries = catalogs[catName].slice().sort((a, b) => {
                        const da = new Date(a.ReceiptDate || a.DeliveryDate || '1970-01-01');
                        const db = new Date(b.ReceiptDate || b.DeliveryDate || '1970-01-01');
                        return da - db;
                    });

                    // Excel-like cumulative stock calculation
                    let prevStock = null;
                    let totalReceived = 0, totalIssued = 0;

                    const rowsHtml = sortedEntries.map((entry, i) => {
                        const qtyReceived = Number(entry.QuantityReceived || 0);
                        const qtyIssued = Number(entry.IssueQuantity || 0);

                        let stock;
                        if (i === 0) {
                            stock = qtyReceived - qtyIssued;
                        } else {
                            stock = prevStock + qtyReceived - qtyIssued;
                        }
                        prevStock = stock;
                        totalReceived += qtyReceived;
                        totalIssued += qtyIssued;

                        return `
                            <tr data-key="${entry._key}" class="catalog-table-row">
                                <td class="editable cell-catalog" data-field="CatalogName">${entry.CatalogName}</td>
                                <td class="editable cell-date" data-field="ReceiptDate">${entry.ReceiptDate}</td>
                                <td class="editable cell-number" data-field="QuantityReceived">${entry.QuantityReceived}</td>
                                <td class="editable cell-date" data-field="DeliveryDate">${entry.DeliveryDate}</td>
                                <td class="editable cell-number" data-field="IssueQuantity">${entry.IssueQuantity}</td>
                                <td class="cell-stock"><span class="calculated-stock badge badge-info" style="font-size:1rem;padding:6px 10px;">${stock}</span></td>
                                <td class="editable cell-destination" data-field="DistributionDestination">${entry.DistributionDestination}</td>
                                <td class="editable" data-field="Requester">${entry.Requester}</td>
                                <td class="editable" data-field="Remarks">${entry.Remarks}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm delete-row">Delete</button>
                                </td>
                            </tr>
                        `;
                    }).join('');

                    const stock = prevStock !== null ? prevStock : 0;
                    const section = document.createElement('div');
                    section.className = 'catalog-accordion-section';
                    section.innerHTML = `
                        <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#catTable${idx}" 
                                aria-expanded="false" aria-controls="catTable${idx}" 
                                style="font-size:1.1rem;font-weight:600;color:#232946;margin-bottom:8px;">
                            <i class='fa-solid fa-box'></i> ${catName}
                        </button>
                        <div class="collapse" id="catTable${idx}">
                            <div style="overflow-x:auto;">
                                <table class="glass-table excel-table" data-catalog="${catName}">
                                    <thead>
                                        <tr>
                                            <th>カタログ名</th>
                                            <th>受領日</th>
                                            <th>受領数量</th>
                                            <th>納品日</th>
                                            <th>発行数量</th>
                                            <th>在庫数量</th>
                                            <th>配布先</th>
                                            <th>依頼者</th>
                                            <th>備考</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${rowsHtml}
                                        <tr style="background:#f7faff;font-weight:600;">
                                            <td colspan="2" style="text-align:right;">合計:</td>
                                            <td>${totalReceived}</td>
                                            <td></td>
                                            <td>${totalIssued}</td>
                                            <td>${stock}</td>
                                            <td colspan="4"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `;
                    container.appendChild(section);
                });

                // Re-setup inline editing listeners after rendering
                this.setupInlineEditingListeners();
            } else {
                container.innerHTML = '<div class="text-center">No Data Found</div>';
            }
        });
    },

    async deleteAllCatalogData() {
        try {
            const dbRef = ref(db, 'Catalogs/');
            const snapshot = await get(dbRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                for (const key in data) {
                    await remove(ref(db, 'Catalogs/' + key));
                }
                alert('All catalog data deleted successfully');
            }
        } catch (error) {
            alert('Failed to delete data: ' + error);
        }
    },

    async generateSampleCatalogData() {
        const sampleData = [
            {
                CatalogName: "A3HGシリーズ高圧可変ピストンポンプ",
                ReceiptDate: "2024-12-01",
                QuantityReceived: 50,
                DeliveryDate: "2024-12-05",
                IssueQuantity: 10,
                StockQuantity: 40,
                DistributionDestination: "東京支社",
                Requester: "田中太郎",
                Remarks: "新規在庫"
            },
            {
                CatalogName: "比例電磁式方向・流量制御弁　EDFHG-04/06",
                ReceiptDate: "2024-12-02",
                QuantityReceived: 30,
                DeliveryDate: "2024-12-06",
                IssueQuantity: 5,
                StockQuantity: 25,
                DistributionDestination: "大阪支社",
                Requester: "山田花子",
                Remarks: "補充在庫"
            }
        ];

        try {
            for (const data of sampleData) {
                await set(
                    ref(db, "Catalogs/" + data.CatalogName + "_" + Date.now()),
                    data
                );
                // Add small delay to avoid same timestamp
                await new Promise(r => setTimeout(r, 100));
            }
            alert('Sample catalog data generated successfully');
        } catch (error) {
            alert('Failed to generate sample data: ' + error);
        }
    }
};

// Import set function for sample data
import { set } from '../utils/firebase.js';
