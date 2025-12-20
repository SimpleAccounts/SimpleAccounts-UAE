import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Row,
	Col,
	Form,
	FormGroup,
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as CustomerInvoiceDetailActions from './actions';
import * as CustomerInvoiceActions from '../../actions';
import { Loader, LeavePage, Currency } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);

// Zod validation schema
const applyToInvoiceSchema = z.object({
	// This form doesn't have traditional form inputs, just table selection
	// Validation is handled in the component logic
});

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
		customerInvoiceActions: bindActionCreators(
			CustomerInvoiceActions,
			dispatch,
		),
		customerInvoiceDetailActions: bindActionCreators(
			CustomerInvoiceDetailActions,
			dispatch,
		),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class ApplyToInvoiceClass extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			selectedRows: [],
			loading: true,
			dialog: false,
			disabled: false,
			data: [],
			customer_currency: this.props.location.state.currency,
			invoice_list: [],
			currenttotal: 0,
			disableLeavePage: false,
			selectedrowsdata: [],
			cannotsave: false,
		};

		this.options = {
			paginationPosition: 'bottom',
			page: 1,
			sizePerPage: 10,
		};

		this.selectRowProp = {
			mode: 'checkbox',
			bgColor: 'rgba(0,0,0, 0.05)',
			clickToSelect: false,
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll,
		};
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
								loading: false,
								currenttotal: this.props.location.state.creditAmount,
								cannotsave: false,
							},
						);
					}
				});
		} else {
			this.props.history.push('/admin/income/credit-notes');
		}
	};

	renderDate = (cell, rows) => {
		return dayjs(rows.date).format('DD-MM-YYYY');
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
		return (
			<Currency
				value={value}
				currencySymbol={this.state.customer_currency}
			/>
		);
	};

	applyInvoice = (row, selectedrowsdata, selectedRows, currenttotal) => {
		let tempList = selectedRows;
		let crtotal;
		tempList.push(row);
		if (currenttotal > 0) {
			crtotal = currenttotal - row.dueAmount;
			row['creditstaken'] = crtotal > 0 ? row.dueAmount : currenttotal;
			selectedrowsdata.push(row);
			const list = {
				selectedRows: tempList,
				currenttotal: crtotal > 0 ? crtotal : 0,
				cannotsave: false,
				selectedrowsdata: selectedrowsdata,
			};
			return list;
		} else {
			const list = {
				selectedRows: tempList,
				cannotsave: true,
			};
			return list;
		}
	};

	onRowSelect = (row, isSelected, e) => {
		var { selectedrowsdata, selectedRows, invoice_list, currenttotal } = this.state;
		if (isSelected) {
			var list = [];
			list = this.applyInvoice(row, selectedrowsdata, selectedRows, currenttotal);
			this.setState({
				selectedRows: list.selectedRows,
				currenttotal: list.currenttotal ? list.currenttotal : 0,
				cannotsave: list.cannotsave,
				selectedrowsdata: list.selectedrowsdata ? list.selectedrowsdata : selectedrowsdata,
			});
		} else {
			var list = [];
			if (row?.creditstaken) {
				let remaining = currenttotal + row?.creditstaken;
				currenttotal = remaining > 0 ? remaining : 0;
			}
			selectedrowsdata = selectedrowsdata.filter((obj) => obj.id !== row.id);
			selectedRows = selectedRows.filter((value) => value.id !== row.id);
			var selectedRowwithNocredit = selectedRows.filter(obj => !(obj?.creditstaken > 0));
			if (selectedRowwithNocredit && selectedRowwithNocredit.length > 0) {
				selectedRowwithNocredit.map(obj => {
					selectedRows = selectedRows.filter((value) => value.id !== obj.id);
					list = this.applyInvoice(obj, selectedrowsdata ? selectedrowsdata : [], selectedRows, currenttotal);
					selectedrowsdata = list.selectedrowsdata ? list.selectedrowsdata : selectedrowsdata;
					selectedRows = list.selectedRows ? list.selectedRows : selectedRows;
					currenttotal = list.currenttotal ? list.currenttotal : 0;
				});
			}
			invoice_list.map((obj) => {
				if (obj.id === row.id) {
					obj.creditstaken = 0;
				}
				return obj;
			});
			this.setState({
				selectedRows: list.selectedRows ? list.selectedRows : selectedRows,
				currenttotal: currenttotal,
				cannotsave: list.cannotsave ? list.cannotsave : false,
				selectedrowsdata: list.selectedrowsdata ? list.selectedrowsdata : selectedrowsdata,
			});
		}
	};

	onSelectAll = (isSelected, rows) => {
		var { invoice_list, currenttotal, cannotsave } = this.state;
		var selectedrowsdata = [];
		var selectedRows = [];
		if (isSelected) {
			currenttotal = this.props.location.state.creditAmount;
			rows && rows.map((row) => {
				var list = [];
				list = this.applyInvoice(row, selectedrowsdata, selectedRows, currenttotal);
				selectedRows = list.selectedRows ? list.selectedRows : selectedRows;
				currenttotal = list.currenttotal && list.currenttotal >= 0 ? list.currenttotal : 0;
				cannotsave = list.cannotsave ? list.cannotsave : false;
				selectedrowsdata = list.selectedrowsdata ? list.selectedrowsdata : selectedrowsdata;
			});
			this.setState({
				selectedRows: selectedRows,
				currenttotal: currenttotal,
				cannotsave: cannotsave,
				selectedrowsdata: selectedrowsdata,
			});
		} else {
			invoice_list.map((obj) => {
				obj.creditstaken = 0;
				return obj;
			});

			this.setState({
				selectedRows: [],
				currenttotal: this.props.location.state.creditAmount,
				cannotsave: false,
				selectedrowsdata: [],
			});
		}
	};

	handleSubmit = () => {
		this.setState({ disabled: true, disableLeavePage: true });

		const formData = new FormData();
		const ids = this.state.selectedRows.map((i) => i.id);
		formData.append('invoiceIds', ids);
		formData.append('creditNoteId', this.state.creditNoteId);
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

	render() {
		strings.setLanguage(this.state.language);
		const { cannotsave, currenttotal, loading } = this.state;

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
													{strings.Applycreditsfrom} <u>{this.state.creditNoteNumber}</u>
												</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									{loading ? (
										<Loader />
									) : (
										<Row>
											<Col lg={12}>
												<Form onSubmit={(e) => { e.preventDefault(); this.handleSubmit(); }}>
													<Row>
														<Col lg={12} className='h5'>
															<span>{strings.CreditAmount}: {this.renderAmount(this.props.location.state.creditAmount)}</span>
														</Col>
														<Col lg={12} className='mb-1' style={{ fontSize: '12px', color: currenttotal ? 'Green' : cannotsave ? 'red' : 'inherit' }}>
															{strings.RemainingCredittAmount}: {this.renderAmount(currenttotal)}<br />
														</Col>

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
																></TableHeaderColumn>
																<TableHeaderColumn
																	dataField="referenceNo"
																	className="table-header-bg"
																	dataAlign="center"
																>
																	{strings.InvoiceNumber}
																</TableHeaderColumn>
																<TableHeaderColumn
																	dataField='date'
																	dataFormat={this.renderDate}
																	className="table-header-bg"
																	dataAlign="center"
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
																<TableHeaderColumn
																	dataField="creditstaken"
																	dataFormat={this.renderCredittaken}
																	formatExtraData={this.props.location.state.creditAmount}
																	className="table-header-bg"
																	dataAlign="right"
																>
																	{strings.CreditUsed || "Credit Used"}
																</TableHeaderColumn>
															</BootstrapTable>
														</Col>
													</Row>

													<Row>
														<Col
															lg={12}
															className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
														>
															<FormGroup></FormGroup>
															<FormGroup className="text-right">
																<Button
																	type="submit"
																	color={this.state.selectedRows.length < 1 ? "secondary" : "primary"}
																	className="btn-square mr-3"
																	disabled={this.state.selectedRows.length < 1 || !this.state.selectedRows || (this.state.disabled || this.state.cannotsave)}
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
																				{
																					id: this.props?.location?.state?.renderID,
																					isCNWithoutProduct: this.props.location.state.isCNWithoutProduct
																				}
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

// Wrapper component to use React Hook Form (even though this form doesn't need traditional form handling)
const ApplyToInvoice = (props) => {
	const {
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(applyToInvoiceSchema),
		defaultValues: {},
	});

	return <ApplyToInvoiceClass {...props} />;
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(ApplyToInvoice);
