import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Row, Col, Table, Card } from 'reactstrap';
import * as DebitNoteViewActions from './actions';
import * as DebitNoteActions from '../../actions';
import ReactToPrint from 'react-to-print';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { Currency, InvoiceViewJournalEntries } from 'components';
import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import './style.scss';
import { DebitNoteTemplate } from './sections';
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
		debitNoteActions: bindActionCreators(DebitNoteActions, dispatch,),
		debitNoteViewActions: bindActionCreators(DebitNoteViewActions, dispatch,),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};
let strings = new LocalizedStrings(data);
class ViewDebitNote extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			debitNoteDataList: [],
			applyToInvoiceData: [],
			debitNoteData: {},
			totalNet: 0,
			invoiceStatus: '',
			currencyData: {},
			id: this.props.location?.state?.id,
			isCNWithoutProduct: this.props?.location?.state?.isCNWithoutProduct
		};
		this.formRef = React.createRef();
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		this.props.commonActions.getCompanyDetails().then((res) => {
			if (res.status === 200) {

				this.setState({ companyData: res.data, });
			}
		});
		if (this.props.location.state && this.props.location.state.id) {
			this.props.debitNoteActions
				.getDebitNoteById(this.props.location.state.id, this.props.location.state.isCNWithoutProduct)
				.then((res) => {
					let val = 0;
					if (res.status === 200) {
						res.data.invoiceLineItems &&
							res.data.invoiceLineItems.map((item) => {
								val = val + item.subTotal;
								return item;
							});
							const invoiceData = res.data;
							const invoiceStatus = invoiceData.status === 'Partially Paid' ? 'Partially Debited' : invoiceData.status;
							var actionList = StatusActionList.DebitNoteStatusActionList;
							if (invoiceStatus && actionList && actionList.length > 0) {
								const statuslist = actionList.find(obj => obj.status === invoiceStatus);
								actionList = statuslist ? statuslist.list : [];
							}
						this.setState(
							{
								debitNoteData: res.data,
								totalNet: val,
								id: this.props.location.state.id,
								invoiceData: res.data,
						invoiceStatus: invoiceStatus,
						actionList: actionList,
							},
							() => {
								if (this.state.debitNoteData.currencyCode) {
									this.props.debitNoteActions
										.getCurrencyList()
										.then((res) => {
											if (res.status === 200) {
												const temp = res.data.filter(
													(item) =>
														item.currencyCode ===
														this.state.debitNoteData.currencyCode,
												);
												this.setState({
													currencyData: temp,
												});
											}
										});
								}
								if (this.state.debitNoteData.contactId) {
									this.props.debitNoteViewActions
										.getContactById(this.state.debitNoteData.contactId)
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

			this.props.debitNoteViewActions
				.getInvoicesForCNById(this.props.location.state.id)
				.then((res) => {

					if (res.status === 200) {
						this.setState(
							{
								debitNoteDataList: res.data,

								id: this.props.location.state.id,
							},
							() => {

							},
						);
					}
				})
			this.props.debitNoteViewActions
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
	redirectToSupplierIncoive = (invoice) => {
		if (!(invoice.transactionType && invoice.transactionType === 'Refund'))	{
			const commonParams = {
				id: invoice.invoiceId,
				status: invoice.status,
				DN_Id: this.props.location.state.id,
				DN_WithoutPRoduct: this.props.location.state.isCNWithoutProduct,
				DN_Status: this.props.location.state.status,
			}
			if (this.props.location.state && this.props.location.state.gotoReports) {
				commonParams.gotoReports = true;
			}
			// this.props.history.push('/admin/expense/debit-notes/view', commonParams)
			this.props.history.push('/admin/expense/supplier-invoice/view', commonParams)
		}
	}
	exportPDFWithComponent = () => {
		this.pdfExportComponent.save();
	};
	render() {
		strings.setLanguage(this.state.language);
		const { debitNoteData, currencyData,   invoiceData, debitNoteDataList, contactData, invoiceStatus, id, actionList, isCNWithoutProduct} = this.state;
		const { profile } = this.props;
		const uniquedebitNoteData = {};
		const filtereddebitNoteData = [];
		return (
			<div className="view-invoice-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
						<div className="pull-left">
								<ActionButtons
									id={this.props.location.state.id}
									history={this.props.history}
									URL={'/admin/expense/debit-notes'}
									invoiceData={invoiceData}
									postingRefType={'DEBIT_NOTE'}
									initializeData={() => {
										this.initializeData();
									}}
									actionList={actionList}
									invoiceStatus={invoiceStatus}
									isCNWithoutProduct={isCNWithoutProduct}
									documentTitle={strings.DebitNote}
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

									onClick={() => {

										if (this.props.location && this.props.location.state && this.props.location.state.gotoReports)
											this.props.history.push('/admin/report/debit-note-details')


										// else if (this.props.location && this.props.location.state && this.props.location.state.gotoReports)
										// 	this.props.history.push('/admin/report/debit-note-details');
										else if (this.props.location.state.SUP_id)
											this.props.history.push('/admin/expense/supplier-invoice/view', {
												id: this.props.location.state.SUP_id,
												status: this.props.location.state.SUP_status,
											})
										else
											this.props.history.push('/admin/expense/debit-notes');
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
									fileName={this.state.debitNoteData.creditNoteNumber + ".pdf"}
								>

									<DebitNoteTemplate
										debitNoteData={debitNoteData}
										currencyData={currencyData}
										status={this.props.location.state.status}
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
					<div style={{ display: this.state.debitNoteDataList.length === 0 ? 'none' : '' }}><strong>{strings.DebitNoteIssuedOnTheSupplierInvoice}</strong></div>

					<Card>

						<div style={{ display: this.state.debitNoteDataList.length === 0 ? 'none' : '' }} >
							<Table  >
								<thead style={{ backgroundColor: '#2064d8', color: 'white' }}>
									<tr>
										<th className="center" style={{ padding: '0.5rem' }}>
											#
										</th>
										{/* <th style={{ padding: '0.5rem' }}>Item</th> */}
										<th style={{ padding: '0.5rem' }}>{strings.InvoiceNumber}</th>
										<th style={{ padding: '0.5rem' }}>{strings.SupplierName}</th>

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
									{debitNoteDataList &&
										(debitNoteDataList.length ? (
											debitNoteDataList.map((item) => {
												if (!uniquedebitNoteData[item.invoiceNumber]) {
													uniquedebitNoteData[item.invoiceNumber] = item;
													filtereddebitNoteData.push(item);
												}
											}),
											filtereddebitNoteData.map((item, index) => {
												return (
													<tr key={index} onClick={() => {
														this.redirectToSupplierIncoive(item);
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
					<div style={{ display: this.state.applyToInvoiceData?.length === 0 ? 'none' : '' }}><strong>{strings.DebitNoteAmountUsedSummary}</strong></div>

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
														this.redirectToSupplierIncoive(item);
													}}>
														<td className="center">{index + 1}</td>
														<td>{item.transactionType}</td>
														<td>{item.invoiceNumber}</td>
														<td align="right">{item.totalAmount ? <Currency
															value={ item.totalAmount}
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
							invoiceURL={'/admin/expense/debit-notes/view'}
							invoiceId={id}
							invoiceType={5}
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
)(ViewDebitNote);
