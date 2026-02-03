import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Row, Col } from 'components/migration';
import * as SupplierInvoiceDetailActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import * as QuotationDetailsAction from '../detail/actions';
import * as PurchaseOrderDetailsAction from '../detail/actions';
import { useReactToPrint } from 'react-to-print';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import RFQTemplate from './sections/invoice_template';
import ActionButtons from 'components/view_actions_buttons';
import { StatusActionList } from 'utils';
import { FileText, Printer } from 'lucide-react';

// Guard against undefined components (e.g. lazy chunk or alias resolution)
const SafeActionButtons = ActionButtons || (() => null);
const SafeRFQTemplate = RFQTemplate || (() => null);

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
  const location = useLocation();
  const navigate = useNavigate();
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
  const quotationId = location?.state?.id;
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
  }, [quotationId]);

  const initializeData = () => {
    props.supplierInvoiceDetailActions.getCompanyDetails().then(res => {
      if (res.status === 200) {
        setCompanyData(res.data);
      }
    });

    if (quotationId) {
      props.quotationDetailsAction.getQuotationById(quotationId).then(res => {
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
    // pdfExportComponent.current.save();
  };

  if (!quotationId) {
    return (
      <div className="view-invoice-screen p-4">
        <p className="text-muted">No quotation selected.</p>
        <Button color="primary" onClick={() => navigate('/admin/income/quotation')}>
          Back to Quotations
        </Button>
      </div>
    );
  }

  return (
    <div className="view-invoice-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12} className="mx-auto">
            <div className="pull-left">
              <SafeActionButtons
                id={quotationId}
                history={{ push: navigate }}
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
              <Button
                type="button"
                className="ml-1 mb-1 mr-1 print-btn-cont btn-lg"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                className="close-btn mb-1 btn-lg print-btn-cont"
                style={{ color: 'black' }}
                onClick={() => {
                  navigate('/admin/income/quotation');
                }}
              >
                X
              </Button>
            </div>
            <div>
              <div ref={pdfExportComponent}>
                <SafeRFQTemplate
                  QuotationData={QuotationData}
                  currencyData={currencyData}
                  ref={componentRef}
                  totalNet={totalNet}
                  companyData={companyData}
                  contactData={contactData}
                />
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewQuotation);
