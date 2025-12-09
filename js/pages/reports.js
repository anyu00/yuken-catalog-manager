import { db, ref, onValue } from '../utils/firebase.js';

export const reportsPage = {
    chart: null,

    async init() {
        this.renderStockChart();
    },

    renderStockChart() {
        const catalogTableBody = document.querySelector('#tab-reports tbody');
        const stockChartCtx = document.getElementById('stockChart');

        if (!stockChartCtx) {
            console.error('stockChart canvas not found');
            return;
        }

        const dbRef = ref(db, "Catalogs/");
        onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                this.updateCharts(data);
            }
        });
    },

    updateCharts(data) {
        const catalogNames = [];
        const stockQuantities = [];
        const quantitiesReceived = [];

        for (const key in data) {
            catalogNames.push(data[key].CatalogName);
            stockQuantities.push(data[key].StockQuantity);
            quantitiesReceived.push(data[key].QuantityReceived);
        }

        const stockChartCtx = document.getElementById('stockChart');
        
        if (!stockChartCtx) {
            console.error('stockChart canvas not found');
            return;
        }

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(stockChartCtx, {
            type: 'bar',
            data: {
                labels: catalogNames,
                datasets: [
                    {
                        label: '在庫数量',
                        data: stockQuantities,
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    },
                    {
                        label: '受領数量',
                        data: quantitiesReceived,
                        backgroundColor: 'rgba(153, 102, 255, 0.5)',
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
};
