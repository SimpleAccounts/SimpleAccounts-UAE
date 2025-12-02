import React from 'react';
import { connect } from 'react-redux';
import {
    Button,
    ButtonGroup,
    ButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
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


class ActionDropdownButtons extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            language: window['localStorage'].getItem('language'),
            dialog: '',
            sentInvoice: false,
            actionButtons: {},
            sendAgain: false,
        };
    }

    toggleActionButton = (index) => {
        let temp = Object.assign({}, this.state.actionButtons);
        if (temp[parseInt(index, 10)]) {
            temp[parseInt(index, 10)] = false;
        } else {
            temp[parseInt(index, 10)] = true;
        }
        this.setState({
            actionButtons: temp,
        });
    };

    render() {
        strings.setLanguage(this.state.language);
        const { sentInvoice, markAsSent, deleteInvoice, statusToChange, statusChange, unSent, sendAgain } = this.state;
        const { history, URL, initializeData, invoiceData, postingRefType, actionList, invoiceStatus, documentTitle, documentCreated } = this.props;
        if (invoiceData) {
            const { id, totalAmount, currencyIsoCode, totalVatAmount, date, dueDate, dueAmount, number, contactId, editFlag, isCreatedWIWP,
                invoiceNumber, chartOfAccountId
            } = invoiceData
            const viewURL = URL;
            return (
                <>
                    <div>
                        <ButtonDropdown
                            isOpen={this.state.actionButtons[id]}
                            toggle={() => this.toggleActionButton(id)}
                        >
                            <DropdownToggle size="sm" color="primary" className="btn-brand icon">
                                {this.state.actionButtons[id] === true ? (
                                    <i className="fas fa-chevron-up" />
                                ) : (
                                    <i className="fas fa-chevron-down" />
                                )}
                            </DropdownToggle>
                            <DropdownMenu right>
                                {actionList && actionList.length > 0 && actionList.map((status, index) => {
                                    if (status === 'Edit') {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    if (editFlag === false)
                                                        this.props.commonActions.tostifyAlert('error', strings.YouCannotEditTransactionsForWhichVATIsRecorded);
                                                    else
                                                        history.push(`${URL}/detail`, { id: id, renderURL: viewURL, renderID: id },);
                                                }}
                                            >
                                                <i className="fas fa-edit" />{strings.Edit}
                                            </DropdownItem>
                                        )
                                    } else if (status === 'Send') {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    this.setState({ sentInvoice: true, markAsSent: false })
                                                }}
                                            >
                                                <i className="fas fa-send" />{strings.Send}
                                            </DropdownItem>
                                        );
                                    } else if (status === 'Mark As Sent') {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    this.setState({ sentInvoice: true, markAsSent: true })
                                                }}
                                            >
                                                <i className="far fa-arrow-alt-circle-right" />{strings.Mark_As_Sent}
                                            </DropdownItem>
                                        );
                                    } else if (status === 'Mark As Open') {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    this.setState({ sentInvoice: true, markAsSent: true })
                                                }}
                                            >
                                                <i className="far fa-arrow-alt-circle-right" />{strings.MarkAsOpen}
                                            </DropdownItem>
                                        );
                                    } else if (status === 'Post') {
                                        return (
                                            <DropdownItem
                                                key={index}
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
                                                <i className="fas fa-send" />{strings.Post}
                                            </DropdownItem>
                                        );
                                    } else if (status === 'Draft') {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    if (documentTitle === strings.Quotation || documentTitle === strings.PurchaseOrder)
                                                        this.setState({ statusChange: true, statusToChange: "Draft" })
                                                    else
                                                        this.setState({ sentInvoice: true, unSent: true })
                                                }}
                                            >
                                                <i className="fas fa-file" />{strings.Draft}
                                            </DropdownItem>
                                        );
                                    } else if (status === 'Create Invoice') {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    if (documentTitle === strings.PurchaseOrder)
                                                        history.push('/admin/expense/supplier-invoice/create', { poId: id, renderURL: viewURL, renderID: id },)
                                                    else if (documentTitle === strings.Quotation)
                                                        history.push('/admin/income/customer-invoice/create', { quotationId: id, renderURL: viewURL, renderID: id },)
                                                }}
                                            >
                                                <i className="fas fa-plus" />{strings.CreateInvoice}
                                            </DropdownItem>
                                        );
                                    } else if (status === 'Record Payment' && currencyIsoCode === 'SAR') {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    this.props.history.push(`${URL}/record-payment`,
                                                        {
                                                            id: id,
                                                            invoiceDate: date,
                                                            invoiceDueDate: dueDate,
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
                                                <i className="fas fa-university" />{strings.RecordPayment}
                                            </DropdownItem>
                                        );
                                    } else if (status === 'Refund Payment') {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    history.push(`${URL}/refund`, { id: id, renderURL: viewURL, renderID: id },);
                                                }}
                                            >
                                                <i className="fas fa-university" />{strings.RefundPayment}
                                            </DropdownItem>
                                        );
                                    } else if (status === 'Apply To Invoice') {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    history.push(`${URL}/applyToInvoice`, {
                                                        contactId: contactId,
                                                        creditNoteId: id,
                                                        noteNumber: number,
                                                        referenceNumber: invoiceNumber,
                                                        totalAmount: dueAmount,
                                                        currency: currencyIsoCode || 'SAR',
                                                        renderURL: viewURL,
                                                        renderID: id
                                                    },);
                                                }}
                                            >
                                                <i className="fas fa-file-invoice" />{strings.ApplyToInvoice}
                                            </DropdownItem>
                                        );
                                    } else if (status === 'Mark As Approved') {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    this.setState({ statusChange: true, statusToChange: "Approved" })
                                                }}
                                            >
                                                <i className="fa fa-check-circle-o" />{strings.MarkAsApproved}
                                            </DropdownItem>
                                        );
                                    }
                                    else if (status === 'Close') {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    this.setState({ statusChange: true, statusToChange: "Closed" })
                                                }}
                                            >
                                                <i className="far fa-times-circle" />{strings.Close}
                                            </DropdownItem>
                                        );
                                    } else if (status === 'Mark As Rejected') {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    this.setState({ statusChange: true, statusToChange: "Rejected" })
                                                }}
                                            >
                                                <i className="fa fa-ban" />{strings.MarkAsRejected}
                                            </DropdownItem>
                                        );
                                    } else if (status === 'Create A Duplicate') {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    history.push(`${URL}/create`, { parentId: id, renderURL: viewURL, renderID: id },);
                                                }}
                                            >
                                                <i className="fas fa-copy" />{strings.CreateADuplicate}
                                            </DropdownItem>
                                        );
                                    } else if (status === 'Delete') {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    if (editFlag === false)
                                                        this.props.commonActions.tostifyAlert('error', strings.YouCannotEditTransactionsForWhichVATIsRecorded);
                                                    else
                                                        this.setState({ deleteInvoice: true })
                                                }}
                                            >
                                                <i className="fa fa-trash-o" />{strings.Delete}
                                            </DropdownItem>
                                        );
                                    } else if (status === 'Send Again') {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    this.setState({ sentInvoice: true, markAsSent: false, sendAgain: true })
                                                }}
                                            >
                                                <i className="fas fa-send" />{strings.SendAgain}
                                            </DropdownItem>
                                        );
                                    } else if (status === 'Create Tax Credit Note' && !documentCreated) {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    history.push('/admin/income/credit-notes/create', {
                                                        invoiceID: id, renderURL: viewURL, renderID: id
                                                    })
                                                }}
                                            >
                                                <i className="fas fa-plus" />{strings.CreateCreditNote}
                                            </DropdownItem>
                                        );
                                    } else if (status === 'Create Debit Note' && !documentCreated) {
                                        return (
                                            <DropdownItem
                                                key={index}
                                                onClick={() => {
                                                    history.push('/admin/expense/debit-notes/create', {
                                                        invoiceID: id, renderURL: viewURL, renderID: id
                                                    })
                                                }}
                                            >
                                                <i className="fas fa-plus" />{strings.CreateDebitNote}
                                            </DropdownItem>
                                        );
                                    }

                                })}
                                <DropdownItem
                                    onClick={() =>
                                        this.props.history.push(
                                            `${URL}/view`,
                                            { id: id },
                                        )
                                    }
                                >
                                    <i className="fas fa-eye" />{strings.View}
                                </DropdownItem>

                            </DropdownMenu>
                        </ButtonDropdown>
                    </div>

                    {sentInvoice &&
                        <SentInvoice
                            invoiceAmount={totalAmount || 0}
                            id={id}
                            currencyName={currencyIsoCode || 'SAR'}
                            vatAmount={totalVatAmount || 0}
                            markAsSent={markAsSent}
                            postingRefType={postingRefType}
                            setState={(value) => {
                                this.setState({ sentInvoice: value, unSent: false, sendAgain: false })

                            }}
                            initializeData={() => {
                                initializeData();
                            }}
                            chartOfAccountId={chartOfAccountId}
                            documentTitle={documentTitle}
                            isCNWithoutProduct={isCreatedWIWP}
                            unSent={unSent}
                            sendAgain={sendAgain}
                            zatcaConfirmation={(documentTitle === strings.CustomerInvoice || documentTitle === strings.TaxCreditNote) && (!sendAgain || !markAsSent)}
                            mailPopupCard={(documentTitle === strings.Quotation || documentTitle === strings.CustomerInvoice || documentTitle === strings.TaxCreditNote || documentTitle === strings.PurchaseOrder || documentTitle === strings.IncomeReceipt) && (sendAgain || !markAsSent)}
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
                                initializeData();
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

export default connect(mapStateToProps, mapDispatchToProps)(ActionDropdownButtons);
