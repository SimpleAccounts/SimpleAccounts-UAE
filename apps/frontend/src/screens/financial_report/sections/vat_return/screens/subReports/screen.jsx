import React, { useState, useEffect, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Card, CardHeader, CardBody } from 'components/migration';
import { AuthActions, CommonActions } from 'services/global';
import * as VatreportAction from './actions';
import logo from 'assets/images/brand/logo.png';
import dayjs from '@/utils/date';
import * as FinancialReportActions from '../../../../actions';
import { Currency, Loader } from 'components';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate, useLocation } from 'react-router-dom';
import './style.scss';
import { History, ArrowLeftCircle } from 'lucide-react';

const SubReports = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { company_profile } = useSelector(state => ({
    company_profile: state.reports.company_profile,
  }));

  const [loading, setLoading] = useState(true);
  const [dataList, setDataList] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    dispatch(FinancialReportActions.getCompany());
    getInitialData();
  }, []);

  const getInitialData = () => {
    let postData = {
      startDate: location.state.startDate,
      endDate: location.state.endDate,
      placeOfSupplyId: location.state.placeOfSupplyId,
    };
    dispatch(VatreportAction.getAmountDetailsByPlaceOfSupply(postData))
      .then(res => {
        if (res.status === 200) {
          setDataList(res.data);
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const getInvoice = (postingType, type, id) => {
    const { boxNo, description, startDate, endDate, placeOfSupplyId } = location.state;
    switch (postingType) {
      case 'INVOICE':
        if (type === 1) {
          navigate('/admin/expense/supplier-invoice/view', {
            state: {
              id,
              boxNo,
              description,
              startDate,
              endDate,
              placeOfSupplyId,
              crossLinked: true,
            },
          });
        } else {
          navigate('/admin/income/customer-invoice/view', {
            state: {
              id,
              boxNo,
              description,
              startDate,
              endDate,
              placeOfSupplyId,
              crossLinked: true,
            },
          });
        }
        break;
      case 'EXPENSE':
        navigate('/admin/expense/expense/view', {
          state: {
            expenseId: id,
            boxNo,
            description,
            startDate,
            endDate,
            placeOfSupplyId,
            crossLinked: true,
          },
        });
        break;
      case 'MANUAL':
        navigate('/admin/accountant/journal/detail', { state: { id } });
        break;
      default:
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ getValue }) => (getValue() ? dayjs(getValue()).format('DD-MM-YYYY') : '-'),
      },
      {
        accessorKey: 'entry',
        header: 'Entry #',
        cell: ({ row }) => {
          const entry = row.original.entry || '';
          const id = row.original.id;
          const handleClick = () => {
            if (entry.includes('SUP')) {
              getInvoice('INVOICE', 1, id);
            } else if (entry.includes('INV')) {
              getInvoice('INVOICE', 2, id);
            } else {
              getInvoice('EXPENSE', 0, id);
            }
          };
          return (
            <p className="text-blue-600 cursor-pointer hover:underline mb-0" onClick={handleClick}>
              {entry}
            </p>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ getValue, row }) => (
          <div className="text-right">
            <Currency value={getValue()} currencySymbol={row.original.currency || 'AED'} />
          </div>
        ),
      },
      {
        accessorKey: 'vatAmount',
        header: 'Vat Amount',
        cell: ({ getValue, row }) => (
          <div className="text-right">
            <Currency value={getValue()} currencySymbol={row.original.currency || 'AED'} />
          </div>
        ),
      },
    ],
    [location.state, navigate]
  );

  if (loading) return <Loader />;

  return (
    <div className="import-bank-statement-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>{location.state.description}</span>
              </div>
              <Button color="primary" onClick={() => navigate(-1)}>
                Back <ArrowLeftCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex justify-between mb-4">
              <img
                src={
                  company_profile?.companyLogoByteArray
                    ? `data:image/jpg;base64,${company_profile.companyLogoByteArray}`
                    : logo
                }
                alt="logo"
                style={{ width: '150px' }}
              />
              <div className="text-center">
                <h2>{company_profile?.companyName || 'ABC GROUP'}</h2>
                <b className="text-lg">{location.state.description}</b>
                <br />
                From {location.state.startDate?.replaceAll('/', '-')} To{' '}
                {location.state.endDate?.replaceAll('/', '-')}
              </div>
              <div style={{ width: '150px' }}></div>
            </div>

            <DataTable
              data={dataList || []}
              columns={columns}
              manualPagination={false}
              pagination={pagination}
              onPaginationChange={setPagination}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default connect()(SubReports);
