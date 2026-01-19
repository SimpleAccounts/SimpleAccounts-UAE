import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Row, Col } from 'components/migration';
import * as SupplierInvoiceDetailActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import * as RequestForQuotationDetailsAction from '../detail/actions';
import * as PurchaseOrderDetailsAction from '../detail/actions';
import ReactToPrint from 'react-to-print';

import 'react-datepicker/dist/react-datepicker.css';

import './style.scss';

import './style.scss';
import { RFQTemplate } from './sections';
import * as RequestForQuotationViewAction from '../../../request_for_quotation/screens/view/actions';
import { Card, Table } from 'components/migration';
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
    //commonActions: bindActionCreators(CommonActions, dispatch),
  };
};
let strings = new LocalizedStrings(data);
class ViewPurchaseOrder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window['localStorage'].getItem('language'),
      POData: {},
      PoDataList: {},
      totalNet: 0,
      currencyData: {},
      id: '',
    };

    this.formRef = React.createRef();
    this.termList = [
      { label: 'Net 7', value: 'NET_7' },
      { label: 'Net 10', value: 'NET_10' },
      { label: 'Net 30', value: 'NET_30' },
      { label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
    ];
  }

  componentDidMount = () => {
    this.initializeData();
  };

  initializeData = () => {
    this.props.supplierInvoiceDetailActions.getCompanyDetails().then(res => {
      if (res.status === 200) {
        this.setState({
          companyData: res.data,
        });
      }
    });
    if (this.props.location.state && this.props.location.state.id) {
      this.props.purchaseOrderDetailsAction.getPOById(this.props.location.state.id).then(res => {
        let val = 0;
        if (res.status === 200) {
          if (
            res.data.poQuatationLineItemRequestModelList &&
            res.data.poQuatationLineItemRequestModelList.length != 0
          )
            res.data.poQuatationLineItemRequestModelList.map(item => {
              val = val + item.subTotal;
              return item;
            });
          this.setState(
            {
              POData: res.data,
              totalNet: val,
              id: this.props.location.state.id,
            },
            () => {
              // if (this.state.RFQData.currencyCode) {
              // 	this.props.supplierInvoiceActions
              // 		.getCurrencyList()
              // 		.then((res) => {
              // 			if (res.status === 200) {
              // 				const temp = res.data.filter(
              // 					(item) =>
              // 						item.currencyCode ===
              // 						this.state.invoiceData.currencyCode,
              // 				);
              // 				this.setState({
              // 					currencyData: temp,
              // 				});
              // 			}
              // 		});
              // }
              if (this.state.POData.supplierId) {
                this.props.supplierInvoiceDetailActions
                  .getContactById(this.state.POData.supplierId)
                  .then(res => {
                    if (res.status === 200) {
                      this.setState({
                        contactData: res.data,
                      });
                    }
                  });
              }
            }
          );
        }
      });
      this.props.requestForQuotationViewAction
        .getPoGrnById(this.props.location.state.id)
        .then(res => {
          if (res.status === 200) {
            this.setState(
              {
                PoDataList: res.data,

                id: this.props.location.state.id,
              },
              () => {}
            );
          }
        });
    }
  };

  exportPDFWithComponent = () => {
    this.pdfExportComponent.save();
  };

  render() {
    strings.setLanguage(this.state.language);
    const { POData, currencyData, id, PoDataList, contactData } = this.state;

    const { profile } = this.props;
    return (
      <div className="view-invoice-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <div className="pull-right">
                {/* <Button
									className="btn btn-sm edit-btn"
									onClick={() => {
										this.props.history.push(
											'/admin/revenue/customer-invoice/detail',
											{ id },
										);
									}}
								>
									<Pencil className="h-4 w-4" />
								</Button> */}

                <Button
                  className="btn-lg mb-1 print-btn-cont"
                  onClick={() => {
                    this.exportPDFWithComponent();
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
                  content={() => this.componentRef}
                />
                <Button
                  type="button"
                  className="close-btn mb-1 btn-lg print-btn-cont"
                  style={{ color: 'black' }}
                  onClick={() => {
                    this.props.history.push('/admin/expense/purchase-order');
                  }}
                >
                  X
                </Button>
              </div>
              <div>
                <PDFExport
                  ref={component => (this.pdfExportComponent = component)}
                  scale={0.8}
                  paperSize="A3"
                  fileName={POData.poNumber + '.pdf'}
                >
                  <RFQTemplate
                    POData={POData}
                    currencyData={currencyData}
                    ref={el => (this.componentRef = el)}
                    totalNet={this.state.totalNet}
                    companyData={this.state && this.state.companyData ? this.state.companyData : ''}
                    contactData={this.state.contactData}
                    status={this.props.location.state.status}
                  />
                </div>
              </div>
            </Col>
          </Row>
          <Card>
            <div style={{ display: this.state.PoDataList.length === 0 ? 'none' : '' }}>
              <Table>
                <thead style={{ backgroundColor: '#1e6eff', color: 'white' }}>
                  <tr>
                    <th className="center" style={{ padding: '0.5rem' }}>
                      #
                    </th>
                    {/* <th style={{ padding: '0.5rem' }}>Item</th> */}
                    <th style={{ padding: '0.5rem' }}>{strings.GRNNumber}</th>
                    <th style={{ padding: '0.5rem' }}>{strings.SupplierName}</th>
                    <th style={{ padding: '0.5rem' }}>{strings.Status}</th>
                    <th className="center" style={{ padding: '0.5rem' }}>
                      {strings.ReceiveDate}
                    </th>
                    {/* <th className="center" style={{ padding: '0.5rem' }}>
					Po Expiry Date
				</th> */}
                    {/* <th style={{ padding: '0.5rem', textAlign: 'right' }}>
			    {strings.Total+" "+strings.Amount }
				</th> */}
                    {/* <th style={{ padding: '0.5rem', textAlign: 'left' }}>
				TOTAL VAT Amount
				</th> */}
                  </tr>
                </thead>
                <tbody className=" table-bordered table-hover">
                  {PoDataList &&
                    PoDataList.length &&
                    PoDataList.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td className="center">{index + 1}</td>
                          <td>{item.grnNumber}</td>
                          <td>{item.supplierName}</td>
                          <td>{item.status}</td>
                          <td>{dayjs(item.grnReceiveDate).format('DD MMM YYYY')}</td>
                          {/* <td>{dayjs(item.poReceiveDate).format(
				'DD MMM YYYY',
			)}</td> */}
                          {/* <td align="right">{POData.currencyIsoCode+" "+item.totalAmount}</td> */}
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewPurchaseOrder);
