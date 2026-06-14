const CURRENT_DATE = new Date("2026-06-14");

// Using the provided order database
const orderData = {
  "orders": {
    "ORD-1001": {
      "customer_id": "CUST-SAM-001",
      "customer_name": "Sam",
      "product_id": "shoe_123",
      "product_name": "Amazon Essentials Women's Running Shoes",
      "category": "apparel",
      "retail_price_inr": 500,
      "purchase_date": "2026-06-05",
      "return_window_days": 30,
      "delivery_pincode": "400001",
      "delivery_city": "Mumbai",
      "estimated_reverse_logistics_cost": 250,
      "is_returnable_category": true
    },
    "ORD-1002": {
      "customer_id": "CUST-SAM-001",
      "customer_name": "Sam",
      "product_id": "micro_000",
      "product_name": "WaveMaster 900W Countertop Microwave",
      "category": "appliances",
      "retail_price_inr": 6000,
      "purchase_date": "2026-06-10",
      "return_window_days": 10,
      "delivery_pincode": "400001",
      "delivery_city": "Mumbai",
      "estimated_reverse_logistics_cost": 5000,
      "is_returnable_category": true
    },
    "ORD-1003": {
      "customer_id": "CUST-SAM-001",
      "customer_name": "Sam",
      "product_id": "monitor_456",
      "product_name": "SafeCam Video Baby Monitor",
      "category": "electronics",
      "retail_price_inr": 4500,
      "purchase_date": "2026-04-10",
      "return_window_days": 7,
      "delivery_pincode": "400001",
      "delivery_city": "Mumbai",
      "estimated_reverse_logistics_cost": 400,
      "is_returnable_category": true
    },
    "ORD-1004": {
      "customer_id": "CUST-SAM-001",
      "customer_name": "Sam",
      "product_id": "case_789",
      "product_name": "EcoShield Leather Phone Case - iPhone 14",
      "category": "accessories",
      "retail_price_inr": 700,
      "purchase_date": "2026-06-12",
      "return_window_days": 10,
      "delivery_pincode": "400001",
      "delivery_city": "Mumbai",
      "estimated_reverse_logistics_cost": 120,
      "is_returnable_category": true
    },
    "ORD-1005": {
      "customer_id": "CUST-SAM-001",
      "customer_name": "Sam",
      "product_id": "whey_999",
      "product_name": "Optimum Nutrition Whey Protein 1kg",
      "category": "consumables",
      "retail_price_inr": 3500,
      "purchase_date": "2026-06-11",
      "return_window_days": 0,
      "delivery_pincode": "400001",
      "delivery_city": "Mumbai",
      "estimated_reverse_logistics_cost": 300,
      "is_returnable_category": false
    }
  }
};

const ordersContainer = document.getElementById('orders-container');
const returnModal = document.getElementById('return-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalBody = document.getElementById('modal-body');

// Initialize the app
function init() {
    renderOrders();
    setupEventListeners();
}

// Calculate the return window end date
function getReturnEndDate(purchaseDateStr, windowDays) {
    const date = new Date(purchaseDateStr);
    date.setDate(date.getDate() + windowDays);
    return date;
}

// Format date nicely
function formatDate(date) {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Render the list of orders
function renderOrders() {
    ordersContainer.innerHTML = '';

    for (const [orderId, order] of Object.entries(orderData.orders)) {
        const purchaseDate = new Date(order.purchase_date);
        const card = document.createElement('div');
        card.className = 'order-card';
        
        card.innerHTML = `
            <div class="order-header">
                <span class="order-id">#${orderId}</span>
                <span>Purchased: ${formatDate(purchaseDate)}</span>
            </div>
            <h3 class="order-title">${order.product_name}</h3>
            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Category</span>
                    <span class="detail-value" style="text-transform: capitalize;">${order.category}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Price</span>
                    <span class="detail-value price">₹${order.retail_price_inr}</span>
                </div>
            </div>
            <button class="action-btn btn-primary" onclick="handleReturnClick('${orderId}')">
                Return or Replace Item
            </button>
        `;
        
        ordersContainer.appendChild(card);
    }
}

// Handle the return button click
window.handleReturnClick = function(orderId) {
    const order = orderData.orders[orderId];
    
    // Check returnability rules
    if (!order.is_returnable_category) {
        showModalError("Not Returnable", "This item belongs to a non-returnable category (e.g., consumables). Returns are not accepted for this product.");
        return;
    }

    const returnEndDate = getReturnEndDate(order.purchase_date, order.return_window_days);
    
    if (CURRENT_DATE > returnEndDate) {
        showModalWarning("Return Window Closed", `The return window for this item closed on <strong>${formatDate(returnEndDate)}</strong>. You can no longer return this item.`);
        return;
    }

    // If we pass both checks, show the return reason form
    showReturnForm(order);
};

function showModalError(title, message) {
    modalBody.innerHTML = `
        <div class="return-status status-error">
            <div class="status-icon">🚫</div>
            <h3>${title}</h3>
            <p>${message}</p>
            <button class="action-btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `;
    openModal();
}

function showModalWarning(title, message) {
    modalBody.innerHTML = `
        <div class="return-status status-warning">
            <div class="status-icon">⏳</div>
            <h3>${title}</h3>
            <p>${message}</p>
            <button class="action-btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `;
    openModal();
}

function showReturnForm(order) {
    modalBody.innerHTML = `
        <div class="return-status">
            <h3>Initiate Return</h3>
            <p style="font-size: 0.9rem; text-align: left; margin-bottom: 1.5rem;">
                <strong>${order.product_name}</strong>
            </p>
            
            <div class="form-group">
                <label for="return-reason">Why are you returning this?</label>
                <select id="return-reason">
                    <option value="" disabled selected>Choose a reason</option>
                    <option value="defective">Item is defective or doesn't work</option>
                    <option value="damaged">Item/box was damaged in shipping</option>
                    <option value="wrong_item">Wrong item was sent</option>
                    <option value="no_longer_needed">No longer needed</option>
                    <option value="inaccurate">Description on website was not accurate</option>
                </select>
            </div>
            
            <button class="action-btn btn-primary" onclick="proceedToAIGrading('${order.product_id}')">
                Proceed to AI Grading 🤖
            </button>
        </div>
    `;
    openModal();
}

window.proceedToAIGrading = function(productId) {
    const reason = document.getElementById('return-reason').value;
    if (!reason) {
        alert("Please select a reason for return.");
        return;
    }
    
    // Simulate transition to the next step
    modalBody.innerHTML = `
        <div class="return-status status-success" style="padding-top: 1rem;">
            <div class="status-icon" style="font-size: 4rem; animation: pulse 2s infinite;">🧠</div>
            <h3 style="background: linear-gradient(to right, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Redirecting to AI Inspector...</h3>
            <p>Your return request has been registered.</p>
            <p style="font-size: 0.85rem;">Please upload a photo of your item for our automated visual assessment.</p>
        </div>
        <style>
            @keyframes pulse {
                0% { transform: scale(0.95); opacity: 0.8; }
                50% { transform: scale(1.05); opacity: 1; }
                100% { transform: scale(0.95); opacity: 0.8; }
            }
        </style>
    `;
};

// Modal handlers
function openModal() {
    returnModal.classList.remove('hidden');
}

window.closeModal = function() {
    returnModal.classList.add('hidden');
}

function setupEventListeners() {
    closeModalBtn.addEventListener('click', closeModal);
    returnModal.addEventListener('click', (e) => {
        if (e.target === returnModal) {
            closeModal();
        }
    });
}

// Start the app
init();
