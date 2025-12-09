import { db, ref, set, get, update, remove, onValue } from '../utils/firebase.js';

export const orderEntriesPage = {
    async init() {
        this.setupEventListeners();
        await this.renderOrderTablesAccordion();
    },

    setupEventListeners() {
        const deleteAllBtn = document.getElementById('deleteAllOrderBtn');
        const generateSampleBtn = document.getElementById('generateSampleOrderBtn');

        if (deleteAllBtn) {
            deleteAllBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete ALL order data?')) {
                    this.deleteAllOrderData();
                }
            });
        }

        if (generateSampleBtn) {
            generateSampleBtn.addEventListener('click', () => {
                this.generateSampleOrderData();
            });
        }

        // Setup inline editing event listeners
        this.setupInlineEditingListeners();
    },

    setupInlineEditingListeners() {
        // Delegate click events for editable cells
        const container = document.getElementById('orderEntriesAccordion');
        if (container) {
            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('editable-order')) {
                    this.makeEditable(e.target);
                }
            });

            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-order-row')) {
                    const tr = e.target.closest('tr');
                    const key = tr.dataset.key;
                    if (confirm('Are you sure you want to delete this order?')) {
                        remove(ref(db, 'Orders/' + key));
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
                update(ref(db, 'Orders/' + key), updateObj).then(() => {
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

    async renderOrderTablesAccordion() {
        const container = document.getElementById('orderEntriesAccordion');
        container.innerHTML = '';

        const orderRef = ref(db, 'Orders/');
        onValue(orderRef, (snapshot) => {
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
                    const section = document.createElement('div');
                    section.className = 'order-accordion-section';
                    section.innerHTML = `
                        <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#orderTable${idx}" 
                                aria-expanded="false" aria-controls="orderTable${idx}" 
                                style="font-size:1.1rem;font-weight:600;color:#232946;margin-bottom:8px;">
                            <i class='fa-solid fa-box'></i> ${catName}
                        </button>
                        <div class="collapse" id="orderTable${idx}">
                            <div style="overflow-x:auto;">
                                <table class="glass-table excel-order-table" data-catalog="${catName}">
                                    <thead>
                                        <tr>
                                            <th>カタログ名</th>
                                            <th>注文数量</th>
                                            <th>依頼者</th>
                                            <th>メッセージ</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${catalogs[catName].map(entry => `
                                            <tr data-key="${entry._key}">
                                                <td class="editable-order" data-field="CatalogName">${entry.CatalogName}</td>
                                                <td class="editable-order" data-field="OrderQuantity">${entry.OrderQuantity}</td>
                                                <td class="editable-order" data-field="Requester">${entry.Requester}</td>
                                                <td>${entry.Message ? `<div style='max-width:320px;overflow-x:auto;'>${entry.Message}</div>` : ''}</td>
                                                <td>
                                                    <button class="btn btn-danger btn-sm delete-order-row">Delete</button>
                                                </td>
                                            </tr>
                                        `).join('')}
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
                container.innerHTML = '<div class="text-center">No Orders Found</div>';
            }
        });
    },

    async deleteAllOrderData() {
        try {
            const dbRef = ref(db, 'Orders/');
            const snapshot = await get(dbRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                for (const key in data) {
                    await remove(ref(db, 'Orders/' + key));
                }
                alert('All order data deleted successfully');
            }
        } catch (error) {
            alert('Failed to delete data: ' + error);
        }
    },

    async generateSampleOrderData() {
        const sampleData = [
            {
                CatalogName: "A3HGシリーズ高圧可変ピストンポンプ",
                OrderQuantity: 5,
                Requester: "鈴木一郎",
                Message: "<b>急ぎです</b>",
                OrderDate: new Date().toISOString().split('T')[0]
            },
            {
                CatalogName: "比例電磁式方向・流量制御弁　EDFHG-04/06",
                OrderQuantity: 3,
                Requester: "佐藤次郎",
                Message: "標準納期で結構です",
                OrderDate: new Date().toISOString().split('T')[0]
            }
        ];

        try {
            for (const data of sampleData) {
                await set(
                    ref(db, "Orders/" + data.CatalogName + "_" + Date.now()),
                    data
                );
                // Add small delay to avoid same timestamp
                await new Promise(r => setTimeout(r, 100));
            }
            alert('Sample order data generated successfully');
        } catch (error) {
            alert('Failed to generate sample data: ' + error);
        }
    }
};
