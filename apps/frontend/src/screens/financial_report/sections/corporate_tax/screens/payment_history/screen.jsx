import React, { useState, useEffect, useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useDispatch, useSelector } from 'react-redux';
import {
    Button,
    Col,
    Card,
    CardHeader,
    CardBody,
    Row,
} from 'reactstrap';
import { AuthActions, CommonActions } from 'services/global';
import 'react-datepicker/dist/react-datepicker.css';
import * as CTreportAction from '../../actions';
import logo from 'assets/images/brand/logo.png';
import dayjs from '@/utils/date';
import * as FinancialReportActions from '../../../../actions';
import { Currency, Loader } from 'components';
import { DataTable } from '@/components/ui/data-table';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { data as languageData } from '../../../../../Language/index';
import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings(languageData);

const CorporateTaxPaymentHistory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { version, company_profile } = useSelector((state) => ({
        version: state.common.version,
        company_profile: state.reports.company_profile,
    }));

    const [language] = useState(window['localStorage'].getItem('language'));
    const [loading, setLoading] = useState(false);
    const [cttReportDataList, setCttReportDataList] = useState({ data: [], count: 0 });
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState([]);
    const [filterData, setFilterData] = useState({});

    useEffect(() => {
        strings.setLanguage(language);
        dispatch(FinancialReportActions.getCompany());
        getInitialData();
    }, [language]);

    useEffect(() => {
        getInitialData();
    }, [pagination, sorting]);

    const getInitialData = () => {
        setLoading(true);
        const paginationData = {
            pageNo: pagination.pageIndex,
            pageSize: pagination.pageSize,
        };
        const sortingData = {
            order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
            sortingCol: sorting.length > 0 ? sorting[0].id : '',
        };
        const postData = { ...filterData, ...paginationData, ...sortingData };
        
        dispatch(CTreportAction.getCTPaymentHistoryList(postData))
            .then((res) => {
                if (res.status === 200) {
                    setCttReportDataList(res.data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                toast.error(err && err.data ? err.data.message : 'Something Went Wrong');
                setLoading(false);
            });
    };

    const renderDate = (cell) => {
        return cell ? dayjs(cell).format('DD-MM-YYYY') : '-';
    };

    const renderAmount = (amount, currency) => {
        if (amount != null && amount != 0)
            return (
                <>
                    <Currency value={amount} currencySymbol={currency} />
                </>
            );
        else return '---';
    };

    const renderTaxPeriod = (row) => {
        let startDate = dayjs(row.startDate).format("DD-MM-YYYY");
        let endDate = dayjs(row.endDate).format("DD-MM-YYYY");
        return <>{startDate} To {endDate}</>;
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'taxReturns',
            header: strings.TaxPeriod,
            cell: ({ row }) => renderTaxPeriod(row.original),
        },
        {
            accessorKey: 'amountPaid',
            header: strings.AmountPaid,
            cell: ({ row }) => <div className="text-right">{renderAmount(row.original.amountPaid, row.original.currency)}</div>,
        },
        {
            accessorKey: 'paymentDate',
            header: strings.PAYMENTDATE,
            cell: ({ row }) => <div className="text-right">{renderDate(row.original.paymentDate)}</div>,
        },
    ], []);

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
                                        >
                                            <i className="fa fa-history mr-2"></i> {strings.CorporateTaxPaymentHistory}
                                        </p>
                                    </div>
                                    <div className="d-flex">
                                        <Button
                                            className="mr-2 print-btn-cont"
                                            onClick={() => {
                                                navigate('/admin/report/corporate-tax/');
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
                            <DataTable
                                data={cttReportDataList?.data || []}
                                columns={columns}
                                manualPagination={true}
                                pageCount={cttReportDataList?.count ? Math.ceil(cttReportDataList.count / pagination.pageSize) : 0}
                                onPaginationChange={setPagination}
                                pagination={pagination}
                                manualSorting={true}
                                onSortingChange={setSorting}
                                sorting={sorting}
                                loading={loading}
                            />
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default CorporateTaxPaymentHistory;
