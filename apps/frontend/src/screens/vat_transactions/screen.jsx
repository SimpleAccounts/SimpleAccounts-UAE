import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ArrowLeftRight, Download } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';

import { Loader, Currency } from 'components';

import * as VatTransactionActions from './actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Modern VAT Transactions Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function VatTransactions() {
  const dispatch = useDispatch();

  // Redux state
  const vat_transaction_list = useSelector(state => state.vat_transactions.vat_transaction_list);
  const universal_currency_list = useSelector(state => state.common.universal_currency_list);

  // Actions
  const vatTransactionActions = useMemo(
    () => bindActionCreators(VatTransactionActions, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Initialize data
  const initializeData = useCallback(() => {
    const paginationData = {
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    const sortingData = {
      order: sorting[0]?.desc ? 'desc' : sorting[0]?.id ? 'asc' : '',
      sortingCol: sorting[0]?.id || '',
    };
    const postData = { ...paginationData, ...sortingData };

    vatTransactionActions
      .vatTransactionList(postData)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  }, [vatTransactionActions, commonActions, pagination, sorting]);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Get currency symbol
  const getCurrencySymbol = () => {
    return universal_currency_list?.[0]?.currencyIsoCode || 'USD';
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'customerName',
        header: strings.CustomerName || 'Customer Name',
        cell: ({ row }) => <span className="font-medium">{row.original.customerName || '-'}</span>,
      },
      {
        accessorKey: 'countryName',
        header: strings.Country || 'Country',
      },
      {
        accessorKey: 'invoiceDate',
        header: strings.InvoiceDate || 'Invoice Date',
      },
      {
        accessorKey: 'invoiceNumber',
        header: strings.InvoiceNumber || 'Invoice Number',
      },
      {
        accessorKey: 'taxRegistrationNo',
        header: strings.TaxRegistrationNumber || 'Tax Registration Number',
      },
      {
        accessorKey: 'referenceType',
        header: `${strings.Reference || 'Reference'} ${strings.Type || 'Type'}`,
      },
      {
        accessorKey: 'vatType',
        header: `${strings.VAT || 'VAT'} ${strings.Type || 'Type'}`,
      },
      {
        accessorKey: 'amount',
        header: strings.Amount || 'Amount',
        cell: ({ row }) => (
          <div className="text-right">
            <Currency value={row.original.amount || 0} currencySymbol={getCurrencySymbol()} />
          </div>
        ),
      },
      {
        accessorKey: 'vatAmount',
        header: strings.VatAmount || 'VAT Amount',
        cell: ({ row }) => (
          <div className="text-right">
            <Currency value={row.original.vatAmount || 0} currencySymbol={getCurrencySymbol()} />
          </div>
        ),
      },
    ],
    [universal_currency_list]
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!vat_transaction_list?.data) return [];
    return vat_transaction_list.data.map(item => ({
      journalId: item.journalId,
      customerName: item.customerName || '',
      countryName: item.countryName || '',
      invoiceDate: item.invoiceDate || '',
      invoiceNumber: item.invoiceNumber || '',
      taxRegistrationNo: item.taxRegistrationNo || '',
      referenceType: item.referenceType || '',
      vatType: item.vatType || '',
      amount: item.amount || 0,
      vatAmount: item.vatAmount || 0,
    }));
  }, [vat_transaction_list]);

  // Export to CSV
  const handleExport = () => {
    // CSV export logic would go here
    commonActions.tostifyAlert('info', 'Export functionality');
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="vat-transactions-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowLeftRight className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">
                  {strings.VAT || 'VAT'} {strings.Transaction || 'Transaction'}
                </CardTitle>
              </div>
              <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                {strings.Export || 'Export'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={tableData}
              manualPagination
              pageCount={Math.ceil((vat_transaction_list?.count || 0) / pagination.pageSize)}
              onPaginationChange={setPagination}
              pagination={pagination}
              manualSorting
              onSortingChange={setSorting}
              sorting={sorting}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default VatTransactions;
