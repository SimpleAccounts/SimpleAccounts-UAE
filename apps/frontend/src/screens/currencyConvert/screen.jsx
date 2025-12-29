import { useState, useEffect, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Card, CardHeader, CardBody, Button, Row, Col } from 'components/migration';
import { toast } from 'sonner';
import { Loader } from 'components';
import * as CurrencyConvertActions from './actions';
import { data as languageData } from '../Language/index';
import LocalizedStrings from 'react-localization';
import config from 'constants/config';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate } from 'react-router-dom';
import { Banknote, Plus } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const CurrencyConvert = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currency_converstion_list } = useSelector(state => ({
    currency_converstion_list: state.currencyConvert.currency_converstion_list,
  }));

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);
  const [filterData] = useState({
    currencyCode: '',
    currencyCodeConvertedTo: '',
    exchangeRate: '',
  });

  useEffect(() => {
    strings.setLanguage(language);
    initializeData();
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

    dispatch(CurrencyConvertActions.getCurrencyConversion(postData))
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        toast.error(err && err.data ? err.data.message : 'Something Went Wrong');
      });
  };

  const goToDetail = row => {
    if (!config.ADD_CURRENCY) return;
    if (row.currencyConversionId === 10000) {
      toast.error('Cannot Edit Base Currency');
    } else {
      navigate(`/admin/master/currencyConvert/detail`, { state: { id: row.currencyConversionId } });
    }
  };

  const renderCurrency = value => {
    if (value) {
      return <label className="badge label-currency mb-0">{value}</label>;
    } else {
      return <label className="badge badge-danger mb-0">No Specified</label>;
    }
  };

  const renderStatus = isActive => {
    let classname = '';
    if (isActive === true) {
      classname = 'label-success';
    } else {
      classname = 'label-due';
    }
    return (
      <span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
        {isActive === true ? 'Active' : 'InActive'}
      </span>
    );
  };

  const renderBaseCurrency = value => {
    if (value) {
      return <label className="badge label-currency mb-0">{value}</label>;
    } else {
      return <label className="badge badge-danger mb-0">No Specified</label>;
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'currencyName',
        header: strings.CURRENCYNAME,
        cell: ({ getValue }) => renderCurrency(getValue()),
      },
      {
        accessorKey: 'description',
        header: strings.CURRENCYNAMECONVERTEDTO,
        cell: ({ getValue }) => renderBaseCurrency(getValue()),
      },
      {
        accessorKey: 'exchangeRate',
        header: strings.EXCHANGERATE,
      },
      {
        accessorKey: 'isActive',
        header: strings.Status,
        cell: ({ getValue }) => renderStatus(getValue()),
      },
    ],
    []
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="vat-code-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            <div className="h4 mb-0 d-flex align-items-center">
              <Banknote className="h-4 w-4" />
              <span className="ml-2"> {strings.CurrencyRate}</span>
            </div>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={12}>
                <div className="d-flex justify-content-end">
                  {config.ADD_CURRENCY && (
                    <Button
                      color="primary"
                      className="btn-square pull-right"
                      style={{ marginBottom: '10px' }}
                      onClick={() => navigate(`/admin/master/CurrencyConvert/create`)}
                    >
                      <Plus className="h-4 w-4" />
                      {strings.AddNewCurrencyConversion}
                    </Button>
                  )}
                </div>

                <DataTable
                  data={currency_converstion_list?.data || []}
                  columns={columns}
                  manualPagination={true}
                  pageCount={
                    currency_converstion_list?.count
                      ? Math.ceil(currency_converstion_list.count / pagination.pageSize)
                      : 0
                  }
                  onPaginationChange={setPagination}
                  pagination={pagination}
                  manualSorting={true}
                  onSortingChange={setSorting}
                  sorting={sorting}
                  onRowClick={goToDetail}
                />
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default connect()(CurrencyConvert);
