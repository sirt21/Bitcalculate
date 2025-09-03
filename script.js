let spendingHistory = JSON.parse(localStorage.getItem('bitcoinSpendingHistory')) || [];
let currentPeriod = 'daily';
let categoryEntries = [];
let entryCounter = 0;

// Toggle goal section visibility
function toggleGoalSection() {
    const goalInputs = document.getElementById('goalInputs');
    const enableGoal = document.getElementById('enableGoal');
    
    if (enableGoal.checked) {
        goalInputs.style.display = 'block';
    } else {
        goalInputs.style.display = 'none';
        // Hide goal results when disabled
        document.getElementById('goalResults').style.display = 'none';
    }
}

// Toggle ARR section visibility
function toggleARRSection() {
    const arrInputs = document.getElementById('arrInputs');
    const enableARR = document.getElementById('enableARR');
    
    if (enableARR.checked) {
        arrInputs.style.display = 'block';
    } else {
        arrInputs.style.display = 'none';
        // Hide ARR results when disabled
        document.getElementById('arrResults').style.display = 'none';
    }
}

// Fetch current Bitcoin price on page load
window.addEventListener('load', async () => {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        const btcPrice = data.bitcoin.usd;
        document.getElementById('btcPrice').value = btcPrice.toFixed(2);
    } catch (error) {
        console.log('Could not fetch Bitcoin price, using default');
        document.getElementById('btcPrice').value = '110929';
    }
});

function togglePeriod(period) {
    currentPeriod = period;
    
    // Update toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update labels
    const periodCapitalized = period.charAt(0).toUpperCase() + period.slice(1);
    document.getElementById('calculatorTitle').textContent = periodCapitalized;
    document.getElementById('incomeLabel').textContent = periodCapitalized;
    
    // Update placeholders
    const incomeInput = document.getElementById('incomeAmount');
    const spendingInput = document.getElementById('spendingAmount');
    
    if (period === 'daily') {
        incomeInput.placeholder = 'Enter your daily income';
        if (spendingInput) spendingInput.placeholder = 'Enter daily amount spent';
    } else {
        incomeInput.placeholder = 'Enter your monthly income';
        if (spendingInput) spendingInput.placeholder = 'Enter monthly amount spent';
    }
}

function addCategoryEntry() {
    entryCounter++;
    const entryId = `entry_${entryCounter}`;
    
    const categoryEntry = document.createElement('div');
    categoryEntry.className = 'category-entry';
    categoryEntry.id = entryId;
    categoryEntry.innerHTML = `
        <select onchange="updateTotalSpending()">
            <option value="">Select category...</option>
            <option value="rent">Rent</option>
            <option value="groceries">Groceries</option>
            <option value="eating-out">Eating Out</option>
            <option value="electricity">Electricity</option>
            <option value="heating">Heating</option>
            <option value="tech-gadgets">Tech Gadgets</option>
            <option value="travel">Travel</option>
            <option value="transportation">Transportation</option>
            <option value="leisure">Leisure Activities</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
        </select>
        <input type="number" placeholder="Amount ($)" step="0.01" min="0" oninput="updateTotalSpending()">
        <input type="date" placeholder="Date (optional)" title="Leave empty to use current date">
        <button type="button" class="remove-btn" onclick="removeCategoryEntry('${entryId}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.getElementById('categoryEntries').appendChild(categoryEntry);
    updateTotalSpending();
}

function removeCategoryEntry(entryId) {
    const entry = document.getElementById(entryId);
    if (entry) {
        entry.remove();
        updateTotalSpending();
    }
}

function updateTotalSpending() {
    const entries = document.querySelectorAll('.category-entry');
    let total = 0;
    let hasEntries = false;
    
    entries.forEach(entry => {
        const amountInput = entry.querySelector('input[type="number"]');
        const amount = parseFloat(amountInput.value) || 0;
        if (amount > 0) {
            total += amount;
            hasEntries = true;
        }
    });
    
    const totalSpendingDiv = document.getElementById('totalSpending');
    const totalAmountSpan = document.getElementById('totalAmount');
    
    if (hasEntries) {
        totalAmountSpan.textContent = `$${total.toFixed(2)}`;
        totalSpendingDiv.style.display = 'block';
    } else {
        totalSpendingDiv.style.display = 'none';
    }
}

async function getHistoricalBitcoinPrice(date) {
    try {
        const formattedDate = date.split('-').reverse().join('-'); // Convert YYYY-MM-DD to DD-MM-YYYY
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${formattedDate}`);
        const data = await response.json();
        return data.market_data?.current_price?.usd || null;
    } catch (error) {
        console.error('Error fetching historical Bitcoin price:', error);
        return null;
    }
}

async function calculateSpending() {
    const incomeAmount = parseFloat(document.getElementById('incomeAmount').value);
    const currentBtcPrice = parseFloat(document.getElementById('btcPrice').value);
    
    // Collect all category spending
    const entries = document.querySelectorAll('.category-entry');
    let totalSpending = 0;
    let totalBtcSpent = 0;
    let categories = [];
    
    if (entries.length === 0) {
        alert('Please add at least one spending category');
        return;
    }
    
    // Show loading state
    const calculateBtn = document.querySelector('.calculate-btn');
    const originalText = calculateBtn.innerHTML;
    calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
    calculateBtn.disabled = true;
    
    try {
        for (const entry of entries) {
            const categorySelect = entry.querySelector('select');
            const amountInput = entry.querySelector('input[type="number"]');
            const dateInput = entry.querySelector('input[type="date"]');
            
            const category = categorySelect.value;
            const amount = parseFloat(amountInput.value) || 0;
            const spendingDate = dateInput.value;
            
            if (category && amount > 0) {
                totalSpending += amount;
                
                let btcPrice = currentBtcPrice;
                let actualDate = new Date().toLocaleDateString();
                
                // If date is provided, fetch historical price
                if (spendingDate) {
                    const historicalPrice = await getHistoricalBitcoinPrice(spendingDate);
                    if (historicalPrice) {
                        btcPrice = historicalPrice;
                        actualDate = new Date(spendingDate).toLocaleDateString();
                    }
                }
                
                const btcAmount = amount / btcPrice;
                totalBtcSpent += btcAmount;
                
                categories.push({ 
                    category, 
                    amount, 
                    date: actualDate,
                    btcPrice: btcPrice,
                    btcAmount: btcAmount
                });
            }
        }
        
        if (totalSpending <= 0) {
            alert('Please add at least one category with a valid spending amount');
            return;
        }
        
        const satoshisSpent = Math.round(totalBtcSpent * 100000000);
        const percentageOfBtc = (totalBtcSpent * 100);
        
        // Calculate Bitcoin saved (if income provided)
        let btcSaved = 0;
        let savingsRate = 0;
        
        if (incomeAmount && incomeAmount > 0) {
            const savedAmount = incomeAmount - totalSpending;
            btcSaved = savedAmount / currentBtcPrice; // Use current price for savings
            savingsRate = (savedAmount / incomeAmount) * 100;
        }
        
        // Update results
        document.getElementById('btcSpent').textContent = totalBtcSpent.toFixed(8);
        document.getElementById('satoshisSpent').textContent = satoshisSpent.toLocaleString();
        document.getElementById('percentageOfBtc').textContent = percentageOfBtc.toFixed(6) + '%';
        document.getElementById('btcSaved').textContent = btcSaved.toFixed(8);
        document.getElementById('savingsRate').textContent = savingsRate.toFixed(2) + '%';
        
        // Calculate goal-related metrics if goal is enabled
        const goalEnabled = document.getElementById('enableGoal').checked;
        const goalResults = document.getElementById('goalResults');
        
        if (goalEnabled) {
            const btcGoal = parseFloat(document.getElementById('btcGoal').value) || 0;
            
            if (btcGoal > 0) {
                const spentVsGoalPercent = (totalBtcSpent / btcGoal) * 100;
                const savedVsGoalPercent = (btcSaved / btcGoal) * 100;
                const goalProgressPercent = ((btcSaved) / btcGoal) * 100; // Assuming current holdings = saved amount
                
                document.getElementById('spentVsGoal').textContent = spentVsGoalPercent.toFixed(4) + '%';
                document.getElementById('savedVsGoal').textContent = savedVsGoalPercent.toFixed(4) + '%';
                document.getElementById('goalProgress').textContent = goalProgressPercent.toFixed(2) + '%';
                
                goalResults.style.display = 'block';
            } else {
                goalResults.style.display = 'none';
            }
        } else {
            goalResults.style.display = 'none';
        }
        
        // Calculate ARR projections if enabled
        const arrEnabled = document.getElementById('enableARR').checked;
        const arrResults = document.getElementById('arrResults');
        
        if (arrEnabled && goalEnabled) {
            const btcARR = parseFloat(document.getElementById('btcARR').value) || 0;
            const btcGoal = parseFloat(document.getElementById('btcGoal').value) || 0;
            
            if (btcARR > 0 && btcGoal > 0 && btcSaved > 0 && currentBtcPrice > 0) {
                // Calculate time to reach goal with compound growth
                const monthlyARR = btcARR / 100 / 12; // Convert annual % to monthly decimal
                const monthlySavings = currentPeriod === 'daily' ? btcSaved * 30 : btcSaved;
                
                // Calculate months needed using compound interest formula
                // Future Value = Present Value * (1 + r)^n + Monthly Payment * [((1 + r)^n - 1) / r]
                // Solving for n (number of months)
                let monthsNeeded = 0;
                let currentValue = btcSaved;
                
                while (currentValue < btcGoal && monthsNeeded < 1200) { // Max 100 years
                    currentValue = currentValue * (1 + monthlyARR) + monthlySavings;
                    monthsNeeded++;
                }
                
                const yearsNeeded = monthsNeeded / 12;
                // Calculate future Bitcoin price with compound growth
                const futureBtcPrice = currentBtcPrice * Math.pow(1 + (btcARR / 100), yearsNeeded);
                const futurePortfolioValue = currentValue * futureBtcPrice;
                const monthlyBTCNeeded = monthlySavings;
                
                // Format time display
                let timeDisplay = '';
                if (yearsNeeded < 1) {
                    timeDisplay = `${monthsNeeded} months`;
                } else if (yearsNeeded < 100) {
                    const years = Math.floor(yearsNeeded);
                    const months = Math.round((yearsNeeded - years) * 12);
                    timeDisplay = months > 0 ? `${years}y ${months}m` : `${years} years`;
                } else {
                    timeDisplay = '100+ years';
                }
                
                document.getElementById('timeToGoal').textContent = timeDisplay;
                
                // Add validation for futurePortfolioValue
                if (isNaN(futurePortfolioValue) || !isFinite(futurePortfolioValue)) {
                    document.getElementById('futureValue').textContent = 'Error';
                } else {
                    document.getElementById('futureValue').textContent = '$' + futurePortfolioValue.toLocaleString(undefined, {maximumFractionDigits: 0});
                }
                
                document.getElementById('monthlyNeeded').textContent = monthlyBTCNeeded.toFixed(8);
                
                arrResults.style.display = 'block';
            } else {
                arrResults.style.display = 'none';
            }
        } else {
            arrResults.style.display = 'none';
        }
        
        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
        
        // Add to history
        const historyItem = {
            date: new Date().toLocaleDateString(),
            period: currentPeriod,
            categories: categories,
            incomeAmount: incomeAmount || 0,
            totalSpending: totalSpending,
            totalBtcSpent: totalBtcSpent,
            btcSaved: btcSaved,
            satoshisSpent: satoshisSpent,
            savingsRate: savingsRate
        };
        
        spendingHistory.unshift(historyItem);
        if (spendingHistory.length > 10) {
            spendingHistory = spendingHistory.slice(0, 10);
        }
        
        localStorage.setItem('bitcoinSpendingHistory', JSON.stringify(spendingHistory));
        updateHistoryDisplay();
        
    } catch (error) {
        console.error('Error calculating spending:', error);
        alert('Error calculating spending. Please try again.');
    } finally {
        // Restore button state
        calculateBtn.innerHTML = originalText;
        calculateBtn.disabled = false;
    }
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    spendingHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-date">${item.date} (${item.period})</div>
            <div class="history-amount">
                <div>Spent: ${item.totalBtcSpent.toFixed(8)} BTC</div>
                <div>Saved: ${item.btcSaved.toFixed(8)} BTC</div>
            </div>
        `;
        historyList.appendChild(historyItem);
    });
}

// Initialize with one category entry on page load
window.addEventListener('load', () => {
    addCategoryEntry();
    updateHistoryDisplay();
});
