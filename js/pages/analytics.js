import { db, ref, get, onValue } from '../utils/firebase.js';
import Chart from 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';

export const analyticsPage = {
    analyticsCardsConfig: [
        { key: 'totalStock', label: '総在庫数', icon: 'fa-boxes-stacked', render: null },
        { key: 'stockByItem', label: 'カタログ別在庫', icon: 'fa-layer-group', render: null },
        { key: 'avgStock', label: '平均在庫数', icon: 'fa-chart-bar', render: null },
        { key: 'stockTrend', label: '在庫トレンド', icon: 'fa-chart-line', render: null },
        { key: 'stockMovement', label: '在庫動向(受領/発行)', icon: 'fa-arrows-left-right', render: null },
        { key: 'lowStock', label: '在庫不足アラート', icon: 'fa-triangle-exclamation', render: null },
        { key: 'stockoutRate', label: '在庫切れ率', icon: 'fa-percent', render: null },
        { key: 'totalOrders', label: '総注文数', icon: 'fa-cart-shopping', render: null },
        { key: 'totalQtyOrdered', label: '総注文数量', icon: 'fa-cubes', render: null },
        { key: 'ordersByItem', label: 'カタログ別注文', icon: 'fa-list-ol', render: null },
        { key: 'ordersByRequester', label: '依頼者別注文', icon: 'fa-user-friends', render: null },
        { key: 'avgOrderQty', label: '平均注文数量', icon: 'fa-divide', render: null },
        { key: 'topIssued', label: '発行数トップ', icon: 'fa-ranking-star', render: null },
        { key: 'topOrdered', label: '注文数トップ', icon: 'fa-ranking-star', render: null },
        { key: 'leastPopular', label: '不人気カタログ', icon: 'fa-face-frown', render: null },
        { key: 'catalogStockOrderCompare', label: 'カタログ別在庫・注文比較', icon: 'fa-chart-column', render: null },
    ],
    analyticsDefault: ['totalStock', 'stockByItem', 'avgStock', 'stockTrend', 'stockMovement', 'lowStock', 'stockoutRate', 'totalOrders', 'totalQtyOrdered', 'ordersByItem', 'ordersByRequester', 'avgOrderQty', 'topIssued', 'topOrdered', 'leastPopular'],

    async init() {
        this.setupRenderFunctions();
        this.setupEventListeners();
        this.setupDateRangeFilter();
    },

    setupRenderFunctions() {
        this.analyticsCardsConfig.forEach(card => {
            card.render = this.getRenderFunction(card.key).bind(this);
        });
    },

    setupEventListeners() {
        const customizeBtn = document.getElementById('customizeAnalyticsBtn');
        const saveBtn = document.getElementById('saveAnalyticsCustomize');

        if (customizeBtn) {
            customizeBtn.addEventListener('click', () => {
                this.showCustomizeModal();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveCustomization();
            });
        }
    },

    setupDateRangeFilter() {
        const presetSelect = document.getElementById('analyticsDatePreset');
        const dateStart = document.getElementById('analyticsDateStart');
        const dateEnd = document.getElementById('analyticsDateEnd');
        const dateDash = document.getElementById('analyticsDateDash');

        if (presetSelect) {
            presetSelect.addEventListener('change', () => {
                if (presetSelect.value === 'custom') {
                    dateStart.style.display = 'block';
                    dateEnd.style.display = 'block';
                    dateDash.style.display = 'inline';
                } else {
                    dateStart.style.display = 'none';
                    dateEnd.style.display = 'none';
                    dateDash.style.display = 'none';
                    this.fetchAndRenderAnalytics();
                }
            });
        }

        if (dateStart && dateEnd) {
            dateStart.addEventListener('change', () => {
                if (presetSelect && presetSelect.value === 'custom') {
                    this.fetchAndRenderAnalytics();
                }
            });

            dateEnd.addEventListener('change', () => {
                if (presetSelect && presetSelect.value === 'custom') {
                    this.fetchAndRenderAnalytics();
                }
            });
        }
    },

    getDateRange() {
        const presetSelect = document.getElementById('analyticsDatePreset');
        const preset = presetSelect ? presetSelect.value : '30';

        if (preset !== 'custom') {
            const days = Number(preset);
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - days + 1);
            return { start, end };
        } else {
            const dateStart = document.getElementById('analyticsDateStart');
            const dateEnd = document.getElementById('analyticsDateEnd');
            const start = dateStart ? new Date(dateStart.value) : new Date();
            const end = dateEnd ? new Date(dateEnd.value) : new Date();
            return { start, end };
        }
    },

    filterByDate(data, dateField) {
        const { start, end } = this.getDateRange();
        return Object.values(data || {}).filter(e => {
            const d = new Date(e[dateField]);
            return d >= start && d <= end;
        });
    },

    getRenderFunction(key) {
        const functions = {
            totalStock: this.renderTotalStock,
            stockByItem: this.renderStockByItem,
            avgStock: this.renderAvgStock,
            stockTrend: this.renderStockTrend,
            stockMovement: this.renderStockMovement,
            lowStock: this.renderLowStock,
            stockoutRate: this.renderStockoutRate,
            totalOrders: this.renderTotalOrders,
            totalQtyOrdered: this.renderTotalQtyOrdered,
            ordersByItem: this.renderOrdersByItem,
            ordersByRequester: this.renderOrdersByRequester,
            avgOrderQty: this.renderAvgOrderQty,
            topIssued: this.renderTopIssued,
            topOrdered: this.renderTopOrdered,
            leastPopular: this.renderLeastPopular,
            catalogStockOrderCompare: this.renderCatalogStockOrderCompare
        };
        return functions[key] || (() => {});
    },

    renderTotalStock(catalogData) {
        const arr = this.filterByDate(catalogData, 'ReceiptDate');
        let total = 0;
        for (const e of arr) total += Number(e.StockQuantity || 0);
        const elem = document.getElementById('analytics-totalStock');
        if (elem) elem.innerHTML = `<div style="font-size:2.2rem;font-weight:600;color:#232946;">${total}</div>`;
    },

    renderStockByItem(catalogData) {
        const arr = this.filterByDate(catalogData, 'ReceiptDate');
        const byItem = {};
        arr.forEach(e => { byItem[e.CatalogName] = (byItem[e.CatalogName] || 0) + Number(e.StockQuantity || 0); });
        const labels = Object.keys(byItem);
        const data = Object.values(byItem);
        const ctxId = 'analytics-stockByItem-canvas';
        let canvas = document.getElementById(ctxId);
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = ctxId;
            const container = document.getElementById('analytics-stockByItem');
            if (container) container.appendChild(canvas);
        }
        if (window.stockByItemChart) window.stockByItemChart.destroy();
        window.stockByItemChart = new Chart(canvas, {
            type: 'bar',
            data: { labels, datasets: [{ label: '在庫数量', data, backgroundColor: 'rgba(75,192,192,0.5)' }] },
            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    },

    renderAvgStock(catalogData) {
        const arr = this.filterByDate(catalogData, 'ReceiptDate');
        if (arr.length === 0) {
            const elem = document.getElementById('analytics-avgStock');
            if (elem) elem.innerHTML = '<span>--</span>';
            return;
        }
        let total = 0;
        for (const e of arr) total += Number(e.StockQuantity || 0);
        const avg = (total / arr.length).toFixed(1);
        const elem = document.getElementById('analytics-avgStock');
        if (elem) elem.innerHTML = `<div style="font-size:2.2rem;font-weight:600;color:#232946;">${avg}</div>`;
    },

    renderStockTrend(catalogData) {
        const dateMap = {};
        const today = new Date();
        for (const key in catalogData) {
            const entry = catalogData[key];
            if (!entry.ReceiptDate) continue;
            const d = new Date(entry.ReceiptDate);
            const diff = (today - d) / (1000 * 60 * 60 * 24);
            if (diff >= 0 && diff <= 30) {
                dateMap[entry.ReceiptDate] = (dateMap[entry.ReceiptDate] || 0) + Number(entry.StockQuantity || 0);
            }
        }
        const labels = Object.keys(dateMap).sort();
        const data = labels.map(l => dateMap[l]);
        const ctxId = 'analytics-stockTrend-canvas';
        let canvas = document.getElementById(ctxId);
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = ctxId;
            const container = document.getElementById('analytics-stockTrend');
            if (container) container.appendChild(canvas);
        }
        if (window.stockTrendChart) window.stockTrendChart.destroy && window.stockTrendChart.destroy();
        window.stockTrendChart = new Chart(canvas, {
            type: 'line',
            data: { labels, datasets: [{ label: '在庫数量', data, borderColor: '#232946', backgroundColor: 'rgba(75,192,192,0.2)', fill: true }] },
            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    },

    renderStockMovement(catalogData) {
        const arr = this.filterByDate(catalogData, 'ReceiptDate');
        let totalReceived = 0, totalIssued = 0;
        arr.forEach(e => {
            totalReceived += Number(e.QuantityReceived || 0);
            totalIssued += Number(e.IssueQuantity || 0);
        });
        const ctxId = 'analytics-stockMovement-canvas';
        let canvas = document.getElementById(ctxId);
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = ctxId;
            const container = document.getElementById('analytics-stockMovement');
            if (container) container.appendChild(canvas);
        }
        if (window.stockMovementChart) window.stockMovementChart.destroy();
        window.stockMovementChart = new Chart(canvas, {
            type: 'bar',
            data: { labels: ['受領', '発行'], datasets: [{ label: '数量', data: [totalReceived, totalIssued], backgroundColor: ['#4bc0c0', '#ff6384'] }] },
            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    },

    renderLowStock(catalogData) {
        const arr = this.filterByDate(catalogData, 'ReceiptDate');
        const threshold = 100;
        const low = arr.filter(e => Number(e.StockQuantity || 0) < threshold);
        let html = '<ul style="padding-left:1.2em;">';
        low.forEach(e => { html += `<li>${e.CatalogName} <span style='color:#e74c3c'>(在庫: ${e.StockQuantity})</span></li>`; });
        html += low.length === 0 ? '<li>該当なし</li>' : '';
        html += '</ul>';
        const elem = document.getElementById('analytics-lowStock');
        if (elem) elem.innerHTML = html;
    },

    renderStockoutRate(catalogData) {
        const arr = this.filterByDate(catalogData, 'ReceiptDate');
        const out = arr.filter(e => Number(e.StockQuantity || 0) === 0).length;
        const rate = arr.length ? ((out / arr.length) * 100).toFixed(1) : '--';
        const elem = document.getElementById('analytics-stockoutRate');
        if (elem) elem.innerHTML = `<div style="font-size:2.2rem;font-weight:600;color:#232946;">${rate}%</div>`;
    },

    renderTotalOrders(_, orderData) {
        const arr = this.filterByDate(orderData, 'OrderDate');
        const elem = document.getElementById('analytics-totalOrders');
        if (elem) elem.innerHTML = `<div style="font-size:2.2rem;font-weight:600;color:#232946;">${arr.length}</div>`;
    },

    renderTotalQtyOrdered(_, orderData) {
        const arr = this.filterByDate(orderData, 'OrderDate');
        let total = 0;
        for (const e of arr) total += Number(e.OrderQuantity || 0);
        const elem = document.getElementById('analytics-totalQtyOrdered');
        if (elem) elem.innerHTML = `<div style="font-size:2.2rem;font-weight:600;color:#232946;">${total}</div>`;
    },

    renderOrdersByItem(_, orderData) {
        const arr = this.filterByDate(orderData, 'OrderDate');
        const byItem = {};
        arr.forEach(e => { byItem[e.CatalogName] = (byItem[e.CatalogName] || 0) + Number(e.OrderQuantity || 0); });
        const labels = Object.keys(byItem);
        const data = Object.values(byItem);
        const ctxId = 'analytics-ordersByItem-canvas';
        let canvas = document.getElementById(ctxId);
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = ctxId;
            const container = document.getElementById('analytics-ordersByItem');
            if (container) container.appendChild(canvas);
        }
        if (window.ordersByItemChart) window.ordersByItemChart.destroy();
        window.ordersByItemChart = new Chart(canvas, {
            type: 'bar',
            data: { labels, datasets: [{ label: '注文数量', data, backgroundColor: 'rgba(153,102,255,0.5)' }] },
            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    },

    renderOrdersByRequester(_, orderData) {
        const arr = this.filterByDate(orderData, 'OrderDate');
        const byReq = {};
        arr.forEach(e => { byReq[e.Requester] = (byReq[e.Requester] || 0) + Number(e.OrderQuantity || 0); });
        const labels = Object.keys(byReq);
        const data = Object.values(byReq);
        const ctxId = 'analytics-ordersByRequester-canvas';
        let canvas = document.getElementById(ctxId);
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = ctxId;
            const container = document.getElementById('analytics-ordersByRequester');
            if (container) container.appendChild(canvas);
        }
        if (window.ordersByRequesterChart) window.ordersByRequesterChart.destroy();
        window.ordersByRequesterChart = new Chart(canvas, {
            type: 'bar',
            data: { labels, datasets: [{ label: '注文数量', data, backgroundColor: 'rgba(255,205,86,0.5)' }] },
            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    },

    renderAvgOrderQty(_, orderData) {
        const arr = this.filterByDate(orderData, 'OrderDate');
        if (arr.length === 0) {
            const elem = document.getElementById('analytics-avgOrderQty');
            if (elem) elem.innerHTML = '<span>--</span>';
            return;
        }
        let total = 0;
        for (const e of arr) total += Number(e.OrderQuantity || 0);
        const avg = (total / arr.length).toFixed(1);
        const elem = document.getElementById('analytics-avgOrderQty');
        if (elem) elem.innerHTML = `<div style="font-size:2.2rem;font-weight:600;color:#232946;">${avg}</div>`;
    },

    renderTopIssued(_, orderData) {
        const arr = this.filterByDate(orderData, 'OrderDate');
        const byItem = {};
        arr.forEach(e => { byItem[e.CatalogName] = (byItem[e.CatalogName] || 0) + Number(e.IssueQuantity || 0); });
        const sorted = Object.entries(byItem).sort((a, b) => b[1] - a[1]).slice(0, 5);
        let html = '<ol style="padding-left:1.2em;">';
        sorted.forEach(([name, count]) => { html += `<li>${name} <span style='color:#888;font-size:1rem;'>(発行数: ${count})</span></li>`; });
        html += '</ol>';
        const elem = document.getElementById('analytics-topIssued');
        if (elem) elem.innerHTML = html;
    },

    renderTopOrdered(_, orderData) {
        const arr = this.filterByDate(orderData, 'OrderDate');
        const byItem = {};
        arr.forEach(e => { byItem[e.CatalogName] = (byItem[e.CatalogName] || 0) + 1; });
        const sorted = Object.entries(byItem).sort((a, b) => b[1] - a[1]).slice(0, 5);
        let html = '<ol style="padding-left:1.2em;">';
        sorted.forEach(([name, count]) => { html += `<li>${name} <span style='color:#888;font-size:1rem;'>(注文数: ${count})</span></li>`; });
        html += '</ol>';
        const elem = document.getElementById('analytics-topOrdered');
        if (elem) elem.innerHTML = html;
    },

    renderLeastPopular(_, orderData) {
        const arr = this.filterByDate(orderData, 'OrderDate');
        const byItem = {};
        arr.forEach(e => { byItem[e.CatalogName] = (byItem[e.CatalogName] || 0) + 1; });
        const sorted = Object.entries(byItem).sort((a, b) => a[1] - b[1]).slice(0, 5);
        let html = '<ol style="padding-left:1.2em;">';
        sorted.forEach(([name, count]) => { html += `<li>${name} <span style='color:#888;font-size:1rem;'>(注文数: ${count})</span></li>`; });
        html += '</ol>';
        const elem = document.getElementById('analytics-leastPopular');
        if (elem) elem.innerHTML = html;
    },

    renderCatalogStockOrderCompare(catalogData, orderData) {
        const allCatalogs = Array.from(new Set([
            ...Object.values(catalogData || {}).map(e => e.CatalogName),
            ...Object.values(orderData || {}).map(e => e.CatalogName)
        ])).filter(Boolean);

        const container = document.getElementById('analytics-catalogStockOrderCompare');
        if (!container) return;

        container.innerHTML = `<div style='margin-bottom:12px;'>
            <label style='font-weight:500;'>カタログ選択:</label>
            <select id='compareCatalogSelect' multiple style='min-width:180px;max-width:100%;padding:4px 8px;border-radius:8px;'>
                ${allCatalogs.map(cat => `<option value='${cat}'>${cat}</option>`).join('')}
            </select>
        </div>
        <canvas id='catalogStockOrderCompareChart' height='120'></canvas>`;

        const select = container.querySelector('#compareCatalogSelect');
        if (select) {
            for (let i = 0; i < select.options.length; ++i) select.options[i].selected = true;

            const updateChart = () => {
                const selected = Array.from(select.selectedOptions).map(o => o.value);
                const stockByCat = {};
                Object.values(catalogData || {}).forEach(e => {
                    if (selected.includes(e.CatalogName)) {
                        stockByCat[e.CatalogName] = Number(e.StockQuantity || 0);
                    }
                });
                const orderByCat = {};
                Object.values(orderData || {}).forEach(e => {
                    if (selected.includes(e.CatalogName)) {
                        orderByCat[e.CatalogName] = (orderByCat[e.CatalogName] || 0) + Number(e.OrderQuantity || 0);
                    }
                });
                const labels = selected;
                const stockData = labels.map(cat => stockByCat[cat] || 0);
                const orderDataArr = labels.map(cat => orderByCat[cat] || 0);

                const ctx = document.getElementById('catalogStockOrderCompareChart').getContext('2d');
                if (window.catalogStockOrderCompareChartObj) window.catalogStockOrderCompareChartObj.destroy();
                window.catalogStockOrderCompareChartObj = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [
                            { label: '在庫数量', data: stockData, backgroundColor: 'rgba(75,192,192,0.7)' },
                            { label: '注文数量', data: orderDataArr, backgroundColor: 'rgba(255,99,132,0.7)' }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { position: 'top' } },
                        scales: { y: { beginAtZero: true } }
                    }
                });
            };

            select.addEventListener('change', updateChart);
            updateChart();
        }
    },

    getAnalyticsSelection() {
        return JSON.parse(localStorage.getItem('analyticsSelection') || JSON.stringify(this.analyticsDefault));
    },

    setAnalyticsSelection(selection) {
        localStorage.setItem('analyticsSelection', JSON.stringify(selection));
    },

    showCustomizeModal() {
        const form = document.getElementById('analyticsCustomizeForm');
        if (!form) return;

        form.innerHTML = this.analyticsCardsConfig.map(card => `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${card.key}" id="chk${card.key}">
                <label class="form-check-label" for="chk${card.key}">${card.label}</label>
            </div>
        `).join('');

        const selection = this.getAnalyticsSelection();
        form.querySelectorAll('input[type=checkbox]').forEach(checkbox => {
            checkbox.checked = selection.includes(checkbox.value);
        });

        const modal = document.getElementById('analyticsCustomizeModal');
        if (modal && window.$) {
            window.$(modal).modal('show');
        }
    },

    saveCustomization() {
        const form = document.getElementById('analyticsCustomizeForm');
        if (!form) return;

        const selected = [];
        form.querySelectorAll('input[type=checkbox]:checked').forEach(checkbox => {
            selected.push(checkbox.value);
        });

        if (selected.length === 0) {
            alert('少なくとも1つのカードを選択してください。');
            return;
        }

        this.setAnalyticsSelection(selected);

        const modal = document.getElementById('analyticsCustomizeModal');
        if (modal && window.$) {
            window.$(modal).modal('hide');
        }

        this.fetchAndRenderAnalytics();
    },

    renderAnalyticsDashboard(catalogData, orderData) {
        const selection = this.getAnalyticsSelection();
        const container = document.getElementById('analyticsCards');
        if (!container) return;

        container.innerHTML = '';

        this.analyticsCardsConfig.forEach(card => {
            if (selection.includes(card.key)) {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'glass-card';
                cardDiv.style.flex = '1 1 350px';
                cardDiv.innerHTML = `<h2><i class="fa-solid ${card.icon}"></i> ${card.label}</h2><div id="analytics-${card.key}"></div>`;
                container.appendChild(cardDiv);
                if (card.render) {
                    card.render(catalogData, orderData);
                }
            }
        });
    },

    async fetchAndRenderAnalytics() {
        const catalogRef = ref(db, 'Catalogs/');
        const orderRef = ref(db, 'Orders/');

        try {
            const cSnap = await get(catalogRef);
            const catalogData = cSnap.exists() ? cSnap.val() : {};

            const oSnap = await get(orderRef);
            let orderData = oSnap.exists() ? oSnap.val() : {};

            // Add OrderDate to orderData for filtering
            for (const key in orderData) {
                if (!orderData[key].OrderDate) {
                    const ts = key.split('_').pop();
                    if (!isNaN(Number(ts))) {
                        orderData[key].OrderDate = new Date(Number(ts)).toISOString().slice(0, 10);
                    } else {
                        orderData[key].OrderDate = '';
                    }
                }
            }

            this.renderAnalyticsDashboard(catalogData, orderData);
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        }
    }
};
