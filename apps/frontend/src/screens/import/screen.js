import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Button,
	Col,
	FormGroup,
	Card,
	CardHeader,
	CardBody,
	Row,
	TabContent,
	TabPane,
	Nav,
	NavItem,
	NavLink,
	Form,
	Label,
	Table,
	Input
} from 'reactstrap';
import Select from 'react-select';
import { AuthActions, CommonActions } from 'services/global';
import 'react-toastify/dist/ReactToastify.css';
import * as Yup from "yup";
import 'react-datepicker/dist/react-datepicker.css'
import DatePicker from 'react-datepicker'
import { Formik } from 'formik';
import './style.scss';
import * as MigrationAction from './actions';
import {data}  from '../Language/index'
import { selectOptionsFactory } from 'utils';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { isDate, upperFirst } from 'lodash-es';

import styled from 'styled-components';
import { ChartOfAccountsModal } from './modal';

import moment from 'moment';
import { Date } from 'core-js';
import download from 'downloadjs';
import { align } from '@progress/kendo-drawing';
import { toast } from 'react-toastify';
import { StringStream } from 'codemirror';
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		version: state.common.version,
	};
};

// const eye = require('assets/images/settings/eye.png');
// const noteye = require('assets/images/settings/noteye.png')
const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		migrationActions: bindActionCreators(MigrationAction, dispatch),
	};
};

const TabList = styled.ul`
  height: 48px;
  display: flex;

  padding: 0;
  margin: 0;
`;
const Tab = styled.li`
  list-style: none;
  text-align: center;
  font-family: sans-serif;
  line-height: 48px;
  flex: 0.008 0 auto;
  height: inherit;
`;

let strings = new LocalizedStrings(data);
class Import extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initValue: {},
			language: window['localStorage'].getItem('language'),
			loading: false,
			fileName: '',
			disabled: false,
			product_list: [],
			version_list: [],
			productName: '',
			version: '',
			type: '',
			upload: false,
			migration: false,
			migration_list: [],
			ParentActiveTab: new Array(2).fill('1'),
			activeTab: new Array(6).fill('1'),
			nestedActiveDefaultTab: false,
			date: '',
			tabs: [],
			file_data_list: [],
			openModal: false,
			listOfExist: [],
			dummylistOfExist: [],
			selectedRows: [],
			effectiveDate:new Date(),
			openingBalance:0,
			dummylistOfNotExist: [],
			coaName:'',
			csvFileNamesData:[
				{srNo:1,fileName:"Chart Of Accounts.csv",download:true},
				{srNo:2,fileName:"Opening Balances.csv",download:true},
				{srNo:3,fileName:"Contacts.csv",download:true},
				{srNo:4,fileName:"Product.csv",download:true},
				{srNo:5,fileName:"Invoice.csv",download:true},
				{srNo:6,fileName:"Credit Note.csv",download:true},
				]
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
		this.getInitialData();
		
	};
	DeleteFile = () => {

		
		// const formData = new FormData();
		// formData.append('fileNames', this.state.selectedRows ? this.state.selectedRows :'');

		const formData = { 'fileNames': this.state.selectedRows ? this.state.selectedRows : '' }
		console.log(formData)
		this.props.migrationActions
			.deleteFiles(formData)
			.then((res) => {
				if (res.status === 200) {					
					this.setState({
						disabled: false,
						migration_list: res.data=='No Files Available'?[]:res.data
					});
					this.props.commonActions.tostifyAlert(
						'success',
						'Files Deleted Successfully.',
					);

				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	}

	onRowSelect = (row, isSelected, e) => {
		let tempList = [];
		if (isSelected) {
			
			tempList = Object.assign([], this.state.selectedRows);
			tempList.push(row.fileName);
		} else {
			this.state.selectedRows.map((item) => {
				
				if (item !== row.fileName) {
					tempList.push(item);
				}
				return item;
			});
		}
		this.setState({
			selectedRows: tempList,
		});
	};

	onSelectAll = (isSelected, rows) => {
		let tempList = [];
		if (isSelected) {
			rows.map((item) => {
				tempList.push(item.fileName);
				return item;
			});
		}
		this.setState({
			selectedRows: tempList,
		});
	};
	getInitialData = () => {
	};


	toggle = (tabPane, tab) => {
		const newArray = this.state.activeTab.slice();
		newArray[parseInt(tabPane, 10)] = tab;
		this.setState({
			activeTab: newArray,
		});
	};
	toggleParent = (tabPane, tab) => {
		const newArray = this.state.ParentActiveTab.slice();
		newArray[parseInt(tabPane, 10)] = tab;
		this.setState({
			ParentActiveTab: newArray,
		});
	};
	exportAll=()=>{
		this.export("Chart Of Accounts.csv")
		this.export("Contacts.csv")
		this.export("Credit Note.csv")
		this.export("Invoice.csv")
		this.export("Opening Balances.csv")
		this.export("Product.csv")
	}
	export=(filename)=>{
	   this.props.migrationActions
		.downloadcsv(filename)
		.then((res) => {
			if (res.status === 200) {
				// this.setState({
				// 	fileLink: res
				// });
				const blob = new Blob([res.data],{type:'application/csv'});
				download(blob,filename)
				// this.props.commonActions.tostifyAlert(
				// 	'success',
				// 	'File downloaded successfully.',
				// );
			
			}
		})
		.catch((err) => {
			this.props.commonActions.tostifyAlert(
				'error',
				err && err.data ? err.data.message : 'Something Went Wrong',
			);
		});
	}
	handleChange = (key, val) => {
		this.setState({
			[key]: val,
		});
	};

	// togglePasswordVisiblity = () => {
	// 	this.setState({
	// 		passwordShown: !this.state.passwordShown,
	// 	});
	// };

	togglePasswordVisiblity = () => {
		const { isPasswordShown } = this.state;
		this.setState({ isPasswordShown: !isPasswordShown });
	};

	saveAccountStartDate = (data, resetForm) => {
		const date = data.date;
		let formdata=new FormData()
		formdata.append('accountStartDate',date ? date : null)
		if (isDate(date)) {
			this.props.migrationActions
				.saveAccountStartDate(formdata)
				.then((res) => {
					if (res.status === 200) {
						this.setState({
							disabled: false,
							upload: true,
							migration: true,
						});
						this.props.commonActions.tostifyAlert(
							'success',
							'Date Saved Successfully.',
						);
						this.toggle(0, '2')
					}
				})
				.catch((err) => {
					this.setState({ disabled: false });
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
				});
		} else {
			alert("please select Date")
		}

	}

	handleSubmitForOpeningBalances = () => {
		
		const formData = new FormData()
		this.state.listOfExist4.forEach((data, index) => {
			formData.append(`persistModelList[${index}].transactionCategoryId`, data.transactionId);
		    formData.append(`persistModelList[${index}].effectiveDate`, moment(data.effectiveDate));
			formData.append(`persistModelList[${index}].openingBalance`, data.openingBalance);
		});
		// formData.append('persistModelList',JSON.stringify(listObject))
		this.props.migrationActions
				.addOpeningBalance(formData)
				.then((res) => {
					if (res.status === 200) {
						this.setState({
							disabled: false,
							
						
						});
						this.props.commonActions.tostifyAlert(
							'success',
							'Migration Data Saved Successfully.',
						);
						
						this.props.history.push('/admin/settings/migrate',{name:this.state.name, version:this.state.version})
					
					}
				})
				.catch((err) => {
					this.setState({ disabled: false });
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
				});
	}
	Upload = (validFiles) => {
		this.setState({ loading: true, disabled: true });

		let formData = new FormData();
		for (const file of validFiles) {
			formData.append('files', file);
		}

		this.props.migrationActions
			.uploadFolder(formData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({
						disabled: false,
						upload: true,
						migration: true,
						migration_list: res.data
					});
					this.props.commonActions.tostifyAlert(
						'success',
						'Files Uploaded Successfully.',
					);

				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Please Select .CSV File',
				);
			});

	};

	listOfTransactionCategory = (data) => {

		this.props.migrationActions
			.listOfTransactionCategory()
			.then((res) => {
				if (res.status === 200) {
					this.setState({
						disabled: false,
						file_data: res.data,
						listOfExist: res.data.listOfExist,
						listOfExist4: res.data.listOfExist,
						dummylistOfExist: res.data.listOfExist,
						 dummylistOfNotExist: res.data.listOfNotExist,
					});
					let newData = [...this.state.listOfExist4]
					newData = newData.map((data) => {
						data.effectiveDate = this.state.effectiveDate
						data.openingBalance = this.state.openingBalance
						return data
					})
					console.log(newData)
					this.setState({
						listOfExist4: newData
					})
					if(res.data.listOfExist.length ===0)
					{	
						this.props.commonActions.tostifyAlert(
							'success',
							'Migration Data Saved Successfully.',
						);
					
						this.props.history.push('/admin/settings/migrate',{name:this.state.name, version:this.state.version})
					}
				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});


	};

	listOfFiles = (data) => {
		this.props.migrationActions
			.getListOfAllFiles()
			.then((res) => {
				if (res.status === 200) {
					this.setState({
						disabled: false,
						tabs: res.data
					});

				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});

	};
	getFileData = (value) => {
		const data = {
			fileName: value
		};

		this.props.migrationActions
			.getFileData(data)
			.then((res) => {
				if (res.status === 200) {

					this.setState({
						disabled: false,
						file_data_list: res.data

					});

				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});

	};
	productList = () => {
	this.props.migrationActions.migrationProduct()
	.then((res) => {
		if (res.status === 200) {
			this.setState({ product_list: res.data });
		}
	})
	.catch((err) => {
		this.props.commonActions.tostifyAlert(
			'error',
			err && err.data ? err.data.message : 'Something Went Wrong',
		);
		this.setState({ loading: false });
	});
}
	versionlist = (productName) => {
		 
		this.props.migrationActions.getVersionListByPrioductName(productName)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ version_list: res.data });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
				this.setState({ loading: false });
			});;

	}


	closeModal = (res) => {
		this.setState({ openModal: false });
		this.listOfTransactionCategory()
	};

	showHeader = (s) => {

		return upperFirst(s.replace(/([a-z])([A-Z])/g, '$1 $2'));

	}
	showTD = (s) => {
		return (s !== "" ? s : "-")
	}
	showTable = (file_data_list) => {

		if (Array.isArray(file_data_list) && file_data_list.length !== 0) {
			let colDataObject = file_data_list[0] ? file_data_list[0] : {};
			const cols = colDataObject ? Object.keys(colDataObject) : [];
			return (
				file_data_list.length > 0 ? (
					<Table responsive>
						<thead>
							<tr className="header-row">
								{cols.map((column, index) => {
									return (
										<th
											key={index}
										style={{backgroundColor: '#dfe9f7'}}
										>
											<span>{this.showHeader(column)}</span>
										</th>
									);
								})}
							</tr>
						</thead>
						<tbody className="data-column">
							{
								file_data_list.length > 0 ? (
									file_data_list.map(
										(item, index) => {

											return (
												<>
													<tr
														style={{ background: '#f7f7f7' }}
														key={index}
													>

														{
															// JSON.stringify(item)
															cols.map((column, index) => {
																return (
																	<td
																		key={index}
																		style={{ fontWeight: '600', textAlign: 'center' }}
																		className={column.align ? 'text-center' : ''}
																	>
																		<span>{this.showTD(item[column])}</span>
																	</td>
																);
															})

														}

													</tr>
												</>
											);
										}
									)

								) : (
									<tr style={{ borderBottom: '2px solid lightgray' }}>
										<td style={{ textAlign: 'center' }} colSpan="9">
										{strings.datadd}
										</td>
									</tr>
								)
							}
						</tbody>

					</Table>
				) : (
					<tr style={{ borderBottom: '2px solid lightgray' }}>
						<td style={{ textAlign: 'center' }} colSpan="9">
						{strings.datadd}
						</td>
					</tr>
				)
			);

		}
	}

	showNotExistList = () => {
		if (this.state && this.state.dummylistOfNotExist) {
			let listObject = []
			// let listObject = this.state.dummylistOfExist ? this.state.dummylistOfExist : []

			
			let list = this.state.dummylistOfNotExist && this.state.dummylistOfNotExist !="" ? this.state.dummylistOfNotExist : []
			let listOfNotExist1 = list.map((data, i) => {
				
				listObject.push({ transactionName: data })
				return data;
			});
			let temp = [...this.state.dummylistOfExist]
			const listOfExist1 = [...temp, ...listObject]
			let val = listOfExist1
			// this.setState({merged:val})
			console.log(listOfExist1)
			return (
				<Row className="text-center">
					<Col><Row>
						<div style={{ width: "100%" }}><b>{strings.sa}</b></div>
						<div>
							<BootstrapTable
								data={this.state && this.state.listOfExist ? this.state.listOfExist : []}
								version="4"
								hover
								keyField="id"
								remote
								//   fetchInfo={{ dataTotalSize: salaryRole_list.count ? salaryRole_list.count : 0 }}
								ref={(node) => this.table = node}
								className="text-center"
							>
								<TableHeaderColumn
									dataField="transactionId"
									dataFormat={this.renderCode}
									className="table-header-bg text-center"
								>
									{strings.accCode}
								</TableHeaderColumn>
								<TableHeaderColumn
									dataField="transactionName"
									dateFormat={this.renderAccountName}
									className="table-header-bg text-center"
								>
									{strings.accName}
								</TableHeaderColumn>

							</BootstrapTable>
						</div>



					</Row></Col>
					<div style={{ width: "20%" }}>.
						<BootstrapTable
							data={listOfExist1 && listOfExist1 ? listOfExist1 : []}
							// data={this.state && this.state.merged ? this.state.merged : []}
							version="4"
							hover
							keyField="id"
							remote
							//   fetchInfo={{ dataTotalSize: salaryRole_list.count ? salaryRole_list.count : 0 }}
							ref={(node) => this.table = node}
							className="lockSideBorder"
						>
							<TableHeaderColumn
								dataField="transactionId"
								dataFormat={this.renderLocks}
								className=" text-center"
							>
								.
							</TableHeaderColumn>
						</BootstrapTable>
					</div>
					<Col><Row>
						<div style={{ width: "100%" }}><b>{strings.zb}</b></div>
						<div>
							{/* {this.showNotExistList()} */}

							<BootstrapTable
								data={listOfExist1 && listOfExist1 ? listOfExist1 : []}
								version="4"
								hover
								keyField="id"
								remote

								//   fetchInfo={{ dataTotalSize: salaryRole_list.count ? salaryRole_list.count : 0 }}
								ref={(node) => this.table = node}
								className="text-center"
							>
								<TableHeaderColumn
									dataField="transactionId"
									dataFormat={this.renderCode1}
									className="table-header-bg text-center"
								>
									{strings.accCode}
								</TableHeaderColumn>
								<TableHeaderColumn
									dataField="transactionName"
									dateFormat={this.renderAccountName1}
									className="table-header-bg text-center"
								>
								{strings.accName}
								</TableHeaderColumn>
							</BootstrapTable>
						</div>
					</Row></Col>
				</Row>

			);
		}


		// console.log(list, "list")
		// this.setState({ mergedList: list })


	}
	openForgotPasswordModal = () => {
		this.setState({ openForgotPasswordModal: true });
	};

	closeForgotPasswordModal = (res) => {
		this.setState({ openForgotPasswordModal: false });
	};
	renderLocks = (cell, row) => {

		if (row.transactionId) {
			return (<div className=" text-center"><i className="fas fa-lock"></i> </div>);
		}
		else {
			return (<div className=" text-center" style={{padding:" 0px !important",height: "21px"}}> 	<button className="btn-sm"style={{ color: "white", backgroundColor: "#2266d8",}} onClick={() => {
				this.setState({
					openModal: true,
					coaName:row.transactionName
				})
			}}>Create</button> </div>);
		}
	}
	renderCode = (cell, rows) => {
		return (<div className="text-center">{rows.accountCode ? rows.accountCode : '-'} </div>);
	};
	renderAccountName = (cell, rows) => {
		return (<div className=" text-center !important" style={{ textAlign: "center" }}>{rows.transactionName ? rows.transactionName : '-'} </div>);
	};
	renderCode1 = (cell, rows) => {
		return (<div className="text-center">{rows.accountCode ? rows.accountCode : '-'} </div>);
	};
	renderAccountName1 = (cell, rows) => {
		return (<div className=" text-center !important" style={{ textAlign: "center" }}>{rows.transactionName ? rows.transactionName : '-'} </div>);
	};


	setDate = (row, value) => {
		
		let newData = [...this.state.listOfExist4]
		 newData.map((data) => {
			if (row.transactionId === data.transactionId) {
				data.effectiveDate =value
				return data
			}
		})
		
		this.setState({
			listOfExist4: newData
		})
	}

	renderDownloadActions=(cell,row)=>{
		return(
			<Button name="button"  className="btn-square mr-3"
								   onClick={() => {
												this.export(row.fileName);
													}}>
													<i className="fas fa-download"></i>
				</Button>
		)
	}

	setOpeningBalances = () => {
		
		const cols = [
			{
				label: 'transaction Name',
				key: 'transactionName'
			},
			{
				label: 'chart Of AccountName',
				key: 'chartOfAccountName'

			},
			{
				label: 'Effective date',
				key: 'effectiveDate'
			},

			{
				label: 'Opening balance',
				key: 'openingBalance'
			},


		]
		return (
			<React.Fragment>
				<div >
					<BootstrapTable
						search={false}
						options={this.options}
						data={this.state.listOfExist4 || []}
						version="4"
						hover
						keyField="id"
						remote
						trClassName="cursor-pointer"
						ref={(node) => this.table = node}
					>
						{
							cols.map((col, index) => {
								
								const format = (cell, row) => {
									if (col.key === 'effectiveDate') {
										return (
											<DatePicker
											id="effectiveDate"
											name="effectiveDate"
											showMonthDropdown
											showYearDropdown
											dateFormat="dd-MM-yyyy"
											dropdownMode="select"
											value={cell}
											 selected={cell}
											onChange={(value) => {
												this.setDate(row, value)
											}}
										/>
										);
									} if (col.key === 'openingBalance') {
										return (
											<Input
												type="number"
												id="openingBalance"
												name="openingBalance"
												value={cell}
												onChange={(evt) => {
													let value = parseInt(evt.target.value);
													let newData = [...this.state.listOfExist4]
													newData.map((data) =>{
														if (row.transactionId === data.transactionId) {
															data.openingBalance = value
															return data
														}
													})
													this.setState({
														listOfExist4: newData
													})
												}}
											/>
										);
									}
									else {
										return (  
											<div>{cell}</div>
										)
									}

								}
								return (
									<TableHeaderColumn
										key={index}
										dataFormat={format}
										dataField={col.key}
										dataAlign="center"
										className="table-header-bg"
									>
										{col.label}
									</TableHeaderColumn>

								)
							})
						}


					</BootstrapTable>
				</div>
			</React.Fragment>

		)
	}


	render() {
		strings.setLanguage(this.state.language);
		const { isPasswordShown, product_list, version_list, tabs, file_data_list,listOfExist4,csvFileNamesData } = this.state;
		const { initValue, migration_list } = this.state;
		console.log(listOfExist4)
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
		return (
			<div className="import-bank-statement-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="fa glyphicon glyphicon-export fa-upload" />
												<span className="ml-2">{strings.Migration}</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<Nav tabs pills className="m-2 mt-3">
								<NavItem>
									<NavLink
										active={this.state.ParentActiveTab[0] === '1'}
										onClick={() => {
											this.toggleParent(0, '1');
										}}
									>
									{strings.import}
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										active={this.state.ParentActiveTab[0] === '2'}
										onClick={() => {
											this.toggleParent(0, '2');
										}}
									>
								{strings.down}
									</NavLink>
								</NavItem>
							</Nav>
							<TabContent activeTab={this.state.ParentActiveTab[0]}>
	{/* PARENT TAB 2 */}
								<TabPane tabId="1">
									<div className="table-wrapper">
									<CardBody className="log-in-screen">
									<Nav className="justify-content-center" tabs pills  >
										<NavItem>
											<NavLink
												active={this.state.activeTab[0] === '1'}
												// onClick={() => {
												// 	this.toggle(0, '1');
												// }}
											>
												<h4 style={{ margin: "4px 2px 4px 2px" }}>1</h4>
											</NavLink>
										</NavItem>
										<NavItem>
											<NavLink
												active={this.state.activeTab[0] === '2'}
												// onClick={() => {
												// 	this.toggle(0, '2');
												// }}
											>
												<h4 style={{ margin: "4px 0px 4px 0px" }}>2</h4>
											</NavLink>
										</NavItem>
										<NavItem>
											<NavLink
												active={this.state.activeTab[0] === '3'}
												// onClick={() => {
												// 	this.toggle(0, '3');
												// }}
											>
												<h4 style={{ margin: "4px 0px 4px 0px" }}>3</h4>
											</NavLink>
										</NavItem>
										<NavItem>
											<NavLink
												active={this.state.activeTab[0] === '4'}
												// onClick={() => {
												// 	this.toggle(0, '4');
												// }}
											>
												<h4 style={{ margin: "4px 0px 4px 0px" }}>4</h4>
											</NavLink>
										</NavItem>
									</Nav>
	{/* Child TABs  */}
									<TabContent activeTab={this.state.activeTab[0]}>
										<TabPane tabId="1">

											<div className="create-employee-screen">
												<div className="animated fadeIn">
													<div className="text-center mb-5"><h3>{strings.heading}</h3></div>
													<Formik
														initialValues={this.state}
														onSubmit={(values, { resetForm }) => {
															this.saveAccountStartDate(values, resetForm)
														}}
														validate={(values) => {
															let errors = {};

															if (values.date === '' && values.date === null) {
																errors.date = 'Date is required';
															}
															if (values.date === undefined) {
																errors.date = 'Date is required';
															}

															return errors;
														}}

														validationSchema={Yup.object().shape({
															date: Yup.string().required(
																'Date is required',
															),
														})}

													>
														{(props) => (

															<Form className="mt-3" onSubmit={props.handleSubmit}>
																<div className="text-center dateWidth" style={{ display: "flex", marginLeft: "40%" , width: "75%"}}>
																	<div className="mt-2" style={{ width: "7%" }}>	<span className="text-danger"> * </span>{strings.date}	</div>
																	<DatePicker
																		className={`form-control ${props.errors.date && props.touched.date ? "is-invalid" : ""}`}
																		id="date"
																		name="date"
																		placeholderText={strings.selectdate}
																		showMonthDropdown
																		showYearDropdown
																		dateFormat="dd-MM-yyyy"
																		dropdownMode="select"
																		style={{ textAlign: "center" ,marginLeft: "30%" }}
																		selected={props.values.date}
																		value={props.values.date}
																		maxDate={new Date}
																		onChange={(value) => {
																			props.handleChange("date")(value)
																			this.setState({ date: value })
																		}}
																	/>


																</div>
																<div className="text-center" >
																	{props.errors.date && props.touched.date && (
																		<div className="text-danger">{props.errors.date}</div>
																	)}<br></br>
																	<b>{strings.not} </b><i> {strings.not1}<br /> {strings.not2}</i>



																</div>

																<Row>
																	<Col lg={12} className="mt-5">
																		<div className="table-wrapper">
																			<FormGroup className="text-center">


																				<Button name="button" color="primary" className="btn-square pull-right mr-3"
																					onClick={() => {
																							//	added validation popup	msg
																						props.handleBlur();
																						if(props.errors &&  Object.keys(props.errors).length != 0)
																						this.props.commonActions.fillManDatoryDetails()
																						this.setState({ createMore: false }, () => {
																							props.handleSubmit()
																						})
																						this.productList();
																					}}>
																					{strings.nex}	<i className="far fa-arrow-alt-circle-right mr-1"></i>
																				</Button>

																			</FormGroup>
																		</div>

																	</Col>
																</Row>
															</Form>
														)
														}
													</Formik>
												</div>

											</div>
										</TabPane>
										<TabPane tabId="2">
											<Row>
												<Col lg={12}>
													<div>
														<div className="text-center mb-5"><h3>{strings.up}</h3></div>
														<Formik
															initialValues={initValue}
															ref={this.formRef}
															onSubmit={(values, { resetForm }) => {
																this.handleSubmit(values);
															}}

														>
															{(props) => (
																<Form onSubmit={props.handleSubmit}>
																	<Row>
																		<Col></Col>
																		<Col lg={3}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="productName">
																					{/* {strings.PlaceofSupply} */}{strings.appName}
																				</Label>
																				<Select
																					styles={customStyles}
																					id="productName"
																					name="productName"
																					placeholder={strings.selpro}
																					options={
																						product_list
																							? selectOptionsFactory.renderOptions(
																								'label',
																								'value',
																								product_list,
																								'Products list',
																							)
																							
																							: []
																					}
																					value={
																						product_list &&
																						selectOptionsFactory
																							.renderOptions(
																								'label',
																								'value',
																								product_list,
																								'Products list',
																							)
																							.find(
																								(option) =>
																									option.value ===
																									+props.values.productName,
																							)
																							
																					}
																					
																				
																					onChange={(option) => {
																						if (option.value != null) {
																							 
																							props.handleChange('productName')(
																								option.label,
																								
																								this.versionlist(option.label)
																								
																							);
																							document.getElementById('file').value = "";
																							
																					this.setState({name:option.label})
																						} else {
																							props.handleChange('productName')('');
																						}
																					}}
																					className={
																						props.errors.productName &&
																							props.touched.productName
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.productName &&
																					props.touched.productName && (
																						<div className="invalid-feedback">
																							{props.errors.productName}
																						</div>
																					)}
																			</FormGroup>
																		</Col>

																		<Col lg={3}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="version">
																					{/* {strings.PlaceofSupply} */}{strings.ver}
																				</Label>
																				<Select

																					id="version"
																					name="version"
																					placeholder={strings.selver}
																					options={
																						version_list
																							? selectOptionsFactory.renderOptions(
																								'label',
																								'value',
																								version_list,
																								'version list',

																							)
																							: []
																					}
																					value={
																						version_list &&
																						selectOptionsFactory
																							.renderOptions(
																								'label',
																								'value',
																								version_list,
																								'version',
																							)
																							.find(
																								(option) =>
																									option.value ===
																									+props.values.version,
																							)
																					}
																					className={
																						props.errors.version &&
																							props.touched.version
																							? 'is-invalid'
																							: ''
																					}
																					onChange={(option) =>
																						{props.handleChange('version')(
																							option.label,
																						)
																						
																						this.setState({version:option.label})
																						}
																					}
																				/>
																				{props.errors.version &&
																					props.touched.version && (
																						<div className="invalid-feedback">
																							{props.errors.version}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																		<Col></Col>
																	</Row>
																	<div style={{display: props.values.version != undefined ? '' : 'none'}}>
																	<div className="mt-4" >
																		<Row>
																			<Col lg={4}></Col>
																			<Col lg={4}>
																				<div
																					style={{
																						border: '1px solid grey',

																					}}>
																					<div className="text-center mb-3 mt-4">
																						<i className="fas fa-upload  fa-5x"></i>

																					</div>
																					<div className="text-center mb-3" style={{
																						fontSize: '22px',
																					}}>
																						{strings.drag}
																					</div>
																					<div className="text-center mb-3">
																						<input
																							id="file"
																							ref={(ref) => {
																								this.uploadFile = ref;
																							}}
																							style={{marginLeft: "80px"}}
																							multiple
																							// directory="" 
																							// webkitdirectory=""
																							type="file"
																							accept=".csv"
																							onChange={(e) => {
																							
																							let validFiles=[]
																							let inValidFiles=[] 
																							let inValidFilesString=""
																								if(e.target.files.length && e.target.files.length!=0)
																								{
																											
																											for (const file of e.target.files) {
																										
																										if(props.values.productName=="zoho" )
																											{	
																												if(file.name &&
                                                                                                                   ( file.name=='Chart Of Accounts.csv' ||
                                                                                                                    file.name=='Contacts.csv'  ||
                                                                                                                    file.name=='Item.csv'  ||
                                                                                                                    file.name=='Vendors.csv'  ||
                                                                                                                    file.name=='Bill.csv'  ||
                                                                                                                    file.name=='Credit Note.csv'  ||
                                                                                                                    file.name=='Invoice.csv'  ||
                                                                                                                    file.name=='Opening Balances.csv'  ||
                                                                                                                    file.name=='Product.csv')
                                                                                                                    )
																													validFiles.push(file)
																													else
																													inValidFiles.push(file.name)
																												}
                                                                                                                else
																												if(props.values.productName=="simpleAccounts")
																											     {	
																													if(file.name &&
																														(file.name=='Chart Of Accounts.csv' ||
																														file.name=='Contacts.csv'  ||
																														file.name=='Credit Note.csv'  ||
																														file.name=='Invoice.csv'  ||
																														file.name=='Opening Balances.csv'  ||
																														file.name=='Product.csv')
																														)
																														validFiles.push(file)
																														else
																														inValidFiles.push(file.name)
																												}
																																																								
																												
																											}
																											
																										this.setState({	fileName: e.target.value.split('\\').pop(),
																															validFiles:validFiles,
																															inValidFiles:inValidFiles,
																														});
																										// toast.error(inValidFilesString +" are Not valid files .")
																										if(validFiles.length!=0)					 
																												this.Upload(validFiles);
																										else
																												toast.success("Please Select Valid Files !")
																												
																							     }
																								else{
																									this.setState({	validFiles:validFiles,inValidFiles:inValidFiles,});
																								   }
																			
																							}}
																						/>
																					</div>
																					<div>
																			{this.state.inValidFiles && this.state.inValidFiles.length!=0 &&
																			(
																				<div className='m-1' style={{ border:"1px solid red" }}>
																						<>&nbsp;&nbsp; {strings.invalid}</>
																						{this.state.inValidFiles.map((name,index)=>{
																							return(
																								<>
																							<tr className='text-danger'> <td>{index+1}</td><td>{name}</td></tr>
																								</>
																							)
																						})	}
																				</div>
																				
																			)
																			}
																		</div>

																				</div>
																			</Col>
																			<Col lg={4}></Col>
																		</Row>

																	</div>
																	
																	<Row>
																		<div>
																			<BootstrapTable
																				selectRow={this.selectRowProp}
																				search={false}
																				options={this.options}
																				data={
																					migration_list && migration_list
																						? migration_list
																						: []
																				}
																				version="4"
																				hover
																				remote
																				// tableStyle={{ width: '800px' }}
																				className="m-4"
																				trClassName="cursor-pointer"
																				csvFileName="summary_list.csv"
																				ref={(node) => (this.table = node)}
																			>
																				<TableHeaderColumn isKey dataField="fileName" dataSort className="table-header-bg">
																				{strings.fn}
																				</TableHeaderColumn >
																				<TableHeaderColumn dataField="recordCount" dataSort className="table-header-bg">
																				{strings.rup}
																				</TableHeaderColumn>
																			</BootstrapTable>
																		</div>

																	</Row>
																	<Row><Col>
																	{this.state.selectedRows.length > 0 ? (	<Button color="primary" className="btn-square pull-left"
																			onClick={() => { this.DeleteFile() }}>
																		<i className="fa fa-trash"></i> {strings.d}
																		</Button>) : ''}
																		</Col>
																	</Row>
																	</div>
																</Form>
															)}
														</Formik>
													</div>
												</Col>
											</Row>
											<Row>
												<Col lg={12} className="mt-5">
													<div className="table-wrapper">
														<FormGroup className="text-center">
															<Button color="secondary" className="btn-square pull-left"
																onClick={() => { this.toggle(0, '1') }}>
																<i className="far fa-arrow-alt-circle-left"></i> {strings.back}
															</Button>

															<Button name="button" color="primary" className="btn-square pull-right mr-3"
																onClick={() => {
																	this.toggle(0, '3')
																	this.listOfFiles()
																	this.listOfTransactionCategory()

																}}>
																{strings.nex}	<i className="far fa-arrow-alt-circle-right mr-1"></i>
															</Button>
														</FormGroup>
													</div>
												</Col>
											</Row>


										</TabPane>
										<TabPane tabId="3">
											<div className="create-employee-screen">
												<div className="animated fadeIn">
													<div className="text-center mb-5"><h3>{strings.pf}</h3></div>

													<Formik
														initialValues={this.state.initValue}
														onSubmit={(values, { resetForm }) => {
															// this.handleSubmitForSalary(values, resetForm)
														}}
														validationSchema={Yup.object().shape({

														})}
													>
														{(props) => (

															<Form onSubmit={props.handleSubmit}>
																<Row>
																	<TabList>
																		<Tab
																			id='chartOfAccounts'
																			onClick={() => {
																				this.setState({ nestedActiveDefaultTab: false })
																			}}
																	
																		>
																			<Button className="rounded-left" >{strings.ca}</Button>
																		</Tab>
																		{tabs.map((tab, idx) => (

																			<Tab
																				key={tab}
																				//  isSelected={this.showTable(file_data_list)}
																				onClick={() => {
																					this.getFileData(tab);
																					this.setState({ nestedActiveDefaultTab: true })
																				}}

																			>
																				<Button className="rounded-left">{tab}</Button>
																			</Tab>
																		))}
																	</TabList>
																	<TabContent style={{maxWidth:'95%',marginLeft:'2.5%'}}>
																		{this.state.nestedActiveDefaultTab ?
																			(
																				<TabPane>
																					<div >{this.showTable(file_data_list)}	</div>

																				</TabPane>
																			) : (
																				<TabPane>
																					{/* Default start */}
																					{/* <Button onClick={() => {
																						this.setState({
																							openModal: true
																						})
																					}}>Create Chart Of Account</Button> */}
																					{this.showNotExistList()}
																					{/* Default end */}
																				</TabPane>
																			)}
																	</TabContent>
																</Row>
																<Row>
																	<Col lg={12} className="mt-5">

																		<div className="table-wrapper">
																			<FormGroup className="text-center">
																				<Button color="secondary" className="btn-square pull-left"
																					onClick={() => { this.toggle(0, '2') }}>
																					<i className="far fa-arrow-alt-circle-left"></i> {strings.back}
																				</Button>

																				<Button name="button" color="primary" className="btn-square pull-right mr-3"
																					onClick={() => {
																						this.toggle(0, '4')
																						this.listOfTransactionCategory()
																					}}>
																					{strings.nex}	<i className="far fa-arrow-alt-circle-right mr-1"></i>
																				</Button>
																			</FormGroup>
																		</div>


																	</Col>
																</Row>
															</Form>
														)
														}
													</Formik>
												</div>
											</div>
										</TabPane>
										<TabPane tabId="4">
											<div className="text-center mb-5"><h3>{strings.setbal}</h3></div>
											<Formik
												initialValues={this.state.initValue}
												onSubmit={(values, { resetForm }) => {
													//  this.handleSubmitForOpeningBalances(values, resetForm)
												}}
												validationSchema={Yup.object().shape({


												})}
											>
												{(props) => (

													<Form onSubmit={props.handleSubmit}>

														<Row>
															<Col lg={12} className="mt-5">

																{this.setOpeningBalances()}


																<div className="table-wrapper">
																	<FormGroup className="text-center">
																		<Button color="secondary" className="btn-square pull-left"
																			onClick={() => { this.toggle(0, '3') }}>
																			<i className="far fa-arrow-alt-circle-left"></i> {strings.back}
																		</Button>

																		<Button name="button" color="primary" className="btn-square pull-right mr-3"
																			onClick={() => {
																				this.handleSubmitForOpeningBalances();
																			}}>
																			{strings.mig}<i className="far fa-arrow-alt-circle-right mr-1"></i>
																		</Button>
																	</FormGroup>
																</div>


															</Col>
														</Row>
													</Form>
												)
												}
											</Formik>

										</TabPane>

									</TabContent>
									

								</CardBody>
									</div>
								</TabPane>

{/* PARENT TAB 2 */}

								<TabPane tabId="2">
								  <div style={{    width: "30%"}} className="table-wrapper">
												<div className="pull-right mb-2">
												<Button name="button" color="primary" className="btn-square "
																								onClick={() => {
																									this.exportAll();
																								}}>
																								Download All &nbsp;
																								<i className="fas fa-download"></i>
																							</Button>
												</div>
										<BootstrapTable
											
											search={false}										
											data={csvFileNamesData}
											version="4"
											hover
											keyField="id"
											remote
											
											trClassName="cursor-pointer"
											ref={(node) => this.table = node}
										>
											<TableHeaderColumn
												className="table-header-bg"
												dataField="srNo"
												dataAlign="center"
												 width="20%"
											>
												Sl. No
												</TableHeaderColumn>
											<TableHeaderColumn
											
												className="table-header-bg"
												dataField="fileName"
											>
											  Sample File Name
												</TableHeaderColumn>
											<TableHeaderColumn
											 width="20%"
												dataField="download"
												className="table-header-bg"
												dataFormat={this.renderDownloadActions}
											>												 
												</TableHeaderColumn>
										</BootstrapTable>
								</div>
								</TabPane>
							</TabContent>

								<div>							
								</div>
							</Card>
						</Col>
					</Row>
				</div>
				<ChartOfAccountsModal
					openModal={this.state.openModal}
					closeModal={(e) => {
						this.closeModal(e);
					}}
					coaName={this.state.coaName}
				// employee_list={employee_list.data}
				/>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Import);
