import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Row,
	Col,
	ButtonGroup,
	Input,
	ButtonDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'

import { Loader, ConfirmDeleteModal } from 'components'


import 'react-toastify/dist/ReactToastify.css'
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css'

import * as EmployeeActions from './actions'
import {
  CommonActions
} from 'services/global'

import './style.scss'
import LocalizedStrings from 'react-localization';
 import {data}  from '../Language/index'
const mapStateToProps = (state) => {
  return ({
    salaryRole_list: state.salaryRoles.salaryRole_list,
    salaryStructure_list: state.salaryStructure.salaryStructure_list,
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    employeeActions: bindActionCreators(EmployeeActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch)
  })
}

let strings = new LocalizedStrings(data);
class SalaryRoles extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      language: window['localStorage'].getItem('language'),
      actionButtons: {},
      loading: true,
      selectedRows: [],
      dialog: null,
      filterData: {
        salaryRoleId: '',
        salaryRoleName: ''
      },
      csvData: [],
      view: false,
  
    }
    // this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.options = {
      onRowClick: this.goToDetail,
      paginationPosition: 'top',
      page: 1,
      sizePerPage: 10,
      onSizePerPageList: this.onSizePerPageList,
      onPageChange: this.onPageChange,
      sortName: '',
      sortOrder: '',
      onSortChange: this.sortColumn
    }


    // this.selectRowProp = {
    //   bgColor: 'rgba(0,0,0, 0.05)',
    //   clickToSelect: false,
    //   onSelect: this.onRowSelect,
    //   onSelectAll: this.onSelectAll
    // }
    this.csvLink = React.createRef()
  }
  // handleLanguageChange(e) {
  //   e.preventDefault();
  //   let lang = e.target.value;
  //   this.setState(prevState => ({
  //     language: lang
  //   }))
  // }
  componentDidMount = () => {
    window['localStorage'].getItem('accessToken')
    this.initializeData()
  }

  componentWillUnmount = () => {
    this.setState({
      selectedRows: []
    })
  }

  initializeData = (search) => {
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
    this.props.employeeActions.getSalaryRoleList(postData).then((res) => {
      if (res.status === 200) {
        this.setState({ loading: false })
      }
    }).catch((err) => {
      this.setState({ loading: false })
      this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
    })
  }

  goToDetail = (row) => {
    this.props.history.push('/admin/payroll/config/detailSalaryRoles', { id: row.salaryRoleId })
  }

  sortColumn = (sortName, sortOrder) => {
    this.options.sortName = sortName;
    this.options.sortOrder = sortOrder;
    this.initializeData()
  }


  bulkDelete = () => {
    const {
      selectedRows
    } = this.state
      if (selectedRows.length > 0) {
      const message1 =
      <text>
      <b>Delete Employee?</b>
      </text>
      const message = 'This Employee will be deleted permanently and cannot be recovered. ';
      this.setState({
        dialog: <ConfirmDeleteModal
          isOpen={true}
          okHandler={this.removeBulk}
          cancelHandler={this.removeDialog}
          message={message}
          message1={message1}
        />
      })
    } else {
      this.props.commonActions.tostifyAlert('info', 'Please select the rows of the table and try again.')
    }
  }

  removeBulk = () => {
    this.removeDialog()
    let { selectedRows } = this.state;
    const { salaryRole_list } = this.props
    let obj = {
      ids: selectedRows
    }
    this.props.employeeActions.removeBulkEmployee(obj).then((res) => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert('success', 'Employees Deleted Successfully')
        this.initializeData();
        if (salaryRole_list && salaryRole_list.data && salaryRole_list.data.length > 0) {
          this.setState({
            selectedRows: []
          })
        }
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
    })
  }

  removeDialog = () => {
    this.setState({
      dialog: null
    })
  }

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

  onPageChange = (page, sizePerPage) => {
    if (this.options.page !== page) {
      this.options.page = page
      this.initializeData()
    }
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
        id: '',
        salaryRoleName: ''
      },
    },() => { this.initializeData() })
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
	renderActions = (cell, row) => {
		return (
  
			<div>
				<ButtonDropdown
					isOpen={this.state.actionButtons[row.id]}
					toggle={() => this.toggleActionButton(row.id)}
				>
					<DropdownToggle size="sm" color="primary" className="btn-brand icon">
						{this.state.actionButtons[row.id] === true ? (
							<i className="fas fa-chevron-up" />
						) : (
							<i className="fas fa-chevron-down" />
						)}
					</DropdownToggle>
					<DropdownMenu right>

							<DropdownItem
								onClick={() =>
									this.props.history.push(
										'/admin/payroll/employee/detail',
										{ salaryRoleId: row.id },
									)
								}
							>
								
								<i className="fas fa-edit" /> {strings.Edit}
							</DropdownItem>
							
				
						{/* <DropdownItem
							onClick={() =>
								this.props.history.push(
									'/admin/payroll/employee/salarySlip',
									{ id: row.id },
								)
							}
						>
							<i className="fas fa-eye" /> Salary Slip
						</DropdownItem> */}
					
					</DropdownMenu>
				</ButtonDropdown>
			</div>
		);
	};
  render() {
strings.setLanguage(this.state.language);
    const { loading, dialog, selectedRows, csvData, view, filterData } = this.state
    const { salaryRole_list,salaryStructure_list } = this.props
console.log("strings",strings)
    return (
      loading ==true? <Loader/> :
<div>
      <div className="employee-screen">
        <div className="animated fadeIn">
          {dialog}
          {/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
          <Card>

          {/* <div>
        Change Language:   <select onChange={this.handleLanguageChange}>
          <option value="en">En- English</option>
          <option value="it">fr-french</option>
          <option value="ar">ar-Arabic</option>
        </select>
      </div> */}
          </Card>
          <Card>
            <CardHeader>
              <Row>
                <Col lg={12}>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="fas fa-object-group" />
                    <span className="ml-2"> {strings.SalaryRole}</span>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {
                loading ?
                  <Row>
                    <Col lg={12}>
                      <Loader />
                    </Col>
                  </Row>
                  :
                  <Row>
                  
                    <Col lg={12}>
                      <div className="d-flex justify-content-end">
                        <ButtonGroup size="sm">
                          {/* <Button
                            color="success"
                            className="btn-square"
                            onClick={() => this.getCsvData()}
                          >
                            <i className="fa glyphicon glyphicon-export fa-download mr-1" />Export To CSV
                          </Button>
                          {view && <CSVLink
                            data={csvData}
                            filename={'Employee.csv'}
                            className="hidden"
                            ref={this.csvLink}
                            target="_blank"
                          />} */}
                          {/* <Button

                            color="primary"
                            className="btn-square mb-2"
                            onClick={() => this.props.history.push(`/admin/payroll/salaryRoles/create`)}
                          >
                            <i className="fas fa-plus mr-1 " />
                            {strings.NewSalaryRoles}
                          </Button> */}

                          <div style={{ width: "1650px" }}>
                                                            <Button
                                                                color="primary"
                                                                className="btn-square pull-right mb-2 mr-2"
                                                                style={{ marginBottom: '10px' }}
                                                                onClick={() => this.props.history.push(`/admin/payroll/config/createSalaryRoles`)}

                                                            >
                                                                <i className="fas fa-plus mr-1" />
                                                                {strings.NewSalaryRoles}
									</Button>
                                    </div>
                          {/* <Button
                            color="warning"
                            className="btn-square"
                            onClick={this.bulkDelete}
                            disabled={selectedRows.length === 0}
                          >
                            <i className="fa glyphicon glyphicon-trash fa-trash mr-1" />
                            Bulk Delete
                          </Button> */}
                        </ButtonGroup>
                      </div>
                     
                      <div>
                        <BootstrapTable
                          selectRow={this.selectRowProp}
                          search={false}
                          options={this.options}
                          data={salaryRole_list && salaryRole_list.data ? salaryRole_list.data : []}
                          version="4"
                          hover
                          // pagination={salaryRole_list && salaryRole_list.data && salaryRole_list.data.length > 0 ? true : false}
                           keyField="id"
                          remote
                          fetchInfo={{ dataTotalSize: salaryRole_list.count ? salaryRole_list.count : 0 }}
                        //  className="employee-table"
                          trClassName="cursor-pointer"
                          csvFileName="salaryRole_list.csv"
                          ref={(node) => this.table = node}
                        >
                          <TableHeaderColumn
                            dataField="salaryRoleId"
                            className="table-header-bg" 
                          >
                         {strings.SALARYROLEID}
                          </TableHeaderColumn>
                          <TableHeaderColumn
                            dataField="salaryRoleName"
                            className="table-header-bg"
                          >
                       {strings.SALARYROLENAME}
                          </TableHeaderColumn>
                        
                        </BootstrapTable>
                      </div>
                    </Col>
                
                  </Row>
                
                  
              }
            </CardBody>
          </Card>
        </div>
      </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SalaryRoles)
