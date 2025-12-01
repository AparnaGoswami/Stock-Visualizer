const companies = [
  { symbol: "AAPL", name: "Apple", logo: "https://logo.clearbit.com/apple.com" },
  { symbol: "GOOGL", name: "Google", logo: "https://logo.clearbit.com/google.com" },
  { symbol: "MSFT", name: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com" },
  { symbol: "AMZN", name: "Amazon", logo: "https://logo.clearbit.com/amazon.com" },
  { symbol: "TSLA", name: "Tesla", logo: "https://logo.clearbit.com/tesla.com" },
  { symbol: "NFLX", name: "Netflix", logo: "https://logo.clearbit.com/netflix.com" },
  { symbol: "META", name: "Meta", logo: "https://logo.clearbit.com/meta.com" },
  { symbol: "NVDA", name: "NVIDIA", logo: "https://logo.clearbit.com/nvidia.com" },
  { symbol: "INTC", name: "Intel", logo: "https://logo.clearbit.com/intel.com" },
  { symbol: "AMD", name: "AMD", logo: "https://logo.clearbit.com/amd.com" }
];

const API_KEY = "TR1J12FNNGH8AY0I";
const container = document.getElementById("stocks-container");

let chartInstances = {}; // store charts for live updates

async function fetchStockData(symbol) {
  const res = await fetch(
    `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${API_KEY}`
  );

  const data = await res.json();
  const timeSeries = data["Time Series (5min)"];
  if (!timeSeries) return null;

  const times = Object.keys(timeSeries).slice(0, 10).reverse();
  const prices = times.map(t => parseFloat(timeSeries[t]["1. open"]));

  return { times, prices };
}

function createStockCard(company) {
  const card = document.createElement("div");
  card.className = "stock-card";

  card.innerHTML = `
    <img src="${company.logo}" alt="${company.name}" />
    <h2>${company.name}</h2>
    <div class="chart-container">
        <canvas id="chart-${company.symbol}"></canvas>
    </div>
  `;

  container.appendChild(card);
}

function createChart(symbol, times, prices) {
  const ctx = document.getElementById(`chart-${symbol}`).getContext("2d");

  chartInstances[symbol] = new Chart(ctx, {
    type: "line",
    data: {
      labels: times,
      datasets: [{
        label: "Price (USD)",
        data: prices,
        borderWidth: 2,
        borderColor: "#007bff",
        backgroundColor: "rgba(0,123,255,0.15)",
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function updateChart(symbol, times, prices) {
  const chart = chartInstances[symbol];
  if (!chart) return;

  chart.data.labels = times;
  chart.data.datasets[0].data = prices;
  chart.update();
}

async function loadData() {
  for (let company of companies) {
    const data = await fetchStockData(company.symbol);
    if (!data) continue;

    if (!chartInstances[company.symbol]) {
      createStockCard(company);
      createChart(company.symbol, data.times, data.prices);
    } else {
      updateChart(company.symbol, data.times, data.prices);
    }
  }
}

loadData();
setInterval(loadData, 30000); // auto refresh every 30 seconds
