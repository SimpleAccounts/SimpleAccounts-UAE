import React, { Component } from 'react';
import { Card, CardBody, Table } from 'reactstrap';
import moment from 'moment';
import '../style.scss';
import logo from 'assets/images/brand/logo.png';
import {data}  from '../../../../Language/index'
import LocalizedStrings from 'react-localization';
import { TextareaAutosize } from '@material-ui/core';
import { string } from 'prop-types';

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

	getRibbonColor = (POData) => {
		if (POData.status == 'Draft') {
			return 'pending-color';
		} else if (POData.status == 'Sent') {
			return 'saved-color';
		} else {
			return 'saved-color';
		}
	};

	renderRFQStatus = (status) => {
		let classname = '';
		if (status === 'Approved') {
			classname = 'label-success';
		} else if (status === 'Draft') {
			classname = 'label-draft';
		} else if (status === 'Closed') {
			classname = 'label-closed';
		}else if (status === 'Send') {
			classname = 'label-due';
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

renderVat=(POData)=>{
let TotalVatAmount=0
if(POData && POData.poQuatationLineItemRequestModelList &&POData.poQuatationLineItemRequestModelList.length &&POData.poQuatationLineItemRequestModelList.length!=0)
	{
		POData.poQuatationLineItemRequestModelList.map((row)=>{
			TotalVatAmount=TotalVatAmount+row.vatAmount
		})
	}
	return TotalVatAmount;
}

	render() {
		strings.setLanguage(this.state.language);
		const { POData, currencyData, totalNet, companyData,status,contactData } = this.props;
		console.log(contactData,"contactData")
		return (
			<div>
				<Card id="singlePage" className="box">
					{/* <div
						className={`ribbon ribbon-top-left ${this.getRibbonColor(
							POData,
						)}`}
					>
						<span>{POData.status}</span>
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
											companyData.company &&
											companyData.company.companyLogo
												? 'data:image/jpg;base64,' +
												  companyData.company.companyLogo
												: logo
										}
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
									/></div>
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
									<h2 className="mb-1 ml-2"><b>Purchase Order</b></h2><br />
									<div className="mb-1 ml-2" style={{fontSize:"22px"}}><b>{companyData.companyName}</b></div>
									<div className="mb-1 ml-2">{companyData.companyAddressLine1}</div>
										<div className="mb-1 ml-2">{companyData.companyAddressLine2}</div>
										{companyData.companyCountryCode==229 ? strings.POBox : ""}: {companyData.companyPoBoxNumber},&nbsp;
										{companyData &&(companyData.companyStateName ? companyData.companyStateName + ", " : "")}
										{companyData &&(companyData.companyCountryName ? companyData.companyCountryName : "")}
										{companyData.companyRegistrationNumber && (<div className="mb-1 ml-2">{strings.CompanyRegistrationNo}: {companyData.companyRegistrationNumber}</div>)}
										{companyData.isRegisteredVat==true&&(<div className="mb-1 ml-2">{strings.VATRegistrationNo}: {companyData.vatRegistrationNumber}</div>)}
									<div className="mb-1 ml-2">{strings.MobileNumber}: {this.companyMobileNumber(companyData.phoneNumber?"+"+companyData.phoneNumber:'')}</div>
									{companyData.emailAddress&&(<div className="mb-1 ml-2">Email: {companyData.emailAddress}</div>)}
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
								
								<h6 className="mb-1 ml-2"><b>{strings.PurchaseFrom},</b></h6><br/>
								<div className="mb-1 ml-2"><b>{POData.organisationName ? POData.organisationName : POData.supplierName}</b></div>
								{contactData && contactData.addressLine1 && (<div className="mb-1 ml-2">{contactData.addressLine1}</div>)}

<div className="mb-1 ml-2">
{POData && contactData && (
		contactData.countryId==229 ?
		contactData.poBoxNumber ?(strings.POBox +": " +contactData.poBoxNumber ): ""
		:contactData.postZipCode ? contactData.postZipCode : ""
		)},&nbsp;
	{POData && contactData && (contactData.billingStateName ? contactData.billingStateName + ", " : "")}
	{POData && contactData && (contactData.billingCountryName ? contactData.billingCountryName : "")}
</div>
{POData && POData.taxtreatment&& POData.taxtreatment.includes("NON")==false &&(<div className="mb-1 ml-2">{strings.VATRegistrationNo}: {POData.vatRegistrationNumber}</div>)}
								{contactData&&contactData.mobileNumber&&(<div className="mb-1 ml-2">{strings.MobileNumber}:+{contactData.mobileNumber}</div>)}
								{contactData && contactData.billingEmail && (<div className="mb-1 ml-2">{strings.Email}: {contactData.billingEmail}</div>)}
						
								</div>
								<div style={{ width: '27%' }}>

									<br />
									<div className="mb-1 ml-2"><b>{strings.PONo}: </b> # {POData.poNumber}</div>
									{POData.receiptNumber&&(<div className="mb-1 ml-2"><b>{strings.ReferenceNo}: </b>{POData.receiptNumber}</div>)}
									<div className="mb-1 ml-2"><b>{strings.Approve+" "+strings.Date }: </b>{' '}
										{moment(POData.poApproveDate).format('DD MMM YYYY')}</div>
									<div className="mb-1 ml-2"><b>{strings.ReceiveDate }: </b>
										{moment(POData.poReceiveDate).format('DD MMM YYYY')}</div>
									<div className="mb-1 ml-2"><b>{strings.Status}: </b>{this.renderRFQStatus(status)}</div>

								</div>
							</div>
							</div>
							<Table className='table-striped' >
							<thead className="header-row" style={{ fontSize:"12px" }}>
								<tr>
									<th className="center" style={{ padding: '0.5rem', width:"40px" }}>
										#
									</th>
									{/* <th style={{ padding: '0.5rem' }}>Item</th> */}
									<th style={{ padding: '0.5rem' }}>{strings.ProductNameAndDescription}</th>
									<th className="text-center" style={{ padding: '0.5rem' }}>
										{strings.Quantity }
									</th>
					                <th style={{ padding: '0.5rem', textAlign: 'right' }}>
										{strings.UnitCost }
									</th>
									{POData.discount > 0 && (<>
										<th style={{ padding: '0.5rem', textAlign: 'right' }}>
											{strings.Discount }
										</th>
										{/* <th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.DiscountType}</th> */}
									</>)}
									{/* <th style={{ padding: '0.5rem' }}>{strings.Excise}</th> */}
									{ POData.totalExciseAmount > 0 && (<>
									<th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.ExciseAmount}</th></>)}
									{/* <th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.VAT}</th> */}
									<th style={{ padding: '0.5rem', textAlign: 'right'}}>{strings.VatAmount}</th>
									<th style={{ padding: '0.5rem', textAlign: 'right' }}>
									{strings.Total}
									</th>
								</tr>
							</thead>
							<tbody className=" table-hover">
								{POData.poQuatationLineItemRequestModelList &&
									POData.poQuatationLineItemRequestModelList.length &&
									POData.poQuatationLineItemRequestModelList.map((item, index) => {
										return (
											<tr key={index}>
												<td className="center">{index + 1}</td>
												<td><b>{item.productName}</b><br/><br />{item.description}</td>
												<td  style={{ textAlign: 'center' }}>{item.quantity}<br/><br/>
											     <b style={{fontSize:"10.5px"}}>{item.unitType}</b>	
												</td>
												<td style={{ textAlign: 'right', width: '10%' }}>
												
												{POData.currencyIsoCode + " " +item.unitPrice.toLocaleString(navigator.language, {minimumFractionDigits: 2,maximumFractionDigits: 2})}
												</td>
												{POData.discount > 0 && (<><td style={{ textAlign: 'right' }}>
												{item.discountType == "PERCENTAGE" ? item.discount + "  %" :
													(POData.currencyIsoCode
														? POData.currencyIsoCode +" "+ POData.discount 
														: 'AED'+" "+ POData.discount )
													}
												</td>
												</>)}
												{/* { POData.totalExciseAmount > 0 && (<><td>{item.exciseTaxId ? this.renderExcise(item):"-"}</td></>)} */}
											
												{ POData.totalExciseAmount > 0 && (<>
													{/* <td style={{ textAlign: 'right' }}>{item.exciseTaxId ? this.renderExcise(item) : "-"}</td> */}
													<td style={{ textAlign: 'right' }}>
													{ POData.totalExciseAmount? POData.currencyIsoCode + " " + POData.totalExciseAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 }):POData.currencyIsoCode + " " + ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 })}  
													</td>
												</>)}
												{/* <td
													style={{ textAlign: 'right' }}
												>{`${item.vatPercentage}%`}</td> */}
												<td style={{ textAlign: 'right' }}>
												{POData.currencyIsoCode + " " +item.vatAmount.toLocaleString(navigator.language, {minimumFractionDigits: 2,maximumFractionDigits: 2})}
												</td>
												<td style={{ textAlign: 'right' }}>
													
													{POData.currencyIsoCode + " " +item.subTotal.toLocaleString(navigator.language, {minimumFractionDigits: 2,maximumFractionDigits: 2})}
												</td>
											</tr>
										);
									})}
							</tbody>
						</Table><hr/>
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
								{POData.notes&& (<><h6 className="mb-0 pt-2">
									<b>{strings.TermsAndConditions}:</b>
								</h6><br/>
								<h6 className="mb-0">{POData.notes}</h6>
                                </>)}							

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
									{POData.totalExciseAmount && POData.totalExciseAmount > 0 ? <tr >
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
												{POData.totalExciseAmount? POData.currencyIsoCode + " " +POData.totalExciseAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }):POData.currencyIsoCode + " " +ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}  
												</span>
											</td>
										</tr> : ""}
										{POData.discount && POData.discount > 0 ?
										<tr >
											<td style={{ width: '40%' }}>
												<strong>
													{strings.Discount}
													{POData.discountPercentage
																? `(${POData.discountPercentage}%)`
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
												{POData.discount ? POData.currencyIsoCode + " " +POData.discount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : POData.currencyIsoCode + " " +ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}  
												</span>
											</td>
										</tr> : ""}
										<tr>
											<td style={{ width: '40%' }}>
												<strong>{strings.TotalNet}</strong></td>
											<td style={{ display: 'flex', justifyContent: 'space-between', }}>
												<span style={{ marginLeft: '2rem' }}></span>
												<span>
												{POData.totalAmount? POData.currencyIsoCode + " " + ((parseFloat(POData.totalAmount)-parseFloat(POData.totalVatAmount))-parseFloat(POData.totalExciseAmount)).toLocaleString(navigator.language, { minimumFractionDigits: 2 }):0 } 
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
													{POData ?POData.currencyIsoCode+ " " +this.renderVat(POData).toLocaleString(navigator.language, { minimumFractionDigits: 2 }):POData.currencyIsoCode + " " + ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits:2 }) }
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
													{POData.totalAmount?POData.currencyIsoCode + " " +POData.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }):0}
												</span>
											</td>
										</tr>
									</tbody>
								</Table>
								</div>		
							</div>
						</div>	
						<hr/>	
						<TextareaAutosize
								type="textarea"
								disabled
								className="textarea viewFootNote"
								maxLength="250"
								style={{width: "1100px"}}
								// rows="5"
								value={POData.footNote}
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
