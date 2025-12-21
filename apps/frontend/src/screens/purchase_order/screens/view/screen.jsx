import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Row, Col, Card, Table } from 'reactstrap';
import * as SupplierInvoiceDetailActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import * as RequestForQuotationDetailsAction from '../detail/actions';
import * as PurchaseOrderDetailsAction from '../detail/actions';
import ReactToPrint from 'react-to-print';

import 'react-datepicker/dist/react-datepicker.css';

import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';

import { RFQTemplate } from './sections';
import * as RequestForQuotationViewAction from '../../../request_for_quotation/screens/view/actions';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { FileText, Printer } from 'lucide-react';

const mapStateToProps = state => {
  return {
    profile: state.auth.profile,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    supplierInvoiceActions: bindActionCreators(SupplierInvoiceActions, dispatch),
    supplierInvoiceDetailActions: bindActionCreators(SupplierInvoiceDetailActions, dispatch),
    requestForQuotationDetailsAction: bindActionCreators(
      RequestForQuotationDetailsAction,
      dispatch
    ),
    purchaseOrderDetailsAction: bindActionCreators(PurchaseOrderDetailsAction, dispatch),
    requestForQuotationViewAction: bindActionCreators(RequestForQuotationViewAction, dispatch),
  };
};

let strings = new LocalizedStrings(data);

const ViewPurchaseOrder = ({
  supplierInvoiceActions,
  supplierInvoiceDetailActions,
  requestForQuotationDetailsAction,
  purchaseOrderDetailsAction,
  requestForQuotationViewAction,
  profile,
  history,
  location,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [POData, setPOData] = useState({});
  const [PoDataList, setPoDataList] = useState([]);
  const [totalNet, setTotalNet] = useState(0);
  const [currencyData, setCurrencyData] = useState({});
  const [id, setId] = useState('');
  const [companyData, setCompanyData] = useState(null);
  const [contactData, setContactData] = useState(null);

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
  }, []);

  const initializeData = () => {
    supplierInvoiceDetailActions.getCompanyDetails().then(res => {
      if (res.status === 200) {
        setCompanyData(res.data);
      }
    });

    if (location.state && location.state.id) {
      purchaseOrderDetailsAction.getPOById(location.state.id).then(res => {
        let val = 0;
        if (res.status === 200) {
          if (
            res.data.poQuatationLineItemRequestModelList &&
            res.data.poQuatationLineItemRequestModelList.length !== 0
          ) {
            res.data.poQuatationLineItemRequestModelList.forEach(item => {
              val = val + item.subTotal;
            });
          }
          setPOData(res.data);
          setTotalNet(val);
          setId(location.state.id);

          if (res.data.supplierId) {
            supplierInvoiceDetailActions.getContactById(res.data.supplierId).then(contactRes => {
              if (contactRes.status === 200) {
                setContactData(contactRes.data);
              }
            });
          }
        }
      });

      requestForQuotationViewAction.getPoGrnById(location.state.id).then(res => {
        if (res.status === 200) {
          setPoDataList(res.data);
          setId(location.state.id);
        }
      });
    }
  };

  const exportPDFWithComponent = () => {
    if (pdfExportComponent.current) {
      pdfExportComponent.current.save();
    }
  };

  strings.setLanguage(language);

  return (
    <div className="view-invoice-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12} className="mx-auto">
            <div className="pull-right">
              <Button className="btn-lg mb-1 print-btn-cont" onClick={exportPDFWithComponent}>
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
                style={{ color: 'black' }}
                onClick={() => {
                  history.push('/admin/expense/purchase-order');
                }}
              >
                X
              </Button>
            </div>
            <div>
              <PDFExport
                ref={pdfExportComponent}
                scale={0.8}
                paperSize="A3"
                fileName={POData.poNumber + '.pdf'}
              >
                <RFQTemplate
                  POData={POData}
                  currencyData={currencyData}
                  ref={componentRef}
                  totalNet={totalNet}
                  companyData={companyData || ''}
                  contactData={contactData}
                  status={location.state?.status}
                />
              </PDFExport>
            </div>
          </Col>
        </Row>
        <Card>
          <div style={{ display: PoDataList.length === 0 ? 'none' : '' }}>
            <Table>
              <thead style={{ backgroundColor: '#2064d8', color: 'white' }}>
                <tr>
                  <th className="center" style={{ padding: '0.5rem' }}>
                    #
                  </th>
                  <th style={{ padding: '0.5rem' }}>{strings.GRNNumber}</th>
                  <th style={{ padding: '0.5rem' }}>{strings.SupplierName}</th>
                  <th style={{ padding: '0.5rem' }}>{strings.Status}</th>
                  <th className="center" style={{ padding: '0.5rem' }}>
                    {strings.ReceiveDate}
                  </th>
                </tr>
              </thead>
              <tbody className="table-bordered table-hover">
                {PoDataList &&
                  PoDataList.length > 0 &&
                  PoDataList.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td className="center">{index + 1}</td>
                        <td>{item.grnNumber}</td>
                        <td>{item.supplierName}</td>
                        <td>{item.status}</td>
                        <td>{dayjs(item.grnReceiveDate).format('DD MMM YYYY')}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewPurchaseOrder);
