import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, FormGroup, Row, Col, Label, Alert } from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { Formik, Field } from 'formik';
import { selectOptionsFactory } from 'utils';
import * as TransactionsActions from '../actions';
import { CommonActions } from 'services/global';
import './style.scss';
import { Loader } from 'components';
import moment from 'moment';

const mapDispatchToProps = (dispatch) => {
	return {
		transactionsActions: bindActionCreators(TransactionsActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class explainDiv extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			startDate: new Date(),
			loading: false,
			transactionAmount: 0,
			currentBalance: 0,
			explainList: [
				{
					id: 0,
					chartOfAccountCategoryId: '',
					transactionCategoryId: '',
					reconcileRrefId: '',
					categoryLabel: '',
				},
			],
			idCount: 0,
			totalAmount: 0,
			transactionId: '',
			chartOfAccountCategoryList: [],
			transactionCategoryList: [],
			categoryList: {},
			submitBtnClick: false,
			showChartOfAccount: false,
			transactionCategoryTypeList: [],
			moreDetails: false,
		};
		this.formikRef = React.createRef();
	}
	componentDidMount() {
		if (this.props.selectedData) {
			const { selectedData } = this.props;
			let transactionAmount = selectedData.withdrawalAmount
				? +selectedData.withdrawalAmount
				: +selectedData.depositeAmount;
			this.setState({
				transactionId: selectedData.id,
				currentBalance: transactionAmount,
				transactionAmount,
			});
			this.getChartOfAccountCategoryList(selectedData.debitCreditFlag);
		}
	}

	getChartOfAccountCategoryList = (type) => {
		this.props.transactionsActions.getChartOfCategoryList(type).then((res) => {
			if (res.status === 200) {
				this.setState({
					chartOfAccountCategoryList: res.data,
				});
			}
		});
	};

	getTransactionCategoryList = (type) => {
		this.props.transactionsActions
			.getTransactionCategoryListForExplain(type)
			.then((res) => {
				if (res.status === 200) {
					this.setState(
						{
							transactionCategoryList: res.data,
						},
						() => {},
					);
				}
			});
	};

	getCategoryList = (label, value) => {
		const { currentBalance, categoryList } = this.state;
		let data = Object.assign({}, categoryList);
		let keys = Object.keys(data);
		if (!keys.includes(label)) {
			this.props.transactionsActions
				.getCategoryListForReconcile(value)
				.then((res) => {
					if (res.status === 200) {
						res.data.map((x) => {
							x['name'] = x.label;
							x[
								'label'
							] = `${x['label']} (${x['amount']} ${x['currencySymbol']})`;
							x['isDisabled'] = x['amount'] <= currentBalance ? false : true;
							return x;
						});
						data[`${label}`] = res.data;
						this.setState({
							categoryList: data,
						});
					}
				});
		}
	};

	checkedRow = () => {
		const { explainList } = this.state;
		if (explainList.length > 0) {
			let length = explainList.length - 1;
			let temp = Object.values(explainList[length]).indexOf('');
			if (temp > -1) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	handleChange = (val, name, row) => {
		let data = [...this.state.explainList];
		data.map((item, index) => {
			if (item.id === row.id) {
				data[`${index}`][`${name}`] = val;
			}
			return item;
		});
		this.setState(
			{
				explainList: data,
			},
			() => {
				this.calculateCurrentBalance();
			},
		);
	};

	checkCategory = (value, label) => {
		const { explainList } = this.state;
		const temp = explainList.filter((item) => item[`${label}`].value === value);
		if (temp.length > 0) {
			return false;
		} else {
			return true;
		}
	};

	calculateCurrentBalance = () => {
		let temp;
		let amount = 0;
		this.state.explainList.map((obj) => {
			for (let item in this.state.categoryList) {
				if (this.state.categoryList.hasOwnProperty(item)) {
					let tempAmount;
					if (item === obj['categoryLabel']) {
						temp = this.state.categoryList[`${obj['categoryLabel']}`].filter(
							(item) => item.id === obj.reconcileRrefId.value,
						);
						tempAmount = temp.length ? temp[0]['amount'] : 0;
						amount = amount + tempAmount;
					}
				}
			}
			return obj;
		});
		this.setState(
			{
				currentBalance: this.state.transactionAmount - amount,
			},
			() => {
				this.checkChartOfAccount();
			},
		);
	};

	checkChartOfAccount = () => {
		const {
			transactionAmount,
			currentBalance,
			submitBtnClick,
			transactionCategoryTypeList,
		} = this.state;
		if (
			transactionAmount > currentBalance &&
			currentBalance !== 0 &&
			submitBtnClick
		) {
			this.setState({
				showChartOfAccount: true,
			});
			if (transactionCategoryTypeList.length === 0) {
				this.props.transactionsActions
					.getTransactionCategoryList()
					.then((res) => {
						if (res.status === 200) {
							this.setState({
								transactionCategoryTypeList: res.data.data,
							});
						}
					});
			}
			return true;
		} else {
			this.setState({
				showChartOfAccount: false,
				selectedTransactionCategoryType: '',
			});
			return false;
		}
	};

	handleSubmit = () => {
		const { selectedTransactionCategoryType } = this.state;
		const postData = {
			transactionCategory: selectedTransactionCategoryType.value,
		};
		this.setState(
			{
				submitBtnClick: true,
			},
			() => {
				if (this.checkChartOfAccount()) {
					if (postData.transactionCategory && !this.checkedRow()) {
						this.setState({
							showAlert: false,
						});
						//this.submitExplain(postData);
					} else {
						this.setState({
							showAlert: true,
						});
					}
				} else {
					if (!this.checkedRow()) {
						//this.submitExplain(postData);
					}
				}
			},
		);
	};

	submitExplain = (postData) => {
		const { transactionId, explainList, currentBalance } = this.state;
		let data = [...explainList];
		data = JSON.parse(JSON.stringify(data));
		const temp = data.map((item) => {
			item['chartOfAccountCategoryId'] = item['chartOfAccountCategoryId'].value;
			item['transactionCategoryId'] = item['transactionCategoryId'].value;
			item['reconcileRrefId'] = item['reconcileRrefId'].value;
			delete item['id'];
			delete item['categoryLabel'];
			return item;
		});
		let obj = {
			...{ explainData: temp },
			transactionId,
			...{ remainingBalance: currentBalance },
		};
		if (postData.transactionCategory) {
			obj = { ...obj, ...postData };
		}
		this.props.transactionsActions.reconcileTransaction(obj).then((res) => {
			if (res.status === 200) {
				this.props.closeExplainTransactionModal();
			}
		});
	};

	moreDetails = () => {
		this.setState({
			moreDetails: true,
		});
	};
	lessDetails = () => {
		this.setState({
			moreDetails: false,
		});
	};

	totalAmount(option) {
		if (option) {
			const amount = option.reduce(
				(totalAmount, invoice) => totalAmount + invoice.amount,
				0,
			);
			this.setState({ totalAmount: amount }, () => {});
		} else {
			this.setState({ totalAmount: 0 }, () => {});
		}
	}

	render() {
		const { openExplainTransactionModal, selectedData } = this.props;
		const {
			chartOfAccountCategoryList,
			showChartOfAccount,
			transactionAmount,
			currentBalance,
			explainList,
			transactionCategoryTypeList,
			submitBtnClick,
			showAlert,
			transactionCategoryList,
		} = this.state;

		if (selectedData !== '') {
			return (
				<div className="explain-modal-screen">
					<div isOpen={openExplainTransactionModal} className="modal-primary">
						<div toggle={this.toggleDanger} className="mb-2">
							<div className="header text">
								<h2>Explain AED {`${selectedData.withdrawalAmount}`}</h2>
							</div>
						</div>
						<div>
							<div className="content-details">
								{(this.checkedRow() && submitBtnClick) || showAlert ? (
									<Alert color="danger">
										Please Select all the remaining fields.
									</Alert>
								) : null}
								<form>
									<div className="details-container">
										{explainList &&
											explainList.map((item, index) => (
												<div className="detail-row">
													<div
														className="sub-container row ml-0 mr-0"
														style={{ width: '100%' }}
													>
														<div className="col-md-6">
															<div className="form-group row align-items-center">
																<Label
																	for="staticEmail"
																	className="col-sm-3  label"
																>
																	Type
																</Label>
																<div className="col-sm-9">
																	<Select
																		// className="custom-select-box"
																		id="transaction_select"
																		options={
																			chartOfAccountCategoryList
																				? chartOfAccountCategoryList
																				: []
																		}
																		onChange={(option) => {
																			// this.handleChange(text, 'categoryLabel', true, item)
																			this.handleChange(
																				option,
																				'chartOfAccountCategoryId',
																				item,
																			);
																			this.handleChange(
																				selectedData.id,
																				'id',
																				item,
																			);
																			// this.getCategoryList(text,e.target.value)
																			this.getTransactionCategoryList(
																				option.value,
																			);
																		}}
																		// className="select-default-width"
																		placeholder="Select"
																		value={item.chartOfAccountCategoryId}
																	/>
																</div>
															</div>
														</div>
														{explainList[`${index}`].chartOfAccountCategoryId
															.label === 'Expenses' && (
															<div className="col-md-6">
																<div className="form-group row align-items-center ">
																	<Label className="label col-sm-3">
																		VAT Included
																	</Label>
																	<div className="col-sm-9">
																		<Select
																			// className="custom-select-box"
																			id="transaction_category_select"
																			options={
																				transactionCategoryList.dataList
																					? transactionCategoryList.dataList[0]
																							.options
																					: []
																			}
																			onChange={(option) => {
																				// this.handleChange(text, 'categoryLabel', true, item)
																				this.handleChange(
																					option,
																					'transactionCategoryListVat ',
																					item,
																				);
																			}}
																			// className="select-default-width"
																			placeholder="Select"
																		/>
																	</div>
																</div>
															</div>
														)}
														{explainList[`${index}`].chartOfAccountCategoryId
															.label === 'Sales' && (
															<div className="col-md-6">
																<div className="form-group row align-items-center ">
																	<Label className="label col-sm-3">
																		Customer
																	</Label>
																	<div className="col-sm-9">
																		<Select
																			// className="custom-select-box"
																			id="transaction_category_select"
																			options={
																				transactionCategoryList.dataList
																					? transactionCategoryList.dataList[0]
																							.options
																					: []
																			}
																			// className="select-default-width"
																			placeholder="Select"
																		/>
																	</div>
																</div>
															</div>
														)}

														{explainList[`${index}`].chartOfAccountCategoryId
															.label === 'Sales' && (
															<div className="col-md-6">
																<div className="form-group row align-items-center ">
																	<Label className="label col-sm-3">
																		Invoice
																	</Label>
																	<div className="col-sm-9">
																		<Select
																			isMulti
																			id="transaction_category_select"
																			options={
																				transactionCategoryList.dataList
																					? transactionCategoryList.dataList[1]
																							.options
																					: []
																			}
																			onChange={(option) => {
																				this.totalAmount(option);
																			}}
																			// className="select-default-width"
																			placeholder="Select"
																		/>
																	</div>
																</div>
															</div>
														)}
														{explainList[`${index}`].chartOfAccountCategoryId
															.label === 'Sales' && (
															<div className="col-md-6">
																<div className="form-group row align-items-center ">
																	<Label className="label col-sm-3">
																		Total Amount
																	</Label>
																	<div className="col-sm-9">
																		<input
																			type="number"
min="0"
																			className="form-control"
																			id="description"
																			value={this.state.totalAmount}
																		/>
																	</div>
																</div>
															</div>
														)}
														{explainList[`${index}`].chartOfAccountCategoryId &&
															explainList[`${index}`].chartOfAccountCategoryId
																.label !== 'Sales' && (
																<div className="col-md-6">
																	<div className="form-group row align-items-center ">
																		<Label className="label col-sm-3">
																			{explainList[`${index}`]
																				.chartOfAccountCategoryId.label ===
																				'Transfered To' ||
																			explainList[`${index}`]
																				.chartOfAccountCategoryId.label ===
																				'Transfered From'
																				? 'Bank Account'
																				: 'Category'}
																		</Label>
																		<div className="col-sm-9">
																			<Select
																				// className="custom-select-box"
																				id="transaction_category_select"
																				options={
																					transactionCategoryList.categoriesList
																						? transactionCategoryList.categoriesList
																						: []
																				}
																				onChange={(option) => {
																					this.handleChange(
																						option,
																						'transactionCategoryList',
																						item,
																					);
																				}}
																				className="select-default-width"
																				placeholder="Select"
																				value={item.transactionCategoryList}
																			/>
																		</div>
																	</div>
																</div>
															)}
														{explainList[`${index}`].chartOfAccountCategoryId
															.label === 'Money Received From User' && (
															<div className="col-md-6">
																<div className="form-group row align-items-center ">
																	<Label className="label col-sm-3">User</Label>
																	<div className="col-sm-9">
																		<Select
																			isMulti
																			id="transaction_category_select"
																			options={
																				transactionCategoryList.dataList
																					? transactionCategoryList.dataList[0]
																							.options
																					: []
																			}
																			onChange={(option) => {
																				this.totalAmount(option);
																				this.handleChange(option, 'user', item);
																			}}
																			value={item.user}
																			// className="select-default-width"
																			placeholder="Select"
																		/>
																	</div>
																</div>
															</div>
														)}
														{explainList[`${index}`].chartOfAccountCategoryId
															.label === 'Money Received From User' ||
															(explainList[`${index}`].chartOfAccountCategoryId
																.label === 'Money Paid To User' && (
																<div className="col-md-6">
																	<div className="form-group row align-items-center ">
																		<Label className="label col-sm-3">
																			User
																		</Label>
																		<div className="col-sm-9">
																			<Select
																				// className="custom-select-box"
																				id="transaction_category_select"
																				options={
																					transactionCategoryList.dataList
																						? transactionCategoryList
																								.dataList[0].options
																						: []
																				}
																				// className="select-default-width"
																				placeholder="Select User"
																			/>
																		</div>
																	</div>
																</div>
															))}
														{/* {explainList[`${index}`].transactionCategoryId
														.value && (
														<div className="mb-3">
															<Label className="label">
																{explainList[`${index}`].categoryLabel}
															</Label>
															<Select
																options={
																	categoryList[
																		`${explainList[`${index}`].categoryLabel}`
																	]
																		? selectOptionsFactory.renderOptions(
																				'label',
																				'id',
																				categoryList[
																					`${
																						explainList[`${index}`]
																							.categoryLabel
																					}`
																				],
																				explainList[`${index}`].categoryLabel,
																				['isDisabled'],
																		  )
																		: []
																}
																isOptionDisabled={(option) =>
																	option.isDisabled === true
																}
																onChange={(val) => {
																	if (val && val.value) {
																		// this.getDetail(val.value)
																		if (
																			this.checkCategory(
																				val.value,
																				'reconcileRrefId',
																			)
																		) {
																			this.handleChange(
																				val,
																				'reconcileRrefId',
																				item,
																				explainList[`${index}`].categoryLabel,
																			);
																		} else {
																			this.handleChange(
																				'',
																				'reconcileRrefId',
																				item,
																				explainList[`${index}`].categoryLabel,
																			);
																		}
																	} else {
																		this.handleChange(
																			'',
																			'reconcileRrefId',
																			item,
																			explainList[`${index}`].categoryLabel,
																		);
																	}
																}}
																className="select-default-width"
																value={item.reconcileRrefId}
															/>
														</div>
													)} */}
													</div>
												</div>
											))}
										{transactionAmount > currentBalance && showChartOfAccount && (
											<Row className="m-0">
												<Col lg={5} className="pl-0">
													<label className="value">Remaining Balance</label>
													<label className="value">{currentBalance}</label>
												</Col>
												<Col lg={5} className="p-0">
													<Label className="label">Transaction Category</Label>
													<Select
														options={
															transactionCategoryTypeList
																? selectOptionsFactory.renderOptions(
																		'transactionCategoryName',
																		'transactionCategoryId',
																		transactionCategoryTypeList,
																		'Type',
																  )
																: ''
														}
														value={this.state.selectedTransactionCategoryType}
														onChange={(option) => {
															if (option && option.value) {
																this.setState({
																	selectedTransactionCategoryType: option,
																	showAlert: false,
																});
															} else {
																this.setState({
																	selectedTransactionCategoryType: option,
																	showAlert: true,
																});
															}
														}}
														placeholder="Select Type"
														id="chartOfAccountId"
														name="chartOfAccountId"
													/>
												</Col>
											</Row>
										)}
									</div>
								</form>
							</div>
						</div>
						<div className="col-md-6">
							<div className="form-group row align-items-center">
								<label for="inputEmail3" className="col-sm-3 label">
									Description
								</label>
								<div className="col-sm-9">
									<input
										type="text"
										className="form-control"
										id="description"
										placeholder="Description"
									/>
								</div>
							</div>
						</div>
						<div className="col-md-6">
							<div className="form-group row align-items-center">
								<label for="inputEmail3" className="col-sm-3 label">
									Attachment
								</label>
								<div className="col-sm-9">
									<Formik>
										<Row>
											<Col lg={12}>
												<FormGroup className="mb-0">
													<Field
														name="attachment"
														render={({ field, form }) => (
															<div>
																<div className="file-upload-cont">
																	<Button
																		color="primary"
																		onClick={() => {
																			document
																				.getElementById('fileInput')
																				.click();
																		}}
																		className="btn-square mr-3"
																	>
																		<i className="fa fa-upload"></i> Upload File
																	</Button>
																	<input
																		id="fileInput"
																		// ref={(ref) => {
																		// 	this.uploadFile = ref;
																		// }}
																		type="file"
																		style={{ display: 'none' }}
																		// onChange={(e) => {
																		// 	this.handleFileChange(e);
																		// }}
																	/>
																</div>
															</div>
														)}
													/>
												</FormGroup>
											</Col>
										</Row>
									</Formik>
								</div>
							</div>
						</div>
						{this.state.moreDetails === true && (
							<div className="">
								<div className="col-lg-6">
									<div className="form-group row align-items-center">
										<label for="inputEmail3" className="col-sm-3 label">
											Date
										</label>
										<div className="col-sm-9">
											<DatePicker
												id="transactionDate"
												name="transactionDate"
												placeholderText="Transaction Date"
												showMonthDropdown
												showYearDropdown
												dateFormat="dd-MM-yyyy"
												dropdownMode="select"
												selected={this.state.startDate}
												value={
													selectedData.transactionDate
														? moment(
																selectedData.transactionDate,
																'DD-MM-YYYY',
														  ).format('DD-MM-YYYY')
														: ''
												}
											/>
										</div>
									</div>
									<div className="form-group row align-items-center">
										<label for="inputEmail3" className="col-sm-3 label">
											Reference
										</label>
										<div className="col-sm-9">
											<input
												type="text"
												className="form-control"
												id="description"
												placeholder="Reference Number"
												value={selectedData.referenceNo}
											/>
										</div>
									</div>
									{this.state.explainList[0].chartOfAccountCategoryId.label ===
										'Expenses' && (
										<div>
											<div className="form-group row align-items-center ">
												<Label className="label col-sm-3">Vendor</Label>
												<div className="col-sm-9">
													<Select
														// className="custom-select-box"
														id="transaction_category_select"
														options={
															transactionCategoryList.dataList
																? transactionCategoryList.dataList[2].options
																: []
														}
														// className="select-default-width"
														placeholder="Select Vendor"
													/>
												</div>
											</div>
											<div className="form-group row align-items-center ">
												<Label className="label col-sm-3">Customer</Label>
												<div className="col-sm-9">
													<Select
														// className="custom-select-box"
														id="transaction_category_select"
														options={
															transactionCategoryList.dataList
																? transactionCategoryList.dataList[1].options
																: []
														}
														// className="select-default-width"
														placeholder="Select Customer"
													/>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						)}
						<div className="">
							<div className="col-lg-6">
								<div className="row align-items-center justify-content-lg-between ml-0">
									<Button
										type="button"
										color="primary"
										className="btn-square"
										onClick={() => {
											this.handleSubmit();
										}}
									>
										<i className="fa fa-dot-circle-o"></i> Explain
									</Button>
									{this.state.moreDetails === false ? (
										<p
											className="moreDetails"
											onClick={() => {
												this.moreDetails();
											}}
										>
											More Details
										</p>
									) : (
										<p
											className="moreDetails"
											onClick={() => {
												this.lessDetails();
											}}
										>
											Less Details
										</p>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			);
		} else {
			return <Loader />;
		}
	}
}

export default connect(null, mapDispatchToProps)(explainDiv);
