import React, { Component } from 'react';
import { Card, CardBody, Table } from 'reactstrap';
import moment from 'moment';
import '../style.scss';
import logo from 'assets/images/brand/logo.png';
import {data}  from '../../../../Language/index'
import LocalizedStrings from 'react-localization';
import { TextField } from '@material-ui/core';

const { ToWords } = require('to-words');
const ZERO=0.00
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
class RFQTemplate extends Component {
	constructor(props) {
		super(props);
		this.state = {language: window['localStorage'].getItem('language'),};
	}

	getRibbonColor = (QuotationData) => {
		if (QuotationData.status == 'Draft') {
			return 'pending-color';
		} else if (QuotationData.status == 'Sent') {
			return 'saved-color';
		} else {
			return 'saved-color';
		}
	};

	renderQuotationStatus = (status) => {
		let classname = '';
		if (status === 'Approved') {
			classname = 'label-success';
		} else if (status === 'Draft') {
			classname = 'label-draft';
		} else if (status === 'Closed') {
			classname = 'label-closed';
		}else if (status === 'Sent') {
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
		const { QuotationData, currencyData, totalNet, companyData,contactData } = this.props;
		console.log(contactData,"contactData")
		console.log(QuotationData,"QuotationData")
		console.log(companyData,"companyData")
		return (
			<div>
				<Card id="singlePage" className="box">
					{/* <div
						className={`ribbon ribbon-top-left ${this.getRibbonColor(
							QuotationData,
						)}`}
					>
						<span>{QuotationData.status}</span>
					</div> */}

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
										style={{ width: '300px' }}
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
									<h2 className="mb-1 ml-2"><b>Quotation</b></h2><br />
									<div className="mb-1 ml-2"  style={{fontSize:"22px"}}><b>{companyData.companyName}</b></div>
									<div className="mb-1 ml-2">{companyData.companyAddressLine1}</div>
									<div className="mb-1 ml-2">{companyData.companyAddressLine2}</div>
										{companyData.companyCountryCode==229 ? strings.POBox :""}: {companyData.companyPoBoxNumber},&nbsp;
										{companyData &&(companyData.companyStateName ? companyData.companyStateName + ", " : "")}
										{companyData &&(companyData.companyCountryName ? companyData.companyCountryName : "")}
										{companyData.companyRegistrationNumber && (<div className="mb-1 ml-2">{strings.CompanyRegistrationNo}: {companyData.companyRegistrationNumber}</div>)}
										{companyData.isRegisteredVat==true&&(<div className="mb-1 ml-2">{strings.VATRegistrationNo}: {companyData.vatRegistrationNumber}</div>)}
										<div className="mb-1 ml-2">{strings.MobileNumber}: {this.companyMobileNumber(companyData.phoneNumber ? "+" + companyData.phoneNumber: '')}</div>
										{companyData.emailAddress&&(<div className="mb-1 ml-2">{strings.Email}: {companyData.emailAddress}</div>)}
								</div>
							</div>
							</div>
							</div>
							<hr/>
							
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
								<h6 className="mb-1 ml-2"><b>{strings.Quotation_For}</b></h6><br/>
						<div className="mb-1 ml-2"><b>{QuotationData.organisationName ? QuotationData.organisationName : QuotationData.customerName}</b></div>
						{contactData && contactData.addressLine1 && (<div className="mb-1 ml-2">{contactData.addressLine1}</div>)}
						<div className="mb-1 ml-2">
									{QuotationData && contactData && (
											contactData.countryId==229 ?
											contactData.poBoxNumber ?(strings.POBox +": " +contactData.poBoxNumber ): ""
											:contactData.postZipCode ? contactData.postZipCode : ""
											)},&nbsp;
									    {QuotationData && contactData && (contactData.billingStateName ? contactData.billingStateName + ", " : "")}
										{QuotationData && contactData && (contactData.billingCountryName ? contactData.billingCountryName : "")}
									</div>
								{QuotationData && QuotationData.taxtreatment&& QuotationData.taxtreatment.includes("NON")==false &&(<div className="mb-1 ml-2">{strings.VATRegistrationNo}:  {QuotationData.vatRegistrationNumber}</div>)}	
								{contactData&&contactData.mobileNumber&&(<div className="mb-1 ml-2">{strings.MobileNumber}:+{contactData.mobileNumber}</div>)}
								{contactData && contactData.billingEmail && (<div className="mb-1 ml-2">{strings.Email}: {contactData.billingEmail}</div>)}
													

													{/* <div
														className={`ribbon ${this.getRibbonColor(
															QuotationData,
														)}`}
													>
															<span className="mb-1 ml-2">{QuotationData.status}</span>
														</div>  */}
								</div>
						  
							
							<div style={{ width: '27%' }}>

							<br />
							<div className="mb-1 ml-2"><b>{strings.QuotationNo}:</b> {QuotationData.quotationNumber}</div>
							{QuotationData.receiptNumber&&(<div className="mb-1 ml-2"><b>{strings.ReferenceNo}: </b>{QuotationData.receiptNumber}</div>)}
							<div className="mb-1 ml-2"><b>{strings.Created_Date}: </b>{' '}
								{moment(QuotationData.quotationdate).format('DD-MM-YYYY')}</div>
							<div className="mb-1 ml-2"><b>{strings.ExpirationDate }: </b>
								{moment(QuotationData.quotaionExpiration).format('DD-MM-YYYY')}</div>
							<div className=" ml-2"><b>{strings.Status}: </b>{this.renderQuotationStatus(QuotationData.status)}</div>
							{/* <div className="mb-1 ml-2"><b>{strings.Exchangerate}: </b>{QuotationData.exchangeRate}</div><br /><br/> */}
							</div>
							</div>
							</div>
						
						{/* <div className="text-center"			>
								<h6
								style={{textAlign: 'center'}}
								className={'mt-3 mb-2'}
								>	{strings.ExpirationDate }:{' '}
								{moment(QuotationData.quotaionExpiration).format(
									'DD MMM YYYY',
								)}
								</h6>
								</div> */}
							{/* <div
								style={{
									width: '100%',
									display: 'flex',
									justifyContent: 'space-between',
									height: '50px'
								}}
							>
								<div
								style={{
									width: '50%',
									// display: 'flex',
									justifyContent: 'space-between',
									
								}}>
								<h6
								style={{textAlign: 'center'}}
								className={'mt-3 mb-2'}
								>	<b>{strings.Created_Date} : </b>{' '}
								{moment(QuotationData.createdDate).format(
									'DD MMM YYYY',
								)}
								</h6>
								</div>
								<div
								style={{
									width: '50%',
									// display: 'flex',
									justifyContent: 'space-between',
									
								}}>
								<h6
								style={{textAlign: 'center'}}
								className={'mt-3 mb-2'}
								><b>{strings.ExpirationDate } : </b>{' '}
								{moment(QuotationData.quotaionExpiration).format(
									'DD MMM YYYY',
								)}
								</h6>
								</div>
							</div> */}
						
				
							<Table className='table-striped' >
							<thead className="header-row" style={{ fontSize:"12px" }}>
								<tr>
									<th className="center" style={{ padding: '0.5rem' , width: "40px" }}>
										#
									</th>
									{/* <th style={{ padding: '0.5rem' }}>Item</th> */}
									<th style={{ padding: '0.5rem' }}>{strings.ProductNameAndDescription}</th>
									<th className="text-center" style={{ padding: '0.5rem' }}>{strings.Quantity}</th>
									<th className="text-center" style={{ padding: '0.5rem' }}>
										{strings.UnitType}
									</th>
									<th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.UnitCost}</th>

									<th style={{ padding: '0.5rem', textAlign: 'right' }}>
											{QuotationData.discount && QuotationData.discount > 0 ? 
											strings.Discount
											: '' }
										</th>

									{/* <th style={{ padding: '0.5rem', textAlign: 'right'}}>{strings.DiscountType}</th> */}
									{QuotationData.totalExciseAmount && QuotationData.totalExciseAmount > 0 ? (
										<th style={{ padding: '0.5rem', textAlign: 'right', width: "5%" }}>
											{strings.Excise}
										</th>
									) : null}
									{QuotationData.totalExciseAmount && QuotationData.totalExciseAmount > 0 ? (
										<th style={{ padding: '0.5rem', textAlign: 'right',width:"10%" }}>
											{strings.ExciseAmount}
										</th>
									) : null}

									{/* <th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.VAT}</th> */}
									<th style={{ padding: '0.5rem', textAlign: 'right' }}>
									{companyData.isRegisteredVat === true && QuotationData.totalVatAmount && QuotationData.totalVatAmount > 0 ? 
									strings.VatAmount
									: '' }
									</th>		

									<th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.Total}</th>
								</tr>
							</thead>
							<tbody className="table-hover">
								{QuotationData.poQuatationLineItemRequestModelList &&
									QuotationData.poQuatationLineItemRequestModelList.length &&
									QuotationData.poQuatationLineItemRequestModelList.map((item, index) => {
										return (
											<tr key={index}>
												<td className="center">{index + 1}</td>
												<td style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
													<b>{item.productName}</b><br/><br />{item.description}
												</td>
												<td  style={{ textAlign: 'center' }}>{item.quantity}<br/><br/>
												</td>
												<td  style={{ textAlign: 'center' }}>{item.unitType}<br/><br/>
												</td>
												<td style={{ textAlign: 'right', width: '10%' }}>
												
												{QuotationData.currencyIsoCode + " " +item.unitPrice.toLocaleString(navigator.language, {minimumFractionDigits: 2,maximumFractionDigits: 2})}
												</td>

												<td style={{ textAlign: 'right' }}>
												{item.discount && item.discount > 0 ?
													(item.discountType == "PERCENTAGE" ? item.discount + "  %" :
													(QuotationData.currencyIsoCode
														? QuotationData.currencyIsoCode +" "+ item.discount 
														: 'AED'+" "+ item.discount )
														)
														: null }
												</td>

												{QuotationData && QuotationData.totalExciseAmount > 0  &&
												<td style={{ textAlign: 'right' }}>
													{item?.exciseTaxId ? this.renderExcise(item) : "--"}
												</td>}

												{QuotationData.totalExciseAmount && QuotationData.totalExciseAmount > 0 ? (
												<td style={{ textAlign: 'right' }}>
													{QuotationData.currencyIsoCode + " " +
													item.exciseAmount.toLocaleString(navigator.language, {minimumFractionDigits: 2,maximumFractionDigits: 2})}
													</td>
												) : null }

												{/* <td
													style={{ textAlign: 'right' }}
												>{`${item.vatPercentage}%`}</td> */}

												<td style={{ textAlign: 'right' }}>
												{companyData.isRegisteredVat === true && item.vatAmount && item.vatAmount > 0 ? 
												(QuotationData.currencyIsoCode + " " +item.vatAmount.toLocaleString(navigator.language, {minimumFractionDigits: 2,maximumFractionDigits: 2})
												)
												: null }
												</td>
												
												<td style={{ textAlign: 'right' }}>
													{/* <Currency
														value={item.subTotal}
														currencySymbol={
															currencyData[0]
																? currencyData[0].currencyIsoCode
																: 'AED'
														}
													/> */}
													{QuotationData.currencyIsoCode + " " +item.subTotal.toLocaleString(navigator.language, {minimumFractionDigits: 2,maximumFractionDigits: 2})}
												</td>
											</tr>
										);
									})}
							</tbody>
						</Table><hr/>
						<div className="pl-5"
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
								// marginBottom: '1rem',border:'solid 1px',borderColor:'#c8ced3'
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
								<br/>
								{QuotationData.notes&& (<><h6 className="mb-0 pt-2">
									<b>{strings.TermsAndConditions }:</b>
								</h6><br/>
								<h6 className="mb-0">{QuotationData.notes}</h6>
								</>)}
							</div>
							
					
							<div
								style={{
									width: '40%',
									display: 'flex',
									flexDirection: 'column',
									marginRight: '1rem'
								}}
							>
								<div style={{ width: '100%' }}>
								<Table className="table-clear cal-table">
									<tbody>
									{QuotationData.totalExciseAmount && QuotationData.totalExciseAmount > 0 ? 
									<tr >
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
												{QuotationData.totalExciseAmount ? QuotationData.currencyIsoCode + " " + QuotationData.totalExciseAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }):QuotationData.currencyIsoCode + " " +ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}  
												</span>
											</td>
										</tr> : ""}
										{QuotationData.discount && QuotationData.discount > 0 ?
										<tr >
											<td style={{ width: '40%' }}>
											<strong>
													{strings.Discount }
													{QuotationData.discountPercentage
														? `(${QuotationData.discountPercentage}%)`
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
												{ QuotationData.discount ? QuotationData.currencyIsoCode + " " + QuotationData.discount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : QuotationData.currencyIsoCode + " " + ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2 , })}  
												</span>
											</td>
										</tr> : ""}

										<tr>
											<td style={{ width: '40%' }}><strong>{strings.TotalNet}</strong></td>
											<td style={{ display: 'flex', justifyContent: 'space-between', }}>
													<span style={{ marginLeft: '2rem' }}></span>
													<span>
													{QuotationData.totalAmount ? QuotationData.currencyIsoCode + " " + ((parseFloat(QuotationData.totalAmount)-parseFloat(QuotationData.totalVatAmount))-parseFloat(QuotationData.totalExciseAmount)).toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : 0 } 													</span>
												</td>
										</tr>
										{companyData.isRegisteredVat && companyData.isRegisteredVat === true && QuotationData.totalVatAmount && QuotationData.totalVatAmount > 0 ?
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
													{QuotationData.totalVatAmount?QuotationData.currencyIsoCode+ " " +QuotationData.totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }):QuotationData.currencyIsoCode + " " + ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits:2 }) }
												</span>
											</td>
										</tr> : ""}
										<tr >
											<td style={{ width: '40%' }}>
												<strong>{strings.Total }</strong>
											</td>
											<td
												style={{
													display: 'flex',
													justifyContent: 'space-between',
												}}
											>
												<span style={{ marginLeft: '2rem' }}></span>
												<span>
													{QuotationData.totalAmount?QuotationData.currencyIsoCode + " " +QuotationData.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }):0}
													{/* {POData.totalAmount ? (
														<Currency
															value={POData.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
															currencySymbol={
																currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'AED'
															}
														/>
													) : (
														<Currency
															value={0}
															currencySymbol={
																currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'AED'
															}
														/>
													)} */}
												</span>
											</td>
										</tr>
									</tbody>
								</Table>
								</div>		
							</div>
						</div>
						<hr/>
						<TextField
								type="textarea"
								disabled
								className="textarea viewFootNote"
								maxLength="250"
								style={{width: "1100px"}}
								// rows="5"
								value={QuotationData.footNote}
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
