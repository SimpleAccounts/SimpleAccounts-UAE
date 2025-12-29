import { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Row, Col } from 'components/migration';

import './style.scss';

import * as ProductActions from '../../actions';

import { WareHouseModal } from '../../sections';

import { Loader } from 'components';
import * as DetailProductActions from './actions';
import { CommonActions } from 'services/global';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions';
import dayjs from '@/utils/date';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { DataTable } from '@/components/ui/data-table';
import { History } from 'lucide-react';

const mapStateToProps = state => {
  return {
    vat_list: state.product.vat_list,
    product_warehouse_list: state.product.product_warehouse_list,
    product_category_list: state.product.product_category_list,
    supplier_list: state.supplier_invoice.supplier_list,
    inventory_list: state.product.inventory_list,
    inventory_history_list: state.product.inventory_history_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    productActions: bindActionCreators(ProductActions, dispatch),
    detailProductActions: bindActionCreators(DetailProductActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
    supplierInvoiceActions: bindActionCreators(SupplierInvoiceActions, dispatch),
  };
};

const strings = new LocalizedStrings(languageData);

const InventoryHistory = ({
  productActions,
  detailProductActions,
  commonActions,
  supplierInvoiceActions,
  history,
  location,
  vat_list,
  product_category_list,
  supplier_list,
  inventory_history_list,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false); // Changed default to false based on original behavior logic
  const [openWarehouseModal, setOpenWarehouseModal] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  const renderDate = cell => {
    return dayjs(cell).format('DD-MM-YYYY');
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'supplierName',
        header: `${strings.Supplier} / ${strings.Customer}`,
      },
      {
        accessorKey: 'date',
        header: strings.Date,
        cell: ({ getValue }) => renderDate(getValue()),
      },
      {
        accessorKey: 'transactionType',
        header: strings.TransactionType,
      },
      {
        accessorKey: 'invoiceNumber',
        header: strings.InvoiceNumber,
      },
      {
        accessorKey: 'quantitySold',
        header: 'Quantity Sold',
      },
      {
        accessorKey: 'stockOnHand',
        header: 'Stock In Hand',
      },
      {
        accessorKey: 'unitCost',
        header: strings.UnitCost,
      },
      {
        accessorKey: 'unitSellingPrice',
        header: strings.UnitSellingPrice,
      },
    ],
    []
  );

  const closeWarehouseModal = () => {
    setOpenWarehouseModal(false);
    productActions.getProductWareHouseList();
  };

  if (loading === true) {
    return <Loader />;
  }

  return (
    <div>
      <div className="detail-product-screen">
        <div className="animated fadeIn">
          {dialog}
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <History className="h-4 w-4" />
                        <span className="ml-2">{strings.InventoryHistory}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {inventory_history_list && inventory_history_list.length > 0
                    ? inventory_history_list.map((item, index) => {
                        if (index === 0) {
                          return (
                            <table key={index}>
                              <tbody>
                                <tr style={{ background: '#f7f7f7' }}>
                                  <td colSpan="9">
                                    <b style={{ fontWeight: '600' }}>
                                      <div>
                                        <h5> {strings.ProductCode} : </h5>
                                      </div>
                                    </b>
                                  </td>
                                  <td colSpan="9">
                                    <b style={{ fontWeight: '600' }}>
                                      <div>
                                        <h5>{Object.values(item['productCode'])} </h5>
                                      </div>
                                    </b>
                                  </td>
                                </tr>
                                <tr style={{ background: '#f7f7f7' }}>
                                  <td colSpan="9">
                                    <b style={{ fontWeight: '600' }}>
                                      <div>
                                        <h5> Product Name : </h5>
                                      </div>
                                    </b>
                                  </td>
                                  <td colSpan="9">
                                    <b style={{ fontWeight: '600' }}>
                                      <div>
                                        <h5>{Object.values(item['productname'])} </h5>
                                      </div>
                                    </b>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          );
                        }
                        return null;
                      })
                    : ' '}

                  <br></br>
                  <br></br>
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
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>

        <WareHouseModal openModal={openWarehouseModal} closeWarehouseModal={closeWarehouseModal} />
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(InventoryHistory);
