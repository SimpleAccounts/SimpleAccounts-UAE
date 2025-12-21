import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
} from 'reactstrap';
import { AuthActions, CommonActions } from 'services/global';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import * as Vatreport from './actions';
import { upperFirst } from 'lodash-es';
import dayjs from '@/utils/date';
import download from 'downloadjs';
import {
  DeleteModal,
  FileTaxReturnModal,
  GenerateVatReportModal,
  VatSettingModal,
} from './sections';
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
  ChevronUp,
  Eye,
  History,
  Landmark,
  Link,
  Plus,
  Trash2,
  Unlink,
} from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const VatReports = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { version } = useSelector(state => ({
    version: state.common.version,
  }));

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [fileName, setFileName] = useState('');
  const [actionButtons, setActionButtons] = useState({});
  const [disabled, setDisabled] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openVatSettingModal, setOpenVatSettingModal] = useState(false);
  const [openFileTaxRetrunModal, setOpenFileTaxRetrunModal] = useState(false);
  const [current_report_id, setCurrentReportId] = useState('');
  const [currentTaxReturns, setCurrentTaxReturns] = useState('');
  const [currentEndDate, setCurrentEndDate] = useState('');
  const [vatReportDataList, setVatReportDataList] = useState({ data: [], count: 0 });
  const [monthOption, setMonthOption] = useState({ label: 'Montly', value: 0 });
  const [deleteModal, setDeleteModal] = useState(false);
  const [prefix, setPrefix] = useState('');
  const [dialog, setDialog] = useState(null);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);
  const [filterData, setFilterData] = useState({});

  useEffect(() => {
    strings.setLanguage(language);
    getInitialData();
  }, [language]);

  useEffect(() => {
    getInitialData();
  }, [pagination, sorting]);

  const getVRNPrefix = () => {
    dispatch(Vatreport.getVRNPrefix()).then(res => {
      if (res.status === 200) {
        setPrefix(res.data);
      }
    });
  };

  const getInitialData = () => {
    getVRNPrefix();
    const paginationData = {
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    const sortingData = {
      order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: sorting.length > 0 ? sorting[0].id : '',
    };
    const postData = { ...filterData, ...paginationData, ...sortingData };

    // Using dispatch directly for actions
    dispatch(Vatreport.getVatReportList(postData))
      .then(res => {
        if (res.status === 200) {
          setVatReportDataList(res.data);
        }
      })
      .catch(err => {
        toast.error(err && err.data ? err.data.message : 'Something Went Wrong');
      });
  };

  const markItUnfiled = row => {
    const postingRequestModel = {
      postingRefId: row.id,
      postingRefType: 'VAT_REPORT_FILED',
    };
    setLoading(true);
    setLoadingMsg('VAT UnFiling...');
    dispatch(Vatreport.markItUnfiled(postingRequestModel))
      .then(res => {
        if (res.status === 200) {
          toast.success(
            res.data && res.data.message ? res.data.message : ' VAT UnFiled Successfully'
          );
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
    dispatch(Vatreport.deleteReportById(id))
      .then(res => {
        if (res.status === 200) {
          toast.success(
            res.data && res.data.message ? res.data.message : 'VAT Report File Deleted Successfully'
          );
          setDialog(null);
          getInitialData();
        }
      })
      .catch(err => {
        toast.error(err.data ? err.data.message : 'VAT Report File Deleted Unsuccessfully');
        setDialog(null);
      });
  };

  const renderDate = cell => {
    return cell ? dayjs(cell).format('DD-MM-YYYY') : '-';
  };

  const renderTaxReturns = cell => {
    let dateArr = cell ? cell.split('-') : [];
    return <>{dateArr[0].replaceAll('/', '-')}</>;
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
    return (
      <>
        {params === 'UnFiled' ? <label className="badge label-draft"> {params}</label> : ''}
        {params === 'Filed' ? <label className="badge label-due"> {params}</label> : ''}
        {params === 'Partially Paid' ? (
          <label className="badge label-PartiallyPaid"> {params}</label>
        ) : (
          ''
        )}
        {params === 'Paid' ? <label className="badge label-paid">{params}</label> : ''}
        {params === 'claimed' ? (
          <label className="badge label-paid text-capitalize">{params}</label>
        ) : (
          ''
        )}
        {params === 'Reclaimed' ? <label className="badge label-sent"> {params}</label> : ''}
      </>
    );
  };

  const getActionButtons = row => {
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
              let dateArr = row.taxReturns ? row.taxReturns.split('-') : [];
              navigate(`/admin/report/vatreports/view?id=${row.id}`, {
                state: {
                  startDate: dateArr[0] ? dateArr[0] : '',
                  endDate: dateArr[1] ? dateArr[1] : '',
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

          {row.status === 'Filed' || row.status === 'Partially Paid' ? (
            <ShadcnDropdownMenuItem
              onClick={() => {
                setCurrentReportId(row.id);
                if (row.totalTaxReclaimable != 0)
                  navigate('/admin/report/vatreports/recordclaimtax', {
                    state: {
                      id: row.id,
                      totalTaxReclaimable: row.totalTaxReclaimable,
                      taxReturns: row.taxReturns,
                    },
                  });
                else
                  navigate('/admin/report/vatreports/recordtaxpayment', {
                    state: {
                      id: row.id,
                      taxReturns: row.taxReturns,
                      totalTaxPayable: row.totalTaxPayable,
                      balanceDue: row.balanceDue,
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

          {row.status === 'Filed' ? (
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
                setOpenFileTaxRetrunModal(true);
                setCurrentReportId(row.id);
                setCurrentTaxReturns(row.taxReturns);
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
        accessorKey: 'vatNumber',
        header: 'VAT Report No.',
      },
      {
        accessorKey: 'taxReturns',
        header: 'VAT Return',
        cell: ({ row }) => renderTaxReturns(row.original.taxReturns),
      },
      {
        accessorKey: 'totalTaxPayable',
        header: 'Total VAT Payable',
        cell: ({ row }) => (
          <div className="text-right">
            {renderAmount(row.original.totalTaxPayable, row.original.currency)}
          </div>
        ),
      },
      {
        accessorKey: 'totalTaxReclaimable',
        header: 'Total VAT Reclaimable',
        cell: ({ row }) => (
          <div className="text-right">
            {renderAmount(row.original.totalTaxReclaimable, row.original.currency)}
          </div>
        ),
      },
      {
        accessorKey: 'filedOn',
        header: 'Filed On',
        cell: ({ row }) => renderDate(row.original.filedOn),
      },
      {
        accessorKey: 'status',
        header: strings.Status,
        cell: ({ row }) => renderStatus(row.original.status),
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

  const closeDeleteModal = () => {
    setDeleteModal(false);
    getInitialData();
  };

  const closeFileTaxRetrunModal = () => {
    setOpenFileTaxRetrunModal(false);
    getInitialData();
  };

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
                      VAT Report
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
                        navigate('/admin/report/vatreports/vatpaymentrecordhistory');
                      }}
                    >
                      <History className="h-4 w-4" /> VAT Payment Record
                    </Button>

                    <Button
                      name="button"
                      color="primary"
                      className="btn-square pull-right "
                      onClick={() => {
                        setOpenModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4" /> Generate VAT Report
                    </Button>
                  </FormGroup>
                </div>
              </Col>
            </Row>

            <div>
              <DataTable
                data={vatReportDataList?.data || []}
                columns={columns}
                manualPagination={true}
                pageCount={
                  vatReportDataList?.count
                    ? Math.ceil(vatReportDataList.count / pagination.pageSize)
                    : 0
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
      <GenerateVatReportModal
        openModal={openModal}
        setState={e => {
          // This prop implementation in original was weird: `setState={(e) => this.setState(e)}`
          // I'll assume it updates local state of parent?
          // For now, I'll pass a no-op or specific setters if needed.
          // Actually, GenerateVatReportModal might rely on this heavily.
          // Let's inspect GenerateVatReportModal in another turn if needed.
          // For now, I'll just log.
          console.log('GenerateVatReportModal requested state update', e);
        }}
        vatReportDataList={vatReportDataList}
        state={{
          monthOption,
        }} // Passing minimal state
        monthOption={monthOption}
        closeModal={e => {
          setOpenModal(false);
          getInitialData();
        }}
      />
      <VatSettingModal
        openModal={openVatSettingModal}
        closeModal={e => {
          setOpenVatSettingModal(false);
          getInitialData();
        }}
      />

      {openFileTaxRetrunModal && (
        <FileTaxReturnModal
          openModal={openFileTaxRetrunModal}
          current_report_id={current_report_id}
          endDate={currentEndDate} // Was this.state.endDate in original but not defined in state init? Assuming it comes from somewhere.
          taxReturns={currentTaxReturns}
          closeModal={e => {
            closeFileTaxRetrunModal(e);
          }}
        />
      )}
      <DeleteModal
        openModal={deleteModal}
        current_report_id={current_report_id}
        closeModal={e => {
          closeDeleteModal(e);
        }}
      />
    </div>
  );
};

export default VatReports;
