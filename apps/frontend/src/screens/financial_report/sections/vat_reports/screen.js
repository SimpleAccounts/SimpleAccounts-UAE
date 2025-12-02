import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  Button,
  Col,
  FormGroup,
  Card,
  CardHeader,
  CardBody,
  Row,
  DropdownMenu,
  DropdownItem,
  ButtonDropdown,
  DropdownToggle,
} from "reactstrap";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { AuthActions, CommonActions } from "services/global";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import "./style.scss";
import * as Vatreport from "./actions";
import { upperFirst } from "lodash-es";
// import { AgGridReact, AgGridColumn } from 'ag-grid-react/lib/agGridReact';
// import 'ag-grid-community/dist/styles/ag-grid.css';
// import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import moment from "moment";
import download from "downloadjs";
import {
  DeleteModal,
  FileTaxReturnModal,
  GenerateVatReportModal,
  VatSettingModal,
} from "./sections";
import { ConfirmDeleteModal, Currency, Loader } from "components";
import { data } from "../../../Language/index";
import LocalizedStrings from "react-localization";

const mapStateToProps = (state) => {
  return {
    version: state.common.version,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    authActions: bindActionCreators(AuthActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
    vatreport: bindActionCreators(Vatreport, dispatch),
  };
};

let strings = new LocalizedStrings(data);
class VatReports extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initValue: {},
      loading: false,
      fileName: "",
      actionButtons: {},
      disabled: false,
      file_data_list: [],
      openModal: false,
      openVatSettingModal: false,
      openFileTaxRetrunModal: false,
      coaName: "",
      vatReportDataList: [],
      options: [
        { label: "Montly", value: 0 },
        { label: "Quarterly", value: 2 },
      ],
      enbaleReportGeneration: false,
      monthOption: { label: "Montly", value: 0 },
      // vatReportDataList: [
      // 	{
      // 	id:11,	taxReturns: "30/11/2021-14/12/2021", totalTaxPayable: 3000, totalTaxReclaimable: null, filedOn: "2021-12-23T06:41:37", status: "Paid", balanceDue: null, currency: "AED", currency: "AED", action: true
      // 	},
      // 	{
      // 		id:12,	taxReturns: "30/11/2021-14/12/2021", totalTaxPayable: 5380, totalTaxReclaimable: null, filedOn: "2021-12-23T06:41:37", status: "Partially Paid", balanceDue: 1380, currency: "AED", action: true
      // 	},
      // 	{
      // 		id:13,	taxReturns: "30/11/2021-14/12/2021", totalTaxPayable: 4555, totalTaxReclaimable: null, filedOn: "2021-12-23T06:41:37", status: "Filed", balanceDue: 4500, currency: "AED", action: true
      // 	},
      // 	{
      // 		id:14,	taxReturns: "30/11/2021-14/12/2021", totalTaxPayable: 6780, totalTaxReclaimable: null, filedOn: null, status: "UnFiled", balanceDue: 4500, currency: "AED", action: true
      // 	},
      // 	{
      // 		id:15,	taxReturns: "30/11/2021-14/12/2021", totalTaxPayable: null, totalTaxReclaimable: 1252, filedOn: "2021-12-23T06:41:37", status: "Reclaimed", balanceDue: null, currency: "AED", action: true
      // 	},
      // 	{
      // 		id:16,	taxReturns: "30/11/2021-14/12/2021", totalTaxPayable: null, totalTaxReclaimable: 4500, filedOn: "2021-12-23T06:41:37", status: "Filed", balanceDue: 4500, currency: "AED", action: true
      // 	},
      // 	{
      // 		taxReturns: "30/11/2021-14/12/2021", totalTaxPayable: 3000, totalTaxReclaimable: null, filedOn: "2021-12-23T06:41:37", status: "Paid", balanceDue: null, currency: "AED", action: true
      // 	},
      // 	{
      // 		taxReturns: "30/11/2021-14/12/2021", totalTaxPayable: 5380, totalTaxReclaimable: null, filedOn: "2021-12-23T06:41:37", status: "Partially Paid", balanceDue: 1380, currency: "AED", action: true
      // 	},
      // 	{
      // 		taxReturns: "30/11/2021-14/12/2021", totalTaxPayable: 4555, totalTaxReclaimable: null, filedOn: "2021-12-23T06:41:37", status: "Filed", balanceDue: 4500, currency: "AED", action: true
      // 	},
      // 	{
      // 		taxReturns: "30/11/2021-14/12/2021", totalTaxPayable: 6780, totalTaxReclaimable: null, filedOn: null, status: "UnFiled", balanceDue: 4500, currency: "AED", action: true
      // 	},
      // 	{
      // 		taxReturns: "30/11/2021-14/12/2021", totalTaxPayable: null, totalTaxReclaimable: 1252, filedOn: "2021-12-23T06:41:37", status: "Reclaimed", balanceDue: null, currency: "AED", action: true
      // 	},
      // 	{
      // 		taxReturns: "30/11/2021-14/12/2021", totalTaxPayable: null, totalTaxReclaimable: 4500, filedOn: "2021-12-23T06:41:37", status: "Filed", balanceDue: 4500, currency: "AED", action: true
      // 	}
      // ],
      paginationPageSize: 10,
      dialog: false,
      current_report_id: "",
      deleteModal: false,
      loadingMsg: "Loading...",
    };

    this.options = {
      // onRowClick: this.goToDetail,
      page: 1,
      sizePerPage: 10,
      onSizePerPageList: this.onSizePerPageList,
      onPageChange: this.onPageChange,
      sortName: "",
      sortOrder: "",
      onSortChange: this.sortColumn,
    };
  }

  onPageSizeChanged = (newPageSize) => {
    var value = document.getElementById("page-size").value;
    this.gridApi.paginationSetPageSize(Number(value));
  };

  onGridReady = (params) => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  };

  onSizePerPageList = (sizePerPage) => {
    if (this.options.sizePerPage !== sizePerPage) {
      this.options.sizePerPage = sizePerPage;
      this.getInitialData();
    }
  };

  onPageChange = (page, sizePerPage) => {
    if (this.options.page !== page) {
      this.options.page = page;
      this.getInitialData();
    }
  };

  onBtnExport = () => {
    this.gridApi.exportDataAsCsv();
  };

  onBtnExportexcel = () => {
    this.gridApi.exportDataAsExcel();
  };

  componentDidMount = () => {
    this.getInitialData();
  };

  markItUnfiled = (row) => {
    const postingRequestModel = {
      postingRefId: row.id,
      postingRefType: "VAT_REPORT_FILED",
    };
    this.setState({ loading: true, loadingMsg: "VAT UnFiling..." });
    this.props.vatreport
      .markItUnfiled(postingRequestModel)
      .then((res) => {
        if (res.status === 200) {
          this.props.commonActions.tostifyAlert(
            "success",
            res.data && res.data.message
              ? res.data.message
              : " VAT UnFiled Successfully"
          );
          this.getInitialData();
          this.setState({ loading: false });
        }
      })
      .catch((err) => {
        this.props.commonActions.tostifyAlert(
          "error",
          err && err.data ? err.data.message : "Something Went Wrong"
        );
      });
  };

  getInitialData = () => {
    this.getVRNPrefix();
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
    this.props.vatreport
      .getVatReportList(postData)
      .then((res) => {
        if (res.status === 200) {
          this.setState({ vatReportDataList: res.data }); // comment for dummy
        }
      })
      .catch((err) => {
        this.props.commonActions.tostifyAlert(
          "error",
          err && err.data ? err.data.message : "Something Went Wrong"
        );
      });
  };

  export = (filename) => {
    this.props.vatreport
      .downloadcsv(filename)
      .then((res) => {
        if (res.status === 200) {
          const blob = new Blob([res.data], { type: "application/csv" });
          download(blob, filename);
        }
      })
      .catch((err) => {
        this.props.commonActions.tostifyAlert(
          "error",
          err && err.data ? err.data.message : "Something Went Wrong"
        );
      });
  };
  getVRNPrefix = () => {
    this.props.vatreport.getVRNPrefix().then((res) => {
      if (res.status === 200) {
        this.setState({
          prefix: res.data,
        });
      }
    });
  };
  handleChange = (key, val) => {
    this.setState({
      [key]: val,
    });
  };

  closeModal = (res) => {
    this.setState({ openModal: false });
  };

  closeVatSettingModal = (res) => {
    this.setState({ openVatSettingModal: false });
  };

  closeFileTaxRetrunModal = (res) => {
    this.setState({ openFileTaxRetrunModal: false });
  };

  closeDeleteModal = (res) => {
    this.setState({ deleteModal: false });
  };

  showHeader = (s) => {
    return upperFirst(s.replace(/([a-z])([A-Z])/g, "$1 $2"));
  };

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

  getActionButtons = (cell, params) => {
    return (
      // DROPDOWN ACTIONS

      <ButtonDropdown
        isOpen={this.state.actionButtons[params.id]}
        toggle={() => this.toggleActionButton(params.id)}
      >
        <DropdownToggle size="sm" color="primary" className="btn-brand icon">
          {this.state.actionButtons[params.id] === true ? (
            <i className="fas fa-chevron-up" />
          ) : (
            <i className="fas fa-chevron-down" />
          )}
        </DropdownToggle>

        {/* Menu start */}
        <DropdownMenu right>
          {/* View */}

          <DropdownItem
            // onClick={() => {
            // 			this.setState({current_report_id:params.id})
            // 			let dateArr = params.taxReturns ? params.taxReturns.split("-") : [];
            // 			this.props.history.push('/admin/report/vatreports/view',{startDate:dateArr[0] ?dateArr[0] :'',endDate:dateArr[1] ?dateArr[1] :''})
            // }}
            onClick={() => {
              this.setState({ current_report_id: params.id });
              let dateArr = params.taxReturns
                ? params.taxReturns.split("-")
                : [];
              this.props.history.push(
                `/admin/report/vatreports/view?id=${params.id}`,
                {
                  startDate: dateArr[0] ? dateArr[0] : "",
                  endDate: dateArr[1] ? dateArr[1] : "",
                }
              );
            }}
          >
            <i className="fas fa-eye" /> View
          </DropdownItem>

          {/* delete */}

          {params.status === "UnFiled" ? (
            <DropdownItem
              onClick={() => {
                // this.delete(params.id)
                this.setState({
                  current_report_id: params.id,
                  deleteModal: true,
                });
              }}
            >
              <i className="fas fa-trash" /> Delete
            </DropdownItem>
          ) : (
            ""
          )}

          {/* Record Payment */}

          {params.status === "Filed" || params.status === "Partially Paid" ? (
            <DropdownItem
              onClick={() => {
                this.setState({ current_report_id: params.id });
                if (params.totalTaxReclaimable != 0)
                  this.props.history.push(
                    "/admin/report/vatreports/recordclaimtax",
                    {
                      id: params.id,
                      totalTaxReclaimable: params.totalTaxReclaimable,
                      taxReturns: params.taxReturns,
                    }
                  );
                else
                  this.props.history.push(
                    "/admin/report/vatreports/recordtaxpayment",
                    {
                      id: params.id,
                      taxReturns: params.taxReturns,
                      totalTaxPayable: params.totalTaxPayable,
                      balanceDue: params.balanceDue,
                    }
                  );
              }}
            >
              {" "}
              <i className="fas fa-university" /> Record Payment
            </DropdownItem>
          ) : (
            ""
          )}

          {/* Mark It Unfiled  */}

          {params.status === "Filed" ? (
            <DropdownItem
              onClick={() => {
                this.setState({ current_report_id: params.id });
                this.markItUnfiled(params);
              }}
            >
              {" "}
              <i className="fas fa-unlink" /> Mark It Unfiled
            </DropdownItem>
          ) : (
            ""
          )}

          {/* File The Report */}

          {params.status === "UnFiled" ? (
            <DropdownItem
              onClick={() => {
                this.setState({
                  openFileTaxRetrunModal: true,
                  current_report_id: params.id,
                  taxReturns: params.taxReturns,
                });
              }}
            >
              {" "}
              <i className="fas fa-link" /> File The Report
            </DropdownItem>
          ) : (
            ""
          )}
        </DropdownMenu>
      </ButtonDropdown>
      // <>

      // BUTTON ACTIONS
      // 		View
      // 		<Button
      // 			className="Ag-gridActionButtons btn-sm"
      // 			title='View'
      // 			color="secondary"
      // 			onClick={() => {
      // 				this.setState({current_report_id:params.data.id})
      // 				let dateArr = params.data.taxReturns ? params.data.taxReturns.split("-") : [];
      // 				this.props.history.push(`/admin/report/vatreports/view?id=${params.data.id}`,{startDate:dateArr[0] ?dateArr[0] :'',endDate:dateArr[1] ?dateArr[1] :''})
      // 			}}
      // 		>	<i className="fas fa-eye" /> </Button>&nbsp;&nbsp;

      // 		Delete
      // 		{params.data.status === "UnFiled"  ? (
      // 			<Button
      // 				title='Delete'
      // 				color="danger"
      // 				className=" btn-sm Ag-gridActionButtons deleteButton"
      // 				onClick={() => {
      // 					// this.delete(params.data.id)
      // 					this.setState({current_report_id:params.data.id,deleteModal:true})
      // 				}}
      // 			>	<i className="fas fa-trash" /> </Button>
      // 		) : ''}
      // 		{params.data.status === "UnFiled" || params.data.status === "Filed" ? (<>&nbsp;&nbsp;</>) : ''}

      // 		Record Payment
      // 		{params.data.status === "Filed" || params.data.status === "Partially Paid" ? (
      // 			<Button
      // 				title={params.data.totalTaxReclaimable != 0?'Record Tax Claim':'Record Tax Payment'}
      // 				color="secondary"
      // 				className=" btn-sm"
      // 				onClick={() => {
      // 					this.setState({current_report_id:params.data.id})
      // 						if (params.data.totalTaxReclaimable != 0)
      // 							this.props.history.push('/admin/report/vatreports/recordclaimtax',{id:params.data.id,
      // 																					totalTaxReclaimable:params.data.totalTaxReclaimable,
      // 																					taxReturns:params.data.taxReturns,})
      // 						else
      // 							this.props.history.push('/admin/report/vatreports/recordtaxpayment',{id:params.data.id,
      // 																					taxReturns:params.data.taxReturns,
      // 																					totalTaxPayable:params.data.totalTaxPayable,
      // 																					balanceDue:params.data.balanceDue,
      // 																					})
      // 		}}
      // 			>	<i className="fas fa-university" /> </Button>
      // 		) : ''}
      // 		{params.data.status === "Filed" || params.data.status === "Partially Paid" ? (<>&nbsp;&nbsp;</>) : ''}

      // 		Mark It Unfiled
      // 		{params.data.status === "Filed" ? (<Button
      // 			title='Mark It Unfiled'
      // 			color="secondary"
      // 			className=" btn-sm"
      // 			onClick={() => {
      // 				this.setState({current_report_id:params.data.id})
      // 				this.markItUnfiled(params.data)
      // 			}}
      // 		>	<i className="fas fa-unlink" /> </Button>) : ""}
      // 		{params.data.status === "Filed" ? (<>&nbsp;&nbsp;</>) : ''}

      // 		File The Report
      // 		{params.data.status === "UnFiled" ? (<Button
      // 			title='File The Report'
      // 			color="secondary"
      // 			className=" btn-sm"
      // 			onClick={() => {
      // 				let dateArr = params.data.taxReturns ? params.data.taxReturns.split("-") : [];
      // 				let endDate = dateArr[1]

      // 				this.setState({ openFileTaxRetrunModal: true,
      // 					 			current_report_id: params.data.id ,
      // 								endDate:endDate,
      // 								taxReturns:params.data.taxReturns,
      // 							});
      // 			}}
      // 		>	<i className="fas fa-link" /></Button>) : ""}
      // </>
    );
  };

  renderStatus = (params) => {
    return (
      <>
        {params === "UnFiled" ? (
          <label className="badge label-draft"> {params}</label>
        ) : (
          ""
        )}
        {params === "Filed" ? (
          <label className="badge label-due"> {params}</label>
        ) : (
          ""
        )}
        {params === "Partially Paid" ? (
          <label className="badge label-PartiallyPaid"> {params}</label>
        ) : (
          ""
        )}
        {params === "Paid" ? (
          <label className="badge label-paid">{params}</label>
        ) : (
          ""
        )}
        {params === "claimed" ? (
          <label className="badge label-paid text-capitalize">{params}</label>
        ) : (
          ""
        )}
        {params === "Reclaimed" ? (
          <label className="badge label-sent"> {params}</label>
        ) : (
          ""
        )}
      </>
    );
  };

  renderAmount = (amount, params) => {
    if (amount != null && amount != 0)
      return (
        <>
          <Currency value={amount} currencySymbol={params.currency} />
        </>
      );
    else return "---";
  };
  renderBalanceAmount = (amount, params) => {
    if (amount != null) {
      return (
        <label className="badge label-due">
          <Currency value={amount} currencySymbol={params.data.currency} />
        </label>
      );
    } else return "---";
  };

  delete = (id) => {
    const message1 = (
      <text>
        <b>Delete VAT Report File ?</b>
      </text>
    );
    const message =
      "This VAT report file will be deleted permanently and cannot be recovered. ";

    this.setState({
      dialog: (
        <ConfirmDeleteModal
          isOpen={true}
          okHandler={this.remove(id)}
          cancelHandler={this.removeDialog}
          message={message}
          message1={message1}
        />
      ),
    });
  };

  remove = (current_report_id) => {
    this.props.vatreport
      .deleteReportById(current_report_id)
      .then((res) => {
        if (res.status === 200) {
          this.props.commonActions.tostifyAlert(
            "success",
            res.data && res.data.message
              ? res.data.message
              : "VAT Report File Deleted Successfully"
          );
          this.setState({
            dialog: null,
          });
          this.getInitialData();
        }
      })
      .catch((err) => {
        this.props.commonActions.tostifyAlert(
          "error",
          err.data ? err.data.message : "VAT Report File Deleted Unsuccessfully"
        );
        this.setState({
          dialog: null,
        });
      });
  };

  removeDialog = () => {
    this.setState({
      dialog: null,
    });
  };

  renderDate = (cell, row) => {
    return cell
      ? moment(cell).format("DD-MM-YYYY")
      : // .format('LL')
      "-";
  };

  renderVATNumber = (cell, row) => {
    return <>{row.vatNumber}</>;
  };
  renderTaxReturns = (cell, row) => {
    let dateArr = cell ? cell.split("-") : [];

    let startDate = moment(dateArr[0]).format("DD-MM-YYYY");
    let endDate = moment(dateArr[1]).format("DD-MM-YYYY");

    return <>{dateArr[0].replaceAll("/", "-")}</>;
  };

  render() {
    const {
      vatReportDataList,
      openFileTaxRetrunModal,
      dialog,
      options,
      loading,
      loadingMsg,
    } = this.state;
    return loading == true ? (
      <Loader loadingMsg={loadingMsg} />
    ) : (
      <div className="import-bank-statement-screen">
        <div className="animated fadeIn">
          <Card>
            <CardHeader>
              {dialog}
              {loading && (
                <Row>
                  <Col lg={12} className="rounded-loader">
                    <div>
                      <Loader />
                    </div>
                  </Col>
                </Row>
              )}
              <Row>
                <Col lg={12}>
                  <div
                    className="h4 mb-0 d-flex align-items-center"
                    style={{ justifyContent: "space-between" }}
                  >
                    <div>
                      <p
                        className="mb-0"
                        style={{
                          cursor: "pointer",
                          fontSize: "1.3rem",
                          paddingLeft: "15px",
                        }}
                        onClick={this.viewFilter}
                      >
                        VAT Report
                      </p>
                    </div>
                    <div>
                      <Button
                        className="mr-2 btn btn-danger"
                        onClick={() => {
                          this.props.history.push("/admin/report/reports-page");
                        }}
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        <span>X</span>
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            {dialog}
            {/* <Card className="m-5  p-1 ">
						
							<CardBody className="text-center " style={{    border: '2px solid '}} onClick={()=>{this.props.history.push("/admin/report/vatreport")}}>	<h4>VAT Report</h4>	</CardBody>
						</Card>
						<Card className="m-5  p-1 ">
							<CardBody className="text-center "  style={{    border: '2px solid '}}>	<h4>Excise Tax Report</h4>	</CardBody>
						</Card>
						
						<Card className="m-5  p-1 ">
							<CardBody className="text-center "  style={{    border: '2px solid '}}>	<h4>FTA Audit Report</h4></CardBody>
						</Card > */}

            <CardBody>
              {/* <div 	className="text-center mb-4 mt-2 " > <h1>VAT Report</h1></div> */}
              <Row>
                <Col lg={12} className="mb-5">
                  <div className="table-wrapper">
                    <FormGroup className="text-center">
                      <Button
                        color="primary"
                        className="btn-square  pull-right"
                        onClick={() => {
                          this.props.history.push(
                            "/admin/report/vatreports/vatpaymentrecordhistory"
                          );
                        }}
                      >
                        <i className="fas fa-history"></i> VAT Payment Record
                      </Button>

                      <Button
                        name="button"
                        color="primary"
                        className="btn-square pull-right "
                        // disabled={!this.state.enbaleReportGeneration}
                        // title={!this.state.enbaleReportGeneration?"Select VAT Reporting Period":""}
                        onClick={() => {
                          this.setState({ openModal: true });
                        }}
                      >
                        <i className="fas fa-plus"></i> Generate VAT Report
                      </Button>

                      {/* <Button color="primary" className="btn-square  pull-right"
												onClick={() => {
													this.setState({ openVatSettingModal: true })
												}}>
												<i className="fa"></i>Company Details
											</Button>  */}
                    </FormGroup>
                  </div>
                </Col>
              </Row>

              {/* 
							taxReturns:"30/11/2021-14/12/2021",totalTaxPayable:3000,totalTaxReclaimable:null,filedOn:"2021-12-23T06:41:37",status:"Paid",balanceDue:null,action:true
								
								 */}
              {/* <div className="ag-theme-alpine mb-3" style={{ height: 550, width: "100%" }}>

								<AgGridReact

									rowData={
										vatReportDataList
											? vatReportDataList
											: []}
									pagination={true}
									rowSelection="multiple"
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

									<AgGridColumn field="taxReturns"
										headerName="VAT Return"
										sortable={true}
										filter={true}
										// checkboxSelection={true}
										enablePivot={true}

										cellRendererFramework={(params) =>
											<>
												{this.renderTaxReturns(params.value, params)}
											</>
										}
									></AgGridColumn>

									<AgGridColumn field="totalTaxPayable"
										headerName="Total VAT Payable"
										sortable={true}
										filter={true}
										enablePivot={true}
										cellRendererFramework={(params) =>
											<>
												{this.renderAmount(params.value, params)}
											</>
										}
									></AgGridColumn>

									<AgGridColumn field="totalTaxReclaimable"
										headerName="Total VAT Reclaimable"
										sortable={true}
										filter={true}
										enablePivot={true}
										cellRendererFramework={(params) =>
											<>
												{this.renderAmount(params.value, params)}
											</>
										}
									></AgGridColumn>

									<AgGridColumn field="filedOn"
										headerName="Filed On"
										sortable={true}
										enablePivot={true}
										filter={true}
										cellRendererFramework={(params) =>
											<>
												{this.renderDate(params.value, params)}
											</>
										}
									></AgGridColumn>

									<AgGridColumn
										headerName="Status"
										field="status"
										sortable={true}
										enablePivot={true}
										filter={true}
										cellRendererFramework={(params) => <>
											{this.renderStatus(params)}
										</>

										}
									></AgGridColumn>

									<AgGridColumn field="balanceDue"
										headerName="Balance Due"
										sortable={true}
										enablePivot={true}
										filter={true}
										cellRendererFramework={(params) =>
											<>
												{this.renderAmount(params.value, params)}
											</>
										}

									></AgGridColumn>

									<AgGridColumn field="action"
										// className="Ag-gridActionButtons"
										headerName="Actions"
										cellRendererFramework={(params) =>
											<div
											 className="Ag-gridActionButtons"
											 >
												{this.getActionButtons(params)}
											</div>

										}
									></AgGridColumn>
								</AgGridReact>
								<div className="example-header mt-1">
									Page Size:
									<select onChange={() => this.onPageSizeChanged()} id="page-size">
										<option value="10" selected={true}>
											10
										</option>
										<option value="100">100</option>
										<option value="500">500</option>
										<option value="1000">1000</option>
									</select>
								</div>
							</div> */}

              <div>
                <BootstrapTable
                  selectRow={this.selectRowProp}
                  options={this.options}
                  version="4"
                  hover
                  responsive
                  remote
                  data={
                    vatReportDataList && vatReportDataList.data
                      ? vatReportDataList.data
                      : []
                  }
                  // data={vatReportDataList.data ? vatReportDataList.data : []}
                  // rowData={vatReportDataList.data ? vatReportDataList.data : []}
                  pagination={
                    vatReportDataList &&
                      vatReportDataList.data &&
                      vatReportDataList.data.length
                      ? true
                      : false
                  }
                  fetchInfo={{
                    dataTotalSize: vatReportDataList.count
                      ? vatReportDataList.count
                      : 0,
                  }}
                >
                  <TableHeaderColumn
                    tdStyle={{ whiteSpace: "normal" }}
                    isKey
                    dataField="vatNumber"
                    dataSort
                    className="table-header-bg"
                  >
                    VAT Report No.
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    tdStyle={{ whiteSpace: "normal" }}
                    dataField="taxReturns"
                    dataSort
                    dataFormat={this.renderTaxReturns}
                    className="table-header-bg"
                  >
                    VAT Return
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    width="10%"
                    dataField="totalTaxPayable"
                    dataAlign="right"
                    dataSort
                    dataFormat={this.renderAmount}
                    className="table-header-bg"
                  >
                    Total VAT Payable
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="totalTaxReclaimable"
                    // columnTitle={this.customEmail}
                    dataAlign="right"
                    dataSort
                    dataFormat={this.renderAmount}
                    className="table-header-bg"
                  >
                    Total VAT Reclaimable
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="filedOn"
                    // columnTitle={this.customEmail}
                    dataSort
                    dataFormat={this.renderDate}
                    className="table-header-bg"
                  >
                    Filed On
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="status"
                    // columnTitle={this.customEmail}
                    dataSort
                    dataFormat={this.renderStatus}
                    className="table-header-bg"
                  >
                    {strings.Status}
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="balanceDue"
                    // columnTitle={this.customEmail}
                    dataAlign="right"
                    dataSort
                    dataFormat={this.renderAmount}
                    className="table-header-bg"
                  >
                    {strings.BalanceDue}
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    className="text-right table-header-bg"
                    columnClassName="text-right"
                    width="5%"
                    dataFormat={this.getActionButtons}
                  ></TableHeaderColumn>
                </BootstrapTable>
              </div>
            </CardBody>
          </Card>
        </div>
        <GenerateVatReportModal
          openModal={this.state.openModal}
          setState={(e) => this.setState(e)}
          vatReportDataList={vatReportDataList}
          state={this.state}
          monthOption={this.state.monthOption}
          closeModal={(e) => {
            this.closeModal(e);
            this.getInitialData();
          }}
        />
        <VatSettingModal
          openModal={this.state.openVatSettingModal}
          closeModal={(e) => {
            this.closeVatSettingModal(e);
            this.getInitialData();
          }}
        />

        {openFileTaxRetrunModal &&
          <FileTaxReturnModal
            openModal={openFileTaxRetrunModal}
            current_report_id={this.state.current_report_id}
            endDate={this.state.endDate}
            taxReturns={this.state.taxReturns}
            closeModal={(e) => {
              this.closeFileTaxRetrunModal(e);
              this.getInitialData();
            }}
          />
        }
        <DeleteModal
          openModal={this.state.deleteModal}
          current_report_id={this.state.current_report_id}
          closeModal={(e) => {
            this.closeDeleteModal(e);
            this.getInitialData();
          }}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VatReports);
