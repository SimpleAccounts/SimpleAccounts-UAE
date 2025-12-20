import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
} from 'reactstrap';
import Select from 'react-select';

import './style.scss';

import * as ProductActions from '../../actions';

import { WareHouseModal } from '../../sections';

import { Loader, ConfirmDeleteModal } from 'components';
import { selectOptionsFactory, selectStyles } from 'utils';
import * as DetailProductActions from './actions';
import { CommonActions } from 'services/global';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		vat_list: state.product.vat_list,
		product_warehouse_list: state.product.product_warehouse_list,
		product_category_list: state.product.product_category_list,
		supplier_list: state.supplier_invoice.supplier_list,
		inventory_list: state.product.inventory_list,
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

// Zod validation schema
const inventoryEditSchema = z.object({
	inventoryQty: z.string().optional(),
	inventoryReorderLevel: z.string().optional(),
	inventoryPurchasePrice: z.string().optional(),
	contactId: z.union([z.number(), z.string()]).optional(),
	transactionCategoryId: z.union([z.number(), z.string()]).optional(),
});

const InventoryEdit = ({
	productActions,
	detailProductActions,
	commonActions,
	supplierInvoiceActions,
	history,
	location,
	vat_list,
	product_category_list,
	supplier_list,
	inventory_list,
}) => {
	const [language] = useState(window['localStorage'].getItem('language'));
	const [loading, setLoading] = useState(true);
	const [contactType] = useState(1);
	const [selectedRows, setSelectedRows] = useState([]);
	const [openWarehouseModal, setOpenWarehouseModal] = useState(false);
	const [disabled, setDisabled] = useState(false);
	const [dialog, setDialog] = useState(null);
	const [currentInventoryId, setCurrentInventoryId] = useState(null);
	const [openInventoryModel, setOpenInventoryModel] = useState(false);
	const [inventoryAccount, setInventoryAccount] = useState([]);

	const regEx = /^[0-9]+$/;
	const regExBoth = /[a-zA-Z0-9]+$/;
	const regExAlpha = /^[a-zA-Z ]+$/;
	const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

	const form = useForm({
		resolver: zodResolver(inventoryEditSchema),
		defaultValues: {
			inventoryQty: '',
			inventoryReorderLevel: '',
			inventoryPurchasePrice: '',
			contactId: '',
			transactionCategoryId: '',
		},
		mode: 'onChange',
	});

	const {
		control,
		handleSubmit,
		formState: { errors, touchedFields },
		reset,
		setValue,
		watch,
	} = form;

	const watchedValues = watch();

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
		if (location.state && location.state.id) {
			supplierInvoiceActions.getSupplierList(contactType);
			inventoryAccountFn();
			productActions
				.getInventoryById(location.state.id)
				.then((res) => {
					if (res.status === 200) {
						setLoading(false);
						setCurrentInventoryId(location.state.id);
						reset({
							inventoryQty: res.data.inventoryQty ? res.data.inventoryQty : '',
							inventoryReorderLevel: res.data.inventoryReorderLevel ? res.data.inventoryReorderLevel : '',
							inventoryPurchasePrice: res.data.inventoryPurchasePrice ? res.data.inventoryPurchasePrice : '',
							contactId: res.data.contactId ? res.data.contactId : '',
							transactionCategoryId: res.data.transactionCategoryId ? res.data.transactionCategoryId : '',
						});
					} else {
						setLoading(false);
						history.push('/admin/master/product');
					}
				});
		}
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

	const onSubmit = (data) => {
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
		setDisabled(true);

		productActions
			.updateInventory(postData)
			.then((res) => {
				if (res.status === 200) {
					setDisabled(false);
					commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Product Updated Successfully',
					);
					history.push('/admin/master/product');
				}
			})
			.catch((err) => {
				setDisabled(false);
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
				reset({});
			}
		});
	};

	const getInventoryById = (data) => {
		getInventoryId();
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

	let tmpSupplier_list = [];
	supplier_list.map(item => {
		let obj = { label: item.label.contactName, value: item.value };
		tmpSupplier_list.push(obj);
	});

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
												<i className="fas fa-object-group" />
												<span className="ml-2">{strings.UpdateInventory}</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									<Row>
										<Col lg={12}>
											<Form onSubmit={handleSubmit(onSubmit)}>
												<Row>
													<Col lg={12}>
														<Row>
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="salesUnitPrice">
																		{strings.InventoryAccount}
																	</Label>
																	<Controller
																		name="transactionCategoryId"
																		control={control}
																		render={({ field }) => (
																			<Select
																				{...field}
																				styles={selectStyles}
																				isDisabled={true}
																				options={
																					inventoryAccount ? inventoryAccount : []
																				}
																				value={
																					inventoryAccount &&
																					inventoryAccount.find(
																						(option) =>
																							option.value ===
																							+watchedValues.transactionCategoryId,
																					)
																				}
																				id="transactionCategoryId"
																				onChange={(option) => {
																					field.onChange(option ? option.value : '');
																				}}
																				className={
																					errors.transactionCategoryId &&
																						touchedFields.transactionCategoryId
																						? 'is-invalid'
																						: ''
																				}
																			/>
																		)}
																	/>
																	{errors.transactionCategoryId &&
																		touchedFields.transactionCategoryId && (
																			<div className="invalid-feedback">
																				{errors.transactionCategoryId.message}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="inventoryQty">
																		{strings.OpeningStock}
																	</Label>
																	<Controller
																		name="inventoryQty"
																		control={control}
																		render={({ field }) => (
																			<Input
																				{...field}
																				type="number"
																				min="0"
																				disabled
																				maxLength="10"
																				id="inventoryQty"
																				placeholder={strings.Enter + strings.Quantity}
																				onChange={(option) => {
																					if (
																						option.target.value === '' ||
																						regDecimal.test(
																							option.target.value,
																						)
																					) {
																						field.onChange(option);
																					}
																				}}
																				className={
																					errors.inventoryQty &&
																						touchedFields.inventoryQty
																						? 'is-invalid'
																						: ''
																				}
																			/>
																		)}
																	/>
																	{errors.inventoryQty &&
																		touchedFields.inventoryQty && (
																			<div className="invalid-feedback">
																				{errors.inventoryQty.message}
																			</div>
																		)}
																</FormGroup>
															</Col>
														</Row>
														<Row>
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="inventoryPurchasePrice">
																		{strings.PurchasePrice}
																	</Label>
																	<Controller
																		name="inventoryPurchasePrice"
																		control={control}
																		render={({ field }) => (
																			<Input
																				{...field}
																				disabled
																				type="number"
																				min="0"
																				maxLength="10"
																				id="inventoryPurchasePrice"
																				placeholder={strings.Enter + strings.PurchasePrice}
																				onChange={(option) => {
																					if (
																						option.target.value === '' ||
																						regDecimal.test(
																							option.target.value,
																						)
																					) {
																						field.onChange(option);
																					}
																				}}
																				className={
																					errors.inventoryPurchasePrice &&
																						touchedFields.inventoryPurchasePrice
																						? 'is-invalid'
																						: ''
																				}
																			/>
																		)}
																	/>
																	{errors.inventoryPurchasePrice &&
																		touchedFields.inventoryPurchasePrice && (
																			<div className="invalid-feedback">
																				{errors.inventoryPurchasePrice.message}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="contactId">
																		{strings.SupplierName}
																	</Label>
																	<Controller
																		name="contactId"
																		control={control}
																		render={({ field }) => (
																			<Select
																				{...field}
																				isDisabled={true}
																				styles={selectStyles}
																				id="contactId"
																				placeholder={strings.Select + strings.SupplierName}
																				options={
																					tmpSupplier_list
																						? selectOptionsFactory.renderOptions(
																							'label',
																							'value',
																							tmpSupplier_list,
																							'Supplier Name',
																						)
																						: []
																				}
																				value={
																					tmpSupplier_list &&
																					tmpSupplier_list.find(
																						(option) =>
																							option.value ===
																							+watchedValues.contactId,
																					)
																				}
																				onChange={(option) => {
																					field.onChange(option ? option.value : '');
																				}}
																				className={
																					errors.contactId &&
																						touchedFields.contactId
																						? 'is-invalid'
																						: ''
																				}
																			/>
																		)}
																	/>
																	{errors.contactId &&
																		touchedFields.contactId && (
																			<div className="invalid-feedback">
																				{errors.contactId.message}
																			</div>
																		)}
																</FormGroup>
															</Col>
														</Row>
														<Row>
															<Col lg={4}>
																<FormGroup>
																	<Label htmlFor="inventoryReorderLevel">
																		{strings.ReOrderLevel}
																	</Label>
																	<Controller
																		name="inventoryReorderLevel"
																		control={control}
																		render={({ field }) => (
																			<Input
																				{...field}
																				type="text"
																				min="0"
																				max="2000"
																				maxLength='10'
																				id="inventoryReorderLevel"
																				rows="3"
																				placeholder={strings.InventoryReorderLevel}
																				onChange={(value) => {
																					if (
																						value.target.value === '' ||
																						regDecimal.test(
																							value.target.value,
																						)
																					) {
																						field.onChange(value);
																					}
																				}}
																			/>
																		)}
																	/>
																</FormGroup>
															</Col>
														</Row>
													</Col>
												</Row>

												<Row>
													<Col
														lg={12}
														className="d-flex align-items-center justify-content-between flex-wrap mt-5"
													>
														<FormGroup className="text-right">
															<Button
																type="submit"
																name="submit"
																color="primary"
																className="btn-square mr-3"
																disabled={disabled}
															>
																<i className="fa fa-dot-circle-o"></i>{' '}
																{disabled
																	? 'Updating...'
																	: strings.Update}
															</Button>
															<Button
																color="secondary"
																className="btn-square"
																onClick={() => {
																	history.push(
																		'/admin/master/product',
																	);
																}}
															>
																<i className="fa fa-ban"></i> {strings.Cancel}
															</Button>
														</FormGroup>
													</Col>
												</Row>
											</Form>
										</Col>
									</Row>
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

export default connect(mapStateToProps, mapDispatchToProps)(InventoryEdit);
