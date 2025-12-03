import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	Input,
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Formik, Field } from 'formik';
import * as CustomerInvoiceDetailActions from './actions';
import * as ProductActions from '../../../product/actions';
import * as CustomerInvoiceActions from '../../actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import { Loader, LeavePage ,Currency} from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import './style.scss';
import moment from 'moment';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { L } from 'react-ladda/dist/constants';

let strings = new LocalizedStrings(data);
const mapStateToProps = (state) => {
	return {
		project_list: state.customer_invoice.project_list,
		contact_list: state.customer_invoice.contact_list,
		currency_list: state.customer_invoice.currency_list,
		vat_list: state.customer_invoice.vat_list,
		product_list: state.customer_invoice.product_list,
		customer_list: state.customer_invoice.customer_list,
		country_list: state.customer_invoice.country_list,
		universal_currency_list: state.common.universal_currency_list,
		currency_convert_list: state.common.currency_convert_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
		customerInvoiceActions: bindActionCreators(
			CustomerInvoiceActions,
			dispatch,
		),
		customerInvoiceDetailActions: bindActionCreators(
			CustomerInvoiceDetailActions,
			dispatch,
		),
		productActions: bindActionCreators(ProductActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};
const customStyles = {
	control: (base, state) => ({
		...base,
		borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
		boxShadow: state.isFocused ? null : null,
		'&:hover': {
			borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
		},
	}),
};

class ApplyToInvoice extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			selectedRows: [],
			loading: true,
			dialog: false,
			disabled: false,
			discountOptions: [
				{ value: 'FIXED', label: 'Fixed' },
				{ value: 'PERCENTAGE', label: 'Percentage' },
			],
			discount_option: '',
			data: [],
			current_customer_id: null,
			initValue: {},
			contactType: 2,
			openCustomerModal: false,
			openProductModal: false,
			selectedContact: '',
			term: '',
			placeOfSupplyId: '',
			selectedType: '',
			discountPercentage: '',
			discountAmount: 0,
			fileName: '',
			basecurrency: [],
			customer_currency: this.props.location.state.currency,
			invoice_list: [],
			currenttotal: 0,
			disableLeavePage: false,
			selectedrowsdata: []
		};

		this.options = {
			onRowClick: this.goToDetail,
			paginationPosition: 'bottom',
			page: 1,
			sizePerPage: 10,
			onSizePerPageList: this.onSizePerPageList,
			onPageChange: this.onPageChange,
			sortName: '',
			sortOrder: '',
			onSortChange: this.sortColumn,
		};

		this.selectRowProp = {
			mode: 'checkbox',
			bgColor: 'rgba(0,0,0, 0.05)',
			clickToSelect: false,
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll
		}

		// this.options = {
		//   paginationPosition: 'top'
		// }
		this.formRef = React.createRef();
		this.termList = [
			{ label: 'Net 7 Days', value: 'NET_7' },
			{ label: 'Net 10 Days', value: 'NET_10' },
			{ label: 'Net 30 Days', value: 'NET_30' },
			{ label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
		];
		this.placelist = [
			{ label: 'Abu Dhabi', value: '1' },
			{ label: 'Dubai', value: '2' },
			{ label: 'Sharjah', value: '3' },
			{ label: 'Ajman', value: '4' },
			{ label: 'Umm Al Quwain', value: '5' },
			{ label: 'Ras al-Khaimah', value: '6' },
			{ label: 'Fujairah', value: '7' },
		];
		this.regEx = /^[0-9\b]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

		this.file_size = 1024000;
		this.supported_format = [
			'image/png',
			'image/jpeg',
			'text/plain',
			'application/pdf',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		];
	}

	componentDidMount = () => {
		this.initializeData();
	};
	componentWillUnmount = () => {
		this.setState({
			selectedRows: [],
		});
	};

	initializeData = () => {

		if (this.props.location.state && this.props.location.state.contactId) {
			this.props.customerInvoiceDetailActions
				.getInvoicesListForCN(this.props.location.state.contactId)
				.then((res) => {
					if (res.status === 200) {

						this.setState(
							{
								invoice_list: res.data,
								invoice_number: this.props.location.state.referenceNumber,
								creditNoteId: this.props.location.state.creditNoteId,
								creditNoteNumber: this.props.location.state.creditNoteNumber,

								discountAmount: res.data.discount ? res.data.discount : 0,
								discountPercentage: res.data.discountPercentage
									? res.data.discountPercentage
									: '',
								data: res.data.invoiceLineItems
									? res.data.invoiceLineItems
									: [],
								selectedContact: res.data.contactId ? res.data.contactId : '',
								term: res.data.term ? res.data.term : '',
								placeOfSupplyId: res.data.placeOfSupplyId ? res.data.placeOfSupplyId : '',
								loading: false,
								currenttotal: this.props.location.state.creditAmount,
								cannotsave: false
							},
							() => {
								if (this.state.data.length > 0) {
									this.calTotalNet(this.state.data);
									const { data } = this.state;
									const idCount =
										data.length > 0
											? Math.max.apply(
												Math,
												data.map((item) => {
													return item.id;
												}),
											)
											: 0;
									this.setState({
										idCount,
									});
								} else {
									this.setState({
										idCount: 0,
									});
								}
							},
						);
					}
				});
		} else {
			this.props.history.push('/admin/income/credit-notes');
		}
	};
	renderDate = (cell, rows) => {
		return moment(rows.date).format('DD-MM-YYYY');
	};
	renderCredittaken = (cell, row, extraData) => {
		return (
			<div>
				<label>
					<Currency
						value={row.creditstaken}
						currencySymbol={this.state.customer_currency}
					/>
				</label>
			</div>
		);
	};
	renderInvoiceDueAmount = (cell, row, extraData) => {
		return (
			<div>
				<label>
					<Currency
						value={row.dueAmount}
						currencySymbol={this.state.customer_currency}
					/>
				</label>
			</div>
		);
	};
	renderAmount = (value) => {
		console.log(this.state.customer_currency)
		return (
			<Currency
						value={value}
						currencySymbol={this.state.customer_currency}
					/>
		);
	}

	applyInvoice = (row, selectedrowsdata, selectedRows, currenttotal) => {
		let tempList = selectedRows;
		let crtotal
		tempList.push(row);
		if (currenttotal > 0) {
			crtotal = currenttotal - row.dueAmount
			row['creditstaken'] = crtotal > 0 ? row.dueAmount : currenttotal
			// this.setState({
			// 	currenttotal: crtotal > 0 ? crtotal : 0,
			// 	cannotsave: false,
			// 	selectedrowsdata: [...this.state.selectedrowsdata, { ...row }]
			// })
			selectedrowsdata.push(row);
			const list = {
				selectedRows: tempList,
				currenttotal: crtotal > 0 ? crtotal : 0,
				cannotsave: false,
				selectedrowsdata: selectedrowsdata,
			}
			return list;
		} else {
			const list = {
				selectedRows: tempList,
				cannotsave: true,
			}
			return list;
		}
	}
	onRowSelect = (row, isSelected, e) => {
		var { selectedrowsdata, selectedRows, invoice_list, currenttotal } = this.state;
		if (isSelected) {
			var list = []
			list = this.applyInvoice(row, selectedrowsdata, selectedRows, currenttotal);
			this.setState({
				selectedRows: list.selectedRows,
				currenttotal: list.currenttotal ? list.currenttotal : 0,
				cannotsave: list.cannotsave,
				selectedrowsdata: list.selectedrowsdata ? list.selectedrowsdata : selectedrowsdata,
			});
		} else {
			var list = []
			if (row?.creditstaken) {
				let remaining = currenttotal + row?.creditstaken;
				currenttotal = remaining > 0 ? remaining : 0;
			}
			selectedrowsdata = selectedrowsdata.filter((obj) => obj.id !== row.id)
			selectedRows = selectedRows.filter((value) => value.id !== row.id)
			var selectedRowwithNocredit = selectedRows.filter(obj => !(obj?.creditstaken > 0))
			if (selectedRowwithNocredit && selectedRowwithNocredit.length > 0) {
				selectedRowwithNocredit.map(obj => {
					selectedRows = selectedRows.filter((value) => value.id !== obj.id)
					list = this.applyInvoice(obj, selectedrowsdata ? selectedrowsdata : [], selectedRows, currenttotal);
					selectedrowsdata = list.selectedrowsdata ? list.selectedrowsdata : selectedrowsdata;
					selectedRows = list.selectedRows ? list.selectedRows : selectedRows;
					currenttotal = list.currenttotal ? list.currenttotal : 0;
				})
			}
			invoice_list.map((obj) => {
				if (obj.id === row.id) {
					obj.creditstaken = 0
				}
				return obj
			});
			this.setState({
				selectedRows: list.selectedRows ? list.selectedRows : selectedRows,
				currenttotal: currenttotal,
				cannotsave: list.cannotsave ? list.cannotsave : false,
				selectedrowsdata: list.selectedrowsdata ? list.selectedrowsdata : selectedrowsdata,
			});
		}
	}




	onSelectAll = (isSelected, rows) => {
		var { invoice_list, currenttotal, cannotsave } = this.state;
		var selectedrowsdata = [];
		var selectedRows = [];
		if (isSelected) {
			currenttotal = this.props.location.state.creditAmount;
			rows && rows.map((row) => {
				var list = []
				list = this.applyInvoice(row, selectedrowsdata, selectedRows, currenttotal);
				selectedRows = list.selectedRows ? list.selectedRows : selectedRows;
				currenttotal = list.currenttotal && list.currenttotal >= 0 ? list.currenttotal : 0;
				cannotsave = list.cannotsave ? list.cannotsave : false;
				selectedrowsdata = list.selectedrowsdata ? list.selectedrowsdata : selectedrowsdata;
			})
			this.setState({
				selectedRows: selectedRows,
				currenttotal: currenttotal,
				cannotsave: cannotsave,
				selectedrowsdata: selectedrowsdata,
			});
		} else {
			invoice_list.map((obj) => {
				obj.creditstaken = 0;
				return obj
			});

			this.setState({
				selectedRows: [],
				currenttotal: this.props.location.state.creditAmount,
				cannotsave: false,
				selectedrowsdata: [],
			});
		}
	};


	handleSubmit = (data) => {
		this.setState({ disabled: true, disableLeavePage: true });

		const formData = new FormData();
		const ids = this.state.selectedRows.map((i) => i.id)
		formData.append('invoiceIds', ids)
		formData.append('creditNoteId', this.state.creditNoteId)
		this.props.customerInvoiceDetailActions
			.refundAgainstInvoices(formData)
			.then((res) => {
				if (res.status === 200) {
					this.initializeData();
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? 'Amount Applied To Invoice Successfully!' : res.data.message,
					);
					if (this.state.invoice_list && this.state.invoice_list.length > 0) {
						this.setState({
							selectedRows: [],
						});
						this.props.history.push('/admin/income/credit-notes');
					}
				}
			})
			.catch((err) => {
				this.setState({ disabled: false, disableLeavePage: false });

				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};


	getCompanyCurrency = (basecurrency) => {
		this.props.currencyConvertActions
			.getCompanyCurrency()
			.then((res) => {
				if (res.status === 200) {
					this.setState({ basecurrency: res.data });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
				this.setState({ loading: false });
			});
	};


	render() {
		strings.setLanguage(this.state.language);
		const { data, cannotsave, currenttotal, loading, dialog } = this.state;

		const { project_list, currency_list, currency_convert_list, customer_list, universal_currency_list } = this.props;
		let tmpCustomer_list = []

		customer_list.map(item => {
			let obj = { label: item.label.contactName, value: item.value }
			tmpCustomer_list.push(obj)
		})
		return (
			<div className="detail-customer-invoice-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="fas fa-address-book" />
												<span className="ml-2">
													{/* Apply To Invoice  */}
													{strings.Applycreditsfrom} <u>{this.state.creditNoteNumber}</u></span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									{dialog}
									{loading ? (
										<Loader />
									) : (
										<Row>
											<Col lg={12}>
												<Formik
													initialValues={this.state.initValue}
													ref={this.formRef}
													onSubmit={(values, { resetForm }) => {
														this.handleSubmit(values);
													}}

												>
													{(props) => (
														<Form onSubmit={props.handleSubmit}>

															<Row>
																<Col lg={12} className='h5'><span>{strings.CreditAmount}: {this.renderAmount(this.props.location.state.creditAmount)}</span></Col>
																<Col lg={12} className='mb-1' style={{ fontSize: '12px', color: currenttotal ? 'Green' : cannotsave ? 'red' : 'inherit' }}>{strings.RemainingCredittAmount}: {this.renderAmount(currenttotal)}<br /></Col>

																<Col lg={12}>

																	<BootstrapTable
																		options={this.options}
																		selectRow={this.selectRowProp}
																		data={
																			this.state.invoice_list
																				? this.state.invoice_list
																				: []
																		}

																		version="4"
																		hover
																		keyField="id"
																		className="invoice-create-table"
																	>
																		<TableHeaderColumn
																			width="55"
																			dataAlign="center"
																			className="table-header-bg"
																		// dataFormat={(cell, rows) =>
																		// 	this.renderActions(cell, rows, props)
																		// }
																		></TableHeaderColumn>
																		<TableHeaderColumn
																			dataField="referenceNo"
																			className="table-header-bg"
																			dataAlign="center"
																		// dataFormat={(cell, rows) =>
																		// 	this.renderDescription(
																		// 		cell,
																		// 		rows,
																		// 		props,
																		// 	)
																		// }
																		>
																			{strings.InvoiceNumber}
																		</TableHeaderColumn>
																		<TableHeaderColumn
																			dataField='date'
																			dataFormat={this.renderDate}
																			className="table-header-bg"
																			dataAlign="center"
																		// dataFormat={(cell, rows) =>
																		// 	this.renderQuantity(cell, rows, props)
																		// }
																		>
																			{strings.InvoiceDate}
																		</TableHeaderColumn>
																		<TableHeaderColumn
																			dataField="dueAmount"
																			className="table-header-bg"
																			dataAlign="right"
																			dataFormat={this.renderInvoiceDueAmount}
																		>
																			{strings.InvoiceAmount}
																		</TableHeaderColumn>
																		{/* <TableHeaderColumn
																			dataField="totalAount"
																			dataFormat={this.renderCreditAmount}
																			formatExtraData={this.props.location.state.creditAmount}
																			className="table-header-bg"
																		// dataFormat={(cell, rows) =>
																		// 	this.renderUnitPrice(cell, rows, props)
																		// }
																		>
																			{strings.AmountToCredit}
																		</TableHeaderColumn> */}
																		<TableHeaderColumn
																			dataField="creditstaken"
																			dataFormat={this.renderCredittaken}
																			formatExtraData={this.props.location.state.creditAmount}
																			className="table-header-bg"
																			dataAlign="right"
																		// dataFormat={(cell, rows) =>
																		// 	this.renderUnitPrice(cell, rows, props)
																		// }
																		>
																			{strings.CreditUsed || "Credit Used"}
																		</TableHeaderColumn>
																	</BootstrapTable>
																</Col>
															</Row>
															{/* 													
																<Row style={{direction:'rtl'}}>
																	
																	<Col lg={4} style={{direction:'ltr'}}>
																		<div className="">
																			
																			<div className="total-item p-2">
																				<Row>
																					<Col lg={6}>
																						<h5 className="mb-0 text-right">
																						Amount to Credit
																						</h5>
																					</Col>
																					<Col lg={6} className="text-right">
																						<label className="mb-0">
																						
																							{this.state.customer_currency_symbol} &nbsp;
																							{initValue.total_net.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																						</label>
																					</Col>
																				</Row>
																			</div>
																			
																	
																			<div className="total-item p-2">
																				<Row>
																					<Col lg={6}>
																						<h5 className="mb-0 text-right">
																						Remaining Credits
																						</h5>
																					</Col>
																					<Col lg={6} className="text-right">
																						<label className="mb-0">
																						
																							{this.state.customer_currency_symbol} &nbsp;
																								{initValue.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																						</label>
																					</Col>
																				</Row>
																			</div>
																		</div>
																	</Col>
																</Row>
															 */}
															<Row>
																<Col
																	lg={12}
																	className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
																>
																	<FormGroup>
																		{/* <Button
																			type="button"
																			color="danger"
																			className="btn-square"
																			onClick={this.deleteInvoice}
																		>
																			<i className="fa fa-trash"></i> Delete
																		</Button> */}
																	</FormGroup>
																	<FormGroup className="text-right">
																	<Button
																			type="submit"
																			color={this.state.selectedRows.length < 1 ? "secondary" : "primary"} 
																			className="btn-square mr-3"
																			disabled={this.state.selectedRows.length < 1 || !this.state.selectedRows || (this.state.disabled || this.state.cannotsave)}
																			onClick={this.handleSubmit}
																			>
																			<i className="fa fa-dot-circle-o"></i>{' '}
																			{this.state.disabled
																			? strings.Saving
																			: strings.Save}
																			</Button>
																		<Button
																			color="secondary"
																			className="btn-square"
																			onClick={() => {
																				if (this.props?.location?.state?.renderURL) {
																					this.props.history.push(
																						`${this.props?.location?.state?.renderURL}`, 
																						{ id: this.props?.location?.state?.renderID, 
																						isCNWithoutProduct: this.props.location.state.isCNWithoutProduct }
																						);
																				} else
																					this.props.history.push(
																						'/admin/income/credit-notes',
																					);
																			}}
																		>
																			<i className="fa fa-ban"></i> {strings.Cancel}
																		</Button>
																	</FormGroup>

																</Col>
																{this.state.cannotsave && <div style={{ fontSize: '1rem', color: 'red' }}>You Dont have Sufficient Credit</div>}
															</Row>
														</Form>
													)}
												</Formik>
											</Col>
										</Row>
									)}
								</CardBody>
							</Card>
						</Col>
					</Row>
				</div>
				{this.state.disableLeavePage ? "" : <LeavePage />}
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(ApplyToInvoice);
