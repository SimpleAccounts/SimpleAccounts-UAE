import React from 'react';
import { connect } from 'react-redux';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { data } from 'screens/Language/index'
import LocalizedStrings from 'react-localization';
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


class ChangeInvoiceStatus extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			dialog: '',
		};
	}

	componentDidMount = () => {
		this.changeStatus();
	};
	componentDidUpdate(prevProps, prevState) {
		//console.log(prevProps, prevState);
	}

	changeStatus = () => {
		const { id, status, documentTitle, initializeData, setState } = this.props;
		let messageList;
	
		if (status === 'Draft') {
			messageList = this.getMessageList(documentTitle, strings, 'Draft');
		} else if (status === 'Approved' || status === 'Rejected') {
			messageList = this.getMessageList(documentTitle, strings, status);
		} else {
			messageList = this.getMessageList(documentTitle, strings, 'Status Change');
		}		this.props.actions.changeStatus(id, status, documentTitle, strings).then((res) => {
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
	}

	getMessageList = (documentTitle, strings, status) => {
		var actionMessageList = [];
		if (documentTitle === strings.TaxInvoice || documentTitle === strings.CustomerInvoice) {
			actionMessageList = ActionMessagesList.InvoiceMessagesList;
		} else if (documentTitle === strings.TaxCreditNote) {
			actionMessageList = ActionMessagesList.CreditNoteMessagesList;
		} else if (documentTitle === strings.Quotation) {
			actionMessageList = ActionMessagesList.QuotationMessagesList;
		} else if (documentTitle === strings.PurchaseOrder) {
			actionMessageList = ActionMessagesList.PrchaseOrderMessagesList;
		}
		if (actionMessageList && actionMessageList.length > 0) {
			const messageObj = actionMessageList.find(obj => obj.action === status)
			const messageList = messageObj.list;
			return messageList;
		}
		return ['Success', 'Error'];
	}

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

export default connect(mapStateToProps, mapDispatchToProps)(ChangeInvoiceStatus);
