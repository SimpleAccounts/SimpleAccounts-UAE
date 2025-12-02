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
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as ImportTransactionActions from './actions';
import * as ImportBankStatementActions from '../import_bank_statement/actions';
import { selectOptionsFactory } from 'utils';
import { CommonActions } from 'services/global';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import { data } from '../Language/index'
import LocalizedStrings from 'react-localization';
import * as DetailBankAccountActions from '../bank_account/screens/detail/actions'
import moment from 'moment';
import { Loader } from 'components';
import { Formik } from 'formik';
import { ThreeSixty } from '@material-ui/icons';
import { ThemeProvider } from '@material-ui/core';


const mapStateToProps = (state) => {
	return {
		date_format_list: state.import_transaction.date_format_list,
	};
};


const reader = require('xlsx')

const mapDispatchToProps = (dispatch) => {
	return {
		importTransactionActions: bindActionCreators(
			ImportTransactionActions,
			dispatch,
		),
		importBankStatementActions: bindActionCreators(
			ImportBankStatementActions,
			dispatch,
		),
		commonActions: bindActionCreators(CommonActions, dispatch),
		detailBankAccountActions: bindActionCreators(DetailBankAccountActions, dispatch)
	};
};
const Papa = require("papaparse")
const { convertArrayToCSV } = require('convert-array-to-csv')
let strings = new LocalizedStrings(data);
class ImportTransaction extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			templateId: '',
			language: window['localStorage'].getItem('language'),
			initialloading: true,
			initValue: {
				name: '',
				copy_saved_congiguration: '',
				skipRows: '',
				headerRowNo: '',
				textQualifier: '',
				dateFormatId: '',
				delimiter: 'OTHER',
				otherDilimiterStr: '',
				endRows: '',
				skipColumns: [],
			},
			dateFormat: "",
			// DateErrorMessage:"-",
			isDateFormatAndFileDateFormatSame: true,
			showMessage: false,
			delimiterList: [],
			fileName: '',
			tableHeader: [],
			loading: false,
			selectedValue: [],
			selectedValueDropdown: [],
			tableDataKey: [],
			tableData: [],

			columnStatus: [],
			selectedDelimiter: '',
			selectedDateFormat: '',
			configurationList: [],
			selectedConfiguration: this.props.location.state.selectedTemplate ? this.props.location.state.selectedTemplate : '',
			selectError: [],
			errorIndexList: [],
			error: {},
			isHeaderRow: false,
			indexMap: '',
			config: {
				delimiter: "",	// auto-detect
				newline: "",	// auto-detect
				quoteChar: '"',
				escapeChar: '"',

				preview: "",
				encoding: "",
				worker: false,
				comments: false,
				step: undefined,
				complete: undefined,
				error: undefined,
				download: false,
				downloadRequestHeaders: undefined,
				downloadRequestBody: undefined,
				skipEmptyLines: true,
				chunk: undefined,
				chunkSize: undefined,
				fastMode: undefined,
				beforeFirstChunk: undefined,
				withCredentials: undefined,
				transform: undefined,
				// delimitersToGuess: [',','#', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
			},
		};

		this.formRef = React.createRef();

		this.options = {
			paginationPosition: 'top',
		};
	}

	componentDidMount = () => {
		this.initializeData();
	};
	setConfigurations = (configurationList) => {

		let data = configurationList.filter(
			(item) => item.id == this.state.selectedConfiguration,
		);
		if (data.length > 0) {
			this.setState({
				initValue: {
					name: this.state.initValue.name,
					skipRows: data[0].skipRows,
					headerRowNo: data[0].headerRowNo,
					delimiter: ',',
					textQualifier:
						data[0].textQualifier,
					// dateFormatId: data[0].dateFormatId,
					otherDilimiterStr:
						data[0].otherDilimiterStr,
					endRows: data[0].endRows,
					skipColumns: data[0].skipColumns
				},
				name: this.state.initValue.name,
				skipRows: data[0].skipRows,
				headerRowNo: data[0].headerRowNo,
				textQualifier:
					data[0].textQualifier,
				// dateFormatId: data[0].dateFormatId,
				otherDilimiterStr:
					data[0].otherDilimiterStr,
				endRows: data[0].endRows,
				skipColumns: data[0].skipColumns,
				selectedConfiguration: this.state.selectedConfiguration,
				templateId: this.state.selectedConfiguration,
				selectedDateFormat:
					data[0].dateFormatId,
				selectedDelimiter: data[0].delimiter,
				error: {
					...this.state.error,
					...{ dateFormatId: '' },
				},
			});

			// this.processData(this.props.location.state.dataString)

		}
	}
	initializeData = () => {
		console.log('transaction');

		this.props.importTransactionActions.getDateFormatList();

		this.props.importTransactionActions.getConfigurationList().then((res) => {
			this.setState({
				configurationList: res.data,
			});

			this.setConfigurations(res.data)
		});


		this.processData(this.props.location.state.dataString)
		if (this.props.location.state && this.props.location.state.bankAccountId) {


			this.props.importTransactionActions
				.getTableHeaderList()
				.then((res) => {
					let temp = [...res.data];
					// temp.unshift({ label: 'Select', value: '' })
					this.setState({
						tableHeader: this.state.tableHeader.concat(res.data),
						selectedValue: this.state.tableHeader.concat(temp),
					});
				});
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
						() => { },
					);
				})
				.catch((err) => {
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
				});
			this.props.importTransactionActions.getDelimiterList().then((res) => {
				this.setState(
					{
						delimiterList: res.data,
						selectedDelimiter: res.data[1].value,
					},
					() => {
						this.setState({
							initialloading: false,
						});
					},
				);
			});
		} else {
			this.props.history('/admin/banking/bank-account');
		}
	};

	validateForm = () => {
		const { initValue, fileName } = this.state;
		let temp = {};
		for (let val in initValue) {
			if (initValue.hasOwnProperty(val)) {
				if (val === 'name' && !initValue['name'] && !this.state.selectedConfiguration) {
					temp['name'] = '*Template name is required or Select existing template';
				}
				if (val === 'dateFormatId' && !initValue['dateFormatId']) {
					temp['dateFormatId'] = '*Date format is required';
				}
			}
		}
		this.setState({
			error: temp,
		});

		if (Object.keys(temp).length) {
			Object.values(temp).map((i) => {
				this.props.commonActions.tostifyAlert('error', i)
			})

			return false;
		} else {
			return true;
		}
	};

	handleApply = (value, resetForm) => {

		if (this.validateForm()) {
			const { initValue } = this.state;
			initValue['delimiter'] = this.state.selectedDelimiter;
			this.setState({ tableHeader: [], loading: true });
			let formData = new FormData();
			formData.append(
				'delimiter',
				initValue.delimiter ? initValue.delimiter : '',
			);
			formData.append(
				'headerRowNo ',
				initValue.headerRowNo ? initValue.headerRowNo : '',
			);
			formData.append(
				'dateFormatId',
				initValue.dateFormatId ? initValue.dateFormatId : '',
			);
			formData.append('skipRows', initValue.skipRows ? initValue.skipRows : '-');
			formData.append('endRows', initValue.endRows ? initValue.endRows : '-');
			formData.append('skipColumns', initValue.skipColumns ? initValue.skipColumns : []);
			formData.append(
				'textQualifier',
				initValue.textQualifier ? initValue.textQualifier : '',
			);
			formData.append(
				'otherDilimiterStr',
				initValue.otherDilimiterStr ? initValue.otherDilimiterStr : '',
			);
			// if (this.uploadFile?.files?.[0]) {
			// 	formData.append('file', this.uploadFile?.files?.[0]);
			// }
			this.props.importTransactionActions
				.parseFile(formData)
				.then((res) => {
					if (res.status === 200) {
						// this.props.commonActions.tostifyAlert('success', 'New Configuration Created Successfully')
						this.props.importTransactionActions
							.getTableDataList(formData)
							.then((res) => {
								this.setState(
									{
										tableData: [...res.data],
										tableDataKey: res.data[0] ? Object.keys(res.data[0]) : [],
									},
									() => {
										let obj = { label: 'Select', value: '' };
										let tempObj = { label: '', status: false };
										let tempStatus = [...this.state.columnStatus];
										let tempDropDown = [...this.state.selectedValueDropdown];
										let tempError = [...this.state.selectError];
										this.state.tableDataKey.map((val, index) => {
											tempStatus.push(tempObj);
											tempDropDown.push(obj);
											tempError.push(false);

											return val;
										});
										this.setState({
											loading: false,
											selectedValueDropdown: tempDropDown,
											columnStatus: tempStatus,
											selectError: tempError,
										});
									},
								);
							})
							.catch((err) => {
								this.props.commonActions.tostifyAlert(
									'error',
									err && err.data ? err.data.message : 'Something Went Wrong',
								);
								this.setState({ loading: false });
							});
						this.props.importTransactionActions
							.getTableHeaderList(formData)
							.then((res) => {
								let temp = [...res.data];
								// temp.unshift({ label: 'Select', value: '' })
								this.setState({
									tableHeader: this.state.tableHeader.concat(res.data),
									selectedValue: this.state.tableHeader.concat(temp),
								});

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
		}

	};

	handleChange = (e, index) => {
		let tempDataSelectedValueDropdown = this.state.selectedValueDropdown;
		let tempStatus = [...this.state.columnStatus];
		let status = tempDataSelectedValueDropdown.filter(
			(item) => item.value === e.value && e.value !== '',
		);
		if (status.length > 0) {
			tempStatus[`${index}`] = { label: `${e.value}`, status: true };
			// tempDataSelectedValueDropdown[`${index}`] = { label: `Select`, value: '' }
			if (tempDataSelectedValueDropdown[`${index}`].value !== e.value) {
				this.setState({
					columnStatus: tempStatus,
					selectedValueDropdown: tempDataSelectedValueDropdown,
				});
			}
		} else if (e.value === '') {
			let val = tempDataSelectedValueDropdown[`${index}`].value;
			let multiSelected = [];
			tempStatus
				.map((item) => item.label)
				.reduce(function (a, e, i) {
					if (e === val) {
						multiSelected.push(i);
					}
					return a;
				}, []);

			if (multiSelected.length > 0) {
				multiSelected.map((item) => {
					tempStatus[`${item}`] = { label: '', status: false };
					return item;
				});
			}
			tempDataSelectedValueDropdown[`${index}`] = e;
			tempStatus[`${index}`] = { label: '', status: false };
			this.setState({
				columnStatus: tempStatus,
				selectedValueDropdown: tempDataSelectedValueDropdown,
			});
		} else {
			let a = tempStatus.map((item, i) => {
				let idx = tempDataSelectedValueDropdown
					.map((val) => val.value)
					.indexOf(item.label);
				if (idx === index || item.label === '') {
					return { label: '', status: false };
				} else {
					return { label: `${item.label}`, status: `${item.status}` };
				}
			});
			a[`${index}`] = { label: '', status: false };
			tempDataSelectedValueDropdown[`${index}`] = e;
			const tempSelectError = [...this.state.selectError];
			tempSelectError[`${index}`] = false;
			this.setState({
				columnStatus: a,
				selectedValueDropdown: tempDataSelectedValueDropdown,
				selectError: tempSelectError,
			});
		}
	};

	handleInputChange = (name, value) => {
		this.setState({
			initValue: Object.assign(this.state.initValue, {
				[`${name}`]: value,
			}),
		});
	};


	// setDateMessage=()=>{
	// 		//date,file tabledata ,date column 

	// 		let dateFormat=this.state.dateFormat  ?this.state.dateFormat:"";
	// 		let tableDataDate=this.state.tableData && this.state.tableData[0] && this.state.tableData[0].Date?this.state.tableData[0].Date :"";

	// 		if(tableDataDate !=""){
	// 			if(tableDataDate.includes("-")!=dateFormat.includes("-")){
	// 				this.setState({DateErrorMessage:"date formats must be same.",isDateFormatAndFileDateFormatSame:false});
	// 				return false
	// 				}
	// 	            // tableDataDate=tableDataDate.replaceAll("-","/");
	// 				// let tableDateFormat=moment(tableDataDate).creationData();
	// 				// if(tableDateFormat=="Invalid Date")
	// 				//    tableDateFormat=new Date(tableDataDate).format("DD/MM/YYYY");
	// 				 
	// 		}
	// 		this.setState({isDateFormatAndFileDateFormatSame:true});
	// 		return true
	// }
	handleSave = () => {

		if (this.validateForm()) {
			let optionErr = [...this.state.selectError];
			let item = -1;
			this.state.selectedValueDropdown
				.map((item, index) => {
					if (item.value === '') {
						optionErr[`${index}`] = true;
					}
					return item.value;
				})
				.indexOf('');

			if (item === -1) {
				let a = {};
				let val;
				let obj = {};
				this.state.selectedValueDropdown.map((item, index) => {
					if (item.value !== '') {
						val = item.value;
						obj[val] = index;
						a = { ...a, ...obj };
					}
					return item;
				});
				let postData = { ...this.state.initValue, dateFormatId: 1, };

				postData.skipColumns = this.state.initValue.skipColumns?.length >= 1 ? this.state.initValue.skipColumns : ''
				postData.indexMap = a;
				let obi = { ...postData }

				Object.keys(obi).map((i) => {

					if (postData[i] === null) postData[i] = ""
					else postData[i] = obi[i]
				})

				this.props.importTransactionActions
					.createConfiguration(postData)
					.then((res) => {

						// this.props.commonActions.tostifyAlert(
						// 	'success',
						// 	'New Template Created Successfully',
						// );

						// this.props.history.push('/admin/banking/bank-account/transaction', {
						// 	id: res.data.id,
						// 	bankAccountId: this.props.location.state.bankAccountId,
						// });

						this.props.importTransactionActions.getConfigurationList().then((res2) => {
							this.setState({
								templateId: res.data.id,
								configurationList: res2.data,
							}, () => {
								this.Import()
							});

						})
						this.processData(this.props.location.state.dataString)
						// this.validate();
					})
					.catch((err) => {
						this.props.commonActions.tostifyAlert(
							'error',
							err && err.data ? err.data.message : 'Unable to save template',
						);
						// this.props.history.push(
						// 	'/admin/banking/upload-statement'
						// )
					});
			} else {
				this.setState({
					selectError: optionErr,
				});
			}
		};
	}



	columnClassNameFormat = (fieldValue, row, rowIdx, colIdx) => {

		const index = `${rowIdx.toString()},${colIdx.toString()}`;
		return this.state.errorIndexList.indexOf(index) > -1 ? 'invalid' : '';
	};

	Import = () => {
		const { templateId, tableData, id } = this.state;
		const mappedvalues = []
		this.state.selectedValueDropdown.map((item, index) => {
			if (item.value !== "") mappedvalues.push({ inx: index, val: item.value })
		})
		const finaldata = []
		tableData.map((i) => {
			let local
			let local2 = {}
			local = { ...i }
			mappedvalues.map((i2) => {
				const allvales = Object.keys(i)?.[i2.inx]

				local2[i2.val] = local?.[`${allvales}`]
			})
			finaldata.push(local2)

		})
		let invaliddate = false
		const deli = [',', ' ', '/', '-']
		const fdata = finaldata.map((i) => {
			let local = { ...i }
			Object.keys(i).map((i3) => {

				if (local?.[`${i3}`] === "" || !local?.[`${i3}`]) {
					local = { ...local, [i3]: "-" }
				}
				if (i3 === "TRANSACTION_DATE") {

					const localdata = local["TRANSACTION_DATE"]

					let selectformat = this.props.date_format_list.find((i) => i.id === this.state.selectedDateFormat).format
					let finddeli
					deli.forEach((i) => {
						if (localdata.split(i).length === 3) finddeli = i
					})


					var formatLowerCase = selectformat.toLowerCase();
					var formatItems = formatLowerCase.split(finddeli);
					if (formatItems.length !== 3) {
						invaliddate = true
					}
					var dateItems = localdata.split(finddeli);
					var monthIndex = formatItems.findIndex((i) => i.includes("m"));
					var dayIndex = formatItems.findIndex((i) => i.includes("d"));
					var yearIndex = formatItems.findIndex((i) => i.includes("y"));
					var month = parseInt(dateItems[monthIndex]);
					month -= 1;
					var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
					if (isNaN(formatedDate.getTime()) && !invaliddate) {
						invaliddate = true
					}
					debugger
					const data = moment(formatedDate, 'DD/MM/YYYY').format('DD/MM/YYYY')



					local = { ...local, "TRANSACTION_DATE": data }
				}
				if (i3 === "CR_AMOUNT" || i3 === "DR_AMOUNT") {
					local = {
						...local, "CR_AMOUNT": local["CR_AMOUNT"]?.replace(",", ''),
						"DR_AMOUNT": local["DR_AMOUNT"]?.replace(",", ''),
					}
				}
			})
			debugger
			return local
		})
		if (invaliddate) {

			this.props.commonActions.tostifyAlert(
				'error',
				'invalid date format, Please Change To Continue',
			);
		} else {
			const postData = {
				bankId: this.props.location.state.bankAccountId
					? this.props.location.state.bankAccountId
					: '',
				templateId: templateId ? +templateId : '',
				importDataMap: fdata,
			};


			this.props.importBankStatementActions
				.importTransaction(postData)
				.then((res) => {
					if (res.data.includes('Transactions Imported 0')) {
						this.props.commonActions.tostifyAlert(
							'error',
							'Transaction Date Cannot be less than Bank opening date or Last Reconciled Date',
							this.props.history.push('/admin/banking/bank-account/transaction',
								{
									bankAccountId: postData.bankId
								})
						);
						this.setState({ selectedTemplate: [], tableData: [], showMessage: true });
					} else {
						this.props.commonActions.tostifyAlert('success', res.data);
						this.props.history.push('/admin/banking/bank-account/transaction', {
							bankAccountId: postData.bankId
						});
					}
				})
				.catch((err) => {
					this.props.history.push(
						'/admin/banking/upload-statement'
					)
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
				});
		}



	};

	ImportWithoutTemplate = () => {
		const { templateId, tableData, id } = this.state;
		const postData = {
			dateFormatId: this.state.initValue.dateFormatId ? this.state.initValue.dateFormatId : '',
			bankId: this.props.location.state.bankAccountId
				? this.props.location.state.bankAccountId
				: '',
			templateId: templateId ? +templateId : '',
			importDataMap: tableData,
		};
		this.props.importTransactionActions
			.importTransactionWithoutTemplate(postData)
			.then((res) => {
				if (res.data.includes('Transactions Imported 0')) {
					this.props.commonActions.tostifyAlert(
						'error',
						'Transaction Date Cannot be less than Bank opening date or Last Reconciled Date',
						this.props.history.push('/admin/banking/bank-account/transaction',
							{
								bankAccountId: postData.bankId
							})
					);
					this.setState({ selectedTemplate: [], tableData: [], showMessage: true });
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
	validateWithoutTemplate = () => {

		// const data ={
		// 	data : this.state.csv,
		// 	id : this.state.templateId
		// }
		let optionErr = [...this.state.selectError];
		let item = -1;
		this.state.selectedValueDropdown
			.map((item, index) => {
				if (item.value === '') {
					optionErr[`${index}`] = true;
				}
				return item.value;
			})
			.indexOf('');

		if (item === -1) {
			let a = {};
			let val;
			let obj = {};
			this.state.selectedValueDropdown.map((item, index) => {
				if (item.value != '') {
					val = item.value;
					obj[val] = index;
					a = { ...a, ...obj };
				}
				return item;
			});
			let postData = { ...this.state.initValue };

			postData.skipColumns = this.state.initValue?.skipColumns?.length >= 1 ? this.state.initValue?.skipColumns : ''
			postData.indexMap = a;
			let formData = {
				indexMap: a,
				delimiter: postData.delimiter ? postData.delimiter : '',
				headerRowNo: postData.headerRowNo ? postData.headerRowNo : '',
				dateFormatId: postData.dateFormatId ? postData.dateFormatId : '',
				skipRows: postData.skipRows ? postData.skipRows : null,
				textQualifier: postData.textQualifier ? postData.textQualifier : '',
				otherDilimiterStr: postData.otherDilimiterStr ? postData.otherDilimiterStr : '',
				data: this.state.csv,
				id: this.state.templateId ? this.state.templateId : ''
			}
			this.props.importTransactionActions
				.parseCsvFileWithOutTemplate(formData)
				.then((res) => {
					console.log(res);
					this.setState({
						tableData: res.data['data'],
						tableDataKey: res.data.data[0] ? Object.keys(res.data.data[0]) : [],
						errorIndexList: res.data.error ? res.data.error : [],
					});
					this.props.commonActions.tostifyAlert(
						'Success',
						'Validatation complete',
					);
					console.log('tableDataKey', this.state.tableDataKey);
					// })

					if (this.state.errorIndexList.length <= 0) {
						this.ImportWithoutTemplate()
					}
				})

				.catch((err) => {
					// this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong' )
					// this.setState({ loading: false })
				});
		}
	};

	validate = () => {
		// let optionErr = [...this.state.selectError];
		// let item = -1;
		// this.state.selectedValueDropdown
		// 	.map((item, index) => {
		// 		if (item.value === '') {
		// 			optionErr[`${index}`] = true;
		// 		}
		// 		return item.value;
		// 	})
		// 	.indexOf('');

		// if (item === -1) {
		// 	let a = {};
		// 	let val;
		// 	let obj = {};
		// 	this.state.selectedValueDropdown.map((item, index) => {
		// 		if (item.value != '') {
		// 			val = item.value;
		// 			obj[val] = index;
		// 			a = { ...a, ...obj };
		// 		}
		// 		return item;
		// 	});

		const mappedvalues = []
		this.state.selectedValueDropdown.map((item, index) => {
			if (item.value !== "") mappedvalues.push({ inx: index, val: item.value })
		})


		// let postData = { ...this.state.initValue };
		// postData.skipColumns = this.state.initValue?.skipColumns?.length >= 1  ? this.state.initValue?.skipColumns : ''
		// postData.indexMap = a;

		if (mappedvalues.length === 4) {
			if (this.state.templateId === "") {
				this.handleSave()
			} else if (this.state.templateId !== "") {

				this.Import()
			}
		} else {
			this.props.commonActions.tostifyAlert('error', 'please select maping column')
		}

		this.validateForm();
		//this.Import()
		// this.props.importTransactionActions
		// 	.parseCsvFile(postData)
		// 	.then((res) => {
		// 		console.log(res);
		// 		this.setState({
		// 			tableData: res.data['data'],
		// 			tableDataKey: res.data.data[0] ? Object.keys(res.data.data[0]) : [],
		// 			errorIndexList: res.data.error ? res.data.error : [],
		// 		});
		// 		this.props.commonActions.tostifyAlert(
		// 			'Success',
		// 			'Validatation complete',
		// 		);
		// 		console.log('tableDataKey', this.state.tableDataKey);
		// 		// })

		// 		if(this.state.errorIndexList.length <= 0){
		// 			this.Import()
		// 		}
		// 	})

		// 	.catch((err) => {
		// 		// this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong' )
		// 		// this.setState({ loading: false })
		// 	});
	}

	handleSubmit = (data) => {

		const { selectedTemplate } = this.state;
		let formData = new FormData();

		formData.append('file', this.state.file);

		formData.append('id', this.state.templateId ? this.state.templateId : '');
		formData.append(
			'bankId',
			this.props.location.state.bankAccountId
				? this.props.location.state.bankAccountId
				: '',
		);
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

	processData = dataString => {

		let parse = Papa.parse(dataString, this.state.config)
		let isheaderisrow = this.state.isHeaderRow
		// let parse = dataString
		const skipColumns = this.state.initValue.skipColumns
		let newString = ''
		if (skipColumns && skipColumns.length > 0) {
			let skipColumnsList = skipColumns.split(',')
			skipColumnsList.map((row) => {
				newString += (parseInt(row) - 1) + ","
			})
		}
		const dataStringLines = [...parse.data]
		const local = this.state.skipRows && this.state.skipRows !== "" ?
			dataStringLines.splice(isheaderisrow ? 1 : 0,
				parseInt(this.state.skipRows))
			: dataStringLines;

		const header = dataStringLines[0]
		console.log(parse, "parse")
		let headers = header

		const list = [];

		for (let i = 1; i < dataStringLines.length; i++) {

			let row = dataStringLines[i];
			if (headers && row.length == headers.length) {
				const obj = {};
				for (let j = 0; j < headers.length; j++) {
					if (!newString.includes(j)) {

						let d = row[j];
						if (d.length > 0) {
							if (d[0] == '"')
								d = d.substring(1, d.length - 1);
							if (d[d.length - 1] == '"')
								d = d.substring(d.length - 2, 1);
						}


						if (headers[j]) {
							obj[headers[j]] = d;
						}
					}
				}

				// remove the blank rows
				if (Object.values(obj).filter(x => x).length > 0) {
					list.push(obj);
				}
			}
		}

		headers = header

		const csv = convertArrayToCSV(list)

		console.log(csv)

		this.setState(
			{
				tableData: list,
				tableDataKey: headers,
				parse: parse,
				csv: csv,
				initValue: { ...this.state.initValue, ...{ otherDilimiterStr: parse.meta.delimiter } }
			},

			() => {

				let obj = { label: 'Select', value: '' };
				let tempObj = { label: '', status: false };
				let tempStatus = [...this.state.columnStatus];
				let tempDropDown = [...this.state.selectedValueDropdown];
				let tempError = [...this.state.selectError];
				this.state.tableDataKey && this.state.tableDataKey.map((name, index) => {
					tempStatus.push(tempObj);
					tempDropDown.push(obj);
					tempError.push(false);

					return name;
				});
				this.setState({
					loading: false,
					selectedValueDropdown: tempDropDown,
					columnStatus: tempStatus,
					selectError: tempError,
				});
			},
		);

	}


	handleFileUpload = e => {

		// const file = this.uploadFile?.files?.[0];
		// const reader = new FileReader();
		// reader.onload = (evt) => {
		// 	/* Parse data */
		// 	const bstr = evt.target.result;
		// 	const wb = XLSX.read(bstr, { type: 'binary' });
		// 	/* Get first worksheet */
		// 	const wsname = wb.SheetNames[0];
		// 	const ws = wb.Sheets[wsname];
		// 	/* Convert array of arrays */
		// 	const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });


		// 	this.processData(data);

		// 	this.setState({ dataString: data })
		// };
		// reader.readAsBinaryString(file);



	}

	render() {
		strings.setLanguage(this.state.language);
		const {
			loading,
			tableData,
			initialloading,
			configurationList,
			showMessage,
		} = this.state;

		const { date_format_list } = this.props;
		const bankAccountId = this.props.location.state.bankAccountId;
		return (
			<div className="import-transaction-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="fa glyphicon glyphicon-export fa-upload" />
												<span className="ml-2">{strings.ImportTransaction}</span>
											</div>
										</Col>
										<Col>
											{/* <Button title='Back'
										onClick={() => {
											this.props.history.push(
												'/admin/banking/upload-statement',
												{ bankAccountId: this.props.location.state.bankAccountId },
											);
										}}
									className=' pull-right'>X
									</Button> */}
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									{initialloading ? (
										<Loader />
									) : (
										<Row>
											<Col lg={12}>
												<div>
													{/* <Formik
                            // initialValues={initValue}
                            ref={this.formRef}
                            onSubmit={(values, { resetForm }) => {
                              this.handleSave(values, resetForm)
                            }}
                          >
                            {
                              (props) => ( */}
													<Form>
														<Row lg={8} >
															<Col lg={12} className="d-flex flex justify-content-center">
																<Col lg={3} className="d-flex flex justify-content-end" >
																	<Label> Select Parsing Template </Label>
																</Col >
																<Col lg={3} >
																	<FormGroup>
																		<Select
																			placeholder="New Template"
																			value={
																				configurationList &&
																				selectOptionsFactory
																					.renderOptions(
																						'name',
																						'id',
																						configurationList,
																						'Configuration',
																					)
																					.find(
																						(option) =>
																							option.value ===
																							+this.state.selectedConfiguration,
																					) || selectOptionsFactory
																						.renderOptions(
																							'name',
																							'id',
																							configurationList,
																							'Configuration',
																						)?.[0]
																			}
																			options={
																				configurationList
																					? selectOptionsFactory.renderOptions(
																						'name',
																						'id',
																						configurationList,
																						'Configuration',
																					).filter((i) => i.value !== 1)
																					: []
																			}
																			onChange={(e) => {
																				let data = configurationList.filter(
																					(item) => item.id === e.value,
																				);

																				if (data.length > 0) {
																					let local = [...this.state.selectedValueDropdown.map(() => { return { label: "Select", value: "" } })]
																					Object.keys(data[0].indexMap).map((i) => {
																						const data2 = selectOptionsFactory.renderOptions(
																							'label',
																							'value',
																							this.state.tableHeader,
																							'',
																						).find((val) => val.value == i)
																						local[data[0].indexMap?.[`${i}`]] = data2
																					})

																					this.setState({
																						initValue: {
																							name: "",
																							skipRows: data[0].skipRows,
																							headerRowNo: data[0].headerRowNo,
																							textQualifier:
																								data[0].textQualifier,
																							// dateFormatId: data[0].dateFormatId,
																							otherDilimiterStr:
																								data[0].otherDilimiterStr,
																							indexMap: data[0].indexMap
																						},
																						selectedValueDropdown: [...local],
																						selectedConfiguration: e.value,
																						selectedDateFormat:
																							data[0].dateFormatId,
																						selectedDelimiter: data[0].delimiter,
																						error: {
																							...this.state.error,
																							...{ dateFormatId: '' },
																						},
																						templateId: e.value

																					}

																					);
																				} else {
																					this.setState({
																						selectedConfiguration: e.value,
																						templateId: e.value
																					});
																				}
																			}}
																		/>
																	</FormGroup>
																</Col>
															</Col>
															<Col lg={12} className="d-flex flex justify-content-center my-3 font-weight-bold"> Or Create New Template</Col>
															<Col lg={12} className="d-flex flex justify-content-center">
																<Col lg={3} className="d-flex flex justify-content-end">
																	<Label>
																		<span className="text-danger">* </span>New Template Name
																	</Label>
																</Col>
																<Col lg={3}>
																	<FormGroup>
																		<Input
																			type="text"
																			id="name"
																			name="name"
																			disabled={this.state.templateId !== ""}
																			placeholder={strings.Enter + " " + strings.Name}
																			value={this.state.initValue.name}
																			onChange={(e) => {
																				this.handleInputChange(
																					'name',
																					e.target.value,
																				);
																				this.setState({
																					error: {
																						...this.state.error,
																						...{ name: '' },
																					},
																				});
																			}}
																			className={
																				this.state.error &&
																					this.state.error.name
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{this.state.error &&
																			this.state.error.name && (
																				<div className="invalid-feedback">
																					{this.state.error.name}
																				</div>
																			)}
																	</FormGroup>
																</Col>
															</Col>


															{/* <Col>
																<Button
																	type="button"
																	color="primary"
																	className="btn-square mr-4"
																	onClick={()=>{ if(this.state.selectedTemplate) {this.validate() }else this.handleSave()}}
																>
																	<i className="fa fa-dot-circle-o"></i>{' '}
																	Save Template
																</Button>
															</Col> */}
														</Row>

														<Row>
															<Col lg={12}>
																<fieldset>
																	<legend> {strings.Parameters}</legend>
																	<Row>
																		<Col>
																			<FormGroup>
																				{/* <Input
																										className="form-check-input"
																										type="radio"
																										id={option.value}
																										name="delimiter"
																										value={
																											this.state.delimiterList[
																												`${index}`
																											].value
																										}
																										checked={
																											this.state
																												.selectedDelimiter ===
																											option.value
																										}
																										onChange={(e) => {
																											this.setState({
																												selectedDelimiter:
																													e.target.value,
																													config: {delimiter :e.target.value}	}
																													, () => {
																														this.processData(this.state.dataString)
																													});
																											this.handleInputChange(
																												'otherDilimiterStr',
																												'',
																											);
																										}}
																									/> */}
																				<Label
																					className="ml-3"
																					htmlFor="vatIncluded"
																				>
																					Delimiter
																				</Label>

																				<Input
																					className="ml-3"
																					type="text"

																					placeholder='Delimiter'
																					value={
																						this.state.initValue.otherDilimiterStr || ''
																					}
																					// disabled={
																					// 	this.state
																					// 		.selectedDelimiter !==
																					// 	'OTHER'
																					// }
																					onChange={(e) => {

																						this.setState({

																							initValue: { ...this.state.initValue, otherDilimiterStr: e.target.value }
																						}
																							, () => {
																								this.processData(this.props.location.state.dataString)
																							});
																					}}
																				/>

																			</FormGroup>
																		</Col>
																		<Col >
																			<FormGroup>
																				<Label
																					className="ml-3"
																					htmlFor="skip_rows">
																					Skip First X Rows
																				</Label>
																				<Input
																					className="ml-3"
																					type="text"
																					name=""
																					id=""
																					rows="6"
																					placeholder="Enter Number of Row"
																					value={
																						this.state.initValue.skipRows ||
																						''
																					}
																					onChange={(e) => {
																						this.handleInputChange(
																							'skipRows',
																							e.target.value,
																						);
																						this.setState({
																							skipRows: e.target.value
																						}, () => {
																							this.processData(this.props.location.state.dataString)
																						})

																					}}
																				/>
																			</FormGroup>
																		</Col>

																		{/* <Col >
																			<FormGroup>

																				<Label htmlFor="skip_rows">
																					To
																				</Label>
																				<Input
																					type="text"
																					name=""
																					id=""
																					rows="6"
																					placeholder="Enter Number of Row"
																					value={
																						this.state.initValue.endRows ||
																						''
																					}
																					onChange={(e) => {
																						this.handleInputChange(
																							'endRows',
																							e.target.value,
																						);
																						this.setState({
																							endRows: e.target.value
																						})

																					}}
																				/>
																			</FormGroup>
																		</Col> */}


																		{/* <Col>
																			<FormGroup>

																				<Label htmlFor="description">
																					{strings.HeaderRowsNumber}
																				</Label>


																				<Input
																					type="text"
																					name=""
																					id=""
																					rows="6"
																					value={
																						this.state.initValue
																							.headerRowNo || ''
																					}
																					placeholder="Enter Header Row Number"
																					onChange={(e) => {
																						this.handleInputChange(
																							'headerRowNo',
																							e.target.value,
																						);
																						this.setState({
																							headerRowNo: e.target.value
																						})

																					}}
																				/>
																			</FormGroup>
																		</Col> */}

																		{/* <Col>
																			<FormGroup>
																				<Label htmlFor="description">
																					Skip Columns
																				</Label>
																				<Input
																					type="text"
																					name=""
																					id=""
																					rows="6"
																					placeholder="Enter Number of Columns"
																					value={
																						this.state.initValue
																							.skipColumns || ''
																					}
																					onChange={(e) => {
																						this.handleInputChange(
																							'skipColumns',
																							e.target.value,
																						);
																						this.setState({
																							skipColumns: e.target.value
																						})

																					}}

																				/>
																			</FormGroup>
																		</Col> */}
																		<Col className=" ml-4">
																			<FormGroup className='pull-right'>
																				<Input
																					type="checkbox"
																					id="isHeaderRow"
																					checked={this.state.isHeaderRow}
																					onChange={(option) => {

																						this.setState({ isHeaderRow: !this.state.isHeaderRow }, () => {
																							this.processData(this.props.location.state.dataString)
																						})
																					}
																					}
																				/>
																				<Label>Is Header Row</Label>
																			</FormGroup>
																		</Col>
																		<Col>
																			<FormGroup>
																				<Label htmlFor="description">
																					<span className="text-danger">
																						*
																					</span>
																					{strings.DateFormat}
																				</Label>
																				<Select
																					type=""
																					options={
																						date_format_list
																							? selectOptionsFactory.renderOptions(
																								'format',
																								'id',
																								date_format_list,
																								'Date Format',
																							)
																							: []
																					}
																					value={
																						date_format_list &&
																						selectOptionsFactory
																							.renderOptions(
																								'format',
																								'id',
																								date_format_list,
																								'Date Format',
																							)
																							.find(
																								(option) =>
																									option.value ===
																									+this.state
																										.selectedDateFormat,
																							)
																					}
																					onChange={(option) => {
																						if (option && option.value) {
																							this.handleInputChange(
																								'dateFormatId',
																								option.value,
																							);
																							this.setState({
																								selectedDateFormat:
																									option.value,
																								error: {
																									...this.state.error,
																									...{ dateFormatId: '' },
																								},
																								dateFormat: option.label

																							}, () => {
																								this.processData(this.props.location.state.dataString)
																							});
																						} else {
																							this.handleInputChange(
																								'dateFormatId',
																								'',
																							);
																							this.setState({
																								selectedDateFormat: '',
																							});
																						}
																					}}
																					id=""
																					rows="6"
																					placeholder={strings.DateFormat}
																					className={this.state.error && this.state.error.dateFormatId ? 'is-invalid' : ''}
																				/>

																				{this.state.error &&
																					this.state.error.dateFormatId && (
																						<div className="invalid-feedback" style={{ display: "block", whiteSpace: "normal" }}>
																							{
																								this.state.error
																									.dateFormatId
																							}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																		{/* <Col>
																			<FormGroup>
																				<Button
																					type="button"
																					color="primary"
																					className="btn-square mt-4"
																					// disabled={this.state.fileName ? false : true}
																					onClick={() => {

																						// if(this.setDateMessage())

																						this.processData(this.props.location.state.dataString)
																					}
																					}
																				>
																					<i className="fa fa-dot-circle-o"></i>{' '}
																					{strings.Apply}
																				</Button>
																			</FormGroup>
																		
																		
																		</Col> */}
																	</Row>
																	{/* <Row>



																		<Col lg={6} className="table_option">
																			<Row>
																				<Col md="5">
																					<label htmlFor="Other">
																						<span className="text-danger">
																							*
																						</span>
																						{strings.ProvideSample}
																					</label>
																				</Col>
																				<Col md="7">
																					<FormGroup className="mb-0">
																						<Button
																							color="primary"
																							onClick={() => {
																								document
																									.getElementById('fileInput')
																									.click();
																							}}
																							className="btn-square mr-3"
																						>
																							<i className="fa fa-upload"></i>{' '}
																							{strings.upload}
																						</Button>
																						<input
																							id="fileInput"
																							ref={(ref) => {
																								this.uploadFile = ref;
																							}}
																							type="file"
																							style={{ display: 'none' }}
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
																								this.handleFileUpload()
																							}}
																						// onChange={this.handleFileUpload}
																						/>
																						{this.state.fileName && (
																							<div>
																								<i
																									className="fa fa-close"
																									onClick={() =>
																										this.setState({
																											fileName: '',
																										})
																									}
																								></i>{' '}
																								{this.state.fileName}
																							</div>
																						)}
																					</FormGroup>
																					{this.state.error &&
																						this.state.error.file && (
																							<div className="invalid-feedback">
																								{this.state.error.file}
																							</div>
																						)}
																				</Col>
																			</Row>

																		</Col>
																	</Row> */}
																</fieldset>
															</Col>
														</Row>
														{/* <Row>
															<Col>
														<FormGroup>
																				<Button
																					type="button"
																					color="primary"
																					className="btn-square mt-4 pull-right"
																					// disabled={this.state.fileName ? false : true}
																					onClick={() => {

																						 if(this.state.templateId){

																						this.validate()
																					}else{
																						this.validateWithoutTemplate()
																					}
																					}
																				}	
																				>
																					<i className="fa fa-dot-circle-o"></i>{' '}
																					Validate and Save
																				</Button>
																			</FormGroup> 
																			</Col>
														</Row> */}
														{/* <Row className="mt-5"> */}
														{/* </Row> */}
														<div
															//  style={{display: this.state.showMessage === true ? '': 'none'}}
															className="mt-4"
														>
															<Label
																className="text-center">
																{/* Message */}
															</Label>
															{/* {this.setDateMessage()} */}
															{this.state.DateErrorMessage}
														</div>
													</Form>
													{/* )
                            }
                          </Formik> */}
													<Row style={{ display: 'flex', justifyContent: 'space-evenly' }}>
														{loading ? (
															<Loader />
														) : this.state.tableDataKey && this.state.tableDataKey.length > 0 && this.state.isDateFormatAndFileDateFormatSame == true ? (
															this.state.tableDataKey.map((header, index) => {
																return (
																	<Col
																		style={{
																			width: `calc(100% / ${this.state.tableDataKey.length})`,
																			margin: '20px 0',
																			maxWidth: 200
																		}}
																	>
																		<FormGroup
																		// className={`mb-0 ${
																		// 	this.state.columnStatus[`${index}`]
																		// 		.status
																		// 		? 'is-invalid'
																		// 		: ''
																		// } ${
																		// 	this.state.selectError[`${index}`]
																		// 		? 'invalid-select'
																		// 		: ''
																		// }`}

																		>
																			<Select
																				type=""
																				// isDisabled={this.state.templateId!=="" }
																				options={
																					this.state.tableHeader
																						? selectOptionsFactory.renderOptions(
																							'label',
																							'value',
																							this.state.tableHeader,
																							'',
																						).filter((i) => {
																							if (i.value === "") return true
																							return !this.state?.selectedValueDropdown?.find((i2) => i.value === i2.value)
																						})
																						: []
																				}
																				name={index}
																				id=""
																				rows="6"
																				value={
																					this.state.selectedValueDropdown[
																					`${index}`
																					]
																				}
																				onChange={(e) => {

																					this.handleChange(e, index);

																				}}
																			// className={}
																			/>
																		</FormGroup>
																		{/* <p
																			className={
																				this.state.columnStatus[`${index}`]
																					.status
																					? 'is-invalid'
																					: 'valid'
																			}
																		>
																			*Already Selected
																		</p> */}
																	</Col>
																);
															})
														) : null}
														{/* <div> */}

														<div id="list_xls">
															{this.state.tableDataKey && this.state.tableDataKey.length > 0 && this.state.isDateFormatAndFileDateFormatSame == true ? (
																<BootstrapTable
																	data={tableData}
																	keyField={this.state.tableDataKey[0]}

																>
																	{this.state.tableDataKey.map((name, index) => (
																		<TableHeaderColumn
																			dataField={name}
																			dataAlign="center"
																			iskey={index}
																			tdStyle={{ overflowX: 'auto' }}

																			columnClassName={this.columnClassNameFormat}
																		>
																			{name}
																		</TableHeaderColumn>
																	))}
																</BootstrapTable>
																//  <TableWrapper data={tableData} keyField={this.state.tableDataKey}/>
															) : ''}
														</div>
														{/* </div> */}


														<Row style={{ width: '100%' }}>
															<Col lg={12} className="mt-2">
																<FormGroup className="text-right">
																	{this.state.tableDataKey && this.state.tableDataKey.length > 0 ? (

																		<>
																			{/* <Button
																				type="button"
																				color="primary"
																				className="btn-square mr-4"
																				onClick={this.Import}
																			>
																				<i className="fa fa-dot-circle-o"></i>{' '}
																				Save
																			</Button> */}

																			<Button
																				type="button"
																				color="primary"
																				className="btn-square mr-4"
																				// disabled={this.state.fileName ? false : true}
																				onClick={() => this.validate()}

																			>
																				<i className="fa fa-dot-circle-o"></i>{' '}
																				Validate and Save
																			</Button>

																			<Button
																				color="secondary"
																				className="btn-square"
																				onClick={() => {
																					this.props.history.push(
																						'/admin/banking/upload-statement',
																						{
																							bankAccountId,
																						},
																					);
																				}}
																			>
																				<i className="fa fa-ban"></i> Cancel
																			</Button>
																		</>
																	) : null}
																</FormGroup>
															</Col>
														</Row>
													</Row>
												</div>
											</Col>
										</Row>
									)}
								</CardBody>
							</Card>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportTransaction);

