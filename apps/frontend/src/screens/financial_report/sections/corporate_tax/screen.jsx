import React, { useState, useEffect, useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Col,
  FormGroup,
  Card,
  CardHeader,
  CardBody,
  Row,
  DropdownMenu,
  DropdownItem,
  ButtonDropdown,
  DropdownToggle,
} from 'components/migration';
import { AuthActions, CommonActions } from 'services/global';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import * as CTReportAction from './actions';
import { upperFirst } from 'lodash-es';
import { CTReport, CTSettingModal, FileCtReportModal, DeleteModal } from './sections';
import dayjs from '@/utils/date';
import { ConfirmDeleteModal, Currency, Loader } from 'components';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { DataTable } from '@/components/ui/data-table';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu as ShadcnDropdownMenu,
  DropdownMenuTrigger as ShadcnDropdownMenuTrigger,
  DropdownMenuContent as ShadcnDropdownMenuContent,
  DropdownMenuItem as ShadcnDropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  Eye,
  History,
  Landmark,
  Link,
  Plus,
  Settings,
  Trash2,
  Unlink,
} from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const CorporateTax = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { version, setting_list, ctReport_list } = useSelector(state => ({
    version: state.common.version,
    setting_list: state.reports.setting_list,
    ctReport_list: state.reports.ctReport_list,
  }));

  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [openCTReportModal, setOpenCTReportModal] = useState(false);
  const [openCTSettingModal, setOpenCTSettingModal] = useState(false);
  const [openFileCtReportModal, setOpenFileCtReportModal] = useState(false);
  const [fiscalYearOptions, setFiscalYearOptions] = useState([]);
  const [previousSettings, setPreviousSettings] = useState('');
  const [current_report_id, setCurrentReportId] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [currentEndDate, setCurrentEndDate] = useState('');
  const [currentTaxReturns, setCurrentTaxReturns] = useState('');
  const [currentDueDate, setCurrentDueDate] = useState('');
  const [dialog, setDialog] = useState(null);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);
  const [filterData, setFilterData] = useState({});

  useEffect(() => {
    getInitialData();
  }, []);

  useEffect(() => {
    getInitialData();
  }, [pagination, sorting]);

  const getInitialData = () => {
    dispatch(CTReportAction.getCTSettings());
    const paginationData = {
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    const sortingData = {
      order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: sorting.length > 0 ? sorting[0].id : '',
    };
    const postData = { ...filterData, ...paginationData, ...sortingData };

    dispatch(CTReportAction.getCorporateTaxList(postData))
      .then(res => {
        if (res.status === 200) {
          // Logic for flag
          const dataList = res.data.data;
          if (dataList.length > 0) {
            dataList.forEach((obj, index) => {
              obj.flag = index === 0;
            });
          }
        }
      })
      .catch(err => {
        toast.error(err && err.data ? err.data.message : 'Something Went Wrong');
      });
  };

  const markItUnfiled = row => {
    const postingRequestModel = {
      id: row.id,
    };
    setLoading(true);
    setLoadingMsg('Report UnFiling...');
    dispatch(CTReportAction.markItUnfiled(postingRequestModel))
      .then(res => {
        if (res.status === 200) {
          toast.success('Report Unfiled Successfully!');
          getInitialData();
          setLoading(false);
        }
      })
      .catch(err => {
        toast.error(err && err.data ? err.data.message : 'Something Went Wrong');
        setLoading(false);
      });
  };

  const deleteReport = id => {
    const message1 = (
      <text>
        <b>Delete Tax Report File ?</b>
      </text>
    );
    const message = 'This CT report file will be deleted permanently and cannot be recovered. ';

    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={() => remove(id)}
        cancelHandler={() => setDialog(null)}
        message={message}
        message1={message1}
      />
    );
  };

  const remove = id => {
    // Note: Delete action wasn't explicitly implemented in original class component 'remove' method (it called this.remove(id) but implementation was missing or I missed it? Wait, I see `delete` calling `remove` but `remove` wasn't in the snippet provided for CorporateTax...
    // Ah, wait. Looking at the original file content again.
    // Lines 470-496: delete method sets dialog.
    // But where is `remove` method?
    // It's NOT there!
    // The original code has `okHandler={this.remove(id)}` which is wrong (immediate invocation) or `this.remove` doesn't exist.
    // Wait, looking at `VatReports` (previous file), it had `remove`.
    // In `CorporateTax` (current file), I don't see `remove` method defined!
    // This implies the delete functionality might be broken in original code or I am blind.
    // Let me check imports. `import * as CTReportAction from "./actions";`
    // Maybe `CTReportAction` has `deleteCorporateTax`?
    // I'll assume standard pattern.
    // Actually, looking at `getActionButtons`:
    // onClick={() => {
    //   this.setState({
    //     current_report_id: params.id,
    //     deleteModal: true,
    //   });
    // }}
    // It opens `DeleteModal` from `./sections`.
    // So `delete` method in class component might be unused or legacy.
    // The `DeleteModal` handles the deletion.
    // So I don't need `deleteReport` function here if I use `DeleteModal`.
    // BUT `DeleteModal` needs `current_report_id` and `openModal`.
    // AND it needs `closeModal` prop.
    // Does `DeleteModal` handle the API call internally? Usually modals in this project do specific actions or just confirm.
    // Let's check `DeleteModal` usage in original code:
    /*
    <DeleteModal
      openModal={this.state.deleteModal}
      current_report_id={this.state.current_report_id}
      closeModal={(e) => {
        this.closeDeleteModal(e);
        this.getInitialData();
      }}
    />
    */
    // This suggests `DeleteModal` does the deletion and then calls `closeModal`.
    // I will stick to using `DeleteModal`.
  };

  const renderDate = cell => {
    return cell ? dayjs(cell).format('DD-MM-YYYY') : '-';
  };

  const renderTaxPeriod = row => {
    let startDate = dayjs(row.startDate).format('DD-MM-YYYY');
    let endDate = dayjs(row.endDate).format('DD-MM-YYYY');
    return (
      <>
        {startDate} To {endDate}
      </>
    );
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

  const renderStatus = params => {
    const status = params;
    return (
      <>
        {status === 'UnFiled' ? <label className="badge label-draft"> {status}</label> : ''}
        {status === 'Filed' ? <label className="badge label-due"> {status}</label> : ''}
        {status === 'Partially Paid' ? (
          <label className="badge label-PartiallyPaid"> {status}</label>
        ) : (
          ''
        )}
        {status === 'Paid' ? <label className="badge label-paid">{status}</label> : ''}
        {status === 'claimed' ? (
          <label className="badge label-paid text-capitalize">{status}</label>
        ) : (
          ''
        )}
        {status === 'Reclaimed' ? <label className="badge label-sent"> {status}</label> : ''}
      </>
    );
  };

  const getActionButtons = row => {
    const startDate = dayjs(row.startDate).format('DD-MM-YYYY');
    const endDate = dayjs(row.endDate).format('DD-MM-YYYY');
    const taxPeriod = startDate + ' To ' + endDate;

    return (
      <ShadcnDropdownMenu>
        <ShadcnDropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </ShadcnDropdownMenuTrigger>
        <ShadcnDropdownMenuContent align="end">
          <ShadcnDropdownMenuItem
            onClick={() => {
              setCurrentReportId(row.id);
              navigate(`/admin/report/corporate-tax/view?id=${row.id}`, {
                state: {
                  id: row.id,
                  startDate: row.startDate,
                  endDate: row.endDate,
                },
              });
            }}
          >
            <Eye className="h-4 w-4" /> View
          </ShadcnDropdownMenuItem>

          {row.status === 'UnFiled' ? (
            <ShadcnDropdownMenuItem
              onClick={() => {
                setCurrentReportId(row.id);
                setDeleteModal(true);
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </ShadcnDropdownMenuItem>
          ) : (
            ''
          )}

          {(row.netIncome > 375000 && row.status === 'Filed') || row.status === 'Partially Paid' ? (
            <ShadcnDropdownMenuItem
              onClick={() => {
                setCurrentReportId(row.id);
                navigate('/admin/report/corporate-tax/payment', {
                  state: {
                    id: row.id,
                    taxPeriod: taxPeriod,
                    totalAmount: row.taxAmount,
                    balanceDue: row.balanceDue,
                    taxFiledOn: row.taxFiledOn,
                  },
                });
              }}
            >
              {' '}
              <Landmark className="h-4 w-4" /> Record Payment
            </ShadcnDropdownMenuItem>
          ) : (
            ''
          )}

          {row.status === 'Filed' && row.flag === true ? (
            <ShadcnDropdownMenuItem
              onClick={() => {
                setCurrentReportId(row.id);
                markItUnfiled(row);
              }}
            >
              {' '}
              <Unlink className="h-4 w-4" /> Mark It Unfiled
            </ShadcnDropdownMenuItem>
          ) : (
            ''
          )}

          {row.status === 'UnFiled' ? (
            <ShadcnDropdownMenuItem
              onClick={() => {
                setOpenFileCtReportModal(true);
                setCurrentReportId(row.id);
                setCurrentTaxReturns(taxPeriod);
                // logic for endDate: date + 1 day
                const d = new Date(row.endDate);
                d.setDate(d.getDate() + 1);
                setCurrentEndDate(d);
                setCurrentDueDate(new Date(row.dueDate));
              }}
            >
              {' '}
              <Link className="h-4 w-4" /> File The Report
            </ShadcnDropdownMenuItem>
          ) : (
            ''
          )}
        </ShadcnDropdownMenuContent>
      </ShadcnDropdownMenu>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'taxPeriod', // Custom
        header: 'Tax Period',
        cell: ({ row }) => renderTaxPeriod(row.original),
      },
      {
        accessorKey: 'dueDate',
        header: strings.DueDate,
        cell: ({ row }) => renderDate(row.original.dueDate),
      },
      {
        accessorKey: 'netIncome',
        header: strings.NetIncome,
        cell: ({ row }) => (
          <div className="text-right">
            {renderAmount(row.original.netIncome, row.original.currency)}
          </div>
        ),
      },
      {
        accessorKey: 'taxableAmount',
        header: strings.TaxableAmount,
        cell: ({ row }) => (
          <div className="text-right">
            {renderAmount(row.original.taxableAmount, row.original.currency)}
          </div>
        ),
      },
      {
        accessorKey: 'taxAmount',
        header: strings.TaxAmount,
        cell: ({ row }) => (
          <div className="text-right">
            {renderAmount(row.original.taxAmount, row.original.currency)}
          </div>
        ),
      },
      {
        accessorKey: 'taxFiledOn',
        header: strings.FiledOn,
        cell: ({ row }) => renderDate(row.original.taxFiledOn),
      },
      {
        accessorKey: 'status',
        header: strings.STATUS,
        cell: ({ row }) => <div className="text-center">{renderStatus(row.original.status)}</div>,
      },
      {
        accessorKey: 'balanceDue',
        header: strings.BalanceDue,
        cell: ({ row }) => (
          <div className="text-right">
            {renderAmount(row.original.balanceDue, row.original.currency)}
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => <div className="text-right">{getActionButtons(row.original)}</div>,
      },
    ],
    []
  );

  const setting = setting_list ? setting_list.find(obj => obj.selectedFlag === true) : '';

  return loading ? (
    <Loader loadingMsg={loadingMsg} />
  ) : (
    <div className="import-bank-statement-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            {dialog}
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
                        fontSize: '1.3rem',
                        paddingLeft: '15px',
                      }}
                    >
                      {strings.CorporateTax}
                    </p>
                  </div>
                  <div>
                    <Button
                      className="mr-2 btn btn-danger"
                      onClick={() => {
                        navigate('/admin/report/reports-page');
                      }}
                      style={{
                        cursor: 'pointer',
                      }}
                    >
                      <span>X</span>
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </CardHeader>
          {dialog}

          <CardBody>
            <Row>
              <Col lg={12} className="mb-5">
                <div className="table-wrapper">
                  <FormGroup className="text-center">
                    <Button
                      color="primary"
                      className="btn-square  pull-right"
                      onClick={() => {
                        navigate('/admin/report/corporate-tax/payment-history');
                      }}
                    >
                      <History className="h-4 w-4" /> {strings.CTPaymentHistory}
                    </Button>

                    <Button
                      name="button"
                      color="primary"
                      className={`btn-square pull-right ${(setting ? (setting.isEligibleForCP ? false : true) : true) || (ctReport_list.count > 0 && ctReport_list?.data[0].status === 'UnFiled') ? 'disabled-button' : ''}`}
                      disabled={
                        (setting ? (setting.isEligibleForCP ? false : true) : true) ||
                        (ctReport_list.count > 0 && ctReport_list?.data[0].status === 'UnFiled')
                      }
                      onClick={() => {
                        const fiscalYearOptions = [];
                        const lastRecordYear =
                          ctReport_list.count > 0
                            ? parseInt(ctReport_list?.data[0].startDate.split('-')[0]) + 1
                            : '';
                        if (setting) {
                          const startingMonth = setting.fiscalYear.split(' - ')[0];
                          const startingDate = startingMonth === 'January' ? '1-1-' : '6-1-';
                          const startingYear = lastRecordYear
                            ? lastRecordYear
                            : startingMonth === 'January'
                              ? dayjs().year() + 1
                              : dayjs().year();
                          for (let i = 0; i < 4; i++) {
                            const year = parseInt(startingYear) + parseInt(i);
                            const date = startingDate + year;
                            fiscalYearOptions.push({
                              value: date,
                              label: startingMonth + '-' + year,
                            });
                          }
                        }
                        setFiscalYearOptions(fiscalYearOptions);
                        setOpenCTReportModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4" /> {strings.GenerateCTReport}
                    </Button>

                    <Button
                      name="button"
                      color="primary"
                      className="btn-square pull-right "
                      onClick={() => {
                        setPreviousSettings(setting);
                        setOpenCTSettingModal(true);
                      }}
                    >
                      <Settings className="h-4 w-4" /> Corporate Tax Settings
                    </Button>
                  </FormGroup>
                </div>
              </Col>
            </Row>

            <div>
              <DataTable
                data={ctReport_list?.data || []}
                columns={columns}
                manualPagination={true}
                pageCount={
                  ctReport_list?.count ? Math.ceil(ctReport_list.count / pagination.pageSize) : 0
                }
                onPaginationChange={setPagination}
                pagination={pagination}
                manualSorting={true}
                onSortingChange={setSorting}
                sorting={sorting}
              />
            </div>
          </CardBody>
        </Card>
      </div>
      <CTReport
        openModal={openCTReportModal}
        fiscalYearOptions={fiscalYearOptions}
        ctReport={ctReport_list?.count > 0}
        closeModal={e => {
          setOpenCTReportModal(false);
          getInitialData();
        }}
      />
      <CTSettingModal
        openModal={openCTSettingModal}
        setState={() => {}} // Placeholder
        previousSettings={previousSettings}
        ctReport={ctReport_list?.count > 0}
        closeModal={e => {
          setOpenCTSettingModal(false);
          getInitialData();
        }}
      />
      <FileCtReportModal
        openModal={openFileCtReportModal}
        current_report_id={current_report_id}
        endDate={currentEndDate}
        taxReturns={currentTaxReturns}
        dueDate={currentDueDate}
        closeModal={e => {
          setOpenFileCtReportModal(false);
          getInitialData();
        }}
      />
      <DeleteModal
        openModal={deleteModal}
        current_report_id={current_report_id}
        closeModal={e => {
          setDeleteModal(false);
          getInitialData();
        }}
      />
    </div>
  );
};

export default CorporateTax;
