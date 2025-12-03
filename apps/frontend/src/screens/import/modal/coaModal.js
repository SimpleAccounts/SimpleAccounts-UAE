import React from 'react';
import { connect } from 'react-redux';
import logo from 'assets/images/brand/datainnLogo.png';
import {
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	Modal,
	CardHeader,
	ModalBody,
	ModalFooter,
	UncontrolledTooltip,
	CardBody,
	Table,
	Card,
	ButtonGroup,
	ModalHeader,
} from 'reactstrap';

import { Formik } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';

import { toast } from 'react-toastify';

import {data}  from '../../Language/index'
import LocalizedStrings from 'react-localization';

import '../style.scss';

import { Loader } from 'components';


import * as ChartOfAccontActions from '../../chart_account/actions';
import * as CreateChartOfAccontActions from '../../chart_account/screens/create/actions';


const mapStateToProps = (state) => {
	return {
		sub_transaction_type_list: state.chart_account.sub_transaction_type_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		ChartOfAccontActions: bindActionCreators(ChartOfAccontActions, dispatch),
		createChartOfAccontActions: bindActionCreators(
			CreateChartOfAccontActions,
			dispatch,
		),
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

let strings = new LocalizedStrings(data);
class AddEmployeesModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
			selectedRows: [],
			actionButtons: {},
            initValue: {
				// transactionCategoryCode: '',
				transactionCategoryName: '',
				chartOfAccount: '',
			},
            dialog: null,
            filterData: {
                name: '',
                email: ''
            },
			loading: false,
			createMore: false,
			exist: false,
			chartOfAccountCategory: [],
			disabled: false,
            csvData: [],
            view: false
		};
		
		this.regExAlpha = /^[A-Za-z0-9 !@#$%^&*)(+=._-]+$/;
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
	}



	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.employee_list !== nextProps.employee_list) {
			console.log('getDerivedStateFromProps state changed', nextProps.selectedData);
			return {
				prefixData: nextProps.prefixData,
				employee_list: nextProps.employee_list,
			};
		}
	
	}


	// Create
	onRowSelect = (row, isSelected, e) => {
		 
		let tempList = [];
		if (isSelected) {
			tempList = Object.assign([], this.state.selectedRows);
			tempList.push(row.id);
		} else {
			this.state.selectedRows.map((item) => {
				if (item !== row.id) {
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
				tempList.push(item.id);
				return item;
			});
		}
		this.setState({
			selectedRows: tempList,
		});
	};

	displayMsg = (err) => {
		toast.error(`${err.data}`, {
			position: toast.POSITION.TOP_RIGHT,
		});
	};
	_showDetails = (bool) => {
		this.setState({
			showDetails: bool
		});
	}

	exportPDFWithComponent = () => {
		this.pdfExportComponent.save();
	};
	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		this.props.ChartOfAccontActions.getSubTransactionTypes().then((res) => {
			if (res.status === 200) {
				let val = Object.assign({}, res.data);
				let temp = [];
				Object.keys(val).map((item) => {
					temp.push({
						label: item,
						options: val[`${item}`],
					});
					return item;
				});
				this.setState({
					chartOfAccountCategory: temp,
				});
			}
		});
	};
	// Show Success Toast
	// success() {
	//   toast.success('Chart Of Account Created Successfully... ', {
	//     position: toast.POSITION.TOP_RIGHT
	//   })
	// }


	// Create or Edit VAT

	validationCheck = (value) => {
		const data = {
			moduleType: 16,
			name: value,
		};
		this.props.createChartOfAccontActions
			.checkValidation(data)
			.then((response) => {
				if (response.data === 'Transaction Category Name Already Exists') {
					this.setState({
						exist: true,
					});
				} else {
					this.setState({
						exist: false,
					});
				}
			});
	};
	handleSubmit = (data, resetForm) => {
		const { openModal, closeModal,coaName, id, companyData, bankDetails, employee_list ,payroll_employee_list} = this.props;
		this.setState({ disabled: true });
		const postData = {
			transactionCategoryName: coaName
			// data.transactionCategoryName
			,
			chartOfAccount: data.chartOfAccount.value,
		};
		this.props.createChartOfAccontActions
			.createTransactionCategory(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ disabled: false });
					this.props.commonActions.tostifyAlert(
						'success',
						'New Chart of Account Created Successfully',
					);
					if (this.state.createMore) {
						this.setState({
							createMore: false,
						});
						resetForm();
					} else {
						closeModal(false);
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

	renderOptions = (options) => {
		return options.map((option) => {
			return (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			);
		});
	};

	handleChange = (val, name) => {
        this.setState({
            filterData: Object.assign(this.state.filterData, {
                [name]: val
            })
        })
    }

    handleSearch = () => {
        this.initializeData();
        // this.setState({})
    }

    onSizePerPageList = (sizePerPage) => {
        if (this.options.sizePerPage !== sizePerPage) {
            this.options.sizePerPage = sizePerPage
            this.initializeData()
        }
    }
    renderDOB = (cell, rows) => {
        return moment(rows.dob).format('DD/MM/YYYY');
    };
    sortColumn = (sortName, sortOrder) => {
        this.options.sortName = sortName;
        this.options.sortOrder = sortOrder;
        this.initializeData()
    }
    componentWillUnmount = () => {
        this.setState({
            selectedRows: []
        })
    }
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
    fullname = (cell, row) => {
		return (
			<label
				className="mb-0 label-bank"
				// style={{
				// 	cursor: 'pointer',
				// 	}}
				onClick={
                    () =>{ 
					this.props.history.push('/admin/payroll/employee/viewEmployee',
                    { id: row.id })}
				}
                

			>
				{row.fullName}
			</label>
		);
	};
    renderStatus = (cell, row) => {


        let classname = '';
        if (row.isActive === true) {
            classname = 'label-success';
        } else {
            classname = 'label-due';
        }
        return (
            <span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
                {
                    row.isActive === true ?
                        "Active" :
                        "InActive"

                }
            </span>
        );

    };

    onPageChange = (page, sizePerPage) => {
        if (this.options.page !== page) {
            this.options.page = page
            this.initializeData()
        }
    }
	// addEmployees=()=>{
	// 	console.log(this.state.selectedRows,"selectedRows")
	// }
	addEmployees = () => {
		 
		this.setState({ disabled: true });
		// const { employeeIds } = data;
	

		let employeeList =[];
		if(this.state.selectedRows){
		Object.keys(this.state.selectedRows).forEach(key => {
		 employeeList.push(this.state.selectedRows[key]) 
		});}
	 

		this.props.createPayrollActions
			.addMultipleEmployees( this.state.payroll_id,employeeList)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert('success','Employees added Successfully')
					this.tableApiCallsOnStatus()
					// resetForm(this.state.initValue)
				}
			}).catch((err) => {
				this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
			})
	}
    getCsvData = () => {
        if (this.state.csvData.length === 0) {
            let obj = {
                paginationDisable: true
            }
            this.props.employeeActions.getEmployeeList(obj).then((res) => {
                if (res.status === 200) {
                    this.setState({ csvData: res.data.data, view: true }, () => {
                        setTimeout(() => {
                            this.csvLink.current.link.click()
                        }, 0)
                    });
                }
            })
        } else {
            this.csvLink.current.link.click()
        }
    }

    clearAll = () => {
        this.setState({
            filterData: {
                name: '',
                email: ''
            },
        }, () => { this.initializeData() })
    }

	render() {
		 strings.setLanguage(this.state.language);
		const { openModal, closeModal, id, companyData, coaName, employee_list ,payroll_employee_list} = this.props;
		const { initValue, contentState, data, loading, selectedRows } = this.state;

		let tmpSupplier_list = []
		console.log(payroll_employee_list, "Variable")

		return (
			<div className="contact-modal-screen">
				<Modal isOpen={openModal} className="modal-success chartofaccounts-modal">
					<ModalHeader>
					<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="nav-icon fas fa-user-tie" />
												<span className="ml-2">Create Chart Of Account</span>
											</div>
										</Col>
									</Row>
					</ModalHeader>
					<ModalBody >
						<div>
							<div >
								<CardBody>
									{loading ? (
										<Row>
											<Col lg={12}>
												<Loader />
											</Col>
										</Row>
									) : (
										<Row>
										<Col lg={12}>
											<Formik
												initialValues={this.state.initValue}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
												}}
												validate={(values) => {
													let errors = {};
													if (this.state.exist === true) {
														errors.transactionCategoryName =
															'Chart Of Account Name is already exist';
													}
													return errors;
												}}
												validationSchema={Yup.object().shape({
													// transactionCategoryCode: Yup.string()
													//   .required("Code Name is required"),
													// transactionCategoryName: Yup.string()
													// 	.required('Name is required')
													// 	.min(2, 'Name Is Too Short!')
													// 	.max(50, 'Name Is Too Long!'),
													chartOfAccount: Yup.string().required(
														'Type is required',
													),
												})}
											>
												{(props) => (
													<Form onSubmit={props.handleSubmit} name="simpleForm">
													
														<FormGroup>
															<Label htmlFor="name">
																<span className="text-danger">* </span>{strings.Name}
															</Label>
															<Input
																type="text" maxLength='50'
																id="transactionCategoryName"
																name="transactionCategoryName"
																placeholder={strings.Enter+strings.Name}
																disabled={true}
																onChange={(option) => {
																	if (
																		option.target.value === '' ||
																		this.regExAlpha.test(option.target.value)
																	) {
																		props.handleChange(
																			'transactionCategoryName',
																		)(option);
																	}
																	this.validationCheck(option.target.value);
																}}
																value={coaName}
																className={
																	props.errors.transactionCategoryName &&
																	props.touched.transactionCategoryName
																		? 'is-invalid'
																		: ''
																}
															/>
															{props.errors.transactionCategoryName &&
																props.touched.transactionCategoryName && (
																	<div className="invalid-feedback">
																		{props.errors.transactionCategoryName}
																	</div>
																)}
														</FormGroup>
														<FormGroup>
															<Label htmlFor="name">
																<span className="text-danger">* </span>{strings.Type}
															</Label>
														
															<Select
															styles={customStyles}
																id="chartOfAccount"
																name="chartOfAccount"
																placeholder={strings.Select+strings.Type}
																value={props.values.chartOfAccount}
																// size="1"
																onChange={(val) => {
																	props.handleChange('chartOfAccount')(val);
																}}
																options={this.state.chartOfAccountCategory}
																className={`
                                 ${
																		props.errors.chartOfAccount &&
																		props.touched.chartOfAccount
																			? 'is-invalid'
																			: ''
																	}`}
															/>
															{props.errors.chartOfAccount &&
																props.touched.chartOfAccount && (
																	<div className="invalid-feedback">
																		{props.errors.chartOfAccount}
																	</div>
																)}
														</FormGroup>
														<FormGroup className="text-right mt-5">
															<Button
																type="button"
																name="submit"
																color="primary"
																className="btn-square mr-3"
																disabled={this.state.disabled}
																onClick={() => {
																	this.setState({ createMore: false });
																	props.handleSubmit();
																}}
															>
																<i className="fa fa-dot-circle-o"></i> {this.state.disabled
																			? 'Creating...'
																			: strings.Create }
															</Button>
															
															<Button
									color="secondary"
									className="btn-square"
									onClick={() => {
										closeModal(false);
									}}
								>
									<i className="fa fa-ban"></i> Cancel
								</Button>
														</FormGroup>
													</Form>
												)}
											</Formik>
										</Col>
									</Row>
									)}
								</CardBody>
							</div>
						</div>
					</ModalBody>
					{/* <ModalFooter>

						<Row className="mb-4 ">

							<Col>
							
							
							</Col>
						</Row>

					</ModalFooter> */}
				</Modal>

			</div>
		);
	}
}


export default connect(
	mapStateToProps
,mapDispatchToProps
)(AddEmployeesModal);