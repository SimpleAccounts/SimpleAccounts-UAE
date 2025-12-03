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
} from 'reactstrap'

import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'

import { Loader, ConfirmDeleteModal } from 'components'


import 'react-toastify/dist/ReactToastify.css'
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css'

import * as SalaryStructureAction from './actions'
import {
  CommonActions
} from 'services/global'
import { CSVLink } from "react-csv";


import './style.scss'
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
  return ({
    salaryStructure_list: state.salaryStructure.salaryStructure_list,

  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    salaryStructureActions: bindActionCreators(SalaryStructureAction, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch)
  })
}
let strings = new LocalizedStrings(data);
class SalaryStructure extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      language: window['localStorage'].getItem('language'),
      loading: true,
      selectedRows: [],
      dialog: null,
      filterData: {
        name: '',
        email: ''
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
    this.props.salaryStructureActions.getSalaryStructureList(postData).then((res) => {
      if (res.status === 200) {
        this.setState({ loading: false })
      }
    }).catch((err) => {
      this.setState({ loading: false })
      this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
    })
  }

  goToDetail = (row) => {
    this.props.history.push('/admin/payroll/config/detailSalaryStructure', { id: row.salaryStructureId })
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

  // removeBulk = () => {
  //   this.removeDialog()
  //   let { selectedRows } = this.state;
  //   const { salaryStructure_list } = this.props
  //   let obj = {
  //     ids: selectedRows
  //   }
  //   this.props.salaryStructureActions.removeBulkEmployee(obj).then((res) => {
  //     if (res.status === 200) {
  //       this.props.commonActions.tostifyAlert('success', 'Employees Deleted Successfully')
  //       this.initializeData();
  //       if (salaryStructure_list && salaryStructure_list.data && salaryStructure_list.data.length > 0) {
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
  //     this.props.employeeActions.getSalaryStructureList(obj).then((res) => {
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
    strings.setLanguage(this.state.language);
    const { loading, dialog, selectedRows, csvData, view, filterData } = this.state
    const { salaryStructure_list } = this.props


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
                    <span className="ml-2">{strings.SalaryStructure}</span>
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
                            className="btn-square"
                            onClick={() => this.props.history.push(`/admin/payroll/salaryStructure/create`)}
                          >
                            <i className="fas fa-plus" />
                            {strings.NewSalaryStructure}
                          </Button> */}

                          <div style={{ width: "1650px" }}>
                                                            <Button
                                                                color="primary"
                                                                className="btn-square pull-right mb-2 mr-2"
                                                                style={{ marginBottom: '10px' }}
                                                                onClick={() => this.props.history.push(`/admin/payroll/config/createSalaryStructure`)}

                                                            >
                                                                <i className="fas fa-plus mr-1" />
                                                                {strings.NewSalaryStructure}
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
                      {/* <div className="py-3">
                        <h5>Filter : </h5>
                        <form >
                          <Row>
                            <Col lg={3} className="mb-1">
                              <Input type="text" placeholder="Name" value={filterData.name} onChange={(e) => { this.handleChange(e.target.value, 'name') }} />
                            </Col>
                            <Col lg={3} className="mb-2">
                              <Input type="text" placeholder="Email" value={filterData.email} onChange={(e) => { this.handleChange(e.target.value, 'email') }} />
                            </Col>
                            <Col lg={1} className="pl-0 pr-0" style={{display: "contents"}}>
                              <Button type="button" color="primary" className="btn-square mr-1" onClick={this.handleSearch}>
                                <i className="fa fa-search"></i>
                              </Button>
                              <Button type="button" color="primary" className="btn-square" onClick={this.clearAll}>
                                <i className="fa fa-refresh"></i>
                              </Button>
                            </Col>
                          </Row>
                        </form>
                      </div> */}
                      <div>
                        <BootstrapTable
                          selectRow={this.selectRowProp}
                          search={false}
                          options={this.options}
                          data={salaryStructure_list && salaryStructure_list.data ? salaryStructure_list.data : []}
                          version="4"
                          hover
                          pagination={salaryStructure_list && salaryStructure_list.data && salaryStructure_list.data.length > 0 ? true : false}
                          keyField="id"
                          remote
                          fetchInfo={{ dataTotalSize: salaryStructure_list.count ? salaryStructure_list.count : 0 }}
                          className="employee-table"
                          trClassName="cursor-pointer"
                          // csvFileName="salaryStructure_list.csv"
                          ref={(node) => this.table = node}
                        >
                          <TableHeaderColumn
                                className="table-header-bg"
                            dataField="salaryStructureType"
                        
                          >
                          {strings.SalaryStructureType}
                          </TableHeaderColumn>
                          <TableHeaderColumn
                                className="table-header-bg"
                            dataField="salaryStructureName"
                          
                          // dataFormat={this.vatCategoryFormatter}
                          >
                         {strings.SalaryStructureName}
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

export default connect(mapStateToProps, mapDispatchToProps)(SalaryStructure)
