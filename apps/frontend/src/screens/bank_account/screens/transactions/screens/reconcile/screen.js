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
	Label,
	ButtonDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { CommonActions } from 'services/global';
import moment from 'moment';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import * as transactionReconcileActions from './actions';
import * as transactionActions from '../../actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { ViewBankAccount } from './sections';
import {data}  from '../../../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		transaction_category_list: state.bank_account.transaction_category_list,
		transaction_type_list: state.bank_account.transaction_type_list,
		project_list: state.bank_account.project_list,
		currency_list: state.bank_account.currency_list,
		reconcile_list: state.bank_account.reconcile_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		transactionActions: bindActionCreators(transactionActions, dispatch),
		transactionReconcileActions: bindActionCreators(
			transactionReconcileActions,
			dispatch,
		),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class ReconcileTransaction extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			createMore: false,
			loading: true,
			actionButtons: {},
			fileName: '',
			initValue: {
				closingBalance: '',
				date: '',
			},
			transaction_id: null,
			dialog: null,
			view: false,
			disabled: false,
			loadingMsg:"Loading...",
			disableLeavePage:false, 
		};
		this.options = {
			page: 1,
			sizePerPage: 10,
			onSizePerPageList: this.onSizePerPageList,
			onPageChange: this.onPageChange,
		};

		this.selectRowProp = {
			mode: 'checkbox',
			bgColor: 'rgba(0,0,0, 0.05)',
			clickToSelect: true,
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll,
		};
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
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
		this.formRef = React.createRef();
	}

	componentDidMount = () => {
		this.initializeData();
		console.log(this.props.currency_list)
		
	};

	initializeData = () => {
		const data = {
			pageNo: this.options.page ? this.options.page - 1 : 0,
			pageSize: this.options.sizePerPage,
		};
		if (this.props.location.state && this.props.location.state.bankAccountId) {
			const postData = {
				...data,
				bankId: this.props.location.state.bankAccountId,
			};
			this.props.transactionReconcileActions
				.getReconcileList(postData)
				.then((res) => {
					if (res.status === 200) {
						this.setState({
							loading: false,
						});
					}
				})
				.catch((err) => {
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
					this.setState({ loading: false });
				});
		} else {
			this.props.history.push('/admin/banking/bank-account');
		}
	};

	handleSubmit = (data, resetForm) => {
		this.setState({ disabled: true, loading:true, disableLeavePage:true, loadingMsg:"Reconciling..." });
		const bankAccountId = this.props.location.state.bankAccountId;
		const { closingBalance, date } = data;
		let formData = new FormData();
		formData.append('bankId ', bankAccountId ? bankAccountId : '');
		formData.append('closingBalance', closingBalance ? closingBalance : '');
		formData.append('date', date ? moment(date).format('DD-MM-YYYY') : '');
		this.props.transactionReconcileActions
			.reconcilenow(formData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ disabled: false });
					resetForm();
					if (res.data.status === 1) {
						this.props.commonActions.tostifyAlert('success', res.data.message);
						this.initializeData();
					} else {
						this.props.commonActions.tostifyAlert('error', res.data.message);
						this.setState({ disabled: false, loading:false, disableLeavePage:true, loadingMsg:"" });
					}
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	editDetails = () => {
		this.setState({
			view: false,
		});
	};

	closeReconciled = (_id) => {
		const message1 =
		<text>
		<b>Delete Bank Reconciliation?</b>
		</text>
		const message ='The bank reconciliation of the transaction will be undone. ';
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={() => this.removeReconciled(_id)}
					cancelHandler={this.removeDialog}
					message1={message1}
					message={message}
				/>
			),
		});
	};

	removeReconciled = (_id) => {
		this.removeDialog();
		let { selected_id_list } = this.state;
		let obj = {
			ids: [_id],
		};
		this.props.transactionReconcileActions
			.removeBulkReconciled(obj)
			.then(() => {
				this.props.commonActions.tostifyAlert(
					'success',
					'Deleted Successfully',
				);
				this.initializeData();
				this.setState({
					selected_id_list: [],
				});
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	toggleActionButton = (index) => {
		let temp = Object.assign({}, this.state.actionButtons);
		if (temp[parseInt(index, 10)]) {
			temp[parseInt(index, 10)] = false;
		} else {
			temp[parseInt(index, 10)] = true;
		}
		this.setState({
			actionButtons: temp,
		});
	};

	renderActions = (cell, row) => {
		return (
			<div>
				<ButtonDropdown
					isOpen={this.state.actionButtons[row.reconcileId]}
					toggle={(e) => {
						e.preventDefault();
						this.toggleActionButton(row.reconcileId);
					}}
				>
					<DropdownToggle size="sm" color="primary" className="btn-brand icon">
						{this.state.actionButtons[row.reconcileId] === true ? (
							<i className="fas fa-chevron-up" />
						) : (
							<i className="fas fa-chevron-down" />
						)}
					</DropdownToggle>
					<DropdownMenu right>
						<DropdownItem onClick={() => this.closeReconciled(row.reconcileId)}>
							<i className="fa fa-trash" />  {strings.Delete}
						</DropdownItem>
					</DropdownMenu>
				</ButtonDropdown>
			</div>
		);
	};

	render() {
		strings.setLanguage(this.state.language);
		const { reconcile_list } = this.props;
		const { initValue, loading, dialog } = this.state;
		return (
			<div className="detail-bank-transaction-screen">
				<div className="animated fadeIn">
					{dialog}
					<Row>
						<Col lg={12} className="mx-auto">
							{loading ? (
								<Loader />
							) : this.state.view ? (
								<ViewBankAccount
									initialVals={initValue}
									editDetails={() => {
										this.editDetails();
									}}
								/>
							) : (
								<Card>
									<CardHeader>
										<Row>
											<Col lg={12}>
												<div className="h4 mb-0 d-flex align-items-center">
													<i className="icon-doc" />
													<span className="ml-2">{strings.ReconcileTransaction} </span>
												</div>
											</Col>
										</Row>
									</CardHeader>
									<CardBody>
										<Row>
											<Col lg={12}>
												<Formik
													initialValues={initValue}
													ref={this.formRef}
													onSubmit={(values, { resetForm }) => {
														this.handleSubmit(values, resetForm);
													}}
													validationSchema={Yup.object().shape({
														date: Yup.date().required('Date is Required'),
														closingBalance: Yup.string().required(
															'Closing Balance is Required',
														),
													})}
												>
													{(props) => (
														<Form onSubmit={props.handleSubmit}>
															<Row>
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="date"><span className="text-danger">* </span>{strings.BankClosingDate}</Label>
																		<DatePicker
																			id="date"
																			name="date"
																			placeholderText={strings.Select+" "+strings.BankClosingDate}
																			showMonthDropdown
																			showYearDropdown
																			dateFormat="dd-MM-yyyy"
																			dropdownMode="select"
																			maxDate={new Date()}
																			value={
																				props.values.date
																					? moment(props.values.date).format(
																							'DD-MM-YYYY',
																					  )
																					: ''
																			}
																			// selected={props.values.transactionDate}
																			onChange={(value) =>
																				props.handleChange('date')(value)
																			}
																			className={`form-control ${
																				props.errors.date && props.touched.date
																					? 'is-invalid'
																					: ''
																			}`}
																		/>
																		{props.errors.date &&
																			props.touched.date && (
																				<div className="invalid-feedback">
																					{props.errors.date}
																				</div>
																			)}
																	</FormGroup>
																</Col>
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="closingBalance"><span className="text-danger">* </span>
																			 {strings.ClosingBalance} 
																		</Label>
																		<Input
																			type="text"
																			maxLength="14,2"
																			min="0"
																			id="closingBalance"
																			name="closingBalance"
																			placeholder={strings.Amount}
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regDecimal.test(
																						option.target.value,
																					)
																				) {
																					props.handleChange('closingBalance')(
																						option,
																					);
																				}
																			}}
																			value={props.values.closingBalance}
																			className={
																				props.errors.closingBalance &&
																				props.touched.closingBalance
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.closingBalance &&
																			props.touched.closingBalance && (
																				<div className="invalid-feedback">
																					{props.errors.closingBalance}
																				</div>
																			)}
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																<Col lg={12} className="mt-5">
																	<FormGroup className="text-right">
																		<Button
																			type="button"
																			color="primary"
																			className="btn-square mr-3"
																			disabled={this.state.disabled}
																			onClick={props.handleSubmit}
																		>
																			<i className="fa fa-dot-circle-o"></i>{' '}
																			 {this.state.disabled
																			? 'Reconciling...'
																			: strings.reconcile }
																		</Button>
																		<Button
																			color="secondary"
																			className="btn-square"
																			onClick={() =>
																				this.props.history.push(
																					'/admin/banking/bank-account/transaction',
																					{
																						bankAccountId: this.props.location
																							.state.bankAccountId,
																					},
																				)
																			}
																		>
																			<i className="fa fa-ban"></i> {strings.Cancel}
																		</Button>
																	</FormGroup>
																</Col>
															</Row>
														</Form>
													)}
												</Formik>
											</Col>
										</Row>
										<hr />
										<Row>
											<BootstrapTable
												data={reconcile_list.data ? reconcile_list.data.map((i)=>{
													return {...i,closingBalance:`AED ${i.closingBalance?.toFixed(2)}`
													}
												}) : []}
												// pagination={
												// 	reconcile_list &&
												// 	reconcile_list.data &&
												// 	reconcile_list.data.length > 0
												// 		? true
												// 		: false
												// }
												fetchInfo={{
													dataTotalSize: reconcile_list.count
														? reconcile_list.count
														: 0,
												}}
												selectRow={this.selectRowProp}
												search={false}
												options={this.options}
												version="4"
												hover
												remote
												keyField="bankAccountId"
												multiColumnSort
												// className="bank-account-table"
												csvFileName="bank_account_list.csv"
												ref={(node) => {
													this.table = node;
												}}
											>
												<TableHeaderColumn
													dataField="reconciledDate"
													dataSort
													// width="10%"
												>
													{strings.RECONCILEDATE}
												</TableHeaderColumn>
												<TableHeaderColumn
													dataField="reconciledDuration"
													dataSort
													// width="15%"
												>
													 {strings.RECONCILEDURATION}
												</TableHeaderColumn>
												<TableHeaderColumn
												dataAlign="right"
													dataField="closingBalance"
													dataSort
													 width="15%"
												>
												 {strings.ClosingBalance}
												</TableHeaderColumn>
												<TableHeaderColumn
													className="text-right"
													columnClassName="text-right"
													width="5%"
													dataSort={false}
													export={false}
													dataFormat={this.renderActions}
												></TableHeaderColumn>
											</BootstrapTable>
										</Row>
									</CardBody>
								</Card>
							)}
						</Col>
					</Row>
				</div>
			{this.state.disableLeavePage ?"":<LeavePage/>}
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(ReconcileTransaction);
