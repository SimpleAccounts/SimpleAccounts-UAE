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
	Label,
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';

import * as ImportBankStatementActions from './actions';
import * as DetailBankAccountActions from '../bank_account/screens/detail/actions'
import { CommonActions } from 'services/global';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';
import download from 'downloadjs';

const mapStateToProps = (state) => {
	return {
		// bank_transaction_list: state.bank_account.bank_transaction_list
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		importBankStatementActions: bindActionCreators(
			ImportBankStatementActions,
			dispatch,
		),
		commonActions: bindActionCreators(CommonActions, dispatch),
		detailBankAccountActions : bindActionCreators(DetailBankAccountActions,dispatch)
	};
};
let strings = new LocalizedStrings(data);
const Papa = require("papaparse");
class ImportBankStatement extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			templateList: [],
			loading: false,
			initValue: {
				templateId: '',
			},
			fileName: '',
			selectedTemplate: '',
			tableDataKey: [],
			tableData: [],
			errorIndexList: [],
			showMessage: false,
		};
		this.formRef = React.createRef();
		this.options = {
			paginationPosition: 'top',
		};
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		console.log('location', this.props.location)
		if (this.props.location.state && this.props.location.state.bankAccountId) {
			console.log(this.props.location.state.bankAccountId);
			this.props.importBankStatementActions.getTemplateList().then((res) => {
				if (res.status === 200) {
					let id;
					id =
						this.props.location.state && this.props.location.state.id ? id : '';
					this.setState({
						selectedTemplate: id,
						templateList: res.data,
					});
				}
			});
		} else {
			this.props.history.push('/admin/banking/bank-account');
		}
		if (this.props.location.state && this.props.location.state.bankAccountId) {
			this.setState(
				{
					id: this.props.location.state.bankAccountId,
				},
				() => {
					//console.log(this.state.id);
				},
			);
			this.props.detailBankAccountActions
				.getBankAccountByID(this.props.location.state.bankAccountId)
				.then((res) => {
					this.setState(
						{
							date: res.openingDate
								? res.openingDate
								: '',
							reconciledDate: res.lastReconcileDate
								? res.lastReconcileDate
								: '',
						},
						() => {},
					);
				})
				.catch((err) => {
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
				});
		}
	};

	renderTransactionType = (cell, row) => {
		let classname = '';
		let value = '';
		if (row.status === 'Explained') {
			classname = 'badge-success';
			value = 'Cost of Goods Sold';
		} else if (row.status === 'Unexplained') {
			classname = 'badge-danger';
			value = 'Expense';
		} else {
			classname = 'badge-primary';
			value = 'Tax Claim';
		}
		return <span className={`badge ${classname} mb-0`}>{value}</span>;
	};

	columnClassNameFormat = (fieldValue, row, rowIdx, colIdx) => {
		const index = `${rowIdx.toString()},${colIdx.toString()}`;
		return this.state.errorIndexList.indexOf(index) > -1 ? 'invalid' : '';
	};

	handleSubmit = (data) => {
		this.setState({ loading: true });
		const { selectedTemplate } = this.state;
		let formData = new FormData();
		if (this.uploadFile && this.uploadFile?.files?.[0]) {
			formData.append('file', this.uploadFile?.files?.[0]);
		}
		formData.append('id', selectedTemplate ? +selectedTemplate : '');
		formData.append(
			'bankId',
			this.props.location.state.bankAccountId
				? this.props.location.state.bankAccountId
				: '',
		);
		// this.setState({
		//       // tableData: [...res.data],
		//       tableDataKey: ['a','b','c','d']
		//     })
		this.props.importBankStatementActions
			.parseFile(formData)
			.then((res) => {
				console.log(res);
				this.setState({
					tableData: res.data['data'],
					tableDataKey: res.data.data[0] ? Object.keys(res.data.data[0]) : [],
					errorIndexList: res.data.error ? res.data.error : [],
				});
				console.log('tableDataKey', this.state.tableDataKey);
				// })
			})
			.catch((err) => {
				// this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong' )
				// this.setState({ loading: false })
			});
	};

	handleSave = () => {
		const { selectedTemplate, tableData,id } = this.state;
		const postData = {
			bankId:id
				? id
				: '',
			templateId: selectedTemplate ? +selectedTemplate : '',
			importDataMap: tableData,
		};
		this.props.importBankStatementActions
			.importTransaction(postData)
			.then((res) => {
				if (res.data.includes('Transactions Imported 0')) {
					this.props.commonActions.tostifyAlert(
						'error',
						'Imported transaction should not contain any outdated transation',
						// this.props.history.push('/admin/banking/bank-account/transaction',
						//  {
						// 	bankAccountId: postData.bankId
						// })
					);
					this.setState({ selectedTemplate: [], tableData: [] ,showMessage : true});
				} else {
					this.props.commonActions.tostifyAlert('success', res.data);
					this.props.history.push('/admin/banking/bank-account/transaction', {
						bankAccountId: postData.bankId
					});
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	CreateNewTemplate = () => {
			this.props.history.push(
				'/admin/banking/upload-statement/transaction',
				{
					bankAccountId: this.props.location.state.bankAccountId,
					dataString:this.state.dataString,
					selectedTemplate: this.state.selectedTemplate,
				},
			)
	}

	export = () => {
		this.props.importBankStatementActions
			.downloadcsv()
			.then((res) => {
				if (res.status === 200) {
					const blob = new Blob([res.data],{type:'application/csv'});
					download(blob,'Sample Transaction.csv')
				} })
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};
	handleFileUpload = e => {
		const file = this.uploadFile?.files?.[0];
		const reader = new FileReader();
		reader.onload = (evt) => {
		  const bstr = evt.target.result;
		  this.setState({dataString: bstr},()=> this.CreateNewTemplate())
		};
		reader.readAsBinaryString(file);
		
		
		};
	render() {
		strings.setLanguage(this.state.language);
		const { templateList, initValue,showMessage } = this.state;
		return (
			<div className="import-bank-statement-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={8}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="fa glyphicon glyphicon-export fa-upload" />
												<span className="ml-2">{strings.ImportStatement}</span>
											</div>
										</Col>
										<Col>
								<Button title='Back'
										onClick={() => {
											this.props.history.push(
												'/admin/banking/bank-account/transaction',
												{ bankAccountId: this.state.id },
											);
										}}
									className=' pull-right'>X
									</Button>
								</Col>
									</Row>
								</CardHeader>
								<CardBody>
									<Row>
										<Col lg={12}>
											<div>
												<Formik
													initialValues={initValue}
													ref={this.formRef}
													onSubmit={(values, { resetForm }) => {
														this.handleSubmit(values);
													}}
													validate={() => {
														const date = this.state.tableData.transactionDate;
													
														const date1 = new Date(date);
														const date2 = new Date(this.state.date);
														let errors = {};
														if (
															date1 < date2 ||
															date1 < new Date(this.state.reconciledDate)
														) {
															errors.transactionDate =
																'Transaction Date Cannot be less than Bank opening date or Last Reconciled Date';
														}
														return errors;
													}}
													validationSchema={Yup.object().shape({
														templateId: Yup.string().required(
															'Select Template',
														),
													})}
												>
													{(props) => (
														<Form onSubmit={props.handleSubmit}>
														
															<Row >
																<Col lg={4}></Col>
																{/* <Col lg={2}>
																	<label>
																		 {strings.ParsingTemplate}
																	</label>
																	<FormGroup>
																		<Select
																		placeholder={strings.Select+" "+strings.Template}
																			options={templateList ? templateList.filter((i)=>i.value!=="1") : []}
																			value={
																				templateList &&
																				templateList.find(
																					(option) =>
																						option.value ===
																						+props.values.templateId,
																				)
																			}
																			onChange={(option) => {
																				if (option && option.value) {
																					props.handleChange('templateId')(
																						option.value,
																					);
																					this.setState({
																						selectedTemplate: option.value,
																					});
																				} else {
																					props.handleChange('templateId')('');
																					this.setState({
																						selectedTemplate: '',
																					});
																				}
																			}}
																			className={`${
																				props.errors.templateId &&
																				props.touched.templateId
																					? 'is-invalid'
																					: ''
																			}`}
																		/>
																		{props.errors.templateId &&
																			props.touched.templateId && (
																				<div className="invalid-feedback">
																					{props.errors.templateId}
																				</div>
																			)}
																	</FormGroup>
																</Col> */}
																{/* <Col lg={2} className='text-center m-4'>
																<h6><a className='myClickableThingy' style={{fontWeight:'400',color:'#20a8d8'}}
																	onClick={() => {
																		this.CreateNewTemplate();
																		}}>	<i className="fas fa-plus mr-1" />{strings.CreateNewTemplate}</a></h6>
																	
																		 
																</Col> */}
																<Col lg={4}></Col>
															</Row>
															<Row>
															<Col lg={4}></Col>
																<Col lg={4}>
																<div 
																	style={{
																		border:'1px solid grey',
																	
																	}}>
																	<div className="text-center mb-3 mt-4">
																	<i className="fas fa-upload  fa-5x"></i>

																	</div>
																	<div className="text-center mb-3"  style={{
                                                    					  fontSize: '22px',
                                                   								 }}>
																		Drag file to upload ,or
																		</div>
																		<div className="text-center mb-3">
																		<input
																			id="file"
																			ref={(ref) => {
																				this.uploadFile = ref;
																			}}
																			type="file"
																			accept=".csv,.xlsx"
																			onChange={(e) => {
																				this.setState({
																					fileName: e.target.value
																						.split('\\')
																						.pop(),
																					error: {
																						...this.state.error,
																						...{ file: '' },
																					},
																				});
																				// props.handleSubmit();
																				this.handleFileUpload()
																			}}
																		/>
																		</div>

															
																	</div>
																	
																	<h6 className="text-center mt-2" >Download: <a  style={{fontWeight:'400'}}
																	 href="#" 	onClick={() => {
																			this.export();
																		}}>Sample Transaction File</a></h6>
																	</Col>
																	<Col lg={4}></Col>
															</Row>
															<Row className="mt-4">
															{/* <Col lg={4}></Col>
																<Col className="text-center">
																	<Button
																		color="primary"
																		type="button"
																		className="btn-square"
																		onClick={() => {
																			props.handleSubmit();
																		}}
																		disabled={
																			(this.state.fileName.length === 0
																				? true
																				: false)

																		}
																	>
																		<i className="fa fa-dot-circle-o mr-1"></i>
																		 {strings.ParseFile}
																	</Button>
																</Col> */}
																<Col lg={4}></Col>
															</Row>
															<div 
															style={{display: this.state.showMessage === true ? '': 'none'}}
															className="mt-4"
															>
																<Label style={{color:"red",fontWeight:'bold'}}
																className="text-center">
																		{strings.Message}
																</Label>
															</div>
															</Form>
													)}
												</Formik>
											</div>
										</Col>
									</Row>
									
								
								</CardBody>
							</Card>
						</Col>
					</Row>
					<div style={{display : this.state.tableDataKey.length  > 0 ? '': 'none'}}>
					<Row>
						<Col lg={12} className="mx-auto">
					<Card>
					<CardBody>
					<div style={{ border:"1px solid grey",
								// width:'80%',
								
								paddingLeft:'10%',
								paddingRight:'10%'
								}}>
									<Row>
									<Col lg={4}></Col>
									<div  style={{
                                                      fontSize: '30px',
                                                    }}>
									Preview File: {this.state.fileName}
									</div>
									<div className="table-responsive 	"
									 style={{ border:"1px solid grey"}}
									>
										
										{this.state.tableDataKey.length  > 0 ? (
											<Col>
											<BootstrapTable
												data={this.state.tableData}
												keyField={this.state.tableDataKey[0]}
											//	pagination
											    className="import-table"
												options={this.options}
											>
												{this.state.tableDataKey.map((name, index) => (
													
													<TableHeaderColumn
														dataField={name}
														dataAlign="center"
														key={index}
														className="table-header-bg"
														columnClassName={this.columnClassNameFormat}
													>
														{name}
													</TableHeaderColumn>
												))}
											</BootstrapTable>
											</Col>
										) : null}
										
									</div>
									</Row>
									
									<Row style={{ width: '100%' }}>
										<Col lg={12} className="mt-2">
											<FormGroup className="text-right">
												{this.state.tableDataKey.length > 0 ? (
													<>
														<Button
															type="button"
															color="primary"
															className="btn-square mr-4 pull-left"
															onClick={this.handleSave}
															disabled={
																this.state.errorIndexList.length > 0
																	? true
																	: false
															}
														>
															<i className="fa fa-dot-circle-o"></i> {strings.Import}
														</Button>
														<Button
															color="secondary"
															className="btn-square"
															onClick={() => {
																this.props.history.push(
																	'/admin/banking/bank-account/transaction',
																	{
																		bankAccountId: this.props.location.state
																			.bankAccountId,
																	},
																);
															}}
														>
															<i className="fa fa-ban"></i>{strings.Cancel}
														</Button>
													</>
												) : null}
											</FormGroup>
										</Col>
									</Row> 
</div>
					</CardBody>

						</Card>
						</Col>
						</Row>
						</div>
				</div>
			</div>
			
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(ImportBankStatement);
