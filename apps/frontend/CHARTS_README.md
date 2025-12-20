# Charts in SimpleAccounts Frontend

## Quick Overview

This application uses **Chart.js** (via react-chartjs-2) for all charting needs.

## Getting Started

### Creating a New Chart

```javascript
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// 1. Prepare your data
const data = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [
    {
      label: 'Sales',
      data: [100, 200, 150],
      backgroundColor: '#2064d8',
    },
  ],
};

// 2. Configure options
const options = {
  responsive: true,
  plugins: {
    legend: { display: true },
  },
};

// 3. Render the chart
<Bar data={data} options={options} />;
```

## Standard Colors

Use these colors for consistency:

| Purpose            | Color      | Hex Code  |
| ------------------ | ---------- | --------- |
| Income/Primary     | Blue       | `#2064d8` |
| Expenses/Secondary | Orange     | `#f4772e` |
| Success/Positive   | Green      | `#a1b86d` |
| Danger/Overdue     | Red        | `#f86c6b` |
| Info/Customer      | Light Blue | `#4191ff` |
| Warning/Due        | Yellow     | `#FFCE56` |

## Chart Types Available

- **Line** - Trends over time
- **Bar** - Comparisons (vertical or horizontal)
- **Pie** - Proportions
- **Doughnut** - Proportions with center space
- **Mixed** - Combine bar and line charts

## Examples in Codebase

| Chart Type   | Location                                              | Description                    |
| ------------ | ----------------------------------------------------- | ------------------------------ |
| Line         | `/src/screens/dashboard/sections/bank_account/`       | Account balance over time      |
| Bar          | `/src/screens/dashboard/sections/cash_flow/`          | Inflow vs Outflow              |
| Pie/Doughnut | `/src/screens/dashboard/sections/revenue_expense/`    | Top revenues/expenses          |
| Mixed        | `/src/screens/dashboard/sections/profit_loss_report/` | Income (bar) + Expenses (line) |
| Stacked Bar  | `/src/screens/dashboard/sections/invoice/`            | Invoice status timeline        |

## Documentation

📖 **Full Guides Available:**

1. **CHARTJS_QUICK_REFERENCE.md** - Quick patterns and examples
2. **CHART_LIBRARY_CONSOLIDATION_SUMMARY.md** - Complete technical details
3. **CHART_MIGRATION_IMPLEMENTATION_GUIDE.md** - Implementation instructions

## Common Patterns

### Responsive Chart with Fixed Height

```javascript
<div style={{ height: '300px' }}>
  <Line data={data} options={{ maintainAspectRatio: false }} />
</div>
```

### Chart with Smooth Lines

```javascript
const dataset = {
  tension: 0.4, // Makes curves smooth
  borderWidth: 4,
  // ... other properties
};
```

### Horizontal Bar Chart

```javascript
const options = {
  indexAxis: 'y', // Makes it horizontal
  // ... other options
};
```

## Need Help?

1. Check **CHARTJS_QUICK_REFERENCE.md** for common patterns
2. Look at existing components for examples
3. Visit [Chart.js Documentation](https://www.chartjs.org/docs/latest/)

## Migration Notice

✅ This project has been consolidated to use **Chart.js only**.

- ApexCharts has been removed
- All components use Chart.js
- See **CHART_CONSOLIDATION_COMPLETE.md** for details

---

**Last Updated:** 2025-12-19
