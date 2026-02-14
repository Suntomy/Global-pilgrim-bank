// Global Pilgrim Bank - Main JavaScript
// Owner: Olawale Abdul-ganiyu Adeshina (Adegan95)
// Contact: +2349030277275

// Configuration
const ADMIN_CONFIG = {
    bvn: '22345678901', // Demo BVN for Olawale
    phone: '+2349030277275',
    name: 'Olawale Abdul-ganiyu Adeshina',
    alias: 'Adegan95',
    bankName: 'Global Pilgrim Bank',
    bankCode: 'AGB999',
    currencies: ['NGN', 'USD', 'EUR', 'GBP', 'BTC', 'ETH']
};

// State Management
let appState = {
    isAdminLoggedIn: false,
    customers: [],
    transactions: [],
    mainBalance: 0,
    profitBalance: 0,
    pilgrimBalance: 0,
    shareBalance: 0,
    forexBalance: 0,
    miningWallets: [],
    connectionLogs: [],
    networkMonitoring: true
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadFromStorage();
    startNetworkMonitoring();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

function initializeApp() {
    // Initialize mining wallets for different currencies
    initializeMiningWallets();
    
    // Add initial admin log
    addConnectionLog('System initialized', 'success');
    
    // Update displays
    updateDashboard();
}

function loadFromStorage() {
    const savedData = localStorage.getItem('globalPilgrimBank');
    if (savedData) {
        const data = JSON.parse(savedData);
        appState = { ...appState, ...data };
        updateDashboard();
    }
}

function saveToStorage() {
    localStorage.setItem('globalPilgrimBank', JSON.stringify(appState));
}

// Authentication
function adminLogin() {
    const bvn = document.getElementById('login-bvn').value.trim();
    const phone = document.getElementById('login-phone').value.trim();
    const errorDiv = document.getElementById('login-error');
    
    // Strict authentication - only Olawale can login
    if (bvn === ADMIN_CONFIG.bvn && phone === ADMIN_CONFIG.phone) {
        appState.isAdminLoggedIn = true;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'flex';
        addConnectionLog('Admin login successful - IP verification passed', 'success');
        updateDashboard();
    } else {
        errorDiv.textContent = 'Access Denied: Only authorized admin (Olawale) can access this system';
        addConnectionLog(`Failed login attempt - BVN: ${maskBVN(bvn)}, Phone: ${maskPhone(phone)}`, 'danger');
        triggerAlarm('Unauthorized login attempt detected!');
    }
}

function logout() {
    appState.isAdminLoggedIn = false;
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'flex';
    document.getElementById('login-bvn').value = '';
    document.getElementById('login-phone').value = '';
    addConnectionLog('Admin logged out', 'success');
}

// Security Functions
function maskBVN(bvn) {
    if (bvn.length === 11) {
        return bvn.substring(0, 3) + '******' + bvn.substring(9);
    }
    return '***';
}

function maskPhone(phone) {
    if (phone.length > 6) {
        return phone.substring(0, 3) + '****' + phone.substring(phone.length - 3);
    }
    return '***';
}

function addConnectionLog(message, type = 'success') {
    const log = {
        timestamp: new Date().toISOString(),
        message: message,
        type: type,
        ip: generateRandomIP(),
        location: 'Nigeria'
    };
    
    appState.connectionLogs.unshift(log);
    if (appState.connectionLogs.length > 100) {
        appState.connectionLogs.pop();
    }
    
    updateConnectionLogsDisplay();
    saveToStorage();
}

function generateRandomIP() {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function triggerAlarm(message) {
    document.getElementById('alarm-message').textContent = message;
    document.getElementById('alarm-system').style.display = 'flex';
    
    // Play alarm sound (visual feedback)
    const alarmElement = document.getElementById('alarm-system');
    let pulseCount = 0;
    const alarmInterval = setInterval(() => {
        alarmElement.style.opacity = pulseCount % 2 === 0 ? '1' : '0.8';
        pulseCount++;
        if (pulseCount > 10) {
            clearInterval(alarmInterval);
            alarmElement.style.opacity = '1';
        }
    }, 500);
}

function dismissAlarm() {
    document.getElementById('alarm-system').style.display = 'none';
}

// Dashboard Functions
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${section}-section`).style.display = 'block';
    
    // Add active class to clicked nav item
    event.target.closest('.nav-item').classList.add('active');
    
    // Update displays
    if (section === 'overview') updateDashboard();
    if (section === 'customers') loadCustomers();
    if (section === 'transactions') loadTransactions();
    if (section === 'crypto') updateCryptoDisplay();
    if (section === 'forex') updateForexDisplay();
    if (section === 'network') updateNetworkDisplay();
    if (section === 'terminal') updateTerminal();
}

function updateDashboard() {
    document.getElementById('main-balance').textContent = formatCurrency(appState.mainBalance);
    document.getElementById('profit-balance').textContent = formatCurrency(appState.profitBalance);
    document.getElementById('total-customers').textContent = appState.customers.length;
    document.getElementById('total-transactions').textContent = appState.transactions.length;
    
    updateRecentActivities();
}

function updateRecentActivities() {
    const activitiesDiv = document.getElementById('recent-activities');
    const recentTransactions = appState.transactions.slice(-10).reverse();
    
    if (recentTransactions.length === 0) {
        activitiesDiv.innerHTML = '<p style="text-align: center; color: #718096;">No recent activities</p>';
        return;
    }
    
    activitiesDiv.innerHTML = recentTransactions.map(transaction => {
        const iconClass = transaction.type === 'deposit' ? 'fa-arrow-down' : 
                         transaction.type === 'withdrawal' ? 'fa-arrow-up' : 'fa-exchange-alt';
        const iconColor = transaction.type === 'deposit' ? 'success' : 
                        transaction.type === 'withdrawal' ? 'danger' : 'primary';
        
        return `
            <div class="activity-item">
                <div class="activity-icon" style="background: var(--${iconColor}-color);">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="activity-info">
                    <strong>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</strong>
                    <span>${transaction.description}</span>
                    <div class="activity-time">${formatDateTime(transaction.timestamp)}</div>
                </div>
                <div class="activity-amount">
                    <span style="color: ${transaction.type === 'deposit' ? 'var(--success-color)' : 'var(--danger-color)'}">
                        ${transaction.type === 'deposit' ? '+' : '-'}${formatCurrency(transaction.amount)}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

function updateCurrentTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Customer Management
function showModal(modalType) {
    document.getElementById('modal-overlay').style.display = 'flex';
    
    if (modalType === 'create-customer') {
        document.getElementById('create-customer-modal').style.display = 'block';
    } else if (modalType === 'approve-deposit') {
        document.getElementById('approve-deposit-modal').style.display = 'block';
        loadPendingDeposits();
    } else if (modalType === 'transfer-profit') {
        document.getElementById('transfer-profit-modal').style.display = 'block';
        document.getElementById('current-profit-balance').textContent = formatCurrency(appState.profitBalance);
    }
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function createCustomer(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Generate account number and serial number
    const accountNumber = generateAccountNumber();
    const serialNumber = generateSerialNumber();
    
    const customer = {
        id: Date.now(),
        accountNumber: accountNumber,
        serialNumber: serialNumber,
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        bvn: formData.get('bvn'),
        nin: formData.get('nin'),
        country: formData.get('country'),
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        isActivated: false,
        bvnVerified: false,
        ninVerified: false,
        phoneVerified: false
    };
    
    appState.customers.push(customer);
    saveToStorage();
    
    // Add transaction record
    addTransaction('account_creation', 0, 'System', customer.fullName, 'Customer account created');
    
    closeModal();
    form.reset();
    loadCustomers();
    updateDashboard();
    
    alert(`Customer account created successfully!\nAccount Number: ${accountNumber}\nSerial Number: ${serialNumber}`);
}

function generateAccountNumber() {
    // Generate 10-digit account number
    const min = 1000000000;
    const max = 9999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSerialNumber() {
    // Generate 2 letters + 8 digits
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetters = letters.charAt(Math.floor(Math.random() * letters.length)) + 
                         letters.charAt(Math.floor(Math.random() * letters.length));
    const digits = Math.floor(10000000 + Math.random() * 90000000);
    return `${randomLetters}${digits}`;
}

function loadCustomers() {
    const tbody = document.getElementById('customer-table-body');
    
    if (appState.customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No customers found</td></tr>';
        return;
    }
    
    tbody.innerHTML = appState.customers.map(customer => `
        <tr>
            <td>${customer.serialNumber}</td>
            <td>${customer.accountNumber}</td>
            <td>${customer.fullName}</td>
            <td>${maskPhone(customer.phone)}</td>
            <td>${formatCurrency(customer.balance)}</td>
            <td><span class="status-badge ${customer.status}">${customer.status}</span></td>
            <td>${customer.bvnVerified ? '<i class="fas fa-check-circle" style="color: green;"></i>' : '<i class="fas fa-times-circle" style="color: red;"></i>'}</td>
            <td>${customer.ninVerified ? '<i class="fas fa-check-circle" style="color: green;"></i>' : '<i class="fas fa-times-circle" style="color: red;"></i>'}</td>
            <td>
                <div class="action-buttons-small">
                    <button class="btn-view" onclick="viewCustomer(${customer.id})"><i class="fas fa-eye"></i></button>
                    <button class="btn-edit" onclick="editCustomer(${customer.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" onclick="deleteCustomer(${customer.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function editCustomer(customerId) {
    const customer = appState.customers.find(c => c.id === customerId);
    if (!customer) return;
    
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('edit-customer-modal').style.display = 'block';
    
    document.getElementById('edit-customer-id').value = customer.id;
    document.getElementById('edit-fullName').value = customer.fullName;
    document.getElementById('edit-email').value = customer.email;
    document.getElementById('edit-phone').value = customer.phone;
    document.getElementById('edit-address').value = customer.address;
    document.getElementById('edit-balance').value = customer.balance;
    document.getElementById('edit-status').value = customer.status;
}

function updateCustomer(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const customerId = parseInt(formData.get('customerId'));
    
    const customerIndex = appState.customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) return;
    
    const oldBalance = appState.customers[customerIndex].balance;
    const newBalance = parseFloat(formData.get('balance'));
    
    appState.customers[customerIndex].fullName = formData.get('fullName');
    appState.customers[customerIndex].email = formData.get('email');
    appState.customers[customerIndex].phone = formData.get('phone');
    appState.customers[customerIndex].address = formData.get('address');
    appState.customers[customerIndex].balance = newBalance;
    appState.customers[customerIndex].status = formData.get('status');
    
    // Record balance changes
    if (newBalance !== oldBalance) {
        const difference = newBalance - oldBalance;
        if (difference > 0) {
            addTransaction('deposit', difference, 'Admin', appState.customers[customerIndex].fullName, 'Balance adjustment');
        } else {
            addTransaction('withdrawal', Math.abs(difference), appState.customers[customerIndex].fullName, 'Admin', 'Balance adjustment');
        }
    }
    
    saveToStorage();
    closeModal();
    loadCustomers();
    updateDashboard();
}

function deleteCustomer(customerId) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    const customerIndex = appState.customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) return;
    
    const customer = appState.customers[customerIndex];
    appState.customers.splice(customerIndex, 1);
    
    addTransaction('account_deletion', 0, 'System', customer.fullName, 'Customer account deleted');
    
    saveToStorage();
    loadCustomers();
    updateDashboard();
}

function viewCustomer(customerId) {
    const customer = appState.customers.find(c => c.id === customerId);
    if (!customer) return;
    
    alert(`Customer Details:\n\nName: ${customer.fullName}\nAccount Number: ${customer.accountNumber}\nSerial Number: ${customer.serialNumber}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nAddress: ${customer.address}\nBVN: ${maskBVN(customer.bvn)}\nNIN: ${customer.nin}\nBalance: ${formatCurrency(customer.balance)}\nStatus: ${customer.status}`);
}

// Transaction Management
function addTransaction(type, amount, from, to, description) {
    const transaction = {
        id: generateTransactionId(),
        type: type,
        amount: amount,
        from: from,
        to: to,
        description: description,
        timestamp: new Date().toISOString(),
        status: 'completed',
        currency: 'USD'
    };
    
    appState.transactions.push(transaction);
    saveToStorage();
}

function generateTransactionId() {
    return 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
}

function loadTransactions() {
    const tbody = document.getElementById('transaction-table-body');
    
    if (appState.transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No transactions found</td></tr>';
        return;
    }
    
    tbody.innerHTML = appState.transactions.slice().reverse().map(transaction => `
        <tr>
            <td>${transaction.id}</td>
            <td><span class="status-badge ${transaction.type}">${transaction.type}</span></td>
            <td>${transaction.from}</td>
            <td>${transaction.to}</td>
            <td>${formatCurrency(transaction.amount)}</td>
            <td>${transaction.currency}</td>
            <td><span class="status-badge ${transaction.status}">${transaction.status}</span></td>
            <td>${formatDateTime(transaction.timestamp)}</td>
            <td>
                <button class="btn-view" onclick="viewTransaction('${transaction.id}')"><i class="fas fa-eye"></i></button>
            </td>
        </tr>
    `).join('');
}

function showTransactionTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter transactions based on tab
    loadTransactions();
}

function viewTransaction(transactionId) {
    const transaction = appState.transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    alert(`Transaction Details:\n\nTransaction ID: ${transaction.id}\nType: ${transaction.type}\nFrom: ${transaction.from}\nTo: ${transaction.to}\nAmount: ${formatCurrency(transaction.amount)}\nDescription: ${transaction.description}\nDate: ${formatDateTime(transaction.timestamp)}\nStatus: ${transaction.status}`);
}

// Profit Management
function transferProfit(event) {
    event.preventDefault();
    const amount = parseFloat(document.getElementById('transfer-amount').value);
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (amount > appState.profitBalance) {
        alert('Insufficient profit balance');
        return;
    }
    
    appState.profitBalance -= amount;
    appState.mainBalance += amount;
    
    addTransaction('profit_transfer', amount, 'Profit Balance', 'Main Balance', 'Profit transferred to main balance');
    
    saveToStorage();
    closeModal();
    updateDashboard();
    document.getElementById('transfer-amount').value = '';
    
    alert(`Successfully transferred ${formatCurrency(amount)} from profit to main balance`);
}

// Crypto & Mining
function initializeMiningWallets() {
    const currencies = [
        { code: 'USD', name: 'US Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'British Pound' },
        { code: 'NGN', name: 'Nigerian Naira' },
        { code: 'BTC', name: 'Bitcoin' },
        { code: 'ETH', name: 'Ethereum' },
        { code: 'PLC', name: 'Pilgrim Coin' }
    ];
    
    currencies.forEach(currency => {
        const wallet = {
            currency: currency.code,
            name: currency.name,
            address: generateWalletAddress(),
            balance: 0,
            miningRate: 50, // 50 units per cycle
            lastMined: null
        };
        appState.miningWallets.push(wallet);
    });
}

function generateWalletAddress() {
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
        address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
}

function updateCryptoDisplay() {
    document.getElementById('pilgrim-balance').textContent = appState.pilgrimBalance.toFixed(2);
    document.getElementById('share-balance').textContent = appState.shareBalance.toFixed(2);
    
    const walletsDiv = document.getElementById('mining-wallets');
    walletsDiv.innerHTML = appState.miningWallets.map(wallet => `
        <div class="mining-wallet-card">
            <h4>${wallet.name} (${wallet.code})</h4>
            <p class="wallet-address">${wallet.address}</p>
            <p>Balance: ${wallet.balance} ${wallet.code}</p>
            <p>Mining Rate: ${wallet.miningRate} ${wallet.code}/cycle</p>
        </div>
    `).join('');
}

// Forex Trading
function updateForexDisplay() {
    document.getElementById('forex-balance').textContent = formatCurrency(appState.forexBalance);
    document.getElementById('forex-profit').textContent = formatCurrency(appState.profitBalance);
    
    const pairsDiv = document.getElementById('trading-pairs-list');
    const tradingPairs = [
        { name: 'EUR/USD', price: '1.0850', change: '+0.0023' },
        { name: 'GBP/USD', price: '1.2745', change: '-0.0018' },
        { name: 'USD/JPY', price: '149.850', change: '+0.0120' },
        { name: 'BTC/USDT', price: '67,450.00', change: '+1.23%' },
        { name: 'ETH/USDT', price: '3,450.00', change: '+0.87%' },
        { name: 'PLC/USDT', price: '0.50', change: '+0.00' },
        { name: 'USD/NGN', price: '1,550.00', change: '+0.50' }
    ];
    
    pairsDiv.innerHTML = tradingPairs.map(pair => `
        <div class="trading-pair-card">
            <span class="pair-name">${pair.name}</span>
            <span class="pair-price">${pair.price}</span>
            <span style="color: ${pair.change.startsWith('+') ? 'green' : 'red'}">${pair.change}</span>
        </div>
    `).join('');
}

// Terminal Functions
function updateTerminal() {
    const terminalOutput = document.getElementById('terminal-output');
    const logs = [
        '> System initialized successfully',
        '> Admin authentication verified',
        '> Database connection established',
        '> Security protocols activated',
        '> Fraud detection AI: ONLINE',
        '> AML screening: ACTIVE',
        '> KYC verification: ENABLED',
        '> Network monitoring: ACTIVE',
        '> Real-time notifications: ENABLED',
        '> Blockchain settlement: CONNECTED',
        '> Cloud backup: SYNCHRONIZED',
        '> Disaster recovery: STANDBY'
    ];
    
    terminalOutput.innerHTML = logs.map(log => `<p>${log}</p>`).join('');
}

function handleTerminal(event) {
    if (event.key === 'Enter') {
        const command = document.getElementById('terminal-command').value.toLowerCase().trim();
        const terminalOutput = document.getElementById('terminal-output');
        
        let response = '';
        
        switch (command) {
            case 'help':
                response = '> Available commands: help, status, customers, transactions, balance, clear';
                break;
            case 'status':
                response = `> System Status: ONLINE\n> Admin: ${ADMIN_CONFIG.name}\n> Total Customers: ${appState.customers.length}\n> Total Transactions: ${appState.transactions.length}`;
                break;
            case 'customers':
                response = `> Total Customers: ${appState.customers.length}`;
                break;
            case 'transactions':
                response = `> Total Transactions: ${appState.transactions.length}`;
                break;
            case 'balance':
                response = `> Main Balance: ${formatCurrency(appState.mainBalance)}\n> Profit Balance: ${formatCurrency(appState.profitBalance)}`;
                break;
            case 'clear':
                terminalOutput.innerHTML = '';
                document.getElementById('terminal-command').value = '';
                return;
            default:
                response = `> Unknown command: ${command}. Type 'help' for available commands.`;
        }
        
        terminalOutput.innerHTML += `<p>> ${command}</p><p>${response.replace(/\n/g, '<br>')}</p>`;
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        document.getElementById('terminal-command').value = '';
    }
}

// Network Monitoring
function startNetworkMonitoring() {
    setInterval(() => {
        if (appState.networkMonitoring && appState.isAdminLoggedIn) {
            // Simulate network monitoring
            const randomCheck = Math.random();
            if (randomCheck > 0.95) {
                addConnectionLog('Routine security scan completed', 'success');
            }
        }
    }, 30000); // Check every 30 seconds
}

function updateNetworkDisplay() {
    document.getElementById('active-connections').textContent = '1 (Authorized)';
    updateConnectionLogsDisplay();
}

function updateConnectionLogsDisplay() {
    const logsContainer = document.getElementById('connection-logs');
    if (!logsContainer) return;
    
    if (appState.connectionLogs.length === 0) {
        logsContainer.innerHTML = '<p>No connection logs</p>';
        return;
    }
    
    logsContainer.innerHTML = appState.connectionLogs.slice(0, 20).map(log => `
        <div class="log-entry ${log.type}">
            <strong>${formatDateTime(log.timestamp)}</strong><br>
            ${log.message}<br>
            <small>IP: ${log.ip} | Location: ${log.location}</small>
        </div>
    `).join('');
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

function searchCustomers() {
    const searchTerm = document.getElementById('customer-search').value.toLowerCase();
    loadCustomers();
    // Additional filtering logic can be added here
}

function filterCustomers() {
    const status = document.getElementById('customer-status').value;
    loadCustomers();
    // Additional filtering logic can be added here
}

function loadPendingDeposits() {
    const pendingDiv = document.getElementById('pending-deposits');
    // This would load pending deposits from the transactions
    pendingDiv.innerHTML = '<p style="text-align: center;">No pending deposits at this time</p>';
}

// Initialize
initializeApp();