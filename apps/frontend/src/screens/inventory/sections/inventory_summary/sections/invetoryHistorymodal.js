import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  CardHeader,
  ModalBody,
  ModalFooter,
  ButtonGroup,
  CardBody,
  Modal,
} from 'components/migration';
import dayjs from '@/utils/date';
import { data } from '../../../../Language/index';
import LocalizedStrings from 'react-localization';
import { PDFExport } from '@progress/kendo-react-pdf';
import { Currency } from 'components';
import { DataTable } from '@/components/ui/data-table';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { History, Ban } from 'lucide-react';

const strings = new LocalizedStrings(data);

const InventoryHistoryModal = ({
  openModal,
  closeModal,
  id,
  inventory_history_list,
  universal_currency_list,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  const pdfExportComponent = useRef(null);

  useEffect(() => {
    strings.setLanguage(language || 'en');
  }, [language]);

  const currencySymbol = useMemo(() => {
    return universal_currency_list &&
      universal_currency_list[0] &&
      universal_currency_list[0].currencyIsoCode
      ? universal_currency_list[0].currencyIsoCode
      : 'AED';
  }, [universal_currency_list]);

  const renderUnitCost = value => {
    return value ? <Currency value={value} currencySymbol={currencySymbol} /> : '';
  };

  const renderUnitSellingPrice = value => {
    return value ? <Currency value={value} currencySymbol={currencySymbol} /> : '';
  };

  const renderDate = value => {
    return value ? dayjs(value).format('DD/MM/YYYY') : '';
  };

  const handleExportCSV = () => {
    if (inventory_history_list && inventory_history_list.length > 0) {
      const csvConfig = mkConfig({
        useKeysAsHeaders: true,
        filename: 'Inventory History',
      });
      const csv = generateCsv(csvConfig)(inventory_history_list);
      download(csvConfig)(csv);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'supplierName',
        header: `${strings.Supplier || 'Supplier'} / ${strings.Customer || 'Customer'}`,
      },
      {
        accessorKey: 'date',
        header: strings.Date || 'Date',
        cell: ({ getValue }) => renderDate(getValue()),
      },
      {
        accessorKey: 'transactionType',
        header: strings.TransactionType || 'Transaction Type',
      },
      {
        accessorKey: 'invoiceNumber',
        header: strings.InvoiceNumber || 'Invoice Number',
      },
      {
        accessorKey: 'quantitySold',
        header: strings.QuantitySold || 'Quantity Sold',
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
      },
      {
        accessorKey: 'unitCost',
        header: strings.UnitCost || 'Unit Cost',
        cell: ({ getValue }) => <div className="text-right">{renderUnitCost(getValue())}</div>,
      },
      {
        accessorKey: 'unitSellingPrice',
        header: strings.UnitSellingPrice || 'Unit Selling Price',
        cell: ({ getValue }) => (
          <div className="text-right">{renderUnitSellingPrice(getValue())}</div>
        ),
      },
    ],
    [currencySymbol]
  );

  const productInfo = useMemo(() => {
    if (inventory_history_list && inventory_history_list.length > 0) {
      const firstItem = inventory_history_list[0];
      return {
        productCode: firstItem.productCode || '',
        productName: firstItem.productname || firstItem.productName || '',
      };
    }
    return { productCode: '', productName: '' };
  }, [inventory_history_list]);

  return (
    <div className="contact-modal-screen">
      <Modal isOpen={openModal} className="modal-success contact-modal modal-lg">
        <ModalBody style={{ padding: '15px 0px 0px 0px' }}>
          <div className="view-invoice-screen" style={{ padding: '0px 1px' }}>
            <div className="animated fadeIn">
              <Row>
                <Col lg={12} className="mx-auto">
                  <div
                    className="pull-right mb-1"
                    style={{ display: 'inline-flex', marginRight: '20px' }}
                  >
                    <Button
                      type="button"
                      className="print-btn-cont"
                      style={{ color: 'black' }}
                      onClick={() => closeModal(false)}
                    >
                      X
                    </Button>
                  </div>
                  <div>
                    <PDFExport ref={pdfExportComponent} scale={0.8} paperSize="A4">
                      <CardHeader>
                        <Row>
                          <Col lg={12}>
                            <div className="h4 mb-0 d-flex align-items-center">
                              <History className="h-4 w-4" />
                              <span className="ml-2">
                                {strings.InventoryHistory || 'Inventory History'}
                              </span>
                            </div>
                          </Col>
                        </Row>
                      </CardHeader>
                      <CardBody id="section-to-print">
                        <PDFExport ref={pdfExportComponent} scale={0.8} paperSize="A4">
                          <div>
                            <Form name="simpleForm">
                              <div className="flex-wrap d-flex justify-content-end">
                                <FormGroup>
                                  <ButtonGroup className="mr-3">
                                    <Button
                                      color="primary"
                                      className="btn-square"
                                      onClick={handleExportCSV}
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      {strings.Export || 'Export'}
                                    </Button>
                                  </ButtonGroup>
                                </FormGroup>
                              </div>
                            </Form>
                          </div>

                          {productInfo.productCode && (
                            <table>
                              <tbody>
                                <tr style={{ background: '#f7f7f7' }}>
                                  <td colSpan="9">
                                    <b style={{ fontWeight: '600' }}>
                                      <div>
                                        <h5>{strings.ProductCode || 'Product Code'}: </h5>
                                      </div>
                                    </b>
                                  </td>
                                  <td colSpan="9">
                                    <b style={{ fontWeight: '600' }}>
                                      <div>
                                        <h5>{productInfo.productCode}</h5>
                                      </div>
                                    </b>
                                  </td>
                                </tr>
                                <tr style={{ background: '#f7f7f7' }}>
                                  <td colSpan="9">
                                    <b style={{ fontWeight: '600' }}>
                                      <div>
                                        <h5>{strings.ProductName || 'Product Name'}: </h5>
                                      </div>
                                    </b>
                                  </td>
                                  <td colSpan="9">
                                    <b style={{ fontWeight: '600' }}>
                                      <div>
                                        <h5>{productInfo.productName}</h5>
                                      </div>
                                    </b>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          )}

                          <br />
                          <br />
                          <div>
                            <DataTable
                              data={inventory_history_list || []}
                              columns={columns}
                              manualPagination={false}
                              pagination={pagination}
                              onPaginationChange={setPagination}
                              manualSorting={false}
                              sorting={sorting}
                              onSortingChange={setSorting}
                            />
                          </div>
                        </PDFExport>
                      </CardBody>
                    </PDFExport>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" className="btn-square" onClick={() => closeModal(false)}>
            <Ban className="h-4 w-4" /> {strings.Cancel || 'Cancel'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default InventoryHistoryModal;
