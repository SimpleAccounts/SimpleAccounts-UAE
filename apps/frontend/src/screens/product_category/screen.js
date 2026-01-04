import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// ButtonGroup removed - replace with: <div className="inline-flex rounded-md" role="group">
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table';
import { CommonActions } from 'services/global';
import { Loader, ConfirmDeleteModal } from 'components';
import './style.scss';
import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import * as ProductCategoryActions from './actions';
import { Pencil, Package, Plus } from '@/components/icons';

const mapStateToProps = state => {
  return {
    product_category_list: state.product_category.product_category_list,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    productCategoryActions: bindActionCreators(ProductCategoryActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

let strings = new LocalizedStrings(data);
class ProductCategory extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      language: window['localStorage'].getItem('language'),
      // openDeleteModal: true,
      loading: true,
      selectedRows: [],
      filterData: {
        productCategoryCode: '',
        productCategoryName: '',
      },
      paginationPageSize: 10,
      csvData: [],
      view: false,
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
      sorting: [],
    };

    this.csvLink = React.createRef();
  }

  handlePaginationChange = newPagination => {
    this.setState({ pagination: newPagination }, () => {
      this.initializeData();
    });
  };

  handleSortingChange = newSorting => {
    this.setState({ sorting: newSorting }, () => {
      this.initializeData();
    });
  };

  onRowSelect = (row, isSelected) => {
    if (isSelected) {
      this.state.selectedRows.push(row.id);
      this.setState({
        selectedRows: this.state.selectedRows,
      });
    } else {
      this.setState({
        selectedRows: this.state.selectedRows.filter(el => el !== row.id),
      });
    }
  };

  onSelectAll = (isSelected, rows) => {
    this.setState({
      selectedRows: isSelected ? rows.map(row => row.id) : [],
    });
  };

  // -------------------------
  // Data Table Custom Fields
  //--------------------------

  goToDetail = row => {
    this.props.history.push(`/admin/master/product-category/detail`, {
      id: row.original.id,
    });
  };

  goToCategoryDetail = categoryId => {
    this.props.history.push(`/admin/master/product-category/detail`, {
      id: categoryId,
    });
  };

  // Show Success Toast
  success = () => {
    return toast.success('Product Category Deleted Successfully.', {
      position: 'top-right',
    });
  };

  componentDidMount = () => {
    this.initializeData();
  };

  initializeData = search => {
    const { filterData, pagination, sorting } = this.state;
    const paginationData = {
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    const sortingData = {
      order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: sorting.length > 0 ? sorting[0].id : '',
    };
    const postData = { ...filterData, ...paginationData, ...sortingData };
    this.props.productCategoryActions
      .getProductCategoryList(postData)
      .then(res => {
        if (res.status === 200) {
          this.setState({ loading: false });
        }
      })
      .catch(err => {
        this.setState({ loading: false });
        this.props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Product Category Deleted Unsuccessfully.'
        );
      });
  };

  onPageSizeChanged = newPageSize => {
    var value = document.getElementById('page-size').value;
    this.gridApi.paginationSetPageSize(Number(value));
  };
  onGridReady = params => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  };

  // -------------------------
  // Actions
  //--------------------------

  // Delete VAT By ID
  bulkDelete = () => {
    const { selectedRows } = this.state;
    const message1 = (
      <text>
        <b>Delete Product Category?</b>
      </text>
    );
    const message = 'This Product Category will be deleted permanently and cannot be recovered. ';
    if (selectedRows.length > 0) {
      this.setState({
        dialog: (
          <ConfirmDeleteModal
            isOpen={true}
            okHandler={this.removeBulk}
            cancelHandler={this.removeDialog}
            message={message}
            message1={message1}
          />
        ),
      });
    } else {
      this.props.commonActions.tostifyAlert(
        'info',
        'Please select the rows of the table and try again.'
      );
    }
  };

  removeBulk = () => {
    let { selectedRows } = this.state;
    const { product_category_list } = this.props;
    let obj = {
      ids: selectedRows,
    };
    this.removeDialog();
    this.props.productCategoryActions
      .deleteProductCategory(obj)
      .then(res => {
        this.initializeData();
        this.props.commonActions.tostifyAlert(
          'success',
          res.data ? res.data.message : 'Product Category Deleted Successfully'
        );
        if (
          product_category_list &&
          product_category_list.data &&
          product_category_list.data.length > 0
        ) {
          this.setState({
            selectedRows: [],
          });
        }
      })
      .catch(err => {
        this.props.commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Product Category Deleted Unsuccessfully'
        );
      });
  };

  removeDialog = () => {
    this.setState({
      dialog: null,
    });
  };

  handleFilterChange = (e, name) => {
    this.setState({
      filterData: Object.assign(this.state.filterData, {
        [name]: e.target.value,
      }),
    });
  };
  handleSearch = () => {
    this.initializeData();
  };

  getCsvData = () => {
    if (this.state.csvData.length === 0) {
      let obj = {
        paginationDisable: true,
      };
      this.props.productCategoryActions.getProductCategoryList(obj).then(res => {
        if (res.status === 200) {
          this.setState({ csvData: res.data.data, view: true }, () => {
            setTimeout(() => {
              this.csvLink.current.link.click();
            }, 0);
          });
        }
      });
    } else {
      this.csvLink.current.link.click();
    }
  };

  clearAll = () => {
    this.setState(
      {
        filterData: {
          productCategoryCode: '',
          productCategoryName: '',
        },
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
        sorting: [],
      },
      () => {
        this.initializeData();
      }
    );
  };

  getActionButtons = params => {
    return (
      <>
        {/* BUTTON ACTIONS */}
        {/* View */}

        <Button
          className="Ag-gridActionButtons btn-sm"
          title="Edit"
          variant="secondary"
          onClick={() => this.goToCategoryDetail(params.data.id)}
        >
          {' '}
          <Pencil className="h-4 w-4" />{' '}
        </Button>
      </>
    );
  };

  getColumns = () => {
    return [
      {
        accessorKey: 'productCategoryCode',
        header: strings.ProductCategoryCode,
        enableSorting: true,
      },
      {
        accessorKey: 'productCategoryName',
        header: strings.ProductCategoryName,
        enableSorting: true,
      },
    ];
  };

  render() {
    strings.setLanguage(this.state.language);
    const { loading, selectedRows, dialog, csvData, view, filterData, pagination, sorting } =
      this.state;
    const { product_category_list } = this.props;

    // let display_data = this.filterVatList(vatList)

    return loading == true ? (
      <Loader />
    ) : (
      <div>
        <div className="vat-code-screen">
          <div className="animated fadeIn">
            <Card>
              <CardHeader>
                <div className="h4 mb-0 d-flex align-items-center">
                  <Package className="h-4 w-4" />
                  <span className="ml-2">{strings.ProductCategory}</span>
                </div>
              </CardHeader>
              <CardContent>
                {dialog}
                {loading ? (
                  <Loader></Loader>
                ) : (
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12">
                      <div className="d-flex justify-content-end">
                        <div className="inline-flex rounded-md" role="group">
                          {/* <Button
													variant="default"
													className="btn-square mr-1"
													onClick={() => this.getCsvData()}
												>
													<Download className="h-4 w-4 mr-1" />
													Export To CSV
												</Button>
												{view && (
													<CSVLink
														data={csvData}
														filename={'ProductCategory.csv'}
														className="hidden"
														ref={this.csvLink}
														target="_blank"
													/>
												)} */}
                          {/* <Button
													variant="default"
													className="btn-square mr-1"
													onClick={this.bulkDelete}
													disabled={selectedRows.length === 0}
												>
													<Trash2 className="h-4 w-4 mr-1" />
													Bulk Delete
												</Button> */}
                        </div>
                        <Button
                          variant="default"
                          className="btn-square pull-right"
                          style={{ marginBottom: '10px' }}
                          onClick={() =>
                            this.props.history.push(`/admin/master/product-category/create`)
                          }
                        >
                          <Plus className="h-4 w-4" />
                          {strings.AddNewProductCategory}
                        </Button>
                      </div>
                      {/* <div className="py-3">
											<h5>{strings.Filter}: </h5>
											<form onSubmit={this.handleSubmit}>
												<div className="grid grid-cols-12 gap-4">
													<div lg={4} className="mb-1">
														<Input
															type="text" maxLength='20'
															name="code"
															placeholder={strings.ProductCategoryCode}
															value={filterData.productCategoryCode}
															// value={productCategoryCode ? productCategoryCode: ''}
															onChange={(e) => {
																this.handleFilterChange(
																	e,
																	'productCategoryCode',
																);
															}}
														/>
													</div>
													<div lg={4} className="mb-1">
														<Input
															type="text" maxLength='50'
															name="name"
															placeholder={strings.ProductCategoryName}
															value={filterData.productCategoryName}
															autoComplete="off"
															// value={productCategoryName ?  productCategoryName : ''}
															onChange={(e) => {
																this.handleFilterChange(
																	e,
																	'productCategoryName',
																);
															}}
														/>
													</div>

													<div lg={2} className="pl-0 pr-0">
														<Button
															type="button"
															variant="default"
															className="btn-square mr-1"
															onClick={this.handleSearch}
														>
															<Search className="h-4 w-4" />
														</Button>
														<Button
															type="button"
															variant="default"
															className="btn-square"
															onClick={this.clearAll}
														>
															<RefreshCw className="h-4 w-4" />
														</Button>
													</div>
												</div>
											</form>
										</div> */}

                      <DataTable
                        columns={this.getColumns()}
                        data={
                          product_category_list && product_category_list.data
                            ? product_category_list.data
                            : []
                        }
                        manualPagination
                        pageCount={
                          product_category_list && product_category_list.count
                            ? Math.ceil(product_category_list.count / pagination.pageSize)
                            : 0
                        }
                        pagination={pagination}
                        onPaginationChange={this.handlePaginationChange}
                        manualSorting
                        sorting={sorting}
                        onSortingChange={this.handleSortingChange}
                        onRowClick={row => this.goToDetail(row)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductCategory);
