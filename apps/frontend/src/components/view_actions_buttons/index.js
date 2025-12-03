import React from 'react';
import { connect } from 'react-redux';
import {
	Button,
} from 'reactstrap';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { data } from 'screens/Language/index'
import LocalizedStrings from 'react-localization';
import { SentInvoice, DeleteDocument, ChangeInvoiceStatus } from 'components';
import { CommonActions } from 'services/global';

let strings = new LocalizedStrings(data);

const mapStateToProps = (state) => {
	return {};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};


class ActionButtons extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			dialog: '',
			sentInvoice: false,
			sendAgain: false,
		};
	}

	render() {
		strings.setLanguage(this.state.language);
		const { sentInvoice, markAsSent, deleteInvoice, statusToChange, statusChange, unSent, sendAgain } = this.state;
		const { id, history, URL, initializeData, invoiceData, postingRefType, actionList, invoiceStatus, documentTitle, documentCreated, isCNWithoutProduct } = this.props;
		if (invoiceData) {
			const { totalAmount, currencyIsoCode, totalVatAmount, date, dueDate, dueAmount, number, contactId, editFlag, isCreatedWIWP,
				invoiceNumber, expenseCategory, referenceNumber, invoiceDate, invoiceDueDate, expenseAmount
			} = invoiceData
			const viewURL = URL + '/view';
			return (
				<>
					<div className="d-flex">
						{actionList && actionList.length > 0 && actionList.map((status, index) => {
							if (status === 'Edit') {
								return (
									<Button
										key={index}
										title={strings.Edit}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											if (editFlag === false) {
												this.props.commonActions.tostifyAlert('error', strings.YouCannotEditTransactionsForWhichVATIsRecorded);
											} else if (documentTitle === strings.DebitNote) {
												history.push(`${URL}/update`, { 
													id: id,expenseId:id, 
													renderURL: viewURL, 
													renderID: id, 
													isCNWithoutProduct: isCNWithoutProduct 
												},);
											} else {
												history.push(`${URL}/detail`, { 
													id: id,
													expenseId:id, 
													renderURL: viewURL, 
													renderID: id, 
													isCNWithoutProduct },);
										}}}
									>
										<i className="fas fa-edit"></i>
									</Button>
								)
							} else if (status === 'Send') {
								return (
									<Button
										key={index}
										title={strings.Send}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											this.setState({ sentInvoice: true, markAsSent: false })
										}}
									>
										<i className="fas fa-send"></i>
									</Button>
								);
							} else if (status === 'Mark As Sent') {
								return (
									<Button
										key={index}
										title={strings.Mark_As_Sent}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											this.setState({ sentInvoice: true, markAsSent: true })
										}}
									>
										<i className="far fa-arrow-alt-circle-right"></i>
									</Button>
								);
							} else if (status === 'Mark As Open') {
								return (
									<Button
										key={index}
										title={strings.MarkAsOpen}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											this.setState({ sentInvoice: true, markAsSent: true })
										}}
									>
										<i className="far fa-arrow-alt-circle-right"></i>
									</Button>
								);
							} else if (status === 'Post') {
								return (
									<Button
										key={index}
										title={strings.Post}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											// if (bankGenerated) {
											// 	this.props.commonActions.tostifyAlert(
											// 		'error',
											// 		'In order to post this expense, please select the pay-through options.'
											// 	);
											// } else
											this.setState({ sentInvoice: true, markAsSent: false })
										}}
									>
										<i className="fas fa-send"></i>
									</Button>
								);
							} else if (status === 'Draft') {
								return (
									<Button
										key={index}
										title={strings.Draft}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											if (documentTitle === strings.Quotation || documentTitle === strings.PurchaseOrder)
												this.setState({ statusChange: true, statusToChange: "Draft" })
											else
												this.setState({ sentInvoice: true, unSent: true })
										}}
									>
										<i className="fas fa-file"></i>
									</Button>
								);
							} else if (status === 'Create Invoice') {
								return (
									<Button
										key={index}
										title={strings.CreateInvoice}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											if (documentTitle === strings.PurchaseOrder)
												history.push('/admin/expense/supplier-invoice/create', { poId: id, renderURL: viewURL, renderID: id },)
											else if (documentTitle === strings.Quotation)
												history.push('/admin/income/customer-invoice/create', { quotationId: id, renderURL: viewURL, renderID: id },)
										}}
									>
										<i className="fas fa-plus"></i>
									</Button>
								);
							} else if (status === 'Record Payment' && currencyIsoCode === 'AED') {
								return (
									<Button
										key={index}
										title={strings.RecordPayment}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											this.props.history.push(`${URL}/record-payment`,
												URL.includes('invoice') ?
												{id: { id: id, 
													invoiceDate: moment(invoiceDate).format('DD-MM-YYYY'), 
													invoiceDueDate: moment(invoiceDueDate).format('DD-MM-YYYY'), 
													invoiceAmount: totalAmount, 
													dueAmount: dueAmount, 
													invoiceNumber: referenceNumber, 
													contactId: contactId, 
													renderURL: viewURL, 
													renderID: id }
											} :
											{
													id: id,
													invoiceDate: moment(date).format('DD-MM-YYYY'),
													invoiceDueDate: moment(dueDate).format('DD-MM-YYYY'),
													invoiceAmount: totalAmount,
													dueAmount: dueAmount,
													invoiceNumber: number,
													contactId: contactId,
													renderURL: viewURL,
													renderID: id
												},
											)
										}}
									>
										<i className="fas fa-university"></i>
									</Button>
								);
							} else if (status === 'Refund Payment') {
								return (
									<Button
										key={index}
										title={strings.RefundPayment}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											this.props.history.push(`${URL}/refund`,
												URL.includes('credit') ?
												{id: { id: id, 
													invoiceDate: moment(invoiceDate).format('DD-MM-YYYY'), 
													invoiceDueDate: moment(invoiceDueDate).format('DD-MM-YYYY'), 
													invoiceAmount: totalAmount, 
													dueAmount: dueAmount, 
													invoiceNumber: referenceNumber, 
													contactId: contactId, 
													renderURL: viewURL, 
													isCNWithoutProduct: isCNWithoutProduct,
													renderID: id }
												} :
												{id: {id: id,
													creditNoteDate: invoiceData.creditNoteDate,
													invoiceDueDate: dueDate,
													invoiceAmount: totalAmount,
													dueAmount: dueAmount,
													invNumber: referenceNumber,
													contactId: contactId,
													renderURL: viewURL,
													renderID: id,
													isCNWithoutProduct: isCNWithoutProduct,
													creditNoteNumber: number}
												}
											)
										}}
									>
										<i className="fas fa-university"></i>
									</Button>
								);
							} else if (status === 'Apply To Invoice') {
								return (
									<Button
										key={index}
										title={strings.ApplyToInvoice}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											history.push(`${URL}/applyToInvoice`, {
												contactId: contactId,
												creditNoteId: id,
												referenceNumber: invoiceNumber,
												debitAmount: dueAmount,
												creditAmount: dueAmount,
												creditNoteNumber: number,
												debitNoteNumber: number,
												currency: currencyIsoCode || 'AED',
												renderURL: viewURL,
												renderID: id,
												isCNWithoutProduct: isCNWithoutProduct,
											},);
										}}
									>
										<i className="fas fa-file-invoice"></i>
									</Button>
								);
							} else if (status === 'Mark As Approved') {
								return (
									<Button
										key={index}
										title={strings.MarkAsApproved}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											this.setState({ statusChange: true, statusToChange: "Approved" })
										}}
									>
										<i className="fa fa-check-circle-o"></i>
									</Button>
								);
							} else if (status === 'Mark As Rejected') {
								return (
									<Button
										key={index}
										title={strings.MarkAsRejected}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											this.setState({ statusChange: true, statusToChange: "Rejected" })
										}}
									>
										<i className="fa fa-ban"></i>
									</Button>
								);
							} else if (status === 'Create A Duplicate') {
								return (
									<Button
										key={index}
										title={strings.CreateADuplicate}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											history.push(`${URL}/create`, { 
												parentInvoiceId: id, 
												parentId:id,
												renderURL: viewURL, 
												renderID: id },);
										}}
									>
										<i className="fas fa-copy"></i>
									</Button>
								);
							} else if (status === 'Delete') {
								return (
									<Button
										key={index}
										title={strings.Delete}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											if (editFlag === false)
												this.props.commonActions.tostifyAlert('error', strings.YouCannotEditTransactionsForWhichVATIsRecorded);
											else
												this.setState({ deleteInvoice: true })
										}}
									>
										<i className="fa fa-trash-o"></i>
									</Button>
								);
							} else if (status === 'Send Again') {
								return (
									<Button
										key={index}
										title={strings.SendAgain}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											this.setState({ sentInvoice: true, markAsSent: false, sendAgain: true })
										}}
									>
										<i className="fas fa-send"></i>
									</Button>
								);
							} else if (status === 'Create Tax Credit Note' && !documentCreated) {
								return (
									<Button
										key={index}
										title={strings.CreateCreditNote}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											history.push('/admin/income/credit-notes/create', {
												invoiceID: id, renderURL: viewURL, renderID: id
											})
										}}
									>
										<i className="fas fa-plus"></i>
									</Button>
								);
							} else if (status === 'Create Debit Note' && !documentCreated) {
								return (
									<Button
										key={index}
										title={strings.CreateDebitNote}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											history.push('/admin/expense/debit-notes/create', {
												invoiceID: id, renderURL: viewURL, renderID: id
											})
										}}
									>
										<i className="fas fa-plus"></i>
									</Button>
								);
							} else if (status === 'Close') {
								return (
									<Button
										key={index}
										title={strings.Close}
										className="btn-lg mb-1 print-btn-cont mr-1"
										onClick={() => {
											this.setState({ statusChange: true, statusToChange: "Closed" })
										}}
									>
										<i className="far fa-times-circle"/>
									</Button>
								);
							}
						})}
					</div>
					{sentInvoice &&
						<SentInvoice
							invoiceAmount={totalAmount || 0}
							expenseAmount = {expenseAmount}
							id={id}
							currencyName={currencyIsoCode || 'AED'}
							vatAmount={totalVatAmount || 0}
							markAsSent={markAsSent}
							postingRefType={postingRefType}
							setState={(value) => {
								this.setState({ sentInvoice: value, unSent: false, sendAgain: false })
							}}
							initializeData={() => {
								initializeData();
							}}
							chartOfAccountId={expenseCategory}
							documentTitle={documentTitle}
							isCNWithoutProduct={isCreatedWIWP}
							unSent={unSent}
							sendAgain={sendAgain}
							mailPopupCard={(documentTitle === strings.Quotation || documentTitle === strings.CustomerInvoice || documentTitle === strings.PurchaseOrder || documentTitle === strings.TaxCreditNote || documentTitle === strings.IncomeReceipt) && (sendAgain || !markAsSent)}
						/>
					}
					{statusChange &&
						<ChangeInvoiceStatus
							status={statusToChange}
							id={id}
							setState={(value) => {
								this.setState({ statusChange: value })
							}}
							initializeData={() => {
								initializeData();
							}}
							documentTitle={documentTitle}
						/>
					}
					{deleteInvoice &&
						<DeleteDocument
							id={id}
							status={invoiceStatus}
							setState={(value) => {
								this.setState({ deleteInvoice: value })
							}}
							history={history}
							URL={URL}
							documentTitle={documentTitle}
						/>
					}
				</>
			);
		}
		return (<></>);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionButtons);
