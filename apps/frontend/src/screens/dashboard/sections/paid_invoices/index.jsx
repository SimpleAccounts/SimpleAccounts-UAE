import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

import './style.scss';

let strings = new LocalizedStrings(data);

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
          backgroundColor: 'rgba(255, 255, 255, 0)',
          borderCapStyle: 'round',
          borderDash: [],
          borderWidth: 4,
          borderColor: '#4191ff',
          borderDashOffset: 0.0,
          borderJoinStyle: 'round',
          pointBorderColor: '#4191ff',
          pointBackgroundColor: '#ffffff',
          pointBorderWidth: 3,
          pointHoverRadius: 6,
          pointHoverBorderWidth: 3,
          pointRadius: 4,
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#4191ff',
          data: paidCustomerData.data || [],
          datalabels: {
            display: false,
          },
          label: (paidCustomerData.label || 'Paid Customer') + ' ',
        },
        {
          backgroundColor: 'rgba(255, 255, 255, 0)',
          borderCapStyle: 'round',
          borderDash: [],
          borderWidth: 4,
          borderColor: '#f4772e',
          borderDashOffset: 0.0,
          borderJoinStyle: 'round',
          pointBorderColor: '#f4772e',
          pointBackgroundColor: '#ffffff',
          pointBorderWidth: 3,
          pointHoverRadius: 6,
          pointHoverBorderWidth: 3,
          pointRadius: 4,
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#f4772e',
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
      DashboardActions.getInvoiceGraphData(12).then(action => {
        // Redux Toolkit thunks return action objects
        if (action && action.type && action.type.includes('fulfilled')) {
          getInvoiceGraph(action.payload);
        } else if (action && action.payload) {
          // Handle unwrapped result
          getInvoiceGraph(action.payload);
        }
      }).catch(err => {
        console.error('Error loading invoice graph data:', err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const data4MultipleOptions = {
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
    scales: {
      y: {
        ticks: {
          display: true,
        },
        beginAtZero: true,
        grid: {
          display: true,
          color: '#eeeff8',
          drawBorder: true,
        },
      },
      x: {
        ticks: {
          display: true,
        },
        beginAtZero: true,
        grid: {
          display: true,
          color: '#eeeff8',
          drawBorder: true,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Set language before using strings
  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  return (
    <div className="animated fadeIn mb-6">
      <Card className="invoice-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold" style={{ color: '#2064d8' }}>
            {strings.SupplierCustomerPaidInvoices || 'Paid Invoices'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="chart-wrapper" style={{ height: '300px' }}>
            <Line data={invoice_graph_data} options={data4MultipleOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaidInvoices;
