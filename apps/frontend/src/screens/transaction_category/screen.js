import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Input,
  ButtonGroup,
  Col,

} from 'reactstrap'
import { ToastContainer, toast } from 'react-toastify'
import { BootstrapTable, TableHeaderColumn, SearchField } from 'react-bootstrap-table'

import { Loader } from 'components'

import 'react-toastify/dist/ReactToastify.css'
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css'
import 'react-images-uploader/styles.css'
import 'react-images-uploader/font.css'
import './style.scss'

import * as TransactionActions from './actions'


// const industryOptions = [
//   { value: 'input', label: 'Input' },
//   { value: 'output', label: 'Output' },
//   { value: 'all', label: 'All' },
// ]


const mapStateToProps = (state) => {
  return ({
    transaction_list: state.transaction.transaction_list
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    transactionActions: bindActionCreators(TransactionActions, dispatch)
  })
}

class TransactionCategory extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      transactionCategoryList: [],
      openDeleteModal: false,
      loading: true,
    }

    this.options = {
      onRowClick: this.goToDetail,
      paginationPosition: 'top'
    }

    this.selectRowProp = {
      mode: 'checkbox',
      bgColor: 'rgba(0,0,0, 0.05)',
      onSelect: this.onRowSelect,
      onSelectAll: this.onSelectAll
    }

  }

  // Table Custom Search Field
  customSearchField = (props) => {
    return (
      <SearchField
        defaultValue=''
        placeholder='Search ...' />
    )
  }

  // Table Custom Pagination Label
  customTotal = (from, to, size) => {
    return (
      <span className="react-bootstrap-table-pagination-total">
        Showing {from} to {to} of {size} Results
      </span >
    )
  }

  // -------------------------
  // Data Table Custom Fields
  //--------------------------

  getTransactionType = (cell, row) => {
    return (row.transactionType.transactionTypeName)
  }

  getparentTransactionCategory = (cell, row) => {
    return (row.parentTransactionCategory.transactionCategoryDescription)
  }

  goToDetail = (row) => {
    this.props.history.push('/admin/settings/transaction-category/detail')
  }

  // Show Success Toast
  success = () => {
    return toast.success('Transaction Category Deleted Successfully...', {
      position: toast.POSITION.TOP_RIGHT
    })
  }


  componentDidMount = () => {
    this.getTransactionListData()
  }

  // Get All Transaction Categories
  getTransactionListData = () => {
    this.setState({ loading: true })
    this.props.transactionActions.getTransactionList().then((res) => {
      if (res.status === 200) {
        this.setState({ loading: false })
      }
    })
  }

  // Delete Transaction By ID
  deleteTransaction = () => {
    this.setState({ loading: true })
    this.setState({ openDeleteModal: false })
    this.props.transactionActions.deleteTransaction(this.state.selectedData.id).then((res) => {
      if (res.status === 200) {
        this.setState({ loading: false })
        this.getTransactionListData()
      }
    })
  }

  closeModal = () => {
    this.setState({ openDeleteModal: false })
  }

  render() {
    const { loading } = this.state;
    const transactionList = this.props.transaction_list
    const containerStyle = {
      zIndex: 1999,closeOnClick: true,
      draggable: true
    };

    return (
      loading ==true? <Loader/> :
<div>
      <div className="transaction-category-screen">
        <div className="animated fadeIn">
          <ToastContainer
            position="top-right"
            autoClose={1700}
            style={containerStyle}
            closeOnClick
            draggable
          />
          <Card>
            <CardHeader>
              <div className="h4 mb-0 d-flex align-items-center">
                <i className="nav-icon icon-graph" />
                <span className="ml-2">Transaction Category</span>
              </div>
            </CardHeader>
            <CardBody>
              {
                loading ?
                  <Loader></Loader> :
                  <Row>
                    <Col lg={12}>
                      <div className="d-flex justify-content-end">
                        <ButtonGroup className="toolbar" size="sm">
                          <Button
                            color="success"
                            className="btn-square"
                          >
                            <i className="fa glyphicon glyphicon-export fa-download mr-1" />
                            Export to CSV
                          </Button>
                          <Button
                            color="primary"
                            className="btn-square"
                            onClick={() => this.props.history.push(`/admin/settings/transaction-category/create`)}
                          >
                            <i className="fas fa-plus mr-1" />
                            New Category
                          </Button>
                          <Button
                            color="warning"
                            className="btn-square"
                          >
                            <i className="fa glyphicon glyphicon-trash fa-trash mr-1" />
                            Bulk Delete
                          </Button>
                        </ButtonGroup>
                      </div>
                      <div className="py-3">
                        <h5>Filter : </h5>
                        <Row>
                          <Col lg={2} className="mb-1">
                            <Input type="text" placeholder="Category Code" />
                          </Col>
                          <Col lg={2} className="mb-1">
                            <Input type="text" placeholder="Category Name" />
                          </Col>
                          <Col lg={2} className="mb-1">
                            <Input type="text" placeholder="Category Description" />
                          </Col>
                          <Col lg={2} className="mb-1">
                            <Input type="text" placeholder="Paret Transaction Category Name " />
                          </Col>
                          <Col lg={2} className="mb-1">
                            <Input type="text" placeholder="Transaction Type" />
                          </Col>
                        </Row>
                      </div>
                      <BootstrapTable
                        data={transactionList}
                        hover
                        pagination
                        version="4"
                        search={false}
                        selectRow={this.selectRowProp}
                        options={this.options}
                        trClassName="cursor-pointer"
                      >
                        <TableHeaderColumn
                          isKey
                          dataField="transactionCategoryCode"
                          dataSort
                        >
                          Category Code
                          </TableHeaderColumn>
                        <TableHeaderColumn
                          dataField="transactionCategoryName"
                          dataSort
                        >
                          Category Name
                          </TableHeaderColumn>
                        <TableHeaderColumn
                          dataField="transactionCategoryDescription"
                          dataSort
                        >
                          Category Description
                          </TableHeaderColumn>
                        <TableHeaderColumn
                          dataFormat={this.getparentTransactionCategory}
                          dataSort
                        >
                          Parent Transaction Category Name
                          </TableHeaderColumn>
                        <TableHeaderColumn
                          dataFormat={this.getTransactionType}
                          dataSort
                        >
                          Transaction Type
                          </TableHeaderColumn>

                      </BootstrapTable>
                    </Col>
                  </Row>
              }
            </CardBody>
          </Card>


          <Modal isOpen={this.state.openDeleteModal}
            className={"modal-danger " + this.props.className}
          >
            <ModalHeader toggle={this.toggleDanger}>Delete</ModalHeader>
            <ModalBody>Are you sure want to delete this record?</ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={this.deleteTransaction}>Yes</Button>&nbsp;
              <Button color="secondary" onClick={this.closeModal}>No</Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionCategory)
