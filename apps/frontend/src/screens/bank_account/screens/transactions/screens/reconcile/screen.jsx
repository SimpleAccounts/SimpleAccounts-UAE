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
import { toast } from 'sonner';
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

// Zod validation schema (date can be Date or string from picker/locale)
const reconcileSchema = z.object({
  date: z.union([
    z.date({ required_error: 'Date is Required', invalid_type_error: 'Date is Required' }),
    z.string().min(1, 'Date is Required'),
  ]),
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
  const [isLoading, setIsLoading] = useState(true);
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

  const showError = useCallback(message => {
    toast.error(message, { position: 'top-right', duration: 5000 });
  }, []);

  const showSuccess = useCallback(message => {
    toast.success(message, { position: 'top-right', duration: 4000 });
  }, []);

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
            setIsLoading(false);
          }
        })
        .catch(err => {
          showError(err && err.data ? err.data.message : 'Something Went Wrong');
          setIsLoading(false);
        });
    } else {
      navigate('/admin/banking/bank-account');
    }
  }, [location.state, pagination, transactionReconcileActionsObj, showError, navigate]);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination]);

  const onSubmit = useCallback(
    data => {
      const bankAccountId = location.state?.bankAccountId;
      if (!bankAccountId) {
        showError(
          'Bank account is missing. Please go back and open Reconcile from the transaction list.'
        );
        return;
      }

      setDisabled(true);
      setIsLoading(true);
      setDisableLeavePage(true);
      setLoadingMsg('Reconciling...');

      const { closingBalance, date } = data;
      const dateStr = date
        ? typeof date === 'string'
          ? date
          : dayjs(date).format('DD-MM-YYYY')
        : '';
      const params = new URLSearchParams();
      params.append('bankId', String(bankAccountId));
      params.append('closingBalance', String(closingBalance ?? ''));
      params.append('date', dateStr);

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/9820ccb9-53bb-49da-b89d-d829448cd2c5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'reconcile/screen.jsx:before-reconcilenow',
          message: 'Reconcile submit payload',
          data: {
            bankAccountId,
            dateStr,
            closingBalance: closingBalance ?? '',
            paramsString: params.toString(),
          },
          timestamp: Date.now(),
          hypothesisId: 'H5',
        }),
      }).catch(() => {});
      // #endregion

      transactionReconcileActionsObj
        .reconcilenow(params)
        .then(res => {
          if (res?.status === 200) {
            setDisabled(false);
            setIsLoading(false);
            setDisableLeavePage(false);
            setLoadingMsg('');
            reset();
            if (res.data?.status === 1) {
              showSuccess(res.data.message ?? 'Reconciled successfully.');
              initializeData();
            } else {
              showError(res.data?.message ?? 'Reconciliation failed.');
            }
          }
        })
        .catch(err => {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/9820ccb9-53bb-49da-b89d-d829448cd2c5', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'reconcile/screen.jsx:catch',
              message: 'Reconcile request failed',
              data: {
                status: err?.response?.status,
                dataMessage: err?.data?.message ?? err?.response?.data?.message,
                responseData: err?.response?.data,
              },
              timestamp: Date.now(),
              hypothesisId: 'H1,H2,H4',
            }),
          }).catch(() => {});
          // #endregion
          setDisabled(false);
          setIsLoading(false);
          setDisableLeavePage(false);
          setLoadingMsg('');
          const message =
            err?.data?.message ??
            err?.response?.data?.message ??
            err?.message ??
            'Something went wrong. Please try again.';
          showError(message);
        });
    },
    [location.state, transactionReconcileActionsObj, initializeData, reset, showError, showSuccess]
  );

  const onInvalid = useCallback(
    errors => {
      const firstError = errors?.date?.message ?? errors?.closingBalance?.message;
      const message = firstError ?? 'Please fill in Bank Closing Date and Closing Balance.';
      showError(message);
    },
    [showError]
  );

  const editDetails = useCallback(() => {
    setView(false);
  }, []);

  const closeReconciled = useCallback(_id => {
    const message1 = (
      <span>
        <b>Delete Bank Reconciliation?</b>
      </span>
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
          showSuccess('Deleted Successfully');
          initializeData();
        })
        .catch(err => {
          showError(err && err.data ? err.data.message : 'Something Went Wrong');
        });
    },
    [transactionReconcileActionsObj, initializeData, showSuccess, showError]
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

  // Column definitions (minSize prevents header truncation e.g. "Reconcile Run Date" -> "REC RUN")
  const columns = useMemo(
    () => [
      {
        accessorKey: 'reconciledDate',
        header: strings.RECONCILEDATE,
        enableSorting: true,
        minSize: 180,
      },
      {
        accessorKey: 'reconciledDuration',
        header: strings.RECONCILEDURATION,
        enableSorting: true,
        minSize: 160,
      },
      {
        accessorKey: 'closingBalance',
        header: strings.ClosingBalance,
        enableSorting: true,
        minSize: 140,
        cell: ({ row }) => {
          const balance = row.original.closingBalance;
          return balance ? `AED ${balance.toFixed(2)}` : '';
        },
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        size: 60,
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
            {isLoading ? (
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
                      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
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
                                    state: {
                                      bankAccountId: location.state?.bankAccountId,
                                    },
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
                    <div className="col-span-12 w-full">
                      <DataTable
                        columns={columns}
                        data={reconcile_list.data || []}
                        manualPagination={true}
                        pageCount={Math.ceil((reconcile_list.count || 0) / pagination.pageSize)}
                        totalCount={reconcile_list.count || 0}
                        onPaginationChange={handlePaginationChange}
                        isLoading={isLoading}
                      />
                    </div>
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
