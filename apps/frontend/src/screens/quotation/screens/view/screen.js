import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Row, Col } from 'reactstrap';
import * as SupplierInvoiceDetailActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import * as QuotationDetailsAction from '../detail/actions';
import * as PurchaseOrderDetailsAction from '../detail/actions';
import ReactToPrint from 'react-to-print';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import './style.scss';
import { RFQTemplate } from './sections';
import { data } from '../../../Language/index'

import ActionButtons from 'components/view_actions_buttons';
import { StatusActionList } from 'utils';

const mapStateToProps = (state) => {
	return {
		profile: state.auth.profile,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		supplierInvoiceActions: bindActionCreators(
			SupplierInvoiceActions,
			dispatch,
		),
		supplierInvoiceDetailActions: bindActionCreators(
			SupplierInvoiceDetailActions,
			dispatch,
		),
		quotationDetailsAction: bindActionCreators(
			QuotationDetailsAction,
			dispatch,
		),
		purchaseOrderDetailsAction: bindActionCreators(
			PurchaseOrderDetailsAction,
			dispatch,
		)
		//commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class ViewQuotation extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			QuotationData: {},
			totalNet: 0,
			currencyData: {},
			invoiceData: {},
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
    this.props.supplierInvoiceDetailActions
        .getCompanyDetails()
        .then((res) => {
            if (res.status === 200) {
                this.setState({
                    companyData: res.data,
                });
            }
        });

    if (this.props.location.state && this.props.location.state.id) {
        this.props.quotationDetailsAction
            .getQuotationById(this.props.location.state.id)
            .then((res) => {
                if (res.status === 200) {
                    const invoiceData = res.data;
                    const invoiceStatus = invoiceData.status ?? '';
                    var actionList = StatusActionList.QuotationStatusActionList;
                    if (invoiceStatus && actionList && actionList.length > 0) {
                        const statuslist = actionList.find(obj => obj.status === invoiceStatus);
                        actionList = statuslist ? statuslist.list : [];
                    }

                    this.setState({
						QuotationData:res.data,
                        invoiceData: invoiceData,
                        invoiceStatus: invoiceStatus,
                        actionList: actionList,
                    }, () => {
                        if (this.state.QuotationData.customerId) {
                            this.props.supplierInvoiceDetailActions
                                .getContactById(this.state.QuotationData.customerId)
                                .then((res) => {
                                    if (res.status === 200) {
                                        this.setState({
                                            contactData: res.data,
                                        });
                                    }
                                });
                        }
                    });
                }
            });
    }
};

	exportPDFWithComponent = () => {
		this.pdfExportComponent.save();
	};

	render() {
		const { QuotationData, currencyData, id, contactData,actionList,invoiceStatus,invoiceData } = this.state;

		const { profile } = this.props;
		return (
			<div className="view-invoice-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
						<div className='pull-left'>
								<ActionButtons
									id={this.props.location.state.id}
									history={this.props.history}
									URL={'/admin/income/quotation'}
									invoiceData={invoiceData}
									postingRefType={'QUOTATION'}
									initializeData={() => {
										this.initializeData();
									}}
									actionList={actionList}
									invoiceStatus={invoiceStatus}
									documentTitle={"Quotation"}
									documentCreated={false} // Any Further document against this document is created(e.g.  CN,DN,CI,...)
								/>
							</div>
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
									<i className="fa fa-pencil"></i>
								</Button> */}
								
										<Button
									className="btn-lg mb-1 print-btn-cont"
									onClick={() => {
										this.exportPDFWithComponent();
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
									content={() => this.componentRef}
								/>
										<Button
											type="button"
											className="close-btn mb-1 btn-lg print-btn-cont"
											style={{color: "black"}}
											onClick={() => {
												this.props.history.push('/admin/income/quotation');
											}}
										>
										X
										</Button>
							</div>
							<div>
								<PDFExport
									ref={(component) => (this.pdfExportComponent = component)}
									scale={0.8}
									paperSize="A3"
									fileName={QuotationData.quotationNumber + ".pdf"}
								>
									<RFQTemplate
										QuotationData={QuotationData}
										currencyData={currencyData}
										
										ref={(el) => (this.componentRef = el)}
										totalNet={this.state.totalNet}
										companyData={this.state && this.state.companyData ?this.state.companyData:''}
										contactData={this.state.contactData}
									/>
								</PDFExport>
							</div>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewQuotation);
