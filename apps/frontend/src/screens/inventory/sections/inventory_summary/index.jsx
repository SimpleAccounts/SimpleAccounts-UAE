import React, { useState, useEffect, useMemo, useRef } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Button, FormGroup, Form, ButtonGroup } from 'components/migration';
import dayjs from '@/utils/date';
import { PDFExport } from '@progress/kendo-react-pdf';
import * as FileSaver from 'file-saver';
import { ExcelExport as XLSX } from 'utils';
import { Loader } from 'components';
import * as ProductActions from '../../../product/actions';
import * as InventoryActions from '../../actions';
import logo from 'assets/images/brand/logo.png';
import { CommonActions } from 'services/global';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { InventoryHistoryModal } from './sections';
import { DataTable } from '@/components/ui/data-table';
import './style.scss';
import { toast } from 'sonner';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { History } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const InventorySummary = () => {
  const dispatch = useDispatch();

  const { summary_list, company_profile } = useSelector(state => ({
    summary_list: state.inventory.summary_list,
    company_profile: state.common.company_profile,
  }));

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(false);
  const [initValue, setInitValue] = useState({
    startDate: dayjs().startOf('month').format('DD/MM/YYYY'),
    endDate: dayjs().local().format('DD-MM-YYYY'),
  });
  const [openModal, setOpenModal] = useState(false);
  const [inventory_history_list, setInventoryHistoryList] = useState([]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);
  const [filterData, setFilterData] = useState({
    name: '',
    email: '',
  });

  const pdfExportComponent = useRef(null);

  useEffect(() => {
    strings.setLanguage(language);
    dispatch(CommonActions.getCompany());
  }, [language]);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  const initializeData = () => {
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

    dispatch(InventoryActions.getProductInventoryList(postData))
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        toast.error(err?.data?.message || 'Something Went Wrong');
      });
  };

  const onBtnExport = () => {
    const paginationData = {
      pageNo: 0,
      pageSize: 9000,
    };
    const sortingData = {
      order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: sorting.length > 0 ? sorting[0].id : '',
    };
    const postData = { ...filterData, ...paginationData, ...sortingData };

    dispatch(InventoryActions.getProductInventoryList(postData))
      .then(res => {
        if (res.status === 200) {
          const csvConfig = mkConfig({
            useKeysAsHeaders: true,
            filename: 'Inventory Summary List',
          });
          const csv = generateCsv(csvConfig)(res.data.data);
          download(csvConfig)(csv);
          initializeData(); // Re-fetch current page
        }
      })
      .catch(err => {
        toast.error(err?.data?.message || 'Something Went Wrong');
      });
  };

  const renderName = cell => {
    return <span>{cell ? cell : '-'}</span>;
  };

  const renderActions = row => {
    return (
      <div>
        <Button
          className="btn btn-lg "
          style={{ padding: '0px' }}
          color="link"
          onClick={() => {
            if (row.supplierId !== null && row.productId !== null) {
              dispatch(
                ProductActions.getInventoryHistory({ p_id: row.productId, s_id: row.supplierId })
              )
                .then(res => {
                  if (res.status === 200) {
                    setInventoryHistoryList(res.data);
                    setOpenModal(true);
                  }
                })
                .catch(err => {
                  toast.error(err?.data?.message || 'Something Went Wrong');
                });
            } else {
              toast.success('Sorry , No supplier Available to View Inventory History List');
            }
          }}
        >
          <History className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'productCode',
        header: strings.PRODUCTCODE,
      },
      {
        accessorKey: 'productName',
        header: strings.PRODUCTNAME,
      },
      {
        accessorKey: 'purchaseOrder',
        header: strings.ORDERQUANTITY,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
      },
      {
        accessorKey: 'quantitySold',
        header: strings.QUANTITYSOLD,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
      },
      {
        accessorKey: 'stockInHand',
        header: strings.STOCKINHAND,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
      },
      {
        accessorKey: 'supplierName',
        header: strings.SUPPLIERNAME,
        cell: ({ getValue }) => <div className="text-center">{renderName(getValue())}</div>,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => <div className="text-right">{renderActions(row.original)}</div>,
      },
    ],
    []
  );

  const closeModal = () => {
    setOpenModal(false);
  };

  return (
    <div className="transactions-report-screen">
      <div className="animated fadeIn">
        <div id="section-to-print">
          <PDFExport ref={pdfExportComponent} scale={0.8} paperSize="A4">
            <br />
            <br />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <div>
                <img
                  src={
                    company_profile && company_profile.companyLogoByteArray
                      ? 'data:image/jpg;base64,' + company_profile.companyLogoByteArray
                      : logo
                  }
                  className=""
                  alt=""
                  style={{ width: ' 150px' }}
                ></img>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h2>
                  {company_profile && company_profile['companyName']
                    ? company_profile['companyName']
                    : ''}
                </h2>
                <b style={{ fontSize: '18px' }}>{strings.InventorySummary}</b>
                <br />
                <br />
                As on {initValue.endDate.replaceAll('/', '-')}
              </div>

              <div>
                <Form onSubmit={e => e.preventDefault()} name="simpleForm">
                  <div className="flex-wrap d-flex justify-content-end">
                    <FormGroup>
                      <ButtonGroup className="mr-3">
                        <Button color="primary" className="btn-square" onClick={onBtnExport}>
                          <Download className="h-4 w-4 mr-1" />
                          {strings.Export}
                        </Button>
                      </ButtonGroup>
                    </FormGroup>
                  </div>
                </Form>
              </div>
            </div>
            {loading ? (
              <Loader />
            ) : (
              <div>
                <DataTable
                  data={summary_list?.data || []}
                  columns={columns}
                  manualPagination={true}
                  manualSorting={true}
                  pageCount={
                    summary_list?.count ? Math.ceil(summary_list.count / pagination.pageSize) : 0
                  }
                  onPaginationChange={setPagination}
                  onSortingChange={setSorting}
                />
              </div>
            )}

            <div style={{ textAlignLast: 'right' }}>
              {' '}
              {strings.PoweredBy} <b>SimpleAccounts</b>
            </div>
          </PDFExport>
        </div>

        <InventoryHistoryModal
          openModal={openModal}
          closeModal={closeModal}
          inventory_history_list={inventory_history_list}
        />
      </div>
    </div>
  );
};

export default InventorySummary;
