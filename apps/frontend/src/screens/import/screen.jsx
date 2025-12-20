import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, ChevronRight, ChevronLeft, Lock, Plus, Trash2, ArrowUpDown } from 'lucide-react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import download from 'downloadjs';
import { isDate, upperFirst } from 'lodash-es';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

import { Loader } from 'components';
import dayjs from '@/utils/date';
import { selectOptionsFactory, selectStyles } from 'utils';

import * as MigrationAction from './actions';
import { CommonActions } from 'services/global';
import { ChartOfAccountsModal } from './modal';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Modern Import Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function Import() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Actions
  const migrationActions = useMemo(() => bindActionCreators(MigrationAction, dispatch), [dispatch]);
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [fileName, setFileName] = useState('');
  const [productList, setProductList] = useState([]);
  const [versionList, setVersionList] = useState([]);
  const [productName, setProductName] = useState('');
  const [version, setVersion] = useState('');
  const [migrationList, setMigrationList] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [parentActiveTab, setParentActiveTab] = useState('import');
  const [activeStep, setActiveStep] = useState(1);
  const [date, setDate] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [fileDataList, setFileDataList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [listOfExist, setListOfExist] = useState([]);
  const [listOfExist4, setListOfExist4] = useState([]);
  const [dummylistOfExist, setDummylistOfExist] = useState([]);
  const [dummylistOfNotExist, setDummylistOfNotExist] = useState([]);
  const [effectiveDate, setEffectiveDate] = useState(new Date());
  const [openingBalance, setOpeningBalance] = useState(0);
  const [coaName, setCoaName] = useState('');
  const [nestedActiveDefaultTab, setNestedActiveDefaultTab] = useState(false);
  const [validFiles, setValidFiles] = useState([]);
  const [inValidFiles, setInValidFiles] = useState([]);

  const uploadFileRef = useRef(null);

  const csvFileNamesData = [
    { srNo: 1, fileName: 'Chart Of Accounts.csv', download: true },
    { srNo: 2, fileName: 'Opening Balances.csv', download: true },
    { srNo: 3, fileName: 'Contacts.csv', download: true },
    { srNo: 4, fileName: 'Product.csv', download: true },
    { srNo: 5, fileName: 'Invoice.csv', download: true },
    { srNo: 6, fileName: 'Credit Note.csv', download: true },
  ];

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Delete files handler
  const deleteFiles = () => {
    const formData = { fileNames: selectedRows.length > 0 ? selectedRows : '' };
    migrationActions
      .deleteFiles(formData)
      .then((res) => {
        if (res.status === 200) {
          setDisabled(false);
          setMigrationList(res.data === 'No Files Available' ? [] : res.data);
          commonActions.tostifyAlert('success', 'Files Deleted Successfully.');
        }
      })
      .catch((err) => {
        setDisabled(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  // Export handlers
  const exportAll = () => {
    csvFileNamesData.forEach((item) => exportFile(item.fileName));
  };

  const exportFile = (filename) => {
    migrationActions
      .downloadcsv(filename)
      .then((res) => {
        if (res.status === 200) {
          const blob = new Blob([res.data], { type: 'application/csv' });
          download(blob, filename);
        }
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  // Save account start date
  const saveAccountStartDate = () => {
    if (!isDate(date)) {
      commonActions.tostifyAlert('error', 'Please select a date');
      return;
    }

    const formData = new FormData();
    formData.append('accountStartDate', date);

    migrationActions
      .saveAccountStartDate(formData)
      .then((res) => {
        if (res.status === 200) {
          setDisabled(false);
          commonActions.tostifyAlert('success', 'Date Saved Successfully.');
          setActiveStep(2);
          getProductList();
        }
      })
      .catch((err) => {
        setDisabled(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  // Upload files
  const uploadFiles = (files) => {
    setLoading(true);
    setDisabled(true);

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    migrationActions
      .uploadFolder(formData)
      .then((res) => {
        if (res.status === 200) {
          setDisabled(false);
          setMigrationList(res.data);
          commonActions.tostifyAlert('success', 'Files Uploaded Successfully.');
        }
      })
      .catch((err) => {
        setDisabled(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Please Select .CSV File');
      })
      .finally(() => setLoading(false));
  };

  // Get product list
  const getProductList = () => {
    migrationActions
      .migrationProduct()
      .then((res) => {
        if (res.status === 200) {
          setProductList(res.data);
        }
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  // Get version list
  const getVersionList = (name) => {
    migrationActions
      .getVersionListByPrioductName(name)
      .then((res) => {
        if (res.status === 200) {
          setVersionList(res.data);
        }
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  // Get list of files
  const listOfFiles = () => {
    migrationActions
      .getListOfAllFiles()
      .then((res) => {
        if (res.status === 200) {
          setTabs(res.data);
        }
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  // Get file data
  const getFileData = (value) => {
    migrationActions
      .getFileData({ fileName: value })
      .then((res) => {
        if (res.status === 200) {
          setFileDataList(res.data);
        }
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  // Get transaction category list
  const listOfTransactionCategory = () => {
    migrationActions
      .listOfTransactionCategory()
      .then((res) => {
        if (res.status === 200) {
          setListOfExist(res.data.listOfExist);
          setDummylistOfExist(res.data.listOfExist);
          setDummylistOfNotExist(res.data.listOfNotExist);

          let newData = res.data.listOfExist.map((item) => ({
            ...item,
            effectiveDate: effectiveDate,
            openingBalance: openingBalance,
          }));
          setListOfExist4(newData);

          if (res.data.listOfExist.length === 0) {
            commonActions.tostifyAlert('success', 'Migration Data Saved Successfully.');
            navigate('/admin/settings/migrate', { state: { name: productName, version } });
          }
        }
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  // Submit opening balances
  const handleSubmitForOpeningBalances = () => {
    const formData = new FormData();
    listOfExist4.forEach((item, index) => {
      formData.append(`persistModelList[${index}].transactionCategoryId`, item.transactionId);
      formData.append(`persistModelList[${index}].effectiveDate`, dayjs(item.effectiveDate));
      formData.append(`persistModelList[${index}].openingBalance`, item.openingBalance);
    });

    migrationActions
      .addOpeningBalance(formData)
      .then((res) => {
        if (res.status === 200) {
          setDisabled(false);
          commonActions.tostifyAlert('success', 'Migration Data Saved Successfully.');
          navigate('/admin/settings/migrate', { state: { name: productName, version } });
        }
      })
      .catch((err) => {
        setDisabled(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setValidFiles([]);
      setInValidFiles([]);
      return;
    }

    const valid = [];
    const invalid = [];
    const validFileNames =
      productName === 'zoho'
        ? [
            'Chart Of Accounts.csv',
            'Contacts.csv',
            'Item.csv',
            'Vendors.csv',
            'Bill.csv',
            'Credit Note.csv',
            'Invoice.csv',
            'Opening Balances.csv',
            'Product.csv',
          ]
        : [
            'Chart Of Accounts.csv',
            'Contacts.csv',
            'Credit Note.csv',
            'Invoice.csv',
            'Opening Balances.csv',
            'Product.csv',
          ];

    for (const file of files) {
      if (validFileNames.includes(file.name)) {
        valid.push(file);
      } else {
        invalid.push(file.name);
      }
    }

    setValidFiles(valid);
    setInValidFiles(invalid);
    setFileName(e.target.value.split('\\').pop());

    if (valid.length > 0) {
      uploadFiles(valid);
    } else {
      commonActions.tostifyAlert('info', 'Please Select Valid Files!');
    }
  };

  // Row selection handler
  const handleRowSelect = (fileName, isSelected) => {
    if (isSelected) {
      setSelectedRows((prev) => [...prev, fileName]);
    } else {
      setSelectedRows((prev) => prev.filter((item) => item !== fileName));
    }
  };

  // Select all handler
  const handleSelectAll = (isSelected, rows) => {
    if (isSelected) {
      setSelectedRows(rows.map((item) => item.fileName));
    } else {
      setSelectedRows([]);
    }
  };

  // Update date in opening balances
  const setDateForRow = (row, value) => {
    setListOfExist4((prev) =>
      prev.map((item) =>
        item.transactionId === row.transactionId ? { ...item, effectiveDate: value } : item
      )
    );
  };

  // Update opening balance value
  const setOpeningBalanceForRow = (row, value) => {
    setListOfExist4((prev) =>
      prev.map((item) =>
        item.transactionId === row.transactionId ? { ...item, openingBalance: value } : item
      )
    );
  };

  // Close modal handler
  const closeModal = () => {
    setOpenModal(false);
    listOfTransactionCategory();
  };

  // Show header formatted
  const showHeader = (s) => upperFirst(s.replace(/([a-z])([A-Z])/g, '$1 $2'));

  // Migration list columns
  const migrationColumns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            onCheckedChange={(value) =>
              handleSelectAll(value, table.getRowModel().rows.map((r) => r.original))
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedRows.includes(row.original.fileName)}
            onCheckedChange={(value) => handleRowSelect(row.original.fileName, value)}
          />
        ),
      },
      {
        accessorKey: 'fileName',
        header: strings.fn || 'File Name',
      },
      {
        accessorKey: 'recordCount',
        header: strings.rup || 'Records Uploaded',
      },
    ],
    [selectedRows]
  );

  // CSV file columns for download
  const csvFileColumns = useMemo(
    () => [
      {
        accessorKey: 'srNo',
        header: 'Sl. No',
        cell: ({ row }) => <div className="text-center">{row.original.srNo}</div>,
      },
      {
        accessorKey: 'fileName',
        header: 'Sample File Name',
      },
      {
        id: 'download',
        header: '',
        cell: ({ row }) => (
          <Button variant="outline" size="icon" onClick={() => exportFile(row.original.fileName)}>
            <Download className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    []
  );

  // Opening balance columns
  const openingBalanceColumns = useMemo(
    () => [
      {
        accessorKey: 'transactionName',
        header: 'Transaction Name',
      },
      {
        accessorKey: 'chartOfAccountName',
        header: 'Chart Of Account Name',
      },
      {
        accessorKey: 'effectiveDate',
        header: 'Effective Date',
        cell: ({ row }) => (
          <DatePicker
            className="input-transition w-full border rounded px-2 py-1"
            dateFormat="dd-MM-yyyy"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            selected={row.original.effectiveDate}
            onChange={(value) => setDateForRow(row.original, value)}
          />
        ),
      },
      {
        accessorKey: 'openingBalance',
        header: 'Opening Balance',
        cell: ({ row }) => (
          <Input
            type="number"
            className="input-transition"
            value={row.original.openingBalance || 0}
            onChange={(e) => setOpeningBalanceForRow(row.original, parseInt(e.target.value) || 0)}
          />
        ),
      },
    ],
    []
  );

  // Render data preview table
  const renderDataTable = () => {
    if (!Array.isArray(fileDataList) || fileDataList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {strings.datadd || 'No data available'}
        </div>
      );
    }

    const cols = Object.keys(fileDataList[0] || {});

    return (
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {cols.map((column, index) => (
                <TableHead key={index} className="bg-muted/50">
                  {showHeader(column)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {fileDataList.map((item, rowIndex) => (
              <TableRow key={rowIndex}>
                {cols.map((column, colIndex) => (
                  <TableCell key={colIndex} className="text-center">
                    {item[column] || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Render chart of accounts comparison
  const renderNotExistList = () => {
    if (!dummylistOfNotExist) return null;

    const listObject = dummylistOfNotExist.map((name) => ({ transactionName: name }));
    const mergedList = [...dummylistOfExist, ...listObject];

    return (
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2">
          <h5 className="font-semibold text-center mb-2">{strings.sa || 'SimpleAccounts'}</h5>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">{strings.accCode || 'Account Code'}</TableHead>
                <TableHead className="text-center">{strings.accName || 'Account Name'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listOfExist.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{item.accountCode || '-'}</TableCell>
                  <TableCell className="text-center">{item.transactionName || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="col-span-1 flex flex-col items-center justify-start pt-10">
          {mergedList.map((item, index) => (
            <div key={index} className="py-2">
              {item.transactionId ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    setCoaName(item.transactionName);
                    setOpenModal(true);
                  }}
                >
                  Create
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="col-span-2">
          <h5 className="font-semibold text-center mb-2">{strings.zb || 'Zoho Books'}</h5>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">{strings.accCode || 'Account Code'}</TableHead>
                <TableHead className="text-center">{strings.accName || 'Account Name'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mergedList.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{item.accountCode || '-'}</TableCell>
                  <TableCell className="text-center">{item.transactionName || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="import-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Upload className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">{strings.Migration || 'Migration'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={parentActiveTab} onValueChange={setParentActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="import">{strings.import || 'Import'}</TabsTrigger>
                <TabsTrigger value="download">{strings.down || 'Download'}</TabsTrigger>
              </TabsList>

              <TabsContent value="import">
                {/* Step Indicator */}
                <div className="flex justify-center gap-4 mb-6">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        activeStep === step
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {step}
                    </div>
                  ))}
                </div>

                {/* Step 1: Select Date */}
                {activeStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-center">
                      {strings.heading || 'Select Migration Start Date'}
                    </h3>
                    <div className="flex justify-center items-center gap-4">
                      <span className="text-destructive">*</span>
                      <Label>{strings.date || 'Date'}</Label>
                      <DatePicker
                        className="input-transition border rounded px-3 py-2"
                        placeholderText={strings.selectdate || 'Select Date'}
                        dateFormat="dd-MM-yyyy"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        selected={date}
                        maxDate={new Date()}
                        onChange={(value) => setDate(value)}
                      />
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      <b>{strings.not || 'Note:'}</b>
                      <i>
                        {' '}
                        {strings.not1 || 'All transactions before this date will be imported.'}
                        <br /> {strings.not2 || 'This date cannot be changed after migration.'}
                      </i>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={saveAccountStartDate}>
                        {strings.nex || 'Next'} <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Upload Files */}
                {activeStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-center">
                      {strings.up || 'Upload Files'}
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <Label>{strings.appName || 'Application Name'}</Label>
                        <Select
                          styles={selectStyles}
                          placeholder={strings.selpro || 'Select Product'}
                          options={selectOptionsFactory.renderOptions(
                            'label',
                            'value',
                            productList,
                            'Products list'
                          )}
                          onChange={(option) => {
                            if (option?.value) {
                              setProductName(option.label);
                              getVersionList(option.label);
                              if (uploadFileRef.current) {
                                uploadFileRef.current.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="col-span-1">
                        <Label>{strings.ver || 'Version'}</Label>
                        <Select
                          styles={selectStyles}
                          placeholder={strings.selver || 'Select Version'}
                          options={selectOptionsFactory.renderOptions(
                            'label',
                            'value',
                            versionList,
                            'Version'
                          )}
                          onChange={(option) => {
                            if (option?.label) {
                              setVersion(option.label);
                            }
                          }}
                        />
                      </div>
                    </div>

                    {version && (
                      <>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-lg mb-4">{strings.drag || 'Drag file to upload, or'}</p>
                          <input
                            ref={uploadFileRef}
                            type="file"
                            multiple
                            accept=".csv"
                            onChange={handleFileChange}
                            className="input-transition"
                          />
                        </div>

                        {inValidFiles.length > 0 && (
                          <div className="border border-destructive rounded p-4">
                            <p className="text-destructive font-semibold mb-2">
                              {strings.invalid || 'Invalid Files:'}
                            </p>
                            {inValidFiles.map((name, index) => (
                              <div key={index} className="text-destructive">
                                {index + 1}. {name}
                              </div>
                            ))}
                          </div>
                        )}

                        {migrationList.length > 0 && (
                          <DataTable columns={migrationColumns} data={migrationList} />
                        )}

                        {selectedRows.length > 0 && (
                          <Button variant="destructive" onClick={deleteFiles}>
                            <Trash2 className="mr-2 h-4 w-4" /> {strings.d || 'Delete'}
                          </Button>
                        )}
                      </>
                    )}

                    <div className="flex justify-between">
                      <Button variant="secondary" onClick={() => setActiveStep(1)}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> {strings.back || 'Back'}
                      </Button>
                      <Button
                        onClick={() => {
                          setActiveStep(3);
                          listOfFiles();
                          listOfTransactionCategory();
                        }}
                      >
                        {strings.nex || 'Next'} <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Preview Files */}
                {activeStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-center">
                      {strings.pf || 'Preview Files'}
                    </h3>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={!nestedActiveDefaultTab ? 'default' : 'outline'}
                        onClick={() => setNestedActiveDefaultTab(false)}
                      >
                        {strings.ca || 'Chart of Accounts'}
                      </Button>
                      {tabs.map((tab) => (
                        <Button
                          key={tab}
                          variant={nestedActiveDefaultTab ? 'outline' : 'ghost'}
                          onClick={() => {
                            getFileData(tab);
                            setNestedActiveDefaultTab(true);
                          }}
                        >
                          {tab}
                        </Button>
                      ))}
                    </div>

                    <div className="border rounded-lg p-4">
                      {nestedActiveDefaultTab ? renderDataTable() : renderNotExistList()}
                    </div>

                    <div className="flex justify-between">
                      <Button variant="secondary" onClick={() => setActiveStep(2)}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> {strings.back || 'Back'}
                      </Button>
                      <Button
                        onClick={() => {
                          setActiveStep(4);
                          listOfTransactionCategory();
                        }}
                      >
                        {strings.nex || 'Next'} <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Set Opening Balances */}
                {activeStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-center">
                      {strings.setbal || 'Set Opening Balances'}
                    </h3>

                    <DataTable columns={openingBalanceColumns} data={listOfExist4} />

                    <div className="flex justify-between">
                      <Button variant="secondary" onClick={() => setActiveStep(3)}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> {strings.back || 'Back'}
                      </Button>
                      <Button onClick={handleSubmitForOpeningBalances}>
                        {strings.mig || 'Migrate'} <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="download">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button onClick={exportAll}>
                      Download All <Download className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <DataTable columns={csvFileColumns} data={csvFileNamesData} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <ChartOfAccountsModal
          openModal={openModal}
          closeModal={closeModal}
          coaName={coaName}
        />
      </div>
    </div>
  );
}

export default Import;
