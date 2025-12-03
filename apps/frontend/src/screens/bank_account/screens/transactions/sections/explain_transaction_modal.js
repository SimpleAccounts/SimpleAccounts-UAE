import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Row,
	Col,
	Label,
	Alert,
} from 'reactstrap';
import Select from 'react-select';

import { selectOptionsFactory } from 'utils';
import * as TransactionsActions from '../actions';
import { CommonActions } from 'services/global';
import './style.scss';
import {data}  from '../../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapDispatchToProps = (dispatch) => {
	return {
		transactionsActions: bindActionCreators(TransactionsActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class ExplainTransactionModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
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
			transactionId: '',
			chartOfAccountCategoryList: [],
			transactionCategoryList: [],
			categoryList: {},
			submitBtnClick: false,
			showChartOfAccount: false,
			transactionCategoryTypeList: [],
		};
		this.formikRef = React.createRef();
	}

	componentDidUpdate(prevProps) {
		if (this.props.selectedData !== prevProps.selectedData) {
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
					this.setState({
						transactionCategoryList: res.data,
					});
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

	addRow = () => {
		const explainList = [...this.state.explainList];
		this.setState({
			explainList: explainList.concat({
				id: this.state.idCount + 1,
				chartOfAccountCategoryId: '',
				transactionCategoryId: '',
				reconcileRrefId: '',
				categoryLabel: '',
			}),
			idCount: this.state.idCount + 1,
		});
	};

	deleteRow = (id) => {
		const ids = id;
		let newData = [];
		const data = this.state.explainList;
		newData = data.filter((obj) => obj.id !== ids);
		this.setState(
			{
				explainList: newData,
			},
			() => {
				this.calculateCurrentBalance();
			},
		);
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
						this.submitExplain(postData);
					} else {
						this.setState({
							showAlert: true,
						});
					}
				} else {
					if (!this.checkedRow()) {
						this.submitExplain(postData);
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

	render() {
		strings.setLanguage(this.state.language);
		const {
			openExplainTransactionModal,
			closeExplainTransactionModal,
			selectedData,
		} = this.props;
		const {
			chartOfAccountCategoryList,
			categoryList,
			showChartOfAccount,
			transactionAmount,
			currentBalance,
			explainList,
			transactionCategoryTypeList,
			submitBtnClick,
			showAlert,
			transactionCategoryList,
		} = this.state;
		return (
			<div className="explain-modal-screen">
				<Modal
					isOpen={openExplainTransactionModal}
					className="modal-primary explain-transaction-modal"
				>
					<ModalHeader toggle={this.toggleDanger}>
						<div className="header text">
							<h2>{strings.Explain+" "+strings.Transaction}# {`${selectedData.referenceNo}`}</h2>
							<i
								className="fa fa-close close-btn"
								onClick={() => closeExplainTransactionModal()}
							></i>
						</div>
					</ModalHeader>
					<ModalBody>
						<div className="content-details">
							{(this.checkedRow() && submitBtnClick) || showAlert ? (
								<Alert color="danger">
									Please Select all the remaining fields.
								</Alert>
							) : null}
							<Row>
								<Col lg={3}>
									<label className="value">{strings.Transaction+" "+strings.Amount}</label>
									<label className="value">{transactionAmount}</label>
								</Col>
								<Col lg={3}>
									<label className="value">{strings.CurrentBankBalance}</label>
									<label className="value">{currentBalance}</label>
								</Col>
								<Col lg={3} className="p-0">
									<label className="value">{strings.TransactionDate}</label>
									<label className="value">{selectedData.transactionDate}</label>
								</Col>
								<Col lg={3}>
									<div className="text-right">
										<Button
											color="primary"
											className="btn-square"
											onClick={this.addRow}
											disabled={currentBalance === 0 ? true : false}
										>
											<i className="fa fa-plus"></i>
										</Button>
									</div>
								</Col>
							</Row>
							<form>
								<div className="details-container">
									{explainList &&
										explainList.map((item, index) => (
											<div className="d-flex detail-row">
												<div className="sub-container">
													<div className="mb-3 mr-2" style={{ width: '30%' }}>
														<Label className="label">
															{strings.ChartOfAccountCategory}
														</Label>
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
																	'',
																	'transactionCategoryId',
																	item,
																);
																this.handleChange('', 'reconcileRrefId', item);
																// this.getCategoryList(text,e.target.value)
																this.getTransactionCategoryList(option.value);
															}}
															// className="select-default-width"
															placeholder={strings.ChartofAccounts}
															value={item.chartOfAccountCategoryId}
														/>
													</div>

													{explainList[`${index}`].chartOfAccountCategoryId && (
														<div className="mb-3 mr-2" style={{ width: '30%' }}>
															<Label className="label">
																{strings.TransactionCategory}
															</Label>
															<Select
																// className="custom-select-box"
																id="transaction_category_select"
																options={
																	transactionCategoryList
																		? transactionCategoryList
																		: []
																}
																onChange={(option) => {
																	this.handleChange(
																		option.label,
																		'categoryLabel',
																		item,
																	);
																	this.handleChange(
																		option,
																		'transactionCategoryId',
																		item,
																	);
																	this.handleChange(
																		'',
																		'reconcileRrefId',
																		item,
																	);
																	this.getCategoryList(
																		option.label,
																		option.value,
																	);
																}}
																// className="select-default-width"
																placeholder={strings.TransactionCategory}
																value={item.transactionCategoryId}
															/>
														</div>
													)}
													{explainList[`${index}`].transactionCategoryId
														.value && (
														<div className="mb-3" style={{ width: '40%' }}>
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
													)}
												</div>
												<div className="remove-row">
													<button
														className="btn"
														onClick={() => this.deleteRow(item.id)}
														disabled={explainList.length === 1}
													>
														<i className="fa fa-close"></i>
													</button>
												</div>
											</div>
										))}
									{transactionAmount > currentBalance && showChartOfAccount && (
										<Row className="m-0">
											<Col lg={5} className="pl-0">
												<label className="value">{strings.RemainingBalance}</label>
												<label className="value">{currentBalance}</label>
											</Col>
											<Col lg={5} className="p-0">
												<Label className="label">{strings.TransactionCategory}</Label>
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
													placeholder={strings.Select+strings.TransactionType}
													id="chartOfAccountId"
													name="chartOfAccountId"
												/>
											</Col>
										</Row>
									)}
								</div>
							</form>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							type="button"
							color="primary"
							className="btn-square"
							onClick={() => {
								this.handleSubmit();
							}}
							disabled={currentBalance === transactionAmount ? true : false}
						>
							<i className="fa fa-dot-circle-o"></i> {strings.Explain}
						</Button>
					</ModalFooter>
				</Modal>
			</div>
		);
	}
}

export default connect(null, mapDispatchToProps)(ExplainTransactionModal);
