import React from 'react'
import {connect} from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Form,
  FormGroup,
  Label,
  Row,
  Col
} from 'reactstrap'
import { toast } from 'react-toastify'
import Select from 'react-select'
import Autosuggest from 'react-autosuggest'
import _ from 'lodash'
import { Loader } from 'components'

import 'react-toastify/dist/ReactToastify.css'
import './style.scss'

import * as TransactionActions from './actions'

const mapStateToProps = (state) => {
  return ({
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    transactionActions: bindActionCreators(TransactionActions, dispatch)
  })
}

class CreateTransactionCategory extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      value: '',
      suggestions: [],
      parentValue: '',
      parentSuggestions: [],
      transactionCategoryList: [],
      parentCategoryCodeList: [],
      vatCategoryList: [],
      transactionData: {
        defaltFlag: 'N',
        transactionTypeName: ''
      },
      loading: false
    }
  }

  componentDidMount = () => {
    this.getTransactionTypes()
    this.getTransactionVatCategories()
  }


  // --------------------------------------
  // Transaction Type Suggestion Callbacks
  //---------------------------------------

  getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase()
    const inputLength = inputValue.length

    return inputLength === 0
      ? []
      : this.state.transactionCategoryList.filter(
        (transaction) =>
          transaction.transactionTypeName
            .toLowerCase()
            .slice(0, inputLength) === inputValue
      )
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    })
  }

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    })
  }

  // Get Transaction Type on  Suggestion Field
  getSuggestionValue = (suggestion) => {
    return(suggestion.transactionTypeName)
  }

  // Use your imagination to render suggestions.
  renderSuggestion = (suggestion) => {
    return(<div>{suggestion.transactionTypeName}</div>)
  }

  // Change the Transaction Type
  onChangeTransactionType = (event, { newValue }) => {
    this.setState({
      value: newValue
    })
  }

  getParentCategoryCodeListData = (val) => {
    const code = this.state.selectedTransactionCategory.transactionTypeCode
    this.props.transactionActions.getParentCategoryCodeListData(code, val).then((res) => {
      if (res.status === 200) {
        this.setState({ 
          loading: false,
          parentCategoryCodeList: res.data
        })
      }
    })
  }


  // ----------------------------------------------
  // Parent Transaction Type Suggestion Callbacks
  //-----------------------------------------------

  getParentSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase()
    const inputLength = inputValue.length
    this.getParentCategoryCodeListData(inputValue)
    return inputLength === 0
      ? []
      : this.state.parentCategoryCodeList.filter(
        (transaction) =>
          transaction.transactionCategoryName
            .toLowerCase()
            .slice(0, inputLength) === inputValue
      )
  }

  getParentSuggestionValue = (suggestion) => {
    return(suggestion.transactionCategoryName)
  }

  renderParentSuggestion = (suggestion) => {
    return(<div>{suggestion.transactionCategoryName}</div>)
  }

  onParentChange = (event, { newValue }) => {
    this.setState({
      parentValue: newValue
    })
  }

  onParentSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      parentSuggestions: this.getParentSuggestions(value)
    })
  }

  onParentSuggestionsClearRequested = () => {
    this.setState({
      parentSuggestions: []
    })
  }

  // Get All Transaction Types
  getTransactionTypes = () => {
    this.setState({ loading: true })
    this.props.transactionActions.getTransactionTypes().then((res) => {
      if (res.status === 200) {
        this.setState({ 
          loading: false,
          transactionCategoryList: res.data
        })
      }
    })
  }

  // Get All Transaction VAT Categories
  getTransactionVatCategories = () => {
    this.setState({ loading: true })
    this.props.transactionActions.getTransactionVatCategories().then((res) => {
      if (res.status === 200) {
        this.setState({ 
          loading: false,
          vatCategoryList: res.data
        })
      }
    })
  }


  // Show Success Message
  success = () => {
    return toast.success('Transaction Category Updated successfully... ', {
      position: toast.POSITION.TOP_RIGHT
    })
  }

  // Set State by detecting the change Event on input fields
  handleChange = (e, name) => {
    this.setState({
      transactionData: _.set(
        { ...this.state.transactionData },
        e.target.name && e.target.name !== '' ? e.target.name : name,
        e.target.type === 'checkbox' ? e.target.checked : e.target.value
      )
    })
  }

  // Create or Update Transaction
  handleSubmit = (e, status) => {
    e.preventDefault()
    
    const {
      categoryName,
      categoryCode,
      categoryDiscription,
      selectVatCategoryCode,
      defaltFlag
    } = this.state.transactionData

    const { selectedParentCategory } = this.state

    let postObj = {
      transactionCategoryId: '0',
      transactionCategoryName: categoryName,
      transactionCategoryCode: categoryCode,
      defaltFlag,
      parentTransactionCategory: selectedParentCategory?selectedParentCategory.transactionCategoryId:'',
      transactionCategoryDescription: categoryDiscription,
      vatCategory: selectVatCategoryCode,
      transactionType: this.state.selectedTransactionCategory
        ? this.state.selectedTransactionCategory.transactionTypeCode
        : ''
    }

    this.props.transactionActions.createAndUpdateTransaction(postObj).then((res) => {
      if (res.status === 200) {
        this.success()
        if (status === 'addMore') {
          this.setState({ transaction: {} })
          this.props.history.push('/admin/settings/transaction-category/create')
        } else {
          this.props.history.push('/admin/settings/transaction-category')
        }
      }
    })
  }

  onSuggestionSelected = (e, val) => {
    this.setState({ selectedTransactionCategory: val.suggestion })
  }

  onParentSuggestionSelected = (e, val) => {
    this.setState({ selectedParentCategory: val.suggestion })
  }


  render() {
    const { loading, selectedTransactionCategory, transactionData } = this.state
    const {
      transactionTypeName,
      categoryName,
      categoryCode,
      defaltFlag,
      categoryDiscription,
      parentTransactionCategory,
    } = transactionData

    const { value, suggestions, parentValue, parentSuggestions } = this.state

    const inputProps = {
      placeholder: 'Type Transaction CategoryType',
      value: transactionTypeName ? transactionTypeName : value,
      onChange: this.onChangeTransactionType
    }
    const parentInputProps = {
      placeholder: 'Type Prent Category Code',
      value: parentTransactionCategory ? parentTransactionCategory : parentValue,
      onChange: this.onChangeParentType
    }

    return (
      <div className="create-transaction-category-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="nav-icon icon-graph" />
                    <span className="ml-2">Create Transaction Category</span>
                  </div>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={6}>
                      <Form onSubmit={this.handleSubmit} name="simpleForm">
                        <FormGroup>
                          <Label htmlFor="categoryName">Category Name</Label>
                          <Input
                            type="text"
                            id="categoryName"
                            name="categoryName"
                            placeholder="Enter Category Name"
                            defaultValue={categoryName}
                            onChange={this.handleChange}
                            required
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="categoryCode">Category Code</Label>
                          <Input
                            type="text"
                            id="categoryCode"
                            name="categoryCode"
                            placeholder="Enter Category Code"
                            defaultValue={categoryCode}
                            onChange={this.handleChange}
                            required
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="categoryDiscription">
                            Category Description
                          </Label>
                          <Input
                            type="textarea"
                            id="categoryDiscription"
                            name="categoryDiscription"
                            defaultValue={categoryDiscription}
                            placeholder="Enter  Category Description"
                            onChange={this.handleChange}
                            required
                            rows="5"
                          />
                        </FormGroup>
                        <hr />
                        <FormGroup>
                          <div className="d-flex">
                            <Label>Default Flag</Label>
                            <Col xs="1"></Col>
                            <div>
                              <FormGroup check inline>
                                <div className="custom-radio custom-control">
                                  <input 
                                    className="custom-control-input"
                                    type="radio"
                                    id="inline-radio1"
                                    name="defaltFlag"
                                    value="Y"
                                    checked={defaltFlag === "Y"}
                                    onChange={this.handleChange} />
                                  <label className="custom-control-label" htmlFor="inline-radio1">Yes</label>
                                </div>
                              </FormGroup>
                              <FormGroup check inline>
                                <div className="custom-radio custom-control">
                                  <input 
                                    className="custom-control-input"
                                    type="radio"
                                    id="inline-radio2"
                                    name="defaltFlag"
                                    value="N"
                                    checked={defaltFlag === "N"}
                                    onChange={this.handleChange}/>
                                  <label className="custom-control-label" htmlFor="inline-radio2">No</label>
                                </div>
                              </FormGroup>
                            </div>
                          </div>
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="selectCategoryCode">
                          VAT Code
                          </Label>
                          <Select
                            id="selectCategoryCode"
                            name="selectCategoryCode"
                            options={null}
                          />
                        </FormGroup>
                          
                        <FormGroup className="auto-suggestion-form-group">
                          <Label htmlFor="selectTransactionType">
                            Transaction Type
                          </Label>
                          <Autosuggest
                            className="autoSuggest form-control"
                            suggestions={suggestions}
                            onSuggestionsFetchRequested={
                              this.onSuggestionsFetchRequested
                            }
                            onSuggestionsClearRequested={
                              this.onSuggestionsClearRequested
                            }
                            getSuggestionValue={this.getSuggestionValue}
                            onSuggestionSelected={this.onSuggestionSelected}
                            renderSuggestion={this.renderSuggestion}
                            inputProps={inputProps}
                          />
                        </FormGroup>
                          
                        {selectedTransactionCategory ? ( 
                          <FormGroup className="auto-suggestion-form-group">
                            <Label htmlFor="selectTransactionType">
                              Parent Transaction Type
                            </Label>
                            <Autosuggest
                              className="autoSuggest form-control"
                              suggestions={parentSuggestions}
                              onSuggestionsFetchRequested={
                                this.onParentSuggestionsFetchRequested
                              }
                              onSuggestionsClearRequested={
                                this.onParentSuggestionsClearRequested
                              }
                              getSuggestionValue={this.getParentSuggestionValue}
                              onSuggestionSelected={this.onParentSuggestionSelected}
                              renderSuggestion={this.renderParentSuggestion}
                              inputProps={parentInputProps}
                            />
                          </FormGroup> 
                        ) : (
                            ""
                          )}
                        <FormGroup className="text-right mt-5">
                          <Button type="submit" color="primary" className="btn-square mr-3">
                            <i className="fa fa-dot-circle-o"></i> Create
                          </Button>
                          <Button type="submit" color="primary" className="btn-square mr-3">
                            <i className="fa fa-refresh"></i> Create and More
                          </Button>
                          <Button type="submit" color="secondary" className="btn-square" 
                            onClick={() => {this.props.history.push("/admin/settings/transaction-category")}}>
                            <i className="fa fa-ban"></i> Cancel
                          </Button>
                        </FormGroup>
                      </Form>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
          {loading ? (
            <Loader></Loader>
          ) : (
              ""
            )}
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateTransactionCategory)
