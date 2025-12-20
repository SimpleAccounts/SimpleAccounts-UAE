import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import * as DebitNoteApplyToInvoiceActions from './actions';
import * as DebitNoteActions from '../../actions';
import { Loader, LeavePage, Currency } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);

const mapStateToProps = (state) => {
	return {
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		DebitNoteActions: bindActionCreators(DebitNoteActions, dispatch,),
		debitNoteApplyToInvoiceActions: bindActionCreators(DebitNoteApplyToInvoiceActions, dispatch,),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

// Zod validation schema - minimal since most validation is in the component logic
const applyToInvoiceSchema = z.object({
	// Basic schema - main validation is in the selectedRows logic
});

const ApplyToSupplierInvoice = (props) => {
	const { history, location, DebitNoteActions, debitNoteApplyToInvoiceActions, commonActions } = props;

	// State
	const [language] = useState(window['localStorage'].getItem('language'));
	const [selectedRows, setSelectedRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [disabled, setDisabled] = useState(false);
	const [customerCurrency, setCustomerCurrency] = useState(location.state.currency);
	const [invoiceList, setInvoiceList] = useState([]);
	const [currentTotal, setCurrentTotal] = useState(0);
	const [selectedRowsData, setSelectedRowsData] = useState([]);
	const [disableLeavePage, setDisableLeavePage] = useState(false);
	const [cannotSave, setCannotSave] = useState(false);
	const [invoiceNumber, setInvoiceNumber] = useState('');
	const [creditNoteId, setCreditNoteId] = useState(null);
	const [debitNoteNumber, setDebitNoteNumber] = useState('');

	const formRef = useRef();

	const {
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(applyToInvoiceSchema),
		mode: 'onChange',
	});

	// Initialize data
	useEffect(() => {
		initializeData();
		return () => {
			setSelectedRows([]);
		};
	}, []);

	const initializeData = () => {
		if (location.state && location.state.contactId) {
			debitNoteApplyToInvoiceActions
				.getInvoicesListForCN(location.state.contactId)
				.then((res) => {
					if (res.status === 200) {
						setInvoiceList(res.data);
						setInvoiceNumber(location.state.referenceNumber);
						setCreditNoteId(location.state.creditNoteId);
						setDebitNoteNumber(location.state.debitNoteNumber);
						setLoading(false);
						setCurrentTotal(location.state.debitAmount);
						setCannotSave(false);
					}
				});
		} else {
			history.push('/admin/expense/debit-notes');
		}
	};

	const renderDate = (cell, rows) => {
		return dayjs(rows.date).format('DD-MM-YYYY');
	};

	const renderCredittaken = (cell, row, extraData) => {
		return (
			<div>
				<label>
					<Currency
						value={row.creditstaken}
						currencySymbol={customerCurrency}
					/>
				</label>
			</div>
		);
	};

	const renderInvoiceDueAmount = (cell, row, extraData) => {
		return (
			<div>
				<label>
					<Currency
						value={row.dueAmount}
						currencySymbol={customerCurrency}
					/>
				</label>
			</div>
		);
	};

	const renderAmount = (value) => {
		return (
			<Currency
				value={value}
				currencySymbol={customerCurrency}
			/>
		);
	};

	const applyInvoice = (row, selectedrowsdata, selectedRowsList, currenttotal) => {
		let tempList = [...selectedRowsList];
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

	const onRowSelect = (row, isSelected, e) => {
		let tempSelectedRowsData = [...selectedRowsData];
		let tempSelectedRows = [...selectedRows];
		let tempInvoiceList = [...invoiceList];
		let tempCurrentTotal = currentTotal;

		if (isSelected) {
			const list = applyInvoice(row, tempSelectedRowsData, tempSelectedRows, tempCurrentTotal);
			setSelectedRows(list.selectedRows);
			setCurrentTotal(list.currenttotal ? list.currenttotal : 0);
			setCannotSave(list.cannotsave);
			setSelectedRowsData(list.selectedrowsdata ? list.selectedrowsdata : tempSelectedRowsData);
		} else {
			if (row?.creditstaken) {
				let remaining = tempCurrentTotal + row?.creditstaken;
				tempCurrentTotal = remaining > 0 ? remaining : 0;
			}
			tempSelectedRowsData = tempSelectedRowsData.filter((obj) => obj.id !== row.id);
			tempSelectedRows = tempSelectedRows.filter((value) => value.id !== row.id);
			const selectedRowwithNocredit = tempSelectedRows.filter(obj => !(obj?.creditstaken > 0));

			let list = {};
			if (selectedRowwithNocredit && selectedRowwithNocredit.length > 0) {
				selectedRowwithNocredit.forEach(obj => {
					tempSelectedRows = tempSelectedRows.filter((value) => value.id !== obj.id);
					list = applyInvoice(obj, tempSelectedRowsData ? tempSelectedRowsData : [], tempSelectedRows, tempCurrentTotal);
					tempSelectedRowsData = list.selectedrowsdata ? list.selectedrowsdata : tempSelectedRowsData;
					tempSelectedRows = list.selectedRows ? list.selectedRows : tempSelectedRows;
					tempCurrentTotal = list.currenttotal ? list.currenttotal : 0;
				});
			}

			tempInvoiceList = tempInvoiceList.map((obj) => {
				if (obj.id === row.id) {
					obj.creditstaken = 0;
				}
				return obj;
			});

			setSelectedRows(list.selectedRows ? list.selectedRows : tempSelectedRows);
			setCurrentTotal(tempCurrentTotal);
			setCannotSave(list.cannotsave ? list.cannotsave : false);
			setSelectedRowsData(list.selectedrowsdata ? list.selectedrowsdata : tempSelectedRowsData);
			setInvoiceList(tempInvoiceList);
		}
	};

	const onSelectAll = (isSelected, rows) => {
		let tempInvoiceList = [...invoiceList];
		let tempCurrentTotal = currentTotal;
		let tempCannotSave = cannotSave;
		let tempSelectedRowsData = [];
		let tempSelectedRows = [];

		if (isSelected) {
			tempCurrentTotal = location.state.debitAmount;
			rows && rows.forEach((row) => {
				const list = applyInvoice(row, tempSelectedRowsData, tempSelectedRows, tempCurrentTotal);
				tempSelectedRows = list.selectedRows ? list.selectedRows : tempSelectedRows;
				tempCurrentTotal = list.currenttotal && list.currenttotal >= 0 ? list.currenttotal : 0;
				tempCannotSave = list.cannotsave ? list.cannotsave : false;
				tempSelectedRowsData = list.selectedrowsdata ? list.selectedrowsdata : tempSelectedRowsData;
			});
			setSelectedRows(tempSelectedRows);
			setCurrentTotal(tempCurrentTotal);
			setCannotSave(tempCannotSave);
			setSelectedRowsData(tempSelectedRowsData);
		} else {
			tempInvoiceList = tempInvoiceList.map((obj) => {
				obj.creditstaken = 0;
				return obj;
			});

			setSelectedRows([]);
			setCurrentTotal(location.state.debitAmount);
			setCannotSave(false);
			setSelectedRowsData([]);
			setInvoiceList(tempInvoiceList);
		}
	};

	const onSubmit = (data) => {
		setLoading(false);
		setDisabled(true);
		setDisableLeavePage(true);

		const formData = new FormData();
		const ids = selectedRows.map((i) => i.id);
		formData.append('invoiceIds', ids);
		formData.append('creditNoteId', creditNoteId);

		debitNoteApplyToInvoiceActions
			.refundAgainstInvoices(formData)
			.then((res) => {
				if (res.status === 200) {
					commonActions.tostifyAlert('success', strings.AmountAppliedToInvoiceSuccessfully);
					if (invoiceList && invoiceList.length > 0) {
						setSelectedRows([]);
					}
					history.push('/admin/expense/debit-notes');
					setLoading(false);
					setDisabled(false);
					setDisableLeavePage(false);
				}
			})
			.catch((err) => {
				setLoading(false);
				setDisabled(false);
				setDisableLeavePage(false);
				commonActions.tostifyAlert('error', strings.AmountAppliedToInvoiceUnsuccessfully);
			});
	};

	const options = {
		paginationPosition: 'bottom',
		page: 1,
		sizePerPage: 10,
		sortName: '',
		sortOrder: '',
	};

	const selectRowProp = {
		mode: 'checkbox',
		bgColor: 'rgba(0,0,0, 0.05)',
		clickToSelect: false,
		onSelect: onRowSelect,
		onSelectAll: onSelectAll
	};

	strings.setLanguage(language);

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
											<i className="fa fa-credit-card" />
											<span className="ml-2">
												{strings.ApplyDebitsfrom} <u>{debitNoteNumber}</u>
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
											<Form onSubmit={handleSubmit(onSubmit)}>
												<Row>
													<Col lg={12} className="h5">
														<span>{strings.DebitAmount}: {renderAmount(location.state.debitAmount)}</span>
													</Col>
													<Col lg={12} className="mb-1" style={{ fontSize: '12px', color: currentTotal ? 'Green' : cannotSave ? 'red' : 'inherit' }}>
														{strings.RemainingDebitAmount}: {renderAmount(currentTotal)}<br />
													</Col>
													<Col lg={12}>
														<BootstrapTable
															options={options}
															selectRow={selectRowProp}
															data={invoiceList ? invoiceList : []}
															version="4"
															hover
															keyField="id"
															className="invoice-create-table"
														>
															<TableHeaderColumn
																dataField="referenceNo"
																className="table-header-bg"
															>
																{strings.InvoiceNumber}
															</TableHeaderColumn>
															<TableHeaderColumn
																dataField='date'
																dataFormat={renderDate}
																className="table-header-bg"
															>
																{strings.InvoiceDate}
															</TableHeaderColumn>
															<TableHeaderColumn
																dataAlign='right'
																dataField="dueAmount"
																dataFormat={renderInvoiceDueAmount}
																className="table-header-bg"
															>
																{strings.InvoiceDueAmount}
															</TableHeaderColumn>
															<TableHeaderColumn
																dataAlign='right'
																dataField="creditstaken"
																dataFormat={renderCredittaken}
																formatExtraData={location.state.debitAmount}
																className="table-header-bg"
															>
																{strings.AmountAppliedToTheInvoice}
															</TableHeaderColumn>
														</BootstrapTable>
													</Col>
												</Row>

												<Row>
													<Col lg={12} className="mt-5">
														<FormGroup className="text-right">
															<Button
																type="submit"
																color={selectedRows.length < 1 ? "secondary" : "primary"}
																className="btn-square mr-3"
																disabled={selectedRows.length < 1 || !selectedRows || (disabled || cannotSave)}
															>
																<i className="fa fa-dot-circle-o"></i>{' '}
																{disabled ? strings.Saving : strings.Save}
															</Button>
															<Button
																color="secondary"
																className="btn-square"
																onClick={() => {
																	if (location?.state?.renderURL) {
																		history.push(
																			`${location?.state?.renderURL}`,
																			{
																				id: location?.state?.renderID,
																				isCNWithoutProduct: location.state.isCNWithoutProduct
																			}
																		);
																	} else {
																		history.push('/admin/expense/debit-notes');
																	}
																}}
															>
																<i className="fa fa-ban"></i> {strings.Cancel}
															</Button>
														</FormGroup>
													</Col>
													{cannotSave && <div style={{ fontSize: '1rem', color: 'red' }}>Insufficient Debit Amount</div>}
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
			{disableLeavePage ? "" : <LeavePage />}
		</div>
	);
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(ApplyToSupplierInvoice);
