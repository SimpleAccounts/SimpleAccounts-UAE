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
import { toInteger, upperCase, upperFirst } from 'lodash';
import { Formik, Field } from 'formik';
import Select from 'react-select';
import * as Yup from 'yup';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';
import { selectOptionsFactory } from 'utils';
import DatePicker from 'react-datepicker';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';

import { toast } from 'react-toastify';
import { data } from '../../../../Language/index'
import LocalizedStrings from 'react-localization';

import '../style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import ReactToPrint from 'react-to-print';
import { Loader } from 'components';
import * as PayrollEmployeeActions from '../../../../payrollemp/actions'
import * as CreatePayrollActions from '../actions';

const mapStateToProps = (state) => {
 
	return {
		contact_list: state.request_for_quotation.contact_list,
		payroll_employee_list:state.payrollEmployee.payroll_employee_list,
	};

};


const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		payrollEmployeeActions: bindActionCreators(PayrollEmployeeActions, dispatch),
		createPayrollActions: bindActionCreators(CreatePayrollActions, dispatch),
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
            
            dialog: null,
            filterData: {
                name: '',
                email: ''
            },
            csvData: [],
            view: false
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
		
		// this.props.createPayrollActions.getEmployeesForDropdown();
		// this.props.createPayrollEmployeeActions.getEmployeesForDropdown();
		const { filterData } = this.state
        const paginationData = {
            pageNo: this.options.page ? this.options.page - 1 : 0,
            pageSize: this.options.sizePerPage
        }
        const sortingData = {
            order: this.options.sortOrder ? this.options.sortOrder : '',
            sortingCol: this.options.sortName ? this.options.sortName : ''
        }
        const postData = { ...filterData, ...paginationData, ...sortingData }
        this.props.payrollEmployeeActions.getPayrollEmployeeList2(postData).then((res) => {
            if (res.status === 200) {
				
                this.setState({ loading: false })
            }
        }).catch((err) => {
            this.setState({ loading: false })
            this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
        })
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
		const { openModal, closeModal, id, companyData, bankDetails, employee_list ,payroll_employee_list} = this.props;
		const { initValue, contentState, data, loading, selectedRows } = this.state;

		let tmpSupplier_list = []
		console.log(payroll_employee_list, "Variable")

		return (
			<div className="contact-modal-screen">
				<Modal isOpen={openModal} className="modal-success contact-modal">
					<ModalHeader>
					<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="nav-icon fas fa-user-tie" />
												<span className="ml-2">Select Employees</span>
											</div>
										</Col>
									</Row>
					</ModalHeader>
					<ModalBody style={{ padding: "15px 0px 0px 0px" }}>
						<div  style={{ padding: " 0px 1px" }}>
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

												<div >
												<BootstrapTable
                                                    selectRow={this.selectRowProp}
                                                    search={false}
                                                    options={this.options}
                                                    data={payroll_employee_list &&
                                                         payroll_employee_list.data && payroll_employee_list.data ?  payroll_employee_list.data : []}
                                                    version="4"
                                                    hover
                                                    pagination={payroll_employee_list && payroll_employee_list.data 
                                                        && payroll_employee_list.data.length > 0 ? true : false}
                                                    keyField="id"
                                                    remote
                                                    fetchInfo={{ dataTotalSize: payroll_employee_list.count ? payroll_employee_list.count : 0 }}                                            
                                                    ref={(node) => this.table = node}
                                                >
													     <TableHeaderColumn
                                                        className="table-header-bg"
                                                        dataField="employeeCode"
                                                        dataSort
														width="15%"
                                                        >
                                                         {strings.EmployeeCode}
                          </TableHeaderColumn>
                                                    <TableHeaderColumn
                                                        className="table-header-bg"
                                                        dataField="fullName"
                                                        dataSort
                                           
                                                        dataFormat={this.fullname}
                                                    >
                                                         {strings.FullName}
                          </TableHeaderColumn>
                     
                                                    <TableHeaderColumn
                                                        className="table-header-bg"
                                                        dataField="mobileNumber"
                                                        dataSort
                                                    // dataFormat={this.vatCategoryFormatter}
                                           
                                                    >
                                                         {strings.MobileNumber}
                          </TableHeaderColumn>
                                                    <TableHeaderColumn
                                                        className="table-header-bg"
                                                        dataField="dob"
                                                        dataSort
                                                        dataFormat={this.renderDOB}
                                                   
                                                    >
                                                         {strings.DateOfBirth}
                          </TableHeaderColumn>
                                                    {/* <TableHeaderColumn
                                                        className="table-header-bg"
                                                        dataField="gender"
                                                        dataSort
                                                        width="12%"
                                                    >
                                                         {strings.Gender}
                          </TableHeaderColumn>
                                                  
                                                    <TableHeaderColumn
                                                        className="table-header-bg"
                                                        dataField="city"
                                                        dataSort
                                                    // dataFormat={this.vatCategoryFormatter}
                                                    width="10%"
                                                    >
                                                        {strings.City}
                          </TableHeaderColumn> */}
                                                    <TableHeaderColumn
                                                        className="table-header-bg"
                                                        dataField="isActive"
                                                        dataSort
                                                    dataFormat={this.renderStatus}
                                                         width="10%"
                                                    >
                                                        {strings.Status}
                          </TableHeaderColumn>
                                                    {/* <TableHeaderColumn
                                                        className="text-right"
                                                        columnClassName="text-right"
                                                        //width="5%"
                                                        dataFormat={this.renderActions}
                                                        className="table-header-bg"
                                                    ></TableHeaderColumn> */}
                                                </BootstrapTable>
												</div>

											</Col>

										</Row>
									)}
								</CardBody>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>

						<Row className="mb-4 ">

							<Col>
								<Button
									color="primary"
									className="btn-square "
									onClick={this.addEmployees}
									// disabled={selectedRows.length === 0}

								>
									<i className="fas fa-check-double mr-1"></i>

									Add employees
								</Button>
								<Button
									color="secondary"
									className="btn-square"
									onClick={() => {
										closeModal(false);
									}}
								>
									<i className="fa fa-ban"></i> {strings.Cancel}
								</Button>
							</Col>
						</Row>

					</ModalFooter>
				</Modal>

			</div>
		);
	}
}


export default connect(
	mapStateToProps
,mapDispatchToProps
)(AddEmployeesModal);