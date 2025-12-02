import React from 'react';
import { connect } from 'react-redux';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { data } from 'screens/Language/index'
import LocalizedStrings from 'react-localization';
import { ConfirmDeleteModal } from 'components';
import * as Actions from './actions';
import { CommonActions } from 'services/global';
import { bindActionCreators } from 'redux';
import { ActionMessagesList } from 'utils';

let strings = new LocalizedStrings(data);

const mapStateToProps = (state) => {
	return {};
};
const mapDispatchToProps = (dispatch) => {
	return {
		actions: bindActionCreators(Actions, dispatch,),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class DeleteDocument extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			dialog: '',
		};
	}

	componentDidMount = () => {
		this.DeleteDocument();
	};
	componentDidUpdate(prevProps, prevState) {
		//console.log(prevProps, prevState);
	}
	DeleteDocument = () => {
		this.deleteInvoice();
	}
	deleteInvoice = () => {
		const { id, status, documentTitle } = this.props;
		if (status === 'Paid') {
			this.props.commonActions.tostifyAlert('error', strings.PleaseDeleteTheReceiptFirstToDeleteTheInvoice,);
		} else {
			const message1 = `${strings.Delete} ${documentTitle}?`;
			const message = `${strings.This} ${documentTitle} ${strings.deleteMsg}`;
			this.setState({
				dialog: (
					<ConfirmDeleteModal
						isOpen={true}
						okHandler={() => this.removeInvoice(id)}
						cancelHandler={this.removeDialog}
						message={message}
						message1={message1}
					/>
				),
			});
		}
	};
	getMessageList = (documentTitle, strings) => {
		var actionMessageList = [];
		if (documentTitle === strings.TaxInvoice || documentTitle === strings.CustomerInvoice) {
			actionMessageList = ActionMessagesList.InvoiceMessagesList;
		} else if (documentTitle === strings.TaxCreditNote) {
			actionMessageList = ActionMessagesList.CreditNoteMessagesList;
		} else if (documentTitle === strings.Quotation) {
			actionMessageList = ActionMessagesList.QuotationMessagesList;
		} else if (documentTitle === strings.Expense) {
			actionMessageList = ActionMessagesList.ExpenseMessagesList;
		}else if (documentTitle === strings.SupplierInvoice) {
			actionMessageList = ActionMessagesList.SupplierInvoiceMessagesList;
		}else if (documentTitle === strings.DebitNote) {
			actionMessageList = ActionMessagesList.DebitNoteMessagesList;
		}else if (documentTitle === strings.PurchaseOrder) {
			actionMessageList = ActionMessagesList.PrchaseOrderMessagesList;
		}
		if (actionMessageList && actionMessageList.length > 0) {
			const messageObj = actionMessageList.find(obj => obj.action === 'Delete')
			const messageList = messageObj.list;
			return messageList;
		}
		return ['Success', 'Error'];
	}
	removeInvoice = (id) => {
		const { history, URL, documentTitle } = this.props;
		var messageList = this.getMessageList(documentTitle, strings);
		this.props.actions.deleteInvoice(id, documentTitle, strings).then((res) => {
			this.props.commonActions.tostifyAlert(
				'success',
				strings[messageList[0]]
			);
			history.push(URL);
			this.removeDialog();
		}).catch((err) => {
			this.removeDialog();
			this.props.commonActions.tostifyAlert('error', strings[messageList[1]]);
		});
	};
	removeDialog = () => {
		const { setState, } = this.props;
		this.setState({
			dialog: null,
		},()=>{
		setState(false)
		});
	};
	render() {
		strings.setLanguage(this.state.language);
		const { dialog } = this.state;
		return (
			<div className="d-flex">
				{dialog}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DeleteDocument);
