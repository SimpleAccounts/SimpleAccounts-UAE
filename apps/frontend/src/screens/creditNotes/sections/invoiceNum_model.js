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
import * as CustomerInvoiceActions from '../../customer_invoice/actions';
import { Formik } from 'formik';
import * as Yup from 'yup';

import '../../product/screens/create/style.scss';
import { toast } from 'react-toastify';

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
		customerInvoiceActions: bindActionCreators(
			CustomerInvoiceActions,
			dispatch,
		),
	};
};

class InvoiceNumberModel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			openWarehouseModal: false,
			initValue: {
				prefix:'',
				suffix:'',
                type:'',
                id:'',
				disabled: false,
			},
			
			invoiceNumber:[],
		};
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9 ]+$/;
		this.regExAlpha = /^[a-zA-Z0-9 -/\"]+$/;
	}

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
    

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.prefix !== nextProps.prefix) {
          return {initValue: {
            id: nextProps.prefix.invoiceId,
            prefix:nextProps.prefix.invoicePrefix,
            suffix:nextProps.prefix.invoiceSuffix,
            type:nextProps.prefix.invoiceType,
			} };
        }
    
        return null;
    }


	// Create or Edit Product
	handleSubmit = (data, resetForm) => {
		this.setState({ disabled: true });
        const postData = this.getData(data);
		this.props
			.updatePrefix(postData)
			.then((res) => {
				if (res.status === 200) {
					resetForm();
                    this.props.closeInvoiceNumberModel(true);
                    this.props.getCurrentNumber(res.data);
				}
			})
			.catch((err) => {
				this.displayMsg(err);
				//this.formikRef.current.setSubmitting(false);
			});
	};

	displayMsg = (err) => {
		toast.error(`${err.data}`, {
			position: toast.POSITION.TOP_RIGHT,
		});
	};

	

	render() {
		const {
			openInvoiceNumberModel,
			closeInvoiceNumberModel,
			prefix,
        } = this.props;
		const { initValue } = this.state;
		return (
			<div className="contact-modal-screen">
				<Modal
					isOpen={openInvoiceNumberModel}
					className="modal-success contact-modal"
				>
					<Formik
						initialValues={initValue}
						onSubmit={(values, { resetForm }) => {
							this.handleSubmit(values, resetForm);
						}}
						// validate={(values) => {
						// 	let errors = {};
						// 	if (!values.productName) {
						// 		errors.productName = 'Product Category Name is  required';
						// 	}
						// 	if (this.state.exist === true) {
						// 		errors.productName = 'Product Category Name is already exist';
						// 	}
						// 	return errors;
						// }}
						// validationSchema={Yup.object().shape({
						// 	purchaseUnitPrice: Yup.string().when('productPriceType', {
						// 		is: (value) => value.includes('PURCHASE'),
						// 		then: Yup.string().required('Purchase Price is Required'),
						// 		otherwise: Yup.string(),
						// 	}),
						// 	purchaseTransactionCategoryId: Yup.string().when(
						// 		'productPriceType',
						// 		{
						// 			is: (value) => value.includes('PURCHASE'),
						// 			then: Yup.string().required('Purchase Category is Required'),
						// 			otherwise: Yup.string(),
						// 		},
						// 	),
						// 	salesTransactionCategoryId: Yup.string().when(
						// 		'productPriceType',
						// 		{
						// 			is: (value) => value.includes('SALES'),
						// 			then: Yup.string().required('Selling Category is Required'),
						// 			otherwise: Yup.string(),
						// 		},
						// 	),
						// 	salesUnitPrice: Yup.string().when('productPriceType', {
						// 		is: (value) => value.includes('SALES'),
						// 		then: Yup.string().required('Selling Price is Required'),
						// 		otherwise: Yup.string(),
						// 	}),
						// 	productPriceType: Yup.string().required(
						// 		'At least one Selling type is required',
						// 	),
						// 	productCode: Yup.string().required('Product code is required'),
						// 	vatCategoryId: Yup.string()
						// 		.required('VAT Category is Required')
						// 		.nullable(),
						// })}
					>
						{(props) => {
							const { handleBlur } = props;
							return (
								<Form onSubmit={props.handleSubmit}>
									<CardHeader toggle={this.toggleDanger}>
										<Row>
											<Col lg={8}>
												<div className="h4 mb-0 d-flex align-items-center">
													<i className="nav-icon fas fa-id-card-alt" />
													<span className="ml-2">Invoice Number</span>
												</div>
											</Col>
										</Row>
									</CardHeader>
									<ModalBody>
										<Row>
											<Col lg={8}>
												<FormGroup check inline className="mb-3">
													<Label className="productlabel mb-0 mr-1">Your Invoice Numbers are set on auto-generate mode to save your time.</Label>
													<Label className="productlabel mb-0 mr-1">Are you sure about changing this settings? </Label>
												</FormGroup>
											</Col>
										</Row>
										<Row>
                                        <Col lg={2}>
                                        <Label>Continue auto generated invoice Number</Label>
                                            </Col>
											<Col lg={2}>
												<FormGroup className="mb-3">
													<Label htmlFor="productName">
														Prefix
													</Label>
													<Input
														type="text"
														maxLength="70"
														id="invoicePrefix"
														name="invoicePrefix"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExAlpha.test(option.target.value)
															) {
																props.handleChange('prefix')(option);
															}
															
														}}
														onBlur={handleBlur}
														value={props.values.prefix}
														
														className={
															props.errors.prefix &&
															props.touched.prefix
																? 'is-invalid'
																: ''
														}
													/>
													{props.errors.invoicePrefix &&
														props.touched.invoicePrefix && (
															<div className="invalid-feedback">
																{props.errors.invoicePrefix}
															</div>
														)}
												</FormGroup>
											</Col>

											<Col lg={2}>
											<FormGroup className="mb-3">
													<Label htmlFor="productName">
														Next Number
													</Label>
													<Input
														type="text"
														maxLength="70"
														id="invoiceSuffix"
														name="invoiceSuffix"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regEx.test(option.target.value)
															) {
																props.handleChange('suffix')(option);
															}
														
														}}
														onBlur={handleBlur}
														value={props.values.suffix}
														
														className={
															props.errors.suffix &&
															props.touched.suffix
																? 'is-invalid'
																: ''
														}
													/>
													{props.errors.invoiceSuffix &&
														props.touched.invoiceSuffix && (
															<div className="invalid-feedback">
																{props.errors.invoiceSuffix}
															</div>
														)}
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
											<i className="fa fa-dot-circle-o"></i> Update
										</Button>
										<Button
											color="secondary"
											className="btn-square"
											onClick={() => {
												closeInvoiceNumberModel(false);
											}}
										>
											<i className="fa fa-ban"></i> Cancel
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

export default connect(null, mapDispatchToProps)(InvoiceNumberModel);
