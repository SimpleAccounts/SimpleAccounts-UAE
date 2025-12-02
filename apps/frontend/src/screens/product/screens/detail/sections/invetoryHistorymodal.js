import React from 'react';
import { connect } from 'react-redux';
import logo from 'assets/images/brand/logo.png';
import {
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	Modal,
	CardHeader,
	ModalBody,
	ModalFooter,
	ButtonGroup,
	UncontrolledTooltip,
	CardBody,
	Table,
	Card,
} from 'reactstrap';
import { toInteger, upperCase, upperFirst } from 'lodash';
import { Formik, Field } from 'formik';
import Select from 'react-select';
import * as Yup from 'yup';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';
import { selectOptionsFactory } from 'utils';
import DatePicker from 'react-datepicker';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';

import { toast } from 'react-toastify';
import { data } from '../../../../Language/index'
import LocalizedStrings from 'react-localization';

import '../style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import ReactToPrint from 'react-to-print';
import { Currency } from 'components';



const mapStateToProps = (state) => {

	return {

		contact_list: state.request_for_quotation.contact_list,

	};

};


const mapDispatchToProps = (dispatch) => {
	return {

	};
};
const customStyles = {
	control: (base, state) => ({
		...base,
		borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
		boxShadow: state.isFocused ? null : null,
		'&:hover': {
			borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
		},
	}),
};

let strings = new LocalizedStrings(data);
class InventoryHistoryModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,

		};



	}



	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.inventory_history_list !== nextProps.inventory_history_list) {
			console.log('getDerivedStateFromProps state changed', nextProps.inventory_history_list);
			return {
			
				inventory_history_list:nextProps.inventory_history_list,
			

			};
		}
		// else if(prevState.totalAmount !== nextProps.totalAmount)
		// {
		// 	console.log('+++++++++++++++++',nextProps.totalAmount)
		// 	return { prefixData : nextProps.prefixData,
		// 		totalAmount :nextProps.totalAmount };
		// }
		// else if(prevState.totalVatAmount != nextProps.totalVatAmount)
		// {
		// 	console.log('---------',nextProps.totalVatAmount)
		// 	return{
		// 		prefixData : nextProps.prefixData,
		// 		totalVatAmount :nextProps.totalVatAmount
		// 	};
		// }
	}


	// Create

	renderUnitCost  = (cell, row, extraData) => {
	return row.unitCost ? (  <Currency value={row.unitCost ?row.unitCost:0} 
										currencySymbol={
											this.props.universal_currency_list&&
										this.props.universal_currency_list[0] && this.props.universal_currency_list[0].currencyIsoCode
											? this.props.universal_currency_list[0].currencyIsoCode
											: 'AED'
										}/> )
	                    :"";

		};
		renderunitSellingPrice  = (cell, row, extraData) => {
	return row.unitSellingPrice ? (  <Currency value={row.unitSellingPrice ?row.unitSellingPrice:0} 
										currencySymbol={
											this.props.universal_currency_list&&
										this.props.universal_currency_list[0] && this.props.universal_currency_list[0].currencyIsoCode
											? this.props.universal_currency_list[0].currencyIsoCode
											: 'AED'
										}/> )
	                    :"";

		};
	displayMsg = (err) => {
		toast.error(`${err.data}`, {
			position: toast.POSITION.TOP_RIGHT,
		});
	};
	_showDetails = (bool) => {
		this.setState({
			showDetails: bool
		});
	}
	renderDate = (cell, rows) => {
		return moment(rows.date).format('DD/MM/YYYY');
	};
	exportPDFWithComponent = () => {
		this.pdfExportComponent.save();
	};

	render() {
		strings.setLanguage(this.state.language);
		const { openModal, closeModal, id,inventory_history_list} = this.props;
		const { initValue, contentState, data, supplierId } = this.state;

		let tmpSupplier_list = []
console.log(inventory_history_list,"inventory_history_list")

		return (
			<div className="contact-modal-screen">
				<Modal isOpen={openModal} className="modal-success contact-modal">
					<ModalBody style={{padding: "15px 0px 0px 0px"}}>
						<div className="view-invoice-screen" style={{padding:" 0px 1px"}}>
							<div className="animated fadeIn">
								<Row>
									<Col lg={12} className="mx-auto">
										<div className="pull-right mb-1" style={{ display: "inline-flex" ,marginRight:"20px"}}>

											{/* <Button
												className="mr-2 print-btn-cont"
												onClick={() => {
													this.exportPDFWithComponent();
												}}
											>
												<i className="fa fa-file-pdf-o"></i>
											</Button>
								
											<div
												className="mr-2 print-btn-cont"
												onClick={() => window.print()}
												style={{
													cursor: 'pointer',
												}}
											>
												<i className="fa fa-print"></i>
											</div> */}
											<Button
												type="button"
												className=" print-btn-cont"
												style={{ color: "black" }}
												onClick={() => {
													closeModal(false);
												}}
											>
												X
										</Button>
										</div>
										<div>
											<PDFExport
												ref={(component) => (this.pdfExportComponent = component)}
												scale={0.8}
												paperSize="A4"

											>
											<CardHeader>
										<Row>
											<Col lg={12}>
												<div className="h4 mb-0 d-flex align-items-center">
													<i className="fa fa-history fa-2x" />
													<span className="ml-2">{strings.InventoryHistory}</span>
												</div>
											</Col>
										</Row>

									</CardHeader>
												<CardBody  id="section-to-print" style={{}}>
										
												<PDFExport
									ref={(component) => (this.pdfExportComponent = component)}
									scale={0.8}
									paperSize="A4"
								>	<div>
								<Form onSubmit={this.handleSubmit} name="simpleForm">
							<div className="flex-wrap d-flex justify-content-end">
								<FormGroup>
									<ButtonGroup className="mr-3">
										<Button
											color="primary"
											className="btn-square"
											onClick={() => this.table.handleExportCSV()}
										>
											<i className="fa glyphicon glyphicon-export fa-download mr-1" />
											{strings.Export}
										</Button>
									</ButtonGroup>
								</FormGroup>
								</div>
								</Form>
									</div>

												{inventory_history_list &&
                                                        inventory_history_list.length > 0 ? (
                                                            inventory_history_list.map(
                                                            (item, index) => {
																if(index==0){
                                                            return(
                                                                      <table ><tr
																	  style={{ background: '#f7f7f7' }}
																	  key={index}
																  >
																	  <td colSpan="9">
																		  <b style={{ fontWeight: '600' }}>
																			  {console.log(Object.values(item['productCode']),"itemsss")}
																			  <div><h5> {strings.ProductCode} :  </h5></div>
																		  </b>
																	  </td>
																	  <td colSpan="9">
																		  <b style={{ fontWeight: '600' }}>
																			  {console.log(Object.values(item['productCode']),"itemsss")}
																			  <div><h5>{Object.values(item['productCode'])} </h5></div>
																		  </b>
																	  </td>
																  </tr> 
																  <tr
																	  style={{ background: '#f7f7f7' }}
																	  key={index}
																  >  <td colSpan="9">
																  <b style={{ fontWeight: '600' }}>
																  <div><h5>{strings.ProductName}:  </h5></div>
																	  {console.log(Object.values(item['productname']),"productname")}
																  </b>
															  </td>
															  <td colSpan="9">
																  <b style={{ fontWeight: '600' }}>
																  <div><h5>{Object.values(item['productname'])} </h5></div>
																	  {console.log(Object.values(item['productname']),"productname")}
																  </b>
															  </td></tr></table>  )
															  }
															  ;})):" "}
															 
															  <br></br>
															  <br></br>
										<div>
											<BootstrapTable
												selectRow={this.selectRowProp}
												search={false}
												options={this.options}
												data={
													inventory_history_list 
														? inventory_history_list
														: []
												}
												version="4"
												hover			
												remote	
												className="product-table"
												trClassName="cursor-pointer"	
												ref={(node) => (this.table = node)}
											>
											    {/* <TableHeaderColumn dataField="productCode" dataSort className="table-header-bg">
												Product Code
												</TableHeaderColumn>
												<TableHeaderColumn isKey dataField="productname" dataSort className="table-header-bg">
												Product	Name
												</TableHeaderColumn > */}
												<TableHeaderColumn width="18%" isKey  dataField="supplierName" dataSort className="table-header-bg">
												{strings.Supplier} / {strings.Customer}
												</TableHeaderColumn >
												<TableHeaderColumn width="10%" dataField="date" 
												dataSort 
												dataFormat={this.renderDate} className="table-header-bg">
												 {strings.Date}
												</TableHeaderColumn >
												<TableHeaderColumn  dataField="transactionType" dataSort className="table-header-bg">
												{strings.TransactionType}
												</TableHeaderColumn >
												<TableHeaderColumn width="15%" dataField="invoiceNumber" dataSort className="table-header-bg">
												 {strings.InvoiceNumber}
												</TableHeaderColumn >
												<TableHeaderColumn dataAlign="center" dataField="quantitySold" dataSort className="table-header-bg">
												Quantity Sold
												</TableHeaderColumn >
												{/* <TableHeaderColumn  dataField="stockOnHand" dataSort className="table-header-bg">
											Stock In Hand
												</TableHeaderColumn > */}
												<TableHeaderColumn width="10%" dataAlign="right" dataField="unitCost" dataFormat={this.renderUnitCost} dataSort className="table-header-bg">
												 {strings.UnitCost} 
												</TableHeaderColumn >
												<TableHeaderColumn  dataAlign="right" dataField="unitSellingPrice" dataFormat={this.renderunitSellingPrice} dataSort className="table-header-bg">
												 {strings.UnitSellingPrice}
												</TableHeaderColumn >
											</BootstrapTable>
										</div>	


										</PDFExport>


												</CardBody>
											
											</PDFExport>
										</div>
									</Col>
								</Row>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							color="secondary"
							className="btn-square"
							onClick={() => {
								closeModal(false);
							}}
						>
							<i className="fa fa-ban"></i> {strings.Cancel}
						</Button>
					</ModalFooter>
				</Modal>

			</div>
		);
	}
}


export default connect(
	mapStateToProps
)(InventoryHistoryModal);