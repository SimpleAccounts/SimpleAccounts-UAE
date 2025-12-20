import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { ChevronDown, ChevronUp } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { Formik } from 'formik';
import * as Yup from 'yup';
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

function ReconcileTransaction() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const formRef = useRef();

  // Redux state
  const reconcile_list = useSelector((state) => state.bank_account.reconcile_list);

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
  const [initValue, setInitValue] = useState({
    closingBalance: '',
    date: '',
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

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
        .then((res) => {
          if (res.status === 200) {
            setLoading(false);
          }
        })
        .catch((err) => {
          commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          );
          setLoading(false);
        });
    } else {
      navigate('/admin/banking/bank-account');
    }
  }, [
    location.state,
    pagination,
    transactionReconcileActionsObj,
    commonActions,
    navigate,
  ]);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination]);

  const handleSubmit = useCallback(
    (data, resetForm) => {
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
        .then((res) => {
          if (res.status === 200) {
            setDisabled(false);
            resetForm();
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
        .catch((err) => {
          commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          );
        });
    },
    [
      location.state,
      transactionReconcileActionsObj,
      commonActions,
      initializeData,
    ]
  );

  const editDetails = useCallback(() => {
    setView(false);
  }, []);

  const closeReconciled = useCallback(
    (_id) => {
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
    },
    []
  );

  const removeReconciled = useCallback(
    (_id) => {
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
        .catch((err) => {
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

  const toggleActionButton = useCallback((index) => {
    setActionButtons((prev) => ({
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
                  <i className="fa fa-trash mr-2" /> {strings.Delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [actionButtons, closeReconciled]
  );

  const handlePaginationChange = useCallback((newPagination) => {
    setPagination(newPagination);
  }, []);

  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

  return (
    <div className="detail-bank-transaction-screen">
      <div className="animated fadeIn">
        {dialog}
        <div className="grid grid-cols-12 gap-4">
          <div lg={12} className="mx-auto">
            {loading ? (
              <Loader />
            ) : view ? (
              <ViewBankAccount
                initialVals={initValue}
                editDetails={() => {
                  editDetails();
                }}
              />
            ) : (
              <Card>
                <CardHeader>
                  <div className="grid grid-cols-12 gap-4">
                    <div lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="icon-doc" />
                        <span className="ml-2">{strings.ReconcileTransaction} </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-12 gap-4">
                    <div lg={12}>
                      <Formik
                        initialValues={initValue}
                        innerRef={formRef}
                        onSubmit={(values, { resetForm }) => {
                          handleSubmit(values, resetForm);
                        }}
                        validationSchema={Yup.object().shape({
                          date: Yup.date().required('Date is Required'),
                          closingBalance: Yup.string().required('Closing Balance is Required'),
                        })}
                      >
                        {(props) => (
                          <form onSubmit={props.handleSubmit}>
                            <div className="grid grid-cols-12 gap-4">
                              <div lg={4}>
                                <div className="mb-3">
                                  <Label htmlFor="date">
                                    <span className="text-danger">* </span>
                                    {strings.BankClosingDate}
                                  </Label>
                                  <DatePicker
                                    id="date"
                                    name="date"
                                    placeholderText={
                                      strings.Select + ' ' + strings.BankClosingDate
                                    }
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    maxDate={new Date()}
                                    value={
                                      props.values.date
                                        ? dayjs(props.values.date).format('DD-MM-YYYY')
                                        : ''
                                    }
                                    onChange={(value) => props.handleChange('date')(value)}
                                    className={`form-control ${
                                      props.errors.date && props.touched.date
                                        ? 'is-invalid'
                                        : ''
                                    }`}
                                  />
                                  {props.errors.date && props.touched.date && (
                                    <div className="invalid-feedback">{props.errors.date}</div>
                                  )}
                                </div>
                              </div>
                              <div lg={4}>
                                <div className="mb-3">
                                  <Label htmlFor="closingBalance">
                                    <span className="text-danger">* </span>
                                    {strings.ClosingBalance}
                                  </Label>
                                  <Input
                                    type="text"
                                    maxLength="14,2"
                                    min="0"
                                    id="closingBalance"
                                    name="closingBalance"
                                    placeholder={strings.Amount}
                                    onChange={(option) => {
                                      if (
                                        option.target.value === '' ||
                                        regDecimal.test(option.target.value)
                                      ) {
                                        props.handleChange('closingBalance')(option);
                                      }
                                    }}
                                    value={props.values.closingBalance}
                                    className={
                                      props.errors.closingBalance &&
                                      props.touched.closingBalance
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                  {props.errors.closingBalance &&
                                    props.touched.closingBalance && (
                                      <div className="invalid-feedback">
                                        {props.errors.closingBalance}
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-12 gap-4">
                              <div lg={12} className="mt-5">
                                <div className="text-right">
                                  <Button
                                    type="button"
                                    variant="default"
                                    className="btn-square mr-3"
                                    disabled={disabled}
                                    onClick={props.handleSubmit}
                                  >
                                    <i className="fa fa-dot-circle-o"></i>{' '}
                                    {disabled ? 'Reconciling...' : strings.reconcile}
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="btn-square"
                                    onClick={() =>
                                      navigate('/admin/banking/bank-account/transaction', {
                                        bankAccountId: location.state.bankAccountId,
                                      })
                                    }
                                  >
                                    <i className="fa fa-ban"></i> {strings.Cancel}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </form>
                        )}
                      </Formik>
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
