import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Row, Col, Table, Card } from 'reactstrap';
import * as SupplierInvoiceDetailActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import ReactToPrint from 'react-to-print';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { Currency, InvoiceViewJournalEntries } from 'components';
import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import './style.scss';
import { CreditNoteTemplate } from './sections';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import ActionButtons from 'components/view_actions_buttons';
import { StatusActionList } from 'utils';

const mapStateToProps = (state) => {
	return {
		profile: state.auth.profile,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		supplierInvoiceActions: bindActionCreators(SupplierInvoiceActions, dispatch),
		supplierInvoiceDetailActions: bindActionCreators(SupplierInvoiceDetailActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};
let strings = new LocalizedStrings(data);
class ViewCreditNote extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			InvoiceDataList: [],
			applyToInvoiceData: [],
			isBillingAndShippingAddressSame: false,
			invoiceData: {},
			totalNet: 0,
			currencyData: {},
			id: this.props.location?.state?.id,
			isCNWithoutProduct: this.props?.location?.state?.isCNWithoutProduct
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

					this.setState(
						{
							companyData: res.data,
						},

					);
				}
			});
		if (this.props.location.state && this.props.location.state.id) {

			// if(this.props.location.state.isCNWithoutProduct === true)
			this.props.supplierInvoiceDetailActions
				.getCreditNoteById(this.props.location.state.id, this.props.location.state.isCNWithoutProduct)
				.then((res) => {
					let val = 0;
					if (res.status === 200) {
						const invoiceData = res.data;
						const invoiceStatus = invoiceData.status ? invoiceData.status === 'Partially Paid' ? 'Partially Credited' : invoiceData.status : '';
						var actionList = StatusActionList.CreditNoteStatusActionList;
						res.data.invoiceLineItems &&
						res.data.invoiceLineItems.map((item) => {
							val = val + item.subTotal;
							return item;
						});
						if (invoiceStatus && actionList && actionList.length > 0) {
							const statuslist = actionList.find(obj => obj.status === invoiceStatus);
							actionList = statuslist ? statuslist?.list : [];
						}
						this.setState({
							invoiceData: res.data,
							invoiceStatus: invoiceStatus,
							actionList: actionList,
							totalNet: val,
						},
							() => {
								if (this.state.invoiceData.currencyCode) {
									this.props.supplierInvoiceActions
										.getCurrencyList()
										.then((res) => {
											if (res.status === 200) {
												const temp = res.data.filter(
													(item) =>
														item.currencyCode ===
														this.state.invoiceData.currencyCode,
												);
												this.setState({
													currencyData: temp,
												});
											}
										});
								}
								if (this.state.invoiceData.contactId) {
									this.props.supplierInvoiceDetailActions
										.getContactById(this.state.invoiceData.contactId)
										.then((res) => {
											if (res.status === 200) {
												this.setState({
													contactData: res.data,
												});
											}
										});
								}
							},
						);
					}
				});

			this.props.supplierInvoiceDetailActions
				.getInvoicesForCNById(this.props.location.state.id)
				.then((res) => {

					if (res.status === 200) {
						this.setState(
							{
								InvoiceDataList: res.data,

								id: this.props.location.state.id,
							},
							() => {

							},
						);
					}
				})
			this.props.supplierInvoiceDetailActions
				.getAppliedToInvoiceDetails(this.props.location.state.id)
				.then((res) => {

					if (res.status === 200) {
						this.setState(
							{
								applyToInvoiceData: res.data,

								id: this.props.location.state.id,
							},
							() => {

							},
						);
					}
				})

		}
	};

	redirectToCustmerIncoive = (invoice) => {
		if (!(invoice.transactionType && invoice.transactionType === 'Refund'))
			this.props.history.push('/admin/income/customer-invoice/view', {
				id: invoice.invoiceId,
				status: invoice.status,
				contactId: invoice.contactId,
				TCN_Id: this.props.location.state.id,
				TCN_WithoutPRoduct: this.props.location.state.isCNWithoutProduct,
				TCN_Status: this.props.location.state.status,
			});
	}

	exportPDFWithComponent = () => {
		this.pdfExportComponent.save();
	};

	render() {
		strings.setLanguage(this.state.language);
		const { invoiceData, currencyData, InvoiceDataList, isBillingAndShippingAddressSame, contactData, id, actionList, invoiceStatus, isCNWithoutProduct} = this.state;
		const { profile } = this.props;
		const uniqueInvoiceData = {};
		const filteredInvoiceData = [];
		return (
			<div className="view-invoice-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
						<div className='pull-left'>
                        
						<ActionButtons
									id={this.props.location.state.id}
									history={this.props.history}
									URL={'/admin/income/credit-notes'}
									invoiceData={invoiceData}
									postingRefType={'CREDIT_NOTE'}
									initializeData={() => {
										this.initializeData();
									}}
									actionList={actionList}
									invoiceStatus={invoiceStatus}
									documentTitle={strings.TaxCreditNote}
									isCNWithoutProduct={isCNWithoutProduct}
									documentCreated={false} // Any Further document against this document is created(e.g. CN,DN,CI,...)
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
									onClick={() => {
										if (this.props.location && this.props.location.state && this.props.location.state.gotoReports)
											this.props.history.push(this.props.location.state.gotoReports);
										else if (this.props.location.state.CI_id)
											this.props.history.push('/admin/income/customer-invoice/view', {
												id: this.props.location.state.CI_id,
												status: this.props.location.state.CI_status,
												contactId: this.props.location.state.CI_contactId
											})
										else
											this.props.history.push('/admin/income/credit-notes');

									}}
								>
									<i className="fas fa-times"></i>
								</Button>
							</div>
							<div>
								<PDFExport
									ref={(component) => (this.pdfExportComponent = component)}
									scale={0.8}
									paperSize="A3"
									fileName={this.state.invoiceData.creditNoteNumber + ".pdf"}
								>

									<CreditNoteTemplate
										invoiceData={invoiceData}
										currencyData={currencyData}
										status={this.props.location.state.status}
										isBillingAndShippingAddressSame={isBillingAndShippingAddressSame}
										ref={(el) => (this.componentRef = el)}
										totalNet={this.state.totalNet}
										companyData={this.state && this.state.companyData ? this.state.companyData : ''}
										contactData={contactData}
										isCNWithoutProduct={this.props.location.state.isCNWithoutProduct && this.props.location.state.isCNWithoutProduct == true ? true : false}
									/>
								</PDFExport>
							</div>
						</Col>
					</Row>
					<div style={{ display: this.state.InvoiceDataList?.length === 0 ? 'none' : '' }}><strong>{strings.CreditNoteIssuedonCustomerInvoice}</strong></div>

					<Card>
						<div style={{ display: this.state.InvoiceDataList?.length === 0 ? 'none' : '' }} >
							<Table  >
								<thead style={{ backgroundColor: '#2064d8', color: 'white' }}>
									<tr>
										<th className="center" style={{ padding: '0.5rem' }}>
											#
										</th>
										{/* <th style={{ padding: '0.5rem' }}>Item</th> */}
										<th style={{ padding: '0.5rem' }}>{strings.InvoiceNumber}</th>
										<th style={{ padding: '0.5rem' }}>{strings.CustomerName}</th>
										{/* <th className="center" style={{ padding: '0.5rem' }}>
											Invoice Date
										</th>
										<th className="center" style={{ padding: '0.5rem' }}>
										Invoice Due Date
										</th> */}
										<th style={{ padding: '0.5rem', textAlign: 'right' }}>
											{strings.Total + " " + strings.Amount}
										</th>
										<th style={{ padding: '0.5rem', textAlign: 'right' }}>
											{strings.TotalVat + " " + strings.Amount}
										</th>

									</tr>
								</thead>
								<tbody className=" table-bordered table-hover">
									{InvoiceDataList &&
										(InvoiceDataList.length ? (
											InvoiceDataList.map((item) => {
												if (!uniqueInvoiceData[item.invoiceNumber]) {
													uniqueInvoiceData[item.invoiceNumber] = item;
													filteredInvoiceData.push(item);
												}
											}),
											filteredInvoiceData.map((item, index) => {
												return (
													<tr key={index} onClick={() => {
														this.redirectToCustmerIncoive(item);
													}}>
														<td className="center">{index + 1}</td>
														<td style={{color:'blue'}}>{item.invoiceNumber}</td>
														<td>{item.contactName}</td>
														<td align="right">{item.totalAmount ? <Currency
															value={item.totalAmount}
															currencySymbol={
																currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'USD'
															}
														/> : 0}</td>
														<td align="right">{currencyData?.currencyIsoCode} AED {item.totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
													</tr>
												);
											})) : null)}
								</tbody>
							</Table>
						</div>
					</Card>
					<div style={{ display: this.state.applyToInvoiceData?.length === 0 ? 'none' : '' }}><strong>{strings.CreditNoteAmountUsedSummary}</strong></div>

					<Card>
						<div style={{ display: this.state.applyToInvoiceData?.length === 0 ? 'none' : '' }} >
							<Table  >
								<thead style={{ backgroundColor: '#2064d8', color: 'white' }}>
									<tr>
										<th className="center" style={{ padding: '0.5rem' }}>
											#
										</th>
										<th style={{ padding: '0.5rem' }}>{strings.TransactionType}</th>
										<th style={{ padding: '0.5rem' }}>{strings.InvoiceNumber}</th>
										<th style={{ padding: '0.5rem', textAlign: 'right' }}>
											{strings.Amount}
										</th>

									</tr>
								</thead>
								<tbody className=" table-bordered table-hover">
									{this.state.applyToInvoiceData &&
										this.state.applyToInvoiceData.length && (
											this.state.applyToInvoiceData.map((item, index) => {
												return (
													<tr key={index} onClick={() => {
														this.redirectToCustmerIncoive(item);
													}}>
														<td className="center">{index + 1}</td>
														<td>{item.transactionType}</td>
														<td>{item.invoiceNumber}</td>
														<td align="right">{item.totalAmount ? <Currency
															value={item.totalAmount}
															currencySymbol={
																currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'USD'
															}
														/> : 0}</td>
													</tr>
												);
											}))}
								</tbody>
							</Table>
						</div>
					</Card>
					{invoiceStatus && invoiceStatus !== 'Draft' &&
						<InvoiceViewJournalEntries
							history={this.props.history}
							invoiceURL={'/admin/income/credit-notes/view'}
							invoiceId={id}
							invoiceType={4}
							isCNWithoutProduct={isCNWithoutProduct}
						/>
					}

				</div>
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(ViewCreditNote);
