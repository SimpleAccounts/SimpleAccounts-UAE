import { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import download from 'downloadjs';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Loader } from 'components';

import * as ImportBankStatementActions from './actions';
import * as DetailBankAccountActions from '../bank_account/screens/detail/actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Modern Import Bank Statement Screen
 * Uses functional components and shadcn/ui
 */
function ImportBankStatement() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const uploadFileRef = useRef(null);

  // Actions
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
  const [loading, setLoading] = useState(false);
  const [templateList, setTemplateList] = useState([]);
  const [fileName, setFileName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [tableDataKey, setTableDataKey] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [errorIndexList, setErrorIndexList] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [bankAccountId, setBankAccountId] = useState('');
  const [date, setDate] = useState('');
  const [reconciledDate, setReconciledDate] = useState('');
  const [dataString, setDataString] = useState('');

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Initialize data
  useEffect(() => {
    if (location.state?.bankAccountId) {
      setBankAccountId(location.state.bankAccountId);

      importBankStatementActions.getTemplateList().then(res => {
        if (res.status === 200) {
          setTemplateList(res.data);
        }
      });

      detailBankAccountActions
        .getBankAccountByID(location.state.bankAccountId)
        .then(res => {
          setDate(res.openingDate || '');
          setReconciledDate(res.lastReconcileDate || '');
        })
        .catch(err => {
          commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        });
    } else {
      navigate('/admin/banking/bank-account');
    }
  }, [location.state]);

  // Export sample file
  const exportSample = () => {
    importBankStatementActions
      .downloadcsv()
      .then(res => {
        if (res.status === 200) {
          const blob = new Blob([res.data], { type: 'application/csv' });
          download(blob, 'Sample Transaction.csv');
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  // Handle file upload
  const handleFileUpload = () => {
    const file = uploadFileRef.current?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const bstr = evt.target.result;
      setDataString(bstr);
      navigate('/admin/banking/upload-statement/transaction', {
        state: {
          bankAccountId: bankAccountId,
          dataString: bstr,
          selectedTemplate: selectedTemplate,
        },
      });
    };
    reader.readAsBinaryString(file);
  };

  // Handle save/import
  const handleSave = () => {
    const postData = {
      bankId: bankAccountId,
      templateId: selectedTemplate ? +selectedTemplate : '',
      importDataMap: tableData,
    };

    importBankStatementActions
      .importTransaction(postData)
      .then(res => {
        if (res.data.includes('Transactions Imported 0')) {
          commonActions.tostifyAlert(
            'error',
            'Imported transaction should not contain any outdated transaction'
          );
          setSelectedTemplate('');
          setTableData([]);
          setShowMessage(true);
        } else {
          commonActions.tostifyAlert('success', res.data);
          navigate('/admin/banking/bank-account/transaction', {
            state: { bankAccountId: bankAccountId },
          });
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  // Check if cell has error
  const hasError = (rowIdx, colIdx) => {
    const index = `${rowIdx},${colIdx}`;
    return errorIndexList.indexOf(index) > -1;
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="import-bank-statement-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Upload className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">
                  {strings.ImportStatement || 'Import Statement'}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  navigate('/admin/banking/bank-account/transaction', {
                    state: { bankAccountId: bankAccountId },
                  })
                }
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="w-full max-w-md space-y-6">
                {/* Upload Section */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg mb-4">Drag file to upload, or</p>
                  <input
                    ref={uploadFileRef}
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={e => {
                      setFileName(e.target.value.split('\\').pop());
                      handleFileUpload();
                    }}
                    className="input-transition"
                  />
                </div>

                {/* Download Sample */}
                <div className="text-center">
                  <span className="text-muted-foreground">Download: </span>
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      exportSample();
                    }}
                    className="text-primary hover:underline"
                  >
                    Sample Transaction File
                  </a>
                </div>

                {/* Message */}
                {showMessage && (
                  <Label className="block text-center text-destructive font-semibold">
                    {strings.Message ||
                      'Please ensure transaction dates are after the bank opening date and last reconciled date.'}
                  </Label>
                )}
              </div>
            </div>

            {/* Preview Table */}
            {tableDataKey.length > 0 && (
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-4 text-center">
                      Preview File: {fileName}
                    </h4>
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {tableDataKey.map((name, index) => (
                              <TableHead key={index} className="text-center bg-muted/50">
                                {name}
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
                                    hasError(rowIndex, colIndex)
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

                    <div className="flex justify-between mt-4">
                      <Button onClick={handleSave} disabled={errorIndexList.length > 0}>
                        {strings.Import || 'Import'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          navigate('/admin/banking/bank-account/transaction', {
                            state: { bankAccountId: bankAccountId },
                          })
                        }
                      >
                        {strings.Cancel || 'Cancel'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ImportBankStatement;
