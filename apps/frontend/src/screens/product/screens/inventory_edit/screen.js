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
	ButtonDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from 'reactstrap';
import Select from 'react-select';

import { Formik } from 'formik';
import * as Yup from 'yup';

import _ from 'lodash';

import './style.scss';

import * as ProductActions from '../../actions';

import { WareHouseModal } from '../../sections';

import { Loader, ConfirmDeleteModal } from 'components';
import { selectOptionsFactory } from 'utils';
import * as DetailProductActions from './actions';
import { CommonActions } from 'services/global';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { InventoryModel} from '../../sections';
import {data}  from '../../../Language/index'
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
class InventoryEdit extends React.Component {
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
		    disabled: false,
			dialog: null,
			current_inventory_id: null,
			openInventoryModel: false,
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
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
	}

	componentDidMount = () => {
		this.initializeData();
	};
	
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
			this.props.supplierInvoiceActions.getSupplierList(this.state.contactType);
			this.inventoryAccount()
			this.props.productActions
				.getInventoryById(this.props.location.state.id)
				.then((res) => {
					if (res.status === 200) {
						this.setState({
							loading: false,
							current_inventory_id: this.props.location.state.id,
							initValue: {
							//	isInventoryEnabled : res.data.isInventoryEnabled ? res.data.isInventoryEnabled : '',
								inventoryQty:res.data.inventoryQty ? res.data.inventoryQty : '',
								inventoryReorderLevel: res.data.inventoryReorderLevel ? res.data.inventoryReorderLevel : '',
								inventoryPurchasePrice : res.data.inventoryPurchasePrice ? res.data.inventoryPurchasePrice : '',
								contactId: res.data.contactId ? res.data.contactId : '',
								transactionCategoryId: res.data.transactionCategoryId ? res.data.transactionCategoryId : '',
								
								//current_inventory_id: res.data.inventoryId ? res.data.inventoryId : '',
							},
						});
					} else {
						this.setState({ loading: false });
						this.props.history.push('/admin/master/product');
					}
				});}
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
		const { current_inventory_id } = this.state;
		console.log(current_inventory_id);
		const inventoryId = current_inventory_id;
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
		const postData = this.getData(dataNew);
		this.setState({ disabled: true });

		this.props.productActions
			.updateInventory(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ disabled: false });
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Product Updated Successfully',
					);
					this.props.history.push('/admin/master/product');
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Product Updated Unsuccessfully',
				);
			});
	};

	showWarehouseModal = () => {
		this.setState({ openWarehouseModal: true });
	};
	// Cloase Confirm Modal
	closeWarehouseModal = () => {
		this.setState({ openWarehouseModal: false });
		this.props.productActions.getProductWareHouseList();
	};
	openInventoryModel = (props) => {
		this.setState({ openInventoryModel : true });
	};
	closeInventoryModel = (res) => {
		this.setState({ openInventoryModel: false });
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
	getInventoryId = () => {
		this.props.productActions.getInventoryById()
		.then((res) => {
			if (res.status === 200) {
				this.setState({
					initValue: {
					
					},
				});
			
			}
		});
	};

	getInventoryById = (data) => {
		this.getInventoryId();
	};

	removeProduct = () => {
		const { current_product_id } = this.state;
		this.props.detailProductActions
			.deleteProduct(current_product_id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message :  'Product Deleted Successfully')
					this.props.history.push('/admin/master/product');
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Product Deleted Unsuccessfully',
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
	renderActions = (cell, row) => {
		return (
			<div>
				<Button
				onClick={(e, ) => {
					this.openInventoryModel({id: row.inventoryId});
		}}
		>
				</Button>
			</div>
		);
	};

	render() {
		strings.setLanguage(this.state.language);
		const { vat_list, product_category_list,supplier_list,inventory_list,current_inventory_id} = this.props;
		const { loading, dialog, purchaseCategory, salesCategory, inventoryAccount } = this.state;
		let tmpSupplier_list = []

		supplier_list.map(item => {
			let obj = {label: item.label.contactName, value: item.value}
			tmpSupplier_list.push(obj)
		})
	console.log(current_inventory_id)
		return (
			loading ==true? <Loader/> :
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
													<i className="fas fa-object-group" />
													<span className="ml-2">{strings.UpdateInventory}</span>
												</div>
											</Col>
										</Row>
									</CardHeader>
									<CardBody>
										<Row>
											<Col lg={12}>
												<Formik
													initialValues={this.state.initValue}
													onSubmit={(values, { resetForm }) => {
														this.handleSubmit(values);
														// resetForm(this.state.initValue)

														// this.setState({
														//   selectedWareHouse: null,
														//   selectedParentProduct: null,
														//   selectedVatCategory: null,
														// })
													}}
													validationSchema={Yup.object().shape({
														
													
													})}
												>
													{(props) => (
														<Form onSubmit={props.handleSubmit}>
															<Row>
																<Col lg={12}>
																<Row>
																	<Col lg={4} >	
																	<FormGroup className="mb-3">
																		<Label htmlFor="salesUnitPrice">
																		 {strings.InventoryAccount}
																		</Label>
																		<Select
																		isDisabled = {true}
																			styles={customStyles}
																			options={
																				inventoryAccount ? inventoryAccount : []
																			}
																		
																			value={
																				inventoryAccount
																					&& inventoryAccount.find(
																						(option) =>
																							option.value ===
																							+props.values.transactionCategoryId,
																					)
																							
																			}
																			// inventoryAccount &&
																			// 	props.values
																			// 		.purchaseTransactionCategoryLabel
																			// 		? purchaseCategory
																			// 				.find(
																			// 					(item) =>
																			// 						item.label ===
																			// 						props.values
																			// 							.purchaseTransactionCategoryLabel,
																			// 				)
																			// 				.options.find(
																			// 					(item) =>
																			// 						item.value ===
																			// 						+props.values
																			// 							.purchaseTransactionCategoryId,
																			// 				)
																			// 		: props.values
																			// 				.purchaseTransactionCategoryId
																			// }
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
																	<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="inventoryQty">
																		 {strings.OpeningStock}
																			
																		</Label>
																		<Input
																		type="number"
min="0"
																	disabled
																			maxLength="10"
																			id="inventoryQty"
																			name="inventoryQty"
																			placeholder={strings.Enter+strings.Quantity}
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
																</Row>
																<Row>
																<Col  lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="inventoryPurchasePrice">
																			{strings.PurchasePrice}
																		</Label>
																		<Input
																		disabled
																		type="number"
min="0"
																			maxLength="10"
																			id="inventoryPurchasePrice"
																			name="inventoryPurchasePrice"
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
																	</FormGroup>
																	</Col>
																	<Col  lg={4}>
																	<FormGroup className="mb-3">
																	<Label htmlFor="contactId">
																	
																		 {strings.SupplierName}
																	</Label>
																	<Select
																		 isDisabled={true}
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
																</Row>
															<Row>
																	<Col  lg={4}>
																	<FormGroup>
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
																			max="2000"
																			maxLength='10'
																			name="inventoryReorderLevel"
																			id="inventoryReorderLevel"
																			rows="3"
																			placeholder={strings.InventoryReorderLevel}
																			onChange={(value) => {
																
																				if (
																					value.target.value === '' ||
																					this.regDecimal.test(
																						value.target.value,
																					)
																				) {
																					props.handleChange(
																						'inventoryReorderLevel',
																					)(value);
																				}

																			}}
																			value={props.values.inventoryReorderLevel}
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
																				disabled={this.state.disabled}
																		>
																			<i className="fa fa-dot-circle-o"></i>{' '}
																		{this.state.disabled
																			? 'Updating...'
																			: strings.Update }
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
																			<i className="fa fa-ban"></i> {strings.Cancel}
																		</Button>
																	</FormGroup>
																</Col>
															</Row>
														</Form>
													)}
												</Formik>
											</Col>
										</Row>
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
			</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(InventoryEdit);
