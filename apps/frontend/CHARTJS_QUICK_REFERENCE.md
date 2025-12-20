# Chart.js Quick Reference Guide

## Installation & Setup

Chart.js is already configured in this project. The setup is in:
- `/src/utils/chartRegistry.js` - Registers all Chart.js components
- `/src/index.js` - Imports the registry before app renders

## Basic Usage

### Import Chart Components

```javascript
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
```

### Basic Chart Structure

```javascript
<Line data={chartData} options={chartOptions} />
```

## Common Chart Types

### 1. Line Chart

```javascript
import { Line } from 'react-chartjs-2';

const data = {
  labels: ['January', 'February', 'March', 'April', 'May'],
  datasets: [
    {
      label: 'Sales',
      data: [65, 59, 80, 81, 56],
      borderColor: '#2064d8',
      backgroundColor: 'rgba(32, 100, 216, 0.2)',
      borderWidth: 4,
      tension: 0.4, // Smooth curve
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#2064d8',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'bottom' },
    tooltip: { enabled: true, mode: 'index', intersect: false },
  },
  scales: {
    x: {
      grid: { display: true, color: 'rgba(125, 138, 156, 0.3)' },
    },
    y: {
      beginAtZero: true,
      grid: { display: true, color: 'rgba(125, 138, 156, 0.3)' },
    },
  },
};

<Line data={data} options={options} height={300} />
```

### 2. Bar Chart

```javascript
import { Bar } from 'react-chartjs-2';

const data = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    {
      label: 'Revenue',
      data: [12000, 19000, 15000, 22000],
      backgroundColor: '#2064d8',
      borderColor: '#2064d8',
      borderWidth: 1,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: { display: true },
  },
  scales: {
    y: { beginAtZero: true },
  },
};

<Bar data={data} options={options} />
```

### 3. Horizontal Bar Chart

```javascript
const options = {
  indexAxis: 'y', // This makes it horizontal
  responsive: true,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: { beginAtZero: true },
    y: { barPercentage: 0.4 }, // Controls bar thickness
  },
};
```

### 4. Stacked Bar Chart

```javascript
const data = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [
    {
      label: 'Paid',
      data: [100, 150, 200],
      backgroundColor: '#36A2EB',
    },
    {
      label: 'Due',
      data: [50, 75, 100],
      backgroundColor: '#FF6384',
    },
    {
      label: 'Overdue',
      data: [20, 30, 40],
      backgroundColor: '#FFCE56',
    },
  ],
};

const options = {
  responsive: true,
  scales: {
    x: { stacked: true },
    y: { stacked: true },
  },
};
```

### 5. Pie Chart

```javascript
import { Pie } from 'react-chartjs-2';

const data = {
  labels: ['Product A', 'Product B', 'Product C'],
  datasets: [
    {
      data: [300, 50, 100],
      backgroundColor: ['#2064d8', '#f4772e', '#a1b86d'],
      hoverBackgroundColor: ['#1854c8', '#e4672e', '#91a65d'],
    },
  ],
};

const options = {
  plugins: {
    legend: {
      display: true,
      position: 'right',
      labels: { usePointStyle: true, padding: 10 },
    },
  },
};

<Pie data={data} options={options} />
```

### 6. Doughnut Chart

```javascript
import { Doughnut } from 'react-chartjs-2';

// Same as Pie chart, but displays as doughnut
<Doughnut data={data} options={options} />
```

### 7. Mixed Chart (Bar + Line)

```javascript
const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  datasets: [
    {
      type: 'bar',
      label: 'Income',
      data: [440, 505, 414, 671],
      backgroundColor: '#2064d8',
      order: 2, // Bars behind line
    },
    {
      type: 'line',
      label: 'Expenses',
      data: [231, 442, 335, 227],
      borderColor: '#f4772e',
      backgroundColor: 'rgba(244, 119, 46, 0.1)',
      borderWidth: 4,
      fill: false,
      tension: 0.4,
      order: 1, // Line in front
    },
  ],
};

// Use Bar component for mixed charts
<Bar data={data} options={options} />
```

## Standard Color Palette

```javascript
// Use these colors for consistency across the app
const COLORS = {
  primary: '#2064d8',      // Blue - Income/Inflow/Primary data
  secondary: '#f4772e',    // Orange - Expenses/Outflow/Secondary data
  success: '#a1b86d',      // Green - Positive metrics
  danger: '#f86c6b',       // Red - Negative metrics/Overdue
  info: '#4191ff',         // Light Blue - Customer data
  warning: '#FFCE56',      // Yellow - Due items
  neutral: '#7a7b97',      // Gray - Neutral data
};
```

## Standard Options Templates

### Basic Options

```javascript
const basicOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'bottom' },
    tooltip: { enabled: true },
  },
  scales: {
    x: { grid: { color: 'rgba(125, 138, 156, 0.3)' } },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(125, 138, 156, 0.3)' },
    },
  },
};
```

### No Legend Options

```javascript
const noLegendOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
};
```

### Right Legend Options (for Pie/Doughnut)

```javascript
const rightLegendOptions = {
  plugins: {
    legend: {
      display: true,
      position: 'right',
      labels: { usePointStyle: true, padding: 10 },
    },
  },
};
```

## Common Patterns

### Multi-Line Chart with Different Styles

```javascript
const data = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [
    {
      label: "Today's Earnings",
      data: [65, 59, 80],
      borderColor: '#7a7b97',
      borderWidth: 4,
      pointRadius: 4,
      pointBackgroundColor: '#7a7b97',
      pointBorderColor: '#fff',
      pointBorderWidth: 3,
    },
    {
      label: 'Current Week',
      data: [65, 81, 56],
      borderColor: '#4191ff',
      borderWidth: 4,
      pointRadius: 4,
      pointBackgroundColor: '#4191ff',
      pointBorderColor: '#fff',
      pointBorderWidth: 3,
    },
  ],
};
```

### Area Chart (Line with Fill)

```javascript
const dataset = {
  label: 'Revenue',
  data: [100, 150, 200, 180],
  fill: true, // This makes it an area chart
  backgroundColor: 'rgba(32, 100, 216, 0.2)',
  borderColor: '#2064d8',
  borderWidth: 2,
  tension: 0.4,
};
```

### Dynamic Data Updates

```javascript
// In your component
this.setState({ chartData: newData });

// Chart will automatically re-render with new data
```

### Custom Tooltip

```javascript
const options = {
  plugins: {
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          label += context.parsed.y.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
          });
          return label;
        }
      }
    }
  }
};
```

## Performance Tips

### 1. Use datasetKeyProvider for Dynamic Updates

```javascript
<Bar
  data={data}
  options={options}
  datasetKeyProvider={() => Math.random()}
/>
```

### 2. Disable Animations for Large Datasets

```javascript
const options = {
  animation: false, // Disable animations
  // or
  animation: {
    duration: 0 // Set to 0ms
  }
};
```

### 3. Use Decimation for Large Datasets

```javascript
const options = {
  parsing: false,
  normalized: true,
  plugins: {
    decimation: {
      enabled: true,
      algorithm: 'lttb', // Largest Triangle Three Buckets
    }
  }
};
```

## Responsive Charts

### Set Fixed Height

```javascript
<div style={{ height: '300px' }}>
  <Line data={data} options={{ maintainAspectRatio: false }} />
</div>
```

### Use Aspect Ratio

```javascript
const options = {
  maintainAspectRatio: true,
  aspectRatio: 2, // width / height ratio
};
```

## Common Issues and Solutions

### Issue: Chart not displaying
**Solution:** Ensure Chart.js components are registered in `/src/utils/chartRegistry.js`

### Issue: Chart not responsive
**Solution:** Set `responsive: true` and wrap chart in a sized container

### Issue: Legend items not clickable
**Solution:** Ensure `legend.onClick` is not set to `null`

### Issue: Tooltip not showing
**Solution:** Check `tooltip.enabled` is `true` and `intersect` is set correctly

### Issue: Data not updating
**Solution:** Use `datasetKeyProvider` or ensure state updates trigger re-render

## Examples in Codebase

Look at these files for real-world examples:

1. **Line Chart**: `/src/screens/dashboard/sections/bank_account/index.js`
2. **Bar Chart**: `/src/screens/dashboard/sections/cash_flow/index.js`
3. **Pie Chart**: `/src/screens/dashboard/sections/revenue_expense/index.js`
4. **Mixed Chart**: `/src/screens/dashboard/sections/profit_loss_report/index.jsx`
5. **Stacked Bar**: `/src/screens/dashboard/sections/invoice/index.js`
6. **Multi-Line**: `/src/screens/dashboard/sections/paid_invoices/index.jsx`

## Resources

- **Chart.js Docs**: https://www.chartjs.org/docs/latest/
- **react-chartjs-2 Docs**: https://react-chartjs-2.js.org/
- **Chart.js Samples**: https://www.chartjs.org/docs/latest/samples/
- **Migration Guide**: `/apps/frontend/CHART_LIBRARY_CONSOLIDATION_SUMMARY.md`
