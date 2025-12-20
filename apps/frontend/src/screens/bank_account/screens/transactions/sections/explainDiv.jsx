import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, FormGroup, Row, Col, Label, Alert } from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { selectOptionsFactory } from 'utils';
import * as TransactionsActions from '../actions';
import { CommonActions } from 'services/global';
import './style.scss';
import { Loader } from 'components';
import dayjs from '@/utils/date';

const mapDispatchToProps = dispatch => {
  return {
    transactionsActions: bindActionCreators(TransactionsActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const ExplainDiv = props => {
  const {
    openExplainTransactionModal,
    selectedData,
    transactionsActions,
    commonActions,
    closeExplainTransactionModal,
  } = props;

  const [loading, setLoading] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [explainList, setExplainList] = useState([
    {
      id: 0,
      chartOfAccountCategoryId: '',
      transactionCategoryId: '',
      reconcileRrefId: '',
      categoryLabel: '',
    },
  ]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [transactionId, setTransactionId] = useState('');
  const [chartOfAccountCategoryList, setChartOfAccountCategoryList] = useState([]);
  const [transactionCategoryList, setTransactionCategoryList] = useState([]);
  const [categoryList, setCategoryList] = useState({});
  const [submitBtnClick, setSubmitBtnClick] = useState(false);
  const [showChartOfAccount, setShowChartOfAccount] = useState(false);
  const [transactionCategoryTypeList, setTransactionCategoryTypeList] = useState([]);
  const [moreDetails, setMoreDetails] = useState(false);
  const [selectedTransactionCategoryType, setSelectedTransactionCategoryType] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [startDate, setStartDate] = useState(new Date());

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedData) {
      let amount = selectedData.withdrawalAmount
        ? +selectedData.withdrawalAmount
        : +selectedData.depositeAmount;
      setTransactionId(selectedData.id);
      setCurrentBalance(amount);
      setTransactionAmount(amount);
      getChartOfAccountCategoryList(selectedData.debitCreditFlag);
    }
  }, [selectedData]);

  const getChartOfAccountCategoryList = type => {
    transactionsActions.getChartOfCategoryList(type).then(res => {
      if (res.status === 200) {
        setChartOfAccountCategoryList(res.data);
      }
    });
  };

  const getTransactionCategoryList = type => {
    transactionsActions.getTransactionCategoryListForExplain(type).then(res => {
      if (res.status === 200) {
        setTransactionCategoryList(res.data);
      }
    });
  };

  const getCategoryList = (label, value) => {
    let data = Object.assign({}, categoryList);
    let keys = Object.keys(data);
    if (!keys.includes(label)) {
      transactionsActions.getCategoryListForReconcile(value).then(res => {
        if (res.status === 200) {
          res.data.map(x => {
            x['name'] = x.label;
            x['label'] = `${x['label']} (${x['amount']} ${x['currencySymbol']})`;
            x['isDisabled'] = x['amount'] <= currentBalance ? false : true;
            return x;
          });
          data[`${label}`] = res.data;
          setCategoryList(data);
        }
      });
    }
  };

  const checkedRow = () => {
    if (explainList.length > 0) {
      let length = explainList.length - 1;
      let temp = Object.values(explainList[length]).indexOf('');
      return temp > -1;
    }
    return false;
  };

  const handleChange = (val, name, row) => {
    let data = [...explainList];
    data.map((item, index) => {
      if (item.id === row.id) {
        data[`${index}`][`${name}`] = val;
      }
      return item;
    });
    setExplainList(data);
    calculateCurrentBalance(data);
  };

  const checkCategory = (value, label) => {
    const temp = explainList.filter(item => item[`${label}`].value === value);
    return temp.length === 0;
  };

  const calculateCurrentBalance = (list = explainList) => {
    let temp;
    let amount = 0;
    list.map(obj => {
      for (let item in categoryList) {
        if (categoryList.hasOwnProperty(item)) {
          let tempAmount;
          if (item === obj['categoryLabel']) {
            temp = categoryList[`${obj['categoryLabel']}`].filter(
              item => item.id === obj.reconcileRrefId.value
            );
            tempAmount = temp.length ? temp[0]['amount'] : 0;
            amount = amount + tempAmount;
          }
        }
      }
      return obj;
    });
    const newBalance = transactionAmount - amount;
    setCurrentBalance(newBalance);
    checkChartOfAccountWithBalance(newBalance);
  };

  const checkChartOfAccountWithBalance = balance => {
    if (transactionAmount > balance && balance !== 0 && submitBtnClick) {
      setShowChartOfAccount(true);
      if (transactionCategoryTypeList.length === 0) {
        transactionsActions.getTransactionCategoryList().then(res => {
          if (res.status === 200) {
            setTransactionCategoryTypeList(res.data.data);
          }
        });
      }
      return true;
    } else {
      setShowChartOfAccount(false);
      setSelectedTransactionCategoryType('');
      return false;
    }
  };

  const checkChartOfAccount = () => {
    return checkChartOfAccountWithBalance(currentBalance);
  };

  const handleSubmit = () => {
    const postData = {
      transactionCategory: selectedTransactionCategoryType.value,
    };
    setSubmitBtnClick(true);
    if (checkChartOfAccount()) {
      if (postData.transactionCategory && !checkedRow()) {
        setShowAlert(false);
      } else {
        setShowAlert(true);
      }
    } else {
      if (!checkedRow()) {
        // submitExplain(postData);
      }
    }
  };

  const submitExplain = postData => {
    let data = [...explainList];
    data = JSON.parse(JSON.stringify(data));
    const temp = data.map(item => {
      item['chartOfAccountCategoryId'] = item['chartOfAccountCategoryId'].value;
      item['transactionCategoryId'] = item['transactionCategoryId'].value;
      item['reconcileRrefId'] = item['reconcileRrefId'].value;
      delete item['id'];
      delete item['categoryLabel'];
      return item;
    });
    let obj = {
      ...{ explainData: temp },
      transactionId,
      ...{ remainingBalance: currentBalance },
    };
    if (postData.transactionCategory) {
      obj = { ...obj, ...postData };
    }
    transactionsActions.reconcileTransaction(obj).then(res => {
      if (res.status === 200) {
        closeExplainTransactionModal();
      }
    });
  };

  const calculateTotalAmount = option => {
    if (option) {
      const amount = option.reduce((total, invoice) => total + invoice.amount, 0);
      setTotalAmount(amount);
    } else {
      setTotalAmount(0);
    }
  };

  if (selectedData !== '') {
    return (
      <div className="explain-modal-screen">
        <div isOpen={openExplainTransactionModal} className="modal-primary">
          <div toggle={() => {}} className="mb-2">
            <div className="header text">
              <h2>Explain AED {`${selectedData.withdrawalAmount}`}</h2>
            </div>
          </div>
          <div>
            <div className="content-details">
              {(checkedRow() && submitBtnClick) || showAlert ? (
                <Alert color="danger">Please Select all the remaining fields.</Alert>
              ) : null}
              <form>
                <div className="details-container">
                  {explainList &&
                    explainList.map((item, index) => (
                      <div className="detail-row" key={item.id}>
                        <div className="sub-container row ml-0 mr-0" style={{ width: '100%' }}>
                          <div className="col-md-6">
                            <div className="form-group row align-items-center">
                              <Label htmlFor="staticEmail" className="col-sm-3  label">
                                Type
                              </Label>
                              <div className="col-sm-9">
                                <Select
                                  id="transaction_select"
                                  options={chartOfAccountCategoryList || []}
                                  onChange={option => {
                                    handleChange(option, 'chartOfAccountCategoryId', item);
                                    handleChange(selectedData.id, 'id', item);
                                    getTransactionCategoryList(option.value);
                                  }}
                                  placeholder="Select"
                                  value={item.chartOfAccountCategoryId}
                                />
                              </div>
                            </div>
                          </div>
                          {explainList[`${index}`].chartOfAccountCategoryId.label ===
                            'Expenses' && (
                            <div className="col-md-6">
                              <div className="form-group row align-items-center ">
                                <Label className="label col-sm-3">VAT Included</Label>
                                <div className="col-sm-9">
                                  <Select
                                    id="transaction_category_select"
                                    options={
                                      transactionCategoryList.dataList
                                        ? transactionCategoryList.dataList[0].options
                                        : []
                                    }
                                    onChange={option => {
                                      handleChange(option, 'transactionCategoryListVat ', item);
                                    }}
                                    placeholder="Select"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          {explainList[`${index}`].chartOfAccountCategoryId.label === 'Sales' && (
                            <>
                              <div className="col-md-6">
                                <div className="form-group row align-items-center ">
                                  <Label className="label col-sm-3">Customer</Label>
                                  <div className="col-sm-9">
                                    <Select
                                      id="transaction_category_select"
                                      options={
                                        transactionCategoryList.dataList
                                          ? transactionCategoryList.dataList[0].options
                                          : []
                                      }
                                      placeholder="Select"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="form-group row align-items-center ">
                                  <Label className="label col-sm-3">Invoice</Label>
                                  <div className="col-sm-9">
                                    <Select
                                      isMulti
                                      id="transaction_category_select"
                                      options={
                                        transactionCategoryList.dataList
                                          ? transactionCategoryList.dataList[1].options
                                          : []
                                      }
                                      onChange={option => {
                                        calculateTotalAmount(option);
                                      }}
                                      placeholder="Select"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="form-group row align-items-center ">
                                  <Label className="label col-sm-3">Total Amount</Label>
                                  <div className="col-sm-9">
                                    <input
                                      type="number"
                                      min="0"
                                      className="form-control"
                                      id="description"
                                      value={totalAmount}
                                      readOnly
                                    />
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                          {explainList[`${index}`].chartOfAccountCategoryId &&
                            explainList[`${index}`].chartOfAccountCategoryId.label !== 'Sales' && (
                              <div className="col-md-6">
                                <div className="form-group row align-items-center ">
                                  <Label className="label col-sm-3">
                                    {explainList[`${index}`].chartOfAccountCategoryId.label ===
                                      'Transfered To' ||
                                    explainList[`${index}`].chartOfAccountCategoryId.label ===
                                      'Transfered From'
                                      ? 'Bank Account'
                                      : 'Category'}
                                  </Label>
                                  <div className="col-sm-9">
                                    <Select
                                      id="transaction_category_select"
                                      options={
                                        transactionCategoryList.categoriesList
                                          ? transactionCategoryList.categoriesList
                                          : []
                                      }
                                      onChange={option => {
                                        handleChange(option, 'transactionCategoryList', item);
                                      }}
                                      className="select-default-width"
                                      placeholder="Select"
                                      value={item.transactionCategoryList}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          {explainList[`${index}`].chartOfAccountCategoryId.label ===
                            'Money Received From User' && (
                            <div className="col-md-6">
                              <div className="form-group row align-items-center ">
                                <Label className="label col-sm-3">User</Label>
                                <div className="col-sm-9">
                                  <Select
                                    isMulti
                                    id="transaction_category_select"
                                    options={
                                      transactionCategoryList.dataList
                                        ? transactionCategoryList.dataList[0].options
                                        : []
                                    }
                                    onChange={option => {
                                      calculateTotalAmount(option);
                                      handleChange(option, 'user', item);
                                    }}
                                    value={item.user}
                                    placeholder="Select"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          {(explainList[`${index}`].chartOfAccountCategoryId.label ===
                            'Money Received From User' ||
                            explainList[`${index}`].chartOfAccountCategoryId.label ===
                              'Money Paid To User') && (
                            <div className="col-md-6">
                              <div className="form-group row align-items-center ">
                                <Label className="label col-sm-3">User</Label>
                                <div className="col-sm-9">
                                  <Select
                                    id="transaction_category_select"
                                    options={
                                      transactionCategoryList.dataList
                                        ? transactionCategoryList.dataList[0].options
                                        : []
                                    }
                                    placeholder="Select User"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  {transactionAmount > currentBalance && showChartOfAccount && (
                    <Row className="m-0">
                      <Col lg={5} className="pl-0">
                        <label className="value">Remaining Balance</label>
                        <label className="value">{currentBalance}</label>
                      </Col>
                      <Col lg={5} className="p-0">
                        <Label className="label">Transaction Category</Label>
                        <Select
                          options={
                            transactionCategoryTypeList
                              ? selectOptionsFactory.renderOptions(
                                  'transactionCategoryName',
                                  'transactionCategoryId',
                                  transactionCategoryTypeList,
                                  'Type'
                                )
                              : ''
                          }
                          value={selectedTransactionCategoryType}
                          onChange={option => {
                            if (option && option.value) {
                              setSelectedTransactionCategoryType(option);
                              setShowAlert(false);
                            } else {
                              setSelectedTransactionCategoryType(option);
                              setShowAlert(true);
                            }
                          }}
                          placeholder="Select Type"
                          id="chartOfAccountId"
                          name="chartOfAccountId"
                        />
                      </Col>
                    </Row>
                  )}
                </div>
              </form>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group row align-items-center">
              <label htmlFor="inputEmail3" className="col-sm-3 label">
                Description
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  className="form-control"
                  id="description"
                  placeholder="Description"
                />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group row align-items-center">
              <label htmlFor="inputEmail3" className="col-sm-3 label">
                Attachment
              </label>
              <div className="col-sm-9">
                <Row>
                  <Col lg={12}>
                    <FormGroup className="mb-0">
                      <div>
                        <div className="file-upload-cont">
                          <Button
                            color="primary"
                            onClick={() => {
                              fileInputRef.current?.click();
                            }}
                            className="btn-square mr-3"
                          >
                            <i className="fa fa-upload"></i> Upload File
                          </Button>
                          <input
                            ref={fileInputRef}
                            id="fileInput"
                            type="file"
                            style={{ display: 'none' }}
                          />
                        </div>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
          {moreDetails && (
            <div className="">
              <div className="col-lg-6">
                <div className="form-group row align-items-center">
                  <label htmlFor="inputEmail3" className="col-sm-3 label">
                    Date
                  </label>
                  <div className="col-sm-9">
                    <DatePicker
                      id="transactionDate"
                      name="transactionDate"
                      placeholderText="Transaction Date"
                      showMonthDropdown
                      showYearDropdown
                      dateFormat="dd-MM-yyyy"
                      dropdownMode="select"
                      selected={startDate}
                      value={
                        selectedData.transactionDate
                          ? dayjs(selectedData.transactionDate, 'DD-MM-YYYY').format('DD-MM-YYYY')
                          : ''
                      }
                    />
                  </div>
                </div>
                <div className="form-group row align-items-center">
                  <label htmlFor="inputEmail3" className="col-sm-3 label">
                    Reference
                  </label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      className="form-control"
                      id="description"
                      placeholder="Reference Number"
                      value={selectedData.referenceNo}
                      readOnly
                    />
                  </div>
                </div>
                {explainList[0].chartOfAccountCategoryId.label === 'Expenses' && (
                  <div>
                    <div className="form-group row align-items-center ">
                      <Label className="label col-sm-3">Vendor</Label>
                      <div className="col-sm-9">
                        <Select
                          id="transaction_category_select"
                          options={
                            transactionCategoryList.dataList
                              ? transactionCategoryList.dataList[2].options
                              : []
                          }
                          placeholder="Select Vendor"
                        />
                      </div>
                    </div>
                    <div className="form-group row align-items-center ">
                      <Label className="label col-sm-3">Customer</Label>
                      <div className="col-sm-9">
                        <Select
                          id="transaction_category_select"
                          options={
                            transactionCategoryList.dataList
                              ? transactionCategoryList.dataList[1].options
                              : []
                          }
                          placeholder="Select Customer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="">
            <div className="col-lg-6">
              <div className="row align-items-center justify-content-lg-between ml-0">
                <Button type="button" color="primary" className="btn-square" onClick={handleSubmit}>
                  <i className="fa fa-dot-circle-o"></i> Explain
                </Button>
                {!moreDetails ? (
                  <p className="moreDetails" onClick={() => setMoreDetails(true)}>
                    More Details
                  </p>
                ) : (
                  <p className="moreDetails" onClick={() => setMoreDetails(false)}>
                    Less Details
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <Loader />;
  }
};

export default connect(null, mapDispatchToProps)(ExplainDiv);
