import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  ButtonGroup,
  FormGroup,
  Input,
} from "reactstrap";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import Select from "react-select";
import { Loader, ConfirmDeleteModal } from "components";
import "react-toastify/dist/ReactToastify.css";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import * as ChartAccountActions from "./actions";
import { selectOptionsFactory } from "utils";
import { CommonActions } from "services/global";
import { CSVLink } from "react-csv";
import "./style.scss";
import { data } from "../Language/index";
import LocalizedStrings from "react-localization";
// import { AgGridReact,AgGridColumn } from 'ag-grid-react/lib/agGridReact';
// import 'ag-grid-community/dist/styles/ag-grid.css';
// import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const mapStateToProps = (state) => {
  return {
    transaction_category_list: state.chart_account.transaction_category_list,
    transaction_type_list: state.chart_account.transaction_type_list,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    chartOfAccountActions: bindActionCreators(ChartAccountActions, dispatch),
  };
};

let strings = new LocalizedStrings(data);
class ChartAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window["localStorage"].getItem("language"),
      loading: true,
      selectedRows: [],
      dialog: null,
      filterData: {
        transactionCategoryCode: "",
        transactionCategoryName: "",
        chartOfAccountId: "",
      },
      selectedTransactionType: "",
      paginationPageSize: 10,
      csvData: [],
      view: false,
      unselectable: [],
      pageSize: 10,
      hideForPrint: false,
    };

    this.options = {
      onRowClick: this.goToDetailPage,
      page: 1,
      sizePerPage: 10,
      onSizePerPageList: this.onSizePerPageList,
      onPageChange: this.onPageChange,
      sortName: "",
      sortOrder: "",
      onSortChange: this.sortColumn,
    };

    this.selectRowProp = {
      //mode: 'checkbox',
      bgColor: "rgba(0,0,0, 0.05)",
      clickToSelect: false,
      onSelect: this.onRowSelect,
      onSelectAll: this.onSelectAll,
      unselectable: this.state.unselectable,
    };
    this.csvLink = React.createRef();
  }

  unselectable(res) {
    return res.data.map((unselect) => {
      if (unselect.editableFlag === false) {
        this.state.unselectable.push(unselect.transactionCategoryId);
      }
    });
  }
  onGridReady = (params) => {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    // this.gridApi.sizeColumnsToFit();
  };
  componentDidMount = () => {
    this.props.chartOfAccountActions.getTransactionTypes();
    this.initializeData();
  };

  componentWillUnmount = () => {
    this.setState({
      selectedRows: [],
    });
  };

  initializeData = (search) => {
    let { filterData } = this.state;
    const paginationData = {
      pageNo: this.options.page ? this.options.page - 1 : 0,
      pageSize: this.options.sizePerPage,
    };
    const sortingData = {
      order: this.options.sortOrder ? this.options.sortOrder : "",
      sortingCol: this.options.sortName ? this.options.sortName : "",
    };
    const postData = { ...filterData, ...paginationData, ...sortingData };
    this.props.chartOfAccountActions
      .getTransactionCategoryList(postData)
      .then((res) => {
        if (res.status === 200) {
          this.unselectable(res.data);
          this.setState({
            loading: false,
          });
        }
      })
      .catch((err) => {
        this.props.commonActions.tostifyAlert(
          "error",
          err && err.data ? err.data.message : "Something Went Wrong"
        );
        this.setState({ loading: false });
      });
  };

  sortColumn = (sortName, sortOrder) => {
    this.options.sortName = sortName;
    this.options.sortOrder = sortOrder;
    this.initializeData();
  };

  goToDetailPage = (row) => {
    if (row.editableFlag) {
      this.props.history.push(`/admin/master/chart-account/detail`, {
        id: row.transactionCategoryId,
      });
    }
  };

  goToTransactionCategoryDetail = (categoryId) => {
    if (categoryId) {
      this.props.history.push(`/admin/master/chart-account/detail`, {
        id: categoryId,
      });
    }
  };

  goToCreatePage = () => {
    this.props.history.push("/admin/master/chart-account/create");
  };

  onSizePerPageList = (sizePerPage) => {
    if (this.options.sizePerPage !== sizePerPage) {
      this.options.sizePerPage = sizePerPage;
      this.initializeData();
    }
  };

  onPageChange = (page, sizePerPage) => {
    if (this.options.page !== page) {
      this.options.page = page;
      this.initializeData();
    }
  };

  onRowSelect = (row, isSelected, e) => {
    let tempList = [];
    if (isSelected) {
      tempList = Object.assign([], this.state.selectedRows);
      tempList.push(row.transactionCategoryId);
    } else {
      this.state.selectedRows.map((item) => {
        if (item !== row.transactionCategoryId) {
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
        tempList.push(item.transactionCategoryId);
        return item;
      });
    }
    this.setState({
      selectedRows: tempList,
    });
  };

  bulkDelete = () => {
    const { selectedRows } = this.state;
    const message1 = (
      <text>
        <b>Delete Chart of Account?</b>
      </text>
    );
    const message =
      "This Chart of Account will be deleted permanently and cannot be recovered.";
    if (selectedRows.length > 0) {
      this.setState({
        dialog: (
          <ConfirmDeleteModal
            isOpen={true}
            okHandler={this.removeBulk}
            cancelHandler={this.removeDialog}
            message={message}
            message1={message1}
          />
        ),
      });
    } else {
      this.props.commonActions.tostifyAlert(
        "info",
        "Please select the rows of the table and try again."
      );
    }
  };

  getActionButtons = (params) => {
    return (
      <>
        {/* BUTTON ACTIONS */}
        {/* View */}
        {params.data.editableFlag === true ? (
          <Button
            className="Ag-gridActionButtons btn-sm"
            title="Edit"
            color="secondary"
            onClick={() =>
              this.goToTransactionCategoryDetail(
                params.data.transactionCategoryId
              )
            }
          >
            {" "}
            <i className="fas fa-edit" />{" "}
          </Button>
        ) : (
          ""
        )}
      </>
    );
  };

  removeBulk = () => {
    this.removeDialog();
    let { selectedRows } = this.state;
    const { transaction_category_list } = this.props;
    let obj = {
      ids: selectedRows,
    };
    this.props.chartOfAccountActions
      .removeBulk(obj)
      .then((res) => {
        this.initializeData();
        this.props.commonActions.tostifyAlert(
          "success",
          res.data ? res.data.message : "Chart Of Account Deleted successfully"
        );
        if (
          transaction_category_list &&
          transaction_category_list.data &&
          transaction_category_list.data.length > 0
        ) {
          this.setState({
            selectedRows: [],
          });
        }
      })
      .catch((err) => {
        this.props.commonActions.tostifyAlert(
          "error",
          err.data
            ? err.data.message
            : "Chart Of Account Deleted Unsuccessfully"
        );
      });
  };

  removeDialog = () => {
    this.setState({
      dialog: null,
    });
  };

  typeFormatter = (cell, row) => {
    return row["transactionTypeName"] ? row["transactionTypeName"] : "";
  };

  handleChange = (val, name) => {
    this.setState({
      filterData: Object.assign(this.state.filterData, {
        [name]: val,
      }),
    });
  };

  handleSearch = () => {
    this.initializeData();
  };

  getCsvData = () => {
    if (this.state.csvData.length === 0) {
      let obj = {
        paginationDisable: true,
      };
      this.props.chartOfAccountActions
        .getTransactionCategoryExportList(obj)
        .then((res) => {
          if (res.status === 200) {
            this.setState({ csvData: res.data, view: true }, () => {
              setTimeout(() => {
                this.csvLink.current.link.click();
              }, 0);
            });
          }
        });
    } else {
      this.csvLink.current.link.click();
    }
  };

  clearAll = () => {
    this.setState(
      {
        filterData: {
          transactionCategoryCode: "",
          transactionCategoryName: "",
          chartOfAccountId: "",
        },
      },
      () => {
        this.initializeData();
      }
    );
  };

  editFormatter = (cell, row) => {
    return row["editableFlag"] ? (
      <i className="fas fa-lock-open"></i>
    ) : (
      <i className="fas fa-lock"></i>
    );
  };

  customName(cell, row) {
    if (row.transactionCategoryName.length > 15) {
      return `${cell}`;
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.domLayout !== this.state.domLayout) {
      if (this.state.domLayout === "print") {
        this.setState({ style: { height: "", width: "" } });
      } else if (this.state.domLayout === null) {
        this.setState({ style: { height: "600px", width: "600px" } });
      }
      this.gridApi.setDomLayout(this.state.domLayout);
    }
  };

  setNormal = () => {
    this.setState({ domLayout: null });
  };
  onBtPrinterFriendly = () => {
    var eGridDiv = document.querySelector("#section-to-print");
    eGridDiv.style.width = "";
    eGridDiv.style.height = "";
    this.gridApi.setDomLayout("print");
  };

  onPageSizeChanged = (newPageSize) => {
    var value = document.getElementById("page-size").value;
    this.setState({ pageSize: value });
    this.gridApi.paginationSetPageSize(Number(value));
  };
  onBtNormal = () => {
    var eGridDiv = document.querySelector("#section-to-print");
    eGridDiv.style.width = "100%";
    eGridDiv.style.height = "590px";
    this.gridApi.setDomLayout(null);
  };
  render() {
    strings.setLanguage(this.state.language);
    const { loading, dialog, selectedRows, csvData, view, filterData } =
      this.state;
    const { transaction_category_list, transaction_type_list } = this.props;
    const customStyles = {
      control: (base, state) => ({
        ...base,
        borderColor: state.isFocused ? "#2064d8" : "#c7c7c7",
        boxShadow: state.isFocused ? null : null,
        "&:hover": {
          borderColor: state.isFocused ? "#2064d8" : "#c7c7c7",
        },
      }),
    };
    return loading == true ? (
      <Loader />
    ) : (
      <div>
        <div className="chart-account-screen">
          <div className="animated fadeIn">
            {dialog}
            <Card>
              <CardHeader>
                <Row>
                  <Col lg={12}>
                    <div className="h4 mb-0 d-flex align-items-center">
                      <i className="nav-icon fas fa-area-chart" />
                      <span className="ml-2">{strings.ChartofAccounts}</span>
                    </div>
                  </Col>
                </Row>
              </CardHeader>
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
                      {this.state.hideForPrint == false && (
                        <div className="d-flex justify-content-end">
                          <ButtonGroup size="sm">
                            <span>
                              <Button
                                color="primary"
                                className="btn-square pull-right mr-1 custom-button"
                                onClick={this.goToCreatePage}
                              >
                                <i className="fas fa-plus mr-1" />
                                {strings.AddNewAccount}
                              </Button>
                            </span>
                            <span>
                              <Button
                                color="primary"
                                className="btn-square mr-1"
                                onClick={() => this.getCsvData()}
                              >
                                <i className="fa glyphicon glyphicon-export fa-download mr-1" />
                                {strings.export_csv}
                              </Button>
                            </span>
                            <span>
                              {view && (
                                <CSVLink
                                  data={csvData}
                                  filename={"ChartOfAccount.csv"}
                                  className="hidden"
                                  ref={this.csvLink}
                                  target="_blank"
                                />
                              )}
                              <Button
                                color="primary"
                                className="btn-square  pull-right"
                                onClick={() => {
                                  let { filterData } = this.state;
                                  const paginationData = {
                                    pageNo: this.options.page
                                      ? this.options.page - 1
                                      : 0,
                                    pageSize: 1000,
                                  };
                                  const sortingData = {
                                    order: this.options.sortOrder
                                      ? this.options.sortOrder
                                      : "",
                                    sortingCol: this.options.sortName
                                      ? this.options.sortName
                                      : "",
                                  };
                                  const postData = {
                                    ...filterData,
                                    ...paginationData,
                                    ...sortingData,
                                  };
                                  this.setState({
                                    loading: false,
                                    hideForPrint: true,
                                  });
                                  this.props.chartOfAccountActions
                                    .getTransactionCategoryList(postData)
                                    .then((res) => {
                                      if (res.status === 200) {
                                        this.unselectable(res.data);
                                        window.print();

                                        this.initializeData();
                                        this.setState({ hideForPrint: false });
                                      }
                                    })
                                    .catch((err) => {
                                      this.props.commonActions.tostifyAlert(
                                        "error",
                                        err && err.data
                                          ? err.data.message
                                          : "Something Went Wrong"
                                      );
                                      this.setState({ loading: false });
                                    });
                                  // this.onBtPrinterFriendly();
                                  // this.setState({pageSize:10000})
                                  // this.gridApi.paginationSetPageSize(Number(10000));

                                  // this.onBtNormal()
                                }}
                                style={{
                                  cursor: "pointer",
                                }}
                              >
                                <i className="fa fa-print">
                                  {" "}
                                  {strings.print_csv}{" "}
                                </i>
                              </Button>
                            </span>
                            {/* <Button
													color="primary"
													className="btn-square mr-1"
													onClick={this.bulkDelete}
													disabled={selectedRows.length === 0}
												>
													<i className="fa glyphicon glyphicon-trash fa-trash mr-1" />
													Bulk Delete
												</Button> */}
                          </ButtonGroup>
                        </div>
                      )}
                      {this.state.hideForPrint == false && (
                        <div className="py-3">
                          {/* <h5>{strings.Filter}: </h5> */}
                          <form>
                            <Row>
                              <Col lg={3} className="mb-1">
                                {/* <Input
															maxLength="25"
															type="text"
															placeholder={strings.AccountCode}
															value={filterData.transactionCategoryCode}
															onChange={(e) => {
																this.handleChange(
																	e.target.value,
																	'transactionCategoryCode',
																);
															}}
														/> */}
                              </Col>
                              <Col lg={3} className="mb-2">
                                {/* <Input
															maxLength="30"
															type="text"
															placeholder={strings.AccountName}
															value={filterData.transactionCategoryName}
															onChange={(e) => {
																this.handleChange(
																	e.target.value,
																	'transactionCategoryName',
																);
															}}
														/> */}
                              </Col>
                              <Col lg={3} className="mb-1">
                                {/* <FormGroup className="mb-3">
															<Select
																styles={customStyles}
																options={
																	transaction_type_list
																		? selectOptionsFactory.renderOptions(
																				'chartOfAccountName',
																				'chartOfAccountId',
																				transaction_type_list,
																				'Type',
																		  )
																		: []
																}
																onChange={(val) => {
																	if (val && val['value']) {
																		this.handleChange(val, 'chartOfAccountId');
																		this.setState({
																			selectedTransactionType: val,
																		});
																	} else {
																		this.handleChange('', 'chartOfAccountId');
																		this.setState({
																			selectedTransactionType: '',
																		});
																	}
																}}
																className="select-default-width"
																placeholder={strings.AccountType}
																value={filterData.chartOfAccountId}
															/>
														</FormGroup> */}
                              </Col>
                              <Col lg={3} className="pl-0 pr-0">
                                {/* <Button
															type="button"
															color="primary"
															className="btn-square mr-1"
															onClick={this.handleSearch}
														>
															<i className="fa fa-search"></i>
														</Button>
														<Button
															type="button"
															color="primary"
															className="btn-square"
															onClick={this.clearAll}
														>
															<i className="fa fa-refresh"></i>
														</Button>
														 */}
                              </Col>
                            </Row>
                          </form>
                        </div>
                      )}

                      <div id="section-to-print">
                        <BootstrapTable
                          selectRow={this.selectRowProp}
                          search={false}
                          options={this.options}
                          data={
                            transaction_category_list &&
                            transaction_category_list.data
                              ? transaction_category_list.data
                              : []
                          }
                          version="4"
                          hover
                          pagination={
                            this.state.hideForPrint == false &&
                            (transaction_category_list &&
                            transaction_category_list.data &&
                            transaction_category_list.data.length
                              ? true
                              : false)
                          }
                          remote
                          fetchInfo={
                            this.state.hideForPrint == false && {
                              dataTotalSize: transaction_category_list.count
                                ? transaction_category_list.count
                                : 0,
                            }
                          }
                          className="product-table"
                          trClassName="cursor-pointer"
                          csvFileName="Chart_Of_Account.csv"
                          keyField="transactionCategoryId"
                          ref={(node) => (this.table = node)}
                        >
                          <TableHeaderColumn
                            dataField="transactionCategoryCode"
                            dataSort
                            className="table-header-bg"
                          >
                            {strings.ACCOUNTCODE}
                          </TableHeaderColumn>
                          <TableHeaderColumn
                            tdStyle={{ whiteSpace: "normal" }}
                            dataField="transactionCategoryName"
                            dataSort
                            columnTitle={this.customName}
                            width="50%"
                            className="table-header-bg"
                          >
                            {strings.ACCOUNTNAME}
                          </TableHeaderColumn>
                          <TableHeaderColumn
                            dataField="chartOfAccountId"
                            dataSort
                            dataFormat={this.typeFormatter}
                            className="table-header-bg"
                          >
                            {strings.ACCOUNTTYPE}
                          </TableHeaderColumn>
                          {this.state.hideForPrint == false && (
                            <TableHeaderColumn
                              dataField="isEditable"
                              dataFormat={this.editFormatter}
                              className="table-header-bg"
                            >
                              {strings.ACCOUNT}
                            </TableHeaderColumn>
                          )}
                        </BootstrapTable>
                      </div>

                      {/* <div id="section-to-print" className="ag-theme-alpine mb-3" style={{ height: 590,width:"100%" }}>
	
			<AgGridReact
				rowData={transaction_category_list &&
					transaction_category_list.data 
					? transaction_category_list.data
						: []}
					//  suppressDragLeaveHidesColumns={true}
				// pivotMode={true}
				// suppressPaginationPanel={false}
				pagination={true}
				rowSelection="multiple"
				// paginationPageSize={10}
				// paginationAutoPageSize={true}
				paginationPageSize={this.state.paginationPageSize}
					floatingFilter={true}
					defaultColDef={{ 
								resizable: true,
								flex: 1,
								sortable: true
							}}
				sideBar="columns"
				onGridReady={this.onGridReady}
					>

				<AgGridColumn field="transactionCategoryCode" 
				headerName=   {strings.ACCOUNTCODE}
				sortable={ true } 
				filter={ true } 
				enablePivot={true}
				cellRendererFramework={(params) => <div
					className="mb-0 label-bank"
					style={{
						cursor: 'pointer',
						}}
				                                                          
		>
		{params.value}
		</div>
}
				></AgGridColumn>

				<AgGridColumn field="transactionCategoryName" 
				headerName= {strings.ACCOUNTNAME}
				sortable={ true } 
				filter={ true } 
				enablePivot={true}
				></AgGridColumn>  


				<AgGridColumn field="transactionTypeName" 
				headerName=  {strings.ACCOUNTTYPE}
				sortable={ true } 
				filter={ true } 
				enablePivot={true}
				></AgGridColumn>   */}

                      {/* <AgGridColumn
				headerName={strings.STATUS}
				field="editableFlag" 
				sortable={ true }
				filter={ false }
				enablePivot={true} 
				cellRendererFramework={
					(params) => params.data.editableFlag == true ? 
					<i className="fas fa-lock-open"></i>
				 : 
					<i className="fas fa-lock"></i>
				
					
					
					// params.value==true ?
					// 								<label className="badge label-success"> Active</label>
					// 								:
					// 								<label className="badge label-due"> InActive</label>
										}
				></AgGridColumn>   */}

                      {/* <AgGridColumn
				headerName={strings.ACCOUNT}
				sortable={ true } 
				filter={ true } 
				enablePivot={true}
				cellRendererFramework={
					(params) => params.data.editableFlag == true ? 
					<i className="fas fa-lock-open"></i>
				 : 
					<i className="fas fa-lock"></i>
				
					
				}
				></AgGridColumn> */}
                      {/* <AgGridColumn field="action"
										// className="Ag-gridActionButtons"
										headerName={strings.action}
										cellRendererFramework={(params) =>
											<div
											 className="Ag-gridActionButtons"
											 >
												{this.getActionButtons(params)}
											</div>

										}
									></AgGridColumn>
			</AgGridReact>   */}
                      {/* <div className="example-header mt-1">
					Page Size:
					<select  value={this.state.pageSize} onChange={() => this.onPageSizeChanged()} id="page-size">
					<option value="10" selected={true}>10</option>
					<option value="100">100</option>
					<option value="500">500</option>
					<option value="1000">1000</option>
					</select>
				</div>      */}

                      {/* </div>	 */}
                    </Col>
                  </Row>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChartAccount);
