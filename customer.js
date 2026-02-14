// Global Pilgrim Bank - Customer Portal JavaScript
// Owner: Olawale Abdul-ganiyu Adeshina (Adegan95)

let customerState = {
    isLoggedIn: false,
    customer: null,
    lastSync: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    loadCustomerData();
    checkAuthStatus();
});

function loadCustomerData() {
    // Load customer data from localStorage
    const savedData = localStorage.getItem('globalPilgrimCustomers');
    if (savedData) {
        window.customerData = JSON.parse(savedData);
    } else {
        window.customerData = [];
    }
}

function checkAuthStatus() {
    const currentCustomer = sessionStorage.getItem('currentCustomer');
    if (currentCustomer) {
        customerState.customer = JSON.parse(currentCustomer);
        customerState.isLoggedIn = true;
        showCustomerDashboard();
    }
}

// Customer Login
function customerLogin() {
    const accountNumber = document.getElementById('customer-account').value.trim();
    const serialNumber = document.getElementById('customer-serial').value.trim();
    const errorDiv = document.getElementById('customer-login-error');
    
    // Validate input
    if (!accountNumber || !serialNumber) {
        errorDiv.textContent = 'Please enter both account number and serial number';
        return;
    }
    
    // Find customer
    const customer = window.customerData.find(c => 
        c.accountNumber === accountNumber && c.serialNumber === serialNumber
    );
    
    if (customer) {
        customerState.customer = customer;
        customerState.isLoggedIn = true;
        sessionStorage.setItem('currentCustomer', JSON.stringify(customer));
        
        // Check if account is activated
        if (!customer.isActivated) {
            alert('Your account is pending activation. Please make a deposit from another bank to activate your account.');
        }
        
        showCustomerDashboard();
    } else {
        errorDiv.textContent = 'Invalid account number or serial number';
    }
}

function customerLogout() {
    customerState.isLoggedIn = false;
    customerState.customer = null;
    sessionStorage.removeItem('currentCustomer');
    
    document.getElementById('customer-dashboard-section').style.display = 'none';
    document.getElementById('customer-login-section').style.display = 'flex';
    
    document.getElementById('customer-account').value = '';
    document.getElementById('customer-serial').value = '';
}

// Show Customer Dashboard
function showCustomerDashboard() {
    document.getElementById('customer-login-section').style.display = 'none';
    document.getElementById('customer-dashboard-section').style.display = 'block';
    
    // Update customer information
    updateCustomerDisplay();
    loadCustomerTransactions();
    showCustomerTab('dashboard');
}

function updateCustomerDisplay() {
    const customer = customerState.customer;
    
    document.getElementById('customer-name').textContent = customer.fullName;
    document.getElementById('display-account-number').textContent = customer.accountNumber;
    document.getElementById('customer-balance').textContent = formatCurrency(customer.balance);
    
    // Update account status
    const statusElement = document.getElementById('account-status');
    if (customer.isActivated) {
        statusElement.className = 'account-status active';
        statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Account Active';
        document.getElementById('activation-notice').style.display = 'none';
        document.getElementById('submit-transfer').disabled = false;
    } else {
        statusElement.className = 'account-status';
        statusElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> Account requires activation';
        document.getElementById('activation-notice').style.display = 'flex';
        document.getElementById('submit-transfer').disabled = true;
    }
    
    // Update card holder names
    const names = customer.fullName.split(' ');
    const lastName = names[names.length - 1].toUpperCase();
    document.getElementById('card-holder-name').textContent = lastName;
    document.getElementById('card-holder-name-visa').textContent = lastName;
    document.getElementById('card-holder-name-verve').textContent = lastName;
    
    // Update transfer form
    document.getElementById('from-account').value = customer.accountNumber;
    
    // Update profile
    updateProfileDisplay();
    
    // Update activation details
    document.getElementById('activation-account-number').textContent = customer.accountNumber;
    document.getElementById('activation-account-name').textContent = customer.fullName;
}

function updateProfileDisplay() {
    const customer = customerState.customer;
    
    document.getElementById('profile-name').textContent = customer.fullName;
    document.getElementById('profile-account').textContent = customer.accountNumber;
    document.getElementById('profile-serial').textContent = customer.serialNumber;
    document.getElementById('profile-email').textContent = customer.email;
    document.getElementById('profile-phone').textContent = customer.phone;
    document.getElementById('profile-address').textContent = customer.address;
    
    document.getElementById('profile-bvn').innerHTML = customer.bvnVerified ? 
        '<span style="color: green;"><i class="fas fa-check-circle"></i> Verified</span>' : 
        '<span style="color: orange;"><i class="fas fa-clock"></i> Pending</span>';
    
    document.getElementById('profile-nin').innerHTML = customer.ninVerified ? 
        '<span style="color: green;"><i class="fas fa-check-circle"></i> Verified</span>' : 
        '<span style="color: orange;"><i class="fas fa-clock"></i> Pending</span>';
    
    const statusMap = {
        'active': '<span style="color: green;">Active</span>',
        'pending': '<span style="color: orange;">Pending Activation</span>',
        'suspended': '<span style="color: red;">Suspended</span>'
    };
    document.getElementById('profile-status').innerHTML = statusMap[customer.status] || customer.status;
}

// Tab Navigation
function showCustomerTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`customer-${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked nav tab
    event.target.closest('.nav-tab').classList.add('active');
}

// Daily Synchronization
function dailySync() {
    const customer = customerState.customer;
    if (!customer) return;
    
    // Check if already synced today
    const today = new Date().toDateString();
    if (customerState.lastSync === today) {
        alert('You have already synchronized today. Please try again tomorrow.');
        return;
    }
    
    if (!confirm('Daily synchronization will credit $5.00 to your account. Continue?')) {
        return;
    }
    
    // Sync with admin system
    syncWithAdmin(customer);
    
    // Credit $5 to customer account
    customer.balance += 5;
    customerState.lastSync = today;
    
    // Update customer data
    updateCustomerBalance(customer);
    
    // Update display
    updateCustomerDisplay();
    
    alert('Synchronization successful! $5.00 has been credited to your account.');
}

function syncWithAdmin(customer) {
    // This function would sync with the admin system
    // For demo purposes, we'll log the sync
    console.log(`Syncing customer ${customer.accountNumber} with admin system...`);
    
    // In production, this would make an API call to the admin system
    const syncData = {
        accountNumber: customer.accountNumber,
        timestamp: new Date().toISOString(),
        syncType: 'daily'
    };
    
    // Store sync record
    let syncRecords = JSON.parse(localStorage.getItem('syncRecords') || '[]');
    syncRecords.push(syncData);
    localStorage.setItem('syncRecords', JSON.stringify(syncRecords));
}

function updateCustomerBalance(customer) {
    // Update customer in the main data
    const customerIndex = window.customerData.findIndex(c => c.accountNumber === customer.accountNumber);
    if (customerIndex !== -1) {
        window.customerData[customerIndex] = customer;
        localStorage.setItem('globalPilgrimCustomers', JSON.stringify(window.customerData));
        sessionStorage.setItem('currentCustomer', JSON.stringify(customer));
    }
}

// Transfer Functions
let currentTransferType = 'local';

function selectTransferType(type) {
    currentTransferType = type;
    
    // Update button states
    document.querySelectorAll('.transfer-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show/hide relevant fields
    if (type === 'local') {
        document.querySelector('.local-only').style.display = 'block';
        document.querySelector('.international-only').style.display = 'none';
    } else {
        document.querySelector('.local-only').style.display = 'none';
        document.querySelector('.international-only').style.display = 'block';
    }
}

function processTransfer(event) {
    event.preventDefault();
    
    const customer = customerState.customer;
    if (!customer || !customer.isActivated) {
        alert('Your account must be activated before you can make transfers.');
        return;
    }
    
    if (customer.balance <= 0) {
        alert('Insufficient funds. Please make a deposit to activate transfers.');
        return;
    }
    
    const toAccount = document.getElementById('to-account').value;
    const recipientName = document.getElementById('recipient-name').value;
    const description = document.getElementById('transfer-description').value;
    
    let amount, currency, fee;
    
    if (currentTransferType === 'local') {
        amount = parseFloat(document.getElementById('transfer-amount-local').value);
        currency = 'NGN';
        fee = amount * 0.01; // 1% fee for local transfers
    } else {
        amount = parseFloat(document.getElementById('transfer-amount').value);
        currency = document.getElementById('transfer-currency').value;
        fee = amount * 0.025; // 2.5% fee for international transfers
    }
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    const totalAmount = amount + fee;
    
    if (totalAmount > customer.balance) {
        alert(`Insufficient funds. Required: ${formatCurrency(totalAmount)}, Available: ${formatCurrency(customer.balance)}`);
        return;
    }
    
    // Confirm transfer
    if (!confirm(`Transfer ${formatCurrency(amount)} to ${recipientName}?\n\nFee: ${formatCurrency(fee)}\nTotal: ${formatCurrency(totalAmount)}`)) {
        return;
    }
    
    // Process transfer
    customer.balance -= totalAmount;
    updateCustomerBalance(customer);
    
    // Record transaction
    const transaction = {
        id: generateTransactionId(),
        type: 'transfer',
        amount: amount,
        fee: fee,
        from: customer.accountNumber,
        to: toAccount,
        recipientName: recipientName,
        description: description || 'Transfer',
        currency: currency,
        transferType: currentTransferType,
        timestamp: new Date().toISOString(),
        status: 'completed'
    };
    
    // Save transaction
    let transactions = JSON.parse(localStorage.getItem(`transactions_${customer.accountNumber}`) || '[]');
    transactions.unshift(transaction);
    localStorage.setItem(`transactions_${customer.accountNumber}`, JSON.stringify(transactions));
    
    // Update display
    updateCustomerDisplay();
    loadCustomerTransactions();
    
    // Clear form
    document.getElementById('transfer-form').reset();
    document.getElementById('transfer-summary').style.display = 'none';
    
    alert(`Transfer successful!\n\nTransaction ID: ${transaction.id}\nAmount: ${formatCurrency(amount)}\nFee: ${formatCurrency(fee)}`);
}

function generateTransactionId() {
    return 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
}

// Transaction Management
function loadCustomerTransactions() {
    const customer = customerState.customer;
    if (!customer) return;
    
    const transactions = JSON.parse(localStorage.getItem(`transactions_${customer.accountNumber}`) || '[]');
    const recentDiv = document.getElementById('customer-recent-transactions');
    const historyDiv = document.getElementById('customer-transaction-list');
    
    if (transactions.length === 0) {
        const noTransactions = '<p style="text-align: center; color: #718096;">No transactions yet</p>';
        recentDiv.innerHTML = noTransactions;
        historyDiv.innerHTML = noTransactions;
        return;
    }
    
    const transactionHTML = transactions.slice(0, 10).map(transaction => createTransactionHTML(transaction)).join('');
    recentDiv.innerHTML = transactionHTML;
    
    const historyHTML = transactions.map(transaction => createTransactionHTML(transaction)).join('');
    historyDiv.innerHTML = historyHTML;
}

function createTransactionHTML(transaction) {
    let iconClass, iconColor;
    
    switch (transaction.type) {
        case 'deposit':
            iconClass = 'fa-arrow-down';
            iconColor = 'deposit';
            break;
        case 'withdrawal':
            iconClass = 'fa-arrow-up';
            iconColor = 'withdrawal';
            break;
        case 'transfer':
            iconClass = 'fa-exchange-alt';
            iconColor = 'transfer';
            break;
        default:
            iconClass = 'fa-receipt';
            iconColor = 'deposit';
    }
    
    const amountClass = transaction.type === 'deposit' ? 'credit' : 'debit';
    const amountPrefix = transaction.type === 'deposit' ? '+' : '-';
    
    return `
        <div class="transaction-item">
            <div class="transaction-icon ${iconColor}">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="transaction-details">
                <div class="transaction-type">${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</div>
                <div class="transaction-date">${formatDateTime(transaction.timestamp)}</div>
                ${transaction.recipientName ? `<div style="font-size: 12px; color: #718096;">To: ${transaction.recipientName}</div>` : ''}
            </div>
            <div class="transaction-amount ${amountClass}">
                ${amountPrefix}${formatCurrency(transaction.amount)}
            </div>
        </div>
    `;
}

// Utility Functions
function formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Auto-update balance (sync with admin system)
setInterval(() => {
    if (customerState.isLoggedIn && customerState.customer) {
        const accountNumber = customerState.customer.accountNumber;
        const updatedData = JSON.parse(localStorage.getItem('globalPilgrimCustomers') || '[]');
        const updatedCustomer = updatedData.find(c => c.accountNumber === accountNumber);
        
        if (updatedCustomer && updatedCustomer.balance !== customerState.customer.balance) {
            customerState.customer = updatedCustomer;
            sessionStorage.setItem('currentCustomer', JSON.stringify(updatedCustomer));
            updateCustomerDisplay();
        }
    }
}, 10000); // Check every 10 seconds

// Initialize
loadCustomerData();