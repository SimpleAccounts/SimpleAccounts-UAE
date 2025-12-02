import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
import { Formik } from 'formik';
import * as Yup from 'yup';
import './style.scss';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import * as ProductActions from '../../actions';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions';
import { CommonActions } from 'services/global';
import { WareHouseModal } from '../../sections';
import { selectOptionsFactory } from 'utils';
import config from '../../../../constants/config'

const mapStateToProps = (state) => {
	return {
		vat_list: state.product.vat_list,
		product_warehouse_list: state.product.product_warehouse_list,
		product_category_list: state.product.product_category_list,
		supplier_list: state.supplier_invoice.supplier_list,
		inventory_account_list:state.product.inventory_account_list,

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
const customStyles = {
	control: (base, state) => ({
		...base,
		borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
		boxShadow: state.isFocused ? null : null,
		'&:hover': {
			borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
		},
	}),
};

let strings = new LocalizedStrings(data);
class CreateProduct extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
			openWarehouseModal: false,
			contactType:1,
			initValue: {
				productName: '',
				productDescription: '',
				productCode: '',
				vatCategoryId:'',
				unitTypeId:'',
				productCategoryId: '',
				productWarehouseId: '',
				vatIncluded: false,
				productType: 'GOODS',
				salesUnitPrice: '',
				purchaseUnitPrice: '',
				productPriceType: [this.props.expense === true ? 'PURCHASE' : 'SALES'],
				income: this.props.expense === true ? true : false,
				expense: this.props.income === true ? true : false,
				salesTransactionCategoryId: { value: 84, label: 'Sales' },
				purchaseTransactionCategoryId: {
					value: 49,
					label: 'Cost of Goods Sold',
				},
				inventoryPurchasePrice: '',
				inventoryQty:'',
				inventoryReorderLevel:'',
				contactId:'',
				salesDescription: '',
				purchaseDescription: '',
				productSalesPriceType: '',
				productPurchasePriceType: '',
				disabled: false,
				isInventoryEnabled: false,
				transactionCategoryId:{value: 150, label: 'Inventory Asset'},
				exciseTaxId:''
			},
			purchaseCategory: [],
			salesCategory: [],
			createMore: false,
			exist: false,
			ProductExist: false,
			disabled: false,
			productActive: true,
			isActive:true,
			selectedStatus:true,
			exciseTaxList:[],
			unitTypeList:[],
			exciseTaxCheck:false,
			exciseType:false,
			exciseAmount:0	,
			loadingMsg:"Loading",
			disableLeavePage:false
		};
		this.formRef = React.createRef();       
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[ +a-zA-Z0-9-./\\|!@#$%^&*()_<>,]+$/;
		this.regExAlpha = /^[0-9!@#$&()-\\`.+,/\"]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
		this.regDecimal5 =/^\d{1,10}$/;
		this.regExAlpha2 = /^[a-zA-Z ]+$/;
	}

	getcompanyDetails=()=>{
		this.props.productActions.getCompanyDetails().then((res) => {
			if (res.status === 200)
			 {
				 this.setState({
				 companyDetails: res.data,				
				//  initValue: {
				// 			...this.state.initValue,
				// 			...{ vatCategoryId:{label: "ZERO RATED TAX (0%)", value: 2} },
				// 			}, 
				});
				if(res.data && res.data.isRegisteredVat==false)
					{
						this.formRef.current.setFieldValue('vatCategoryId', {label: "N/A", value: 10}, true,true);
					}
		}
		})
		.catch((err) => {		
			this.props.commonActions.tostifyAlert(	'error',	err && err.data ? err.data.message : 'Something Went Wrong',	);
		});
	}
	componentDidMount = () => {
		this.initializeData();
		this.salesCategory();
		this.purchaseCategory();
		this.inventoryAccount();
		this.getProductCode();
		this.getcompanyDetails();
	};
	initializeData = () => {
		this.props.productActions.getProductVatCategoryList();
		this.props.productActions.getExciseTaxList().then((res) => {
			if (res.status === 200) {
				this.setState({
					exciseTaxList:res.data
				});
			}
		});
		this.props.productActions.getUnitTypeList().then((res) => {
			if (res.status === 200) {
				this.setState({
					unitTypeList:res.data
				});
			}
		});
	//	this.props.productActions.getTransactionCategoryListForInventory();
		this.props.productActions.getProductCategoryList();
		this.props.supplierInvoiceActions.getSupplierList(this.state.contactType);
	};

	salesCategory = () => {
		try {
			this.props.productActions
				.getTransactionCategoryListForSalesProduct('2')
				.then((res) => {
					if (res.status === 200) {
						this.setState(
							{
								salesCategory: res.data,
							},
							() => {
							},
						);
					}
				});
		} catch (err) {
			console.log(err);
		}
	};
	purchaseCategory = () => {
		try {
			this.props.productActions
				.getTransactionCategoryListForPurchaseProduct('10')
				.then((res) => {
					if (res.status === 200) {
						this.setState(
							{
								purchaseCategory: res.data,
							},
							() => {},
						);
					}
				});
		} catch (err) {
			console.log(err);
		}
	};
inventoryAccount = () => {
try {
	this.props.productActions
		.getTransactionCategoryListForInventory()
		.then((res) => {
			if (res.status === 200) {
				this.setState(
					{
						inventoryAccount: res.data,
					},
					() => {},
				);
			}
		});
} catch (err) {
	console.log(err);
}};
	// Show Invite User Modal
	showWarehouseModal = () => {
		this.setState({ openWarehouseModal: true });
	};
	// Cloase Confirm Modal
	closeWarehouseModal = () => {
		this.setState({ openWarehouseModal: false });
		this.props.productActions.getProductWareHouseList();
	};
	
	 
	getData = (data) => {
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

	// Create or Edit Product
	handleSubmit = (data, resetForm) => {
		this.setState({ disabled: true });
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
		const contactId = data['contactId'].value;
		const isInventoryEnabled = data['isInventoryEnabled'];
		const transactionCategoryId = data['transactionCategoryId'];
		const productCategoryId = data['productCategoryId'];
		const isActive = this.state.productActive;
		// const exciseType = this.state.exciseType;
		const exciseAmount=this.state.exciseAmount;
		const exciseTaxCheck = this.state.exciseTaxCheck;
		const unitTypeId=data['unitTypeId'];
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
			exciseTaxCheck,
			// exciseType,
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
		const postData = this.getData(dataNew);
		this.setState({ loading:true, disableLeavePage:true, loadingMsg:"Creating Product..."});
		this.props.productActions
			.createAndSaveProduct(postData)
			.then((res) => {
				this.setState({ disabled: false });
				this.setState({ loading:false});
				if (res.status === 200) {
					// this.setState({ disabled: false });
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Product Created Successfully'
					);
					if (this.state.createMore) {
						this.setState({
							createMore: false,
							disableLeavePage: false,
						});
						resetForm(this.state.initValue);
						this.getProductCode()
						this.getcompanyDetails();
						// this.props.history.push('/admin/master/product/create')
					} else {
						if(this.props.isParentComponentPresent &&this.props.isParentComponentPresent ==true)
						{
							this.props.getCurrentProductData(res.data);
							this.props.closeModal(true);
						 }
						else
						this.props.history.push('/admin/master/product');
						this.setState({ loading:false,});
					}
				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Product Created Unsuccessfully'
				);
			});
	};

	validationCheck = (value) => {
		const data = {
			moduleType: 1,
			name: value,
		};
		this.props.productActions.checkValidation(data).then((response) => {
			if (response.data === 'Product Name Already Exists') {
				this.setState({
					exist: true,
				});
			} else {
				this.setState({
					exist: false,
				});
			}
		});
	};
	
	ProductvalidationCheck = (value) => {
		const data = {
			moduleType: 7,
			productCode: value,
		};
		this.props.productActions
			.checkProductNameValidation(data)
			.then((response) => {
				if (response.data === 'Product Code Already Exists') {
					this.setState({
						ProductExist: true,
					});
				} else {
					this.setState({
						ProductExist: false,
					});
				}
			});
	};
	getProductCode=()=>{

		this.props.productActions.getProductCode().then((res) => {
			if (res.status === 200) {
				this.setState({
					initValue: {
						...this.state.initValue,
						...{ productCode: res.data },
					},
				});
				this.formRef.current.setFieldValue('productCode', res.data, true,true
				// this.validationCheck(res.data)
				);
			}
		});
	
	// console.log(this.state.employeeCode)
	}
	render() {
		strings.setLanguage(this.state.language);
		const { vat_list, product_category_list,supplier_list,inventory_account_list, income} = this.props;
		const { initValue, purchaseCategory, salesCategory,inventoryAccount,exciseTaxList,unitTypeList } = this.state;
		const { loading, loadingMsg } = this.state
		let tmpSupplier_list = []

		supplier_list.map(item => {
			let obj = {label: item.label.contactName, value: item.value}
			tmpSupplier_list.push(obj)
		})

		// console.log(this.state)
		// console.log(this.props)
		return (
			loading ==true? <Loader loadingMsg={loadingMsg}/> :
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
								{loading ? (
										<Row>
											<Col lg={12}>
												<Loader />
											</Col>
										</Row>
									) : (
									<Row>
										<Col lg={12}>
											<Formik
											ref={this.formRef}
												initialValues={initValue}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
												}}
												validate={(values) => {
													let errors = {};
													if (!values.productName) {
														errors.productName = 'Product name is required';
													}
													if (this.state.exist === true) {
														errors.productName =
															'Product name already exists';
													}
													if (this.state.ProductExist === true) {
														errors.productCode =
															'Product code already exist';
													}
													if (values.productName==='') {
														errors.productName = 'Product name is required'
													}
													if (values.productCode==='') {
														errors.productCode = 'Product code is required';
													}
													// if (values.inventoryReorderLevel > values.inventoryQty)
													// {
													// 	errors.inventoryReorderLevel = 
													// 		'Re-order level should be less than purchase quantity';
													// }
													// if (values.inventoryPurchasePrice > values.salesUnitPrice) {
													// 	errors.inventoryPurchasePrice = 
													// 	'Purchase price cannot be greater than Sales price';
													// }
													// else if (values.purchaseUnitPrice > values.salesUnitPrice) {
													// 	errors.purchaseUnitPrice = 
													// 	'Purchase price cannot be greater than Sales price';
													// }

													//  if (values.salesUnitPrice < values.purchaseUnitPrice) {

                                                    //     errors.salesUnitPrice= 

                                                    //     'Purchase price cannot be less than Sales price';

                                                    // }
													if(values.isInventoryEnabled===true){
														// if (values.salesUnitPrice < values.inventoryPurchasePrice) {

														// 	errors.salesUnitPrice= 
	
														// 	'Purchase price cannot be less than Sales price';
	
														// }														
														if(values.inventoryPurchasePrice ==='')
														errors.inventoryPurchasePrice = 
														'Inventory purchase price is required';

														// if(values.inventoryReorderLevel ==='')
														// errors.inventoryReorderLevel = 
														// 'Inventory reorder level is required';

														if(values.inventoryQty ==='')
														errors.inventoryQty = 
														'Inventory quantity is required';
														
													}

													if(this.state.exciseTaxCheck===true && values.exciseTaxId=='' ){
														errors.exciseTaxId = 'Excise tax is required';
													}
													return errors;
												}}
												
												validationSchema={
													Yup.object().shape({
													// isActive : Yup.boolean()
													// .required('status is required') , 
													purchaseUnitPrice: Yup.string().when(
														'productPriceType',
														{
															is: (value) => value.includes('PURCHASE'),
															then: Yup.string().required(
																'Purchase price is required',
															),
															otherwise: Yup.string(),
														},
													),
													purchaseTransactionCategoryId: Yup.string().when(
														'productPriceType',
														{
															is: (value) => value.includes('PURCHASE'),
															then: Yup.string().required(
																'Purchase category is required',
															),
															otherwise: Yup.string(),
														},
													),
													salesTransactionCategoryId: Yup.string().when(
														'productPriceType',
														{
															is: (value) => value.includes('SALES'),
															then: Yup.string().required(
																'Selling category is required',
															),
															otherwise: Yup.string(),
														},
													),
													salesUnitPrice: Yup.string().when(
														'productPriceType',
														{
															is: (value) => value.includes('SALES'),
															then: Yup.string().required(
																strings.SellingPriceRequired
															),
															otherwise: Yup.string(),
														},
													),
													productPriceType: Yup.string().required(
														'At least one selling type is required',
													),
													productCode: Yup.string().required(
														'Product code is required',
													),
													vatCategoryId: Yup.string()
														.required(strings.VATTYPERequired
															)
														.nullable(),
												})}
											>
												{(props) => {
													const { handleBlur } = props;
													return (
														<Form onSubmit={props.handleSubmit}>
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
																				<input
																					className="custom-control-input"
																					type="radio"
																					id="producttypeone"
																					name="producttypeone"
																					// checked={
																					// 	this.state.selectedStatus
																					// }
																					value="GOODS"
																					onChange={(value) => {
																						props.handleChange('productType')(
																							value,
																						);
																					}}
																					checked={
																						props.values.productType === 
																						'GOODS'
																					}
																				/>
																				<label className='custom-control-label'
																				htmlFor='producttypeone'
																				>
																				{strings.Goods}
																				</label>
																				</div>
																				</FormGroup>
																				<FormGroup check inline>
																				<div className="custom-radio custom-control">
																				<Input
																					className="custom-control-input"
																					type="radio"
																					id="producttypetwo"
																					name="producttypetwo"
																					
																					value="SERVICE"
																					onChange={(value) => {
																						props.handleChange('productType')(
																							value,
																						);
																						this.setState({exciseTaxCheck:false,exciseType:false})
																						props.handleChange('exciseTaxCheck')('',);
																					}}
																					checked={
																						props.values.productType ===
																						'SERVICE'
																					}
																				/>
																				<label className='custom-control-label'
																				htmlFor='producttypetwo'
																				>
																				{strings.Service}
																				</label>
																		</div>
																	</FormGroup>
																	</FormGroup>
																</Col>

																<Col lg={4}>
																{this.props.isParentComponentPresent &&this.props.isParentComponentPresent ==true ?"":(		<FormGroup check inline className="mb-3">
																	<Label className="productlabel"><span className="text-danger">* </span>{strings.Status}</Label>
																	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
																	<FormGroup check inline>	
																		 <div className="custom-radio custom-control">
																	<Input
																		className="custom-control-input"
																		type="radio"
																		id="inline-radio1"
                                                                        name="active"
																		checked={
																					this.state.selectedStatus
																				}
																		value={true}
																		onChange={(e) => {
																				if (
																						e.target.value === 'true'
																					) {
																						this.setState({
																						selectedStatus: true,
																						productActive: true,
																						isActive:true
																							});
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
                                                                                    checked={
																						!this.state.selectedStatus
																					}
																					onChange={(e) => {
																						if (
																									e.target.value === 'false'
																							) {
																									this.setState({
																									selectedStatus: false,
																									productActive: false,
																									isActive:false
																								});
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
																	</FormGroup>)}
                                                                </Col>
															</Row>
															<hr></hr>
															<Row>
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="productName">
																			<span className="text-danger">* </span>{strings.ProductName}
																		</Label>
																		<Input
																			type="text"
																			maxLength="100"
																			id="productName"
																			name="productName"
																			autoComplete="Off"
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regExBoth.test(
																						option.target.value,
																					)
																				) {
																					props.handleChange('productName')(
																						option,
																					);
																				}
																				this.validationCheck(
																					option.target.value,
																				);
																			}}
																			// onBlur={handleBlur}
																			value={props.values.productName}
																			placeholder={strings.Enter+strings.ProductName}
																			className={
																				props.errors.productName &&
																				props.touched.productName
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.productName &&
																			props.touched.productName && (
																				<div className="invalid-feedback">
																					{props.errors.productName}
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
																		<Input
																			type="text"
																			maxLength="50"
																			id="productCode"
																			name="productCode"
	                         /**Added as per discussion with sajid sir ,disabled product code for sanity*/

																			disabled
																			placeholder={strings.Enter+strings.ProductCode}
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regExBoth.test(
																						option.target.value,
																					)
																				) {
																					props.handleChange('productCode')(
																						option,
																					);
																				}
																				this.ProductvalidationCheck(
																					option.target.value,
																				);
																			}}
																			onBlur={handleBlur}
																			value={props.values.productCode}
																			className={
																				props.errors.productCode &&
																				props.touched.productCode
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.productCode &&
																			props.touched.productCode && (
																				<div className="invalid-feedback">
																					{props.errors.productCode}
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
																		<Select
																			styles={customStyles}
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
																			name="productCategoryId"
																			placeholder={strings.Select+strings.ProductCategory}
																			value={props.values.productCategoryId}
																			onChange={(option) => {
																				// this.setState({
																				//   selectedParentProduct: option.value
																				// })
																				if (option && option.value) {
																					props.handleChange(
																						'productCategoryId',
																					)(option);
																				} else {
																					props.handleChange(
																						'productCategoryId',
																					)('');
																				}
																			}}
																		/>
																	</FormGroup>
																</Col>
																{/* <Col lg={4}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="unitPrice">
                                    Product Price
                                  </Label>
                                  <Input
                                    type="text"
                                    id="unitPrice"
                                    name="unitPrice"
                                    placeholder="Enter Product Price"
                                    onChange={(option) => {
                                      if (
                                        option.target.value === '' ||
                                        this.regEx.test(option.target.value)
                                      ) {
                                        props.handleChange('unitPrice')(option);
                                      }
                                    }}
                                    value={props.values.unitPrice}
                                  />
                                </FormGroup>
                              </Col> */}
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="vatCategoryId">
																			<span className="text-danger">* </span>{strings.VATType}
																		</Label>
																		<Select
																	    	 isDisabled={this.state.companyDetails && !this.state.companyDetails.isRegisteredVat}
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
																			name="vatCategoryId"
																			placeholder={strings.Select+"VAT Type"}
																			value={props.values.vatCategoryId}
																			onChange={(option) => {
																				// this.setState({
																				//   selectedVatCategory: option.value
																				// })
																				if (option && option.value) {
																					props.handleChange('vatCategoryId')(
																						option,
																					);
																				} else {
																					props.handleChange('vatCategoryId')(
																						'',
																					);
																				}
																			}}
																			className={
																				props.errors.vatCategoryId &&
																				props.touched.vatCategoryId
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.vatCategoryId &&
																			props.touched.vatCategoryId && (
																				<div className="invalid-feedback">
																					{props.errors.vatCategoryId}
																				</div>
																			)}
																	</FormGroup>
																</Col>
															</Row>
															<Row>
															<Col  lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="unitTypeId">
																		{strings.unit_type}
																		</Label>
																		<Select
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
																			name="unitTypeId"
																			placeholder={strings.Select+ strings.unit_type}
																			value={props.values.unitTypeId}
																			onChange={(option) => {
																				
																				if (option && option.value) {
																					props.handleChange('unitTypeId')(
																						option,
																					);
																				} else {
																					props.handleChange('unitTypeId')(
																						'',
																					);
																				}
																			}}																			
																		/>																	
																	</FormGroup>
																</Col>
															</Row>
															<Row style={{display: props.values.productType !== 'SERVICE' ? '' : 'none'}}		>
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
																					if (
																						this.state.exciseTaxCheck===true
																						)
																					 {
																						this.setState({exciseTaxCheck:false,exciseType:false})
																						props.handleChange('exciseTaxCheck')(
																							'',
																						);
																					} else {
																						this.setState({exciseTaxCheck:true})
																					}
																				}}
																				checked={this.state.exciseTaxCheck}
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
																{this.state.exciseTaxCheck===true&&(	
												
																<Col  style={{display: props.values.productType !='SERVICE'   ?'' : 'none'}}	 lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="exciseTaxId">
																			<span className="text-danger">* </span>
																			{strings.excise_tax_type}
																		</Label>
																		<Select
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
																			name="exciseTaxId"
																			placeholder={strings.Select + strings.excise_tax_slab }
																			value={props.values.exciseTaxId}
																			onChange={(option) => {
																				
																				if (option && option.value) {
																					props.handleChange('exciseTaxId')(
																						option,
																					);
																				} else {
																					props.handleChange('exciseTaxId')(
																						'',
																					);
																				}
																			}}
																			className={
																				props.errors.exciseTaxId &&
																				props.touched.exciseTaxId
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.exciseTaxId &&
																			props.touched.exciseTaxId && (
																				<div className="invalid-feedback">
																					{props.errors.exciseTaxId}
																				</div>
																			)}
																	</FormGroup>
																</Col>

															)}
																
																</Row>
																{/* {this.state.exciseTaxCheck===true&&(	<Row>
															<Col  style={{display: props.values.productType !='SERVICE'   ?'' : 'none'}}>
																<label className='mr-4'><b>Excise Type</b></label>
																	{this.state.exciseType === false ?
																	 <span style={{color : "#0069d9"}} className='mr-4'><b>Inclusive</b></span> :
																	 <span className='mr-4'>Inclusive</span>}
																	<Switch
																		checked={this.state.exciseType}
																		onChange={(exciseType) => {
																			props.handleChange('exciseType')(exciseType);
																			this.setState({exciseType,},	() => {},);
																		}}
																		onColor="#2064d8"
																		onHandleColor="#2693e6"
																		handleDiameter={25}
																		uncheckedIcon={false}
																		checkedIcon={false}
																		boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
																		activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
																		height={20}
																		width={48}
																	className="react-switch "
																	/>
																	{this.state.exciseType === true ? 
																	<span style={{color : "#0069d9"}} className='ml-4'><b>Exclusive</b></span>
																	 : <span className='ml-4'>Exclusive</span>
																	}	
																</Col>
															</Row>)} */}
															<hr></hr>
															{/* <Row>
															<Col lg={12}>
																<FormGroup check inline className="mb-3">
																	<Input
																		className="form-check-input"
																		type="checkbox"
																		id="vatIncluded"
																		name="vatIncluded"
																		onChange={(value) => {
																			props.handleChange('vatIncluded')(value);
																		}}
																		checked={props.values.vatIncluded}
																	/>
																	<Label
																		className="form-check-label"
																		check
																		htmlFor="vatIncluded"
																	>
																		VAT Include
																	</Label>
																</FormGroup>
															</Col>
														</Row> */}

															{/* <Row>
                              <Col lg={4}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="productWarehouseId">
                                    Warehourse
                                  </Label>
                                  <Select
                                    className="select-default-width"
                                    options={
                                      product_warehouse_list
                                        ? selectOptionsFactory.renderOptions(
                                            'warehouseName',
                                            'warehouseId',
                                            product_warehouse_list,
                                            'Warehouse',
                                          )
                                        : []
                                    }
                                    id="productWarehouseId"
                                    name="productWarehouseId"
                                    value={props.values.productWarehouseId}
                                    onChange={(option) => {
                                      // this.setState({
                                      //   selectedWareHouse: option.value
                                      // })
                                      if (option && option.value) {
                                        props.handleChange(
                                          'productWarehouseId',
                                        )(option);
                                      } else {
                                        props.handleChange(
                                          'productWarehouseId',
                                        )('');
                                      }
                                    }}
                                  />
                                </FormGroup>
                              </Col>
                            </Row> */}
															{/* <Row>
                              <Col lg={4}>
                                <FormGroup className="text-right">
                                  <Button
                                    color="primary"
                                    type="button"
                                    className="btn-square"
                                    onClick={this.showWarehouseModal}
                                  >
                                    <i className="fa fa-plus"></i> Add a
                                    Warehouse
                                  </Button>
                                </FormGroup>
                              </Col>
                            </Row> */}
															{/* <Row>
                              <Col lg={8}>
                                <FormGroup className="">
                                  <Label htmlFor="description">
                                    Description
                                  </Label>
                                  <Input
                                    type="textarea"
                                    name="productDescription"
                                    id="productDescription"
                                    rows="6"
                                    placeholder="Description..."
                                    onChange={(value) => {
                                      props.handleChange('productDescription')(
                                        value,
                                      );
                                    }}
                                    value={props.values.productDescription}
                                  />
                                </FormGroup>
                              </Col>
                            </Row> */}
															<Row>
																<Col lg={8}>
																	<FormGroup check inline className="mb-3">
																		<Label
																			className="form-check-label"
																			check
																			htmlFor="productPriceTypeOne"
																		>
																			<Input
																				type="checkbox"
																				max="14,2"
																				id="productPriceTypeOne"
																				name="productPriceTypeOne"
																				onChange={(event) => {
																					if (income === true) {
																					} else {
																						if (
																							props.values.productPriceType.includes(
																								'SALES',
																							)
																						) {
																							const nextValue = props.values.productPriceType.filter(
																								(value) => value !== 'SALES',
																							);
																							props.setFieldValue(
																								'productPriceType',
																								nextValue,
																							);
																						} else {
																							const nextValue = props.values.productPriceType.concat(
																								'SALES',
																							);
																							props.setFieldValue(
																								'productPriceType',
																								nextValue,
																							);
																						}
																					}
																				}}
																				checked={props.values.productPriceType.includes(
																					'SALES',
																				)}
																				className={
																					props.errors.productPriceType &&
																					props.touched.productPriceType
																						? 'is-invalid'
																						: ''
																				}
																				
																			/>
																			{strings.SalesInformation}
																			{props.errors.productPriceType &&
																				props.touched.productPriceType && (
																					<div className="invalid-feedback">
																						{props.errors.productPriceType}
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
																		<Input
																			type="text"
																			maxLength="14,2"
																			id="salesUnitPrice"
																			name="salesUnitPrice"
																			autoComplete="Off"
																			placeholder={strings.Enter+strings.SellingPrice}
																			readOnly={
																				props.values.productPriceType.includes(
																					'SALES',
																				)
																					? false
																					: true
																			}
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regDecimal.test(
																						option.target.value,
																					)
																				) {
																					props.handleChange('salesUnitPrice')(
																						option,
																					);
																				}
																			}}
																			value={props.values.salesUnitPrice}
																			className={
																				props.errors.salesUnitPrice &&
																				props.touched.salesUnitPrice
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.salesUnitPrice &&
																			props.touched.salesUnitPrice && (
																				<div className="invalid-feedback">
																					{props.errors.salesUnitPrice}
																				</div>
																			)}
																	</FormGroup></Col>
																	<Col>
																	<FormGroup className="mb-3">
																		<Label htmlFor="transactionCategoryId">
																			<span className="text-danger">* </span>{' '}
																			{strings.Account}
																		</Label>
																		<Select
																			styles={customStyles}
																			isDisabled={
																				props.values.productPriceType.includes(
																					'SALES',
																				)
																					? false
																					: true
																			}
																			options={
																				salesCategory ? salesCategory : []
																			}
																			value={
																				salesCategory
																					? props.values
																							.salesTransactionCategoryId
																					: ''
																			}
																			id="salesTransactionCategoryId"
																			onChange={(option) => {
																				if (option && option.value) {
																					props.handleChange(
																						'salesTransactionCategoryId',
																					)(option);
																				} else {
																					props.handleChange(
																						'salesTransactionCategoryId',
																					)('');
																				}
																			}}
																			className={
																				props.errors
																					.salesTransactionCategoryId &&
																				props.touched.salesTransactionCategoryId
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.salesTransactionCategoryId &&
																			props.touched
																				.salesTransactionCategoryId && (
																				<div className="invalid-feedback">
																					{
																						props.errors
																							.salesTransactionCategoryId
																					}
																				</div>
																			)}
																	</FormGroup>
																	</Col>
																	</Row>
																	<FormGroup className="">
																		<Label htmlFor="salesDescription">
																		{strings.Description}
																		</Label>
																		<Input
																			readOnly={
																				props.values.productPriceType.includes(
																					'SALES',
																				)
																					? false
																					: true
																			}
																			type="textarea"
																			maxLength="2000"
																			name="salesDescription"
																			id="salesDescription"
																			rows="3"
																			placeholder={strings.Description}
																			onChange={(value) => {
																				props.handleChange('salesDescription')(
																					value,
																				);
																			}}
																			value={props.values.salesDescription}
																		/>
																			</FormGroup>
																		</Col>
																</Row>
															<Row 
													
																					>
																<Col lg={8}>
																	<FormGroup check inline className="mb-3">
																		<Label
																			className="form-check-label"
																			check
																			htmlFor="productPriceTypetwo"
																		>
																			<Input
																				type="checkbox"
																				id="productPriceTypetwo"
																				maxLength="14,2"
																				name="productPriceTypetwo"
																				onChange={(event) => {
																					if (income === false) {
																					} else {
																						if (
																							props.values.productPriceType.includes(
																								'PURCHASE',
																							)
																						) {
																							const nextValue = props.values.productPriceType.filter(
																								(value) => value !== 'PURCHASE',
																							);
																							props.setFieldValue(
																								'productPriceType',
																								nextValue,
																							);
																						} else {
																							const nextValue = props.values.productPriceType.concat(
																								'PURCHASE',
																							);
																							// console.log(nextValue);
																							props.setFieldValue(
																								'productPriceType',
																								nextValue,
																							);
																						}
																					}
																				}}
																				checked={props.values.productPriceType.includes(
																					'PURCHASE',
																				)}
																				className={
																					props.errors.productPriceType &&
																					props.touched.productPriceType
																						? 'is-invalid'
																						: ''
																				}
																				
																			/>
																			{strings.PurchaseInformation}
																			{props.errors.productPriceType &&
																				props.touched.productPriceType && (
																					<div className="invalid-feedback">
																						{props.errors.productPriceType}
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
																		<Input
																		type="text"
																			maxLength="14,2"
																			id="purchaseUnitPrice"
																			name="purchaseUnitPrice"
																			autoComplete="Off"
																			placeholder={strings.Enter+strings.PurchasePrice}
																			//disabled={props.values.isInventoryEnabled===true }
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regDecimal.test(
																						option.target.value,
																					)
																				) {
																					props.handleChange(
																						'purchaseUnitPrice',
																					)(option);
																				}
																			}}
																			readOnly={
																				props.values.productPriceType.includes(
																					'PURCHASE',
																				)
																					? false
																					: true
																			}
																			value={props.values.purchaseUnitPrice}
																			className={
																				props.errors.purchaseUnitPrice &&
																				props.touched.purchaseUnitPrice
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.purchaseUnitPrice &&
																			props.touched.purchaseUnitPrice && (
																				<div className="invalid-feedback">
																					{props.errors.purchaseUnitPrice}
																					{props.values.isInventoryEnabled===true }
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
																		<Select
																			styles={customStyles}
																			isDisabled={
																				props.values.productPriceType.includes(
																					'PURCHASE',
																				)
																					? false
																					: true
																			}
																			options={
																				purchaseCategory ? purchaseCategory : []
																			}
																			value={
																				purchaseCategory
																					? props.values
																							.purchaseTransactionCategoryId
																					: ''
																			}
																			id="purchaseTransactionCategoryId"
																			onChange={(option) => {
																				if (option && option.value) {
																					props.handleChange(
																						'purchaseTransactionCategoryId',
																					)(option);
																				} else {
																					props.handleChange(
																						'purchaseTransactionCategoryId',
																					)('');
																				}
																			}}
																			className={
																				props.errors
																					.purchaseTransactionCategoryId &&
																				props.touched
																					.purchaseTransactionCategoryId
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors
																			.purchaseTransactionCategoryId &&
																			props.touched
																				.purchaseTransactionCategoryId && (
																				<div className="invalid-feedback">
																					{
																						props.errors
																							.purchaseTransactionCategoryId
																					}
																				</div>
																			)}
																	</FormGroup></Col></Row>
																	<FormGroup className="">
																		<Label htmlFor="purchaseDescription">
																		{strings.Description}
																		</Label>
																		<Input
																			readOnly={
																				props.values.productPriceType.includes(
																					'PURCHASE',
																				)
																					? false
																					: true
																			}
																			type="textarea"
																			maxLength="2000"
																			autoComplete="Off"
																			name="purchaseDescription"
																			id="purchaseDescription"
																			rows="3"
																			placeholder={strings.Description}
																			onChange={(value) => {
																				props.handleChange(
																					'purchaseDescription',
																				)(value);
																			}}
																			value={props.values.purchaseDescription}
																		/>
																	</FormGroup>
																</Col>
															</Row>
															
															<hr></hr>
															
															<Row 
															style={{display: 
																				props.values.productPriceType.includes(
																					'PURCHASE' 
																				
																				)&& props.values.productType !=
																				'SERVICE'
																		
																			?'' : 'none'
																
																			}}
																		
																			>
																{ config.INVENTORY_MODULE &&
																
																	<Col lg={8}>
																	<FormGroup check inline className="mb-3">
																		<Label
																			className="form-check-label"
																			check
																			htmlFor="isInventoryEnabled"
																		>
																			<Input
																			
																			className="form-check-input"
																			type="checkbox"
																			id="is"
																			name="isInventoryEnabled"
																			onChange={(value) => {
																				props.handleChange('isInventoryEnabled')(value);
																			}}
																			checked={props.values.isInventoryEnabled}
																			/>
																		 {strings.EnableInventory}
																			{props.errors.productPriceType &&
																				props.touched.productPriceType && (
																					<div className="invalid-feedback">
																						{props.errors.productPriceType}
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

																	<Row style={{display: props.values.isInventoryEnabled === false ? 'none' : ''}}>
																	<Col>	
																	<FormGroup className="mb-3">
																		<Label htmlFor="salesUnitPrice">
																			{/* <span className="text-danger">* </span>{' '} */}
																			<span className="text-danger">* </span> {strings.InventoryAccount}
																		</Label>
																		<Select
																			styles={customStyles}
																			// isDisabled={
																			// 	props.values.productPriceType.includes(
																			// 		'INVENTORY',
																			// 	)
																			// 		? false
																			// 		: true
																			// }
																			options={
																				inventoryAccount ? inventoryAccount : []
																			}
																			value={
																				inventoryAccount
																					? props.values
																							.transactionCategoryId
																					: ''
																			}
																			id="transactionCategoryId"
																			onChange={(option) => {
																				if (option && option.value) {
																					props.handleChange(
																						'transactionCategoryId',
																					)(option);
																				} else {
																					props.handleChange(
																						'transactionCategoryId',
																					)('');
																				}
																			}}
																			className={
																				props.errors
																					.transactionCategoryId &&
																				props.touched
																					.transactionCategoryId
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors
																			.transactionCategoryId &&
																			props.touched
																				.transactionCategoryId && (
																				<div className="invalid-feedback">
																					{
																						props.errors
																							.transactionCategoryId
																					}
																				</div>
																			)}
																	</FormGroup></Col>
																	<Col>
																	<FormGroup className="mb-3">
																	<Label htmlFor="contactId">
																		{/* <span className="text-danger">* </span> */}
																		  {strings.SupplierName}
																	</Label>
																	<Select
																		// isDisabled={
																		// 	props.values.productPriceType.includes(
																		// 		'INVENTORY',
																		// 	)
																		// 		? false
																		// 		: true
																		// }
																		styles={customStyles}
																		id="contactId"
																		name="contactId"
																		placeholder={strings.Select+strings.SupplierName}
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
																		value={props.values.contactId}
																		onChange={(option) => {
																			if (option && option.value) {
																				
																				props.handleChange('contactId')(option);
																			} else {

																				props.handleChange('contactId')('');
																			}
																		}}
																		className={
																			props.errors.contactId &&
																			props.touched.contactId
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.contactId &&
																		props.touched.contactId && (
																			<div className="invalid-feedback">
																				{props.errors.contactId}
																			</div>
																		)}
																</FormGroup>
																	
																	</Col>
																</Row>
																<Row style={{display: props.values.isInventoryEnabled === false ? 'none' : ''}}>
																<Col>
																	<FormGroup className="mb-3">
																		<Label htmlFor="inventoryPurchasePrice">
																			{/* <span className="text-danger">* </span>{' '} */}
																			<span className="text-danger">* </span>	{strings.PurchasePrice}
																		</Label>
																		<Input
																			type="text"
																			min="0"
																			maxLength="14,2"
																			id="inventoryPurchasePrice"
																			name="inventoryPurchasePrice"
																			autoComplete="Off"
																			placeholder={strings.Enter+strings.PurchasePrice}
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regDecimal.test(
																						option.target.value,
																					)
																				) {
																					props.handleChange(
																						'inventoryPurchasePrice',
																					)(option);
																				}
																			}}
																			// readOnly={
																			// 	props.values.productPriceType.includes(
																			// 		'INVENTORY',
																			// 	)
																			// 		? false
																			// 		: true
																			// }
																			value={props.values.inventoryPurchasePrice}
																			className={
																				props.errors.inventoryPurchasePrice &&
																				props.touched.inventoryPurchasePrice
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.inventoryPurchasePrice &&
																			props.touched.inventoryPurchasePrice && (
																				<div className="invalid-feedback">
																					{props.errors.inventoryPurchasePrice}
																				</div>
																			)}
																	<i>{strings.inventory_note}</i>
																		 
																		
																	</FormGroup>
																	</Col>
																	<Col>
																	<FormGroup className="mb-3">
																		<Label htmlFor="inventoryQty">
																			{/* <span className="text-danger">* </span>{' '} */}
																			<span className="text-danger">* </span>	 {strings.OpeningBalanceQuantity}
																			
																		</Label>
																		<Input
																			type="text"
																			min="0"
																			maxLength="10"
																			id="inventoryQty"
																			name="inventoryQty"
																			autoComplete="Off"
																			placeholder={strings.Enter+strings.OpeningBalanceQuantity}
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regEx.test(
																						option.target.value,
																					)
																				) {
																					props.handleChange(
																						'inventoryQty',
																					)(option);
																				}
																			}}
																			// readOnly={
																			// 	props.values.productPriceType.includes(
																			// 		'INVENTORY',
																			// 	)
																			// 		? false
																			// 		: true
																			// }
																			value={props.values.inventoryQty}
																			className={
																				props.errors.inventoryQty &&
																				props.touched.inventoryQty
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.inventoryQty &&
																			props.touched.inventoryQty && (
																				<div className="invalid-feedback">
																					{props.errors.inventoryQty}
																				</div>
																			)}
																	</FormGroup>
														
																</Col>
																</Row>
																<Row style={{display: props.values.isInventoryEnabled === false ? 'none' : ''}}>
																	<Col lg={6}>
																	<FormGroup className="">
																		<Label htmlFor="inventoryReorderLevel">
																		  {strings.ReOrderLevel}
																		</Label>
																		<Input
																			// readOnly={
																			// 	props.values.productPriceType.includes(
																			// 		'INVENTORY',
																			// 	)
																			// 		? false
																			// 		: true
																			// }
																			type="text"
																			min="0"
																			max="1000"
																			maxLength="10"
																			name="inventoryReorderLevel"
																			id="inventoryReorderLevel"
																			autoComplete="Off"
																			rows="3"
																			placeholder={strings.Enter+strings.InventoryReorderLevel}
																			// onChange={(value) => {
																			// 	props.handleChange(
																			// 		'inventoryReorderLevel',
																			// 	)(value);
																			// }}
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regDecimal5.test(
																						option.target.value,
																					)
																				) {
																					props.handleChange(
																						'inventoryReorderLevel',
																					)(option);
																				}
																			}}
																			value={props.values.inventoryReorderLevel}
																			className={
																				props.errors.inventoryReorderLevel &&
																				props.touched.inventoryReorderLevel
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.inventoryReorderLevel &&
																		props.touched.inventoryReorderLevel && (
																			<div className="invalid-feedback">
																				{props.errors.inventoryReorderLevel}
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
																	<FormGroup className="text-right" disabled={this.state.disabled}>
																		<Button
																			type="button"
																			color="primary"
																			className="btn-square mr-3"
																			disabled={this.state.disabled}
																			onClick={() => {
																				   //	added validation popup	msg	
																				   console.log(props.errors,"ERRORS")
																				   props.handleBlur();
																				   if(props.errors &&  Object.keys(props.errors).length != 0)
																				   this.props.commonActions.fillManDatoryDetails();
																				   
																				this.setState(
																					{ createMore: false },
																					() => {
																						props.handleSubmit();
																					},
																				);
																			}}
																		>
																			<i className="fa fa-dot-circle-o"></i>{' '}
																			{this.state.disabled
																			? 'Creating...'
																			: strings.Create }
																		</Button>
																		{this.props.isParentComponentPresent &&this.props.isParentComponentPresent ==true ?"":(<Button
																			name="button"
																			color="primary"
																			className="btn-square mr-3"
																			disabled={this.state.disabled}
																			onClick={() => {
																					//	added validation popup	msg
                                                                            		props.handleBlur();
                                                                            		if(props.errors &&  Object.keys(props.errors).length != 0)
                                                                            		this.props.commonActions.fillManDatoryDetails();

																				this.setState(
																					{ createMore: true },
																					() => {
																						props.handleSubmit();
																					},
																				);
																			}}
																		>
																			<i className="fa fa-refresh"></i> 	{this.state.disabled
																			? 'Creating...'
																			: strings.CreateandMore }
																		</Button>)}
																		<Button
																		color="secondary"
																		className="btn-square"
																		onClick={() => {
																			// if(this.props.location
																			// 	&& this.props.location.state
																			// 	&& this.props.location.state.gotoParentURL
																			// )
																			// 	this.props.history.push(this.props.location.state.gotoParentURL)
																			if(this.props.isParentComponentPresent &&this.props.isParentComponentPresent ==true)
																	        	this.props.closeModal(true);
																			else
																				this.props.history.push('/admin/master/product');
													
																			
																		}}
																	>
																		<i className="fa fa-ban mr-1"></i>{strings.Cancel}
																	</Button>
																	</FormGroup>
																</Col>
															</Row>
														</Form>
													);
												}}
											</Formik>
										</Col>
									</Row>
									)}
								</CardBody>
							</Card>
						</Col>
					</Row>
				</div>

				<WareHouseModal
					openModal={this.state.openWarehouseModal}
					closeWarehouseModal={this.closeWarehouseModal}
				/>
			</div>
			{this.state.disableLeavePage ?"":<LeavePage/>}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateProduct);
