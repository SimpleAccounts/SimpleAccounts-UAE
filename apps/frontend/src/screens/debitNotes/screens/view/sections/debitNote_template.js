import React, { Component } from 'react';
import { Card, CardBody, Row, Col, Table } from 'reactstrap';
import moment from 'moment';
import '../style.scss';
import logo from 'assets/images/brand/logo.png';
import { Currency } from 'components';
import { data } from '../../../../Language/index'
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
class DebitNoteTemplate extends Component {
	constructor(props) {
		super(props);
		this.state = { language: window['localStorage'].getItem('language'), };
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
		const { debitNoteData, status, currencyData, totalNet, companyData, contactData, isCNWithoutProduct } = this.props;
		let currencyName = debitNoteData.currencyName ? debitNoteData.currencyName : 'UAE DIRHAM';
		return (
			<div>
				<Card id="singlePage" className="box">
					<CardBody style={{ margin: '1rem', border: 'solid 1px', borderColor: '#c8ced3', }}>
						<div
							style={{
								width: '100%',
								display: 'flex',
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
										<h2 className="mb-1 ml-2"><b>{strings.DebitNote}</b></h2><br />
										<div className="mb-1 ml-2" style={{ fontSize: "22px" }}><b>{companyData.companyName}</b></div>
										<div className="mb-1 ml-2">{companyData.companyAddressLine1}</div>
										<div className="mb-1 ml-2">{companyData.companyAddressLine2}</div>
										<div>{companyData.companyCountryCode == 229 ? strings.POBox : ""}: {companyData.companyPoBoxNumber}</div>
										<div>{companyData && (companyData.companyCity ? companyData.companyCity : "")}</div>
										<div>{companyData && (companyData.companyStateName ? companyData.companyStateName + ", " : "")}
											{companyData && (companyData.companyCountryName ? companyData.companyCountryName : "")}</div>
										{companyData.isRegisteredVat == true && (<div className="mb-1 ml-2">{strings.VATRegistrationNo}: {companyData.vatRegistrationNumber}</div>)}
										{companyData.companyRegistrationNumber && (<div className="mb-1 ml-2">{strings.CompanyRegistrationNo}: {companyData.companyRegistrationNumber}</div>)}
										{/* <div className="mb-1 ml-2">{strings.MobileNumber}: {this.companyMobileNumber(companyData.phoneNumber ? "+" + companyData.phoneNumber : '')}</div>
										{companyData.emailAddress && (<div className="mb-1 ml-2">Email: {companyData.emailAddress}</div>)} */}
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
									flexDirection: 'column',
									marginLeft: '2rem'
								}}
							>
								<div>
									<h6 className="mb-1 ml-2"><b>{strings.To},</b></h6>
									{contactData && (<div className="mb-1 ml-2"><b>{contactData.organization ? contactData.organization : (contactData.firstName + " " + contactData.lastName)}</b></div>)}
									{contactData && contactData.addressLine1 && (<div className="mb-1 ml-2">{contactData.addressLine1}</div>)}

									<div className="mb-1 ml-2">
										{debitNoteData && contactData && (
											contactData.countryId == 229 ?
												contactData.poBoxNumber ? (strings.POBox + ": " + contactData.poBoxNumber) : ""
												: contactData.postZipCode ? contactData.postZipCode : ""
										)}
									</div>
									<div className="mb-1 ml-2">
										{debitNoteData && contactData && (contactData.city ? contactData.city : "")}
									</div>
									<div className="mb-1 ml-2">
										{debitNoteData && contactData && (contactData.billingStateName ? contactData.billingStateName + ", " : "")}
										{debitNoteData && contactData && (contactData.billingCountryName ? contactData.billingCountryName : "")}
									</div>
									{contactData && contactData.mobileNumber && (<div className="mb-1 ml-2">{strings.MobileNumber}: +{contactData.mobileNumber}</div>)}
									{contactData && contactData.billingEmail && (<div className="mb-1 ml-2">{strings.Email}: {contactData.billingEmail}</div>)}
									{debitNoteData && debitNoteData.taxTreatment && debitNoteData.taxTreatment.includes("NON") == false && (<div className="mb-1 ml-2">{strings.VATRegistrationNo}: {contactData && contactData.vatRegistrationNumber && (contactData.vatRegistrationNumber)}</div>)}
								</div>
								<br />
								<div>
									<Table className="table-striped" style={{ width: 'fit-content', border: '1px solid', borderColor: '#c8ced3', float: 'right', minWidth: '30%', }}>
										<thead className="header-row" style={{ fontSize: "12px" }}>
											<tr>
												<th>{strings.DebitNoteNo}</th>
												<th>{strings.DebitNoteDate}</th>
												<th>{strings.Status}</th>
												{debitNoteData.referenceNo && <th>{strings.ReferenceN}</th>}
												{isCNWithoutProduct && <th style={{ textAlign: 'right' }}>{strings.DebitAmount}</th>}
												<th>{strings.RemainingBalance}</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>{debitNoteData.creditNoteNumber}</td>
												<td>{' '}{moment(debitNoteData.creditNoteDate).format('DD-MM-YYYY',)}</td>
												<td>{debitNoteData.status ? debitNoteData.status === 'Partially Paid' ? 'Partially Debited' : debitNoteData.status : ''}</td>
												{debitNoteData.referenceNo && <td>{debitNoteData.referenceNo}</td>}
												{isCNWithoutProduct && <td style={{ textAlign: 'right' }}>
													<Currency
														value={debitNoteData.totalAmount}
														currencySymbol={
															currencyData[0]
																? currencyData[0].currencyIsoCode
																: 'USD'
														}
													/>
												</td>}
												<td style={{ textAlign: 'right' }}>
													<Currency
														value={debitNoteData.dueAmount}
														currencySymbol={
															currencyData[0]
																? currencyData[0].currencyIsoCode
																: 'USD'
														}
													/>
												</td>
											</tr>
										</tbody>
									</Table>
									<div className='text-right'>{debitNoteData.exchangeRate && debitNoteData.exchangeRate > 1 ? <><b>{strings.Exchangerate}:</b> {debitNoteData.exchangeRate}</> : ''}</div>
								</div>
							</div>
						</div>

						{isCNWithoutProduct == false && (
							<><hr />

								<Table className='table-striped' style={{ border: '1px solid', borderColor: '#c8ced3' }}>
									<thead className="header-row" style={{ fontSize: "12px" }}>
										<tr>
											<th className="center" style={{ padding: '0.5rem', width: "40px" }}>#</th>
											<th style={{ padding: '0.5rem' }}>{strings.ProductNameAndDescription}</th>
											<th className="text-center" style={{ padding: '0.5rem' }}>{strings.Quantity}</th>
											<th className="text-center" style={{ padding: '0.5rem' }}>{strings.UnitType}</th>
											<th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.UnitCost}</th>
											{debitNoteData.discount != 0 &&
												<th style={{ padding: '0.5rem', textAlign: 'right' }}>
													{strings.Discount}
												</th>
											}
											{debitNoteData.totalExciseTaxAmount != 0 &&
												<>
													<th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.Excise}</th>
													<th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.ExciseAmount}</th>
												</>
											}
											{debitNoteData.totalVatAmount != 0 &&
												<th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.VatAmount}</th>
											}
											<th style={{ padding: '0.5rem', textAlign: 'right' }}>
												{strings.SubTotal}
											</th>
										</tr>
									</thead>
									<tbody className="table-hover">
										{debitNoteData.invoiceLineItems &&
											debitNoteData.invoiceLineItems.length &&
											debitNoteData.invoiceLineItems.map((item, index) => {
												return (
													<tr key={index}>
														<td className="center">{index + 1}</td>
														<td style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
															<b>{item.productName}</b><br />{item.description}
														</td>
														<td style={{ textAlign: 'center' }}>{item.quantity}</td>
														<td style={{ textAlign: 'center' }}>{item.unitType}	</td>
														<td style={{ textAlign: 'right', width: '10%' }}>
															<Currency
																value={item.unitPrice}
																currencySymbol={currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'USD'}

															/>
														</td>
														{debitNoteData.discount != 0 && <>
															<td style={{ textAlign: 'right' }}>
																<Currency
																	value={item.discount}
																	currencySymbol={currencyData[0]
																		? currencyData[0].currencyIsoCode
																		: 'USD'}
																/>
															</td></>
														}
														{debitNoteData.totalExciseTaxAmount != 0 &&
															<>
																<td style={{ textAlign: 'right' }}>{item.exciseTaxId ? this.renderExcise(item) : "-"}</td>
																<td style={{ textAlign: 'right' }}>
																	{
																		<Currency
																			value={item.exciseAmount}
																			currencySymbol={currencyData[0]
																				? currencyData[0].currencyIsoCode
																				: 'USD'}
																		/>}
																</td>
															</>
														}
														{debitNoteData.totalVatAmount != 0 &&
															<td style={{ textAlign: 'right' }}>
																<Currency
																	value={item.vatAmount}
																	currencySymbol={currencyData[0]
																		? currencyData[0].currencyIsoCode
																		: 'USD'}
																/>
															</td>
														}
														<td style={{ textAlign: 'right' }}>
															<Currency
																value={item.subTotal}
																currencySymbol={currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'USD'}
															/>
														</td>
													</tr>
												);
											})}
									</tbody>
								</Table></>)}
						<hr />
						<div
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
								// marginBottom: '1rem',border:'solid 1px',borderColor:'#c8ced3',
								fontSize: "14px"
							}}>
							<div
								style={{
									width: '40%',
									display: 'flex',
									flexDirection: 'column',
									marginLeft: '2rem'
								}}
							>
								{/* <br />
								{debitNoteData.referenceNo && (<><h6 className="mb-0 pt-2">
									<b>{strings.ReferenceNumber}:</b>
								</h6>
									<h6 className="mb-0">{debitNoteData.referenceNo}</h6>
								</>)} */}
								<br />
								{debitNoteData.notes && (<><h6 className="mb-0 pt-2">
									<b>{strings.Notes}:</b>
								</h6>
									<textarea
										className="mb-0"
										style={{ width: '500px', height: '200px', border: 'none' }}
										value={debitNoteData.notes}
										readOnly
									/>
								</>)}

							</div>
							<div style={{
								width: '40%',
								display: 'flex',
								justifyContent: 'space-between',
								marginRight: '1rem'

							}}
							>
								{!isCNWithoutProduct &&
									<div style={{ width: '100%' }}>
										<Table className="table-clear cal-table">
											<tbody>
												{(debitNoteData.totalExciseTaxAmount > 0) && (
													<tr >
														<td style={{ width: '40%' }}>
															<strong>{strings.Total_Excise}</strong>
														</td>
														<td
															style={{
																display: 'flex',
																justifyContent: 'space-between',
															}}
														>
															<span style={{ marginLeft: '2rem' }}></span>
															<span>
																{debitNoteData.totalExciseTaxAmount ? (
																	<Currency
																		value={debitNoteData.totalExciseTaxAmount}
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
													</tr>)}
												{debitNoteData.discount && debitNoteData.discount > 0 ? (
													<tr >
														<td style={{ width: '40%' }}>
															<strong>
																{strings.Discount}
																{debitNoteData.discountPercentage
																	? `(${debitNoteData.discountPercentage}%)`
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
																{debitNoteData.discount ? (
																	<Currency
																		value={debitNoteData.discount ? +debitNoteData.discount : debitNoteData.discount}
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
													</tr>) : ""}
												<tr >
													<>
														<td style={{ width: '40%' }}><strong>{strings.TotalNet}</strong></td>
														<td style={{ display: 'flex', justifyContent: 'space-between', }}>
															<span style={{ marginLeft: '2rem' }}></span>
															<span>
																{totalNet ? (
																	<Currency
																		value={totalNet - debitNoteData.totalVatAmount - debitNoteData.totalExciseTaxAmount}
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
													</>
												</tr>
												{debitNoteData.totalVatAmount > 0 && (
													<tr >
														<td style={{ width: '40%' }}>
															<strong>{strings.TotalVat}</strong>
														</td>
														<td
															style={{
																display: 'flex',
																justifyContent: 'space-between',
															}}
														>
															<span style={{ marginLeft: '2rem' }}></span>
															<span>
																{debitNoteData.totalVatAmount ? (
																	<Currency
																		value={debitNoteData.totalVatAmount}
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
													</tr>
												)}
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
															{debitNoteData.totalAmount ? (
																<Currency
																	value={debitNoteData.totalAmount}
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
												</tr>

											</tbody>
										</Table>
									</div>
								}
							</div>
						</div>
						{(debitNoteData.referenceNo || debitNoteData.notes) && <br />}
						<br /><br /><br />
					</CardBody>
					<img className='footer' src={footer} style={{ height: "65px", width: "100%" }}></img>
				</Card>
			</div>
		);
	}
}

export default DebitNoteTemplate;
