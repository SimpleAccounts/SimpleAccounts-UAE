import React from 'react'
import {connect} from 'react-redux'
// import { bindActionCreators } from 'redux'
import {
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Label,
  Form,
} from "reactstrap"

import Select from 'react-select'
import { DateRangePicker2 } from 'components'
import moment from 'moment'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'

import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css"
import "react-toastify/dist/ReactToastify.css"
// import 'react-select/dist/react-select.css'
 import './style.scss'

const mapStateToProps = (state) => {
  return ({
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
  })
}

const vatOptions = [
  { value: 'input', label: 'Input'},
  { value: 'output', label: 'Output'},
  { value: 'all', label: 'All'},
]

const statusOptions = [
  { value: 'paid', label: 'Paid'},
  { value: 'generated', label: 'Generated'},
  { value: 'cancalled', label: 'Cancelled'},
]

const tempdata = [{
  transactionDate: '10/15/2019',
  transactionCategoryId: 2,
  transactionCategoryCode: 2,
  transactionCategoryName: 'temp',
  transactionCategoryDescription: 'temp',
  parentTransactionCategory: 'Loream Ipsume',
  transactionType: 'TEMP'
}, {
  transactionDate: '10/15/2019',
  transactionCategoryId: 1,
  transactionCategoryCode: 4,
  transactionCategoryName: 'temp',
  transactionCategoryDescription: 'temp',
  parentTransactionCategory: 'Loream Ipsume',
  transactionType: 'TEMP'
}, {
  transactionDate: '10/15/2019',
  transactionCategoryId: 1,
  transactionCategoryCode: 4,
  transactionCategoryName: 'temp',
  transactionCategoryDescription: 'temp',
  parentTransactionCategory: 'Loream Ipsume',
  transactionType: 'TEMP'
}, {
  transactionDate: '10/15/2019',
  transactionCategoryId: 1,
  transactionCategoryCode: 4,
  transactionCategoryName: 'temp',
  transactionCategoryDescription: 'temp',
  parentTransactionCategory: 'Loream Ipsume',
  transactionType: 'TEMP'
}, {
  transactionDate: '10/15/2019',
  transactionCategoryId: 1,
  transactionCategoryCode: 4,
  transactionCategoryName: 'temp',
  transactionCategoryDescription: 'temp',
  parentTransactionCategory: 'Loream Ipsume',
  transactionType: 'TEMP'
},{
  transactionDate: '10/15/2019',
  transactionCategoryId: 1,
  transactionCategoryCode: 4,
  transactionCategoryName: 'temp',
  transactionCategoryDescription: 'temp',
  parentTransactionCategory: 'Loream Ipsume',
  transactionType: 'TEMP'
},{
  transactionDate: '10/15/2019',
  transactionCategoryId: 1,
  transactionCategoryCode: 4,
  transactionCategoryName: 'temp',
  transactionCategoryDescription: 'temp',
  parentTransactionCategory: 'Loream Ipsume',
  transactionType: 'TEMP'
}]

const ranges =  {
  'Last 7 Days': [moment().subtract(6, 'days'), moment()],
  'Last 30 Days': [moment().subtract(29, 'days'), moment()],
  'This Week': [moment().startOf('week'), moment().endOf('week')],
  'This Month': [moment().startOf('month'), moment().endOf('month')],
  'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
}

class TaxReport extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedVat: '',
      selectedStatus: ''
    }
  }


  changeVat = (selectedVat) => {
    this.setState({ selectedVat })
  }

  changeStatus = (selectedStatus) => {
    this.setState({ selectedStatus })
  }

  getAction = (cell, row) => {
    return(<button>Detbuttonil</button>)
  }

  render() {
    return (
      loading ==true? <Loader/> :
<div>
      <div className="tax-report-screen">
        <div className="animated fadeIn">
          <Card>
            <CardHeader>
              <div className="d-flex flex-wrap align-items-start justify-content-between">
                <div>
                  <div className="h4 card-title d-flex align-items-center">
                    <i className="fas fa-exchange-alt" />
                    <span className="ml-2">VAT Transactions</span>
                  </div>
                  <p className="pl-4"><i className="pl-2">Last updated at 28 October 2019</i></p>
                </div>
                <div className="filter-box p-2">
                  <Form onSubmit={this.handleSubmit} name="simpleForm">
                    <div className="flex-wrap d-flex">
                      <FormGroup>
                        <Label htmlFor="name">VAT:</Label>
                        <div className="account-type">
                          <Select
                            options={vatOptions}
                            value={this.state.selectedVat}
                            onChange={this.changeVat}
                          />
                        </div>
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="name">Period:</Label>
                        <div className="date-range">
                          <DateRangePicker2
                            ranges={ranges}
                            opens={'left'}
                          />
                        </div>
                      </FormGroup>
                    </div>
                  </Form>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="table-wrapper">
                <BootstrapTable 
                    data={tempdata} 
                    exportCSV
                    hover
                    pagination
                    filter = {true}
                  >
                    <TableHeaderColumn isKey dataField="transactionDate" filter={{ type: 'TextFilter'}}>
                      Party Name
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField="transactionCategoryDescription" filter={{ type: 'TextFilter'}}>
                      Source
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField="transactionType" filter={{ type: 'TextFilter'}}>
                      Document
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField="parentTransactionCategory" filter={{ type: 'TextFilter'}}>
                      Amount
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField="transactionType" filter={{ type: 'TextFilter'}}>
                      VAT Code
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField="transactionType" filter={{ type: 'TextFilter'}}>
                      VAT Amount
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField="transactionType" filter={{ type: 'TextFilter'}}>
                      Status
                    </TableHeaderColumn>
                  </BootstrapTable>
              </div>
              
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <div className="d-flex flex-wrap align-items-start justify-content-between">
                <div>
                  <div className="h4 card-title d-flex align-items-center">
                    <i className="icon-briefcase" />
                    <span className="ml-2">VAT Report</span>
                  </div>
                  <p className="pl-4"><i className="pl-2">Last updated at 28 October 2019</i></p>
                </div>
                <div className="filter-box p-2">
                  <Form onSubmit={this.handleSubmit} name="simpleForm">
                    <div className="flex-wrap d-flex">
                      <FormGroup>
                        <Label htmlFor="name">Status:</Label>
                        <div className="account-type">
                          <Select
                            options={statusOptions}
                            value={this.state.selectedStatus}
                            onChange={this.changeStatus}
                          />
                        </div>
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="name">Period:</Label>
                        <div className="date-range">
                          <DateRangePicker2
                            ranges={ranges}
                            opens={'left'}
                          />
                        </div>
                      </FormGroup>
                    </div>
                  </Form>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="table-wrapper">
                <BootstrapTable 
                    data={tempdata} 
                    exportCSV
                    hover
                    pagination
                    filter = {true}
                  >
                    <TableHeaderColumn isKey dataField="transactionDate" filter={{ type: 'TextFilter'}}>
                      Report No.
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField="transactionCategoryDescription" filter={{ type: 'TextFilter'}}>
                      Status
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField="transactionType" filter={{ type: 'TextFilter'}}>
                      Status Date
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField="parentTransactionCategory" filter={{ type: 'TextFilter'}}>
                      TRN
                    </TableHeaderColumn>
                    <TableHeaderColumn dataFormat={this.getAction} >
                      Action
                    </TableHeaderColumn>
                  </BootstrapTable>
              </div>
              
            </CardBody>
          </Card>
        </div>
      </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TaxReport)
