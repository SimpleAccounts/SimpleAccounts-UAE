import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Check, X } from 'lucide-react';
import Select from 'react-select';
import Papa from 'papaparse';
import dayjs from '@/utils/date';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Loader } from 'components';
import { selectOptionsFactory, selectStyles } from 'utils';

import * as ImportTransactionActions from './actions';
import * as ImportBankStatementActions from '../import_bank_statement/actions';
import * as DetailBankAccountActions from '../bank_account/screens/detail/actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Modern Import Transaction Screen
 * Uses functional components, shadcn/ui, and CSV parsing
 */
function ImportTransaction() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const date_format_list = useSelector(state => state.import_transaction.date_format_list);

  // Actions
  const importTransactionActions = useMemo(
    () => bindActionCreators(ImportTransactionActions, dispatch),
    [dispatch]
  );
  const importBankStatementActions = useMemo(
    () => bindActionCreators(ImportBankStatementActions, dispatch),
    [dispatch]
  );
  const detailBankAccountActions = useMemo(
    () => bindActionCreators(DetailBankAccountActions, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [configurationList, setConfigurationList] = useState([]);
  const [selectedConfiguration, setSelectedConfiguration] = useState(
    location.state?.selectedTemplate || ''
  );
  const [delimiterList, setDelimiterList] = useState([]);
  const [selectedDelimiter, setSelectedDelimiter] = useState('');
  const [selectedDateFormat, setSelectedDateFormat] = useState('');
  const [dateFormat, setDateFormat] = useState('');
  const [tableHeader, setTableHeader] = useState([]);
  const [tableDataKey, setTableDataKey] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedValueDropdown, setSelectedValueDropdown] = useState([]);
  const [columnStatus, setColumnStatus] = useState([]);
  const [selectError, setSelectError] = useState([]);
  const [errorIndexList, setErrorIndexList] = useState([]);
  const [isHeaderRow, setIsHeaderRow] = useState(false);
  const [csv, setCsv] = useState('');
  const [date, setDate] = useState('');
  const [reconciledDate, setReconciledDate] = useState('');

  // Form values
  const [initValue, setInitValue] = useState({
    name: '',
    skipRows: '',
    headerRowNo: '',
    textQualifier: '',
    dateFormatId: '',
    delimiter: 'OTHER',
    otherDilimiterStr: '',
    endRows: '',
    skipColumns: [],
  });
  const [error, setError] = useState({});

  const config = useMemo(
    () => ({
      delimiter: '',
      newline: '',
      quoteChar: '"',
      escapeChar: '"',
      preview: '',
      encoding: '',
      worker: false,
      comments: false,
      step: undefined,
      complete: undefined,
      error: undefined,
      download: false,
      downloadRequestHeaders: undefined,
      downloadRequestBody: undefined,
      skipEmptyLines: true,
      chunk: undefined,
      chunkSize: undefined,
      fastMode: undefined,
      beforeFirstChunk: undefined,
      withCredentials: undefined,
      transform: undefined,
    }),
    []
  );

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Set configurations from template
  const setConfigurations = useCallback(
    configList => {
      const data = configList.filter(item => item.id === selectedConfiguration);
      if (data.length > 0) {
        setInitValue(prev => ({
          ...prev,
          skipRows: data[0].skipRows,
          headerRowNo: data[0].headerRowNo,
          delimiter: ',',
          textQualifier: data[0].textQualifier,
          otherDilimiterStr: data[0].otherDilimiterStr,
          endRows: data[0].endRows,
          skipColumns: data[0].skipColumns,
        }));
        setSelectedDateFormat(data[0].dateFormatId);
        setSelectedDelimiter(data[0].delimiter);
        setTemplateId(selectedConfiguration);
      }
    },
    [selectedConfiguration]
  );

  // Process CSV data
  const processData = useCallback(
    dataString => {
      if (!dataString) return;

      const parse = Papa.parse(dataString, config);
      const skipColumns = initValue.skipColumns;

      let newString = '';
      if (skipColumns && skipColumns.length > 0) {
        const skipColumnsList = skipColumns.split(',');
        skipColumnsList.forEach(row => {
          newString += parseInt(row) - 1 + ',';
        });
      }

      const dataStringLines = [...parse.data];
      const skipRows = initValue.skipRows;

      if (skipRows && skipRows !== '') {
        dataStringLines.splice(isHeaderRow ? 1 : 0, parseInt(skipRows));
      }

      const header = dataStringLines[0];
      const headers = header;
      const list = [];

      for (let i = 1; i < dataStringLines.length; i++) {
        const row = dataStringLines[i];
        if (headers && row.length === headers.length) {
          const obj = {};
          for (let j = 0; j < headers.length; j++) {
            if (!newString.includes(j.toString())) {
              let d = row[j];
              if (d && d.length > 0) {
                if (d[0] === '"') d = d.substring(1, d.length - 1);
                if (d[d.length - 1] === '"') d = d.substring(d.length - 2, 1);
              }
              if (headers[j]) {
                obj[headers[j]] = d;
              }
            }
          }
          if (Object.values(obj).filter(x => x).length > 0) {
            list.push(obj);
          }
        }
      }

      const csvData = Papa.unparse(list);
      setCsv(csvData);

      setTableData(list);
      setTableDataKey(headers);
      setInitValue(prev => ({
        ...prev,
        otherDilimiterStr: parse.meta.delimiter,
      }));

      // Initialize dropdown states
      const obj = { label: 'Select', value: '' };
      const tempObj = { label: '', status: false };
      const tempStatus = [];
      const tempDropDown = [];
      const tempError = [];

      headers.forEach(() => {
        tempStatus.push(tempObj);
        tempDropDown.push(obj);
        tempError.push(false);
      });

      setSelectedValueDropdown(tempDropDown);
      setColumnStatus(tempStatus);
      setSelectError(tempError);
      setLoading(false);
    },
    [config, initValue.skipRows, initValue.skipColumns, isHeaderRow]
  );

  // Initialize data
  useEffect(() => {
    const bankAccountId = location.state?.bankAccountId;

    if (!bankAccountId) {
      navigate('/admin/banking/bank-account');
      return;
    }

    importTransactionActions.getDateFormatList();

    importTransactionActions.getConfigurationList().then(res => {
      setConfigurationList(res.data);
      setConfigurations(res.data);
    });

    if (location.state?.dataString) {
      processData(location.state.dataString);
    }

    importTransactionActions.getTableHeaderList().then(res => {
      setTableHeader(res.data);
    });

    detailBankAccountActions
      .getBankAccountByID(bankAccountId)
      .then(res => {
        setDate(res.openingDate || '');
        setReconciledDate(res.lastReconcileDate || '');
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });

    importTransactionActions.getDelimiterList().then(res => {
      setDelimiterList(res.data);
      setSelectedDelimiter(res.data[1]?.value || '');
      setInitialLoading(false);
    });
  }, []);

  // Validate form
  const validateForm = () => {
    const temp = {};

    if (!initValue.name && !selectedConfiguration) {
      temp.name = '*Template name is required or Select existing template';
    }

    if (!selectedDateFormat) {
      temp.dateFormatId = '*Date format is required';
    }

    setError(temp);

    if (Object.keys(temp).length) {
      Object.values(temp).forEach(msg => {
        commonActions.tostifyAlert('error', msg);
      });
      return false;
    }

    return true;
  };

  // Handle dropdown change for column mapping
  const handleDropdownChange = (e, index) => {
    const tempDropDown = [...selectedValueDropdown];
    const tempStatus = [...columnStatus];
    const tempSelectError = [...selectError];

    // Check if already selected
    const status = tempDropDown.filter(item => item.value === e.value && e.value !== '');

    if (status.length > 0) {
      tempStatus[index] = { label: e.value, status: true };
      if (tempDropDown[index].value !== e.value) {
        setColumnStatus(tempStatus);
        setSelectedValueDropdown(tempDropDown);
      }
    } else if (e.value === '') {
      tempDropDown[index] = e;
      tempStatus[index] = { label: '', status: false };
      setColumnStatus(tempStatus);
      setSelectedValueDropdown(tempDropDown);
    } else {
      tempDropDown[index] = e;
      tempSelectError[index] = false;
      setSelectedValueDropdown(tempDropDown);
      setSelectError(tempSelectError);
    }
  };

  // Handle input change
  const handleInputChange = (name, value) => {
    setInitValue(prev => ({ ...prev, [name]: value }));
  };

  // Import transactions
  const handleImport = () => {
    const mappedValues = [];
    selectedValueDropdown.forEach((item, index) => {
      if (item.value !== '') {
        mappedValues.push({ inx: index, val: item.value });
      }
    });

    const finalData = tableData.map(row => {
      const local2 = {};
      mappedValues.forEach(mapping => {
        const allKeys = Object.keys(row);
        const key = allKeys[mapping.inx];
        local2[mapping.val] = row[key];
      });
      return local2;
    });

    // Process dates
    let invalidDate = false;
    const delimiters = [',', ' ', '/', '-'];

    const processedData = finalData.map(item => {
      const local = { ...item };

      Object.keys(item).forEach(key => {
        if (local[key] === '' || !local[key]) {
          local[key] = '-';
        }

        if (key === 'TRANSACTION_DATE') {
          const localData = local['TRANSACTION_DATE'];
          const selectFormat = date_format_list?.find(f => f.id === selectedDateFormat)?.format;

          if (selectFormat) {
            let findDeli;
            delimiters.forEach(d => {
              if (localData.split(d).length === 3) findDeli = d;
            });

            const formatLowerCase = selectFormat.toLowerCase();
            const formatItems = formatLowerCase.split(findDeli);

            if (formatItems.length !== 3) {
              invalidDate = true;
            }

            const dateItems = localData.split(findDeli);
            const monthIndex = formatItems.findIndex(i => i.includes('m'));
            const dayIndex = formatItems.findIndex(i => i.includes('d'));
            const yearIndex = formatItems.findIndex(i => i.includes('y'));

            const month = parseInt(dateItems[monthIndex]) - 1;
            const formattedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);

            if (isNaN(formattedDate.getTime()) && !invalidDate) {
              invalidDate = true;
            }

            local['TRANSACTION_DATE'] = dayjs(formattedDate, 'DD/MM/YYYY').format('DD/MM/YYYY');
          }
        }

        if (key === 'CR_AMOUNT' || key === 'DR_AMOUNT') {
          local['CR_AMOUNT'] = local['CR_AMOUNT']?.replace(',', '');
          local['DR_AMOUNT'] = local['DR_AMOUNT']?.replace(',', '');
        }
      });

      return local;
    });

    if (invalidDate) {
      commonActions.tostifyAlert('error', 'Invalid date format, please change to continue');
      return;
    }

    const postData = {
      bankId: location.state?.bankAccountId || '',
      templateId: templateId ? +templateId : '',
      importDataMap: processedData,
    };

    importBankStatementActions
      .importTransaction(postData)
      .then(res => {
        if (res.data.includes('Transactions Imported 0')) {
          commonActions.tostifyAlert(
            'error',
            'Transaction Date Cannot be less than Bank opening date or Last Reconciled Date'
          );
          navigate('/admin/banking/bank-account/transaction', {
            state: { bankAccountId: postData.bankId },
          });
        } else {
          commonActions.tostifyAlert('success', res.data);
          navigate('/admin/banking/bank-account/transaction', {
            state: { bankAccountId: postData.bankId },
          });
        }
      })
      .catch(err => {
        navigate('/admin/banking/upload-statement');
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  // Save configuration and import
  const handleSave = () => {
    if (!validateForm()) return;

    const mappedValues = [];
    selectedValueDropdown.forEach((item, index) => {
      if (item.value !== '') {
        mappedValues.push({ inx: index, val: item.value });
      }
    });

    if (mappedValues.length < 4) {
      commonActions.tostifyAlert('error', 'Please select mapping columns');
      return;
    }

    const indexMap = {};
    selectedValueDropdown.forEach((item, index) => {
      if (item.value !== '') {
        indexMap[item.value] = index;
      }
    });

    const postData = {
      ...initValue,
      dateFormatId: selectedDateFormat,
      skipColumns: initValue.skipColumns?.length >= 1 ? initValue.skipColumns : '',
      indexMap,
    };

    Object.keys(postData).forEach(key => {
      if (postData[key] === null) postData[key] = '';
    });

    importTransactionActions
      .createConfiguration(postData)
      .then(res => {
        importTransactionActions.getConfigurationList().then(res2 => {
          setTemplateId(res.data.id);
          setConfigurationList(res2.data);
          handleImport();
        });
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Unable to save template');
      });
  };

  // Validate and save
  const handleValidate = () => {
    if (!validateForm()) return;

    const mappedValues = [];
    selectedValueDropdown.forEach((item, index) => {
      if (item.value !== '') {
        mappedValues.push({ inx: index, val: item.value });
      }
    });

    if (mappedValues.length < 4) {
      commonActions.tostifyAlert('error', 'Please select mapping columns');
      return;
    }

    if (templateId === '') {
      handleSave();
    } else {
      handleImport();
    }
  };

  // Handle configuration selection
  const handleConfigurationChange = e => {
    const data = configurationList.filter(item => item.id === e.value);

    if (data.length > 0) {
      const local = selectedValueDropdown.map(() => ({ label: 'Select', value: '' }));

      Object.keys(data[0].indexMap || {}).forEach(key => {
        const headerOption = selectOptionsFactory
          .renderOptions('label', 'value', tableHeader, '')
          .find(val => val.value === key);
        if (headerOption) {
          local[data[0].indexMap[key]] = headerOption;
        }
      });

      setInitValue(prev => ({
        ...prev,
        name: '',
        skipRows: data[0].skipRows,
        headerRowNo: data[0].headerRowNo,
        textQualifier: data[0].textQualifier,
        otherDilimiterStr: data[0].otherDilimiterStr,
        indexMap: data[0].indexMap,
      }));

      setSelectedValueDropdown(local);
      setSelectedConfiguration(e.value);
      setSelectedDateFormat(data[0].dateFormatId);
      setSelectedDelimiter(data[0].delimiter);
      setError(prev => ({ ...prev, dateFormatId: '' }));
      setTemplateId(e.value);
    } else {
      setSelectedConfiguration(e.value);
      setTemplateId(e.value);
    }
  };

  if (initialLoading) {
    return <Loader />;
  }

  return (
    <div className="import-transaction-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Upload className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">
                {strings.ImportTransaction || 'Import Transaction'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Template Selection */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <Label>Select Parsing Template</Label>
                <div className="w-64">
                  <Select
                    styles={selectStyles}
                    placeholder="New Template"
                    options={selectOptionsFactory
                      .renderOptions('name', 'id', configurationList, 'Configuration')
                      .filter(i => i.value !== 1)}
                    value={selectOptionsFactory
                      .renderOptions('name', 'id', configurationList, 'Configuration')
                      .find(option => option.value === +selectedConfiguration)}
                    onChange={handleConfigurationChange}
                  />
                </div>
              </div>

              <div className="font-semibold">Or Create New Template</div>

              <div className="flex items-center gap-4">
                <Label>
                  <span className="text-destructive">* </span>New Template Name
                </Label>
                <Input
                  type="text"
                  placeholder={`${strings.Enter || 'Enter'} ${strings.Name || 'Name'}`}
                  value={initValue.name}
                  disabled={templateId !== ''}
                  onChange={e => {
                    handleInputChange('name', e.target.value);
                    setError(prev => ({ ...prev, name: '' }));
                  }}
                  className={`input-transition w-64 ${error.name ? 'border-destructive' : ''}`}
                />
              </div>
              {error.name && <p className="text-sm text-destructive">{error.name}</p>}
            </div>

            {/* Parameters */}
            <fieldset className="border rounded-lg p-4">
              <legend className="px-2 font-semibold">{strings.Parameters || 'Parameters'}</legend>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Delimiter</Label>
                  <Input
                    type="text"
                    placeholder="Delimiter"
                    value={initValue.otherDilimiterStr || ''}
                    onChange={e => {
                      setInitValue(prev => ({
                        ...prev,
                        otherDilimiterStr: e.target.value,
                      }));
                      if (location.state?.dataString) {
                        processData(location.state.dataString);
                      }
                    }}
                    className="input-transition"
                  />
                </div>

                <div>
                  <Label>Skip First X Rows</Label>
                  <Input
                    type="text"
                    placeholder="Enter Number of Rows"
                    value={initValue.skipRows || ''}
                    onChange={e => {
                      handleInputChange('skipRows', e.target.value);
                      if (location.state?.dataString) {
                        processData(location.state.dataString);
                      }
                    }}
                    className="input-transition"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <Checkbox
                    id="isHeaderRow"
                    checked={isHeaderRow}
                    onCheckedChange={checked => {
                      setIsHeaderRow(checked);
                      if (location.state?.dataString) {
                        processData(location.state.dataString);
                      }
                    }}
                  />
                  <Label htmlFor="isHeaderRow">Is Header Row</Label>
                </div>

                <div>
                  <Label>
                    <span className="text-destructive">* </span>
                    {strings.DateFormat || 'Date Format'}
                  </Label>
                  <Select
                    styles={selectStyles}
                    placeholder={strings.DateFormat || 'Date Format'}
                    options={selectOptionsFactory.renderOptions(
                      'format',
                      'id',
                      date_format_list || [],
                      'Date Format'
                    )}
                    value={selectOptionsFactory
                      .renderOptions('format', 'id', date_format_list || [], 'Date Format')
                      .find(option => option.value === +selectedDateFormat)}
                    onChange={option => {
                      if (option?.value) {
                        handleInputChange('dateFormatId', option.value);
                        setSelectedDateFormat(option.value);
                        setDateFormat(option.label);
                        setError(prev => ({ ...prev, dateFormatId: '' }));
                      }
                    }}
                    className={error.dateFormatId ? 'border-destructive' : ''}
                  />
                  {error.dateFormatId && (
                    <p className="text-sm text-destructive mt-1">{error.dateFormatId}</p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Column Mapping */}
            {tableDataKey && tableDataKey.length > 0 && (
              <>
                <div className="flex gap-4 justify-evenly flex-wrap">
                  {tableDataKey.map((header, index) => (
                    <div key={index} className="w-40">
                      <Select
                        styles={selectStyles}
                        options={selectOptionsFactory
                          .renderOptions('label', 'value', tableHeader, '')
                          .filter(
                            i =>
                              i.value === '' ||
                              !selectedValueDropdown.find(i2 => i.value === i2.value)
                          )}
                        value={selectedValueDropdown[index]}
                        onChange={e => handleDropdownChange(e, index)}
                      />
                    </div>
                  ))}
                </div>

                {/* Data Preview Table */}
                <div className="overflow-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {tableDataKey.map((header, index) => (
                          <TableHead key={index} className="text-center bg-muted/50">
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {tableDataKey.map((key, colIndex) => (
                            <TableCell
                              key={colIndex}
                              className={`text-center ${
                                errorIndexList.indexOf(`${rowIndex},${colIndex}`) > -1
                                  ? 'bg-destructive/10 text-destructive'
                                  : ''
                              }`}
                            >
                              {row[key] || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  <Button onClick={handleValidate}>
                    <Check className="mr-2 h-4 w-4" />
                    Validate and Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      navigate('/admin/banking/upload-statement', {
                        state: { bankAccountId: location.state?.bankAccountId },
                      })
                    }
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ImportTransaction;
