import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Modal } from 'reactstrap';
import * as ProductActions from '../../product/actions';
import '../../product/screens/create/style.scss';
import { toast } from 'react-toastify';
import {data}  from '../../Language/index'
import LocalizedStrings from 'react-localization';
import  CreateProduct  from '../../product/screens/create/screen';

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
				productPriceType: ['SALES','PURCHASE'],
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
	
	// console.log(this.state.employeeCode)
	}

	componentDidMount = () => {
		this.initializeData();
	};
	initializeData = () => {
		this.getProductCode();
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
			isActive,

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
			income,
			expense,
			vat_list,
			product_category_list,
			salesCategory,
			purchaseCategory,
		} = this.props;
		const { initValue } = this.state;
		// console.log("income ---- ", income);
		return (
			<div className="contact-modal-screen">
				<Modal
					isOpen={openProductModal}
					className="modal-success contact-modal"
				>
				<CreateProduct
					getCurrentProductData={(Data) =>{
						this.props.getCurrentProduct(Data);
					}}
					closeModal={(e) => {
						closeProductModal(e);
					}}
					isParentComponentPresent={true}
					income={income === true ? income : false}
					expense={expense === true ? expense : false}
				/>
				</Modal>
			</div>
		);
	}
}

export default connect(null, mapDispatchToProps)(ProductModal);
