import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Button,
	Col,
	Card,
	CardHeader,
	CardBody,
	Row,
} from 'reactstrap';

import { AuthActions, CommonActions } from 'services/global';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css'
import './style.scss';
import * as VatreportAction from './actions';

import logo from 'assets/images/brand/logo.png';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import moment from 'moment';
import * as FinancialReportActions from '../../../../actions';
import { AgGridReact, AgGridColumn } from 'ag-grid-react/lib/agGridReact';
import { Currency } from 'components';
const mapStateToProps = (state) => {
	return {
		version: state.common.version,
		company_profile: state.reports.company_profile,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		vatreport: bindActionCreators(VatreportAction, dispatch),
		financialReportActions: bindActionCreators(
			FinancialReportActions,
			dispatch,
		),
	};
};


class SubReports extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initValue: {},
			loading: false,
			fileName: '',
			disabled: false,
			productName: '',
			version: '',
			type: '',
			upload: false,
			file_data_list: [],
			openModal: false,
			dataList:
				[
					{
					   id:1001,	date: "11/12/2021", entry: "INV 11", transactionType: "Invoice", amount: 999,vatAmount: 67300
					},
					{
					   id:1002, date: "11/12/2021", entry: "INV 12", transactionType: "Invoice", amount: 7300,vatAmount: 400
					},
					{
					   id:1003,	date: "11/12/2021", entry: "INV 13", transactionType: "Invoice", amount: 3500,vatAmount: 87300
					},
					{
					   id:1004,	date: "11/12/2021", entry: "INV 14", transactionType: "Invoice", amount: 665,vatAmount: 97300
					}
					,
					{id:1005,date: "Total", entry: "-", transactionType: "-", amount: 8181818181,vatAmount: 919191919191}
				],
			paginationPageSize: 10,

		};
		// this.state = this.createState();
    }


    // onGridReady(params) {
    //     this.topGrid = params;
    //     fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    //         .then(resp => resp.json())
    //         .then(data => {
    //             this.rowData = data
    //             this.setState(this.createState.bind(this));
    //         });
    // }

    onFirstDataRendered() {
        this.topGrid.columnApi.autoSizeAllColumns();
    }

	onPageSizeChanged = (newPageSize) => {
		var value = document.getElementById('page-size').value;
		this.gridApi.paginationSetPageSize(Number(value));
	};
	onGridReady = (params) => {
		this.gridApi = params.api;
		this.gridColumnApi = params.columnApi;
	};

	onBtnExport = () => {
		this.gridApi.exportDataAsCsv();
	};

	onBtnExportexcel = () => {
		this.gridApi.exportDataAsExcel();
	};
	componentDidMount = () => {
		this.getInitialData();
		this.props.financialReportActions.getCompany();
	};

	getInitialData = () => {
		let postData={
			startDate:this.props.location.state.startDate,
			endDate:this.props.location.state.endDate,
			placeOfSupplyId:this.props.location.state.placeOfSupplyId

		};
		this.props.vatreport
			.getAmountDetailsByPlaceOfSupply(postData)
			.then((res) => {
				if (res.status === 200) {
					 this.setState({ dataList: res.data }) 
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};


	renderDate = (cell, row) => {
		return cell ? moment(cell)
			.format('DD-MM-YYYY') 
			// .format('LL')
			: '-';
	};
	renderAmount = (amount, params) => {
		if (amount != null && amount != 0)
			return (
				<>
					<Currency
						value={amount}
						currencySymbol={params.data.currency?params.data.currency:"AED"}
					/>
				</>
			)
		else
			return ("---")
	}
	getInvoice = (postingType, type, id) => {
		switch (postingType) {
			case 'INVOICE':
		
			if (type === 1) {
					this.props.history.push('/admin/expense/supplier-invoice/view', {
						id,
						boxNo:this.props.location.state.boxNo,
						description:this.props.location.state.description,
						startDate:this.props.location.state.startDate,
						endDate:this.props.location.state.endDate,
						placeOfSupplyId:this.props.location.state.placeOfSupplyId,
						crossLinked:true
					});
				} else {
					this.props.history.push('/admin/income/customer-invoice/view', {
						id,
						boxNo:this.props.location.state.boxNo,
						description:this.props.location.state.description,
						startDate:this.props.location.state.startDate,
						endDate:this.props.location.state.endDate,
						placeOfSupplyId:this.props.location.state.placeOfSupplyId,
						crossLinked:true
					});
				}
				break;
			case 'EXPENSE':
				this.props.history.push('/admin/expense/expense/view', {
					expenseId: id,
					boxNo:this.props.location.state.boxNo,
					description:this.props.location.state.description,
					startDate:this.props.location.state.startDate,
					endDate:this.props.location.state.endDate,
					placeOfSupplyId:this.props.location.state.placeOfSupplyId,
					crossLinked:true
				});
				break;
			case 'MANUAL':
				this.props.history.push('/admin/accountant/journal/detail', { id });
				break;
			default:
		}
	};
	renderTaxReturns = (cell, row) => {
		let dateArr = cell ? cell.split(" ") : [];

		let startDate = moment(dateArr[0]).format('DD-MM-YYYY')
		let endDate = moment(dateArr[1]).format('DD-MM-YYYY')

		return (<>{dateArr[0].replaceAll("/", "-")}</>);
	};

	render() {
		const { dataList } = this.state;
		const { company_profile, description } = this.props;
		const id = this.props.location.state.id;
		return (
			<div className="import-bank-statement-screen">
				<div className="animated fadeIn">
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>


									<div
										className="h4 mb-0 d-flex align-items-center"
										style={{ justifyContent: 'space-between' }}
									>
										<div>
											<p
												className="mb-0"
												style={{
													cursor: 'pointer',
													fontSize: '1rem',
													paddingLeft: '15px',
												}}
												onClick={this.viewFilter}
											>
												<i className="fa fa-history mr-2"></i>{this.props.location.state.description}
											</p>
										</div>
										<div className="d-flex">



											<Button name="button" color="primary"
												className="mr-2 print-btn-cont"
												onClick={() => {
													this.props.history.push(`/admin/report/vatreports/view?id=${id}`, { startDate: this.props.location.state.startDate, endDate: this.props.location.state.endDate });
												}}
												style={{ cursor: 'pointer' }}
											>
												<span>Back<i className="far fa-arrow-alt-circle-left ml-1"></i></span>
											</Button>

										</div>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>

							<div style={{
								// display: 'flex',
								justifyContent: 'space-between',
								marginBottom: '1rem'
							}}>
								<div>
									<img
										src={
											company_profile &&
												company_profile.companyLogoByteArray
												? 'data:image/jpg;base64,' +
												company_profile.companyLogoByteArray
												: logo
										}
										className=""
										alt=""
										style={{ width: ' 150px' }}></img>


								</div>
								<div style={{ textAlign: 'center' }} >

									<h2>
										{company_profile &&
											company_profile['companyName']
											? company_profile['companyName']
											: 'ABC GROUP'}
									</h2>

									<b style={{ fontSize: '18px' }}>{this.props.location.state.description}</b>
									<br />
									From {this.props.location.state.startDate.replaceAll("/","-")}&nbsp;
									To {this.props.location.state.endDate.replaceAll("/","-")}
						       	</div>
                            </div>
                         <div className="ag-theme-alpine mb-3" style={{ height: 600, width: "100%" }}>
								
<div style={{display: 'flex', flexDirection: 'column', height: '100%'}} className="ag-theme-alpine">
                <div style={{flex: '1 1 auto'}}>
                 
							<AgGridReact
			rowData={
				dataList
					? dataList
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

			<AgGridColumn field="date"
				headerName="Date"
				sortable={true}
				filter={true}
				// checkboxSelection={true}
				enablePivot={true}
				cellRendererFramework={(params) =>
					<>
						{/* {this.renderTaxReturns(params.value, params)} */}
						{this.renderDate(params.value, params)}
					</>
				}
			></AgGridColumn>

			<AgGridColumn field="entry"
				headerName="Entry #"
				sortable={true}
				filter={true}
				enablePivot={true}
				cellRendererFramework={(params) =>
					<>
						<p  style={{ color: 'blue' }}	onClick={() => {
							if(params.data.entry.includes("SUP")){
								this.getInvoice("INVOICE",1,params.data.id)
							}else if(params.data.entry.includes("INV")){
								this.getInvoice("INVOICE",2,params.data.id)
							}
							else{
								this.getInvoice("EXPENSE",0,params.data.id)
							}
						}}>
						{params.value}</p>
					</>
				}
				
			></AgGridColumn>

			{/* <AgGridColumn field="transactionType"
				headerName="Transaction Type"
				sortable={true}
				filter={true}
				enablePivot={true}
			
			></AgGridColumn> */}

			<AgGridColumn field="amount"

				headerName="Amount"
				sortable={true}
				enablePivot={true}
				filter={true}
				cellRendererFramework={(params) =>
					<>
						{this.renderAmount(params.value, params)}
					</>
				}

			></AgGridColumn>
			<AgGridColumn field="vatAmount"
				headerName="Vat Amount"
				sortable={true}
				enablePivot={true}
				filter={true}
				cellRendererFramework={(params) =>
					<>
						{this.renderAmount(params.value, params)}
					</>
				}

			></AgGridColumn>

		</AgGridReact>
  
                </div>

              
            </div>
		
								<div className="example-header mt-1">
									Page Size:
									<select onChange={() => this.onPageSizeChanged()} id="page-size">
										<option value="10" selected={true}>10</option>
										<option value="100">100</option>
										<option value="500">500</option>
										<option value="1000">1000</option>
									</select>
								</div>
							</div>
						</CardBody>
					</Card>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SubReports);

