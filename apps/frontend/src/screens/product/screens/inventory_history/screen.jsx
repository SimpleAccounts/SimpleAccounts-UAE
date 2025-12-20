import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Row,
	Col,
} from 'reactstrap';

import './style.scss';

import * as ProductActions from '../../actions';

import { WareHouseModal } from '../../sections';

import { Loader, ConfirmDeleteModal } from 'components';
import * as DetailProductActions from './actions';
import { CommonActions } from 'services/global';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		vat_list: state.product.vat_list,
		product_warehouse_list: state.product.product_warehouse_list,
		product_category_list: state.product.product_category_list,
		supplier_list: state.supplier_invoice.supplier_list,
		inventory_list: state.product.inventory_list,
		inventory_history_list: state.product.inventory_history_list,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		productActions: bindActionCreators(ProductActions, dispatch),
		detailProductActions: bindActionCreators(DetailProductActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		supplierInvoiceActions: bindActionCreators(
			SupplierInvoiceActions,
			dispatch,
		),
	};
};

const strings = new LocalizedStrings(data);

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
	const [loading, setLoading] = useState(true);
	const [contactType] = useState(1);
	const [selectedRows, setSelectedRows] = useState([]);
	const [openWarehouseModal, setOpenWarehouseModal] = useState(false);
	const [dialog, setDialog] = useState(null);
	const [currentInventoryId, setCurrentInventoryId] = useState(null);
	const [openInventoryModel, setOpenInventoryModel] = useState(false);
	const [inventoryAccount, setInventoryAccount] = useState([]);

	const regEx = /^[0-9\d]+$/;
	const regExBoth = /[a-zA-Z0-9]+$/;
	const regExAlpha = /^[a-zA-Z ]+$/;
	const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

	useEffect(() => {
		strings.setLanguage(language);
	}, [language]);

	useEffect(() => {
		initializeData();
	}, []);

	const selectRowProp = {
		bgColor: 'rgba(0,0,0, 0.05)',
		clickToSelect: false,
		onSelect: onRowSelect,
		onSelectAll: onSelectAll,
	};

	const options = {
		onRowClick: goToDetail,
		page: 1,
		sizePerPage: 10,
		onSizePerPageList: onSizePerPageList,
		onPageChange: onPageChange,
		sortName: '',
		sortOrder: '',
		onSortChange: sortColumn,
	};

	const onRowSelect = (row, isSelected, e) => {
		let tempList = [];
		if (isSelected) {
			tempList = Object.assign([], selectedRows);
			tempList.push(row.id);
		} else {
			selectedRows.map((item) => {
				if (item !== row.id) {
					tempList.push(item);
				}
				return item;
			});
		}
		setSelectedRows(tempList);
	};

	const onSelectAll = () => {};

	const goToDetail = () => {};

	const onSizePerPageList = () => {};

	const onPageChange = () => {};

	const sortColumn = () => {};

	const initializeData = () => {
		setLoading(false);
	};

	const inventoryAccountFn = () => {
		try {
			productActions
				.getTransactionCategoryListForInventory()
				.then((res) => {
					if (res.status === 200) {
						setInventoryAccount(res.data);
					}
				});
		} catch (err) {
			console.log(err);
		}
	};

	const getData = (data) => {
		let temp = {};
		for (let item in data) {
			if (typeof data[`${item}`] !== 'object') {
				temp[`${item}`] = data[`${item}`];
			} else {
				temp[`${item}`] = data[`${item}`].value;
			}
		}
		return temp;
	};

	const handleSubmit = (data) => {
		const inventoryId = currentInventoryId;
		const productCode = data['productCode'];
		const vatCategoryId = data['vatCategoryId'];
		const vatIncluded = data['vatIncluded'];
		const contactId = data['contactId'];
		const isInventoryEnabled = data['isInventoryEnabled'];
		const transactionCategoryId = data['transactionCategoryId'];
		const productName = data['productName'];
		const productType = data['productType'];
		const inventoryQty = data['inventoryQty'];
		const inventoryReorderLevel = data['inventoryReorderLevel'];
		const inventoryPurchasePrice = data['inventoryPurchasePrice'];

		const dataNew = {
			productCode,
			productName,
			productType,
			vatCategoryId,
			vatIncluded,
			isInventoryEnabled,
			contactId,
			transactionCategoryId,
			inventoryId,
			inventoryQty,
			inventoryReorderLevel,
			inventoryPurchasePrice,
		};

		const postData = getData(dataNew);
		productActions
			.updateInventory(postData)
			.then((res) => {
				if (res.status === 200) {
					commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Product Updated Successfully',
					);
					history.push('/admin/master/product');
				}
			})
			.catch((err) => {
				commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Product Updated Unsuccessfully',
				);
			});
	};

	const showWarehouseModal = () => {
		setOpenWarehouseModal(true);
	};

	const closeWarehouseModal = () => {
		setOpenWarehouseModal(false);
		productActions.getProductWareHouseList();
	};

	const handleOpenInventoryModel = () => {
		setOpenInventoryModel(true);
	};

	const closeInventoryModel = () => {
		setOpenInventoryModel(false);
	};

	const deleteProduct = () => {
		productActions
			.getInvoicesCountProduct(currentInventoryId)
			.then((res) => {
				if (res.data > 0) {
					commonActions.tostifyAlert(
						'error',
						'You need to delete invoices to delete the Product',
					);
				} else {
					const message1 = (
						<text>
							<b>Delete Product?</b>
						</text>
					);
					const message = 'This Product will be deleted permanently and cannot be recovered. ';
					setDialog(
						<ConfirmDeleteModal
							isOpen={true}
							okHandler={removeProduct}
							cancelHandler={removeDialog}
							message={message}
							message1={message1}
						/>
					);
				}
			});
	};

	const getInventoryId = () => {
		productActions.getInventoryById().then((res) => {
			if (res.status === 200) {
				// Handle response
			}
		});
	};

	const getInventoryById = (data) => {
		getInventoryId();
	};

	const renderDate = (cell, rows) => {
		return dayjs(rows.date).format('DD-MM-YYYY');
	};

	const removeProduct = () => {
		detailProductActions
			.deleteProduct(currentInventoryId)
			.then((res) => {
				if (res.status === 200) {
					commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Product Deleted Successfully'
					);
					history.push('/admin/master/product');
				}
			})
			.catch((err) => {
				commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Product Deleted Unsuccessfully',
				);
			});
	};

	const removeDialog = () => {
		setDialog(null);
	};

	const toggleActionButton = (index) => {
		// Implementation if needed
	};

	const renderActions = (cell, row) => {
		return (
			<div>
				<Button
					onClick={(e) => {
						handleOpenInventoryModel({ id: row.inventoryId });
					}}
				>
				</Button>
			</div>
		);
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
												<i className="fa fa-history fa-2x" />
												<span className="ml-2">{strings.InventoryHistory}</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									{inventory_history_list &&
										inventory_history_list.length > 0 ? (
										inventory_history_list.map(
											(item, index) => {
												if (index === 0) {
													return (
														<table key={index}>
															<tbody>
																<tr
																	style={{ background: '#f7f7f7' }}
																>
																	<td colSpan="9">
																		<b style={{ fontWeight: '600' }}>
																			<div><h5> {strings.ProductCode} :  </h5></div>
																		</b>
																	</td>
																	<td colSpan="9">
																		<b style={{ fontWeight: '600' }}>
																			<div><h5>{Object.values(item['productCode'])} </h5></div>
																		</b>
																	</td>
																</tr>
																<tr
																	style={{ background: '#f7f7f7' }}
																>
																	<td colSpan="9">
																		<b style={{ fontWeight: '600' }}>
																			<div><h5> Product Name :  </h5></div>
																		</b>
																	</td>
																	<td colSpan="9">
																		<b style={{ fontWeight: '600' }}>
																			<div><h5>{Object.values(item['productname'])} </h5></div>
																		</b>
																	</td>
																</tr>
															</tbody>
														</table>
													);
												}
												return null;
											}
										)
									) : " "}

									<br></br>
									<br></br>
									<div>
										<BootstrapTable
											selectRow={selectRowProp}
											search={false}
											options={options}
											data={
												inventory_history_list
													? inventory_history_list
													: []
											}
											version="4"
											hover
											remote
											className="product-table"
											trClassName="cursor-pointer"
										>
											<TableHeaderColumn isKey dataField="supplierName" dataSort className="table-header-bg">
												{strings.Supplier} / {strings.Customer}
											</TableHeaderColumn >
											<TableHeaderColumn dataField="date"
												dataSort
												dataFormat={renderDate} className="table-header-bg">
												{strings.Date}
											</TableHeaderColumn >
											<TableHeaderColumn dataField="transactionType" dataSort className="table-header-bg">
												{strings.TransactionType}
											</TableHeaderColumn >
											<TableHeaderColumn dataField="invoiceNumber" dataSort className="table-header-bg">
												{strings.InvoiceNumber}
											</TableHeaderColumn >
											<TableHeaderColumn dataField="quantitySold" dataSort className="table-header-bg">
												Quantity Sold
											</TableHeaderColumn >
											<TableHeaderColumn dataField="stockOnHand" dataSort className="table-header-bg">
												Stock In Hand
											</TableHeaderColumn >
											<TableHeaderColumn dataField="unitCost" dataSort className="table-header-bg">
												{strings.UnitCost}
											</TableHeaderColumn >
											<TableHeaderColumn dataField="unitSellingPrice" dataSort className="table-header-bg">
												{strings.UnitSellingPrice}
											</TableHeaderColumn >
										</BootstrapTable>
									</div>
								</CardBody>
							</Card>
						</Col>
					</Row>
				</div>

				<WareHouseModal
					openModal={openWarehouseModal}
					closeWarehouseModal={closeWarehouseModal}
				/>
			</div>
		</div>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(InventoryHistory);
