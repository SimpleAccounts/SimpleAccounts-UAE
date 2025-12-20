import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Wallet, Save, Edit, RefreshCw } from 'lucide-react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Loader, Currency } from 'components';
import dayjs from '@/utils/date';
import { selectOptionsFactory, selectStyles } from 'utils';

import * as OpeningBalanceActions from './actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Modern Opening Balance Screen
 * Uses functional components, shadcn/ui, with inline editing
 */
function OpeningBalance() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const transaction_category_list = useSelector(
    state => state.opening_balance.transaction_category_list
  );
  const profile = useSelector(state => state.auth.profile);
  const opening_balance_list = useSelector(state => state.opening_balance.opening_balance_list);

  // Actions
  const openingBalanceActions = useMemo(
    () => bindActionCreators(OpeningBalanceActions, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [tempData, setTempData] = useState([]);
  const [submitBtnClick, setSubmitBtnClick] = useState(false);
  const [idCount, setIdCount] = useState(0);

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  const regEx = /^[0-9]+$/;

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Initialize data
  const initializeData = useCallback(() => {
    const paginationData = {
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    const sortingData = {
      order: sorting[0]?.desc ? 'desc' : sorting[0]?.id ? 'asc' : '',
      sortingCol: sorting[0]?.id || '',
    };
    const postData = { ...paginationData, ...sortingData };

    openingBalanceActions
      .getOpeningBalanceList(postData)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
          const data =
            res.data?.data?.map((item, index) => ({
              id: index,
              transactionCategoryBalanceId: item.transactionCategoryBalanceId,
              transactionCategory: {
                label: item.transactionCategoryName,
                value: item.transactionCategoryId,
              },
              openingBalance: item.openingBalance,
              effectiveDate: item.effectiveDate,
              disabled: true,
            })) || [];
          setTableData(data);
          setTempData(JSON.parse(JSON.stringify(data)));
        }
      })
      .catch(err => {
        setLoading(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  }, [openingBalanceActions, commonActions, pagination, sorting]);

  useEffect(() => {
    openingBalanceActions.getTransactionCategoryList();
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Get currency code
  const getCurrencyCode = () => {
    return profile?.company?.currencyCode?.currencyIsoCode || 'AED';
  };

  // Check if category is already selected
  const checkCategory = value => {
    return tableData.some(item => item.transactionCategory?.value === value && item.disabled);
  };

  // Add new row
  const addMore = () => {
    setTableData(prev => [
      {
        id: idCount,
        transactionCategory: '',
        openingBalance: '',
        effectiveDate: new Date(),
        create: true,
        disabled: false,
      },
      ...prev,
    ]);
    setIdCount(prev => prev + 1);
    setSubmitBtnClick(false);
  };

  // Select item handler
  const selectItem = (value, row, name) => {
    setTableData(prev =>
      prev.map(obj => {
        if (obj.id === row.id) {
          return { ...obj, [name]: value };
        }
        return obj;
      })
    );
  };

  // Enable edit for row
  const enableEdit = row => {
    setTableData(prev =>
      prev.map(obj => {
        if (obj.id === row.id) {
          return { ...obj, disabled: false };
        }
        return obj;
      })
    );
  };

  // Refresh row to original state
  const refreshRow = row => {
    const original = tempData.find(t => t.id === row.id);
    if (original) {
      setTableData(prev =>
        prev.map(obj => {
          if (obj.id === row.id) {
            return JSON.parse(JSON.stringify(original));
          }
          return obj;
        })
      );
    }
  };

  // Validate row
  const validateRow = row => {
    setSubmitBtnClick(true);
    return row.transactionCategory !== '' && row.openingBalance !== '';
  };

  // Handle save
  const handleSave = row => {
    if (!validateRow(row)) return;

    let save = true;
    const postData = {
      transactionCategoryId: row.transactionCategory.value,
      openingBalance: row.openingBalance,
      effectiveDate:
        typeof row.effectiveDate === 'string'
          ? row.effectiveDate
          : dayjs(row.effectiveDate).format('DD-MM-YYYY'),
    };

    if (row.transactionCategoryBalanceId) {
      save = false;
      postData.transactionCategoryBalanceId = row.transactionCategoryBalanceId;
    }

    openingBalanceActions.addOpeningBalance(postData, save).then(res => {
      if (res.status === 200) {
        const text = save ? 'added' : 'updated';
        commonActions.tostifyAlert(
          'success',
          res.data?.message || `Opening Balance ${text} Successfully.`
        );
        initializeData();
        setSubmitBtnClick(false);
      }
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="opening-balance-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">
                  {strings.OpeningBalance || 'Opening Balance'}
                </CardTitle>
              </div>
              <Button onClick={addMore}>
                <Plus className="mr-2 h-4 w-4" />
                {strings.AddNewOpeningBalance || 'Add New Opening Balance'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[250px]">
                      {strings.TransactionCategory || 'Transaction Category'}
                    </TableHead>
                    <TableHead className="min-w-[150px]">
                      {strings.EffectiveDate || 'Effective Date'}
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      {strings.Currency || 'Currency'}
                    </TableHead>
                    <TableHead className="min-w-[150px]">
                      {strings.OpeningBalance || 'Opening Balance'}
                    </TableHead>
                    <TableHead className="min-w-[120px]">{strings.Actions || 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Select
                          styles={selectStyles}
                          options={selectOptionsFactory.renderOptions(
                            'transactionCategoryName',
                            'transactionCategoryId',
                            transaction_category_list || [],
                            'Chart of Account'
                          )}
                          value={row.transactionCategory}
                          isDisabled={row.disabled}
                          menuPosition="fixed"
                          maxMenuHeight={250}
                          className={
                            row.transactionCategory === '' && submitBtnClick
                              ? 'border-destructive'
                              : ''
                          }
                          isOptionDisabled={option => checkCategory(option.value)}
                          onChange={option => selectItem(option, row, 'transactionCategory')}
                        />
                      </TableCell>
                      <TableCell>
                        {row.disabled ? (
                          <span>
                            {typeof row.effectiveDate === 'string'
                              ? row.effectiveDate
                              : dayjs(row.effectiveDate).format('DD-MM-YYYY')}
                          </span>
                        ) : (
                          <DatePicker
                            className="input-transition w-full border rounded px-2 py-1"
                            dateFormat="dd-MM-yyyy"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            selected={
                              typeof row.effectiveDate === 'string'
                                ? dayjs(row.effectiveDate, 'DD-MM-YYYY').toDate()
                                : row.effectiveDate
                            }
                            onChange={value => selectItem(value, row, 'effectiveDate')}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCurrencyCode()}</Badge>
                      </TableCell>
                      <TableCell>
                        {row.disabled ? (
                          <span>
                            {new Intl.NumberFormat('ar', {
                              style: 'currency',
                              currency: getCurrencyCode(),
                            }).format(row.openingBalance || 0)}
                          </span>
                        ) : (
                          <Input
                            type="text"
                            value={row.openingBalance || ''}
                            placeholder={strings.OpeningBalance || 'Opening Balance'}
                            onChange={e => {
                              if (e.target.value === '' || regEx.test(e.target.value)) {
                                selectItem(e.target.value, row, 'openingBalance');
                              }
                            }}
                            className={`input-transition ${
                              row.openingBalance === '' && submitBtnClick
                                ? 'border-destructive'
                                : ''
                            }`}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {row.disabled ? (
                            <Button variant="outline" size="icon" onClick={() => enableEdit(row)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          ) : (
                            <>
                              <Button variant="outline" size="icon" onClick={() => handleSave(row)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              {!row.create && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => refreshRow(row)}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OpeningBalance;
