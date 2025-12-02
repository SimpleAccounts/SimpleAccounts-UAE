import React, { Component } from 'react';
import { Card, CardBody, Row, Col, Table } from 'reactstrap';
import moment from 'moment';
import '../style.scss';
import logo from 'assets/images/brand/logo.png';
import {data}  from '../../../../Language/index'
import LocalizedStrings from 'react-localization';
import { TextareaAutosize } from '@material-ui/core';

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
const footer = require('assets/images/invoice/invoiceFooter.png');
class RFQTemplate extends Component {
	constructor(props) {
		super(props);
		this.state = {language: window['localStorage'].getItem('language'),};
	}

	renderRFQStatus = (status) => {
		let classname = '';
		if (status === 'Posted') {
			classname = 'label-posted';
		} else if (status === 'Draft') {
			classname = 'label-draft';
		} else if (status === 'Sent') {
			classname = 'label-sent';
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
getVatNo=(contactData,RFQData)=>{
	if(contactData.taxTreatmentId!=2 &&contactData.taxTreatmentId!=4 && contactData.taxTreatmentId!=6 &&  contactData.taxTreatmentId!=7 )
	return <div className="mb-1 ml-2">{strings.VATRegistrationNo}: {RFQData.vatRegistrationNumber}</div>
	else
	return ""
}
	render() {
		strings.setLanguage(this.state.language);
		const { RFQData, currencyData, totalNet, companyData,status,contactData } = this.props;
		console.log(contactData,"contactData")
		return (
			<div>
				<Card id="singlePage" className="box">
					{/* <div
						className={`ribbon ribbon-top-left ${this.getRibbonColor(
							RFQData,
						)}`}
					>
						<span>{RFQData.status}</span>
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
									<h2 className="mb-1 ml-2"><b>Goods Received Notes</b></h2><br />
									<div className="mb-1 ml-2" style={{fontSize:"22px"}}><b>{companyData.companyName}</b></div>
									<div className="mb-1 ml-2">{companyData.companyAddressLine1}</div>
										<div className="mb-1 ml-2">{companyData.companyAddressLine2}</div>
										{companyData.companyCountryCode==229 ? strings.POBox: ""}: {companyData.companyPoBoxNumber},&nbsp;
										{companyData &&(companyData.companyStateName ? companyData.companyStateName + ", " : "")}
										{companyData &&(companyData.companyCountryName ? companyData.companyCountryName : "")}
										{companyData.companyRegistrationNumber && (<div className="mb-1 ml-2">{strings.CompanyRegistrationNo}: {companyData.companyRegistrationNumber}</div>)}
										{companyData.isRegisteredVat==true&&(<div className="mb-1 ml-2">{strings.VATRegistrationNo}: {companyData.vatRegistrationNumber}</div>)}
							    <div className="mb-1 ml-2">{strings.MobileNumber}: {this.companyMobileNumber(companyData.phoneNumber?"+"+companyData.phoneNumber:'')}</div>
								{companyData.emailAddress&&(<div className="mb-1 ml-2">Email: {companyData.emailAddress}</div>)}
								</div>
							</div>
							</div></div><hr/>
							
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
								
								<h6 className="mb-1 ml-2"><b>{strings.ReceivedFrom},</b></h6><br/>
								<h6 className="mb-1 ml-2"><b>{RFQData.organisationName ? RFQData.organisationName: RFQData.supplierName}</b></h6>
								{contactData && contactData.addressLine1 &&(<div className="mb-1 ml-2">{contactData.addressLine1}</div>)}
								<div className="mb-1 ml-2">
									{RFQData && contactData && (
											contactData.countryId==229 ?
											contactData.poBoxNumber ?(strings.POBox +": " +contactData.poBoxNumber ): ""
											:contactData.postZipCode ? contactData.postZipCode : ""
											)},&nbsp;
									    {RFQData && contactData && (contactData.billingStateName ? contactData.billingStateName + ", " : "")}
										{RFQData && contactData && (contactData.billingCountryName ? contactData.billingCountryName : "")}
									</div>
									{contactData &&(this.getVatNo(contactData,RFQData))}
								{contactData&&contactData.mobileNumber&&(<div className="mb-1 ml-2">{strings.MobileNumber}: +{contactData.mobileNumber}</div>)}
								{contactData && contactData.billingEmail && (<div className="mb-1 ml-2">{strings.Email}: {contactData.billingEmail}</div>)}

													{/* <div
														className={`ribbon ${this.getRibbonColor(
															RFQData,
														)}`}
													>
															<span className="mb-1 ml-2">{RFQData.status}</span>
														</div>  */}
								</div>
								<div style={{ width: '27%' }}>
									<br/>
									<div className="mb-1 ml-2"><b>{strings.GRNNo}: </b> # {RFQData.grnNumber}</div>
								<div className="mb-1 ml-2"><b>{strings.ReceiveDate }: </b>{' '}
										{moment(RFQData.grnReceiveDate).format('DD MMM YYYY')}</div>		
								<div className="mb-1 ml-2"><b>{strings.Status}: </b>{this.renderRFQStatus(status)}</div><br />
                                </div>
								</div>
							</div>

							<div
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
								marginBottom: '1rem',
								borderLeft:'1px solid',
									borderRight:'1px solid',
									borderBottom:'1px solid',borderColor:'#c8ced3'
							}}
						>
							
						</div>
						<Table className='table-striped' >
						<thead className="header-row" style={{ fontSize:"12px" }}>
								<tr>
									<th className="center" style={{ padding: '0.5rem',width: "40px" }}>
										#
									</th>
									{/* <th style={{ padding: '0.5rem' }}>Item</th> */}
									<th style={{ padding: '0.5rem' }}>{strings.ProductNameAndDescription}</th>
									<th  style={{ padding: '0.5rem',textAlign:"center" }}>
										{strings.Quantity }
									</th>
									{/* <th style={{ padding: '0.5rem', textAlign: 'right' }}>
										{strings.UnitCost }
									</th>
									<th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.VAT}</th>
									<th style={{ padding: '0.5rem', textAlign: 'right' }}>
										{strings.Total }
									</th> */}
								</tr>
							</thead>
							<tbody className="table-hover">
								{RFQData.poQuatationLineItemRequestModelList &&
									RFQData.poQuatationLineItemRequestModelList.length &&
									RFQData.poQuatationLineItemRequestModelList.map((item, index) => {
										return (
											<tr key={index}>
												<td className="center">{index + 1}</td>
												<td><b>{item.productName}</b><br/><br />{item.description}</td>
												<td  style={{ textAlign: 'center' }}>{item.grnReceivedQuantity}<br/><br/>
											     <b style={{fontSize:"10.5px"}}>{item.unitType}</b>	
												</td>
												{/* <td style={{ textAlign: 'right', width: '20%' }}>
													
													{RFQData.currencyIsoCode + " " +item.unitPrice}
												</td>
												<td
													style={{ textAlign: 'right' }}
												>{`${item.vatPercentage}%`}</td>
												<td style={{ textAlign: 'right' }}>
												
													{RFQData.currencyIsoCode + " " +item.subTotal}
												</td> */}
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
								{/* <div className="pb-2">{strings.AmountInWords }:<br/>
									<b><u> {RFQData.totalAmount ? upperCase(RFQData.currencyName + " " +(toWords.convert(RFQData.totalAmount))+" ONLY") : " -" }
								
									</u></b></div>
								<div className="pb-2">{strings.VAT+" "+strings.AmountInWords }:
										<br/>
									<b> {RFQData.totalVatAmount ? (upperCase(RFQData.currencyName + " " +(toWords.convert(RFQData.totalVatAmount))+" ONLY")) : " -" }</b>
								
								</div> */}
						
							{RFQData.notes&& (<>
								<h6 className="mb-0 pt-2">
									<b>{strings.GRNREMARKS}:</b>
								</h6>
								<h6 className="mb-0">{RFQData.notes}</h6><br/>
								{/* <h6 className="mb-0 pt-2">
									<b>{strings.Notes}:</b>
								</h6><br/>
								<h6 className="mb-0">{RFQData.notes}</h6> */}
                                </>)}
						
							
							</div>
						
						</div><hr/>	
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
