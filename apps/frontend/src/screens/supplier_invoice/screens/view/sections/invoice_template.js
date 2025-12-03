import React, { Component } from 'react';
import { Card, CardBody, Table } from 'reactstrap';
import moment from 'moment';
import '../style.scss';
import logo from 'assets/images/brand/logo.png';
import { data } from '../../../../Language/index'
import LocalizedStrings from 'react-localization';
import { TextField } from '@material-ui/core';

const { ToWords } = require('to-words');
const ZERO = 0.00
const toWords = new ToWords({
	localeCode: 'en-IN',
	converterOptions: {
		//   currency: true,
		ignoreDecimal: false,
		ignoreZeroCurrency: false,
		doNotAddOnly: false,
	}
});
let strings = new LocalizedStrings(data);
const footer = require('assets/images/invoice/invoiceFooter.png');
class InvoiceTemplate extends Component {
	constructor(props) {
		super(props);
		this.state = { language: window['localStorage'].getItem('language'), };
		this.termList = [
			{ label: 'Net 7 Days', value: 'NET_7' },
			{ label: 'Net 10 Days', value: 'NET_10' },
			{ label: 'Net 15 Days', value: 'NET_15' },
			{ label: 'Net 30 Days', value: 'NET_30' },
			{ label: 'Net 45 Days', value: 'NET_45' },
			{ label: 'Net 60 Days', value: 'NET_60' },
			{ label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
		];
	}


	renderInvoiceStatus = (status) => {
		let classname = '';
		if (status === 'Paid') {
			classname = 'label-success';
		} else if (status === 'Draft') {
			classname = 'label-currency';
		} else if (status === 'Partially Paid') {
			classname = 'label-PartiallyPaid';
		} else if (status === 'Due Today') {
			classname = 'label-due';
		} else {
			classname = 'label-overdue';
		}
		return (
			<span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
				{status}
			</span>
		);
	};

	getTerms = (term) => {

		let val = this.termList &&
			this.termList.find(
				(option) =>
					option.value === term,
			)
		return val && val.label ? val.label : ''
	}
	companyMobileNumber = (number) => {

		let number1 = number.split(",")

		if (number1.length != 0)
			number1 = number1[0];
		return number1
	}

	renderExcise = (item) => {
		if (item.exciseTaxId && item.exciseTaxId == 1) {
			return '50 %'
		}
		else
			if (item.exciseTaxId && item.exciseTaxId == 2) {
				return '100 %'
			}
	}

	render() {
		strings.setLanguage(this.state.language);
		const { invoiceData, currencyData, totalNet, companyData, status, contactData } = this.props;
		return (
			<div>
				<Card id="singlePage" className="box">
					{/* <div
						className={`ribbon ribbon-top-left ${this.getRibbonColor(
							invoiceData,
						)}`}
					>
						<span>{invoiceData.status}</span>
					</div> */}

					<CardBody style={{ margin: '1rem', border: 'solid 1px', borderColor: '#c8ced3', }}>
						<div
							style={{
								width: '100%',
								display: 'flex',
								// border:'1px solid',
								// padding:'7px',borderColor:'#c8ced3',
							}}
						>
							<div style={{ width: '50%', marginTop: '4.5rem', marginLeft: '3rem' }}>
								<div className="companyDetails">
									<img
										src={
											companyData &&
												companyData.companyLogoByteArray
												? 'data:image/jpg;base64,' +
												companyData.companyLogoByteArray
												: logo
										}
										className=""
										alt=""
										style={{ width: '300px' }}
									/>
								</div>

								{/* <h3 style={{ fontWeight: '600' }} className="mb-0">
										{companyData && companyData.company
											? companyData.company.companyName
											: ''}
									</h3> */}
								{/* <h6 className="mb-0">
										<span>
											{companyData &&
												companyData.company &&
												companyData.company.invoicingAddressLine1 &&
												`${companyData.company.invoicingAddressLine1},`}
										</span>
										<br />
										<span>
											{companyData &&
												companyData.company &&
												companyData.company.invoicingAddressLine2 &&
												`${companyData.company.invoicingAddressLine2},`}
										</span>
										<span>
											{companyData &&
												companyData.company &&
												companyData.company.invoicingAddressLine3 &&
												`${companyData.company.invoicingAddressLine3}.`}
										</span>
									</h6>
									<h6>
										{companyData &&
										companyData.company &&
										companyData.company.companyCountryCode
											? companyData.company.companyCountryCode
													.countryDescription
											: ''}
									</h6> */}
							</div>

							{/* <div style={{ width: '200%',justifyContent:'center', marginTop:'2rem' }}>
								<table>
									<tbody>
									<tr style={{
										width: '100%',
										margin:'0.5rem',
										marginTop:'2.5rem',
										marginLeft:'6rem',
										display:'flex',
										textAlign:'center',
										justifyContent:'center'
									}}>
												<td
													style={{
														width: '100%',
														fontSize: '1.5rem',
														fontWeight: '700',
														textTransform: 'uppercase',
														color: 'black',
													}}
												>
													{strings.SupplierInvoice}
												</td>
											</tr>
									</tbody>
								</table>
							</div> */}
							<div
								style={{
									width: '70%',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'right',
								}}
							>
								{/* <div style={{ width: '70%' }}></div> */}
								{/* <div 	style={{
									alignContent:'left',
									justifyContent: 'right',
								}}> */}
								{/* <Table className="table-clear mr-3 ">
									<tbody>
										<tr  style={{ textAlign: 'left' }}><h4>
											
										{companyData && companyData.company
											? companyData.company.companyName
											: ''}
								</h4></tr>
										<tr style={{ textAlign: 'left' }}>
											<td style={{ width: '75%' }} className="p-0">
												# {invoiceData.referenceNumber}
											</td>
										</tr>
										<tr style={{ textAlign: 'left', }}>
											<td style={{ width: '75%' }} className="p-0">
												{' '}
												Balance Due
											
												<b
													style={{
														fontWeight: '600',
													}}
												>
													<span
														style={{
															unicodeBidi: 'embed',
															paddingRight: '5px',
														}}
													></span>
													{invoiceData.dueAmount ? (
														<Currency
															value={invoiceData.dueAmount}
															currencySymbol={
																currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'USD'
															}
														/>
													) : (
														<Currency
															value={0}
															currencySymbol={
																currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'USD'
															}
														/>
													)}
												</b>
											</td>
										</tr>
									</tbody>
								</Table> */}

								<div style={{
									width: '97%',
									textAlign: 'right',

								}}>
									<div style={{ marginTop: '0.5rem' }}>
										<h2 className="mb-1 ml-2"><b>{strings.SupplierInvoice}</b></h2><br />
										<div className="mb-1 ml-2" style={{ fontSize: "22px" }}><b>{companyData.companyName}</b></div>
										<div className="mb-1 ml-2">{companyData.companyAddressLine1}</div>
										<div className="mb-1 ml-2">{companyData.companyAddressLine2}</div>
										{companyData.companyCountryCode == 229 ? strings.POBox : ""}: {companyData.companyPoBoxNumber},&nbsp;
										{companyData && (companyData.companyStateName ? companyData.companyStateName + ", " : "")}
										{companyData && (companyData.companyCountryName ? companyData.companyCountryName : "")}
										{companyData.companyRegistrationNumber && (<div className="mb-1 ml-2">{strings.CompanyRegistrationNo}: {companyData.companyRegistrationNumber}</div>)}
										{companyData.isRegisteredVat == true && (<div className="mb-1 ml-2">{strings.VATRegistrationNo}: {companyData.vatRegistrationNumber}</div>)}
										<div className="mb-1 ml-2">{strings.MobileNumber}: {this.companyMobileNumber(companyData.phoneNumber ? "+" + companyData.phoneNumber : '')}</div>
										{companyData.emailAddress && (<div className="mb-1 ml-2">{strings.Email}: {companyData.emailAddress}</div>)}
									</div></div></div></div>
						<hr />
						<div
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
								marginBottom: '1rem',

							}}
						>
							<div
								style={{
									width: '100%',
									display: 'flex',
									justifyContent: 'space-between',
									marginLeft: '2rem'
								}}
							>
								<div>
									<br />

									<h6 className="mb-1 ml-2"><b>{strings.BillFrom},</b></h6><br />
									<div className="mb-1 ml-2"><b>{invoiceData.organisationName ? invoiceData.organisationName : invoiceData.name}</b></div>
									{contactData && contactData.addressLine1 && (<div className="mb-1 ml-2">{contactData.addressLine1}</div>)}
									<div className="mb-1 ml-2">
										{invoiceData && contactData && (
											contactData.countryId == 229 ?
												contactData.poBoxNumber ? (strings.POBox + ": " + contactData.poBoxNumber) : ""
												: contactData.postZipCode ? contactData.postZipCode : ""
										)},&nbsp;
										{invoiceData && contactData && (contactData.billingStateName ? contactData.billingStateName + ", " : "")}
										{invoiceData && contactData && (contactData.billingCountryName ? contactData.billingCountryName : "")}
									</div>{invoiceData && invoiceData.taxTreatment && invoiceData.taxTreatment.includes("NON") == false && (<div className="mb-1 ml-2">{strings.VATRegistrationNo}: {invoiceData.taxRegistrationNo}</div>)}
									{contactData && contactData.mobileNumber && (<div className="mb-1 ml-2">{strings.MobileNumber}: +{contactData.mobileNumber}</div>)}
									{contactData && contactData.billingEmail && (<div className="mb-1 ml-2">{strings.Email}: {contactData.billingEmail}</div>)}
									{/* <span className="mb-1 ml-2"><b>{strings.Status } : </b>  {this.renderInvoiceStatus(invoiceData.status)}</span>
								<div className="mb-1 ml-2"><b>{strings.BalanceDue } : {invoiceData.dueAmount ? (
														<Currency
															value={invoiceData.dueAmount}
															currencySymbol={
																currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'USD'
															}
														/>
													) : (
														<Currency
															value={0}
															currencySymbol={
																currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'USD'
															}
														/>
													)}</b></div>
								</div> */}
								</div>

								<div style={{ width: '27%' }}>

									<br />
									<div className="mb-1 ml-2"><b>{strings.InvoiceNo}: </b> # {invoiceData.referenceNumber}</div>
									{invoiceData.receiptNumber && (<div className="mb-1 ml-2"><b>{strings.ReferenceNo}: </b>{invoiceData.receiptNumber}</div>)}
									<div className="mb-1 ml-2"><b>
										{strings.InvoiceDate}: </b>	{' '}
										{moment(invoiceData.invoiceDate).format('DD-MM-YYYY')}
									</div>
									<div className="mb-1 ml-2"><b>{strings.DueDate}: </b>	{moment(invoiceData.invoiceDueDate).format('DD-MM-YYYY')}
									</div>
									<div className="mb-1 ml-2"><b>{strings.Terms}: </b>{this.getTerms(invoiceData.term)}
									</div>
									<div className="mb-1 ml-2"><b>{strings.Status}: </b>{this.renderInvoiceStatus(invoiceData.status)}
									</div><br />
									<div className="mb-1 ml-2" >

										<strong style={{ padding: '0.5rem', background: '#f2f2f2' }}>{strings.BalanceDue}:  {invoiceData.dueAmount ?

											invoiceData.currencyIsoCode + " " + invoiceData.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :

											invoiceData.currencyIsoCode + " " + ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

										</strong></div>
									<div className="mb-1 ml-2 mt-1 w-100" >
										{(invoiceData.exchangeRate && invoiceData.exchangeRate !== 1) && <strong style={{ padding: '0.5rem', background: '#f2f2f2' }}>Exchange Rate: {invoiceData.exchangeRate}

										</strong>}
									</div>
								</div></div></div>
						<Table className='table-striped' >
							<thead className="header-row" style={{ fontSize: "12px" }}>
								<tr>
									<th className="center" style={{ padding: '0.5rem', width: "40px" }}>
										#
									</th>
									{/* <th style={{ padding: '0.5rem' }}>Item</th> */}
									<th style={{ padding: '0.5rem' }}>{strings.ProductNameAndDescription}</th>
									<th className="text-center" style={{ padding: '0.5rem' }}>
										{strings.Quantity}
									</th>
									<th className="text-center" style={{ padding: '0.5rem' }}>
										{strings.UnitType}
									</th>
									<th style={{ padding: '0.5rem', textAlign: 'right' }}>
										{strings.UnitCost}
									</th>
									<>
										<th style={{ padding: '0.5rem', textAlign: 'right' }}>
											{invoiceData.discount && invoiceData.discount > 0 ?
												strings.Discount
												: ''}
										</th>
										{/* <th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.DiscountType}</th> */}
									</>
									<>

										{/* <th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.Excise}</th> */}
										<th style={{ padding: '0.5rem', textAlign: 'right', width: "10%" }}>
											{invoiceData.totalExciseAmount && invoiceData.totalExciseAmount > 0 ?
												strings.Excise : ''}
										</th>									</>
									<>

										{/* <th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.Excise}</th> */}
										<th style={{ padding: '0.5rem', textAlign: 'right', width: "10%" }}>
											{invoiceData.totalExciseAmount && invoiceData.totalExciseAmount > 0 ?
												strings.ExciseAmount : ''}
										</th>									</>
									{/* <th style={{ padding: '0.5rem', textAlign: 'right' ,width:"5%" }}>{strings.VAT}</th> */}
									<th style={{ padding: '0.5rem', textAlign: 'right' }}>
										{invoiceData.totalVatAmount && invoiceData.totalVatAmount > 0 ?
											strings.VatAmount
											: ''}
									</th>
									<th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.SubTotal}</th>
								</tr>
							</thead>
							<tbody className="table-hover">
								{invoiceData.invoiceLineItems &&
									invoiceData.invoiceLineItems.length &&
									invoiceData.invoiceLineItems.map((item, index) => {
										return (
											<tr key={index}>
												<td className="center">{index + 1}</td>
												<td style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
													<b>{item.productName}</b><br /><br />{item.description}
												</td>
												<td style={{ textAlign: 'center' }}>{item.quantity}<br /><br />

												</td>
												<td style={{ textAlign: 'center' }}>{item.unitType}<br /><br />

												</td>
												<td style={{ textAlign: 'right', width: '10%' }}>
													{invoiceData.currencyIsoCode + " " + item.unitPrice.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
												</td>

												<td style={{ textAlign: 'right' }}>
													{item.discount && item.discount > 0 ?
														(item.discountType == "PERCENTAGE" ? item.discount + "  %" :
															(currencyData[0]
																? currencyData[0].currencyIsoCode + " " + item.discount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
																: 'AED' + " " + item.discount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
														)
														: null}
												</td>


												{/* <td style={{ textAlign: 'right' }}>{item.exciseTaxId ? this.renderExcise(item) : "-"}</td> */}
												<td style={{ textAlign: 'right' }}>
													{item.exciseAmount && item.exciseAmount > 0 ? <>
														{item.exciseTaxId ? this.renderExcise(item) : "--"}
													</> : null}
												</td>


												{/* <td style={{ textAlign: 'right' }}>{item.exciseTaxId ? this.renderExcise(item) : "-"}</td> */}
												<td style={{ textAlign: 'right' }}>
													{item.exciseAmount && item.exciseAmount > 0 ? <>
														{invoiceData.currencyIsoCode + " " + item.exciseAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
													</> : null}
												</td>

												{/* <td
													style={{ textAlign: 'right' }}
												>{`${item.vatPercentage}%`}</td> */}
												<td style={{ textAlign: 'right' }}>
													{item.vatAmount && item.vatAmount > 0 ?
														(invoiceData.currencyIsoCode + " " + item.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
														)
														: null}
												</td>
												<td style={{ textAlign: 'right' }}>
													<b>
														{invoiceData.currencyIsoCode + " " + item.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
													</b>
												</td>
											</tr>
										);
									})}
							</tbody>
						</Table><hr />
						<div
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
								// marginBottom: '1rem',border:'solid 1px',borderColor:'#c8ced3',
								fontSize: "14px"
							}}
						>
							<div
								style={{
									width: '40%',
									display: 'flex',
									flexDirection: 'column',
									marginLeft: '2rem'

								}}
							>
								<br />
								<><h6 className="mb-0 pt-2">
									<b>{strings.Notes}:</b>
								</h6><br />
									<textarea
										className="mb-0"
										style={{ width: '500px', height: '200px', border: 'none' }}
										value={invoiceData.notes ? invoiceData.notes : "Business Terms and conditions."}
										readOnly
									/>
								</>


							</div>
							<div
								style={{
									width: '40%',
									display: 'flex',
									justifyContent: 'space-between',
									marginRight: '1rem'

								}}
							>
								<div style={{ width: '100%' }}>
									<Table className="table-clear cal-table">
										<tbody>
											{invoiceData.totalExciseAmount && invoiceData.totalExciseAmount > 0 ? <tr >
												<td style={{ width: '40%' }}>
													<strong>{strings.TotalExcise}</strong>
												</td>
												<td
													style={{
														display: 'flex',
														justifyContent: 'space-between',
													}}
												>
													<span style={{ marginLeft: '2rem' }}></span>
													<span>
														{invoiceData.totalExciseAmount ? invoiceData.currencyIsoCode + " " + invoiceData.totalExciseAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : invoiceData.currencyIsoCode + " " + ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
													</span>
												</td>
											</tr> : ""}

											{/* <tr >
											<td style={{ width: '40%' }}>
												<strong>{strings.SubTotal }</strong>
											</td>
											<td
												style={{
													display: 'flex',
													justifyContent: 'space-between',
												}}
											>
												<span style={{ marginLeft: '2rem' }}></span>
												<span>
													{totalNet ? (
														<Currency
															value={totalNet}
															currencySymbol={
																currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'USD'
															}
														/>
													) : (
														<Currency
															value={0}
															currencySymbol={
																currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'USD'
															}
														/>
													)}
												</span>
											</td>
										</tr> */}
											{invoiceData.discount && invoiceData.discount > 0 ?
												<tr >
													<td style={{ width: '40%' }}>
														<strong>
															{strings.Discount}
															{invoiceData.discountPercentage
																? `(${invoiceData.discountPercentage}%)`
																: ''}
														</strong>
													</td>
													<td
														style={{
															display: 'flex',
															justifyContent: 'space-between',
														}}
													>
														<span style={{ marginLeft: '2rem' }}></span>
														<span>
															{invoiceData.discount ? invoiceData.currencyIsoCode + " " + invoiceData.discount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : invoiceData.currencyIsoCode + " " + ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}

														</span>
													</td>
												</tr> : ""}
											<tr >
												<td style={{ width: '40%' }}><strong>{strings.TotalNet}</strong></td>
												<td style={{ display: 'flex', justifyContent: 'space-between', }}>
													<span style={{ marginLeft: '2rem' }}></span>
													<span>
														{invoiceData.totalAmount ? invoiceData.currencyIsoCode + " " + ((parseFloat(invoiceData.totalAmount) - parseFloat(invoiceData.totalVatAmount)) - parseFloat(invoiceData.totalExciseAmount)).toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : 0}												</span>
												</td>
											</tr>
											{invoiceData.totalVatAmount && invoiceData.totalVatAmount > 0 ?
												<tr >
													<td style={{ width: '40%' }}>
														<strong>{strings.VAT}</strong>
													</td>
													<td
														style={{
															display: 'flex',
															justifyContent: 'space-between',
														}}
													>
														<span style={{ marginLeft: '2rem' }}></span>
														<span>
															{invoiceData.totalVatAmount ? invoiceData.currencyIsoCode + " " + invoiceData.totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : invoiceData.currencyIsoCode + " " + ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
														</span>
													</td>
												</tr> : ""}
											<tr >
												<td style={{ width: '40%' }}>
													<strong>{strings.Total}</strong>
												</td>
												<td
													style={{
														display: 'flex',
														justifyContent: 'space-between',
													}}
												>
													<span style={{ marginLeft: '2rem' }}></span>
													<span>
														{invoiceData.totalAmount ? invoiceData.currencyIsoCode + " " + invoiceData.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : invoiceData.currencyIsoCode + " " + ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
													</span>
												</td>
											</tr>
											<tr style={{ background: '#f2f2f2' }}>
												<td style={{ width: '40%' }}>
													<strong>{strings.BalanceDue}</strong>
												</td>
												<td>
													<b
														style={{
															fontWeight: '600',
															display: 'flex',
															justifyContent: 'space-between',
														}}
													>
														<span style={{ marginLeft: '2rem' }}></span>
														<div className="mb-1 ml-2" >

															<strong style={{ padding: '0.5rem', background: '#f2f2f2' }}>{invoiceData.dueAmount ?

																invoiceData.currencyIsoCode + " " + invoiceData.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :

																invoiceData.currencyIsoCode + " " + ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

															</strong></div>
													</b>
												</td>
											</tr>
											{/* {invoiceData.exchangeRate == 1 ? " ":
										<tr style={{ background: '#f2f2f2' }}>
											<td style={{ width: '40%' }}>
												<strong>Invoice Amount in {" "+invoiceData.baseCurrencyIsoCode}</strong>
											</td>
											<td>
												<b
													style={{
														fontWeight: '600',
														display: 'flex',
														justifyContent: 'space-between',
													}}
												>
													<span style={{ marginLeft: '2rem' }}></span>
													<span>
														{invoiceData.totalAmount ? (
															<Currency
															value={invoiceData.totalAmount * invoiceData.exchangeRate}
																currencySymbol={
																	invoiceData.baseCurrencyIsoCode
																}
															/>
														) : (
															<Currency
																value={0}
																currencySymbol={
																	invoiceData.baseCurrencyIsoCode
																}
															/>
														)}
													</span>
												</b>
											</td>
										</tr>} */}
										</tbody>
									</Table>
								</div>
							</div>
						</div>
						<hr />
						<TextField
							type="textarea"
							disabled
							className="textarea viewFootNote"
							maxLength="250"
							style={{ width: "1100px" }}
							// rows="5"
							value={invoiceData.footNote}
						/>
						<br /><br /><br />
					</CardBody>
					<img className='footer' src={footer} style={{ height: "65px", width: "100%" }}></img>
				</Card>
			</div>
		);
	}
}

export default InvoiceTemplate;
