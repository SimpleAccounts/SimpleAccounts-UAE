import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Row, Col } from 'reactstrap';
import * as SupplierInvoiceDetailActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import * as QuotationDetailsAction from '../detail/actions';
import * as PurchaseOrderDetailsAction from '../detail/actions';
import ReactToPrint from 'react-to-print';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import { RFQTemplate } from './sections';
import ActionButtons from 'components/view_actions_buttons';
import { StatusActionList } from 'utils';
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
    quotationDetailsAction: bindActionCreators(QuotationDetailsAction, dispatch),
    purchaseOrderDetailsAction: bindActionCreators(PurchaseOrderDetailsAction, dispatch),
  };
};

const ViewQuotation = props => {
  const [QuotationData, setQuotationData] = useState({});
  const [totalNet, setTotalNet] = useState(0);
  const [currencyData, setCurrencyData] = useState({});
  const [invoiceData, setInvoiceData] = useState({});
  const [id, setId] = useState('');
  const [contactData, setContactData] = useState({});
  const [companyData, setCompanyData] = useState({});
  const [invoiceStatus, setInvoiceStatus] = useState('');
  const [actionList, setActionList] = useState([]);

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
    props.supplierInvoiceDetailActions.getCompanyDetails().then(res => {
      if (res.status === 200) {
        setCompanyData(res.data);
      }
    });

    if (props.location.state && props.location.state.id) {
      props.quotationDetailsAction.getQuotationById(props.location.state.id).then(res => {
        if (res.status === 200) {
          const data = res.data;
          const status = data.status ?? '';
          let statusActionList = StatusActionList.QuotationStatusActionList;
          if (status && statusActionList && statusActionList.length > 0) {
            const statuslist = statusActionList.find(obj => obj.status === status);
            statusActionList = statuslist ? statuslist.list : [];
          }

          setQuotationData(res.data);
          setInvoiceData(data);
          setInvoiceStatus(status);
          setActionList(statusActionList);

          if (res.data.customerId) {
            props.supplierInvoiceDetailActions.getContactById(res.data.customerId).then(res => {
              if (res.status === 200) {
                setContactData(res.data);
              }
            });
          }
        }
      });
    }
  };

  const exportPDFWithComponent = () => {
    pdfExportComponent.current.save();
  };

  return (
    <div className="view-invoice-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12} className="mx-auto">
            <div className="pull-left">
              <ActionButtons
                id={props.location.state.id}
                history={props.history}
                URL={'/admin/income/quotation'}
                invoiceData={invoiceData}
                postingRefType={'QUOTATION'}
                initializeData={() => {
                  initializeData();
                }}
                actionList={actionList}
                invoiceStatus={invoiceStatus}
                documentTitle={'Quotation'}
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
                  props.history.push('/admin/income/quotation');
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
                fileName={QuotationData.quotationNumber + '.pdf'}
              >
                <RFQTemplate
                  QuotationData={QuotationData}
                  currencyData={currencyData}
                  ref={componentRef}
                  totalNet={totalNet}
                  companyData={companyData}
                  contactData={contactData}
                />
              </PDFExport>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewQuotation);
