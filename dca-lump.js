// Set default dates
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const defaultDate = oneYearAgo.toISOString().split('T')[0];
    
    document.getElementById('dca-start-date').value = defaultDate;
    document.getElementById('lump-start-date').value = defaultDate;
    
    // Update DCA per period when total amount or frequency changes
    document.getElementById('dca-amount').addEventListener('input', updateDCAPerPeriod);
    document.getElementById('dca-frequency').addEventListener('change', updateDCAPerPeriod);
});

function updateDCAPerPeriod() {
    const totalAmount = parseFloat(document.getElementById('dca-amount').value) || 0;
    const frequency = document.getElementById('dca-frequency').value;
    const startDate = new Date(document.getElementById('dca-start-date').value);
    const endDate = new Date();
    
    if (totalAmount > 0 && startDate) {
        let periods = 0;
        const timeDiff = endDate - startDate;
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        switch(frequency) {
            case 'daily':
                periods = Math.floor(daysDiff);
                break;
            case 'weekly':
                periods = Math.floor(daysDiff / 7);
                break;
            case 'monthly':
                periods = Math.floor(daysDiff / 30);
                break;
        }
        
        if (periods > 0) {
            const perPeriod = totalAmount / periods;
            document.getElementById('dca-per-period').value = perPeriod.toFixed(2);
        }
    }
}

async function getBitcoinPrice(date) {
    // For demo purposes, using a simplified price calculation
    // In a real implementation, you'd fetch historical data from an API
    const basePrice = 30000;
    const dateObj = new Date(date);
    const now = new Date();
    const daysDiff = (now - dateObj) / (1000 * 60 * 60 * 24);
    
    // Simulate price growth with some volatility
    const growthFactor = Math.pow(1.0002, daysDiff); // ~7.3% annual growth
    const volatility = Math.sin(daysDiff / 30) * 0.1 + 1; // Add some volatility
    
    return basePrice * growthFactor * volatility;
}

async function getCurrentBitcoinPrice() {
    // For demo purposes, return a current price
    // In a real implementation, fetch from a live API
    return 45000;
}

async function calculateDCA() {
    const totalAmount = parseFloat(document.getElementById('dca-amount').value);
    const frequency = document.getElementById('dca-frequency').value;
    const perPeriod = parseFloat(document.getElementById('dca-per-period').value);
    const startDate = new Date(document.getElementById('dca-start-date').value);
    
    if (!totalAmount || !perPeriod || !startDate) {
        alert('Please fill in all DCA fields');
        return;
    }
    
    const endDate = new Date();
    let currentDate = new Date(startDate);
    let totalInvested = 0;
    let totalBTC = 0;
    let purchases = [];
    
    while (currentDate <= endDate && totalInvested < totalAmount) {
        const remainingAmount = totalAmount - totalInvested;
        const investAmount = Math.min(perPeriod, remainingAmount);
        
        const price = await getBitcoinPrice(currentDate);
        const btcBought = investAmount / price;
        
        purchases.push({
            date: new Date(currentDate),
            amount: investAmount,
            price: price,
            btc: btcBought
        });
        
        totalInvested += investAmount;
        totalBTC += btcBought;
        
        // Move to next period
        switch(frequency) {
            case 'daily':
                currentDate.setDate(currentDate.getDate() + 1);
                break;
            case 'weekly':
                currentDate.setDate(currentDate.getDate() + 7);
                break;
            case 'monthly':
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
        }
    }
    
    const currentPrice = await getCurrentBitcoinPrice();
    const currentValue = totalBTC * currentPrice;
    const totalReturn = currentValue - totalInvested;
    const returnPercentage = (totalReturn / totalInvested) * 100;
    const avgPrice = totalInvested / totalBTC;
    
    // Update DCA results
    document.getElementById('dca-total-invested').textContent = `$${totalInvested.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('dca-btc-acquired').textContent = `${totalBTC.toFixed(8)} BTC`;
    document.getElementById('dca-current-value').textContent = `$${currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('dca-total-return').textContent = `$${totalReturn.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${returnPercentage.toFixed(2)}%)`;
    document.getElementById('dca-avg-price').textContent = `$${avgPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    document.getElementById('dca-results').classList.add('show');
    
    // Store for comparison
    window.dcaResults = {
        totalReturn: totalReturn,
        returnPercentage: returnPercentage,
        totalInvested: totalInvested,
        currentValue: currentValue
    };
    
    updateComparison();
}

async function calculateLumpSum() {
    const amount = parseFloat(document.getElementById('lump-amount').value);
    const startDate = new Date(document.getElementById('lump-start-date').value);
    
    if (!amount || !startDate) {
        alert('Please fill in all Lump Sum fields');
        return;
    }
    
    const buyPrice = await getBitcoinPrice(startDate);
    const btcAcquired = amount / buyPrice;
    const currentPrice = await getCurrentBitcoinPrice();
    const currentValue = btcAcquired * currentPrice;
    const totalReturn = currentValue - amount;
    const returnPercentage = (totalReturn / amount) * 100;
    
    // Update Lump Sum results
    document.getElementById('lump-total-invested').textContent = `$${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('lump-btc-acquired').textContent = `${btcAcquired.toFixed(8)} BTC`;
    document.getElementById('lump-current-value').textContent = `$${currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('lump-total-return').textContent = `$${totalReturn.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${returnPercentage.toFixed(2)}%)`;
    document.getElementById('lump-buy-price').textContent = `$${buyPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    document.getElementById('lump-results').classList.add('show');
    
    // Store for comparison
    window.lumpResults = {
        totalReturn: totalReturn,
        returnPercentage: returnPercentage,
        totalInvested: amount,
        currentValue: currentValue
    };
    
    updateComparison();
}

function updateComparison() {
    if (window.dcaResults && window.lumpResults) {
        document.getElementById('comparison-dca-return').textContent = 
            `$${window.dcaResults.totalReturn.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${window.dcaResults.returnPercentage.toFixed(2)}%)`;
        
        document.getElementById('comparison-lump-return').textContent = 
            `$${window.lumpResults.totalReturn.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${window.lumpResults.returnPercentage.toFixed(2)}%)`;
        
        const betterStrategy = window.dcaResults.totalReturn > window.lumpResults.totalReturn ? 'DCA Strategy' : 'Lump Sum Strategy';
        const difference = Math.abs(window.dcaResults.totalReturn - window.lumpResults.totalReturn);
        
        document.getElementById('better-strategy').textContent = 
            `${betterStrategy} (by $${difference.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})`;
        
        document.getElementById('comparison-section').classList.add('show');
    }
}
