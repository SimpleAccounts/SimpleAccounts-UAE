import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Row, Col } from 'reactstrap';
import * as SupplierInvoiceDetailActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import * as RequestForQuotationDetailsAction from '../detail/actions';
import ReactToPrint from 'react-to-print';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import { RFQTemplate } from './sections';
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
  };
};

const ViewGoodsReceivedNote = props => {
  const [RFQData, setRFQData] = useState({});
  const [totalNet, setTotalNet] = useState(0);
  const [currencyData, setCurrencyData] = useState({});
  const [id, setId] = useState('');
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
    props.supplierInvoiceDetailActions.getCompanyDetails().then(res => {
      if (res.status === 200) {
        setCompanyData(res.data);
      }
    });

    if (props.location.state && props.location.state.id) {
      props.requestForQuotationDetailsAction.getGRNById(props.location.state.id).then(res => {
        let val = 0;
        if (res.status === 200) {
          res.data.poQuatationLineItemRequestModelList.map(item => {
            val = val + item.subTotal;
            return item;
          });
          setRFQData(res.data);
          setTotalNet(val);
          setId(props.location.state.id);

          if (res.data.supplierId) {
            props.supplierInvoiceDetailActions.getContactById(res.data.supplierId).then(res => {
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
                  props.history.push('/admin/expense/goods-received-note');
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
                fileName={RFQData.grnNumber + '.pdf'}
              >
                <RFQTemplate
                  RFQData={RFQData}
                  currencyData={currencyData}
                  ref={componentRef}
                  totalNet={totalNet}
                  companyData={companyData}
                  contactData={contactData}
                  status={props.location.state?.status}
                />
              </PDFExport>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewGoodsReceivedNote);
