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
	Table,

  ButtonGroup,
  Input,
} from 'reactstrap'

import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'

import { Loader, ConfirmDeleteModal } from 'components'


import 'react-toastify/dist/ReactToastify.css'
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css'

import * as SalaryTemplateActions from './actions'
import {
  CommonActions
} from 'services/global'



import './style.scss'

const mapStateToProps = (state) => {
  return ({
    template_list: state.salarytemplate.template_list,
    vat_list: state.employee.vat_list
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    salaryTemplateActions: bindActionCreators(SalaryTemplateActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch)
  })
}

class SalaryTemplate extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      selectedRows: [],
      dialog: null,
      filterData: {
        name: '',
        email: ''
      },
      data:{
        Fixed : [],
      },
      csvData: [],
      view: false
    }

    this.options = {
      onRowClick: this.goToDetail,
      paginationPosition: 'bottom',
      page: 1,
      sizePerPage: 10,
      onSizePerPageList: this.onSizePerPageList,
      onPageChange: this.onPageChange,
      sortName: '',
      sortOrder: '',
      onSortChange: this.sortColumn
    }

    this.selectRowProp = {
      bgColor: 'rgba(0,0,0, 0.05)',
      clickToSelect: false,
      onSelect: this.onRowSelect,
      onSelectAll: this.onSelectAll
    }
    this.csvLink = React.createRef()

    this.columnHeader1 = [
			{ label: 'Sr.No', value: 'Sr.No', sort: false },
			{ label: 'Component Name', value: 'Component Name', sort: false },
			{ label: 'Type', value: 'Type', sort: false },
			{ label: 'Options', value: 'Options', sort: false },
		];

    this.columnHeader2 = [
			{ label: 'Sr.No', value: 'Sr.No', sort: false },
			{ label: 'Component Name', value: 'Component Name', sort: false },
			{ label: 'Options', value: 'Options', sort: false },
		];
  }

  componentDidMount = () => {
    this.initializeData()
  }

  componentWillUnmount = () => {
    this.setState({
      selectedRows: []
    })
  }

  initializeData = (search) => {
    this.props.salaryTemplateActions.getSalaryTemplateList().then((res) => {
      if (res.status === 200) {
        this.setState({ 
          Fixed:res.data.salaryComponentResult.Fixed,
          Variable:res.data.salaryComponentResult.Variable,
          Deduction:res.data.salaryComponentResult.Deduction,
          loading: false })
      }
      console.log(this.state.Fixed, "Fixed")
    }).catch((err) => {
      this.setState({ loading: false })
      this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
    })
  }

  goToDetail = (row) => {
    this.props.history.push('/admin/payroll/salaryTemplate/detail', { id: row.id })
  }

  sortColumn = (sortName, sortOrder) => {
    this.options.sortName = sortName;
    this.options.sortOrder = sortOrder;
    this.initializeData()
  }

  onRowSelect = (row, isSelected, e) => {
    let tempList = []
    if (isSelected) {
      tempList = Object.assign([], this.state.selectedRows)
      tempList.push(row.id);
    } else {
      this.state.selectedRows.map((item) => {
        if (item !== row.id) {
          tempList.push(item)
        }
        return item
      });
    }
    this.setState({
      selectedRows: tempList
    })
  }
  onSelectAll = (isSelected, rows) => {
    let tempList = []
    if (isSelected) {
      rows.map((item) => {
        tempList.push(item.id)
        return item
      })
    }
    this.setState({
      selectedRows: tempList
    })
  }

  // bulkDelete = () => {
  //   const {
  //     selectedRows
  //   } = this.state
  //     if (selectedRows.length > 0) {
  //     const message1 =
  //     <text>
  //     <b>Delete Employee?</b>
  //     </text>
  //     const message = 'This Employee will be deleted permanently and cannot be recovered. ';
  //     this.setState({
  //       dialog: <ConfirmDeleteModal
  //         isOpen={true}
  //         okHandler={this.removeBulk}
  //         cancelHandler={this.removeDialog}
  //         message={message}
  //         message1={message1}
  //       />
  //     })
  //   } else {
  //     this.props.commonActions.tostifyAlert('info', 'Please select the rows of the table and try again.')
  //   }
  // }

  // removeBulk = () => {
  //   this.removeDialog()
  //   let { selectedRows } = this.state;
  //   const { template_list } = this.props
  //   let obj = {
  //     ids: selectedRows
  //   }
  //   this.props.salaryTemplateActions.removeBulkEmployee(obj).then((res) => {
  //     if (res.status === 200) {
  //       this.props.commonActions.tostifyAlert('success', 'Employees Deleted Successfully')
  //       this.initializeData();
  //       if (template_list && template_list.data && template_list.data.length > 0) {
  //         this.setState({
  //           selectedRows: []
  //         })
  //       }
  //     }
  //   }).catch((err) => {
  //     this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
  //   })
  // }

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

  // getCsvData = () => {
  //   if (this.state.csvData.length === 0) {
  //     let obj = {
  //       paginationDisable: true
  //     }
  //     this.props.salaryTemplateActions.getEmployeeList(obj).then((res) => {
  //       if (res.status === 200) {
  //         this.setState({ csvData: res.data.data, view: true }, () => {
  //           setTimeout(() => {
  //             this.csvLink.current.link.click()
  //           }, 0)
  //         });
  //       }
  //     })
  //   } else {
  //     this.csvLink.current.link.click()
  //   }
  // }

  clearAll = () => {
    this.setState({
      filterData: {
        name: '',
        email: ''
      },
    },() => { this.initializeData() })
  }

  render() {

    const { loading, dialog, selectedRows, csvData, view, filterData } = this.state
    const { template_list } = this.props


    return (
      loading ==true? <Loader/> :
<div>
      <div className="employee-screen">
        <div className="animated fadeIn">
          {dialog}
          {/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
          <Card>
            <CardHeader>
              <Row>
                <Col lg={12}>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="fas fa-object-group" />
                    <span className="ml-2">Salary Templates</span>
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
                    <Row>
                    <Col lg={8}>
                      <h4>Fixed Earnings</h4>
                      <Table>
                    <thead >
													<tr >
														{this.columnHeader1.map((column, index) => {
															return (
																<th>
																	{column.label}
																</th>
															);
														})}
													</tr>
												</thead>
                        <tbody>
                        {Object.values(
																this.state.Fixed,
															).map((item) => (
																<tr>
																	<td className="pt-0 pb-0">{item.id}</td>
																	<td className="pt-0 pb-0">{item.description}</td>
                                  <td className="pt-0 pb-0">{item.formula}</td>
																	<td className="pt-0 pb-0">{item.flatAmount}</td>
																{console.log(item)}
																</tr>
															))}
                        </tbody>
                    </Table>
                    <Button
																	type="button"
																	color="primary"
																	className="btn-square mr-3 mb-3"
																	onClick={(e, props) => {
																		this.openCustomerModal(props);
																	}}
																>
																	<i className="fa fa-plus"></i> Add a Customer
																</Button>
                    </Col>
                    <Col lg={8}>
                      <h4>Variable Earnings</h4>
                      <Table>
                    <thead >
													<tr >
														{this.columnHeader1.map((column, index) => {
															return (
																<th>
																	{column.label}
																</th>
															);
														})}
													</tr>
												</thead>
                        <tbody>
                        {Object.values(
																this.state.Variable,
															).map((item) => (
																<tr>
																	<td className="pt-0 pb-0">{item.id}</td>
																	<td className="pt-0 pb-0">{item.description}</td>
                                  <td className="pt-0 pb-0">{item.formula}</td>
																	<td className="pt-0 pb-0">{item.flatAmount}</td>
																{console.log(item)}
																</tr>
															))}
                        </tbody>
                    </Table>
                    <Button
																	type="button"
																	color="primary"
																	className="btn-square mr-3 mb-3"
																	onClick={(e, props) => {
																		this.openCustomerModal(props);
																	}}
																>
																	<i className="fa fa-plus"></i> Add a Customer
																</Button>
                    </Col>
                    <Col lg={8}>
                      <h4>Deductions</h4>
                      <Table>
                    <thead >
													<tr >
														{this.columnHeader1.map((column, index) => {
															return (
																<th>
																	{column.label}
																</th>
															);
														})}
													</tr>
												</thead>
                        <tbody>
                        {Object.values(
																this.state.Deduction,
															).map((item) => (
																<tr>
																	<td className="pt-0 pb-0">{item.id}</td>
																	<td className="pt-0 pb-0">{item.description}</td>
                                  <td className="pt-0 pb-0">{item.formula}</td>
																	<td className="pt-0 pb-0">{item.flatAmount}</td>
																{console.log(item)}
																</tr>
															))}
                        </tbody>
                    </Table>
                    <Button
																	type="button"
																	color="primary"
																	className="btn-square mr-3 mb-3"
																	onClick={(e, props) => {
																		this.openCustomerModal(props);
																	}}
																>
																	<i className="fa fa-plus"></i> Add a Customer
																</Button>
                    </Col>
                    </Row>
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

export default connect(mapStateToProps, mapDispatchToProps)(SalaryTemplate)
