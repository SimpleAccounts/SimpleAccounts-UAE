import React, { useState, useEffect, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Row, Col } from 'components/migration';
import { Currency } from 'components';
import * as JournalActions from './actions';
import dayjs from '@/utils/date';
import { data as languageData } from 'screens/Language/index';
import LocalizedStrings from 'react-localization';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const InvoiceViewJournalEntries = ({
  invoiceId,
  invoiceType,
  history,
  id,
  invoiceURL,
  isCNWithoutProduct,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getList = listData => {
    if (!listData) return [];
    return listData.map(item => ({
      journalDate: item.journalDate ?? '',
      createdByName: item.createdByName,
      description: item.description,
      journalLineItems: item.journalLineItems,
      journalTransactionCategoryLabel: item.journalTransactionCategoryLabel,
      postingReferenceTypeDisplayName: item.postingReferenceTypeDisplayName,
      journalReferenceNo: item.journalReferenceNo,
      postingReferenceType: item.postingReferenceType,
      subTotalCreditAmount: item.subTotalCreditAmount,
      subTotalDebitAmount: item.subTotalDebitAmount,
      totalCreditAmount: item.totalCreditAmount,
      totalDebitAmount: item.totalDebitAmount,
      journalId: item.journalId,
    }));
  };

  const invoice_journal_list = useSelector(state =>
    getList(state.invoice_view_journal.invoice_journal_list)
  );

  const [language] = useState(window['localStorage'].getItem('language'));

  useEffect(() => {
    strings.setLanguage(language);
    initializeData();
  }, [language]);

  const initializeData = () => {
    const postData = {
      invoiceType: invoiceType,
      invoiceId: invoiceId,
    };
    dispatch(JournalActions.getJournalList(postData));
  };

  const goToDetail = row => {
    navigate('/admin/accountant/journal/view', {
      state: {
        id: row.journalId,
        renderId: id ? id : invoiceId,
        renderURL: invoiceURL,
        renderCN: isCNWithoutProduct,
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'journalReferenceNo',
        header: strings.JOURNALREFERENCENO,
        cell: ({ getValue }) => <span className="text-blue-600">{getValue()}</span>,
      },
      {
        accessorKey: 'postingReferenceTypeDisplayName',
        header: strings.TRANSACTIONTYPE,
      },
      {
        accessorKey: 'journalDate',
        header: strings.POSTDATE,
        cell: ({ getValue }) => (getValue() ? dayjs(getValue()).format('DD-MM-YYYY') : ''),
      },
      {
        accessorKey: 'description',
        header: strings.NOTES,
      },
      {
        accessorKey: 'journalLineItems',
        header: strings.ACCOUNT,
        cell: ({ getValue }) => (
          <ul className="list-none p-0 m-0">
            {getValue()?.map((item, idx) => (
              <li key={idx} className="pb-1">
                {item.transactionCategoryName}
              </li>
            ))}
          </ul>
        ),
      },
      {
        id: 'debitAmount',
        header: strings.DEBITAMOUNT,
        cell: ({ row }) => (
          <ul className="list-none p-0 m-0 text-right">
            {row.original.journalLineItems?.map((item, idx) => (
              <li key={idx} className="pb-1">
                <Currency value={item.debitAmount?.toFixed(6)} />
              </li>
            ))}
          </ul>
        ),
      },
      {
        id: 'creditAmount',
        header: strings.CREDITAMOUNT,
        cell: ({ row }) => (
          <ul className="list-none p-0 m-0 text-right">
            {row.original.journalLineItems?.map((item, idx) => (
              <li key={idx} className="pb-1">
                <Currency value={item.creditAmount?.toFixed(6)} />
              </li>
            ))}
          </ul>
        ),
      },
    ],
    []
  );

  return (
    <div className="journal-screen animated fadeIn">
      <Card>
        <CardHeader>
          <div className="h4 mb-0 d-flex align-items-center">
            <BookOpen className="h-5 w-5" />
            <span className="ml-2">{strings.Journal}</span>
          </div>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={12}>
              <DataTable
                data={invoice_journal_list || []}
                columns={columns}
                manualPagination={false}
                onRowClick={goToDetail}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default InvoiceViewJournalEntries;
