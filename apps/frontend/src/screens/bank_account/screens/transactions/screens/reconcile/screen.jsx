import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Ban, ChevronDown, ChevronUp, CircleDot, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { CommonActions } from 'services/global';
import dayjs from '@/utils/date';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import * as transactionReconcileActions from './actions';
import * as transactionActions from '../../actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { ViewBankAccount } from './sections';
import { data } from '../../../../../Language/index';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);

// Zod validation schema
const reconcileSchema = z.object({
  date: z.date({
    required_error: 'Date is Required',
    invalid_type_error: 'Date is Required',
  }),
  closingBalance: z.string().min(1, 'Closing Balance is Required'),
});

function ReconcileTransaction() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const reconcile_list = useSelector(state => state.bank_account.reconcile_list);

  // Actions
  const transactionActionsObj = useMemo(
    () => bindActionCreators(transactionActions, dispatch),
    [dispatch]
  );
  const transactionReconcileActionsObj = useMemo(
    () => bindActionCreators(transactionReconcileActions, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [view, setView] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [actionButtons, setActionButtons] = useState({});

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Form setup with React Hook Form
  const form = useForm({
    resolver: zodResolver(reconcileSchema),
    defaultValues: {
      closingBalance: '',
      date: null,
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  const initializeData = useCallback(() => {
    const data = {
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    if (location.state && location.state.bankAccountId) {
      const postData = {
        ...data,
        bankId: location.state.bankAccountId,
      };
      transactionReconcileActionsObj
        .getReconcileList(postData)
        .then(res => {
          if (res.status === 200) {
            setLoading(false);
          }
        })
        .catch(err => {
          commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          );
          setLoading(false);
        });
    } else {
      navigate('/admin/banking/bank-account');
    }
  }, [location.state, pagination, transactionReconcileActionsObj, commonActions, navigate]);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination]);

  const onSubmit = useCallback(
    data => {
      setDisabled(true);
      setLoading(true);
      setDisableLeavePage(true);
      setLoadingMsg('Reconciling...');

      const bankAccountId = location.state.bankAccountId;
      const { closingBalance, date } = data;
      let formData = new FormData();
      formData.append('bankId ', bankAccountId ? bankAccountId : '');
      formData.append('closingBalance', closingBalance ? closingBalance : '');
      formData.append('date', date ? dayjs(date).format('DD-MM-YYYY') : '');

      transactionReconcileActionsObj
        .reconcilenow(formData)
        .then(res => {
          if (res.status === 200) {
            setDisabled(false);
            reset();
            if (res.data.status === 1) {
              commonActions.tostifyAlert('success', res.data.message);
              initializeData();
            } else {
              commonActions.tostifyAlert('error', res.data.message);
              setDisabled(false);
              setLoading(false);
              setDisableLeavePage(true);
              setLoadingMsg('');
            }
          }
        })
        .catch(err => {
          commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          );
        });
    },
    [location.state, transactionReconcileActionsObj, commonActions, initializeData, reset]
  );

  const editDetails = useCallback(() => {
    setView(false);
  }, []);

  const closeReconciled = useCallback(_id => {
    const message1 = (
      <text>
        <b>Delete Bank Reconciliation?</b>
      </text>
    );
    const message = 'The bank reconciliation of the transaction will be undone. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={() => removeReconciled(_id)}
        cancelHandler={removeDialog}
        message1={message1}
        message={message}
      />
    );
  }, []);

  const removeReconciled = useCallback(
    _id => {
      removeDialog();
      let obj = {
        ids: [_id],
      };
      transactionReconcileActionsObj
        .removeBulkReconciled(obj)
        .then(() => {
          commonActions.tostifyAlert('success', 'Deleted Successfully');
          initializeData();
        })
        .catch(err => {
          commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          );
        });
    },
    [transactionReconcileActionsObj, commonActions, initializeData]
  );

  const removeDialog = useCallback(() => {
    setDialog(null);
  }, []);

  const toggleActionButton = useCallback(index => {
    setActionButtons(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  // Column definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: 'reconciledDate',
        header: strings.RECONCILEDATE,
        enableSorting: true,
      },
      {
        accessorKey: 'reconciledDuration',
        header: strings.RECONCILEDURATION,
        enableSorting: true,
      },
      {
        accessorKey: 'closingBalance',
        header: strings.ClosingBalance,
        enableSorting: true,
        cell: ({ row }) => {
          const balance = row.original.closingBalance;
          return balance ? `AED ${balance.toFixed(2)}` : '';
        },
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {actionButtons[row.original.reconcileId] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => closeReconciled(row.original.reconcileId)}>
                  <Trash2 className="h-4 w-4" /> {strings.Delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [actionButtons, closeReconciled]
  );

  const handlePaginationChange = useCallback(newPagination => {
    setPagination(newPagination);
  }, []);

  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

  return (
    <div className="detail-bank-transaction-screen">
      <div className="animated fadeIn">
        {dialog}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 mx-auto">
            {loading ? (
              <Loader />
            ) : view ? (
              <ViewBankAccount
                initialVals={{
                  closingBalance: '',
                  date: '',
                }}
                editDetails={() => {
                  editDetails();
                }}
              />
            ) : (
              <Card>
                <CardHeader>
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12">
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="icon-doc" />
                        <span className="ml-2">{strings.ReconcileTransaction} </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12">
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-4">
                            <div className="mb-3">
                              <Label htmlFor="date">
                                <span className="text-danger">* </span>
                                {strings.BankClosingDate}
                              </Label>
                              <Controller
                                name="date"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    id="date"
                                    placeholderText={strings.Select + ' ' + strings.BankClosingDate}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    maxDate={new Date()}
                                    selected={field.value}
                                    onChange={value => field.onChange(value)}
                                    className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                                  />
                                )}
                              />
                              {errors.date && (
                                <div className="invalid-feedback">{errors.date.message}</div>
                              )}
                            </div>
                          </div>
                          <div className="col-span-4">
                            <div className="mb-3">
                              <Label htmlFor="closingBalance">
                                <span className="text-danger">* </span>
                                {strings.ClosingBalance}
                              </Label>
                              <Controller
                                name="closingBalance"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    maxLength="14,2"
                                    min="0"
                                    id="closingBalance"
                                    placeholder={strings.Amount}
                                    {...field}
                                    onChange={e => {
                                      if (
                                        e.target.value === '' ||
                                        regDecimal.test(e.target.value)
                                      ) {
                                        field.onChange(e);
                                      }
                                    }}
                                    className={errors.closingBalance ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.closingBalance && (
                                <div className="invalid-feedback">
                                  {errors.closingBalance.message}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-12 mt-5">
                            <div className="text-right">
                              <Button
                                type="submit"
                                variant="default"
                                className="btn-square mr-3"
                                disabled={disabled}
                              >
                                <CircleDot className="h-4 w-4" />{' '}
                                {disabled ? 'Reconciling...' : strings.reconcile}
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                className="btn-square"
                                onClick={() =>
                                  navigate('/admin/banking/bank-account/transaction', {
                                    bankAccountId: location.state.bankAccountId,
                                  })
                                }
                              >
                                <Ban className="h-4 w-4" /> {strings.Cancel}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                  <hr />
                  <div className="grid grid-cols-12 gap-4">
                    <DataTable
                      columns={columns}
                      data={reconcile_list.data || []}
                      manualPagination={true}
                      pageCount={Math.ceil((reconcile_list.count || 0) / pagination.pageSize)}
                      totalRows={reconcile_list.count || 0}
                      pagination={pagination}
                      onPaginationChange={handlePaginationChange}
                      loading={loading}
                      emptyMessage="There are no records to display."
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
}

export default ReconcileTransaction;
