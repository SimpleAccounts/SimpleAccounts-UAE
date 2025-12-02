import React, { Component } from 'react';
import { Card, CardBody, Table } from 'reactstrap';
import moment from 'moment';
import '../style.scss';
import logo from 'assets/images/brand/logo.png';
import {data}  from '../../../../Language/index'
import LocalizedStrings from 'react-localization';
import { TextareaAutosize } from '@material-ui/core';
const footer = require('assets/images/invoice/invoiceFooter.png');

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
let strings = new LocalizedStrings(data);
const ZERO=0.00
class RFQTemplate extends Component {
	constructor(props) {
		super(props);
		this.state = {language: window['localStorage'].getItem('language'),};
	}
	getRibbonColor = (RFQData) => {
		if (RFQData.status == 'Draft') {
			return 'pending-color';
		} else if (RFQData.status == 'Sent') {
			return 'saved-color';
		} else {
			return 'saved-color';
		}
	};
	renderRFQStatus = (status) => {
		let classname = '';
		if (status === 'Closed') {
			classname = 'label-closed';
		}else if (status === 'Approved') {
				classname = 'label-success';
		} else if (status === 'Draft') {
			classname = 'label-draft';
		} else if (status === 'Sent') {
			classname = 'label-sent';
		}else if (status === 'Invoiced') {
				classname = 'label-primary';
		} else {
			classname = 'label-overdue';
		}
		return (
			<span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
				{status}
			</span>
		);
	};
	
			companyMobileNumber=(number)=>{

					let	number1=	number.split(",")
			
					if(number1.length!=0)
						number1=number1[0];
						return number1
					}
				
					renderExcise=(item)=>{
				    if(item.exciseTaxId && item.exciseTaxId==1)
						{
				          return '50 %'
						}
						else
						if(item.exciseTaxId && item.exciseTaxId==2)
						{
				          return '100 %'
						}
					}
		
	render() {
		strings.setLanguage(this.state.language);
		const { RFQData, currencyData, totalNet, companyData, contactData ,isBillingAndShippingAddressSame} = this.props;
		console.log(contactData,"contactData")
		return (
			<div>
				<Card id="singlePage" className="box">
				<CardBody style={{ margin: '1rem', border: 'solid 1px', borderColor: '#c8ced3', }}>
						<div
							style={{
								width: '100%',
								display: 'flex',
								// border:'1px solid',
								// padding:'7px',borderColor:'#c8ced3'
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
										style={{ width: ' 300px' }}
									/>

								</div>

							</div>
							<div
								style={{
									width: '70%',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'left',
								}}
							>
								<div style={{
									width: '97%',
									textAlign: 'right',

								}}>
									<div style={{ marginTop: '0.5rem' }}>
										<h2 className="mb-1 ml-2"><b>Request For Quotation</b></h2><br />
										<div className="mb-1 ml-2" style={{fontSize:"22px"}}><b>{companyData.companyName}</b></div>
										<div className="mb-1 ml-2">{companyData.companyAddressLine1}</div>
										<div className="mb-1 ml-2">{companyData.companyAddressLine2}</div>
										{companyData.companyCountryCode==229 ? strings.POBox: ""}: {companyData.companyPoBoxNumber},&nbsp;
										{companyData &&(companyData.companyStateName ? companyData.companyStateName + ", " : "")}
										{companyData &&(companyData.companyCountryName ? companyData.companyCountryName : "")}
										{companyData.companyRegistrationNumber && (<div className="mb-1 ml-2">{strings.CompanyRegistrationNo}: {companyData.companyRegistrationNumber}</div>)}
										{companyData.isRegisteredVat==true&&(<div className="mb-1 ml-2">{strings.VATRegistrationNo}: {companyData.vatRegistrationNumber}</div>)}
										<div className="mb-1 ml-2">{strings.MobileNumber}: {this.companyMobileNumber(companyData.phoneNumber ? "+" + companyData.phoneNumber : '')}</div>
										{companyData.emailAddress&&(<div className="mb-1 ml-2">Email: {companyData.emailAddress}</div>)}
									</div>
		

								</div>
							</div>
						</div>

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
									{/* <h4 className="mb-1 ml-2"><b>{companyData && companyData.company
											? companyData.company.companyName
											: ''}</b></h4> */}
									<br />
									<h6 className="mb-1 ml-2"><b>{strings.BillTo},</b></h6><br />
									<div className="mb-1 ml-2"><b>{ RFQData.organisationName ?  RFQData.organisationName: RFQData.supplierName}</b></div>
									{contactData && contactData.addressLine1 && (<div className="mb-1 ml-2">{contactData.addressLine1}</div>)}

									<div className="mb-1 ml-2">
									{RFQData && contactData && (
											contactData.countryId==229 ?
											contactData.poBoxNumber ?(strings.POBox +": " +contactData.poBoxNumber ): ""
											:contactData.postZipCode ? contactData.postZipCode : ""
											)},&nbsp;
									    {RFQData && contactData && (contactData.billingStateName ? contactData.billingStateName + ", " : "")}
										{RFQData && contactData && (contactData.billingCountryName ? contactData.billingCountryName : "")}
									</div>
									{RFQData && RFQData.taxtreatment&& RFQData.taxtreatment.includes("NON")==false &&(<div className="mb-1 ml-2">{strings.VATRegistrationNo}: {companyData.vatRegistrationNumber}</div>)}
									{contactData && contactData.mobileNumber && (<div className="mb-1 ml-2">{strings.MobileNumber}:+{contactData.mobileNumber}</div>)}
									{contactData && contactData.billingEmail && (<div className="mb-1 ml-2">{strings.Email}: {contactData.billingEmail}</div>)}
									{/* <span className="mb-1 ml-2"><b>{strings.Status} : </b> {this.renderInvoiceStatus(RFQData.status)}</span> */}

								</div>
							{/* {this.renderShippingDetails()} */}

								<div style={{ width: '27%' }}>

									<br />
									<div className="mb-1 ml-2"><b>{strings.RFQNUMBER}: </b> # {RFQData.rfqNumber} </div>
									{RFQData.receiptNumber&&(<div className="mb-1 ml-2"><b>{strings.ReferenceNumber}: </b>{RFQData.receiptNumber}</div>)}
									<div className="mb-1 ml-2"><b>{strings.RFQDate}: </b>{' '}
										{moment(RFQData.RFQDATE).format('DD MMM YYYY')}</div>
									<div className="mb-1 ml-2"><b>{strings.ExpiryDate}: </b>
										{moment(RFQData.rfqExpiryDate).format('DD MMM YYYY')}</div>
									<div className="mb-1 ml-2"><b>{strings.Status}: </b>{this.renderRFQStatus(RFQData.status)}</div><br />
										
									<br />
									{/* <div className="mb-1 ml-2" >
										<strong style={{ padding: '0.5rem', background: '#f2f2f2'}}>{strings.BalanceDue} :  {RFQData.dueAmount ? (
										<Currency
											value={RFQData.dueAmount}
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
									)}</strong></div> */}
								</div>
							</div>
						</div>
						<Table className='table-striped' >
							<thead className="header-row" style={{ fontSize:"12px" }}>
								<tr>
									<th className="center" style={{ padding: '0.5rem', width: "40px" }}>
										#
									</th>
									{/* <th style={{ padding: '0.5rem' }}>Item</th> */}
									<th style={{ padding: '0.5rem' }}>{strings.ProductNameAndDescription}</th>
									<th className="text-center" style={{ padding: '0.5rem' }}>
										{strings.Quantity}
									</th>
									
									<th style={{ padding: '0.5rem', textAlign: 'right' }}>
										{strings.UnitCost}
									</th>
									{RFQData.discount > 0 && (<>
										<th style={{ padding: '0.5rem', textAlign: 'right' }}>
											{strings.Discount }
										</th>
										{/* <th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.DiscountType}</th> */}
									</>)}
									{ RFQData.totalExciseAmount > 0 && (<>

										{/* <th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.Excise}</th> */}
										<th style={{ padding: '0.5rem', textAlign: 'right',width:"10%" }}>{strings.ExciseAmount}</th>
									</>)}
									{/* <th style={{ padding: '0.5rem', textAlign: 'right' ,width:"5%" }}>{strings.VAT}</th> */}
									<th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.VatAmount}</th>
									<th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.SubTotal}</th>
								</tr>
							</thead>
							<tbody className=" table-hover">
							{RFQData.poQuatationLineItemRequestModelList &&
									RFQData.poQuatationLineItemRequestModelList.length &&
									RFQData.poQuatationLineItemRequestModelList.map((item, index) => {
										return(
											<tr key={index}>
												<td className="center">{index + 1}</td>
												<td><b>{item.productName}</b><br/><br />{item.description}</td>

												<td  style={{ textAlign: 'center' }}>{item.quantity}<br/><br/>
											     <b style={{fontSize:"10.5px"}}>{item.unitType}</b>	
												</td>
												<td style={{ textAlign: 'right', width: '10%' }}>
												{RFQData.currencyIsoCode + " " +item.unitPrice.toLocaleString(navigator.language, {minimumFractionDigits: 2,maximumFractionDigits: 2})}
												</td>

								
												{RFQData.discount > 0 && (<>	<td style={{ textAlign: 'right' }}>
												{item.discountType == "PERCENTAGE" ? item.discount + "  %" :
													(currencyData[0]
														? currencyData[0].currencyIsoCode +" "+ RFQData.discount 
														: 'AED'+" "+ RFQData.discount )
													}
												</td>

												</>)}
												{ RFQData.totalExciseAmount > 0 && (<>
													<td style={{ textAlign: 'right' }}>
													{	RFQData.currencyIsoCode + " " +item.exciseAmount.toLocaleString(navigator.language, {minimumFractionDigits: 2,maximumFractionDigits: 2})}
													</td>
												</>)}
												<td style={{ textAlign: 'right' }}>
												{	RFQData.currencyIsoCode + " " +item.vatAmount.toLocaleString(navigator.language, {minimumFractionDigits: 2,maximumFractionDigits: 2})}
												</td>
												<td style={{ textAlign: 'right' }}>
												<b>	
												{	RFQData.currencyIsoCode + " " +item.subTotal.toLocaleString(navigator.language, {minimumFractionDigits: 2,maximumFractionDigits: 2})}
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
								{RFQData.notes&& (<><h6 className="mb-0 pt-2">
									<b>{strings.TermsAndConditions}:</b>
								</h6><br/>
								<h6 className="mb-0">{RFQData.notes}</h6>
                                </>)}

							</div>
							<div
								style={{
									width: '20%',
									display: 'flex',
									flexDirection: 'column',
									marginLeft: '2rem'
								}}
							>	
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
											{RFQData.totalExciseAmount && RFQData.totalExciseAmount > 0 ? <tr >
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
													{ RFQData.totalExciseAmount? RFQData.currencyIsoCode + " " +RFQData.totalExciseAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 }):RFQData.currencyIsoCode + " " + ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 })}  
													</span>
												</td>
											</tr> : ""}

											{RFQData.discount && RFQData.discount > 0 ?
												<tr >
													<td style={{ width: '40%' }}>
														<strong>
															{strings.Discount}
															{RFQData.discountPercentage
																? `(${RFQData.discountPercentage}%)`
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

														{ RFQData.discount ? RFQData.currencyIsoCode + " " + RFQData.discount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : RFQData.currencyIsoCode + " " + ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}  
														</span>
													</td>
												</tr> : ""}
											<tr >
												<td style={{ width: '40%' }}><strong>{strings.TotalNet}</strong></td>
												<td style={{ display: 'flex', justifyContent: 'space-between', }}>
													<span style={{ marginLeft: '2rem' }}></span>
													<span>
													{RFQData.totalAmount ? RFQData.currencyIsoCode + " " + ((parseFloat(RFQData.totalAmount)-parseFloat(RFQData.totalVatAmount))-parseFloat(RFQData.totalExciseAmount)).toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : 0 } 
													</span>
												</td>
											</tr>

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
													{RFQData.totalVatAmount ? RFQData.currencyIsoCode + " " + RFQData.totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits:2 }) : RFQData.currencyIsoCode + " " + ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits:2 }) }
													</span>
												</td>
											</tr>

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
													{RFQData.totalAmount ? RFQData.currencyIsoCode + " " + RFQData.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : 0}
													</span>
												</td>
											</tr>
										</tbody>
									</Table>
								</div>
							</div>
						</div>
						{/* <hr />Data Innovation Technologies Limited Dubai company Was founded on August 13,2020 with identification number Avenue - South Zone, Dubai International Financial Center, Dubai, United Arab Emirates.<br /> */}
						<hr />
						{/* {RFQData.footNote} */}
						<TextareaAutosize
								type="textarea"
								disabled
								className="textarea viewFootNote"
								maxLength="250"
								style={{width: "1100px"}}
								// rows="5"
								value={RFQData.footNote}
							/>
						<br /><br/><br/>
						</CardBody>
					<img className='footer' src={footer} style={{ height: "65px", width: "100%" }}></img>
				</Card>
			</div>
			
		);
	}
}

export default RFQTemplate;
