// Global Pilgrim Bank - Forex Trading JavaScript
// Owner: Olawale Abdul-ganiyu Adeshina (Adegan95)

// Trading Configuration
const TRADING_CONFIG = {
    accountNumber: 'GPB-000001',
    server: 'GlobalPilgrim-MT5',
    leverage: 100,
    lotSize: 100000,
    currency: 'USD',
    emails: ['adegan95@gmail.com', 'olawalzte@gmail.com'],
    robotEnabled: false,
    autoTrading: false,
    manualTrading: false,
    maxLotSize: 50000
};

// Trading Pairs
const TRADING_PAIRS = [
    { symbol: 'EUR/USD', bid: 1.0850, ask: 1.0851, spread: 2, category: 'forex' },
    { symbol: 'GBP/USD', bid: 1.2745, ask: 1.2746, spread: 2, category: 'forex' },
    { symbol: 'USD/JPY', bid: 149.850, ask: 149.851, spread: 2, category: 'forex' },
    { symbol: 'USD/CHF', bid: 0.8920, ask: 0.8921, spread: 2, category: 'forex' },
    { symbol: 'AUD/USD', bid: 0.6540, ask: 0.6541, spread: 2, category: 'forex' },
    { symbol: 'USD/CAD', bid: 1.3580, ask: 1.3581, spread: 2, category: 'forex' },
    { symbol: 'NZD/USD', bid: 0.6080, ask: 0.6081, spread: 2, category: 'forex' },
    { symbol: 'USD/NGN', bid: 1550.00, ask: 1550.50, spread: 50, category: 'exotic' },
    { symbol: 'USD/ZAR', bid: 18.500, ask: 18.501, spread: 2, category: 'exotic' },
    { symbol: 'BTC/USDT', bid: 67450.00, ask: 67450.50, spread: 50, category: 'crypto' },
    { symbol: 'ETH/USDT', bid: 3450.00, ask: 3450.50, spread: 50, category: 'crypto' },
    { symbol: 'Pilgrim/USDT', bid: 0.50, ask: 0.51, spread: 1, category: 'crypto' }
];

// Trading State
let tradingState = {
    balance: 0,
    profitBalance: 0,
    equity: 0,
    freeMargin: 0,
    openPositions: [],
    tradeHistory: [],
    selectedPair: 'EUR/USD',
    robotStats: {
        tradesToday: 0,
        wins: 0,
        losses: 0,
        totalProfit: 0
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeTrading();
    loadTradingState();
    loadMarketData();
    startMarketUpdates();
    updateDisplays();
});

function initializeTrading() {
    // Initialize trading state
    const savedState = localStorage.getItem('globalPilgrimForex');
    if (savedState) {
        tradingState = { ...tradingState, ...JSON.parse(savedState) };
    }
    
    // Load balance from admin system
    const adminData = localStorage.getItem('globalPilgrimBank');
    if (adminData) {
        const data = JSON.parse(adminData);
        tradingState.balance = data.forexBalance || 0;
        tradingState.profitBalance = data.profitBalance || 0;
    }
    
    // Calculate equity and free margin
    calculateEquity();
}

function loadTradingState() {
    const savedState = localStorage.getItem('globalPilgrimForex');
    if (savedState) {
        tradingState = { ...tradingState, ...JSON.parse(savedState) };
    }
}

function saveTradingState() {
    localStorage.setItem('globalPilgrimForex', JSON.stringify(tradingState));
}

function loadMarketData() {
    const pairsContainer = document.getElementById('market-pairs');
    let pairsHTML = '';
    
    TRADING_PAIRS.forEach(pair => {
        const change = (Math.random() - 0.5) * 0.02;
        const changePercent = (change / pair.bid * 100).toFixed(2);
        const isPositive = change >= 0;
        
        pairsHTML += `
            <div class="pair-item ${pair.symbol === tradingState.selectedPair ? 'active' : ''}" onclick="selectPair('${pair.symbol}')">
                <div class="pair-header">
                    <h4>${pair.symbol}</h4>
                    <span class="pair-price">${pair.ask.toFixed(pair.category === 'crypto' ? 2 : 4)}</span>
                </div>
                <div class="pair-change">
                    <span>Spread: ${pair.spread}</span>
                    <span class="${isPositive ? 'positive' : 'negative'}">
                        ${isPositive ? '+' : ''}${changePercent}%
                    </span>
                </div>
            </div>
        `;
    });
    
    pairsContainer.innerHTML = pairsHTML;
    updatePairInfo();
    loadSignals();
    loadNews();
}

function selectPair(symbol) {
    tradingState.selectedPair = symbol;
    loadMarketData();
}

function updatePairInfo() {
    const pair = TRADING_PAIRS.find(p => p.symbol === tradingState.selectedPair);
    if (!pair) return;
    
    document.getElementById('selected-pair').textContent = pair.symbol;
    document.getElementById('current-price').textContent = pair.ask.toFixed(pair.category === 'crypto' ? 2 : 4);
    document.getElementById('bid-price').textContent = pair.bid.toFixed(pair.category === 'crypto' ? 2 : 4);
    document.getElementById('ask-price').textContent = pair.ask.toFixed(pair.category === 'crypto' ? 2 : 4);
    document.getElementById('spread').textContent = `${pair.spread} pips`;
}

function calculateEquity() {
    // Calculate floating profit/loss from open positions
    let floatingPL = 0;
    tradingState.openPositions.forEach(position => {
        const pair = TRADING_PAIRS.find(p => p.symbol === position.pair);
        if (pair) {
            const currentPrice = position.type === 'buy' ? pair.bid : pair.ask;
            floatingPL += (currentPrice - position.openPrice) * position.volume * TRADING_CONFIG.lotSize;
        }
    });
    
    tradingState.equity = tradingState.balance + floatingPL;
    tradingState.freeMargin = tradingState.equity * 0.8; // 80% free margin
}

// Market Updates
function startMarketUpdates() {
    // Update prices every second
    setInterval(() => {
        updatePrices();
        updatePositions();
        if (TRADING_CONFIG.robotEnabled) {
            executeRobotTrades();
        }
    }, 1000);
}

function updatePrices() {
    // Simulate price changes
    TRADING_PAIRS.forEach(pair => {
        const change = (Math.random() - 0.5) * 0.001;
        pair.bid = Math.max(0.0001, pair.bid + change);
        pair.ask = pair.bid + (pair.spread * (pair.category === 'crypto' ? 0.01 : 0.0001));
    });
    
    loadMarketData();
}

function refreshMarketData() {
    loadMarketData();
}

// Order Management
function openOrder(type) {
    const pair = TRADING_PAIRS.find(p => p.symbol === tradingState.selectedPair);
    if (!pair) return;
    
    const volume = parseFloat(document.getElementById('order-volume').value);
    const stopLoss = parseFloat(document.getElementById('stop-loss').value);
    const takeProfit = parseFloat(document.getElementById('take-profit').value);
    
    if (isNaN(volume) || volume <= 0) {
        alert('Please enter a valid volume');
        return;
    }
    
    if (volume > TRADING_CONFIG.maxLotSize) {
        alert(`Maximum lot size is ${TRADING_CONFIG.maxLotSize.toLocaleString()}. Please enter a smaller volume.`);
        return;
    }
    
    const openPrice = type === 'buy' ? pair.ask : pair.bid;
    const requiredMargin = volume * 1000; // Simplified margin calculation
    
    if (requiredMargin > tradingState.freeMargin) {
        alert('Insufficient margin. Required: $' + requiredMargin.toFixed(2) + ', Available: $' + tradingState.freeMargin.toFixed(2));
        return;
    }
    
    const order = {
        id: generateOrderId(),
        pair: pair.symbol,
        type: type,
        volume: volume,
        openPrice: openPrice,
        stopLoss: stopLoss,
        takeProfit: takeProfit,
        openTime: new Date().toISOString(),
        profit: 0
    };
    
    tradingState.openPositions.push(order);
    calculateEquity();
    saveTradingState();
    updateDisplays();
    
    alert(`${type.toUpperCase()} order opened successfully!\n\nOrder ID: ${order.id}\nPair: ${pair.symbol}\nVolume: ${volume} lots\nPrice: ${openPrice.toFixed(4)}`);
}

function closePosition(orderId) {
    const index = tradingState.openPositions.findIndex(p => p.id === orderId);
    if (index === -1) return;
    
    const position = tradingState.openPositions[index];
    const pair = TRADING_PAIRS.find(p => p.symbol === position.pair);
    if (!pair) return;
    
    const closePrice = position.type === 'buy' ? pair.bid : pair.ask;
    const profit = (closePrice - position.openPrice) * position.volume * TRADING_CONFIG.lotSize;
    
    // Update balance
    tradingState.balance += profit;
    tradingState.profitBalance += profit;
    
    // Add to trade history
    const historyItem = {
        ...position,
        closePrice: closePrice,
        closeTime: new Date().toISOString(),
        profit: profit
    };
    
    tradingState.tradeHistory.unshift(historyItem);
    tradingState.openPositions.splice(index, 1);
    
    // Update admin system
    updateAdminBalance(profit);
    
    calculateEquity();
    saveTradingState();
    updateDisplays();
}

function closeAllPositions() {
    if (tradingState.openPositions.length === 0) {
        alert('No open positions to close');
        return;
    }
    
    if (!confirm(`Close all ${tradingState.openPositions.length} positions?`)) return;
    
    const positionsToClose = [...tradingState.openPositions];
    positionsToClose.forEach(position => {
        closePosition(position.id);
    });
}

function generateOrderId() {
    return 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
}

function updatePositions() {
    const tbody = document.getElementById('positions-body');
    
    if (tradingState.openPositions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No open positions</td></tr>';
        return;
    }
    
    tbody.innerHTML = tradingState.openPositions.map(position => {
        const pair = TRADING_PAIRS.find(p => p.symbol === position.pair);
        const currentPrice = pair ? (position.type === 'buy' ? pair.bid : pair.ask) : position.openPrice;
        const profit = (currentPrice - position.openPrice) * position.volume * TRADING_CONFIG.lotSize;
        position.profit = profit;
        
        return `
            <tr>
                <td>${position.id}</td>
                <td>${position.pair}</td>
                <td><span style="color: ${position.type === 'buy' ? 'var(--success-color)' : 'var(--danger-color)'}">${position.type.toUpperCase()}</span></td>
                <td>${position.volume}</td>
                <td>${position.openPrice.toFixed(4)}</td>
                <td>${currentPrice.toFixed(4)}</td>
                <td class="${profit >= 0 ? 'profit-positive' : 'profit-negative'}">${profit.toFixed(2)}</td>
                <td>
                    <button class="btn-close-all" onclick="closePosition('${position.id}')">Close</button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateAdminBalance(profit) {
    const adminData = localStorage.getItem('globalPilgrimBank');
    if (adminData) {
        const data = JSON.parse(adminData);
        data.profitBalance = (data.profitBalance || 0) + profit;
        localStorage.setItem('globalPilgrimBank', JSON.stringify(data));
    }
}

// Robot Trading
function toggleRobot() {
    TRADING_CONFIG.robotEnabled = document.getElementById('robot-toggle').checked;
    
    const statusElement = document.getElementById('robot-status');
    if (TRADING_CONFIG.robotEnabled) {
        statusElement.innerHTML = '<span class="status-badge active">Active</span>';
    } else {
        statusElement.innerHTML = '<span class="status-badge inactive">Inactive</span>';
    }
}

function executeRobotTrades() {
    // Simple robot trading logic
    if (Math.random() > 0.95) { // 5% chance to trade each second
        const randomPair = TRADING_PAIRS[Math.floor(Math.random() * TRADING_PAIRS.length)];
        const type = Math.random() > 0.5 ? 'buy' : 'sell';
        const volume = (Math.random() * 0.1 + 0.01).toFixed(2);
        
        // Simulate robot trade
        tradingState.robotStats.tradesToday++;
        const profit = (Math.random() - 0.3) * 50; // Tend to be profitable
        
        if (profit > 0) {
            tradingState.robotStats.wins++;
        } else {
            tradingState.robotStats.losses++;
        }
        
        tradingState.robotStats.totalProfit += profit;
        tradingState.balance += profit;
        tradingState.profitBalance += profit;
        
        updateRobotStats();
        saveTradingState();
    }
}

function updateRobotStats() {
    const stats = tradingState.robotStats;
    const winRate = stats.tradesToday > 0 ? ((stats.wins / stats.tradesToday) * 100).toFixed(1) : 0;
    
    document.getElementById('robot-trades').textContent = stats.tradesToday;
    document.getElementById('win-rate').textContent = winRate + '%';
    document.getElementById('robot-profit').textContent = '$' + stats.totalProfit.toFixed(2);
}

// Auto and Manual Trading
function toggleAutoTrading() {
    TRADING_CONFIG.autoTrading = !TRADING_CONFIG.autoTrading;
    const btn = document.getElementById('btn-auto-trading');
    
    if (TRADING_CONFIG.autoTrading) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-robot"></i> Auto Trading: ON';
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-robot"></i> Auto Trading: OFF';
    }
}

function toggleManualTrading() {
    TRADING_CONFIG.manualTrading = !TRADING_CONFIG.manualTrading;
    const btn = document.getElementById('btn-manual-trading');
    
    if (TRADING_CONFIG.manualTrading) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-hand-pointer"></i> Manual: ON';
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-hand-pointer"></i> Manual: OFF';
    }
}

// Signals
function loadSignals() {
    const signalsContainer = document.getElementById('signals-list');
    const signals = [
        { type: 'buy', pair: 'EUR/USD', price: '1.0845', time: '2 min ago' },
        { type: 'sell', pair: 'GBP/USD', price: '1.2750', time: '5 min ago' },
        { type: 'buy', pair: 'BTC/USDT', price: '67400.00', time: '10 min ago' },
        { type: 'sell', pair: 'USD/JPY', price: '149.900', time: '15 min ago' }
    ];
    
    signalsContainer.innerHTML = signals.map(signal => `
        <div class="signal-item ${signal.type}">
            <h4>${signal.pair} - ${signal.type.toUpperCase()}</h4>
            <p>Price: ${signal.price} | ${signal.time}</p>
        </div>
    `).join('');
}

// News
function loadNews() {
    const newsContainer = document.getElementById('news-list');
    const news = [
        { title: 'EUR Strengthens Against USD', time: '1 hour ago' },
        { title: 'Fed Signals Rate Pause', time: '2 hours ago' },
        { title: 'Oil Prices Surge', time: '3 hours ago' },
        { title: 'Pilgrim Coin Gains Traction', time: '4 hours ago' }
    ];
    
    newsContainer.innerHTML = news.map(item => `
        <div class="news-item">
            <h4>${item.title}</h4>
            <p>${item.time}</p>
        </div>
    `).join('');
}

// Trade History
function updateTradeHistory() {
    const tbody = document.getElementById('history-body');
    
    if (tradingState.tradeHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No trade history</td></tr>';
        return;
    }
    
    tbody.innerHTML = tradingState.tradeHistory.slice(0, 50).map(trade => {
        return `
            <tr>
                <td>${trade.id}</td>
                <td>${trade.pair}</td>
                <td><span style="color: ${trade.type === 'buy' ? 'var(--success-color)' : 'var(--danger-color)'}">${trade.type.toUpperCase()}</span></td>
                <td>${trade.volume}</td>
                <td>${trade.openPrice.toFixed(4)}</td>
                <td>${trade.closePrice.toFixed(4)}</td>
                <td class="${trade.profit >= 0 ? 'profit-positive' : 'profit-negative'}">${trade.profit.toFixed(2)}</td>
                <td>${formatDateTime(trade.closeTime)}</td>
            </tr>
        `;
    }).join('');
}

// Update Displays
function updateDisplays() {
    document.getElementById('trading-balance').textContent = '$' + tradingState.balance.toFixed(2);
    document.getElementById('profit-balance').textContent = '$' + tradingState.profitBalance.toFixed(2);
    document.getElementById('equity').textContent = '$' + tradingState.equity.toFixed(2);
    document.getElementById('free-margin').textContent = '$' + tradingState.freeMargin.toFixed(2);
    
    updatePositions();
    updateTradeHistory();
    updateRobotStats();
}

// Chart Modal
function openChart(pair) {
    document.getElementById('chart-pair').textContent = pair;
    document.getElementById('chart-modal').style.display = 'flex';
}

function closeChart() {
    document.getElementById('chart-modal').style.display = 'none';
}

// Utility Functions
function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Order input changes
document.getElementById('order-volume').addEventListener('input', calculateOrderSummary);
document.getElementById('stop-loss').addEventListener('input', calculateOrderSummary);
document.getElementById('take-profit').addEventListener('input', calculateOrderSummary);

function calculateOrderSummary() {
    const volume = parseFloat(document.getElementById('order-volume').value) || 0;
    const requiredMargin = volume * 1000;
    
    document.getElementById('required-margin').textContent = '$' + requiredMargin.toFixed(2);
    document.getElementById('potential-profit').textContent = '$' + (volume * 100).toFixed(2);
}

// Initialize
initializeTrading();
loadTradingState();
loadMarketData();
startMarketUpdates();
updateDisplays();
calculateOrderSummary();