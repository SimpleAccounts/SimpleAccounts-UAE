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
import * as FTAreport from './actions';
import GenerateFTAreport from './sections/generateFTAauditFile.jsx';
import dayjs from '@/utils/date';
import { ConfirmDeleteModal, Currency } from 'components';
import { data as languageData } from '../../../Language/index';
import VatSettingModal from './sections/vatSettingModal.jsx';
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
import { ChevronDown, Eye, Plus, Trash2 } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const FtaAuditReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { version } = useSelector(state => ({
    version: state.common.version,
  }));

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [openGenerateModal, setOpenGenerateModal] = useState(false);
  const [openVatSettingModal, setOpenVatSettingModal] = useState(false);
  const [ftaAuditReporttDataList, setFtaAuditReporttDataList] = useState({ data: [], count: 0 });
  const [dialog, setDialog] = useState(null);
  const [current_report_id, setCurrentReportId] = useState('');

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

  const getInitialData = () => {
    const paginationData = {
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    const sortingData = {
      order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: sorting.length > 0 ? sorting[0].id : '',
    };
    const postData = { ...filterData, ...paginationData, ...sortingData };

    dispatch(FTAreport.getVatReportList(postData))
      .then(res => {
        if (res.status === 200) {
          let arrayList = {};
          arrayList.count = res.data.count;
          if (res.data?.data && res.data?.data.length && res.data?.data.length != 0)
            arrayList.data = res.data?.data.filter(row => row.status != 'UnFiled');

          setFtaAuditReporttDataList(arrayList);
        }
      })
      .catch(err => {
        toast.error(err && err.data ? err.data.message : 'Something Went Wrong');
      });
  };

  const deleteReport = id => {
    const message1 = (
      <text>
        <b>Delete VAT Report File ?</b>
      </text>
    );
    const message = 'This vat report file will be deleted permanently and cannot be recovered. ';

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
    dispatch(FTAreport.deleteReportById(id))
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
        toast.error(err?.data ? err?.data?.message : 'VAT Report File Deleted Unsuccessfully');
        setDialog(null);
      });
  };

  const renderDate = cell => {
    return cell ? dayjs(cell).format('DD-MM-YYYY') : '-';
  };

  const renderStartDate = cell => {
    let dateArr = cell ? cell.split('-') : [];
    return <>{dateArr[0].replaceAll('/', '-')}</>;
  };

  const renderEnd = cell => {
    let dateArr = cell ? cell.split('-') : [];
    return <>{dateArr[1].replaceAll('/', '-')}</>;
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
              navigate('/admin/report/ftaAuditReports/view', {
                state: {
                  startDate: dateArr[0],
                  endDate: dateArr[1],
                  userId: row.userId,
                  companyId: 1,
                  taxAgencyId: row.taxAgencyId,
                },
              });
            }}
          >
            <Eye className="h-4 w-4" /> View
          </ShadcnDropdownMenuItem>

          <ShadcnDropdownMenuItem
            onClick={() => {
              deleteReport(row.id);
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </ShadcnDropdownMenuItem>
        </ShadcnDropdownMenuContent>
      </ShadcnDropdownMenu>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'taxReturnsStart', // Custom key
        header: strings.Audit_Start_Date,
        cell: ({ row }) => renderStartDate(row.original.taxReturns),
      },
      {
        accessorKey: 'taxReturnsEnd', // Custom key
        header: strings.Audit_End_Date,
        cell: ({ row }) => renderEnd(row.original.taxReturns),
      },
      {
        accessorKey: 'createdDate',
        header: strings.Created_Date,
        cell: ({ row }) => renderDate(row.original.createdDate),
      },
      {
        accessorKey: 'createdBy',
        header: strings.Created_By,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => <div className="text-right">{getActionButtons(row.original)}</div>,
      },
    ],
    []
  );

  return (
    <div className="import-bank-statement-screen">
      <GenerateFTAreport
        openModal={openGenerateModal}
        closeModal={() => {
          setOpenGenerateModal(false);
        }}
      />
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
                        fontSize: '1.3rem',
                        paddingLeft: '15px',
                      }}
                    >
                      {strings.FTA_Audit_Report}
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
                        setOpenGenerateModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4" /> Create FTA Audit Report
                    </Button>
                    <Button
                      color="primary"
                      className="btn-square  pull-right"
                      onClick={() => {
                        setOpenVatSettingModal(true);
                      }}
                    >
                      <i className="fa"></i>Company Details
                    </Button>
                  </FormGroup>
                </div>
              </Col>
            </Row>

            <div>
              <DataTable
                data={ftaAuditReporttDataList?.data || []}
                columns={columns}
                manualPagination={true}
                pageCount={
                  ftaAuditReporttDataList?.count
                    ? Math.ceil(ftaAuditReporttDataList.count / pagination.pageSize)
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
      <VatSettingModal
        openModal={openVatSettingModal}
        closeModal={() => {
          setOpenVatSettingModal(false);
          getInitialData();
        }}
      />
    </div>
  );
};

export default FtaAuditReport;
