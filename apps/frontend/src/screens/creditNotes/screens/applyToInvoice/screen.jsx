import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardBody, Button, Row, Col, Form, FormGroup } from 'reactstrap';
import * as CustomerInvoiceDetailActions from './actions';
import * as CustomerInvoiceActions from '../../actions';
import { Loader, LeavePage, Currency } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import './style.scss';
import dayjs from '@/utils/date';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { BookUser } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const ApplyToInvoice = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [language] = useState(window['localStorage'].getItem('language'));
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [customer_currency] = useState(location.state?.currency || 'AED');
  const [invoice_list, setInvoiceList] = useState([]);
  const [currenttotal, setCurrentTotal] = useState(location.state?.creditAmount || 0);
  const [cannotsave, setCannotSave] = useState(false);
  const [creditNoteNumber, setCreditNoteNumber] = useState(location.state?.creditNoteNumber || '');
  const [creditNoteId, setCreditNoteId] = useState(location.state?.creditNoteId || null);

  useEffect(() => {
    strings.setLanguage(language);
    initializeData();
  }, [language]);

  const initializeData = () => {
    if (location.state && location.state.contactId) {
      dispatch(CustomerInvoiceDetailActions.getInvoicesListForCN(location.state.contactId)).then(
        res => {
          if (res.status === 200) {
            setInvoiceList(res.data);
            setLoading(false);
          }
        }
      );
    } else {
      navigate('/admin/income/credit-notes');
    }
  };

  const handleRowSelectionChange = rows => {
    let total = location.state.creditAmount;
    const updatedInvoices = rows.map(row => {
      let creditTaken = 0;
      if (total > 0) {
        creditTaken = total > row.dueAmount ? row.dueAmount : total;
        total -= creditTaken;
      }
      return { ...row, creditstaken: creditTaken };
    });

    setSelectedRows(updatedInvoices);
    setCurrentTotal(total);
    setCannotSave(total < 0);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'referenceNo',
        header: strings.InvoiceNumber,
      },
      {
        accessorKey: 'date',
        header: strings.InvoiceDate,
        cell: ({ getValue }) => dayjs(getValue()).format('DD-MM-YYYY'),
      },
      {
        accessorKey: 'dueAmount',
        header: strings.InvoiceAmount,
        cell: ({ getValue }) => (
          <div className="text-right">
            <Currency value={getValue()} currencySymbol={customer_currency} />
          </div>
        ),
      },
      {
        accessorKey: 'creditstaken',
        header: strings.CreditUsed || 'Credit Used',
        cell: ({ row }) => {
          const selected = selectedRows.find(r => r.id === row.original.id);
          return (
            <div className="text-right">
              <Currency value={selected?.creditstaken || 0} currencySymbol={customer_currency} />
            </div>
          );
        },
      },
    ],
    [customer_currency, selectedRows]
  );

  const handleSubmit = e => {
    e.preventDefault();
    setDisabled(true);
    const formData = new FormData();
    const ids = selectedRows.map(i => i.id);
    formData.append('invoiceIds', ids);
    formData.append('creditNoteId', creditNoteId);

    dispatch(CustomerInvoiceDetailActions.refundAgainstInvoices(formData))
      .then(res => {
        if (res.status === 200) {
          toast.success('Amount Applied To Invoice Successfully!');
          navigate('/admin/income/credit-notes');
        }
        setDisabled(false);
      })
      .catch(() => {
        setDisabled(false);
        toast.error('Something Went Wrong');
      });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="detail-customer-invoice-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12} className="mx-auto">
            <Card>
              <CardHeader>
                <div className="h4 mb-0 d-flex align-items-center">
                  <BookUser className="h-4 w-4" />
                  <span className="ml-2">
                    {strings.Applycreditsfrom} <u>{creditNoteNumber}</u>
                  </span>
                </div>
              </CardHeader>
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col lg={12} className="h5">
                      <span>
                        {strings.CreditAmount}:{' '}
                        <Currency
                          value={location.state.creditAmount}
                          currencySymbol={customer_currency}
                        />
                      </span>
                    </Col>
                    <Col
                      lg={12}
                      className="mb-1"
                      style={{ fontSize: '12px', color: currenttotal > 0 ? 'Green' : 'red' }}
                    >
                      {strings.RemainingCredittAmount}:{' '}
                      <Currency value={currenttotal} currencySymbol={customer_currency} />
                      <br />
                    </Col>

                    <Col lg={12}>
                      <DataTable
                        data={invoice_list || []}
                        columns={columns}
                        manualPagination={false}
                        rowSelection={true}
                        onRowSelectionChange={handleRowSelectionChange}
                      />
                    </Col>
                  </Row>

                  <Row className="mt-5">
                    <Col lg={12} className="text-right">
                      <Button
                        type="submit"
                        color={selectedRows.length < 1 ? 'secondary' : 'primary'}
                        className="btn-square mr-3"
                        disabled={selectedRows.length < 1 || disabled || cannotsave}
                      >
                        {disabled ? strings.Saving : strings.Save}
                      </Button>
                      <Button
                        color="secondary"
                        className="btn-square"
                        onClick={() => navigate('/admin/income/credit-notes')}
                      >
                        {strings.Cancel}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default connect()(ApplyToInvoice);
