import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardBody } from 'reactstrap';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

import './style.scss';

let strings = new LocalizedStrings(data);

const data4MultipleOptions = {
  layout: {
    padding: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
    },
  },
  scales: {
    y: {
      ticks: {
        display: true,
        color: '#98afc2',
        font: {
          size: 11,
        },
      },
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(200, 210, 220, 0.3)',
        drawBorder: false,
      },
      border: {
        display: false,
      },
    },
    x: {
      ticks: {
        display: true,
        color: '#98afc2',
        font: {
          size: 11,
        },
      },
      beginAtZero: true,
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: '#3d5a80',
        font: {
          size: 12,
        },
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: '#1e3a5f',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#1e6eff',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    line: {
      tension: 0.4,
    },
  },
};

const PaidInvoices = props => {
  const { DashboardActions } = props;
  const [language] = useState(window['localStorage'].getItem('language'));
  const [invoice_graph_data, setInvoiceGraphData] = useState({
    labels: [],
    datasets: [],
  });

  const getInvoiceGraph = data => {
    if (!data) return;
    const paidCustomerData = data.paidCustomerData || {};
    const paidSupplierData = data.paidSupplierData || {};
    const data4MultipleData = {
      labels: data.labels || [],
      datasets: [
        {
          fill: true,
          lineTension: 0.4,
          backgroundColor: context => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(30, 110, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(30, 110, 255, 0.02)');
            return gradient;
          },
          borderWidth: 3,
          borderColor: '#1e6eff',
          pointBorderColor: '#1e6eff',
          pointBackgroundColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          pointHoverBorderWidth: 2,
          pointRadius: 4,
          pointHoverBackgroundColor: '#1e6eff',
          pointHoverBorderColor: '#ffffff',
          data: paidCustomerData.data || [],
          datalabels: {
            display: false,
          },
          label: (paidCustomerData.label || 'Paid Customer') + ' ',
        },
        {
          fill: true,
          lineTension: 0.4,
          backgroundColor: context => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(244, 119, 46, 0.2)');
            gradient.addColorStop(1, 'rgba(244, 119, 46, 0.02)');
            return gradient;
          },
          borderWidth: 3,
          borderColor: '#f4772e',
          pointBorderColor: '#f4772e',
          pointBackgroundColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          pointHoverBorderWidth: 2,
          pointRadius: 4,
          pointHoverBackgroundColor: '#f4772e',
          pointHoverBorderColor: '#ffffff',
          data: paidSupplierData.data || [],
          datalabels: {
            display: false,
          },
          label: (paidSupplierData.label || 'Paid Supplier') + ' ',
        },
      ],
    };
    setInvoiceGraphData(data4MultipleData);
  };

  useEffect(() => {
    if (DashboardActions && DashboardActions.getInvoiceGraphData) {
      DashboardActions.getInvoiceGraphData(12)
        .then(action => {
          // Redux Toolkit thunks return action objects
          if (action && action.type && action.type.includes('fulfilled')) {
            getInvoiceGraph(action.payload);
          } else if (action && action.payload) {
            // Handle unwrapped result
            getInvoiceGraph(action.payload);
          }
        })
        .catch(err => {
          console.error('Error loading invoice graph data:', err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Set language before using strings
  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  return (
    <div className="animated fadeIn">
      <Card className="invoice-card card-margin">
        <CardBody className="tab-card">
          <div className="flex-wrapper title-bottom-border">
            <h1
              className="card-h1"
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#1e6eff',
                margin: 0,
                textTransform: 'uppercase',
              }}
            >
              {strings.SupplierCustomerPaidInvoices || 'SUPPLIER & CUSTOMER PAID INVOICES'}
            </h1>
          </div>
          <div className="chart-wrapper" style={{ height: '300px', marginTop: '20px' }}>
            <Line
              data={invoice_graph_data}
              options={data4MultipleOptions}
              datasetKeyProvider={() => Math.random()}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default PaidInvoices;
