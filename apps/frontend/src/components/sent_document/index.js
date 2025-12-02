import React from 'react';
import { connect } from 'react-redux';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { data } from 'screens/Language/index'
import LocalizedStrings from 'react-localization';
import { upperCase } from 'lodash';
import * as Actions from './actions';
import { CommonActions } from 'services/global';
import { bindActionCreators } from 'redux';
import { ActionMessagesList } from 'utils';
import EmailPopUpCard from './email_popup_card';

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

const mapStateToProps = (state) => {
	return {};
};
const mapDispatchToProps = (dispatch) => {
	return {
		actions: bindActionCreators(Actions, dispatch,),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};


class SentInvoice extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			dialog: '',
		};
	}

	componentDidMount = () => {
		this.sentInvoice();
	};
	componentDidUpdate(prevProps, prevState) {
		//console.log(prevProps, prevState);
	}

	sentInvoice = () => {
		const { markAsSent, unSent, mailPopupCard } = this.props;
		if (unSent) {
			this.unPostInvoice();
		} else if (markAsSent) {
			this.stockInHandTestForProduct();
		} else {
			if (mailPopupCard) {
				this.getInvoiceDataById();
			} else {
				this.stockInHandTestForProduct();
			}
		}

	}

	getInvoiceDataById = () => {
		const { invoiceAmount, id, currencyName, vatAmount, markAsSent, postingRefType, documentTitle, sendAgain } = this.props;
		const amountInWords = upperCase(currencyName + " " + (toWords.convert(invoiceAmount)) + " ONLY").replace("POINT", "AND");
		const vatInWords = vatAmount ? upperCase(currencyName + " " + (toWords.convert(vatAmount)) + " ONLY").replace("POINT", "AND") : "-";
		var type = '';
		if (documentTitle === strings.CustomerInvoice) {
			type = 1;
		}
		else if (documentTitle === strings.Quotation) {
			type = 6;
		} else if (documentTitle === strings.PurchaseOrder) {
			type = 4;
		} else if (documentTitle === strings.TaxCreditNote) {
			type = 7;
		}
		let payload = {
			id: id,
			type: type,
			amountInWords: amountInWords,
			taxInWords: vatInWords,
		}
		const postingRequestModel = this.getPostingRequestModel();
		this.props.actions.getEmailContentById(payload).then((res) => {
			let emailData = this.getEmailContent(res.data);
			emailData.postingRequestModel = postingRequestModel;
			this.setState({
				currentInvoiceEmailData: emailData,
				openEmailModal: true,
			})
		})
	}

	removeDialog = () => {
		const { setState, initializeData } = this.props;
		this.setState({ dialog: null, openEmailModal: false });
		setState(false);
		initializeData();
	};

	stockInHandTestForProduct = () => {
		this.postInvoice();
	}

	getMessageList = (documentTitle, strings, message) => {
		var actionMessageList = [];
		if (documentTitle === strings.CustomerInvoice) {
			actionMessageList = ActionMessagesList.InvoiceMessagesList;
		} else if (documentTitle === strings.TaxCreditNote) {
			actionMessageList = ActionMessagesList.CreditNoteMessagesList;
		} else if (documentTitle === strings.Quotation) {
			actionMessageList = ActionMessagesList.QuotationMessagesList;
		} else if (documentTitle === strings.Expense) {
			actionMessageList = ActionMessagesList.ExpenseMessagesList;
		} else if (documentTitle === strings.SupplierInvoice) {
			actionMessageList = ActionMessagesList.SupplierInvoiceMessagesList;
		} else if (documentTitle === strings.DebitNote) {
			actionMessageList = ActionMessagesList.DebitNoteMessagesList;
		} else if (documentTitle === strings.PurchaseOrder) {
			actionMessageList = ActionMessagesList.PrchaseOrderMessagesList;
		}
		if (actionMessageList && actionMessageList.length > 0) {
			const messageObj = actionMessageList.find(obj => obj.action === message)
			const messageList = messageObj.list;
			return messageList;
		}
		return ['Success', 'Error', 'Changed'];
	}

	getPostingRequestModel = () => {
		const { invoiceAmount, id, currencyName, vatAmount, markAsSent, postingRefType, setState, initializeData, documentTitle,
			isCNWithoutProduct, chartOfAccountId, sendAgain, expenseAmount } = this.props;
		const postingRequestModel = {
			amount: invoiceAmount,
			postingRefId: id,
			postingRefType: postingRefType,
			amountInWords: upperCase(currencyName + " " + (toWords.convert(invoiceAmount)) + " ONLY").replace("POINT", "AND"),
			vatInWords: vatAmount ? upperCase(currencyName + " " + (toWords.convert(vatAmount)) + " ONLY").replace("POINT", "AND") : "-",
			markAsSent: markAsSent,
			sendAgain: sendAgain,
		};
		if (documentTitle === strings.TaxCreditNote || documentTitle === strings.DebitNote) {
			postingRequestModel.isCNWithoutProduct = isCNWithoutProduct == true ? true : false;
		}
		if (documentTitle === strings.Expense) {
			postingRequestModel.postingChartOfAccountId = chartOfAccountId;
			postingRequestModel.amount = expenseAmount;
			postingRequestModel.postingRefId = id;
			postingRequestModel.postingRefType = postingRefType;
		}
		return postingRequestModel;

	}

	postInvoice = () => {
		const { invoiceAmount, id, currencyName, vatAmount, markAsSent, postingRefType, setState, initializeData, documentTitle,
			isCNWithoutProduct, chartOfAccountId, sendAgain } = this.props;
		var messageList = this.getMessageList(documentTitle, strings, 'Sent');
		const postingRequestModel = this.getPostingRequestModel();
		this.props.actions.postInvoice(postingRequestModel, documentTitle, strings).then((res) => {
			if (res.status === 200) {
				if (markAsSent === true) {
					this.props.commonActions.tostifyAlert(
						'success',
						strings[messageList[2]]
					);
				} else {
					this.props.commonActions.tostifyAlert(
						'success',
						strings[messageList[0]]
					)
				};
				setState(false);
				initializeData();
			}
		}).catch((err) => {
			this.props.commonActions.tostifyAlert(
				'error',
				strings[messageList[1]]
			);
			setState(false);
			initializeData();
		});
	};


	sendCustomEmail = (payload) => {
		const { documentTitle, } = this.props;
		var messageList = this.getMessageList(documentTitle, strings, 'Sent');

		this.props.actions.sendCustomEmail(payload).then((res) => {
			if (res.status === 200) {
				this.props.commonActions.tostifyAlert('success', strings[messageList[0]])
				this.removeDialog();
			}
		}).catch((err) => {
			this.props.commonActions.tostifyAlert('error', strings[messageList[1]]);
			this.removeDialog();
		});
	};

	unPostInvoice = () => {
		const { invoiceAmount, id, postingRefType, documentTitle, chartOfAccountId, setState, initializeData, } = this.props;
		var messageList = this.getMessageList(documentTitle, strings, 'UnPost');
		const postingRequestModel = {
			amount: invoiceAmount,
			postingRefId: id,
			postingRefType: postingRefType,
			postingChartOfAccountId: chartOfAccountId,
		};
		this.props.actions.unPostInvoice(postingRequestModel, documentTitle, strings).then((res) => {
			if (res.status === 200) {
				this.props.commonActions.tostifyAlert('success', strings[messageList[0]]);
				setState(false);
				initializeData();
			}
		}).catch((err) => {
			this.props.commonActions.tostifyAlert('error', strings[messageList[1]]);
			setState(false);
			initializeData();
		});
	};

	getEmailContent = (data) => {
		let content = '';
		let dataArray = data.emailContent.split('Dear');
		content = 'Dear' + dataArray[1];
		const contentPrefix = dataArray[0];
		dataArray = content.split('</message>');
		content = dataArray[0]
		const contentSufix = dataArray[1];

		//Remove Extra Spaces
		content = content.replace(/\n/g, '');
		content = content.replace(/^\s+|\s+$/gm, '')
		content = content.replace(/\s+/g, ' ');
		content = content.replace(/<\/br> /g, '\n'); // Replace </br> with \n;
		content = content.replace(/<\/br>/g, '\n'); // Replace </br> with \n;
		content = content.replace(/<br>/g, '\n'); // Replace </br> with \n;
		console.log(content)


		data.contentPrefix = contentPrefix;
		data.contentSufix = contentSufix;
		data.billingEmail = [data.billingEmail]
		data.message = content;
		return data;
	}


	render() {
		strings.setLanguage(this.state.language);
		const { dialog, openEmailModal, currentInvoiceEmailData } = this.state;
		const { id } = this.props;
		return (
			<div className="d-flex">
				{dialog}
				{openEmailModal &&
					<EmailPopUpCard
						openEmailModal={openEmailModal}
						removeDialog={() => {
							this.removeDialog();
						}}
						id={id}
						currentEntityEmailDetails={currentInvoiceEmailData}
						updateChange={(updatedData) => {
							this.setState({ currentInvoiceEmailData: updatedData })
							console.log("changed ontent")
						}}
						sendCustomEmail={(payload) => {
							const { sendAgain } = this.props;
							payload.append('sendAgain', sendAgain ?? false);
							this.sendCustomEmail(payload);
						}}
					/>
				}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SentInvoice);
