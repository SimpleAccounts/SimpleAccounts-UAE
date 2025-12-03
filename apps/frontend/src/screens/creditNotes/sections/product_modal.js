import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	Modal,
	CardHeader,
	ModalBody,
	ModalFooter,
	UncontrolledTooltip,
} from 'reactstrap';
import Select from 'react-select';
import * as ProductActions from '../../product/actions';
import { Formik } from 'formik';
import * as Yup from 'yup';

import '../../product/screens/create/style.scss';
import { toast } from 'react-toastify';
import { selectOptionsFactory } from 'utils';
import {data}  from '../../Language/index'
import LocalizedStrings from 'react-localization';


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

const mapDispatchToProps = (dispatch) => {
	return {
		productActions: bindActionCreators(ProductActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class ProductModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			openWarehouseModal: false,
			initValue: {
				productName: '',
				productDescription: '',
				productCode: '',
				vatCategoryId: '',
				productCategoryId: '',
				productWarehouseId: '',
				vatIncluded: false,
				productType: 'GOODS',
				salesUnitPrice: '',
				purchaseUnitPrice: '',
				productPriceType: ['SALES'],
				salesTransactionCategoryId: { value: 84, label: 'Sales' },
				purchaseTransactionCategoryId: {
					value: 49,
					label: 'Cost of Goods Sold',
				},

				salesDescription: '',
				purchaseDescription: '',
				productSalesPriceType: '',
				productPurchasePriceType: '',
				disabled: false,
			},
			purchaseCategory: [],
			salesCategory: [],
			createMore: false,
			exist: false,
			isActive:true,
			selectedStatus:true,
		};
		this.formRef = React.createRef();  
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[ +a-zA-Z0-9-./\\|!@#$%^&*()_<>,]+$/;
		// this.regExBoth = /[a-zA-Z0-9 ]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
	}
	getProductCode=()=>{
		const {
			openProductModal,		
		} = this.props;
		this.props.productActions.getProductCode().then((res) => {
			if (res.status === 200) {
				this.setState({
					initValue: {
						...this.state.initValue,
						...{ productCode: res.data },
					},
				});
				if(openProductModal===true)
				this.formRef.current.setFieldValue('productCode', res.data, true,true
				// this.validationCheck(res.data)
				);
			}
		});
		}

	componentDidMount = () => {
		this.initializeData();
	};
	initializeData = () => {
		this.getProductCode();
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
		const vatIncluded = data['vatIncluded'];
		const isActive = this.state.isActive;
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
			vatIncluded,

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
		};
		const postData = this.getData(dataNew);
		this.props
			.createProduct(postData)
			.then((res) => {
				if (res.status === 200) {
					resetForm();
					this.props.closeProductModal(true);
					this.props.getCurrentProduct(res.data);
				}
			})
			.catch((err) => {
				this.displayMsg(err);
				this.formikRef.current.setSubmitting(false);
			});
	};

	displayMsg = (err) => {
		toast.error(`${err.data}`, {
			position: toast.POSITION.TOP_RIGHT,
		});
	};

	validationCheck = (value) => {
		const data = {
			moduleType: 1,
			name: value,
		};
		this.props.productActions.checkValidation(data).then((response) => {
			if (response.data === 'Product name Already Exists') {
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
				if (response.data === 'Product code Already Exists') {
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

	render() {
		strings.setLanguage(this.state.language);
		const {
			openProductModal,
			closeProductModal,
			vat_list,
			product_category_list,
			salesCategory,
			purchaseCategory,
		} = this.props;
		const { initValue } = this.state;
		return (
			<div className="contact-modal-screen">
				<Modal
					isOpen={openProductModal}
					className="modal-success contact-modal"
				>
					<Formik
						ref={this.formRef}
						initialValues={initValue}
						onSubmit={(values, { resetForm }) => {
							this.handleSubmit(values, resetForm);
						}}
						validate={(values) => {
							let errors = {};
							if (!values.productName) {
								errors.productName = 'Product Name is  required';
							}
							if (this.state.exist === true) {
								errors.productName = 'Product  Name is already exist';
							}
							if (this.state.ProductExist === true) {
								errors.productCode =
									'Product Code is already exist';
							}
							return errors;
						}}
						validationSchema={Yup.object().shape({
							purchaseUnitPrice: Yup.string().when('productPriceType', {
								is: (value) => value.includes('PURCHASE'),
								then: Yup.string().required('Purchase Price is Required'),
								otherwise: Yup.string(),
							}),
							purchaseTransactionCategoryId: Yup.string().when(
								'productPriceType',
								{
									is: (value) => value.includes('PURCHASE'),
									then: Yup.string().required('Purchase Category is Required'),
									otherwise: Yup.string(),
								},
							),
							salesTransactionCategoryId: Yup.string().when(
								'productPriceType',
								{
									is: (value) => value.includes('SALES'),
									then: Yup.string().required('Selling Category is Required'),
									otherwise: Yup.string(),
								},
							),
							salesUnitPrice: Yup.string().when('productPriceType', {
								is: (value) => value.includes('SALES'),
								then: Yup.string().required('Selling Price is Required'),
								otherwise: Yup.string(),
							}),
							productPriceType: Yup.string().required(
								'At least one Selling type is Required',
							),
							productCode: Yup.string().required('Product Code is Required'),
							vatCategoryId: Yup.string()
								.required('VAT Category is Required')
								.nullable(),
						})}
					>
						{(props) => {
							const { handleBlur } = props;
							return (
								<Form onSubmit={props.handleSubmit}>
									<CardHeader toggle={this.toggleDanger}>
										<Row>
											<Col lg={12}>
												<div className="h4 mb-0 d-flex align-items-center">
													<i className="nav-icon fas fa-id-card-alt" />
													<span className="ml-2">{strings.CreateProduct}</span>
												</div>
											</Col>
										</Row>
									</CardHeader>
									<ModalBody>
										<Row>
											<Col lg={4}>
												<FormGroup check inline className="mb-3">
													<Label className="productlabel mb-0 mr-1">{strings.Type}</Label>
													<div className="wrapper">
														<Label
															className="form-check-label mr-1"
															check
															htmlFor="producttypeone"
														>
															<Input
																className="form-check-input"
																type="radio"
																id="producttypeone"
																name="producttypeone"
																value="GOODS"
																onChange={(value) => {
																	props.handleChange('productType')(value);
																}}
																checked={props.values.productType === 'GOODS'}
															/>
															{strings.Goods}
														</Label>
														<Label
															className="form-check-label"
															check
															htmlFor="producttypetwo"
														>
															<Input
																className="form-check-input"
																type="radio"
																id="producttypetwo"
																name="producttypetwo"
																value="SERVICE"
																onChange={(value) => {
																	props.handleChange('productType')(value);
																}}
																checked={props.values.productType === 'SERVICE'}
															/>
															 {strings.Service}
														</Label>
													</div>
												</FormGroup>
											</Col>

											<Col lg={4}>
																<FormGroup check inline className="mb-3">
																	<Label className="productlabel mb-0 mr-1"><span className="text-danger">* </span>{strings.Status}</Label>
																	<div className="wrapper">
																	<Label
																		className="form-check-label mr-1"
																		check
																	>
																	<Input
																		className="form-check-input"
																		type="radio"
																		id="inline-radio1"
                                                                        name="isActive"
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
																			  {strings.Active}
																			</Label>
																			<Label
																				className="productlabel mb-0 mr-1"
																				check
																			>
																				<Input
																					className="form-check-input"
																					type="radio"
																					id="inline-radio2"
                                                                                    name="isActive"
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
																				   {strings.Inactive}
																			</Label>
																		</div>   
                                                                    </FormGroup>
                                                                </Col>
										
										</Row>
										<Row>
											<Col lg={4}>
												<FormGroup className="mb-3">
													<Label htmlFor="productName">
														<span className="text-danger">* </span> {strings.Name}
													</Label>
													<Input
														type="text"
														maxLength="70"
														id="productName"
														name="productName"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExBoth.test(option.target.value)
															) {
																props.handleChange('productName')(option);
															}
															this.validationCheck(option.target.value);
														}}
														onBlur={handleBlur}
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
															Product Code - Unique identifier code for the
															product
														</UncontrolledTooltip>
													</Label>
													<Input
														type="text"
														maxLength="70"
														id="productCode"
														name="productCode"
														placeholder={strings.Enter+strings.ProductCode}
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExBoth.test(option.target.value)
															) {
																props.handleChange('productCode')(option);
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
															product_category_list &&
															product_category_list.data
																? selectOptionsFactory.renderOptions(
																		'productCategoryName',
																		'id',
																		product_category_list.data,
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
																props.handleChange('productCategoryId')(option);
															} else {
																props.handleChange('productCategoryId')('');
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
														<span className="text-danger">* </span> {strings.VatPercentage}
													</Label>
													<Select
														styles={customStyles}
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
														placeholder={strings.Select+strings.VATCategory }
														value={props.values.vatCategoryId}
														onChange={(option) => {
															// this.setState({
															//   selectedVatCategory: option.value
															// })
															if (option && option.value) {
																props.handleChange('vatCategoryId')(option);
															} else {
																props.handleChange('vatCategoryId')('');
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
										<Row className="secondary-info">
											<Col lg={4}>
												<FormGroup check inline className="mb-3">
													<Label
														className="form-check-label"
														check
														htmlFor="productPriceTypeOne"
													>
														<Input
															type="checkbox"
															id="productPriceTypeOne"
															name="productPriceTypeOne"
															onChange={(event) => {
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
												<FormGroup className="mb-3">
													<Label htmlFor="salesUnitPrice">
														<span className="text-danger">* </span>  {strings.SellingPrice}
														<i
															id="SalesTooltip"
															className="fa fa-question-circle ml-1"
														></i>
														<UncontrolledTooltip
															placement="right"
															target="SalesTooltip"
														>
															Selling price – Price at which your product is
															sold
														</UncontrolledTooltip>
													</Label>
													<Input
													type="number"
min="0"
														maxLength="10"
														id="salesUnitPrice"
														name="salesUnitPrice"
														placeholder={strings.Enter+strings.SellingPrice}
														readOnly={
															props.values.productPriceType.includes('SALES')
																? false
																: true
														}
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regDecimal.test(option.target.value)
															) {
																props.handleChange('salesUnitPrice')(option);
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
												</FormGroup>
												<FormGroup className="mb-3">
													<Label htmlFor="transactionCategoryId">
														<span className="text-danger">* </span> {strings.Account}
													</Label>
													<Select
														styles={customStyles}
														isDisabled={
															props.values.productPriceType.includes('SALES')
																? false
																: true
														}
														options={salesCategory ? salesCategory : []}
														value={
															salesCategory
																? props.values.salesTransactionCategoryId
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
															props.errors.salesTransactionCategoryId &&
															props.touched.salesTransactionCategoryId
																? 'is-invalid'
																: ''
														}
													/>
													{props.errors.salesTransactionCategoryId &&
														props.touched.salesTransactionCategoryId && (
															<div className="invalid-feedback">
																{props.errors.salesTransactionCategoryId}
															</div>
														)}
												</FormGroup>
												<FormGroup className="">
													<Label htmlFor="salesDescription">{strings.Description}</Label>
													<Input
														readOnly={
															props.values.productPriceType.includes('SALES')
																? false
																: true
														}
														type="textarea"
														maxLength="200"
														name="salesDescription"
														id="salesDescription"
														rows="3"
														placeholder={strings.Description}
														onChange={(value) => {
															props.handleChange('salesDescription')(value);
														}}
														value={props.values.salesDescription}
													/>
												</FormGroup>
											</Col>
											<Col lg={4}>
												<FormGroup check inline className="mb-3">
													<Label
														className="form-check-label"
														check
														htmlFor="productPriceTypetwo"
													>
														<Input
															type="checkbox"
															id="productPriceTypetwo"
															name="productPriceTypetwo"
															onChange={(event) => {
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
																	props.setFieldValue(
																		'productPriceType',
																		nextValue,
																	);
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
												<FormGroup className="mb-3">
													<Label htmlFor="salesUnitPrice">
														<span className="text-danger">* </span> {strings.PurchasePrice}
														<i
															id="PurchaseTooltip"
															className="fa fa-question-circle ml-1"
														></i>
														<UncontrolledTooltip
															placement="right"
															target="PurchaseTooltip"
														>
															Purchase price – Amount of money you paid for the
															product
														</UncontrolledTooltip>
													</Label>
													<Input
														type="number"
min="0"
														maxLength="10"
														id="purchaseUnitPrice"
														name="purchaseUnitPrice"
														placeholder={strings.Enter+strings.SellingPrice}
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regDecimal.test(option.target.value)
															) {
																props.handleChange('purchaseUnitPrice')(option);
															}
														}}
														readOnly={
															props.values.productPriceType.includes('PURCHASE')
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
															</div>
														)}
												</FormGroup>

												<FormGroup className="mb-3">
													<Label htmlFor="salesUnitPrice">
														<span className="text-danger">* </span>{strings.Account}
													</Label>
													<Select
														styles={customStyles}
														isDisabled={
															props.values.productPriceType.includes('PURCHASE')
																? false
																: true
														}
														options={purchaseCategory ? purchaseCategory : []}
														value={
															purchaseCategory
																? props.values.purchaseTransactionCategoryId
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
															props.errors.purchaseTransactionCategoryId &&
															props.touched.purchaseTransactionCategoryId
																? 'is-invalid'
																: ''
														}
													/>
													{props.errors.purchaseTransactionCategoryId &&
														props.touched.purchaseTransactionCategoryId && (
															<div className="invalid-feedback">
																{props.errors.purchaseTransactionCategoryId}
															</div>
														)}
												</FormGroup>
												<FormGroup className="">
													<Label htmlFor="purchaseDescription">
													{strings.Description}
													</Label>
													<Input
														readOnly={
															props.values.productPriceType.includes('PURCHASE')
																? false
																: true
														}
														type="textarea"
														maxLength="200"
														name="purchaseDescription"
														id="purchaseDescription"
														rows="3"
														placeholder={strings.Description}
														onChange={(value) => {
															props.handleChange('purchaseDescription')(value);
														}}
														value={props.values.purchaseDescription}
													/>
												</FormGroup>
											</Col>
										</Row>
									</ModalBody>
									<ModalFooter>
										<Button
											type="button"
											color="primary"
											className="btn-square mr-3"
											onClick={() => {
												this.setState({ createMore: false }, () => {
													props.handleSubmit();
												});
											}}
										>
											<i className="fa fa-dot-circle-o"></i> {strings.Create}
										</Button>
										<Button
											color="secondary"
											className="btn-square"
											onClick={() => {
												closeProductModal(false);
											}}
										>
											<i className="fa fa-ban"></i> {strings.Cancel}
										</Button>
									</ModalFooter>
								</Form>
							);
						}}
					</Formik>
				</Modal>
			</div>
		);
	}
}

export default connect(null, mapDispatchToProps)(ProductModal);
