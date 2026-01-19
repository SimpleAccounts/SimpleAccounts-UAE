import { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Row, Col, Card, Table } from 'components/migration';
import * as SupplierInvoiceDetailActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import { useReactToPrint } from 'react-to-print';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { InvoiceTemplate } from './sections';
import { CommonActions } from 'services/global';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Currency, InvoiceViewJournalEntries } from 'components';
import dayjs from '@/utils/date';
import ActionButtons from 'components/view_actions_buttons';
import { StatusActionList } from 'utils';
import { Printer, X } from 'lucide-react';

const mapStateToProps = state => {
  return {
    profile: state.auth.profile,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    supplierInvoiceActions: bindActionCreators(SupplierInvoiceActions, dispatch),
    supplierInvoiceDetailActions: bindActionCreators(SupplierInvoiceDetailActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const strings = new LocalizedStrings(data);

const ViewInvoice = props => {
  const [language] = useState(window.localStorage.getItem('language'));
  const [invoiceData, setInvoiceData] = useState({});
  const [totalNet, setTotalNet] = useState(0);
  const [currencyData, setCurrencyData] = useState({});
  const [invoiceStatus, setInvoiceStatus] = useState('');
  const [id] = useState(props.location?.state?.id);
  const [debitNoteDataList, setDebitNoteDataList] = useState([]);
  const [actionList, setActionList] = useState([]);
  const [contactData, setContactData] = useState({});
  const [companyData, setCompanyData] = useState({});

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

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
    props.supplierInvoiceDetailActions.getCompanyDetails().then(res => {
      if (res.status === 200) {
        setCompanyData(res.data);
      }
    });

    if (props.location.state && props.location.state.id) {
      props.supplierInvoiceDetailActions.getInvoiceById(props.location.state.id).then(res => {
        let val = 0;
        if (res.status === 200) {
          if (
            res.data.invoiceLinedebitNoteDataLists &&
            res.data.invoiceLinedebitNoteDataLists.length !== 0
          )
            res.data.invoiceLinedebitNoteDataLists.map(debitNoteDataList => {
              val = val + debitNoteDataList.subTotal;
              return debitNoteDataList;
            });
          const data = res.data;
          const status = data.status ? (data.status.includes('Due') ? 'Due' : data.status) : '';

          let statusActionList = StatusActionList.SupplierInvoiceStatusActionList;
          if (status && statusActionList && statusActionList.length > 0) {
            const statuslist = statusActionList.find(obj => obj.status === status);
            statusActionList = statuslist ? statuslist.list : [];
          }

          setInvoiceData(res.data);
          setTotalNet(val);
          setInvoiceStatus(status);
          setActionList(statusActionList);

          if (res.data.currencyCode) {
            props.supplierInvoiceActions.getCurrencyList().then(res => {
              if (res.status === 200) {
                const temp = res.data.filter(
                  item => item.currencyCode === invoiceData.currencyCode
                );
                setCurrencyData(temp);
              }
            });
          }
          if (res.data.contactId) {
            props.supplierInvoiceDetailActions.getContactById(res.data.contactId).then(res => {
              if (res.status === 200) {
                setContactData(res.data);
              }
            });
          }
        }
      });

      props.commonActions.getByNoteListByInvoiceId(props.location.state.id).then(res => {
        if (res.status === 200) {
          setDebitNoteDataList(res.data);
        }
      });
    }
  };

  const exportPDFWithComponent = () => {
    pdfExportComponent.current.save();
  };

  const redirectToDebitNote = debiteNote => {
    const commonParams = {
      SUP_id: props.location.state.id,
      SUP_status: props.location.state.status,
      id: debiteNote.creditNoteId,
      isCNWithoutProduct: debiteNote.isCreatedWithoutInvoice,
      status: debiteNote.status,
    };
    if (props.location.state && props.location.state.gotoReports) {
      commonParams.gotoReports = true;
    }
    props.history.push('/admin/expense/debit-notes/view', commonParams);
  };

  strings.setLanguage(language);

  return (
    <div className="view-invoice-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12} className="mx-auto">
            <div className="pull-left">
              <ActionButtons
                id={props.location.state.id}
                history={props.history}
                URL={'/admin/expense/supplier-invoice'}
                invoiceData={invoiceData}
                postingRefType={'INVOICE'}
                initializeData={() => {
                  initializeData();
                }}
                actionList={actionList}
                invoiceStatus={invoiceStatus}
                documentTitle={strings.SupplierInvoice}
                documentCreated={debitNoteDataList && debitNoteDataList.creditNoteId}
              />
            </div>
            <div className="pull-right">
              <Button
                type="button"
                className="ml-1 mb-1 mr-1 print-btn-cont btn-lg"
                onClick={() => handlePrint?.()}
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                className="close-btn mb-1 btn-lg print-btn-cont"
                onClick={() => {
                  if (props.location && props.location.state && props.location.state.gotoReports) {
                    props.history.push(props.location.state.gotoReports);
                  } else if (props.location.state.DN_Id) {
                    props.history.push('/admin/expense/debit-notes/view', {
                      id: props.location.state.DN_Id,
                      status: props.location.state.DN_Status,
                      isCNWithoutProduct: props.location.state.DN_WithoutPRoduct,
                    });
                  } else if (
                    props.location.state &&
                    props.location.state.crossLinked &&
                    props.location.state.crossLinked === true
                  ) {
                    props.history.push('/admin/report/vatreports/vatreturnsubreports', {
                      boxNo: props.location.state.description,
                      description: props.location.state.description,
                      startDate: props.location.state.startDate,
                      endDate: props.location.state.endDate,
                      placeOfSupplyId: props.location.state.placeOfSupplyId,
                    });
                  } else if (
                    props.location &&
                    props.location.state &&
                    props.location.state.gotoDGLReport
                  ) {
                    props.history.push('/admin/report/detailed-general-ledger');
                  } else {
                    props.history.push('/admin/expense/supplier-invoice');
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <InvoiceTemplate
                status={props.location.state?.status}
                invoiceData={invoiceData}
                currencyData={currencyData}
                ref={componentRef}
                totalNet={totalNet}
                companyData={companyData}
                contactData={contactData}
              />
            </div>
          </Col>
        </Row>
        <div style={{ display: debitNoteDataList.creditNoteId ? '' : 'none' }}>
          <strong>{strings.DebitNoteIssuedOnTheSupplierInvoice}</strong>
        </div>
        <Card>
          <div style={{ display: debitNoteDataList.creditNoteId ? '' : 'none' }}>
            <Table>
              <thead style={{ backgroundColor: '#1e6eff', color: 'white' }}>
                <tr>
                  <th className="center" style={{ padding: '0.5rem' }}>
                    #
                  </th>
                  <th style={{ padding: '0.5rem' }}>{strings.DebitNoteNumber}</th>
                  <th style={{ padding: '0.5rem' }}>{strings.DebitNoteDate}</th>
                  <th style={{ padding: '0.5rem' }}>{strings.Status}</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.DebitAmount}</th>
                </tr>
              </thead>
              <tbody className=" table-bordered table-hover">
                <tr
                  onClick={() => {
                    redirectToDebitNote(debitNoteDataList);
                  }}
                >
                  <td className="center">{1}</td>
                  <td style={{ color: 'blue' }}>{debitNoteDataList.creditNoteNumber}</td>
                  <td>
                    {debitNoteDataList.creditNoteDate
                      ? dayjs(debitNoteDataList.creditNoteDate).format('DD-MM-YYYY')
                      : ''}
                  </td>
                  <td align="right">{debitNoteDataList?.status}</td>
                  <td align="right">
                    {debitNoteDataList.totalAmount ? (
                      <Currency
                        value={debitNoteDataList.totalAmount}
                        currencySymbol={currencyData[0] ? currencyData[0].currencyIsoCode : 'AED'}
                      />
                    ) : (
                      '0.00'
                    )}
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card>
        {invoiceStatus && invoiceStatus !== 'Draft' && (
          <InvoiceViewJournalEntries
            history={props.history}
            invoiceURL={'/admin/expense/supplier-invoice/view'}
            invoiceId={id}
            invoiceType={1}
          />
        )}
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewInvoice);
