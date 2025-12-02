import React, { Component } from 'react';
import { Card, CardBody, Table } from 'reactstrap';
import moment from 'moment';
import '../style.scss';
import logo from 'assets/images/brand/logo.png';
import {data}  from '../../../../Language/index'
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);
const footer = require('assets/images/invoice/invoiceFooter.png');
const ZERO=0.00

class ExpenseTemplate extends Component {
	constructor(props) {
		super(props);
		this.state = {language: window['localStorage'].getItem('language'),};
	}
	calculateExpenseAmount = (expenseAmount, expenseVatAmount, exclusiveVat) => {
		if (exclusiveVat) {
			expenseAmount=expenseAmount+expenseVatAmount;
		}
		return expenseAmount;
	  };
	getRibbonColor = (expenseData) => {
		if (expenseData.expenseStatus == 'Draft') {
			return 'pending-color';
		} else if (expenseData.expenseStatus == 'Posted') {
			return 'saved-color';
		} else {
			return 'saved-color';
		}
	};

	render() {
		strings.setLanguage(this.state.language);
		const { expenseData,companyData,currencyIsoCode,Currency} = this.props;
		const expenseAmount= this.calculateExpenseAmount(expenseData.expenseAmount, expenseData.expenseVatAmount, expenseData.exclusiveVat);
		return (
			<div>
				<Card id="singlePage" className="box">
					{/* <div
						className={`ribbon ribbon-top-left ${this.getRibbonColor(
							expenseData,
						)}`}
					>
						<span>{expenseData.expenseStatus}</span>
					</div> */}
						<CardBody style={{ margin: '1rem', border: 'solid 1px', borderColor: '#c8ced3', position:'relative', minHeight:'100vh'}}>
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
									width: '80%',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
								}}
							>
								<div style={{
									width: '100%',
									textAlign: 'right',
									padding: '60px',
								}}
								>
									<h2 className="mb-1 ml-2"><h1><b>{strings.Expense}</b></h1></h2>	
									{/* <div className="mb-1 ml-2" style={{fontSize:"22px"}}><b> {expenseData.payee} </b></div> */}
									<div className="mb-1 ml-2"><h4><b>{strings.ExpenseDate}</b>: {moment(expenseData.expenseDate ).format('DD-MM-YYYY')}</h4>
									</div> 
								</div>
							</div>	
						</div>
						<div style={{
									width: '97%',
									textAlign: 'right',
								}}
								>
									{(expenseData.exchangeRate && expenseData.exchangeRate!==1 ) && <strong>{strings.Exchangerate}: {expenseData.exchangeRate }</strong>}
						</div><br />
				<div style={{backgroundColor:'rgb(32 100 216)', height:'50px'}}></div>
					<div className="card text-start border"
						style={{
							width: '100%',
							display: 'flex',
							border:'2px solid',				
							borderColor:'#c8ced3'
						}}>

						<Table  striped>
							<tbody  >
								<tr>
									<td className="ml-3" style={{width:'245px'}}><b>{strings.Expense+" "+strings.Number}</b>:</td> 
									<td> {expenseData.expenseNumber ?expenseData.expenseNumber :"-" }</td>
								</tr>
								<tr> 
									<td className="ml-3" style={{width:'245px'}}><b>{strings.PaidBy}</b>:</td> 
									<td> {expenseData.payee}</td>
								</tr>
								<tr>
									<td className="ml-3" style={{width:'245px'}}><b>{strings.ExpenseCategory}</b>:</td>
									<td> {expenseData.transactionCategoryName}</td>
								</tr>
								<tr>
									<td className="ml-3" style={{width:'245px'}}><b>{strings.ExpenseAmount }</b>:</td> 
									<td>{expenseAmount? expenseData.currencyName + " " +expenseAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }):expenseData.currencyName + " " +ZERO.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
									{/* <td>{expenseData.expenseAmount}</td> */}
								</tr>
								{/* <tr>
										<td className="ml-3" style={{width:'245px'}}><b>Expense No</b> : </td>  
										<td>{expenseData.expenseId}</td>
								</tr> */}
								<tr>
									<td className="ml-3" style={{width:'245px'}}><b>{strings.PlaceofSupply}</b>: </td>  
									<td>{expenseData.placeOfSupplyName} </td>
								</tr>
								<tr>
									<td className="ml-3" style={{width:'245px'}}><b>{strings.VATType}</b>: </td>  
									<td>{expenseData.vatCategoryName} </td>
								</tr>
								<tr>
									<td className="ml-3" style={{width:'245px'}}><b>{strings.ReferenceNumber}</b>: </td>  
									<td>{expenseData.receiptNumber} </td>
								</tr>
								<tr>
									<td className="ml-3" style={{width:'245px'}}><b>{strings.Expense+" "+strings.Description}</b>: </td>  
									<td>{expenseData.expenseDescription} </td>
								</tr>
								{/* <tr>
										<td className="ml-3" style={{width:'245px'}}>	<b>{strings.Receipt+" "+strings.Description }</b>: </td>  
										<td>{expenseData.receiptAttachmentDescription} </td>
								</tr> */}
								<tr>
									<td className="ml-3" style={{width:'245px'}}><b>{strings.PostedDate}</b>: </td> 
									<td>{expenseData.expenseStatus === "Posted" ? moment(expenseData.lastUpdateDate).format('DD-MM-YYYY') :"-"}</td>
								</tr> 
							</tbody>
						</Table>
					{/* <div>
							<b>Last Updated By</b> : {expenseData.lastUpdatedBy}
					</div> */}
					</div>	
					<img className='footer' src={footer} style={{ height: "65px", width: "100%", marginBottom:" 1.3rem"}}></img>
					</CardBody>
				<div style={{ textAlignLast:'center'}}>{strings.PoweredBy+" " } <b>SimpleAccounts</b></div> 
				</Card>
			</div>
		);
	}
}

export default ExpenseTemplate;
