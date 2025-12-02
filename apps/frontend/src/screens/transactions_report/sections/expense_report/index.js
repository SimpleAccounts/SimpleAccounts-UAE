import React from 'react'
import {connect} from 'react-redux'
import {
  Button,
  Row,
  Col,
  FormGroup,
  ButtonGroup,
  Form,
  Input
} from "reactstrap"

import { DateRangePicker2 } from 'components'
import moment from 'moment'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import DateRangePicker from 'react-bootstrap-daterangepicker'

import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css"
import "react-toastify/dist/ReactToastify.css"
// import 'react-select/dist/react-select.css'
 import 'bootstrap-daterangepicker/daterangepicker.css'
import './style.scss'

const mapStateToProps = (state) => {
  return ({
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
  })
}

const tempdata = [{
  transactionCategoryId: 2,
  transactionCategoryCode: 2,
  transactionCategoryName: 'temp',
  transactionCategoryDescription: 'temp',
  parentTransactionCategory: 'Loream Ipsume',
  transactionType: 'TEMP'
}, {
  transactionCategoryId: 1,
  transactionCategoryCode: 4,
  transactionCategoryName: 'temp',
  transactionCategoryDescription: 'temp',
  parentTransactionCategory: 'Loream Ipsume',
  transactionType: 'TEMP'
}, {
  transactionCategoryId: 1,
  transactionCategoryCode: 4,
  transactionCategoryName: 'temp',
  transactionCategoryDescription: 'temp',
  parentTransactionCategory: 'Loream Ipsume',
  transactionType: 'TEMP'
}, {
  transactionCategoryId: 1,
  transactionCategoryCode: 4,
  transactionCategoryName: 'temp',
  transactionCategoryDescription: 'temp',
  parentTransactionCategory: 'Loream Ipsume',
  transactionType: 'TEMP'
}, {
  transactionCategoryId: 1,
  transactionCategoryCode: 4,
  transactionCategoryName: 'temp',
  transactionCategoryDescription: 'temp',
  parentTransactionCategory: 'Loream Ipsume',
  transactionType: 'TEMP'
},{
  transactionCategoryId: 1,
  transactionCategoryCode: 4,
  transactionCategoryName: 'temp',
  transactionCategoryDescription: 'temp',
  parentTransactionCategory: 'Loream Ipsume',
  transactionType: 'TEMP'
},{
  transactionCategoryId: 1,
  transactionCategoryCode: 4,
  transactionCategoryName: 'temp',
  transactionCategoryDescription: 'temp',
  parentTransactionCategory: 'Loream Ipsume',
  transactionType: 'TEMP'
}]

const ranges =  {
  'This Week': [moment().startOf('week'), moment().endOf('week')],
  'This Month': [moment().startOf('month'), moment().endOf('month')],
  'Last 7 Days': [moment().subtract(6, 'days'), moment()],
  'Last 30 Days': [moment().subtract(29, 'days'), moment()],
  'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
}

class ExpenseReport extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedOption: '',
    }
  }


  handleChange = (selectedOption) => {
    this.setState({ selectedOption })
  }

  render() {
    return (
      <div className="expense-report-section">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12}>
              <div className="flex-wrap d-flex align-items-start justify-content-between">
                <div className="info-block">
                  <h4>Company Name - <small><i>Expenses</i></small></h4>
                </div>
                <Form onSubmit={this.handleSubmit} name="simpleForm">
                  <div className="flex-wrap d-flex align-items-center">
                    <FormGroup>
                      <ButtonGroup className="mr-3">
                        <Button
                          color="success"
                          className="btn-square"
                          onClick={() => this.table.handleExportCSV()}
                        >
                          <i className="fa glyphicon glyphicon-export fa-download mr-1" />
                          Export to CSV
                        </Button>
                      </ButtonGroup>
                    </FormGroup>
                    <FormGroup>
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
              <div className="py-3">
                <h5>Filter : </h5>
                <Row>
                  <Col lg={2} className="mb-1">
                    <Input type="text" placeholder="Receipt Number" />
                  </Col>
                  <Col lg={2} className="mb-1">
                    <DateRangePicker>
                      <Input type="text" placeholder="Expense Date" />
                    </DateRangePicker>
                  </Col>
                  <Col lg={2} className="mb-1">
                    <Button
                        color="secondary"
                        className="btn-square"
                        type="submit"
                        name="submit"
                        onClick = {this.getSelectedData}
                    >
                      <i className="fa glyphicon glyphicon-export fa-search mr-1" />
                      Search
                    </Button>
                  </Col>
                </Row>
              </div>
                <div className="table-wrapper">
                <BootstrapTable 
                  data={tempdata} 
                  hover
                  pagination={tempdata && tempdata.length > 0 ? true : false}
                  fetchInfo={{ dataTotalSize: tempdata.count ? tempdata.count : 0 }}
                  csvFileName="tempdata.csv"
                  ref={(node) => {
                    this.table = node
                  }}
                  filter = {true}
                  responsive={true}
                  version="4"
                >
                  <TableHeaderColumn
                    isKey
                    dataField="transactionCategoryCode"
                    dataSort
                  >
                    Receipt Number
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="transactionCategoryName"
                    dataSort
                  >
                    Expense Date
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="transactionCategoryDescription"
                    dataSort
                  >
                    Description
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="parentTransactionCategory"
                    dataSort
                  >
                    Amount
                  </TableHeaderColumn>
                </BootstrapTable>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpenseReport)
