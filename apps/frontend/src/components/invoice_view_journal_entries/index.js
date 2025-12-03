import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
    Card,
    CardHeader,
    CardBody,
    Row,
    Col,
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Currency } from 'components';
import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
import * as JournalActions from './actions';
import moment from 'moment';
import { data } from 'screens/Language/index'
import LocalizedStrings from 'react-localization';

const getList = (listData) => {
    let renderList = [];
    if (listData) {
        renderList = listData.map((item) => ({
            journalDate: item.journalDate ?? '',
            createdByName: item.createdByName,
            description: item.description,
            journalLineItems: item.journalLineItems,
            journalTransactionCategoryLabel: item.journalTransactionCategoryLabel,
            postingReferenceTypeDisplayName: item.postingReferenceTypeDisplayName,
            journalReferenceNo: item.journalReferenceNo,
            postingReferenceType: item.postingReferenceType,
            subTotalCreditAmount: item.subTotalCreditAmount,
            subTotalDebitAmount: item.subTotalDebitAmount,
            totalCreditAmount: item.totalCreditAmount,
            totalDebitAmount: item.totalDebitAmount,
            journalId: item.journalId,
        }))
    }

    return renderList;
}

const mapStateToProps = (state) => {
    return {
        invoice_journal_list: getList(state.invoice_view_journal.invoice_journal_list),
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        journalActions: bindActionCreators(JournalActions, dispatch),
    };
};

let strings = new LocalizedStrings(data);
class InvoiceViewJournalEntries extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            language: window['localStorage'].getItem('language'),
        };
        this.options = {
            onRowClick: this.goToDetail,
        };
    }

    componentDidMount = () => {
        this.initializeData();
    };

    initializeData = () => {
        const { invoiceId, invoiceType } = this.props;
        const postData = {
            invoiceType: invoiceType,
            invoiceId: invoiceId,
        }
        this.props.journalActions.getJournalList(postData).then((res) => {
            if (res.status === 200) {
                this.setState({ loading: false });
            }
        }).catch((err) => {
            this.setState({ loading: false });
        });
    };
    goToDetail = (row) => {
        const { history, invoiceId, id, invoiceURL, isCNWithoutProduct } = this.props
        history.push('/admin/accountant/journal/view', {
            id: row['journalId'],
            renderId: id ? id : invoiceId,
            renderURL: invoiceURL,
            renderCN: isCNWithoutProduct
        });
    };

    renderDate = (cell, rows) => {
        return rows.journalDate
            ? moment(rows.journalDate).format('DD-MM-YYYY')
            : '';
    };

    renderAccount = (cell, rows) => {
        const temp = rows && rows.journalLineItems
            ? rows.journalLineItems.map((item) => {
                return item['transactionCategoryName'];
            }) : [];
        const listItems = temp.map((number, index) => (
            <li key={index} style={{ listStyleType: 'none', paddingBottom: '5px' }}>
                {index === 0 ? number : number}
            </li>
        ));
        return <ul style={{ padding: '0', marginBottom: '0px' }}>{listItems}</ul>;
    };

    renderCreditAmount = (cell, rows) => {
        const temp =
            rows && rows.journalLineItems
                ? rows.journalLineItems.map((item) => {
                    return item['creditAmount'];
                })
                : [];
        const listItems = temp.map((number, index) => (
            <li key={index} style={{ listStyleType: 'none', paddingBottom: '5px' }}>
                <Currency
                    value={number.toFixed(6)}
                />
            </li>
        ));
        return <ul style={{ padding: '0', marginBottom: '0px' }}>{listItems}</ul>;
    };

    renderDebitAmount = (cell, rows) => {
        const temp =
            rows && rows.journalLineItems
                ? rows.journalLineItems.map((item) => {
                    return item['debitAmount'];
                })
                : [];
        const listItems = temp.map((number, index) => (
            <li key={index} style={{ listStyleType: 'none', paddingBottom: '5px' }}>
                <Currency
                    value={number.toFixed(6)}
                />
            </li>
        ));
        return <ul style={{ padding: '0', marginBottom: '0px' }}>{listItems}</ul>;
    };
    render() {
        strings.setLanguage(this.state.language);
        const { invoice_journal_list } = this.props;

        return (
            <div className="journal-screen animated fadeIn">
                <Card>
                    <CardHeader>
                        <Row>
                            <Col lg={12}>
                                <div className="h4 mb-0 d-flex align-items-center">
                                    <i className="fa fa-diamond" />
                                    <span className="ml-2">{strings.Journal}</span>
                                </div>
                            </Col>
                        </Row>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col lg={12}>
                                <div>
                                    <BootstrapTable
                                        data={invoice_journal_list ? invoice_journal_list : []}
                                        options={this.options}
                                        version="4"
                                        hover
                                        keyField="journalId"
                                        pagination={false}
                                        remote
                                        className="supplier-invoice-table"
                                        trClassName="cursor-pointer"
                                        csvFileName="Journal.csv"
                                        ref={(node) => {
                                            this.table = node;
                                        }}
                                    >
                                        <TableHeaderColumn
                                            dataField="journalReferenceNo"
                                            width="18%"
                                            tdStyle={{ color: 'blue' }}
                                            className="table-header-bg"
                                        >
                                            {strings.JOURNALREFERENCENO}
                                        </TableHeaderColumn>
                                        <TableHeaderColumn
                                            dataField="postingReferenceTypeDisplayName"
                                            width="13%"
                                            tdStyle={{ whiteSpace: 'unset' }}
                                            className="table-header-bg"
                                        >
                                            {strings.TRANSACTIONTYPE}
                                        </TableHeaderColumn>
                                        <TableHeaderColumn
                                            dataField="journalDate"
                                            dataFormat={this.renderDate}
                                            width="10%"
                                            className="table-header-bg"
                                        >
                                            {strings.POSTDATE}
                                        </TableHeaderColumn>

                                        <TableHeaderColumn
                                            dataField="description"
                                            width="10%"
                                            className="table-header-bg"
                                            tdStyle={{ whiteSpace: "normal" }}
                                        >
                                            {strings.NOTES}
                                        </TableHeaderColumn>
                                        <TableHeaderColumn
                                            dataField="journalLineItems"
                                            dataFormat={this.renderAccount}
                                            width="20%"
                                            dataAlign="left"
                                            className="table-header-bg"
                                        >
                                            {strings.ACCOUNT}
                                        </TableHeaderColumn>
                                        <TableHeaderColumn
                                            dataField="journalLineItems"
                                            dataFormat={this.renderDebitAmount}
                                            dataAlign="right"
                                            width="13%"
                                            className="table-header-bg"
                                        >
                                            {strings.DEBITAMOUNT}
                                        </TableHeaderColumn>
                                        <TableHeaderColumn
                                            dataField="journalLineItems"
                                            dataFormat={this.renderCreditAmount}
                                            dataAlign="right"
                                            width="14%"
                                            className="table-header-bg"
                                        >
                                            {strings.CREDITAMOUNT}
                                        </TableHeaderColumn>
                                    </BootstrapTable>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvoiceViewJournalEntries);
