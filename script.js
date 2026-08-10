// Global Variables
let currentSort = 'newest';
let filteredData = [...lotoData];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    updateOverview();
    updateStatistics();
    updateHistory();
    setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', filterHistory);
    document.getElementById('sortSelect').addEventListener('change', function(e) {
        currentSort = e.target.value;
        updateHistory();
    });
}

// Show/Hide Sections
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));

    // Remove active from nav buttons
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Add active to clicked button
    event.target.classList.add('active');
}

// ===== OVERVIEW SECTION =====
function updateOverview() {
    // Total draws
    document.getElementById('totalDraws').textContent = lotoData.length;

    // Day span
    const firstDate = new Date(lotoData[0].date);
    const lastDate = new Date(lotoData[lotoData.length - 1].date);
    const daySpan = Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    document.getElementById('daySpan').textContent = daySpan + ' zile';

    // Frequency analysis
    const frequency = calculateFrequency();
    const frequencies = Object.values(frequency);
    frequencies.sort((a, b) => b.count - a.count);

    document.getElementById('mostFrequent').textContent = frequencies[0].number;
    document.getElementById('leastFrequent').textContent = frequencies[frequencies.length - 1].number;
}

// ===== STATISTICS SECTION =====
function updateStatistics() {
    const frequency = calculateFrequency();
    
    // Create frequency chart (Top 10)
    createFrequencyChart(frequency);
    
    // Create frequency table
    createFrequencyTable(frequency);
    
    // General statistics
    createGeneralStats(frequency);
    
    // Monthly trends
    createMonthlyTrends();
}

function calculateFrequency() {
    const frequency = {};
    
    for (let i = 1; i <= 20; i++) {
        frequency[i] = { number: i, count: 0 };
    }
    
    lotoData.forEach(draw => {
        draw.numbers.forEach(num => {
            if (frequency[num]) {
                frequency[num].count++;
            }
        });
    });
    
    return frequency;
}

function createFrequencyChart(frequency) {
    const chart = document.getElementById('frequencyChart');
    chart.innerHTML = '';
    
    // Get top 10
    const sorted = Object.values(frequency)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    
    const maxCount = Math.max(...sorted.map(f => f.count));
    
    sorted.forEach(item => {
        const barWidth = (item.count / maxCount) * 100;
        const barDiv = document.createElement('div');
        barDiv.className = 'chart-bar';
        barDiv.innerHTML = `
            <div class="chart-label">${item.number}</div>
            <div class="chart-bar-fill" style="width: ${barWidth}%">${item.count}</div>
            <div class="chart-value">${(item.count / lotoData.length * 100).toFixed(1)}%</div>
        `;
        chart.appendChild(barDiv);
    });
}

function createFrequencyTable(frequency) {
    const table = document.getElementById('frequencyTable');
    table.innerHTML = '';
    
    const sorted = Object.values(frequency).sort((a, b) => a.number - b.number);
    
    sorted.forEach(item => {
        const percent = (item.count / lotoData.length * 100).toFixed(1);
        const barLength = (item.count / lotoData.length) * 100;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.number}</strong></td>
            <td>${item.count}</td>
            <td>${percent}%</td>
            <td><div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); width: ${barLength}%; height: 20px; border-radius: 3px; min-width: 5px;"></div></td>
        `;
        table.appendChild(row);
    });
}

function createGeneralStats(frequency) {
    const statsDiv = document.getElementById('generalStats');
    statsDiv.innerHTML = '';
    
    const frequencies = Object.values(frequency).map(f => f.count);
    const avgFrequency = (frequencies.reduce((a, b) => a + b, 0) / frequencies.length).toFixed(2);
    const totalNumbers = lotoData.reduce((sum, draw) => sum + draw.numbers.length, 0);
    
    const stats = [
        { label: 'Medie Apariții', value: avgFrequency },
        { label: 'Total Extrageri de Numere', value: totalNumbers },
        { label: 'Numere Unice (1-20)', value: '20' },
        { label: 'Mediana Apariții', value: getMedianFrequency(frequencies) }
    ];
    
    stats.forEach(stat => {
        const item = document.createElement('div');
        item.className = 'stat-item';
        item.innerHTML = `
            <span class="stat-item-label">${stat.label}</span>
            <span class="stat-item-value">${stat.value}</span>
        `;
        statsDiv.appendChild(item);
    });
}

function getMedianFrequency(frequencies) {
    const sorted = [...frequencies].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
        ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2)
        : sorted[mid];
}

function createMonthlyTrends() {
    const trendsDiv = document.getElementById('monthlyTrends');
    trendsDiv.innerHTML = '';
    
    // Group by month
    const monthlyData = {};
    lotoData.forEach(draw => {
        const date = new Date(draw.date);
        const month = date.toLocaleString('ro-RO', { month: 'long', year: 'numeric' });
        if (!monthlyData[month]) {
            monthlyData[month] = 0;
        }
        monthlyData[month]++;
    });
    
    const months = Object.keys(monthlyData);
    const counts = Object.values(monthlyData);
    const maxCount = Math.max(...counts);
    
    months.forEach((month, index) => {
        const barWidth = (counts[index] / maxCount) * 100;
        const barDiv = document.createElement('div');
        barDiv.className = 'chart-bar';
        barDiv.innerHTML = `
            <div class="chart-label" style="min-width: 120px;">${month}</div>
            <div class="chart-bar-fill" style="width: ${barWidth}%">${counts[index]}</div>
        `;
        trendsDiv.appendChild(barDiv);
    });
}

// ===== HISTORY SECTION =====
function updateHistory() {
    const container = document.getElementById('historyContainer');
    container.innerHTML = '';
    
    let dataToDisplay = [...filteredData];
    
    if (currentSort === 'newest') {
        dataToDisplay.reverse();
    }
    
    if (dataToDisplay.length === 0) {
        container.innerHTML = '<div class="no-results">Nicio extragere găsită</div>';
        return;
    }
    
    dataToDisplay.forEach(draw => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        const date = new Date(draw.date);
        const formattedDate = date.toLocaleDateString('ro-RO', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const numberBadges = draw.numbers.map(num => 
            `<span class="number-badge">${num}</span>`
        ).join('');
        
        item.innerHTML = `
            <div class="history-date">${formattedDate}</div>
            <div class="history-numbers">${numberBadges}</div>
        `;
        
        container.appendChild(item);
    });
}

function filterHistory() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        filteredData = [...lotoData];
    } else {
        filteredData = lotoData.filter(draw => {
            const dateMatch = draw.date.includes(searchTerm);
            const numberMatch = draw.numbers.some(num => num.toString().includes(searchTerm));
            return dateMatch || numberMatch;
        });
    }
    
    updateHistory();
}

// ===== ANALYSIS SECTION =====
document.addEventListener('DOMContentLoaded', function() {
    // This will be called after overview/statistics are loaded
    setTimeout(updateAnalysis, 100);
});

function updateAnalysis() {
    updateAnalysisSection();
}

function updateAnalysisSection() {
    updatePairFrequency();
    updateConsecutiveNumbers();
    updateEvenOddStats();
    updateSumStats();
}

function updatePairFrequency() {
    const pairsDiv = document.getElementById('pairFrequency');
    pairsDiv.innerHTML = '';
    
    const pairs = {};
    
    lotoData.forEach(draw => {
        const sorted = draw.numbers.sort((a, b) => a - b);
        for (let i = 0; i < sorted.length - 1; i++) {
            const pair = `${sorted[i]}-${sorted[i + 1]}`;
            pairs[pair] = (pairs[pair] || 0) + 1;
        }
    });
    
    // Get top 5 pairs
    const topPairs = Object.entries(pairs)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    topPairs.forEach(([pair, count]) => {
        const item = document.createElement('div');
        item.className = 'analysis-item';
        item.innerHTML = `
            <span class="analysis-item-label">Pereche: ${pair}</span>
            <span class="analysis-item-value">${count}x</span>
        `;
        pairsDiv.appendChild(item);
    });
}

function updateConsecutiveNumbers() {
    const consDiv = document.getElementById('consecutiveNumbers');
    consDiv.innerHTML = '';
    
    const consecutives = {};
    
    lotoData.forEach(draw => {
        const sorted = draw.numbers.sort((a, b) => a - b);
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i + 1] - sorted[i] === 1) {
                const pair = `${sorted[i]}-${sorted[i + 1]}`;
                consecutives[pair] = (consecutives[pair] || 0) + 1;
            }
        }
    });
    
    if (Object.keys(consecutives).length === 0) {
        consDiv.innerHTML = '<div style="text-align: center; color: #999;">Nicio pereche consecutivă</div>';
        return;
    }
    
    const topConsecutives = Object.entries(consecutives)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    topConsecutives.forEach(([pair, count]) => {
        const item = document.createElement('div');
        item.className = 'analysis-item';
        item.innerHTML = `
            <span class="analysis-item-label">Pereche: ${pair}</span>
            <span class="analysis-item-value">${count}x</span>
        `;
        consDiv.appendChild(item);
    });
}

function updateEvenOddStats() {
    const evenOddDiv = document.getElementById('evenOddStats');
    evenOddDiv.innerHTML = '';
    
    let totalEven = 0;
    let totalOdd = 0;
    
    lotoData.forEach(draw => {
        draw.numbers.forEach(num => {
            if (num % 2 === 0) {
                totalEven++;
            } else {
                totalOdd++;
            }
        });
    });
    
    const total = totalEven + totalOdd;
    const evenPercent = ((totalEven / total) * 100).toFixed(1);
    const oddPercent = ((totalOdd / total) * 100).toFixed(1);
    
    const stats = [
        { label: 'Numere Pare', value: `${totalEven} (${evenPercent}%)` },
        { label: 'Numere Impare', value: `${totalOdd} (${oddPercent}%)` }
    ];
    
    stats.forEach(stat => {
        const item = document.createElement('div');
        item.className = 'analysis-item';
        item.innerHTML = `
            <span class="analysis-item-label">${stat.label}</span>
            <span class="analysis-item-value">${stat.value}</span>
        `;
        evenOddDiv.appendChild(item);
    });
}

function updateSumStats() {
    const sumDiv = document.getElementById('sumStats');
    sumDiv.innerHTML = '';
    
    const sums = lotoData.map(draw => draw.numbers.reduce((a, b) => a + b, 0));
    const avgSum = (sums.reduce((a, b) => a + b, 0) / sums.length).toFixed(1);
    const minSum = Math.min(...sums);
    const maxSum = Math.max(...sums);
    
    const stats = [
        { label: 'Suma Medie', value: avgSum },
        { label: 'Suma Minimă', value: minSum },
        { label: 'Suma Maximă', value: maxSum }
    ];
    
    stats.forEach(stat => {
        const item = document.createElement('div');
        item.className = 'analysis-item';
        item.innerHTML = `
            <span class="analysis-item-label">${stat.label}</span>
            <span class="analysis-item-value">${stat.value}</span>
        `;
        sumDiv.appendChild(item);
    });
}
