import React, { useState, useEffect, useCallback, useRef } from 'react';
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
	UncontrolledTooltip,
} from 'reactstrap';
import Select from 'react-select';
import { LeavePage, Loader } from 'components';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import * as ProductActions from '../../actions';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions';
import { CommonActions } from 'services/global';
import { WareHouseModal } from '../../sections';
import { selectOptionsFactory, selectStyles } from 'utils';
import config from '../../../../constants/config';

const mapStateToProps = (state) => {
	return {
		vat_list: state.product.vat_list,
		product_warehouse_list: state.product.product_warehouse_list,
		product_category_list: state.product.product_category_list,
		supplier_list: state.supplier_invoice.supplier_list,
		inventory_account_list: state.product.inventory_account_list,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		productActions: bindActionCreators(ProductActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		supplierInvoiceActions: bindActionCreators(
			SupplierInvoiceActions,
			dispatch,
		),
	};
};

const strings = new LocalizedStrings(data);

// Zod validation schema
const createProductSchema = z.object({
	productName: z.string().min(1, 'Product name is required'),
	productCode: z.string().min(1, 'Product code is required'),
	productDescription: z.string().optional(),
	vatCategoryId: z.object({
		value: z.number(),
		label: z.string(),
	}).nullable().refine((val) => val !== null, 'VAT type is required'),
	unitTypeId: z.object({
		value: z.number(),
		label: z.string(),
	}).nullable().optional(),
	productCategoryId: z.object({
		value: z.number(),
		label: z.string(),
	}).nullable().optional(),
	productWarehouseId: z.string().optional(),
	vatIncluded: z.boolean().optional(),
	productType: z.enum(['GOODS', 'SERVICE']),
	salesUnitPrice: z.string().optional(),
	purchaseUnitPrice: z.string().optional(),
	productPriceType: z.array(z.string()).min(1, 'At least one selling type is required'),
	salesTransactionCategoryId: z.union([
		z.object({
			value: z.number(),
			label: z.string(),
		}),
		z.string(),
	]).optional(),
	purchaseTransactionCategoryId: z.union([
		z.object({
			value: z.number(),
			label: z.string(),
		}),
		z.string(),
	]).optional(),
	inventoryPurchasePrice: z.string().optional(),
	inventoryQty: z.string().optional(),
	inventoryReorderLevel: z.string().optional(),
	contactId: z.object({
		value: z.number(),
		label: z.string(),
	}).nullable().optional(),
	salesDescription: z.string().optional(),
	purchaseDescription: z.string().optional(),
	isInventoryEnabled: z.boolean().optional(),
	transactionCategoryId: z.object({
		value: z.number(),
		label: z.string(),
	}).nullable().optional(),
	exciseTaxId: z.union([
		z.object({
			value: z.number(),
			label: z.string(),
		}),
		z.string(),
	]).optional(),
}).refine((data) => {
	if (data.productPriceType.includes('SALES')) {
		return data.salesUnitPrice && data.salesUnitPrice.length > 0;
	}
	return true;
}, {
	message: 'Selling price is required',
	path: ['salesUnitPrice'],
}).refine((data) => {
	if (data.productPriceType.includes('SALES')) {
		return data.salesTransactionCategoryId && data.salesTransactionCategoryId.length !== 0;
	}
	return true;
}, {
	message: 'Selling category is required',
	path: ['salesTransactionCategoryId'],
}).refine((data) => {
	if (data.productPriceType.includes('PURCHASE')) {
		return data.purchaseUnitPrice && data.purchaseUnitPrice.length > 0;
	}
	return true;
}, {
	message: 'Purchase price is required',
	path: ['purchaseUnitPrice'],
}).refine((data) => {
	if (data.productPriceType.includes('PURCHASE')) {
		return data.purchaseTransactionCategoryId && data.purchaseTransactionCategoryId.length !== 0;
	}
	return true;
}, {
	message: 'Purchase category is required',
	path: ['purchaseTransactionCategoryId'],
});

const CreateProduct = ({
	productActions,
	commonActions,
	supplierInvoiceActions,
	history,
	vat_list,
	product_category_list,
	supplier_list,
	inventory_account_list,
	expense,
	income,
	isParentComponentPresent,
	getCurrentProductData,
	closeModal,
}) => {
	const [language] = useState(window['localStorage'].getItem('language'));
	const [loading, setLoading] = useState(false);
	const [openWarehouseModal, setOpenWarehouseModal] = useState(false);
	const [contactType] = useState(1);
	const [purchaseCategory, setPurchaseCategory] = useState([]);
	const [salesCategory, setSalesCategory] = useState([]);
	const [createMore, setCreateMore] = useState(false);
	const [exist, setExist] = useState(false);
	const [ProductExist, setProductExist] = useState(false);
	const [disabled, setDisabled] = useState(false);
	const [productActive, setProductActive] = useState(true);
	const [selectedStatus, setSelectedStatus] = useState(true);
	const [exciseTaxList, setExciseTaxList] = useState([]);
	const [unitTypeList, setUnitTypeList] = useState([]);
	const [exciseTaxCheck, setExciseTaxCheck] = useState(false);
	const [loadingMsg, setLoadingMsg] = useState('Loading');
	const [disableLeavePage, setDisableLeavePage] = useState(false);
	const [inventoryAccount, setInventoryAccount] = useState([]);
	const [companyDetails, setCompanyDetails] = useState(null);

	const regEx = /^[0-9]+$/;
	const regExBoth = /[ +a-zA-Z0-9-./\\|!@#$%^&*()_<>,]+$/;
	const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
	const regDecimal5 = /^\d{1,10}$/;

	const form = useForm({
		resolver: zodResolver(createProductSchema),
		defaultValues: {
			productName: '',
			productDescription: '',
			productCode: '',
			vatCategoryId: null,
			unitTypeId: null,
			productCategoryId: null,
			productWarehouseId: '',
			vatIncluded: false,
			productType: 'GOODS',
			salesUnitPrice: '',
			purchaseUnitPrice: '',
			productPriceType: [expense === true ? 'PURCHASE' : 'SALES'],
			salesTransactionCategoryId: { value: 84, label: 'Sales' },
			purchaseTransactionCategoryId: {
				value: 49,
				label: 'Cost of Goods Sold',
			},
			inventoryPurchasePrice: '',
			inventoryQty: '',
			inventoryReorderLevel: '',
			contactId: null,
			salesDescription: '',
			purchaseDescription: '',
			isInventoryEnabled: false,
			transactionCategoryId: { value: 150, label: 'Inventory Asset' },
			exciseTaxId: '',
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
		setError,
		clearErrors,
		trigger,
	} = form;

	const watchedValues = watch();

	useEffect(() => {
		strings.setLanguage(language);
	}, [language]);

	useEffect(() => {
		initializeData();
		salesCategoryFn();
		purchaseCategoryFn();
		inventoryAccountFn();
		getProductCode();
		getcompanyDetails();
	}, []);

	const getcompanyDetails = () => {
		productActions.getCompanyDetails().then((res) => {
			if (res.status === 200) {
				setCompanyDetails(res.data);
				if (res.data && res.data.isRegisteredVat === false) {
					setValue('vatCategoryId', { label: 'N/A', value: 10 });
				}
			}
		}).catch((err) => {
			commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong');
		});
	};

	const initializeData = () => {
		productActions.getProductVatCategoryList();
		productActions.getExciseTaxList().then((res) => {
			if (res.status === 200) {
				setExciseTaxList(res.data);
			}
		});
		productActions.getUnitTypeList().then((res) => {
			if (res.status === 200) {
				setUnitTypeList(res.data);
			}
		});
		productActions.getProductCategoryList();
		supplierInvoiceActions.getSupplierList(contactType);
	};

	const salesCategoryFn = () => {
		try {
			productActions
				.getTransactionCategoryListForSalesProduct('2')
				.then((res) => {
					if (res.status === 200) {
						setSalesCategory(res.data);
					}
				});
		} catch (err) {
			console.log(err);
		}
	};

	const purchaseCategoryFn = () => {
		try {
			productActions
				.getTransactionCategoryListForPurchaseProduct('10')
				.then((res) => {
					if (res.status === 200) {
						setPurchaseCategory(res.data);
					}
				});
		} catch (err) {
			console.log(err);
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

	const showWarehouseModal = () => {
		setOpenWarehouseModal(true);
	};

	const closeWarehouseModal = () => {
		setOpenWarehouseModal(false);
		productActions.getProductWareHouseList();
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
		// Custom validation
		if (exist === true) {
			setError('productName', { type: 'manual', message: 'Product name already exists' });
			return;
		}
		if (ProductExist === true) {
			setError('productCode', { type: 'manual', message: 'Product code already exists' });
			return;
		}
		if (data.isInventoryEnabled === true) {
			if (data.inventoryPurchasePrice === '') {
				setError('inventoryPurchasePrice', { type: 'manual', message: 'Inventory purchase price is required' });
				return;
			}
			if (data.inventoryQty === '') {
				setError('inventoryQty', { type: 'manual', message: 'Inventory quantity is required' });
				return;
			}
		}
		if (exciseTaxCheck === true && data.exciseTaxId === '') {
			setError('exciseTaxId', { type: 'manual', message: 'Excise tax is required' });
			return;
		}

		setDisabled(true);
		const productCode = data['productCode'];
		const salesUnitPrice = data['salesUnitPrice'];
		const salesTransactionCategoryId = data['salesTransactionCategoryId'];
		const salesDescription = data['salesDescription'];
		const purchaseDescription = data['purchaseDescription'];
		const purchaseTransactionCategoryId = data['purchaseTransactionCategoryId'];
		const purchaseUnitPrice = data['purchaseUnitPrice'];
		const vatCategoryId = data['vatCategoryId'];
		const exciseTaxId = data['exciseTaxId'];
		const vatIncluded = data['vatIncluded'];
		const inventoryPurchasePrice = data['inventoryPurchasePrice'];
		const inventoryQty = data['inventoryQty'];
		const inventoryReorderLevel = data['inventoryReorderLevel'];
		const contactId = data['contactId'] ? data['contactId'].value : '';
		const isInventoryEnabled = data['isInventoryEnabled'];
		const transactionCategoryId = data['transactionCategoryId'];
		const productCategoryId = data['productCategoryId'];
		const isActive = productActive;
		const exciseTaxCheckVal = exciseTaxCheck;
		const unitTypeId = data['unitTypeId'];

		let productPriceType;
		if (data['productPriceType'].includes('SALES')) {
			productPriceType = 'SALES';
		}
		if (data['productPriceType'].includes('PURCHASE')) {
			productPriceType = 'PURCHASE';
		}
		if (
			data['productPriceType'].includes('SALES') &&
			data['productPriceType'].includes('PURCHASE')
		) {
			productPriceType = 'BOTH';
		}
		const productName = data['productName'];
		const productType = data['productType'];
		const dataNew = {
			productCode,
			productName,
			productType,
			productPriceType,
			vatCategoryId,
			exciseTaxId,
			vatIncluded,
			isInventoryEnabled,
			contactId,
			transactionCategoryId,
			productCategoryId,
			isActive,
			exciseTaxCheck: exciseTaxCheckVal,
			unitTypeId,
			...(salesUnitPrice.length !== 0 && {
				salesUnitPrice,
			}),
			...(salesTransactionCategoryId.length !== 0 && {
				salesTransactionCategoryId,
			}),
			...(salesDescription.length !== 0 && {
				salesDescription,
			}),
			...(purchaseDescription.length !== 0 && {
				purchaseDescription,
			}),
			...(purchaseTransactionCategoryId.length !== 0 && {
				purchaseTransactionCategoryId,
			}),
			...(purchaseUnitPrice.length !== 0 && {
				purchaseUnitPrice,
			}),
			...(inventoryPurchasePrice.length !== 0 && {
				inventoryPurchasePrice,
			}),
			...(inventoryQty.length !== 0 && {
				inventoryQty,
			}),
			...(inventoryReorderLevel.length !== 0 && {
				inventoryReorderLevel,
			}),
		};
		const postData = getData(dataNew);
		setLoading(true);
		setDisableLeavePage(true);
		setLoadingMsg('Creating Product...');
		productActions
			.createAndSaveProduct(postData)
			.then((res) => {
				setDisabled(false);
				setLoading(false);
				if (res.status === 200) {
					commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Product Created Successfully'
					);
					if (createMore) {
						setCreateMore(false);
						setDisableLeavePage(false);
						reset({
							productName: '',
							productDescription: '',
							productCode: '',
							vatCategoryId: null,
							unitTypeId: null,
							productCategoryId: null,
							productWarehouseId: '',
							vatIncluded: false,
							productType: 'GOODS',
							salesUnitPrice: '',
							purchaseUnitPrice: '',
							productPriceType: [expense === true ? 'PURCHASE' : 'SALES'],
							salesTransactionCategoryId: { value: 84, label: 'Sales' },
							purchaseTransactionCategoryId: {
								value: 49,
								label: 'Cost of Goods Sold',
							},
							inventoryPurchasePrice: '',
							inventoryQty: '',
							inventoryReorderLevel: '',
							contactId: null,
							salesDescription: '',
							purchaseDescription: '',
							isInventoryEnabled: false,
							transactionCategoryId: { value: 150, label: 'Inventory Asset' },
							exciseTaxId: '',
						});
						getProductCode();
						getcompanyDetails();
					} else {
						if (isParentComponentPresent && isParentComponentPresent === true) {
							getCurrentProductData(res.data);
							closeModal(true);
						} else {
							history.push('/admin/master/product');
						}
						setLoading(false);
					}
				}
			})
			.catch((err) => {
				setDisabled(false);
				setLoading(false);
				commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Product Created Unsuccessfully'
				);
			});
	};

	const validationCheck = (value) => {
		const data = {
			moduleType: 1,
			name: value,
		};
		productActions.checkValidation(data).then((response) => {
			if (response.data === 'Product Name Already Exists') {
				setExist(true);
			} else {
				setExist(false);
			}
		});
	};

	const ProductvalidationCheck = (value) => {
		const data = {
			moduleType: 7,
			productCode: value,
		};
		productActions
			.checkProductNameValidation(data)
			.then((response) => {
				if (response.data === 'Product Code Already Exists') {
					setProductExist(true);
				} else {
					setProductExist(false);
				}
			});
	};

	const getProductCode = () => {
		productActions.getProductCode().then((res) => {
			if (res.status === 200) {
				setValue('productCode', res.data);
			}
		});
	};

	let tmpSupplier_list = [];
	supplier_list.map(item => {
		let obj = { label: item.label.contactName, value: item.value };
		tmpSupplier_list.push(obj);
	});

	if (loading === true) {
		return <Loader loadingMsg={loadingMsg} />;
	}

	return (
		<div>
			<div className="create-product-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="fas fa-box" />
												<span className="ml-2">{strings.CreateProduct}</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									<Row>
										<Col lg={12}>
											<Form onSubmit={handleSubmit(onSubmit)}>
												<Row>
													<Col lg={4}>
														<FormGroup check inline className="mb-3">
															<Label className="productlabel">{strings.ProductType}
																<i
																	id="ProductTypetip"
																	className="fa fa-question-circle ml-1"
																></i>
																<UncontrolledTooltip
																	placement="right"
																	target="ProductTypetip"
																>
																	The product type cannot be changed after any document has been created using this product.
																</UncontrolledTooltip>
															</Label>
															&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
															<FormGroup check inline>
																<div className="custom-radio custom-control">
																	<Controller
																		name="productType"
																		control={control}
																		render={({ field }) => (
																			<>
																				<input
																					className="custom-control-input"
																					type="radio"
																					id="producttypeone"
																					name="productType"
																					value="GOODS"
																					onChange={(e) => field.onChange(e.target.value)}
																					checked={field.value === 'GOODS'}
																				/>
																				<label className='custom-control-label'
																					htmlFor='producttypeone'
																				>
																					{strings.Goods}
																				</label>
																			</>
																		)}
																	/>
																</div>
															</FormGroup>
															<FormGroup check inline>
																<div className="custom-radio custom-control">
																	<Controller
																		name="productType"
																		control={control}
																		render={({ field }) => (
																			<>
																				<Input
																					className="custom-control-input"
																					type="radio"
																					id="producttypetwo"
																					name="productType"
																					value="SERVICE"
																					onChange={(e) => {
																						field.onChange(e.target.value);
																						setExciseTaxCheck(false);
																						setValue('exciseTaxId', '');
																					}}
																					checked={field.value === 'SERVICE'}
																				/>
																				<label className='custom-control-label'
																					htmlFor='producttypetwo'
																				>
																					{strings.Service}
																				</label>
																			</>
																		)}
																	/>
																</div>
															</FormGroup>
														</FormGroup>
													</Col>

													<Col lg={4}>
														{!(isParentComponentPresent && isParentComponentPresent === true) && (
															<FormGroup check inline className="mb-3">
																<Label className="productlabel"><span className="text-danger">* </span>{strings.Status}</Label>
																&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
																<FormGroup check inline>
																	<div className="custom-radio custom-control">
																		<Input
																			className="custom-control-input"
																			type="radio"
																			id="inline-radio1"
																			name="active"
																			checked={selectedStatus}
																			value={true}
																			onChange={(e) => {
																				if (e.target.value === 'true') {
																					setSelectedStatus(true);
																					setProductActive(true);
																				}
																			}}
																		/>
																		<label
																			className="custom-control-label"
																			htmlFor='inline-radio1'
																		>
																			{strings.Active}
																		</label>
																	</div>
																</FormGroup>
																<FormGroup check inline>
																	<div className="custom-radio custom-control">
																		<input
																			className="custom-control-input"
																			type="radio"
																			id="inline-radio2"
																			name="active"
																			value={false}
																			checked={!selectedStatus}
																			onChange={(e) => {
																				if (e.target.value === 'false') {
																					setSelectedStatus(false);
																					setProductActive(false);
																				}
																			}}
																		/>
																		<label
																			className='custom-control-label'
																			htmlFor='inline-radio2'
																		>
																			{strings.Inactive}
																		</label>
																	</div>
																</FormGroup>
															</FormGroup>
														)}
													</Col>
												</Row>
												<hr></hr>
												<Row>
													<Col lg={4}>
														<FormGroup className="mb-3">
															<Label htmlFor="productName">
																<span className="text-danger">* </span>{strings.ProductName}
															</Label>
															<Controller
																name="productName"
																control={control}
																render={({ field }) => (
																	<Input
																		{...field}
																		type="text"
																		maxLength="100"
																		id="productName"
																		autoComplete="Off"
																		onChange={(e) => {
																			if (e.target.value === '' || regExBoth.test(e.target.value)) {
																				field.onChange(e);
																			}
																			validationCheck(e.target.value);
																		}}
																		placeholder={strings.Enter + strings.ProductName}
																		className={errors.productName && touchedFields.productName ? 'is-invalid' : ''}
																	/>
																)}
															/>
															{errors.productName && touchedFields.productName && (
																<div className="invalid-feedback">
																	{errors.productName.message}
																</div>
															)}
														</FormGroup>
													</Col>

													<Col lg={4}>
														<FormGroup className="mb-3">
															<Label htmlFor="productCode">
																<span className="text-danger">* </span>
																{strings.ProductCode}
																<i
																	id="ProductCodeTooltip"
																	className="fa fa-question-circle ml-1"
																></i>
																<UncontrolledTooltip
																	placement="right"
																	target="ProductCodeTooltip"
																>
																	Product Code - Unique identifier code
																	for the product
																</UncontrolledTooltip>
															</Label>
															<Controller
																name="productCode"
																control={control}
																render={({ field }) => (
																	<Input
																		{...field}
																		type="text"
																		maxLength="50"
																		id="productCode"
																		disabled
																		placeholder={strings.Enter + strings.ProductCode}
																		onChange={(e) => {
																			if (e.target.value === '' || regExBoth.test(e.target.value)) {
																				field.onChange(e);
																			}
																			ProductvalidationCheck(e.target.value);
																		}}
																		className={errors.productCode && touchedFields.productCode ? 'is-invalid' : ''}
																	/>
																)}
															/>
															{errors.productCode && touchedFields.productCode && (
																<div className="invalid-feedback">
																	{errors.productCode.message}
																</div>
															)}
														</FormGroup>
													</Col>
												</Row>
												<Row>
													<Col lg={4}>
														<FormGroup className="mb-3">
															<Label htmlFor="productCategoryId">
																{strings.ProductCategory}
															</Label>
															<Controller
																name="productCategoryId"
																control={control}
																render={({ field }) => (
																	<Select
																		{...field}
																		styles={selectStyles}
																		className="select-default-width"
																		options={
																			product_category_list
																				? selectOptionsFactory.renderOptions(
																					'label',
																					'value',
																					product_category_list,
																					'Product Category',
																				)
																				: []
																		}
																		id="productCategoryId"
																		placeholder={strings.Select + strings.ProductCategory}
																		onChange={(option) => {
																			field.onChange(option || '');
																		}}
																		isClearable
																	/>
																)}
															/>
														</FormGroup>
													</Col>
													<Col lg={4}>
														<FormGroup className="mb-3">
															<Label htmlFor="vatCategoryId">
																<span className="text-danger">* </span>{strings.VATType}
															</Label>
															<Controller
																name="vatCategoryId"
																control={control}
																render={({ field }) => (
																	<Select
																		{...field}
																		styles={selectStyles}
																		isDisabled={companyDetails && !companyDetails.isRegisteredVat}
																		options={
																			vat_list
																				? selectOptionsFactory.renderOptions(
																					'name',
																					'id',
																					vat_list,
																					'VAT',
																				)
																				: []
																		}
																		id="vatCategoryId"
																		placeholder={strings.Select + "VAT Type"}
																		onChange={(option) => {
																			field.onChange(option || '');
																		}}
																		className={errors.vatCategoryId && touchedFields.vatCategoryId ? 'is-invalid' : ''}
																	/>
																)}
															/>
															{errors.vatCategoryId && touchedFields.vatCategoryId && (
																<div className="invalid-feedback">
																	{errors.vatCategoryId.message}
																</div>
															)}
														</FormGroup>
													</Col>
												</Row>
												<Row>
													<Col lg={4}>
														<FormGroup className="mb-3">
															<Label htmlFor="unitTypeId">
																{strings.unit_type}
															</Label>
															<Controller
																name="unitTypeId"
																control={control}
																render={({ field }) => (
																	<Select
																		{...field}
																		styles={selectStyles}
																		options={
																			unitTypeList
																				? selectOptionsFactory.renderOptions(
																					'unitType',
																					'unitTypeId',
																					unitTypeList,
																					'Unit Type',
																				)
																				: []
																		}
																		id="unitTypeId"
																		placeholder={strings.Select + strings.unit_type}
																		onChange={(option) => {
																			field.onChange(option || '');
																		}}
																		isClearable
																	/>
																)}
															/>
														</FormGroup>
													</Col>
												</Row>
												<Row style={{ display: watchedValues.productType !== 'SERVICE' ? '' : 'none' }}>
													<Col lg={4}>
														<FormGroup check inline className="mb-3">
															<Label
																className="form-check-label"
																check
																htmlFor="exciseTaxCheck"
															>
																<Input
																	type="checkbox"
																	id="exciseTaxCheck"
																	name="exciseTaxCheck"
																	onChange={(event) => {
																		if (exciseTaxCheck === true) {
																			setExciseTaxCheck(false);
																			setValue('exciseTaxId', '');
																		} else {
																			setExciseTaxCheck(true);
																		}
																	}}
																	checked={exciseTaxCheck}
																/>
																{strings.excise_product}
																<i
																	id="ExciseTooltip"
																	className="fa fa-question-circle ml-1"
																></i>
																<UncontrolledTooltip
																	placement="right"
																	target="ExciseTooltip"
																>
																	Note: It is not possible to switch from Excise Goods to Non-Excise Goods or vice versa once any document is created using this product.
																</UncontrolledTooltip>
															</Label>
														</FormGroup>
													</Col>
												</Row>
												<Row>
													{exciseTaxCheck === true && (
														<Col style={{ display: watchedValues.productType !== 'SERVICE' ? '' : 'none' }} lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="exciseTaxId">
																	<span className="text-danger">* </span>
																	{strings.excise_tax_type}
																</Label>
																<Controller
																	name="exciseTaxId"
																	control={control}
																	render={({ field }) => (
																		<Select
																			{...field}
																			styles={selectStyles}
																			options={
																				exciseTaxList
																					? selectOptionsFactory.renderOptions(
																						'name',
																						'id',
																						exciseTaxList,
																						'Excise Tax Slab',
																					)
																					: []
																			}
																			id="exciseTaxId"
																			placeholder={strings.Select + strings.excise_tax_slab}
																			onChange={(option) => {
																				field.onChange(option || '');
																			}}
																			className={errors.exciseTaxId && touchedFields.exciseTaxId ? 'is-invalid' : ''}
																		/>
																	)}
																/>
																{errors.exciseTaxId && touchedFields.exciseTaxId && (
																	<div className="invalid-feedback">
																		{errors.exciseTaxId.message}
																	</div>
																)}
															</FormGroup>
														</Col>
													)}
												</Row>
												<hr></hr>
												<Row>
													<Col lg={8}>
														<FormGroup check inline className="mb-3">
															<Label
																className="form-check-label"
																check
																htmlFor="productPriceTypeOne"
															>
																<Controller
																	name="productPriceType"
																	control={control}
																	render={({ field }) => (
																		<Input
																			type="checkbox"
																			maxLength="14,2"
																			id="productPriceTypeOne"
																			name="productPriceTypeOne"
																			onChange={(event) => {
																				if (income === true) {
																				} else {
																					if (field.value.includes('SALES')) {
																						const nextValue = field.value.filter(
																							(value) => value !== 'SALES',
																						);
																						field.onChange(nextValue);
																					} else {
																						const nextValue = field.value.concat('SALES');
																						field.onChange(nextValue);
																					}
																				}
																			}}
																			checked={field.value.includes('SALES')}
																			className={
																				errors.productPriceType &&
																					touchedFields.productPriceType
																					? 'is-invalid'
																					: ''
																			}
																		/>
																	)}
																/>
																{strings.SalesInformation}
																{errors.productPriceType &&
																	touchedFields.productPriceType && (
																		<div className="invalid-feedback">
																			{errors.productPriceType.message}
																		</div>
																	)}
															</Label>
														</FormGroup>
														<Row>
															<Col>
																<FormGroup className="mb-3">
																	<Label htmlFor="salesUnitPrice">
																		<span className="text-danger">* </span>{' '}
																		{strings.SellingPrice}
																		<i
																			id="SalesTooltip"
																			className="fa fa-question-circle ml-1"
																		></i>
																		<UncontrolledTooltip
																			placement="right"
																			target="SalesTooltip"
																		>
																			Selling price – Price at which your
																			product is sold
																		</UncontrolledTooltip>
																	</Label>
																	<Controller
																		name="salesUnitPrice"
																		control={control}
																		render={({ field }) => (
																			<Input
																				{...field}
																				type="text"
																				maxLength="14,2"
																				id="salesUnitPrice"
																				autoComplete="Off"
																				placeholder={strings.Enter + strings.SellingPrice}
																				readOnly={
																					watchedValues.productPriceType.includes(
																						'SALES',
																					)
																						? false
																						: true
																				}
																				onChange={(e) => {
																					if (
																						e.target.value === '' ||
																						regDecimal.test(e.target.value)
																					) {
																						field.onChange(e);
																					}
																				}}
																				className={
																					errors.salesUnitPrice &&
																						touchedFields.salesUnitPrice
																						? 'is-invalid'
																						: ''
																				}
																			/>
																		)}
																	/>
																	{errors.salesUnitPrice &&
																		touchedFields.salesUnitPrice && (
																			<div className="invalid-feedback">
																				{errors.salesUnitPrice.message}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col>
																<FormGroup className="mb-3">
																	<Label htmlFor="transactionCategoryId">
																		<span className="text-danger">* </span>{' '}
																		{strings.Account}
																	</Label>
																	<Controller
																		name="salesTransactionCategoryId"
																		control={control}
																		render={({ field }) => (
																			<Select
																				{...field}
																				styles={selectStyles}
																				isDisabled={
																					watchedValues.productPriceType.includes(
																						'SALES',
																					)
																						? false
																						: true
																				}
																				options={
																					salesCategory ? salesCategory : []
																				}
																				id="salesTransactionCategoryId"
																				onChange={(option) => {
																					field.onChange(option || '');
																				}}
																				className={
																					errors.salesTransactionCategoryId &&
																						touchedFields.salesTransactionCategoryId
																						? 'is-invalid'
																						: ''
																				}
																			/>
																		)}
																	/>
																	{errors.salesTransactionCategoryId &&
																		touchedFields.salesTransactionCategoryId && (
																			<div className="invalid-feedback">
																				{errors.salesTransactionCategoryId.message}
																			</div>
																		)}
																</FormGroup>
															</Col>
														</Row>
														<FormGroup className="">
															<Label htmlFor="salesDescription">
																{strings.Description}
															</Label>
															<Controller
																name="salesDescription"
																control={control}
																render={({ field }) => (
																	<Input
																		{...field}
																		readOnly={
																			watchedValues.productPriceType.includes(
																				'SALES',
																			)
																				? false
																				: true
																		}
																		type="textarea"
																		maxLength="2000"
																		id="salesDescription"
																		rows="3"
																		placeholder={strings.Description}
																	/>
																)}
															/>
														</FormGroup>
													</Col>
												</Row>
												<Row>
													<Col lg={8}>
														<FormGroup check inline className="mb-3">
															<Label
																className="form-check-label"
																check
																htmlFor="productPriceTypetwo"
															>
																<Controller
																	name="productPriceType"
																	control={control}
																	render={({ field }) => (
																		<Input
																			type="checkbox"
																			id="productPriceTypetwo"
																			maxLength="14,2"
																			name="productPriceTypetwo"
																			onChange={(event) => {
																				if (income === false) {
																				} else {
																					if (field.value.includes('PURCHASE')) {
																						const nextValue = field.value.filter(
																							(value) => value !== 'PURCHASE',
																						);
																						field.onChange(nextValue);
																					} else {
																						const nextValue = field.value.concat('PURCHASE');
																						field.onChange(nextValue);
																					}
																				}
																			}}
																			checked={field.value.includes('PURCHASE')}
																			className={
																				errors.productPriceType &&
																					touchedFields.productPriceType
																					? 'is-invalid'
																					: ''
																			}
																		/>
																	)}
																/>
																{strings.PurchaseInformation}
																{errors.productPriceType &&
																	touchedFields.productPriceType && (
																		<div className="invalid-feedback">
																			{errors.productPriceType.message}
																		</div>
																	)}
															</Label>
														</FormGroup>
														<Row>
															<Col>
																<FormGroup className="mb-3">
																	<Label htmlFor="salesUnitPrice">
																		<span className="text-danger">* </span>{' '}
																		{strings.PurchasePrice}
																		<i
																			id="PurchaseTooltip"
																			className="fa fa-question-circle ml-1"
																		></i>
																		<UncontrolledTooltip
																			placement="right"
																			target="PurchaseTooltip"
																		>
																			Purchase price – Amount of money you
																			paid for the product
																		</UncontrolledTooltip>
																	</Label>
																	<Controller
																		name="purchaseUnitPrice"
																		control={control}
																		render={({ field }) => (
																			<Input
																				{...field}
																				type="text"
																				maxLength="14,2"
																				id="purchaseUnitPrice"
																				autoComplete="Off"
																				placeholder={strings.Enter + strings.PurchasePrice}
																				onChange={(e) => {
																					if (
																						e.target.value === '' ||
																						regDecimal.test(e.target.value)
																					) {
																						field.onChange(e);
																					}
																				}}
																				readOnly={
																					watchedValues.productPriceType.includes(
																						'PURCHASE',
																					)
																						? false
																						: true
																				}
																				className={
																					errors.purchaseUnitPrice &&
																						touchedFields.purchaseUnitPrice
																						? 'is-invalid'
																						: ''
																				}
																			/>
																		)}
																	/>
																	{errors.purchaseUnitPrice &&
																		touchedFields.purchaseUnitPrice && (
																			<div className="invalid-feedback">
																				{errors.purchaseUnitPrice.message}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col>
																<FormGroup className="mb-3">
																	<Label htmlFor="salesUnitPrice">
																		<span className="text-danger">* </span>{' '}
																		{strings.Account}
																	</Label>
																	<Controller
																		name="purchaseTransactionCategoryId"
																		control={control}
																		render={({ field }) => (
																			<Select
																				{...field}
																				styles={selectStyles}
																				isDisabled={
																					watchedValues.productPriceType.includes(
																						'PURCHASE',
																					)
																						? false
																						: true
																				}
																				options={
																					purchaseCategory ? purchaseCategory : []
																				}
																				id="purchaseTransactionCategoryId"
																				onChange={(option) => {
																					field.onChange(option || '');
																				}}
																				className={
																					errors.purchaseTransactionCategoryId &&
																						touchedFields.purchaseTransactionCategoryId
																						? 'is-invalid'
																						: ''
																				}
																			/>
																		)}
																	/>
																	{errors.purchaseTransactionCategoryId &&
																		touchedFields.purchaseTransactionCategoryId && (
																			<div className="invalid-feedback">
																				{errors.purchaseTransactionCategoryId.message}
																			</div>
																		)}
																</FormGroup>
															</Col>
														</Row>
														<FormGroup className="">
															<Label htmlFor="purchaseDescription">
																{strings.Description}
															</Label>
															<Controller
																name="purchaseDescription"
																control={control}
																render={({ field }) => (
																	<Input
																		{...field}
																		readOnly={
																			watchedValues.productPriceType.includes(
																				'PURCHASE',
																			)
																				? false
																				: true
																		}
																		type="textarea"
																		maxLength="2000"
																		autoComplete="Off"
																		id="purchaseDescription"
																		rows="3"
																		placeholder={strings.Description}
																	/>
																)}
															/>
														</FormGroup>
													</Col>
												</Row>

												<hr></hr>

												<Row
													style={{
														display:
															watchedValues.productPriceType.includes(
																'PURCHASE'

															) && watchedValues.productType !==
																'SERVICE'

																? '' : 'none'

													}}

												>
													{config.INVENTORY_MODULE &&

														<Col lg={8}>
															<FormGroup check inline className="mb-3">
																<Label
																	className="form-check-label"
																	check
																	htmlFor="isInventoryEnabled"
																>
																	<Controller
																		name="isInventoryEnabled"
																		control={control}
																		render={({ field }) => (
																			<Input
																				className="form-check-input"
																				type="checkbox"
																				id="isInventoryEnabled"
																				onChange={(e) => field.onChange(e.target.checked)}
																				checked={field.value}
																			/>
																		)}
																	/>
																	{strings.EnableInventory}
																	{errors.productPriceType &&
																		touchedFields.productPriceType && (
																			<div className="invalid-feedback">
																				{errors.productPriceType.message}
																			</div>
																		)}
																	<i
																		id="EnventoryTooltip"
																		className="fa fa-question-circle ml-1"
																	></i>
																	<UncontrolledTooltip
																		placement="right"
																		target="EnventoryTooltip"
																	>
																		Inventory cannot be enabled or disabled once a document has been created using this product.
																	</UncontrolledTooltip>
																</Label>
															</FormGroup>

															<Row style={{ display: watchedValues.isInventoryEnabled === false ? 'none' : '' }}>
																<Col>
																	<FormGroup className="mb-3">
																		<Label htmlFor="salesUnitPrice">
																			<span className="text-danger">* </span> {strings.InventoryAccount}
																		</Label>
																		<Controller
																			name="transactionCategoryId"
																			control={control}
																			render={({ field }) => (
																				<Select
																					{...field}
																					styles={selectStyles}
																					options={
																						inventoryAccount ? inventoryAccount : []
																					}
																					id="transactionCategoryId"
																					onChange={(option) => {
																						field.onChange(option || '');
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
																<Col>
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
																					onChange={(option) => {
																						field.onChange(option || '');
																					}}
																					className={
																						errors.contactId &&
																							touchedFields.contactId
																							? 'is-invalid'
																							: ''
																					}
																					isClearable
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
															<Row style={{ display: watchedValues.isInventoryEnabled === false ? 'none' : '' }}>
																<Col>
																	<FormGroup className="mb-3">
																		<Label htmlFor="inventoryPurchasePrice">
																			<span className="text-danger">* </span>	{strings.PurchasePrice}
																		</Label>
																		<Controller
																			name="inventoryPurchasePrice"
																			control={control}
																			render={({ field }) => (
																				<Input
																					{...field}
																					type="text"
																					min="0"
																					maxLength="14,2"
																					id="inventoryPurchasePrice"
																					autoComplete="Off"
																					placeholder={strings.Enter + strings.PurchasePrice}
																					onChange={(e) => {
																						if (
																							e.target.value === '' ||
																							regDecimal.test(e.target.value)
																						) {
																							field.onChange(e);
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
																		<i>{strings.inventory_note}</i>


																	</FormGroup>
																</Col>
																<Col>
																	<FormGroup className="mb-3">
																		<Label htmlFor="inventoryQty">
																			<span className="text-danger">* </span>	 {strings.OpeningBalanceQuantity}

																		</Label>
																		<Controller
																			name="inventoryQty"
																			control={control}
																			render={({ field }) => (
																				<Input
																					{...field}
																					type="text"
																					min="0"
																					maxLength="10"
																					id="inventoryQty"
																					autoComplete="Off"
																					placeholder={strings.Enter + strings.OpeningBalanceQuantity}
																					onChange={(e) => {
																						if (
																							e.target.value === '' ||
																							regEx.test(e.target.value)
																						) {
																							field.onChange(e);
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
															<Row style={{ display: watchedValues.isInventoryEnabled === false ? 'none' : '' }}>
																<Col lg={6}>
																	<FormGroup className="">
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
																					max="1000"
																					maxLength="10"
																					id="inventoryReorderLevel"
																					autoComplete="Off"
																					rows="3"
																					placeholder={strings.Enter + strings.InventoryReorderLevel}
																					onChange={(e) => {
																						if (
																							e.target.value === '' ||
																							regDecimal5.test(e.target.value)
																						) {
																							field.onChange(e);
																						}
																					}}
																					className={
																						errors.inventoryReorderLevel &&
																							touchedFields.inventoryReorderLevel
																							? 'is-invalid'
																							: ''
																					}
																				/>
																			)}
																		/>
																		{errors.inventoryReorderLevel &&
																			touchedFields.inventoryReorderLevel && (
																				<div className="invalid-feedback">
																					{errors.inventoryReorderLevel.message}
																				</div>
																			)}
																	</FormGroup>
																</Col>

															</Row>

														</Col>
													}
												</Row>

												<Row>
													<Col lg={12} className="mt-5">
														<FormGroup className="text-right" disabled={disabled}>
															<Button
																type="button"
																color="primary"
																className="btn-square mr-3"
																disabled={disabled}
																onClick={() => {
																	trigger();
																	if (errors && Object.keys(errors).length !== 0) {
																		commonActions.fillManDatoryDetails();
																	} else {
																		setCreateMore(false);
																		handleSubmit(onSubmit)();
																	}
																}}
															>
																<i className="fa fa-dot-circle-o"></i>{' '}
																{disabled
																	? 'Creating...'
																	: strings.Create}
															</Button>
															{!(isParentComponentPresent && isParentComponentPresent === true) && (
																<Button
																	name="button"
																	color="primary"
																	className="btn-square mr-3"
																	disabled={disabled}
																	onClick={() => {
																		trigger();
																		if (errors && Object.keys(errors).length !== 0) {
																			commonActions.fillManDatoryDetails();
																		} else {
																			setCreateMore(true);
																			handleSubmit(onSubmit)();
																		}
																	}}
																>
																	<i className="fa fa-refresh"></i> 	{disabled
																		? 'Creating...'
																		: strings.CreateandMore}
																</Button>
															)}
															<Button
																color="secondary"
																className="btn-square"
																onClick={() => {
																	if (isParentComponentPresent && isParentComponentPresent === true) {
																		closeModal(true);
																	} else {
																		history.push('/admin/master/product');
																	}
																}}
															>
																<i className="fa fa-ban mr-1"></i>{strings.Cancel}
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
			{disableLeavePage ? "" : <LeavePage />}
		</div>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateProduct);
