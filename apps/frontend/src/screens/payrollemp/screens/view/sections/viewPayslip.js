import React from 'react';
import { connect } from 'react-redux';
import logo from 'assets/images/brand/datainnLogo.png';
import {
	Button,
	Row,
	Col,
	Modal,
	ModalBody,
	ModalFooter,
	CardBody,
	Table,
} from 'reactstrap';
import { upperCase } from 'lodash';
import { toast } from 'react-toastify';
import { data } from '../../../../Language/index'
import LocalizedStrings from 'react-localization';
import '../style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import moment from 'moment';
import { Currency } from 'components';

const mapStateToProps = (state) => {

	return {

		contact_list: state.request_for_quotation.contact_list,
		company_details: state.common.company_details,

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
const { ToWords } = require('to-words');
const toWords = new ToWords({
	localeCode: 'en-IN',
	converterOptions: {
		//   currency: true,
		ignoreDecimal: false,
		ignoreZeroCurrency: false,
		doNotAddOnly: false,
	}
});
class PaySlipModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
			generateSif: true,

		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.selectedData !== nextProps.selectedData) {
			return {
				prefixData: nextProps.prefixData,
				selectedData: nextProps.selectedData,
				Fixed: nextProps.Fixed,
				FixedAllowance: nextProps.FixedAllowance,
				Deduction: nextProps.Deduction,
				Variable: nextProps.Variable,
				transactionList: nextProps.transactionList
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

	exportPDFWithComponent = () => {
		this.pdfExportComponent.save();
	};

	companyMobileNumber = (number) => {
		let number1 = number.split(",")
		if (number1.length != 0)
			number1 = number1[0];
		return number1
	}

	renderPayperiod = (payPeriod) => {
		let dateArr = payPeriod ? payPeriod.split("-") : [];
		let startDate = dateArr[0] ? dateArr[0].replaceAll('/','-') : ''
		let endDate = dateArr[1] ? dateArr[1].replaceAll('/','-') : ''

		return (<>{startDate} <b> To </b>{endDate}</>);
	};

	render() {
		strings.setLanguage(this.state.language);
		const { openModal, closeModal, id, companyData, empData, bankDetails, salaryDate, currencyData, transactionList } = this.props;
		const { generateSif } = this.props.company_details;
		const {selectedData}=this.state;
		return (
			<div className="contact-modal-screen">
				<Modal isOpen={openModal} className="modal-success contact-modal">
					<ModalBody style={{ padding: "15px 0px 0px 0px" }}>
						<div className="view-invoice-screen" style={{ padding: " 0px 1px" }}>
							<div className="animated fadeIn">
								<Row>
									<Col lg={12} className="mx-auto">
										<div className="pull-right" style={{ display: "inline-flex", marginRight: "2%", marginBottom: "1%" }}>

											<Button
												size='lg'
												className="mr-2 print-btn-cont"
												onClick={() => {
													this.exportPDFWithComponent();
												}}
											>
												<i className="fa fa-file-pdf-o"></i>
											</Button>
											{/* <ReactToPrint
												trigger={() => (
													<Button type="button" className=" print-btn-cont">
														<i className="fa fa-print"></i>
													</Button>
												)}
												content={() => this.componentRef}
											/> */}
											<Button
												size='lg'
												className="mr-2 print-btn-cont"
												onClick={() => window.print()}
												style={{
													cursor: 'pointer',
												}}
											>
												<i className="fa fa-print"></i>
											</Button>
											<Button
												size='lg'
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
										<div className="mt-3">
											<PDFExport
												ref={(component) => (this.pdfExportComponent = component)}
												scale={0.8}
												paperSize="A3"
												fileName={"Payslip of " + salaryDate + ".pdf"}
											>

												<CardBody id="section-to-print" style={{}}>
													<div className="text-center"
														style={{
															width: '100%',
															// display: 'flex',
															border: '1px solid',
															padding: '7px', borderColor: '#c8ced3'
														}}
													>

														<div
															style={{
																width: '100%',
																display: 'flex',
																// border:'1px solid',
																// padding:'7px',borderColor:'#c8ced3'
															}}
														>
															<div style={{ width: '20%', marginTop: '3.5rem' }}>
																<div className="companyDetails"
																	style={{ textAlign: " left" }}
																>
																	<img
																		src={
																			companyData &&
																				companyData.company &&
																				companyData.company.companyLogo
																				? 'data:image/jpg;base64,' +
																				companyData.company.companyLogo
																				: logo
																		}
																		className=""
																		alt=""
																		style={{ width: '200px' }}
																	/>

																</div>

															</div>
															<div
																style={{
																	width: '80%',
																	display: 'flex',
																	flexDirection: 'column',
																	justifyContent: 'left',
																}}
															>
																<div
																	className='mr-1'
																	style={{
																		// width: '97%',
																		textAlign: 'right',

																	}}>
																	<div style={{ marginTop: '0.5rem' }}>
																		<div className="mb-1 ml-2" style={{ fontSize: "1.75rem" }} ><b>	{strings.Payslip}</b> ( {selectedData.salaryMonth + " )"}</div><br />
																		<div className="mb-1 ml-2" style={{ fontSize: "22px" }}><b>{companyData.company.companyName}</b></div>
																		<div className="mb-1 ml-2">{companyData.company.companyAddressLine1}</div>
																		<div className="mb-1 ml-2">{companyData.company.companyAddressLine2}</div>
																		{companyData.company.companyCountryCode.countryCode == 229 ?
																			(strings.POBox + " : ") :
																			""}  {companyData.company.companyPoBoxNumber} ,&nbsp;
																		{companyData && (companyData.company.companyStateCode.stateName ? companyData
																			.company.companyStateCode.stateName + " , " : "")}
																		{companyData && (companyData.company.companyCountryCode.countryName ? companyData.company.companyCountryCode.countryName : "")}
																		{/* {companyData.company.companyRegistrationNumber && (<div className="mb-1 ml-2">{strings.CompanyRegistrationNo} : {companyData.company.companyRegistrationNumber}</div>)}
										{companyData.company.isRegisteredVat==true&&(<div className="mb-1 ml-2">{strings.VATRegistrationNo} : {companyData.company.vatNumber}</div>)}
										<div className="mb-1 ml-2">{strings.MobileNumber} : {this.companyMobileNumber(companyData.company.phoneNumber ? "+" + companyData.company.phoneNumber : '')}</div>
										{companyData.company.emailAddress&&(<div className="mb-1 ml-2">Email : {companyData.company.emailAddress}</div>)} */}
																	</div>


																</div>
															</div>
														</div>


													</div>

													<div
														style={{
															width: '100%',
															display: 'flex',
															justifyContent: 'space-between',
															marginBottom: '1rem',
															borderLeft: '1px solid',
															borderRight: '1px solid',
															borderBottom: '1px solid', borderColor: '#c8ced3'
														}}
													>
														<Col style={{ width: '100%', maxWidth: '50%', border: '1px solid', borderColor: '#c8ced3' }}>
															<div
																style={{
																	width: '95%',
																	margin: '0.5rem',

																}}
															>

																<Row> <Col className='mt-2 mb-2' style={{ fontWeight: "630" }}>{strings.employee_unique_id} </Col><Col className='mt-2 mb-2'>: &nbsp;{empData.employeeCode !== '' ? empData.employeeCode : ('-')}</Col>
																</Row>
																<Row> <Col className='mt-2 mb-2' style={{ fontWeight: "630" }}>{strings.EmployeeName} </Col><Col className='mt-2 mb-2'>: &nbsp;{selectedData.employeename !== '' ? selectedData.employeename : ('-')}</Col></Row>
																<Row> <Col className='mt-2 mb-2' style={{ fontWeight: "630" }}>{strings.Designation} </Col><Col className='mt-2 mb-2'>: &nbsp;{selectedData.designation !== '' ? selectedData.designation : ('-')}</Col></Row>

																{/* <Row> <Col className='mt-2 mb-2'>Personal Email  </Col><Col className='mt-2 mb-2'>: &nbsp;{selectedData.email ? selectedData.email : ('-')}</Col></Row>				 */}

																<Row> <Col className='mt-2 mb-2' style={{ fontWeight: "630" }}>{strings.DateOfJoining}</Col><Col className='mt-2 mb-2'>: &nbsp;{selectedData.dateOfJoining !== '' ? moment(selectedData.dateOfJoining).format("DD-MM-YYYY") : ('-')}</Col>
																</Row>
																<Row> <Col className='mt-2 mb-2' style={{ fontWeight: "630" }}>{strings.PayPeriod} </Col><Col className='mt-2 mb-2'>: &nbsp;{selectedData.payPeriod !== '' ? this.renderPayperiod(selectedData.payPeriod) : ('-')}</Col>
																</Row>
																<Row> <Col className='mt-2 mb-2' style={{ fontWeight: "630" }}>{strings.PayDate} </Col><Col className='mt-2 mb-2'>: &nbsp;{selectedData.payDate !== '' ? moment(selectedData.payDate).format("DD-MM-YYYY") : ('-')}</Col>
																</Row>
																<Row> <Col className='mt-2 mb-2' style={{ fontWeight: "630" }}>{strings.LOPDays} </Col><Col className='mt-2 mb-2'>: &nbsp;{selectedData.lopDays !== '' ? selectedData.lopDays : ('-')}</Col>
																</Row>
															</div>
														</Col>
														{generateSif &&
															<Col style={{ width: '185%', border: '1px solid', borderColor: '#c8ced3' }}>
																<div
																	style={{
																		width: '95%',
																		margin: '0.5rem',

																	}}
																>

																	<Row> <Col className='mt-2 mb-2'>{strings.BankHolderName} </Col><Col className='mt-2 mb-2'>: &nbsp;{bankDetails.accountHolderName ?
																		bankDetails.accountHolderName : ('-')}</Col></Row>


																	<Row> <Col className='mt-2 mb-2'>{strings.AccountNumber} </Col><Col className='mt-2 mb-2'>: &nbsp;{bankDetails.accountNumber ? bankDetails.accountNumber : ('-')}</Col></Row>

																	<Row> <Col className='mt-2 mb-2'>{strings.BankName}</Col><Col className='mt-2 mb-2'>: &nbsp;{bankDetails.bankName ? bankDetails.bankName : ('-')}</Col></Row>

																	<Row> <Col className='mt-2 mb-2'>{strings.Branch}</Col><Col className='mt-2 mb-2'>: &nbsp;{bankDetails.branch ? bankDetails.branch : ('-')}</Col></Row>

																	<Row> <Col className='mt-2 mb-2'>{strings.IBanNumber} </Col><Col className='mt-2 mb-2'>: &nbsp;{bankDetails.iban ? bankDetails.iban : ('-')}</Col></Row>

																</div>
															</Col>}
													</div>
													<div
														style={{
															width: '100%',
															display: "flex",
															border: 'solid 1px', borderColor: '#c8ced3',
															fontSize: "15px",

														}}
													>

														<div className="" style={{ width: "50%" }}>
															<Table >
																<thead className="table-header-bg">
																	<tr>
																		{/* <th className="center" style={{ padding: '0.5rem', width: "40px" }}>																			#									</th> */}
																		{/* <th style={{ padding: '0.5rem' }}>Item</th> */}
																		<th style={{ padding: '0.5rem' }}>{strings.Earnings} </th>
																		<th className="pull-right"style={{ padding: '0.5rem' }}>{strings.Amount}</th>

																	</tr>
																</thead>
																<tbody className=" table-bordered table-hover">
																	{this.state.Fixed &&
																		this.state.Fixed &&
																		this.state.Fixed.map((item, index) => {
																			return (
																				<tr key={index}>
																					{/* <td className="center">{index + 1}</td> */}
																					<td>{item.componentName}</td>
																					<td style={{ textAlign: 'right' }}>

																						{/* {item.componentValue} */}
																						<Currency
																							value={item.componentValue}
																							currencySymbol={
																								'AED'
																							}
																						/>
																					</td>

																				</tr>
																			);
																		})}
																	{this.state.FixedAllowance &&
																		this.state.FixedAllowance &&
																		this.state.FixedAllowance.map((item, index) => {
																			return (
																				<tr key={index}>
																					{/* <td className="center">{index + 1}</td> */}
																					<td>{item.componentName}</td>
																					<td style={{ textAlign: 'right' }}>
																						{/* {item.componentValue} */}
																						<Currency
																							value={item.componentValue}
																							currencySymbol={
																								'AED'
																							}
																						/>
																					</td>

																				</tr>
																			);
																		})}

																	{this.state.Variable &&
																		this.state.Variable &&
																		this.state.Variable.map((item, index) => {
																			return (
																				<tr key={index}>
																					{/* <td className="center">{index + 1}</td> */}
																					<td>{item.componentName}</td>
																					<td style={{ textAlign: 'right' }}>
																						<Currency
																							value={item.componentValue}
																							currencySymbol={
																								'AED'
																							}
																						/></td>

																				</tr>
																			);
																		})}
																</tbody>
																<tfoot className="table-header-bg table-bordered table-hover">
																	<tr>
																		{/* <td></td> */}
																		<td><b>{strings.Gross + " " + strings.Earnings}</b></td>
																		<td style={{ textAlign: 'right' }}>
																			<Currency
																				value={selectedData.earnings}
																				currencySymbol={
																					'AED'
																				}
																			/>
																		</td>
																	</tr>
																</tfoot>
															</Table>
														</div>
														<div className="" style={{ width: "50%" }}>
															<Table  >
																<thead className="table-header-bg">
																	<tr>
																		{/* <th className="center" style={{ padding: '0.5rem', width: "40px" }}>
																			#
									</th> */}
																		{/* <th style={{ padding: '0.5rem' }}>Item</th> */}
																		<th style={{ padding: '0.5rem' }}>{strings.Deductions}</th>
																		<th className="pull-right" style={{ padding: '0.5rem' }}>{strings.Amount}</th>

																	</tr>
																</thead>
																<tbody className=" table-bordered table-hover">
																	{this.state.Deduction &&
																		this.state.Deduction &&
																		this.state.Deduction.map((item, index) => {
																			return (
																				<tr key={index}>
																					{/* <td className="center">{index + 1}</td> */}
																					<td>{item.componentName}</td>
																					<td style={{ textAlign: 'right' }}>
																						<Currency
																							value={item.componentValue}
																							currencySymbol={
																								'AED'
																							}
																						/>
																					</td>

																				</tr>
																			);
																		})}
																</tbody>
																<tfoot className="table-header-bg table-bordered table-hover">
																	<tr>
																		{/* <td></td> */}
																		<td><b>{strings.Total + " " + strings.Deductions}</b></td>
																		<td style={{ textAlign: 'right' }}>
																			<Currency
																				value={selectedData.deductions ? selectedData.deductions : 0}
																				currencySymbol={
																					'AED'
																				}
																			/>
																		</td>
																	</tr>
																</tfoot>
															</Table>

														</div>

													</div>

													<div className="text-center"
														style={{
															width: '100%',

															border: 'solid 1px', borderColor: '#c8ced3',
															fontSize: "12px",
															backgroundColor: "#e4f8ff"
														}}
													>
														<h5> {strings.Salary + " " + strings.Payable + " (A):"} <b>
															<Currency
																value={selectedData.netPay}
																currencySymbol={
																	'AED'
																}
															/>
														</b>
														</h5>
														<h5>
															{/* (	{	upperFirst(converter.toWords(toInteger(selectedData.netPay)))} ) */}
															{/* {selectedData.netPay ? (upperCase((toWords.convert(selectedData.netPay))).replace("POINT","AND")) : " -" } */}
														</h5>
													</div>

													{/* Transaction Table start */}
													<div className='mt-3'>
														<Table >
															<thead className="table-header-bg table-bordered">
																<tr>
																	<th style={{ padding: '0.5rem' }} className='text-center'>#</th>
																	<th style={{ padding: '0.5rem' }} className='text-center'>{strings.TransactionDate}</th>
																	<th style={{ padding: '0.5rem' }} className='text-center'>{strings.TransactionType}</th>
																	<th style={{ padding: '0.5rem' }} className='text-center'>{strings.Category}</th>
																	<th style={{ padding: '0.5rem' }} className='text-center'>{strings.Amount}</th>
																</tr>
															</thead>
															<tbody className=" table-bordered table-hover">
																{this.props.transactionList ? (
																	Object.values(
																		this.props.transactionList
																	).map((item, index) => (
																		item.amount === 0 ? "" :
																			<tr key={index}>
																				<td className='text-center'>{index + 1}</td>
																				<td>{moment(item.transactionDate).format('DD-MM-YYYY')}</td>
																				<td>{item.transactionType}</td>
																				<td>{item.category ? item.category.split('-')[0] : ''}</td>
																				<td className='text-right'><Currency
																					value={item.amount ? item.amount : 0}
																					currencySymbol={
																						'AED'
																					}
																				/></td>
																			</tr>
																	))) : ''}
																<tr>
																	<td className='p-3'></td>
																	<td className='p-3'></td>
																	<td className='p-3'></td>
																	<td className='p-3'></td>
																	<td className='p-3'></td>
																</tr>
																<tr>
																	<td className='table-header-bg text-right' colSpan={4}><b>{strings.Total + ' (B):'}</b></td>
																	<td className='table-header-bg text-right'><b><Currency
																		value={Object.values(this.props.transactionList).reduce(
																			(sum, item) => sum + (item.amount || 0),
																			0
																		)}
																		currencySymbol={
																			'AED'
																		}
																	/></b>
																	</td>
																</tr>
															</tbody>
														</Table>
														<div className="text-center"
															style={{
																width: '100%',

																border: 'solid 1px', borderColor: '#c8ced3',
																fontSize: "12px",
																backgroundColor: "#e4f8ff"
															}}
														>
															<h5> {strings.TotalNet + " " + strings.Payable + " (A+B):"} <b>
																<Currency
																	value={selectedData.netPay + Object.values(this.props.transactionList).reduce(
																		(sum, item) => sum + (item.amount || 0),
																		0
																	)}
																	currencySymbol={
																		'AED'
																	}
																/>
															</b>
															</h5>
															<h5>
																{/* (	{	upperFirst(converter.toWords(toInteger(selectedData.netPay)))} ) */}
																{/* {selectedData.netPay ? (upperCase((toWords.convert(selectedData.netPay))).replace("POINT","AND")) : " -" } */}
															</h5>
														</div>
													</div>
													{/* Transaction Table end */}

												</CardBody>
												<div className="text-center" style={{ color: "#979b9f", margin: "20px" }}>{strings.PayslipNote}</div>
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

)(PaySlipModal);