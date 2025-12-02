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
import { Formik } from 'formik';
import * as Yup from 'yup';
import _ from 'lodash';
import './style.scss';
import * as ProductActions from '../../actions';
import { WareHouseModal } from '../../sections';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import { selectOptionsFactory } from 'utils';
import * as DetailProductActions from './actions';
import { CommonActions } from 'services/global';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { InventoryHistoryModal} from './sections';
import config from 'constants/config';

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
class DetailProduct extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			language: window['localStorage'].getItem('language'),
			loading: true,
			initValue: {},
			contactType: 1,
			currentData: {},
			selectedRows: [],
			openWarehouseModal: false,
			dialog: null,
			current_product_id: null,
			openInventoryModel: false,
			disabled: false,
			disabled1: false,
			inventoryId:'',
			openModal:false,
			inventory_history_list:[],
			inventory_list:[],
			isActive:false,
			exciseTaxId:'',
			exciseTaxList:[],
			unitTypeList:[],
			exciseTaxCheck:false,
			loadingMsg:"Loading",
			disableLeavePage:false,
//			disableEditing:true,
			inventoryTableData:[],
			childRecordsPresent:false
		};

		this.selectRowProp = {
			//mode: 'checkbox',
			bgColor: 'rgba(0,0,0, 0.05)',
			clickToSelect: false,
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll,
		};
		this.options = {
			onRowClick: this.goToDetail,
			page: 1,
			sizePerPage: 10,
			onSizePerPageList: this.onSizePerPageList,
			onPageChange: this.onPageChange,
			sortName: '',
			sortOrder: '',
			onSortChange: this.sortColumn,
		};
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9-./\\|]+$/;
		// this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regDecimal5 =/^\d{0,10}$/;
		this.regExAlpha = /[ +a-zA-Z0-9-./\\|!@#$%^&*()_<>,]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,6}$$/;
	}

	componentDidMount = () => {
		this.initializeData();
		this.props.productActions.getUnitTypeList().then((res) => {
			if (res.status === 200) {
				this.setState({
					unitTypeList:res.data
				});
			}
		});
		this.props.productActions.getExciseTaxList().then((res) => {
			if (res.status === 200) {
				this.setState({
					exciseTaxList:res.data
				});
			}
		});
		this.getcompanyDetails();
	};
	getcompanyDetails=()=>{
		this.props.productActions.getCompanyDetails().then((res) => {
			if (res.status === 200) {this.setState({ companyDetails: res.data });
		
			// if(res.data && res.data.isRegisteredVat==false)
			// 		{
			// 			this.formRef.current.setFieldValue('vatCategoryId',  5, true,true);
			// 		}
		}

		})
		.catch((err) => {		
			this.props.commonActions.tostifyAlert(	'error',	err && err.data ? err.data.message : 'Something Went Wrong',	);
		});
	}
	onRowSelect = (row, isSelected, e) => {
		let tempList = [];
		if (isSelected) {
			tempList = Object.assign([], this.state.selectedRows);
			tempList.push(row.id);
		} else {
			this.state.selectedRows.map((item) => {
				if (item !== row.id) {
					tempList.push(item);
				}
				return item;
			});
		}
		this.setState({
			selectedRows: tempList,
		});
	};

	initializeData = () => {
		if (this.props.location.state && this.props.location.state.id) {
			//inactive check disable
			let initCount=0
			this.props.productActions
			.getInvoicesCountProduct(this.props.location.state.id)
			.then((res1) => {initCount=res1.data});
          //getbyid
			this.props.detailProductActions
				.getProductById(this.props.location.state.id)
				.then((res) => {
					if (res.status === 200) {
						
						let productPriceType;
						if (res.data.productPriceType === 'BOTH') {
							productPriceType = ['SALES', 'PURCHASE'];
						} else {
							productPriceType = [res.data.productPriceType];
						}
						this.setState({
							loading: false,
							current_product_id: this.props.location.state.id,
							initValue: {
								isInventoryEnabled : res.data.isInventoryEnabled ? res.data.isInventoryEnabled : false,
								productName: res.data.productName ? res.data.productName : '',
								productCode: res.data.productCode,
								vatCategoryId: res.data.vatCategoryId
									? res.data.vatCategoryId
									: '',
								unitPrice: res.data.unitPrice,
								productCategoryId: res.data.productCategoryId
									? res.data.productCategoryId
									: '',
								productWarehouseId: res.data.productWarehouseId
									? res.data.productWarehouseId
									: '',
								vatIncluded: res.data.vatIncluded,
								salesUnitPrice: res.data.salesUnitPrice
									? res.data.salesUnitPrice
									: '',
								salesTransactionCategoryId: res.data.salesTransactionCategoryId
									? res.data.salesTransactionCategoryId
									: 84,
								salesDescription: res.data.salesDescription
									? res.data.salesDescription
									: '',
								purchaseUnitPrice: res.data.purchaseUnitPrice
									? res.data.purchaseUnitPrice
									: '',
								purchaseTransactionCategoryId: res.data
									.purchaseTransactionCategoryId
									? res.data.purchaseTransactionCategoryId
									: 49,
								purchaseDescription: res.data.purchaseDescription
									? res.data.purchaseDescription
									: '',
								productType: res.data.productType ? res.data.productType : '',
								productPriceType: res.data.productPriceType
									? productPriceType
									: '',
								salesTransactionCategoryLabel: res.data
									.salesTransactionCategoryLabel
									? res.data.salesTransactionCategoryLabel
									: '',
								purchaseTransactionCategoryLabel: res.data
									.purchaseTransactionCategoryLabel
									? res.data.purchaseTransactionCategoryLabel
									: '',
								isActive:
									res.data.isActive && res.data.isActive !== null ?  res.data.isActive :'',
								inventoryQty:res.data.inventoryQty ? res.data.inventoryQty : '',
								inventoryReorderLevel: res.data.inventoryReorderLevel ? res.data.inventoryReorderLevel : '',
								inventoryPurchasePrice : res.data.inventoryPurchasePrice ? res.data.inventoryPurchasePrice : '',
								contactId: res.data.contactId ? res.data.contactId : '',
								transactionCategoryId: res.data.transactionCategoryId ? res.data.transactionCategoryId : '',
								inventoryId: res.data.inventoryId ? res.data.inventoryId : '',
								exciseTaxId:res.data.exciseTaxId ?res.data.exciseTaxId :'',
								unitTypeId:res.data.unitTypeId?res.data.unitTypeId:"",
							},
							exciseTaxCheck:res.data.exciseTaxId ?true :false,
							// exciseType:res.data.exciseType ?true :false,
							count:initCount,
							isInventoryEnabled: res.data.isInventoryEnabled ? res.data.isInventoryEnabled : false,
							selectedStatus: res.data.isActive ? true : false,
							salesProductCheck:res.data.productType=="SERVICE" ? true : false,
						},
						() => this.checkChildActivitiesForProductId(this.state.current_product_id)
						)
					} else {
						this.setState({ loading: false });
						this.props.history.push('/admin/master/product');
					}
				});
				this.props.supplierInvoiceActions.getSupplierList(this.state.contactType);
			this.props.productActions.getProductCategoryList();
			this.props.productActions.getProductVatCategoryList();
			
			this.salesCategory();
			this.purchaseCategory();
			this.inventoryAccount();
			this.props.productActions.getInventoryByProductId(this.props.location.state.id)
			.then((res) => {
				if (res.status === 200 && res.data !== null) {
			                                	let tempTableData =res.data
                                    					tempTableData.map((obj)=>{
                                    					    obj.disableEditing=true;
                                    					});

                                                        this.setState({ loading: false,
                                                            inventoryId: res.data.inventoryId ? res.data.inventoryId : '',
                                                            inventoryTableData:tempTableData,
                                                        });


				}
			})
		}
	};
			
renderName=(cell,row)=>{
	return (<span>{cell ? cell : "-"}</span>);

}
	getProductId = (p_id, s_id) => {
		const data = {
			pid: p_id,
			sid: s_id,
		};
		this.props.supplierInvoiceActions.getSupplierId(data);
	};
	getSupplierId = (p_id, s_id) => {
		const data = {
			pid: p_id,
			sid: s_id,
		};
		this.props.productActions.getProductId(data);
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
							}
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

	handleChange = (e, name) => {
		this.setState({
			currentData: _.set(
				{ ...this.state.currentData },
				e.target.name && e.target.name !== '' ? e.target.name : name,
				e.target.type === 'checkbox' ? e.target.checked : e.target.value,
			),
		});
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

	handleSubmit = (data) => {
		
		this.setState({ disabled: true });
		const { current_product_id } = this.state;
		const productID = current_product_id;
		const productCode = data['productCode'];
		const salesUnitPrice = data['salesUnitPrice'];
		const salesTransactionCategoryId = data['salesTransactionCategoryId'];
		const salesDescription = data['salesDescription'];
		const purchaseDescription = data['purchaseDescription'];
		const purchaseTransactionCategoryId = data['purchaseTransactionCategoryId'];
		const purchaseUnitPrice = data['purchaseUnitPrice'];
		const vatCategoryId = data['vatCategoryId'];
		const vatIncluded = data['vatIncluded'];
		const exciseTaxId = data['exciseTaxId'];
		const inventoryPurchasePrice = data['inventoryPurchasePrice'];
		const inventoryQty = data['inventoryQty'];
		const inventoryReorderLevel = data['inventoryReorderLevel'];
		const contactId = data['contactId'];
		const isInventoryEnabled = this.state.isInventoryEnabled ? this.state.isInventoryEnabled  : false;
		const transactionCategoryId = this.state.inventoryAccount ? this.state.inventoryAccount[0].value : '';
		const inventoryId = this.state.inventoryId;
		const isActive = this.state.selectedStatus;
		const productCategoryId = data['productCategoryId'].value ? data['productCategoryId'].value : data['productCategoryId'];
		// const exciseType = this.state.exciseType;
		const unitTypeId=data["unitTypeId"];
		let productPriceType;
		if (data && data['productPriceType'] && data['productPriceType'].includes('SALES')) {
			productPriceType = 'SALES';
		}
		if (data && data['productPriceType'] && data['productPriceType'].includes('PURCHASE')) {
			productPriceType = 'PURCHASE';
		}
		if ( data['productPriceType'] &&
			data['productPriceType'].includes('SALES') &&
			data['productPriceType'].includes('PURCHASE')
		) {
			productPriceType = 'BOTH';
		}
		const productName = data['productName'];
		const productType = data['productType'];
		const dataNew = {
			productID,
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
			inventoryId,
			isActive,
			// exciseType,
			unitTypeId,
			productCategoryId,
			...(salesUnitPrice.length !== 0 &&
				data['productPriceType'].includes('SALES') && {
					salesUnitPrice,
				}),
			...(salesTransactionCategoryId.length !== 0 &&
				data['productPriceType'].includes('SALES') && {
					salesTransactionCategoryId,
				}),
			...(salesDescription.length !== 0 &&
				data['productPriceType'].includes('SALES') && {
					salesDescription,
				}),
			...(purchaseDescription.length !== 0 &&
				data['productPriceType'].includes('PURCHASE') && {
					purchaseDescription,
				}),
			...(purchaseTransactionCategoryId.length !== 0 &&
				data['productPriceType'].includes('PURCHASE') && {
					purchaseTransactionCategoryId,
				}),
			...(purchaseUnitPrice.length !== 0 &&
				data['productPriceType'].includes('PURCHASE') && {
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
		this.setState({ loading:true, disableLeavePage:false, loadingMsg:"Updating Product..."});
		this.props.detailProductActions
			.updateProduct(postData)
			.then((res) => {
				this.setState({ disabled: false });
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Product Updated Successfully'
					);
					this.props.history.push('/admin/master/product');
					this.setState({ loading:false,});
				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Product Updated Unsuccessfully',
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
					productNameExist: true,
				});
			} else {
				this.setState({
					productNameExist: false,
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
	}
	showWarehouseModal = () => {
		this.setState({ openWarehouseModal: true });
	};
	// Cloase Confirm Modal
	closeWarehouseModal = () => {
		this.setState({ openWarehouseModal: false });
		this.props.productActions.getProductWareHouseList();
	};

	checkChildActivitiesForProductId = (id) => {
		this.props.productActions
			.getInvoicesCountProduct(this.state.current_product_id)
			.then((res) => {
				if (res.data > 0) {
				this.setState({childRecordsPresent:true})
				} else {
            this.setState({childRecordsPresent:false})
				}
			});
	};

	deleteProduct = () => {
		const { current_product_id } = this.state;
		this.props.productActions
			.getInvoicesCountProduct(current_product_id)
			.then((res) => {
				if (res.data > 0) {
					this.props.commonActions.tostifyAlert(
						'error',
						'You need to delete invoices to delete the Product',
					);
				} else {
					const message1 =
			<text>
			<b>Delete Product?</b>
			</text>
			const message = 'This Product will be deleted permanently and cannot be recovered. ';
					this.setState({
						dialog: (
							<ConfirmDeleteModal
								isOpen={true}
								okHandler={this.removeProduct}
								cancelHandler={this.removeDialog}
								message={message}
								message1={message1}
								
							/>
						),
					});
				}
			});
	};
	openSummuryModal = (data) => {
		this.setState({
			openModal: true
		})

	}
	closeModal = (res) => {
		this.setState({ openModal: false });
	};
	
	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};
	removeProduct = () => {
		this.setState({ disabled1: true });
		const { current_product_id } = this.state;
		this.setState({ loading:true, loadingMsg:"Deleting Product..."});
		this.props.detailProductActions
			.deleteProduct(current_product_id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						 res.data ? res.data.message : 'Product Deleted Successfully' ,
						 )
					this.props.history.push('/admin/master/product');
					this.setState({ loading:false,});
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Product Deleted Unsuccessfully' ,
				);
			});
	};
	toggleActionButton = (index) => {
		let temp = Object.assign({}, this.state.actionButtons);
		if (temp[parseInt(index, 10)]) {
			temp[parseInt(index, 10)] = false;
		} else {
			temp[parseInt(index, 10)] = true;
		}
		this.setState({
			actionButtons: temp,
		});
	};
	param = (row) => {

		const data = {
			p_id: row[0].p_id ,
			s_id: row[1].s_id,
		};
		if(row[1].s_id !== null && row[0].p_id !== null && row[1].s_id !== undefined && row[0].p_id !== undefined){
			this.props.productActions.getInventoryHistory(data).then((res) => {
				if (res.status === 200) {
					this.setState({

						inventory_history_list:res.data,
							});

				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',

					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});

		this.openSummuryModal({});
		}//if
		else {
			this.props.commonActions.tostifyAlert(
				'success',"Sorry , No supplier Available to View Inventory History List")
		}
	
	};
	
	renderActions = (cell, row) => {
		return (
			<Row>
			{/* <div>
				<Button
				className="btn btn-sm pdf-btn"
				onClick={(e, ) => {
					this.props.history.push('/admin/master/product/detail/inventoryedit', { id: row.inventoryId });
				}}
				>
				<i className="far fa-edit fa-lg"></i>
				</Button>
			</div> */}
			<div>
			<Button
				className="btn btn-sm pdf-btn ml-3"
				
				onClick={(e) => {
						this.param([{p_id:row.productId},{s_id:row.supplierId}]);
				
				}}
				>
				<i className="fa fa-history fa-lg"></i>
				</Button>
			</div>
			</Row>
			
			
		);
	};

	renderReorderLevel = (cell, row) => {
		return (
			<Row>
			<Col>
			<Input 
				type="text"
				min="0"
				max="2000"
				maxLength='10'
				name="inventoryReorderLevel"
				id="inventoryReorderLevel"
				value={cell}
				// disabled={this.state.disableEditing}
				onChange={(option)=>{
					if(this.regDecimal5.test(option.target.value))
					{
					let tempTableData =[...this.state.inventoryTableData]
					tempTableData.map((obj)=>{
					if(obj.inventoryId==row.inventoryId)
					    {
					    obj.reOrderLevel=option.target.value != ''?option.target.value:0;
					    obj.disableEditing=false;
					    }
					})
                       this.setState({inventoryTableData:tempTableData})
					}
				}}/></Col>	

		     <Col> {row.disableEditing==false &&(<div>
				<Button
					color="primary"
				className="btn btn-primary btn-sm pdf-btn  ml-1 mt-1 primary"
				onClick={(e, ) => {this.updateReorderLevel(row)	}}
				>
		         <i className="fas fa-check"></i>
				</Button>
			</div>)}</Col> 
			</Row>			
		);
	};

	updateReorderLevel = (data) => {
		const inventoryId =  data['inventoryId'];
		const productCode = data['productCode'];
		const contactId = data['supplierId'];
		const isInventoryEnabled = data['isInventoryEnabled'];
		const transactionCategoryId = data['transactionCategoryId'];
	
		const productName = data['productName'];
		const productType = data['productType'];
		const inventoryQty = data['inventoryQty'];
		const inventoryReorderLevel = data['reOrderLevel'];
		const inventoryPurchasePrice = data['inventoryPurchasePrice'];
		const dataNew = {			
			productCode,
			productName,
			productType,
			isInventoryEnabled,
			contactId,
			transactionCategoryId,
			inventoryId,
			inventoryQty,
			inventoryReorderLevel,
			inventoryPurchasePrice,		
		};
		const postData = this.getReorderData(dataNew);
		this.props.productActions
			.updateInventory(postData)
			.then((res) => {
				if (res.status === 200) {
					// this.setState({ disabled: false });
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Re-Order Level Updated Successfully',
					);
//					this.setState({disableEditing:true})
                    let tempTableData =[...this.state.inventoryTableData]
					tempTableData.map((obj)=>{
					if(obj.inventoryId==data.inventoryId)
					    obj.disableEditing=true;
					})
                       this.setState({inventoryTableData:tempTableData})
					// this.props.history.push('/admin/master/product');
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Updated Unsuccessfully',
				);
			});
	};
	getReorderData = (data) => {
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
	// renderActions = (cell, row) => {
	// 	return (
	// 		<div>
	// 			<ButtonDropdown
	// 				isOpen={this.state.actionButtons[row.id]}
	// 				toggle={() => this.toggleActionButton(row.id)}
	// 			>
	// 				<DropdownToggle size="sm" color="primary" className="btn-brand icon">
	// 					{this.state.actionButtons[row.id] === true ? (
	// 						<i className="fas fa-chevron-up" />
	// 					) : (
	// 						<i className="fas fa-chevron-down" />
	// 					)}
	// 				</DropdownToggle>
	// 				<DropdownMenu right>

	// 						<DropdownItem>
	// 							<div
	// 							onClick={(e, ) => {
	// 								this.props.history.push('/admin/master/product/detail/inventoryedit', { id: row.inventoryId });
	// 					}}
	// 							>
	// 								<i className="fas fa-edit" /> Edit
	// 							</div>
	// 						</DropdownItem>


	// 						<DropdownItem
	// 							onClick={() => {
	// 								this.postInvoice(row);
	// 							}}
	// 						>
	// 							<i className="fas fa-send" /> Post
	// 						</DropdownItem>

	// 				</DropdownMenu>
	// 			</ButtonDropdown>
	// 		</div>
	// 	);
	// };
	render() {
		strings.setLanguage(this.state.language);
		const { vat_list, product_category_list,supplier_list,inventory_list } = this.props;
		const { loading, dialog, purchaseCategory, loadingMsg , salesCategory, inventoryAccount ,exciseTaxList,inventoryTableData,unitTypeList} = this.state;
		let tmpSupplier_list = []

		var vat_list_data =[];

		for(let i=0;i<vat_list.length;i++){
			vat_list_data.push(vat_list[i])			
		}
		// if(this.state.companyDetails && this.state.companyDetails.isRegisteredVat==false)		
			vat_list_data.push({ id: 10,name: "N/A",vat:0})

		supplier_list.map(item => {
			let obj = {label: item.label.contactName, value: item.value}
			tmpSupplier_list.push(obj)
		})

		const cellEditProp = {
			mode: 'dbclick',
			beforeSaveCell: this.beforeSaveCell,
		  };
		return (
			loading ==true? <Loader loadingMsg={loadingMsg}/> :
<div>
			<div className="detail-product-screen">
				<div className="animated fadeIn">
					{dialog}
					{loading ? (
						<Loader></Loader>
					) : (
						<Row>
							<Col lg={12} className="mx-auto">
								<Card>
									<CardHeader>
										<Row>
											<Col lg={12}>
												<div className="h4 mb-0 d-flex align-items-center">
													<i className="fas fa-box" />
													<span className="ml-2"> {strings.UpdateProduct}  </span>
												</div>
											</Col>
										</Row>
									</CardHeader>
									<CardBody>
									{loading ? (
										<Loader />
									) : (
										<Row>
											<Col lg={12}>
												<Formik
													initialValues={this.state.initValue}
													onSubmit={(values, { resetForm }) => {

																	if (this.state.count >0 && this.state.selectedStatus===false) {
																		this.props.commonActions.tostifyAlert(
																			'error',
																			'Deletion of this product is possible only after deleting all the invoices created with this product',
																		);
																	}else{
																		this.handleSubmit(values);
																	}
														
														// resetForm(this.state.initValue)

														// this.setState({
														//   selectedWareHouse: null,
														//   selectedParentProduct: null,
														//   selectedVatCategory: null,
														// })
													}}
													validate={(values) => {
														let errors = {};
														// if (values.purchaseUnitPrice > values.salesUnitPrice) {
														// 	errors.purchaseUnitPrice = 
														// 	'Purchase price cannot be greater than Sales price';
														// }
														if(this.state.exciseTaxCheck===true && values.exciseTaxId=='' ){
															errors.exciseTaxId = 'Excise tax is required';
														}
														if (this.state.ProductExist === true) {
															errors.productCode =
																'Product code already exist';
														}
														if (this.state.productNameExist){
																		errors.productName = 'Product Name Already Exists'
																	}
														return errors;
													}}
													validationSchema={Yup.object().shape({
													// 	isActive : Yup.string()
													// .required('status is required') ,
														productName: Yup.string().required(
															'Product name is required',
														),
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
																	'Selling price is required',
																),
																otherwise: Yup.string(),
															},
														),
														productPriceType: Yup.string().required(
															'At least one selling Type is required',
														),
														productCode: Yup.string().required(
															'Product code is required',
														),
														vatCategoryId: Yup.string()
															.required('Tax category is required')
															.nullable(),
													})}
												>
													{(props) => (
														<Form onSubmit={props.handleSubmit}>
															<Row>
																<Col lg={4}>
																	<FormGroup check inline className="mb-3">
																		<Label className="productlabel"> {strings.ProductType}
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
																	</FormGroup>
                                                                </Col>
															</Row>
															<hr></hr>
															<Row>
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="productName">
																			<span className="text-danger">* </span> {strings.ProductName}
																		</Label>
																		<Input
																			type="text"
																			maxLength="100"
																			id="productName"
																			name="productName"
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regExAlpha.test(
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
																			value={props.values.productName || ''}
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
																		</Label>
																		<Input
																			type="text"
																			id="productCode"
																			name="productCode"
																			/**Added as per discussion with sajid sir ,disabled product code for sanity*/
																			disabled
																			value={props.values.productCode || ''}
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
																			value={
																				product_category_list &&
																				selectOptionsFactory
																					.renderOptions(
																						'label',
																						'value',
																						product_category_list,
																						'Product Category',
																					)
																					.find(
																						(option) =>
																							option.value ===
																							+props.values.productCategoryId,
																					)
																			}
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

																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="vatCategoryId">
																			<span className="text-danger">* </span>
																			{strings.VATType}
																		</Label>
																		<Select
																		 isDisabled={this.state.companyDetails && !this.state.companyDetails.isRegisteredVat}
																			options={
																				vat_list
																					? selectOptionsFactory.renderOptions(
																							'name',
																							'id',
																							vat_list,
																							'Tax',
																					  )
																					: []
																			}
																			id="vatCategoryId"
																			name="vatCategoryId"
																			value={

																				vat_list_data &&
																				selectOptionsFactory
																					.renderOptions(
																						'name',
																						'id',
																						vat_list_data,
																						'Tax',
																					)
																					.find(
																						(option) =>
																							option.value ===
																							+props.values.vatCategoryId,
																					)
																			}
																			onChange={(option) => {
																				this.setState({
																					selectedVatCategory: option.value,
																				});

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
																			placeholder={strings.Select+ "Unit Type"}
																			value={
																				unitTypeList
																				&& selectOptionsFactory.renderOptions(
																					'unitType',
																					'unitTypeId',
																					unitTypeList,
																					'Unit Type',
																			  )
																					.find(
																						(option) =>
																							option.value ==props.values.unitTypeId,
																					)
																			}
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
															{/* <Row>
																<Col lg={12}>
																	<FormGroup check inline className="mb-3">
																		<Input
																			className="form-check-input"
																			type="checkbox"
																			id="vatIncluded"
																			name="vatIncluded"
																			onChange={props.handleChange}
																			defaultChecked={props.values.vatIncluded}
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
															
															<Row style={{display: props.values.productType !== 'SERVICE' ? '' : 'none'}}>
																<Col lg={4}>
																<FormGroup check inline className="mb-3">
																		<Label
																			className="form-check-label"
																			check
																			htmlFor="exciseTaxCheck"
																		>
																			
																			<Input
																				disabled={this.state.childRecordsPresent}
																				type="checkbox"
																				id="exciseTaxCheck"
																				name="exciseTaxCheck"
																				onChange={(event) => {
																					if (this.state.exciseTaxCheck===true) {
																						this.setState({exciseTaxCheck:false,exciseType:false})
																						props.handleChange('exciseTaxId')('',);
																					} else {
																						this.setState({exciseTaxCheck:true})
																					}
																				}}
																				checked={this.state.exciseTaxCheck}
																				style={{ display: 'inline-block' }}
																				
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
															
																<Col  style={{display: props.values.productType !== 'SERVICE' ? '' : 'none'}} lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="exciseTaxId">
																			<span className="text-danger">* </span>
																			{strings.excise_tax_type}
																		</Label>
																		<Select
																		// isDisabled={props.values.exciseTaxId!='' ?true:false}
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
																			placeholder={strings.Select+ strings.excise_tax_slab}
																			value={
																				exciseTaxList
																				&& selectOptionsFactory.renderOptions(
																							'name',
																							'id',
																							exciseTaxList,
																							'Excise Tax Slab',
																					  )
																					.find(
																						(option) =>
																							option.value ===
																							+props.values.exciseTaxId,
																					)
																			}
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
																{/* {this.state.exciseTaxCheck===true&&(	<Row style={{display: props.values.productType !='SERVICE'   ?'' : 'none'}}>
															<Col >
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
															<Row className="secondary-info">
																<Col lg={8}>
																	<FormGroup check inline className="mb-3">
																		<Label
																			className="form-check-label"
																			check
																			htmlFor="productPriceTypeOne"
																		>
																			<Input
																				type="checkbox"
																				maxLength="14,2"
																				id="productPriceTypeOne"
																				name="productPriceTypeOne"
																				onChange={(event) => {
																					if (
																						props.values.productPriceType &&	props.values.productPriceType.includes(
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
																						const nextValue = props.values.productPriceType && props.values.productPriceType.concat(
																							'SALES',
																						);
																						props.setFieldValue(
																							'productPriceType',
																							nextValue,
																						);
																					}
																				}}
																				checked={props.values.productPriceType && props.values.productPriceType.includes(
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
																	<Row><Col>
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
																			placeholder={strings.Enter+strings.SellingPrice}
																			readOnly={
																				props.values.productPriceType &&
																				props.values.productPriceType.includes(
																					'SALES',
																				)
																					? false
																					: true
																			}
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regDecimal.test(option.target.value)
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
																	</FormGroup>
																	</Col><Col>
																	<FormGroup className="mb-3">
																		<Label htmlFor="transactionCategoryId">
																		<span className="text-danger">* </span>{' '}
																		{strings.Account}
																		</Label>
																		<Select
																			styles={customStyles}
																			isDisabled={
																				props.values.productPriceType &&
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
																				salesCategory &&
																				props.values
																					.salesTransactionCategoryLabel
																					? salesCategory
																							.find(
																								(item) =>
																									item.label ===
																									props.values
																										.salesTransactionCategoryLabel,
																							)
																							.options.find(
																								(item) =>
																									item.value ===
																									+props.values
																										.salesTransactionCategoryId,
																							)
																					: props.values
																							.salesTransactionCategoryId
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
																	</Col></Row>
																	<FormGroup className="">
																		<Label htmlFor="salesDescription">
																			 {strings.Description}
																		</Label>
																		<Input
																			readOnly={
																				props.values.productPriceType &&
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
																<Row>
																<Col lg={8}>
																	<FormGroup check inline className="mb-3">
																		<Label
																			className="form-check-label"
																			check
																			htmlFor="productPriceTypetwo"
																		>
																			<Input
																				type="checkbox"
																				maxLength="14,2"
																				id="productPriceTypetwo"
																				name="productPriceTypetwo"
																				onChange={(event) => {
																					if (
																						props.values.productPriceType && props.values.productPriceType.includes(
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
																						const nextValue = props.values.productPriceType && props.values.productPriceType.concat(
																							'PURCHASE',
																						);
																						props.setFieldValue(
																							'productPriceType',
																							nextValue,
																						);
																					}
																				}}
																				checked={props.values.productPriceType && 
																					props.values.productPriceType.includes(
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
																	<Row><Col>
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
																		//disabled={props.values.isInventoryEnabled===true }
																			type="text"
																			maxLength="14,2"
																			id="purchaseUnitPrice"
																			name="purchaseUnitPrice"
																			placeholder={strings.Enter+strings.PurchasePrice}
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regDecimal.test(option.target.value)
																				) {
																					props.handleChange(
																						'purchaseUnitPrice',
																					)(option);
																				}
																			}}
																			readOnly={
																				props.values.productPriceType &&
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
																		<Select
																			styles={customStyles}
																			isDisabled={
																				props.values.productPriceType &&
																				props.values.productPriceType.includes(
																					'PURCHASE',
																				)
																					? false
																					: true
																			}
																			options={
																				purchaseCategory ? purchaseCategory : []
																			}
																			placeholder={strings.CostofGoodsSold}
																			value={
																				purchaseCategory &&
																				props.values
																					.purchaseTransactionCategoryLabel
																					? purchaseCategory
																							.find(
																								(item) =>
																									item.label ===
																									props.values
																										.purchaseTransactionCategoryLabel,
																							)
																							.options.find(
																								(item) =>
																									item.value ===
																									+props.values
																										.purchaseTransactionCategoryId,
																							)
																					: props.values
																							.purchaseTransactionCategoryId
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
																	</FormGroup>
																	</Col></Row>
																	<FormGroup className="">
																		<Label htmlFor="purchaseDescription">
																			 {strings.Description}
																		</Label>
																		<Input
																			readOnly={
																				props.values.productPriceType &&
																				props.values.productPriceType.includes(
																					'PURCHASE',
																				)
																					? false
																					: true
																			}
																			type="textarea"
																			name="purchaseDescription"
																			id="purchaseDescription"
																			maxLength='2000'
																			rows="3"
																			placeholder={strings.Description}
																			onChange={(value) => {
																				props.handleChange(
																					'purchaseDescription',
																				)(value);
																			}}
																			value={
																				props.values.purchaseDescription || ''
																			}
																		/>
																	</FormGroup>
																</Col>
															</Row>
															<hr></hr>
														
														<Row style={{display: props.values.productPriceType &&	props.values.productPriceType.includes(
																					'PURCHASE' 
																				
																				)&& props.values.productType !=
																				'SERVICE'
																		
																			?'' : 'none'

																			}}>
															{config.INVENTORY_MODULE &&
																	<Col lg={8} style={{display: props.values.isInventoryEnabled != true ? 'none' : ''}}>
																	<FormGroup check inline className="mb-3">
																		<Label
																			className="form-check-label"
																			check
																			htmlFor="isInventoryEnabled"
																		>
																			<Input
																			disabled={this.state.childRecordsPresent}
																			readonly 
																			//className="form-check-input"
																			type="checkbox"
																			id="isInventoryEnabled"
																			name="isInventoryEnabled"
																			onChange={(value) => {
																				props.handleChange('isInventoryEnabled')(value);
																			}}
																			checked={props.values.isInventoryEnabled}
																			className={
																				props.errors.productPriceType &&
																				props.touched.productPriceType
																					? 'is-invalid form-check-label'
																					: 'form-check-label'
																			}
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
																			>
																			</i>
																			<UncontrolledTooltip
																				placement="right"
																				target="EnventoryTooltip"
																			>
																				Inventory cannot be enabled or disabled once a document has been created using this product.
																			</UncontrolledTooltip>
																		</Label>
																	</FormGroup>
															
																	{/* <Row style={{display: props.values.isInventoryEnabled === false ? 'none' : ''}}>
																	<Col>	
																	<FormGroup className="mb-3">
																		<Label htmlFor="salesUnitPrice">
																		Inventory Account
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
																			// value={
																			// 	inventoryAccount
																			// 		? props.values
																			// 				.transactionCategoryId
																			// 		: ''
																			// }
																			value={
																				inventoryAccount &&
																				props.values
																					.transactionCategoryName
																					? inventoryAccount
																							.find(
																								(item) =>
																									item.label ===
																									props.values
																										.transactionCategoryName,
																							)
																							.options.find(
																								(item) =>
																									item.value ===
																									+props.values
																										.transactionCategoryId,
																							)
																					: props.values
																							.transactionCategoryId
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
																	</FormGroup>
																	</Col>
																	<Col>
																	<FormGroup className="mb-3">
																		<Label htmlFor="inventoryQty">
																			Purchase Quantity
																			
																		</Label>
																		<Input
																		type="number"
min="0"
																			maxLength="10"
																			id="inventoryQty"
																			name="inventoryQty"
																			placeholder="Enter Quantity"
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regDecimal.test(
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
																</Row> */}
																{/* <Row style={{display: props.values.isInventoryEnabled === false ? 'none' : ''}}>
																<Col>
																	<FormGroup className="mb-3">
																		<Label htmlFor="inventoryPurchasePrice">
																			Purchase Price
																		</Label>
																		<Input
																		type="number"
min="0"
																			maxLength="10"
																			id="inventoryPurchasePrice"
																			name="inventoryPurchasePrice"
																			placeholder="Enter Purchase Price"
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
																	</FormGroup>
																	</Col>
																	<Col>
																	<FormGroup className="mb-3">
																	<Label htmlFor="contactId">
																	
																		Supplier Name
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
																		placeholder="Select Supplier Name"
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
																					+props.values.contactId,
																			)
																		}
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
																</Row> */}
																{/* <Row style={{display: props.values.isInventoryEnabled === false ? 'none' : ''}}>
																	<Col lg={6}>
																	<FormGroup className="">
																		<Label htmlFor="inventoryReorderLevel">
																			Re-Order Level
																		</Label>
																		<Input
																			// readOnly={
																			// 	props.values.productPriceType.includes(
																			// 		'INVENTORY',
																			// 	)
																			// 		? false
																			// 		: true
																			// }
																			type="number"
																			min="0"
																			maxLength="200"
																			name="inventoryReorderLevel"
																			id="inventoryReorderLevel"
																			rows="3"
																			placeholder="inventoryReorderLevel..."
																			onChange={(value) => {
																				props.handleChange(
																					'inventoryReorderLevel',
																				)(value);
																			}}
																			value={props.values.inventoryReorderLevel}
																		/>
																	</FormGroup>
																	</Col>
																	
																	</Row> */}
												 <Row style={{display: props.values.isInventoryEnabled !== true ? 'none' : '',width:"140%"}}>
												<div className={"ml-4 mt-2"}>
											<BootstrapTable
											selectRow={this.selectRowProp}
											search={false}
											options={this.options}
											data={inventoryTableData ? inventoryTableData : []}
											version="4"
											hover
											responsive
											currencyList
											keyField="inventoryId"
											remote
											className="customer-invoice-table"
											ref={(node) => {
												this.table = node;
											}}
										>
											<TableHeaderColumn
												dataField="supplierName"
												dataSort
												className="table-header-bg"
												dataFormat={this.renderName}
											>
												 {strings.SupplierName}
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="stockInHand" 
												className="table-header-bg"
											>
											 {strings.StockInHand}
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="reOrderLevel" 
												className="table-header-bg"
												dataFormat={this.renderReorderLevel}
											>
											 {strings.ReOrderLevel}
											</TableHeaderColumn>
											<TableHeaderColumn 
												dataField="quantitySold"
												className="table-header-bg"
											>
											 {strings.QuantitySold}
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="purchaseOrder" 
												className="table-header-bg"
											>
											 {strings.PurchaseOrder}
											</TableHeaderColumn>
											<TableHeaderColumn
											//	className="text-right"
												columnClassName="text-right"
												width='5%'
												dataFormat={this.renderActions}
												className="text-right table-header-bg"
											></TableHeaderColumn>
										</BootstrapTable>
										</div>
										</Row>
																	
																</Col>}
															</Row>
															
															<Row>
																<Col
																	lg={12}
																	className="d-flex align-items-center justify-content-between flex-wrap mt-5"
																>
																	{this.state.isInventoryEnabled !== true &&
																	  (
																	<FormGroup>
																		<Button
																			type="button"
																			name="button"
																			color="danger"
																			className="btn-square"
																			disabled1={this.state.disabled1}
																			onClick={this.deleteProduct}
																		>
																			<i className="fa fa-trash"></i> {this.state.disabled1
																			? 'Deleting...'
																			: strings.Delete }
																		</Button>
																	</FormGroup>)}
																	<FormGroup></FormGroup>
																	<FormGroup className="text-right">
																		<Button
																			type="submit"
																			name="submit"
																			color="primary"
																			className="btn-square mr-3"
																			disabled={this.state.disabled}
																			onClick={() => {
																				//	added validation popup	msg
																				props.handleBlur();
																				if(props.errors &&  Object.keys(props.errors).length != 0)
																				this.props.commonActions.fillManDatoryDetails();
																		}}
																		>
																			<i className="fa fa-dot-circle-o"></i>{' '}
																			{this.state.disabled
																				? 'Updating...'
																				: strings.Update}
																		</Button>
																		<Button
																			color="secondary"
																			className="btn-square"
																			onClick={() => {
																				this.props.history.push(
																					'/admin/master/product',
																				);
																			}}
																		>
																			<i className="fa fa-ban"></i> {this.state.disabled1
																			? 'Deleting...'
																			: strings.Cancel }
																		</Button>
																	</FormGroup>
																</Col>
															</Row>
														</Form>
													)}
												</Formik>
											</Col>
										</Row>
									)}
									</CardBody>
								</Card>
							</Col>
						</Row>
					)}
				</div>
				<WareHouseModal
					openModal={this.state.openWarehouseModal}
					closeWarehouseModal={this.closeWarehouseModal}
				/>
				{/* <InventoryModel
					openInventoryModel={this.state.openInventoryModel}
					closeInventoryModel={(e) => {
						this.closeInventoryModel(e);
					}}
						inventoryAccount={this.state.inventoryAccount}
						//getInventoryId={this.props.ProductActions.getInventoryById}
						 getInventoryById={(e) => this.getInventoryById(e)}
				/> */}

					<InventoryHistoryModal
					openModal={this.state.openModal}
					closeModal={(e) => {
						this.closeModal(e);
					}}
					// id={this.state.rowId}
					 inventory_history_list={this.state.inventory_history_list}
				/>
			</div>
			{this.state.disableLeavePage ?"":<LeavePage/>}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailProduct);
