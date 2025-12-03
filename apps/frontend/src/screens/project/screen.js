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
  Input
} from 'reactstrap'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'

import { Loader, ConfirmDeleteModal } from 'components'

import 'react-toastify/dist/ReactToastify.css'
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css'

import * as ProjectActions from './actions'
import {
  CommonActions
} from 'services/global'
import { CSVLink } from "react-csv";

import './style.scss'

const mapStateToProps = (state) => {
  return ({
    project_list: state.project.project_list
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    projectActions: bindActionCreators(ProjectActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch)

  })
}

class Project extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      selectedRows: [],
      dialog: false,
      filterData: {
        projectName: '',
        vatRegistrationNumber: '',
        expenseBudget: '',
        revenueBudget: '',
      },
      csvData: [],
      view: false
    }

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

    this.selectRowProp = {
      mode: 'checkbox',
      bgColor: 'rgba(0,0,0, 0.05)',
      clickToSelect: false,
      onSelect: this.onRowSelect,
      onSelectAll: this.onSelectAll
    }
    this.csvLink = React.createRef()
  }

  componentDidMount = () => {
    this.initializeData();
  }

  initializeData = (search) => {
    let { filterData } = this.state
    const paginationData = {
      pageNo: this.options.page ? this.options.page - 1 : 0,
      pageSize: this.options.sizePerPage
    }
    const sortingData = {
      order: this.options.sortOrder ? this.options.sortOrder : '',
      sortingCol: this.options.sortName ? this.options.sortName : ''
    }
    const postData = { ...filterData, ...paginationData, ...sortingData }
    this.props.projectActions.getProjectList(postData).then((res) => {
      if (res.status === 200) {
        this.setState({ loading: false })
      }
    }).catch((err) => {
      this.setState({
        loading: false
      })
      this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
    })
  }

  sortColumn = (sortName, sortOrder) => {
    this.options.sortName = sortName;
    this.options.sortOrder = sortOrder;
    this.initializeData()
  }

  goToDetail = (row) => {
    this.props.history.push(`/admin/master/project/detail`, { id: row.projectId })
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

  onRowSelect = (row, isSelected, e) => {
    let tempList = []
    if (isSelected) {
      tempList = Object.assign([], this.state.selectedRows)
      tempList.push(row.projectId);
    } else {
      this.state.selectedRows.map((item) => {
        if (item !== row.projectId) {
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
        tempList.push(item.projectId)
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
        <b>Delete Project?</b>
        </text>
        const message = 'This Project will be deleted permanently and cannot be recovered. ';
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
    let { selectedRows } = this.state;
    const { project_list } = this.props
    let obj = {
      ids: selectedRows
    }
    this.removeDialog()
    this.props.projectActions.removeBulk(obj).then((res) => {
      this.initializeData();
      this.props.commonActions.tostifyAlert('success', 'Projects Deleted Successfully')
      if (project_list && project_list.data && project_list.data.length > 0) {
        this.setState({
          selectedRows: []
        })
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
  }

  contactFormatter = (cell, row) => {
    return row['contact'] ? row['contact']['firstName'] : '';
  }

  currencyFormatter = (cell, row) => {
    return row['currency'] ? row['currency']['currencyName'] : '';
  }

  getCsvData = () => {
    if (this.state.csvData.length === 0) {
      let obj = {
        paginationDisable: true
      }
      this.props.projectActions.getProjectList(obj).then((res) => {
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
        projectName: '',
        vatRegistrationNumber: '',
        expenseBudget: '',
        revenueBudget: '',
      }
    } , () => { this.initializeData() })
  }

  render() {
    const { loading, dialog, selectedRows, csvData, view, filterData } = this.state
    const { project_list } = this.props


    return (
      loading ==true? <Loader/> :
<div>
      <div className="product-screen">
        <div className="animated fadeIn">
          {/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
          {dialog}
          <Card>
            <CardHeader>
              <Row>
                <Col lg={12}>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="nav-icon fas fa-project-diagram" />
                    <span className="ml-2">Projects</span>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {
                loading ?
                  <Loader></Loader> :
                  <Row>
                    <Col lg={12}>
                      <div className="d-flex justify-content-end">
                        <ButtonGroup size="sm">
                          <Button
                            color="success"
                            className="btn-square"
                            onClick={() => this.getCsvData()}
                          >
                            <i className="fa glyphicon glyphicon-export fa-download mr-1" />Export To CSV
                          </Button>
                          {view && <CSVLink
                            data={csvData}
                            filename={'Project.csv'}
                            className="hidden"
                            ref={this.csvLink}
                            target="_blank"
                          />}
                          <Button
                            color="primary"
                            className="btn-square"
                            onClick={() => this.props.history.push(`/admin/master/project/create`)}
                          >
                            <i className="fas fa-plus mr-1" />
                            New Project
                          </Button>
                          <Button
                            type="button"
                            color="warning"
                            className="btn-square"
                            onClick={this.bulkDelete}
                            disabled={selectedRows.length === 0}

                          >
                            <i className="fa glyphicon glyphicon-trash fa-trash mr-1" />
                            Bulk Delete
                          </Button>
                        </ButtonGroup>
                      </div>
                      <div className="py-3">
                        <h5>Filter : </h5>
                        <form>
                          <Row>
                            <Col lg={2} className="mb-1">
                              <Input type="text" placeholder="Project Name" value={filterData.projectName} onChange={(e) => { this.handleChange(e.target.value, 'projectName') }} />
                            </Col>
                            <Col lg={2} className="mb-1">
                              <Input type="text" placeholder="Expense Budget" value={filterData.expenseBudget} onChange={(e) => { this.handleChange(e.target.value, 'expenseBudget') }} />
                            </Col>
                            <Col lg={2} className="mb-1">
                              <Input type="text" placeholder="Revenue Budget" value={filterData.revenueBudget} onChange={(e) => { this.handleChange(e.target.value, 'revenueBudget') }} />
                            </Col>
                            <Col lg={2} className="mb-1">
                              <Input type="text" placeholder="VAT Number" value={filterData.vatRegistrationNumber} onChange={(e) => { this.handleChange(e.target.value, 'vatRegistrationNumber') }} />
                            </Col>
                            <Col lg={1} className="pl-0 pr-0">
                              <Button type="button" color="primary" className="btn-square mr-1" onClick={this.handleSearch}>
                                <i className="fa fa-search"></i>
                              </Button>
                              <Button type="button" color="primary" className="btn-square" onClick={this.clearAll}>
                                <i className="fa fa-refresh"></i>
                              </Button>
                            </Col>
                          </Row>
                        </form>
                      </div>
                      <div>
                        <BootstrapTable
                          selectRow={this.selectRowProp}
                          search={false}
                          options={this.options}
                          data={project_list && project_list.data ? project_list.data : []}
                          version="4"
                          hover
                          keyField="projectId"
                          pagination={project_list && project_list.data && project_list.data.length > 0 ? true : false}
                          remote
                          fetchInfo={{ dataTotalSize: project_list.count ? project_list.count : 0 }}
                          className="product-table"
                          trClassName="cursor-pointer"
                          csvFileName="project.csv"
                          ref={(node) => {
                            this.table = node
                          }}
                        >
                          <TableHeaderColumn
                            dataField="projectName"
                            dataSort
                          >
                            Project Name
                          </TableHeaderColumn>
                          <TableHeaderColumn
                            dataField="expenseBudget"
                            dataSort
                          >
                            Expense Budget
                          </TableHeaderColumn>
                          <TableHeaderColumn
                            dataField="revenueBudget"
                            dataSort
                          >
                            Revenue Budget
                          </TableHeaderColumn>
                          {/* <TableHeaderColumn
                            dataField="vatRegistrationNumber"
                            dataSort
                          >
                            Tax Registration Number
                          </TableHeaderColumn> */}
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

export default connect(mapStateToProps, mapDispatchToProps)(Project)
