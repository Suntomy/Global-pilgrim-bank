// Global Pilgrim Bank - Crypto Mining JavaScript
// Owner: Olawale Abdul-ganiyu Adeshina (Adegan95)

// Mining Configuration
const MINING_CONFIG = {
    currencies: {
        PLC: { name: 'Pilgrim Coin', price: 0.50, miningRate: 50, icon: '🪙' },
        BTC: { name: 'Bitcoin', price: 67450.00, miningRate: 0.0005, icon: '₿' },
        ETH: { name: 'Ethereum', price: 3450.00, miningRate: 0.005, icon: 'Ξ' },
        USD: { name: 'US Dollar', price: 1.00, miningRate: 50, icon: '$' },
        EUR: { name: 'Euro', price: 1.08, miningRate: 45, icon: '€' },
        GBP: { name: 'British Pound', price: 1.27, miningRate: 40, icon: '£' },
        NGN: { name: 'Nigerian Naira', price: 0.000645, miningRate: 50000, icon: '₦' }
    },
    miningInterval: 3600000, // 1 hour in milliseconds
    autoTransfer: true
};

// Mining State
let miningState = {
    activeMiners: {},
    minedAmounts: {},
    walletAddresses: {},
    totalMined: 0,
    todayProfit: 0,
    mainBalance: 0
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeMining();
    loadMiningState();
    generateAllWallets();
    startMiningIntervals();
    updateDisplays();
});

function initializeMining() {
    // Initialize mining state for each currency
    Object.keys(MINING_CONFIG.currencies).forEach(currency => {
        miningState.activeMiners[currency] = false;
        miningState.minedAmounts[currency] = 0;
        miningState.walletAddresses[currency] = '';
    });
    
    // Load from localStorage
    const savedState = localStorage.getItem('globalPilgrimMining');
    if (savedState) {
        const data = JSON.parse(savedState);
        miningState = { ...miningState, ...data };
    }
}

function loadMiningState() {
    // Load mining state from localStorage
    const savedState = localStorage.getItem('globalPilgrimMining');
    if (savedState) {
        miningState = { ...miningState, ...JSON.parse(savedState) };
    }
    
    // Load main balance from admin system
    const adminData = localStorage.getItem('globalPilgrimBank');
    if (adminData) {
        const data = JSON.parse(adminData);
        miningState.mainBalance = data.mainBalance || 0;
    }
}

function saveMiningState() {
    localStorage.setItem('globalPilgrimMining', JSON.stringify(miningState));
}

function generateWalletAddress() {
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
        address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
}

function generateAllWallets() {
    Object.keys(MINING_CONFIG.currencies).forEach(currency => {
        if (!miningState.walletAddresses[currency]) {
            miningState.walletAddresses[currency] = generateWalletAddress();
        }
        
        const addressElement = document.getElementById(`${currency.toLowerCase()}-wallet-address`);
        if (addressElement) {
            addressElement.textContent = miningState.walletAddresses[currency];
        }
    });
    
    saveMiningState();
    updateWalletsDisplay();
}

// Mining Functions
function startMining(currency) {
    const config = MINING_CONFIG.currencies[currency];
    
    if (miningState.activeMiners[currency]) {
        stopMining(currency);
        return;
    }
    
    miningState.activeMiners[currency] = true;
    updateMiningButton(currency, true);
    updateMiningStatus(currency, true);
    
    // Start mining cycle
    mineCurrency(currency);
    
    // Set up interval for continuous mining
    const intervalId = setInterval(() => {
        mineCurrency(currency);
    }, MINING_CONFIG.miningInterval);
    
    miningState[`${currency}Interval`] = intervalId;
    
    saveMiningState();
}

function stopMining(currency) {
    miningState.activeMiners[currency] = false;
    
    if (miningState[`${currency}Interval`]) {
        clearInterval(miningState[`${currency}Interval`]);
    }
    
    updateMiningButton(currency, false);
    updateMiningStatus(currency, false);
    
    saveMiningState();
}

function mineCurrency(currency) {
    const config = MINING_CONFIG.currencies[currency];
    const minedAmount = config.miningRate;
    
    // Update mined amount
    miningState.minedAmounts[currency] += minedAmount;
    
    // Calculate value in USD
    const valueUSD = minedAmount * config.price;
    miningState.totalMined += valueUSD;
    miningState.todayProfit += valueUSD;
    
    // Auto-transfer to main balance if enabled
    if (MINING_CONFIG.autoTransfer) {
        miningState.mainBalance += valueUSD;
        transferToMainBalance(valueUSD);
    }
    
    // Update displays
    updateMiningDisplay(currency);
    updateStats();
    
    // Save state
    saveMiningState();
    
    console.log(`Mined ${minedAmount} ${currency} = ${valueUSD.toFixed(2)} USD`);
}

function transferToMainBalance(amount) {
    // Update admin system main balance
    const adminData = localStorage.getItem('globalPilgrimBank');
    if (adminData) {
        const data = JSON.parse(adminData);
        data.mainBalance = (data.mainBalance || 0) + amount;
        localStorage.setItem('globalPilgrimBank', JSON.stringify(data));
    }
}

function updateMiningButton(currency, isMining) {
    const button = document.querySelector(`#mining-section .mining-card:nth-child(${getCurrencyIndex(currency)}) .btn-mine`);
    if (button) {
        if (isMining) {
            button.textContent = 'Stop Mining';
            button.classList.add('mining');
        } else {
            button.textContent = 'Start Mining';
            button.classList.remove('mining');
        }
    }
}

function updateMiningStatus(currency, isMining) {
    const statusElement = document.getElementById(`${currency.toLowerCase()}-mining-status`);
    if (statusElement) {
        statusElement.innerHTML = isMining ? 
            '<span class="status-badge mining">Mining...</span>' : 
            '<span class="status-badge stopped">Stopped</span>';
    }
}

function updateMiningDisplay(currency) {
    const config = MINING_CONFIG.currencies[currency];
    const mined = miningState.minedAmounts[currency];
    const value = mined * config.price;
    
    const minedElement = document.getElementById(`${currency.toLowerCase()}-mined`);
    const valueElement = document.getElementById(`${currency.toLowerCase()}-value`);
    
    if (minedElement) {
        minedElement.textContent = `${mined.toFixed(config.price < 1 ? 8 : 2)} ${currency}`;
    }
    
    if (valueElement) {
        valueElement.textContent = `$${value.toFixed(2)}`;
    }
}

function updateStats() {
    const activeCount = Object.values(miningState.activeMiners).filter(active => active).length;
    
    document.getElementById('total-mined').textContent = `$${miningState.totalMined.toFixed(2)}`;
    document.getElementById('active-miners').textContent = activeCount;
    document.getElementById('today-profit').textContent = `$${miningState.todayProfit.toFixed(2)}`;
}

function startMiningIntervals() {
    // Resume any active miners from previous session
    Object.keys(miningState.activeMiners).forEach(currency => {
        if (miningState.activeMiners[currency]) {
            startMining(currency);
        }
    });
}

function updateDisplays() {
    Object.keys(MINING_CONFIG.currencies).forEach(currency => {
        updateMiningDisplay(currency);
        updateMiningStatus(currency, miningState.activeMiners[currency]);
        updateMiningButton(currency, miningState.activeMiners[currency]);
    });
    
    updateStats();
    updateWalletsDisplay();
}

// Wallet Management
function updateWalletsDisplay() {
    const walletsGrid = document.getElementById('wallets-grid');
    if (!walletsGrid) return;
    
    let walletsHTML = '';
    
    Object.keys(MINING_CONFIG.currencies).forEach(currency => {
        const config = MINING_CONFIG.currencies[currency];
        const address = miningState.walletAddresses[currency] || 'Not generated';
        const balance = miningState.minedAmounts[currency] || 0;
        const value = balance * config.price;
        
        walletsHTML += `
            <div class="wallet-item">
                <h4>${config.icon} ${config.name} (${currency})</h4>
                <p><strong>Address:</strong></p>
                <code style="display: block; background: #0d1117; padding: 8px; border-radius: 6px; font-size: 11px; color: #58a6ff; word-break: break-all; margin-bottom: 10px;">${address}</code>
                <p><strong>Balance:</strong> ${balance.toFixed(currency === 'BTC' ? 8 : 2)} ${currency}</p>
                <p><strong>Value:</strong> $${value.toFixed(2)} USD</p>
            </div>
        `;
    });
    
    walletsGrid.innerHTML = walletsHTML;
}

// Exchange Functions
function processExchange() {
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    const amount = parseFloat(document.getElementById('exchange-amount').value);
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    const fromConfig = MINING_CONFIG.currencies[fromCurrency];
    const toConfig = MINING_CONFIG.currencies[toCurrency];
    
    if (!fromConfig || !toConfig) {
        alert('Invalid currency selected');
        return;
    }
    
    // Calculate exchange
    const fromValueUSD = amount * fromConfig.price;
    const toAmount = fromValueUSD / toConfig.price;
    
    // Update balances
    miningState.minedAmounts[fromCurrency] = (miningState.minedAmounts[fromCurrency] || 0) - amount;
    miningState.minedAmounts[toCurrency] = (miningState.minedAmounts[toCurrency] || 0) + toAmount;
    
    saveMiningState();
    updateDisplays();
    
    alert(`Exchange successful!\n\nExchanged: ${amount} ${fromCurrency}\nReceived: ${toAmount.toFixed(toCurrency === 'BTC' ? 8 : 2)} ${toCurrency}\nRate: 1 ${fromCurrency} = ${(fromConfig.price / toConfig.price).toFixed(8)} ${toCurrency}`);
}

// Exchange Rate Display
document.getElementById('from-currency').addEventListener('change', updateExchangeRate);
document.getElementById('to-currency').addEventListener('change', updateExchangeRate);
document.getElementById('exchange-amount').addEventListener('input', updateExchangeResult);

function updateExchangeRate() {
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    
    const fromConfig = MINING_CONFIG.currencies[fromCurrency];
    const toConfig = MINING_CONFIG.currencies[toCurrency];
    
    const rate = fromConfig.price / toConfig.price;
    document.getElementById('current-rate').textContent = `1 ${fromCurrency} = ${rate.toFixed(8)} ${toCurrency}`;
    
    updateExchangeResult();
}

function updateExchangeResult() {
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    const amount = parseFloat(document.getElementById('exchange-amount').value) || 0;
    
    const fromConfig = MINING_CONFIG.currencies[fromCurrency];
    const toConfig = MINING_CONFIG.currencies[toCurrency];
    
    const fromValueUSD = amount * fromConfig.price;
    const toAmount = fromValueUSD / toConfig.price;
    
    document.getElementById('exchange-result').textContent = `${toAmount.toFixed(toCurrency === 'BTC' ? 8 : 2)} ${toCurrency}`;
}

// Auto Transfer Toggle
document.getElementById('auto-transfer').addEventListener('change', function() {
    MINING_CONFIG.autoTransfer = this.checked;
    console.log('Auto-transfer:', MINING_CONFIG.autoTransfer ? 'enabled' : 'disabled');
});

// Section Navigation
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${section}-section`).classList.add('active');
    
    // Add active class to clicked button
    event.target.closest('.nav-btn').classList.add('active');
    
    // Update displays
    if (section === 'wallets') {
        updateWalletsDisplay();
    }
}

// Utility Functions
function getCurrencyIndex(currency) {
    const currencyOrder = ['PLC', 'BTC', 'ETH', 'USD', 'EUR', 'GBP'];
    return currencyOrder.indexOf(currency) + 1;
}

// Initialize
initializeMining();
loadMiningState();
generateAllWallets();
startMiningIntervals();
updateDisplays();
updateExchangeRate();