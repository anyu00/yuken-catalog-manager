import { db, ref, set } from '../utils/firebase.js';

export const placeOrderPage = {
    async init() {
        this.setupEventListeners();
        this.setupRichTextToolbar();
    },

    setupEventListeners() {
        const orderBtn = document.getElementById('OrderBtn');
        orderBtn.addEventListener('click', async () => {
            await this.handlePlaceOrder();
        });
    },

    setupRichTextToolbar() {
        // Make global functions for rich text formatting
        window.formatOrderMsg = (command) => {
            document.execCommand(command, false, null);
        };

        window.formatOrderMsgColor = () => {
            const color = prompt("Enter color (e.g., #e74c3c or red):", "#232946");
            if (color) {
                document.execCommand('foreColor', false, color);
            }
        };

        window.formatOrderMsgFontSize = () => {
            const size = prompt("Enter font size (1-7):", "3");
            if (size && size >= 1 && size <= 7) {
                document.execCommand('fontSize', false, size);
            }
        };
    },

    async handlePlaceOrder() {
        const catalogName = document.getElementById('OrderCatalogName').value;
        const orderQuantity = document.getElementById('OrderQuantity').value;
        const requester = document.getElementById('OrderRequester').value;
        const message = document.getElementById('OrderMessage').innerHTML;

        if (!catalogName || !orderQuantity || !requester) {
            alert("Please fill in all required fields.");
            return;
        }

        const orderData = {
            CatalogName: catalogName,
            OrderQuantity: orderQuantity,
            Requester: requester,
            Message: message,
            OrderDate: new Date().toISOString().split('T')[0] // Add order date for filtering
        };

        try {
            await set(ref(db, "Orders/" + catalogName + "_" + Date.now()), orderData);
            alert("Order placed successfully!");
            document.getElementById('orderForm').reset();
            document.getElementById('OrderMessage').innerHTML = '';
        } catch (error) {
            alert("Failed to place order: " + error);
        }
    }
};
