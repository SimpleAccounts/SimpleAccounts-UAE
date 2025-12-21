import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import * as SupplierInvoiceDetailActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import ReactToPrint from 'react-to-print';
import { CommonActions } from 'services/global';
import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import { InvoiceTemplate } from './sections';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Currency, InvoiceViewJournalEntries } from 'components';
import ActionButtons from 'components/view_actions_buttons';
import { StatusActionList } from 'utils';
import dayjs from '@/utils/date';
import { FileText, Printer, X } from 'lucide-react';

const strings = new LocalizedStrings(data);

const ViewCustomerInvoice = props => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Create history-like object for compatibility with components expecting React Router v5 API
  const history = {
    push: (path, state) => {
      if (state) {
        navigate(path, { state });
      } else {
        navigate(path);
      }
    },
  };

  const supplierInvoiceActions = useMemo(
    () => bindActionCreators(SupplierInvoiceActions, dispatch),
    [dispatch]
  );
  const supplierInvoiceDetailActions = useMemo(
    () => bindActionCreators(SupplierInvoiceDetailActions, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);
  const [language] = useState(window.localStorage.getItem('language'));
  const [invoiceData, setInvoiceData] = useState({});
  const [isBillingAndShippingAddressSame, setIsBillingAndShippingAddressSame] = useState(false);
  const [totalNet, setTotalNet] = useState(0);
  const [currencyData, setCurrencyData] = useState({});
  const [invoiceStatus, setInvoiceStatus] = useState('');
  const [id] = useState(location?.state?.id);
  const [creditNoteDataList, setCreditNoteDataList] = useState([]);
  const [actionList, setActionList] = useState([]);
  const [contactData, setContactData] = useState({});
  const [companyData, setCompanyData] = useState({});

  const pdfExportComponent = useRef(null);
  const componentRef = useRef(null);

  const termList = [
    { label: 'Net 7', value: 'NET_7' },
    { label: 'Net 10', value: 'NET_10' },
    { label: 'Net 30', value: 'NET_30' },
    { label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
  ];

  useEffect(() => {
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeData = () => {
    supplierInvoiceDetailActions.getCompanyDetails().then(res => {
      if (res.status === 200) {
        setCompanyData(res.data);
      }
    });

    if (location?.state?.id) {
      supplierInvoiceDetailActions.getInvoiceById(location.state.id).then(res => {
        let val = 0;
        if (!location?.state?.contactId)
          supplierInvoiceDetailActions.getContactById(res.data.contactId).then(res => {
            if (res.status === 200) {
              setContactData(res.data);
              setIsBillingAndShippingAddressSame(res.data.isBillingAndShippingAddressSame);
            }
          });
        const status = res.data.status
          ? res.data.status.includes('Due')
            ? 'Due'
            : res.data.status
          : '';
        let statusActionList = StatusActionList.InvoiceStatusActionList;
        if (status && statusActionList && statusActionList.length > 0) {
          const statuslist = statusActionList.find(obj => obj.status === status);
          statusActionList = statuslist ? statuslist.list : [];
        }

        setInvoiceData(res.data);
        setInvoiceStatus(status);
        setActionList(statusActionList);

        if (res.data.contactId) {
          supplierInvoiceDetailActions.getContactById(res.data.contactId).then(res => {
            if (res.status === 200) {
              setContactData(res.data);
              setIsBillingAndShippingAddressSame(res.data.isBillingAndShippingAddressSame);
            }
          });
        }

        if (res.status === 200) {
          res.data.invoiceLineItems &&
            res.data.invoiceLineItems.map(item => {
              val = val + item.subTotal;
              return item;
            });

          setTotalNet(val);

          if (res.data.currencyCode) {
            supplierInvoiceActions.getCurrencyList().then(res => {
              if (res.status === 200) {
                const temp = res.data.filter(
                  item => item.currencyCode === invoiceData.currencyCode
                );
                setCurrencyData(temp);
              }
            });
          }
        }
      });

      if (location?.state?.contactId)
        supplierInvoiceDetailActions.getContactById(location.state.contactId).then(res => {
          if (res.status === 200) {
            setContactData(res.data);
            setIsBillingAndShippingAddressSame(res.data.isBillingAndShippingAddressSame);
          }
        });

      if (location?.state?.id) {
        commonActions.getByNoteListByInvoiceId(location.state.id).then(res => {
          if (res.status === 200) {
            setCreditNoteDataList(res.data);
          }
        });
      }
    }
  };

  const exportPDFWithComponent = () => {
    pdfExportComponent.current.save();
  };

  const redirectToCreditNote = creditNote => {
    const commonParams = {
      CI_id: location?.state?.id,
      CI_status: location?.state?.status,
      CI_contactId: location?.state?.contactId,
      id: creditNote.creditNoteId,
      isCNWithoutProduct: creditNote.isCreatedWithoutInvoice,
      status: creditNote.status,
    };
    if (location?.state?.gotoReports) {
      commonParams.gotoReports = true;
    }
    navigate('/admin/income/credit-notes/view', { state: commonParams });
  };

  strings.setLanguage(language);

  return (
    <div className="view-invoice-screen">
      <div className="animated fadeIn">
        <div className="w-full max-w-7xl mx-auto">
          <div className="pull-left">
            <ActionButtons
              id={id}
              history={history}
              URL={'/admin/income/customer-invoice'}
              invoiceData={invoiceData}
              postingRefType={'INVOICE'}
              initializeData={() => {
                initializeData();
              }}
              actionList={actionList}
              invoiceStatus={invoiceStatus}
              documentTitle={strings.CustomerInvoice}
              documentCreated={creditNoteDataList && creditNoteDataList.creditNoteId}
            />
          </div>
          <div className="pull-right">
            <Button
              className="btn-lg mb-1 print-btn-cont"
              onClick={() => {
                exportPDFWithComponent();
              }}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <ReactToPrint
              trigger={() => (
                <Button type="button" className="ml-1 mb-1 mr-1 print-btn-cont btn-lg">
                  <Printer className="h-4 w-4" />
                </Button>
              )}
              content={() => componentRef.current}
            />
            <Button
              type="button"
              className="close-btn mb-1 btn-lg print-btn-cont"
              onClick={() => {
                if (location?.state?.gotoReports) {
                  navigate(location.state.gotoReports);
                } else if (location?.state?.TCN_Id) {
                  navigate('/admin/income/credit-notes/view', {
                    state: {
                      id: location.state.TCN_Id,
                      status: location.state.TCN_Status,
                      isCNWithoutProduct: location.state.TCN_WithoutPRoduct,
                    },
                  });
                } else if (location?.state?.crossLinked === true) {
                  navigate('/admin/report/vatreports/vatreturnsubreports', {
                    state: {
                      boxNo: location.state.description,
                      description: location.state.description,
                      startDate: location.state.startDate,
                      endDate: location.state.endDate,
                      placeOfSupplyId: location.state.placeOfSupplyId,
                    },
                  });
                } else if (location?.state?.gotoDGLReport) {
                  navigate('/admin/report/detailed-general-ledger');
                } else {
                  navigate('/admin/income/customer-invoice');
                }
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <PDFExport
              ref={pdfExportComponent}
              scale={0.8}
              paperSize="A3"
              fileName={invoiceData.referenceNumber + '.pdf'}
            >
              <InvoiceTemplate
                invoiceData={invoiceData}
                contactData={contactData}
                isBillingAndShippingAddressSame={isBillingAndShippingAddressSame}
                status={location?.state?.status}
                currencyData={currencyData}
                ref={componentRef}
                totalNet={totalNet}
                companyData={companyData}
              />
            </PDFExport>
          </div>
        </div>
        <div style={{ display: creditNoteDataList.creditNoteId ? '' : 'none' }}>
          <strong>{strings.CreditNoteIssuedonCustomerInvoice}</strong>
        </div>
        <Card>
          <CardContent className="p-0">
            <div style={{ display: creditNoteDataList.creditNoteId ? '' : 'none' }}>
              <Table>
                <TableHeader style={{ backgroundColor: '#2064d8', color: 'white' }}>
                  <TableRow>
                    <TableHead className="text-center" style={{ padding: '0.5rem' }}>
                      #
                    </TableHead>
                    <TableHead style={{ padding: '0.5rem' }}>{strings.CreditNoteNumber}</TableHead>
                    <TableHead style={{ padding: '0.5rem' }}>{strings.CreditNoteDate}</TableHead>
                    <TableHead style={{ padding: '0.5rem' }}>{strings.Status}</TableHead>
                    <TableHead style={{ padding: '0.5rem', textAlign: 'right' }}>
                      {strings.CreditAmount}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      redirectToCreditNote(creditNoteDataList);
                    }}
                  >
                    <TableCell className="text-center">{1}</TableCell>
                    <TableCell style={{ color: 'blue' }}>
                      {creditNoteDataList.creditNoteNumber}
                    </TableCell>
                    <TableCell>
                      {creditNoteDataList.creditNoteDate
                        ? dayjs(creditNoteDataList.creditNoteDate).format('DD-MM-YYYY')
                        : ''}
                    </TableCell>
                    <TableCell className="text-right">{creditNoteDataList?.status}</TableCell>
                    <TableCell className="text-right">
                      {creditNoteDataList.totalAmount ? (
                        <Currency
                          value={creditNoteDataList.totalAmount}
                          currencySymbol={currencyData[0] ? currencyData[0].currencyIsoCode : 'AED'}
                        />
                      ) : (
                        '0.00'
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <div>
          {invoiceStatus && invoiceStatus !== 'Draft' && (
            <InvoiceViewJournalEntries
              history={history}
              invoiceURL={'/admin/income/customer-invoice/view'}
              invoiceId={id}
              invoiceType={2}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewCustomerInvoice;
