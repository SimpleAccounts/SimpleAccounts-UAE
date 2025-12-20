import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Row, Col, Table, Card } from 'reactstrap';
import * as DebitNoteViewActions from './actions';
import * as DebitNoteActions from '../../actions';
import ReactToPrint from 'react-to-print';
import { CommonActions } from 'services/global';
import { Currency, InvoiceViewJournalEntries } from 'components';
import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import { DebitNoteTemplate } from './sections';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import ActionButtons from 'components/view_actions_buttons';
import { StatusActionList } from 'utils';

const mapStateToProps = state => {
  return {
    profile: state.auth.profile,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    debitNoteActions: bindActionCreators(DebitNoteActions, dispatch),
    debitNoteViewActions: bindActionCreators(DebitNoteViewActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

let strings = new LocalizedStrings(data);

const ViewDebitNote = props => {
  const { history, location, debitNoteActions, debitNoteViewActions, commonActions, profile } =
    props;

  // State
  const [language] = useState(window['localStorage'].getItem('language'));
  const [debitNoteDataList, setDebitNoteDataList] = useState([]);
  const [applyToInvoiceData, setApplyToInvoiceData] = useState([]);
  const [debitNoteData, setDebitNoteData] = useState({});
  const [totalNet, setTotalNet] = useState(0);
  const [invoiceStatus, setInvoiceStatus] = useState('');
  const [currencyData, setCurrencyData] = useState({});
  const [id, setId] = useState(location?.state?.id);
  const [isCNWithoutProduct, setIsCNWithoutProduct] = useState(location?.state?.isCNWithoutProduct);
  const [companyData, setCompanyData] = useState(null);
  const [contactData, setContactData] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [actionList, setActionList] = useState([]);

  const componentRef = useRef();
  const pdfExportComponent = useRef();

  // Initialize data
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    commonActions.getCompanyDetails().then(action => {
      // Redux Toolkit thunks return action objects
      if (action && action.type && action.type.includes('fulfilled')) {
        setCompanyData(action.payload);
      }
    });

    if (location.state && location.state.id) {
      debitNoteActions
        .getDebitNoteById(location.state.id, location.state.isCNWithoutProduct)
        .then(res => {
          let val = 0;
          if (res.status === 200) {
            res.data.invoiceLineItems &&
              res.data.invoiceLineItems.forEach(item => {
                val = val + item.subTotal;
              });

            const invoiceDataTemp = res.data;
            const invoiceStatusTemp =
              invoiceDataTemp.status === 'Partially Paid'
                ? 'Partially Debited'
                : invoiceDataTemp.status;
            let actionListTemp = StatusActionList.DebitNoteStatusActionList;

            if (invoiceStatusTemp && actionListTemp && actionListTemp.length > 0) {
              const statuslist = actionListTemp.find(obj => obj.status === invoiceStatusTemp);
              actionListTemp = statuslist ? statuslist.list : [];
            }

            setDebitNoteData(res.data);
            setTotalNet(val);
            setId(location.state.id);
            setInvoiceData(res.data);
            setInvoiceStatus(invoiceStatusTemp);
            setActionList(actionListTemp);

            // Get currency data
            if (res.data.currencyCode) {
              debitNoteActions.getCurrencyList().then(currencyRes => {
                if (currencyRes.status === 200) {
                  const temp = currencyRes.data.filter(
                    item => item.currencyCode === res.data.currencyCode
                  );
                  setCurrencyData(temp);
                }
              });
            }

            // Get contact data
            if (res.data.contactId) {
              debitNoteViewActions.getContactById(res.data.contactId).then(contactRes => {
                if (contactRes.status === 200) {
                  setContactData(contactRes.data);
                }
              });
            }
          }
        });

      debitNoteViewActions.getInvoicesForCNById(location.state.id).then(res => {
        if (res.status === 200) {
          setDebitNoteDataList(res.data);
          setId(location.state.id);
        }
      });

      debitNoteViewActions.getAppliedToInvoiceDetails(location.state.id).then(res => {
        if (res.status === 200) {
          setApplyToInvoiceData(res.data);
          setId(location.state.id);
        }
      });
    }
  };

  const redirectToSupplierIncoive = invoice => {
    if (!(invoice.transactionType && invoice.transactionType === 'Refund')) {
      const commonParams = {
        id: invoice.invoiceId,
        status: invoice.status,
        DN_Id: location.state.id,
        DN_WithoutPRoduct: location.state.isCNWithoutProduct,
        DN_Status: location.state.status,
      };
      if (location.state && location.state.gotoReports) {
        commonParams.gotoReports = true;
      }
      history.push('/admin/expense/supplier-invoice/view', commonParams);
    }
  };

  const exportPDFWithComponent = () => {
    pdfExportComponent.current.save();
  };

  strings.setLanguage(language);

  const uniquedebitNoteData = {};
  const filtereddebitNoteData = [];

  return (
    <div className="view-invoice-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12} className="mx-auto">
            <div className="pull-left">
              <ActionButtons
                id={location.state.id}
                history={history}
                URL={'/admin/expense/debit-notes'}
                invoiceData={invoiceData}
                postingRefType={'DEBIT_NOTE'}
                initializeData={() => {
                  initializeData();
                }}
                actionList={actionList}
                invoiceStatus={invoiceStatus}
                isCNWithoutProduct={isCNWithoutProduct}
                documentTitle={strings.DebitNote}
                documentCreated={false}
              />
            </div>
            <div className="pull-right">
              <Button
                className="btn-lg mb-1 print-btn-cont"
                onClick={() => {
                  exportPDFWithComponent();
                }}
              >
                <i className="fa fa-file-pdf-o"></i>
              </Button>
              <ReactToPrint
                trigger={() => (
                  <Button type="button" className="ml-1 mb-1 mr-1 print-btn-cont btn-lg">
                    <i className="fa fa-print"></i>
                  </Button>
                )}
                content={() => componentRef.current}
              />
              <Button
                type="button"
                className="close-btn mb-1 btn-lg print-btn-cont"
                onClick={() => {
                  if (location && location.state && location.state.gotoReports)
                    history.push('/admin/report/debit-note-details');
                  else if (location.state.SUP_id)
                    history.push('/admin/expense/supplier-invoice/view', {
                      id: location.state.SUP_id,
                      status: location.state.SUP_status,
                    });
                  else history.push('/admin/expense/debit-notes');
                }}
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>
            <div>
              <PDFExport
                ref={pdfExportComponent}
                scale={0.8}
                paperSize="A3"
                fileName={debitNoteData.creditNoteNumber + '.pdf'}
              >
                <DebitNoteTemplate
                  debitNoteData={debitNoteData}
                  currencyData={currencyData}
                  status={location.state.status}
                  ref={componentRef}
                  totalNet={totalNet}
                  companyData={companyData ? companyData : ''}
                  contactData={contactData}
                  isCNWithoutProduct={
                    location.state.isCNWithoutProduct && location.state.isCNWithoutProduct == true
                      ? true
                      : false
                  }
                />
              </PDFExport>
            </div>
          </Col>
        </Row>
        <div style={{ display: debitNoteDataList.length === 0 ? 'none' : '' }}>
          <strong>{strings.DebitNoteIssuedOnTheSupplierInvoice}</strong>
        </div>

        <Card>
          <div style={{ display: debitNoteDataList.length === 0 ? 'none' : '' }}>
            <Table>
              <thead style={{ backgroundColor: '#2064d8', color: 'white' }}>
                <tr>
                  <th className="center" style={{ padding: '0.5rem' }}>
                    #
                  </th>
                  <th style={{ padding: '0.5rem' }}>{strings.InvoiceNumber}</th>
                  <th style={{ padding: '0.5rem' }}>{strings.SupplierName}</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>
                    {strings.Total + ' ' + strings.Amount}
                  </th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>
                    {strings.TotalVat + ' ' + strings.Amount}
                  </th>
                </tr>
              </thead>
              <tbody className=" table-bordered table-hover">
                {debitNoteDataList &&
                  (debitNoteDataList.length
                    ? (debitNoteDataList.forEach(item => {
                        if (!uniquedebitNoteData[item.invoiceNumber]) {
                          uniquedebitNoteData[item.invoiceNumber] = item;
                          filtereddebitNoteData.push(item);
                        }
                      }),
                      filtereddebitNoteData.map((item, index) => {
                        return (
                          <tr
                            key={index}
                            onClick={() => {
                              redirectToSupplierIncoive(item);
                            }}
                          >
                            <td className="center">{index + 1}</td>
                            <td style={{ color: 'blue' }}>{item.invoiceNumber}</td>
                            <td>{item.contactName}</td>
                            <td align="right">
                              {item.totalAmount ? (
                                <Currency
                                  value={item.totalAmount}
                                  currencySymbol={
                                    currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                                  }
                                />
                              ) : (
                                0
                              )}
                            </td>
                            <td align="right">
                              {currencyData?.currencyIsoCode} AED{' '}
                              {item.totalVatAmount.toLocaleString(navigator.language, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        );
                      }))
                    : null)}
              </tbody>
            </Table>
          </div>
        </Card>
        <div style={{ display: applyToInvoiceData?.length === 0 ? 'none' : '' }}>
          <strong>{strings.DebitNoteAmountUsedSummary}</strong>
        </div>

        <Card>
          <div style={{ display: applyToInvoiceData?.length === 0 ? 'none' : '' }}>
            <Table>
              <thead style={{ backgroundColor: '#2064d8', color: 'white' }}>
                <tr>
                  <th className="center" style={{ padding: '0.5rem' }}>
                    #
                  </th>
                  <th style={{ padding: '0.5rem' }}>{strings.TransactionType}</th>
                  <th style={{ padding: '0.5rem' }}>{strings.InvoiceNumber}</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.Amount}</th>
                </tr>
              </thead>
              <tbody className=" table-bordered table-hover">
                {applyToInvoiceData &&
                  applyToInvoiceData.length &&
                  applyToInvoiceData.map((item, index) => {
                    return (
                      <tr
                        key={index}
                        onClick={() => {
                          redirectToSupplierIncoive(item);
                        }}
                      >
                        <td className="center">{index + 1}</td>
                        <td>{item.transactionType}</td>
                        <td>{item.invoiceNumber}</td>
                        <td align="right">
                          {item.totalAmount ? (
                            <Currency
                              value={item.totalAmount}
                              currencySymbol={
                                currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                              }
                            />
                          ) : (
                            0
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </div>
        </Card>
        {invoiceStatus && invoiceStatus !== 'Draft' && (
          <InvoiceViewJournalEntries
            history={history}
            invoiceURL={'/admin/expense/debit-notes/view'}
            invoiceId={id}
            invoiceType={5}
            isCNWithoutProduct={isCNWithoutProduct}
          />
        )}
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewDebitNote);
