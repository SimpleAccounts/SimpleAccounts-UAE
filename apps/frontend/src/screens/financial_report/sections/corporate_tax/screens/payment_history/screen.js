import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
    Button,
    Col,
    Card,
    CardHeader,
    CardBody,
    Row,
} from 'reactstrap';
import { AuthActions, CommonActions } from 'services/global';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css'
//import './style.scss';
import * as CTreportAction from '../../actions';
import logo from 'assets/images/brand/logo.png';
import moment from 'moment';
import * as FinancialReportActions from '../../../../actions';
import { Currency } from 'components';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { data } from '../../../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
    return {
        version: state.common.version,
        company_profile: state.reports.company_profile,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        authActions: bindActionCreators(AuthActions, dispatch),
        commonActions: bindActionCreators(CommonActions, dispatch),
        ctReportActions: bindActionCreators(CTreportAction, dispatch),
        financialReportActions: bindActionCreators(FinancialReportActions, dispatch,),
    };
};
let strings = new LocalizedStrings(data);
class CorporateTaxPaymentHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            language: window['localStorage'].getItem('language'),
            initValue: {},
            loading: false,
            fileName: '',
            disabled: false,
            productName: '',
            version: '',
            type: '',
            upload: false,
            file_data_list: [],
            openModal: false,
            cttReportDataList: [],
            paginationPageSize: 10,
        };
        this.options = {
            // onRowClick: this.goToDetail,
            page: 1,
            sizePerPage: 10,
            onSizePerPageList: this.onSizePerPageList,
            onPageChange: this.onPageChange,
            sortName: '',
            sortOrder: '',
            onSortChange: this.sortColumn,
        };
    }
    onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        this.gridApi.paginationSetPageSize(Number(value));
    };

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };

    onSizePerPageList = (sizePerPage) => {
        if (this.options.sizePerPage !== sizePerPage) {
            this.options.sizePerPage = sizePerPage;
            this.getInitialData();
        }
    };

    onPageChange = (page, sizePerPage) => {
        if (this.options.page !== page) {
            this.options.page = page;
            this.getInitialData();
        }
    };
    onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        this.gridApi.paginationSetPageSize(Number(value));
    };

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };

    onBtnExport = () => {
        this.gridApi.exportDataAsCsv();
    };

    onBtnExportexcel = () => {
        this.gridApi.exportDataAsExcel();
    };

    componentDidMount = () => {
        this.getInitialData();
        this.props.financialReportActions.getCompany();
    };

    getInitialData = () => {
        let { filterData } = this.state;
        const paginationData = {
            pageNo: this.options.page ? this.options.page - 1 : 0,
            pageSize: this.options?.sizePerPage,
        };
        const sortingData = {
            order: this.options.sortOrder ? this.options.sortOrder : '',
            sortingCol: this.options.sortName ? this.options.sortName : '',
        };
        const postData = { ...filterData, ...paginationData, ...sortingData };
        this.props.ctReportActions
            .getCTPaymentHistoryList()
            .then((res) => {
                if (res.status === 200) {
                    this.setState({ cttReportDataList: res.data }) // comment for dummy
                }
            })
            .catch((err) => {
                this.props.commonActions.tostifyAlert(
                    'error',
                    err && err.data ? err.data.message : 'Something Went Wrong',
                );
            });
    };

    renderDate = (cell, row) => {
        return cell ? moment(cell)
            .format('DD-MM-YYYY')
            // .format('LL')
            : '-';
    };

    renderAmount = (amount, params) => {
        if (amount != null && amount != 0)
            return (
                <>
                    <Currency
                        value={amount}
                        currencySymbol={params.currency}
                    />
                </>
            )
        else
            return ("---")
    }
    renderTaxPeriod = (cell, row) => {
        let startDate = moment(row.startDate).format("DD-MM-YYYY");
        let endDate = moment(row.endDate).format("DD-MM-YYYY");
    
        return <>{startDate} To {endDate}</>;
      };
    render() {
        strings.setLanguage(this.state.language);
        const { cttReportDataList } = this.state;
        const { company_profile } = this.props;
        return (
            <div className="import-bank-statement-screen">
                <div className="animated fadeIn">
                    <Card>
                        <CardHeader>
                            <Row>
                                <Col lg={12}>
                                    <div
                                        className="h4 mb-0 d-flex align-items-center"
                                        style={{ justifyContent: 'space-between' }}
                                    >
                                        <div>
                                            <p
                                                className="mb-0"
                                                style={{
                                                    cursor: 'pointer',
                                                    fontSize: '1.3125rem',
                                                    paddingLeft: '15px',
                                                }}
                                                onClick={this.viewFilter}
                                            >
                                                <i className="fa fa-history mr-2"></i> {strings.CorporateTaxPaymentHistory}
                                            </p>
                                        </div>
                                        <div className="d-flex">
                                            <Button
                                                className="mr-2 print-btn-cont"
                                                onClick={() => {
                                                    this.props.history.push('/admin/report/corporate-tax/');
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <span>X</span>
                                            </Button>

                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </CardHeader>
                        <CardBody>
                            <div style={{
                                // display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <img
                                        src={
                                            company_profile &&
                                                company_profile.companyLogoByteArray
                                                ? 'data:image/jpg;base64,' +
                                                company_profile.companyLogoByteArray
                                                : logo
                                        }
                                        className=""
                                        alt=""
                                        style={{ width: ' 150px' }}></img>
                                </div>
                                <div style={{ textAlign: 'center' }} >
                                    <h2>
                                        {company_profile &&
                                            company_profile['companyName']
                                            ? company_profile['companyName']
                                            : 'ABC GROUP'}
                                    </h2>
                                    <br style={{ marginBottom: '5px' }} />
                                    <b style={{ fontSize: '18px' }}>{strings.CorporateTaxPaymentHistory}</b>
                                    <br style={{ marginBottom: '5px' }} />
                                    <br />
                                </div>
                            </div>
                            <div>
                                <BootstrapTable
                                    selectRow={this.selectRowProp}
                                    options={this.options}
                                    version="4"
                                    hover
                                    responsive
                                    remote
                                    data={cttReportDataList.data ? cttReportDataList.data : []}
                                    pagination={
                                        cttReportDataList &&
                                            cttReportDataList.data &&
                                            cttReportDataList.data.length
                                            ? true
                                            : false
                                    }
                                    fetchInfo={{
                                        dataTotalSize: cttReportDataList.count
                                            ? cttReportDataList.count
                                            : 0,
                                    }}
                                >
                                    <TableHeaderColumn
                                        tdStyle={{ whiteSpace: 'normal' }}
                                        dataAlign="left"
                                        isKey
                                        dataField="taxReturns"
                                        dataFormat={this.renderTaxPeriod}
                                        className="table-header-bg"
                                    >
                                        {strings.TaxPeriod}
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataAlign="right"
                                        dataField="amountPaid"
                                        dataFormat={this.renderAmount}
                                        className="table-header-bg"
                                    >
                                        {strings.AmountPaid}
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataAlign="right"
                                        dataField="paymentDate"
                                        dataFormat={this.renderDate}
                                        className="table-header-bg"
                                    >
                                        {strings.PAYMENTDATE}
                                    </TableHeaderColumn>
                                </BootstrapTable>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CorporateTaxPaymentHistory);


