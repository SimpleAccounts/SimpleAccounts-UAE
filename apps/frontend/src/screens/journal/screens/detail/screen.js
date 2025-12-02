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
	Badge,
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import { CommonActions } from 'services/global';
import { selectCurrencyFactory } from 'utils';
import * as JournalActions from '../../actions';
import * as JournalDetailActions from './actions';
import { Loader, LeavePage,ConfirmDeleteModal, Currency } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { JOURNAL } from 'constants/types';

const mapStateToProps = (state) => {
	return {
		transaction_category_list: state.journal.transaction_category_list,
		currency_list: state.journal.currency_list,
		contact_list: state.journal.contact_list,
		vat_list: state.journal.vat_list,
		universal_currency_list: state.common.universal_currency_list,
		cancel_flag: state.journal.cancel_flag
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		journalActions: bindActionCreators(JournalActions, dispatch),
		journalDetailActions: bindActionCreators(JournalDetailActions, dispatch),
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
class DetailJournal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			current_journal_id: null,
			initValue: {},
			data: [],
			submitJournal: false,
		    disabled1:false,
			disabled2: false,
			disableLeavePage:false,
			companyName: '',		  
		};
		

		this.formRef = React.createRef();
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		if (this.props.location.state && this.props.location.state.id) {
			this.props.journalDetailActions
				.getJournalById(this.props.location.state.id)
				.then((res) => {
					if (res.status === 200) {
						this.props.journalActions.getCurrencyList();
						this.props.journalActions.getTransactionCategoryList();
						this.props.commonActions.getCompanyDetails().then((res) => {
							if (res.status === 200) {
							this.setState({ companyName: res.data.companyName });
							}
							  
						})
						this.props.journalActions.getContactList();
						this.setState(
							{
								loading: false,
								current_journal_id: this.props.location.state.id,
								initValue: {
									journalId: res.data.journalId,
									journalDate: res.data.journalDate ? res.data.journalDate : '',
									journalReferenceNo: res.data.journalReferenceNo
										? res.data.journalReferenceNo
										: '',
									description: res.data.description ? res.data.description : '',
									currencyCode: res.data.currencyCode
										? res.data.currencyCode
										: '',
									subTotalDebitAmount: res.data.subTotalDebitAmount
										? res.data.subTotalDebitAmount
										: 0,
									totalDebitAmount: res.data.totalDebitAmount
										? res.data.totalDebitAmount
										: 0,
									totalCreditAmount: res.data.totalCreditAmount
										? res.data.totalCreditAmount
										: 0,
									subTotalCreditAmount: res.data.subTotalCreditAmount
										? res.data.subTotalCreditAmount
										: 0,
									journalLineItems: res.data.journalLineItems
										? res.data.journalLineItems
										: [],
									postingReferenceType: res.data.postingReferenceType
										? res.data.postingReferenceType
										: '',
								},
								data: res.data.journalLineItems
									? res.data.journalLineItems
									: [],
							},
							() => {
								const { data } = this.state;
								const idCount =
									data.length > 0
										? Math.max.apply(
												Math,
												data.map((item) => {
													return item.id;
												}),
										  )
										: 0;
								this.setState({
									idCount,
								});
							},
						);
					}
				})
				.catch((err) => {
					this.setState({ loading: false });
				});
		} else {
			this.props.history.push('/admin/accountant/journal');
		}
	};

	renderActions = (cell, rows, props) => {
		return (
			<Button
				size="sm"
				disabled={
					props.values.postingReferenceType === 'MANUAL' ||
					this.state.data.length > 2
						? false
						: true
				}
				className="btn-twitter btn-brand icon"
				onClick={(e) => {
					this.deleteRow(e, rows, props);
				}}
			>
				<i className="fas fa-trash"></i>
			</Button>
		);
	};

	checkedRow = () => {
		if (this.state.data.length > 0) {
			let length = this.state.data.length - 1;
			let temp = Object.values(this.state.data[`${length}`]).indexOf('');
			if (temp > -1) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	renderAccount = (cell, row, props) => {
		const { transaction_category_list } = this.props;

		// const getoptions=()=>{
		// const tit=transactionCategoryList.find(
		// 		(item) =>{
		// 			item.label === row.journalTransactionCategoryLabel
		// 		})
				
		// 		?.options?.find((i)=>{
		// 			i.value===row.transactionCategoryId
		// 		})?.label
		// }
		let transactionCategoryList =
			transaction_category_list &&
			transaction_category_list &&
			transaction_category_list.length
				? [
						{
							transactionCategoryId: '',
							transactionCategoryName: 'Select Account',
						},
						...transaction_category_list,
				  ]
				: [];
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});
			
if(row && row.journalTransactionCategoryLabel==='Bank')
{
	
	return (
		<Field
			name={`journalLineItems.${idx}.transactionCategoryId`}
			render={({ field, form }) => (			
				<Input 
				id="transactionCategoryId"
				disabled={true} 
				value={row.journalTransactionCategoryLabel ? row.transactionCategoryName == JOURNAL.AMOUNT_IN_TRANSIT ?
					row.journalTransactionCategoryLabel:  row.transactionCategoryName
					:''}
				placeholder={strings.Select+strings.Account}
					>						
				</Input>
			)}
		/>
	);
}else

	if(row && row.transactionCategoryName==='Petty Cash')
	{
		return (
			<Field
				name={`journalLineItems.${idx}.transactionCategoryId`}
				render={({ field, form }) => (			
					<Input 
					id="transactionCategoryId"
					disabled={true} 
					value={row.transactionCategoryName + (this.state.companyName ? ' - ' + this.state.companyName : '') ? row.transactionCategoryName + (this.state.companyName ? ' - ' + this.state.companyName : '') :''}
					placeholder={strings.Select+strings.Account}
						>						
					</Input>
				)}
			/>
		);
	}else{

		return (
			<Field
				name={`journalLineItems.${idx}.transactionCategoryId`}
				render={({ field, form }) => (
					<Select
						styles={{
							menu: (provided) => ({ ...provided, zIndex: 9999 }),
						}}
						options={transactionCategoryList ? transactionCategoryList : []}
						id="transactionCategoryId"
						onChange={(e) => {
							this.selectItem(
								e.value,
								row,
								'transactionCategoryId',
								form,
								field,
							);
						}}
						isDisabled={props.values.postingReferenceType === 'MANUAL' ? false : true}
						value={
							transactionCategoryList &&
							transactionCategoryList.length > 0 &&
							row.transactionCategoryName
								? transactionCategoryList
										.find(
											(item) =>{
												
												return item.label === row.journalTransactionCategoryLabel
											})?.options?.find((i)=>{
			
												return i.value===row.transactionCategoryId
											})
										
								: row.transactionCategoryName
						}
						placeholder={strings.Select+strings.Account}
						className={`${
							props.errors.journalLineItems &&
							props.errors.journalLineItems[parseInt(idx, 10)] &&
							props.errors.journalLineItems[parseInt(idx, 10)]
								.transactionCategoryId &&
							Object.keys(props.touched).length > 0 &&
							props.touched.journalLineItems &&
							props.touched.journalLineItems[parseInt(idx, 10)] &&
							props.touched.journalLineItems[parseInt(idx, 10)]
								.transactionCategoryId
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);

	}
		
	};

	renderDescription = (cell, row, props) => {
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`journalLineItems.${idx}.description`}
				render={({ field, form }) => (
					<Input
						type="text"
						value={row['description'] !== '' ? row['description'] : ''}
						disabled={
							props.values.postingReferenceType === 'MANUAL' ? false : true
						}
						onChange={(e) => {
							this.selectItem(e.target.value, row, 'description', form, field);
						}}
						placeholder={strings.Description}
						className={`form-control 
            ${
							props.errors.journalLineItems &&
							props.errors.journalLineItems[parseInt(idx, 10)] &&
							props.errors.journalLineItems[parseInt(idx, 10)].description &&
							Object.keys(props.touched).length > 0 &&
							props.touched.journalLineItems &&
							props.touched.journalLineItems[parseInt(idx, 10)] &&
							props.touched.journalLineItems[parseInt(idx, 10)].description
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
	};

	renderContact = (cell, row, props) => {
		const { contact_list } = this.props;
		let contactList = contact_list.length
			? [{ value: '', label: 'Select Contact' }, ...contact_list]
			: contact_list;
		let idx;

		if(this.state.data && this.state.data != undefined){
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});
	}
	switch(row && row.postingReferenceType ?row.postingReferenceType:'')
	{
		case "MANUAL":
			return (
				<Field
					name={`journalLineItems.${idx}.contactId`}
					render={({ field, form }) => (
						<Input
							type="select"
							onChange={(e) => {
								this.selectItem(e.target.value, row, 'contactId', form, field);
							}}
							disabled={
								props.values.postingReferenceType === 'MANUAL' ? false : true
							}
							value={row.contactId}
							placeholder={strings.Select+strings.Contact}
							className={`form-control 
							${
								props.errors.journalLineItems &&
								props.errors.journalLineItems[parseInt(idx, 10)] &&
								props.errors.journalLineItems[parseInt(idx, 10)].contactId &&
								Object.keys(props.touched).length > 0 &&
								props.touched.journalLineItems &&
								props.touched.journalLineItems[parseInt(idx, 10)] &&
								props.touched.journalLineItems[parseInt(idx, 10)].contactId
									? 'is-invalid'
									: ''
							}`}
						>
							{contactList
								? contactList.map((obj) => {
										return (
											<option value={obj.value} key={obj.value}>
												{obj && obj.label && obj.label.contactName ? obj.label.contactName : ''}
											</option>
										);
								  })
								: ''}
						</Input>
					)}
				/>
			);

			break;
		
		case "BANK_ACCOUNT":
			return (
				<Field
					name={`journalLineItems.${idx}.contactId`}
					render={({ field, form }) => (
						<Input
						
							disabled={
								props.values.postingReferenceType === 'MANUAL' ? false : true
							}
							value={"-"}
							placeholder={strings.Select+strings.Contact}
							className={`form-control 
				${
								props.errors.journalLineItems &&
								props.errors.journalLineItems[parseInt(idx, 10)] &&
								props.errors.journalLineItems[parseInt(idx, 10)].contactId &&
								Object.keys(props.touched).length > 0 &&
								props.touched.journalLineItems &&
								props.touched.journalLineItems[parseInt(idx, 10)] &&
								props.touched.journalLineItems[parseInt(idx, 10)].contactId
									? 'is-invalid'
									: ''
							}`}
						>
						</Input>
					)}
				/>
			);
			break;
		
		default :
		return (
			<Field
				name={`journalLineItems.${idx}.contactId`}
				render={({ field, form }) => (
					<Input
					
						disabled={
							props.values.postingReferenceType === 'MANUAL' ? false : true
						}
						value={row.contactId ? row.contactId:'-'}
						placeholder={strings.Select+strings.Contact}
						className={`form-control 
			${
							props.errors.journalLineItems &&
							props.errors.journalLineItems[parseInt(idx, 10)] &&
							props.errors.journalLineItems[parseInt(idx, 10)].contactId &&
							Object.keys(props.touched).length > 0 &&
							props.touched.journalLineItems &&
							props.touched.journalLineItems[parseInt(idx, 10)] &&
							props.touched.journalLineItems[parseInt(idx, 10)].contactId
								? 'is-invalid'
								: ''
						}`}
					>
								{contactList
								? contactList.map((obj) => {
										return (
											<option value={obj.value} key={obj.value}>
												{obj && obj.label && obj.label.contactName ? obj.label.contactName : ''}
											</option>
										);
								  })
								: '-'}
					</Input>
				)}
			/>
		);
		break;
	}
		// return (
		// 	<Field
		// 		name={`journalLineItems.${idx}.contactId`}
		// 		render={({ field, form }) => (
		// 			<Input
		// 				type="select"
		// 				onChange={(e) => {
		// 					this.selectItem(e.target.value, row, 'contactId', form, field);
		// 				}}
		// 				disabled={
		// 					props.values.postingReferenceType === 'MANUAL' ? false : true
		// 				}
		// 				value={row.contactId}
		// 				placeholder={strings.Select+strings.Contact}
		// 				className={`form-control 
        //     ${
		// 					props.errors.journalLineItems &&
		// 					props.errors.journalLineItems[parseInt(idx, 10)] &&
		// 					props.errors.journalLineItems[parseInt(idx, 10)].contactId &&
		// 					Object.keys(props.touched).length > 0 &&
		// 					props.touched.journalLineItems &&
		// 					props.touched.journalLineItems[parseInt(idx, 10)] &&
		// 					props.touched.journalLineItems[parseInt(idx, 10)].contactId
		// 						? 'is-invalid'
		// 						: ''
		// 				}`}
		// 			>
		// 				{contactList
		// 					? contactList.map((obj) => {
		// 							return (
		// 								<option value={obj.value} key={obj.value}>
		// 									{obj && obj.label && obj.label.contactName ? obj.label.contactName : ''}
		// 								</option>
		// 							);
		// 					  })
		// 					: ''}
		// 			</Input>
		// 		)}
		// 	/>
		// );
	};

	renderDebits = (cell, row, props) => {
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`journalLineItems.${idx}.debitAmount`}
				render={({ field, form }) => (
					<>
					<Input
					type="number"
min="0"
					
						value={row['debitAmount'] !== 0 ? row['debitAmount'] : 0}
						disabled={
							props.values.postingReferenceType === 'MANUAL' ? false : true
						}
						onChange={(e) => {
							if (
								e.target.value === '' ||
								this.regDecimal.test(e.target.value)
							) {
								this.selectItem(
									e.target.value,
									row,
									'debitAmount',
									form,
									field,
								);
							}
						}}
						placeholder={strings.Debit+" "+strings.Amount }
						className={`form-control 
            ${
							props.errors.journalLineItems &&
							props.errors.journalLineItems[parseInt(idx, 10)] &&
							props.errors.journalLineItems[parseInt(idx, 10)].debitAmount &&
							Object.keys(props.touched).length > 0 &&
							props.touched.journalLineItems &&
							props.touched.journalLineItems[parseInt(idx, 10)] &&
							props.touched.journalLineItems[parseInt(idx, 10)].debitAmount
								? 'is-invalid'
								: ''
						}`}
					/>
					{props.errors.journalLineItems &&
						props.errors.journalLineItems[parseInt(idx, 10)] &&
						props.errors.journalLineItems[parseInt(idx, 10)].debitAmount &&
						Object.keys(props.touched).length > 0 &&
						props.touched.journalLineItems &&
						props.touched.journalLineItems[parseInt(idx, 10)] &&
						props.touched.journalLineItems[parseInt(idx, 10)].debitAmount && (
							<div className='invalid-feedback'>
								{props.errors.journalLineItems[parseInt(idx, 10)].debitAmount}
							</div>

						)}
						</>
				)}
			/>
		);
	};

	renderCredits = (cell, row, props) => {
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`journalLineItems.${idx}.creditAmount`}
				render={({ field, form }) => (
					<>
					<Input
					type="number"
min="0"
				
						value={row['creditAmount'] !== 0 ? row['creditAmount'] : 0}
						disabled={
							props.values.postingReferenceType === 'MANUAL' ? false : true
						}
						onChange={(e) => {
							if (
								e.target.value === '' ||
								this.regDecimal.test(e.target.value)
							) {
								this.selectItem(
									e.target.value,
									row,
									'creditAmount',
									form,
									field,
								);
							}
						}}
						placeholder={strings.Credit+" "+strings.Amount}
						className={`form-control 
            ${
							props.errors.journalLineItems &&
							props.errors.journalLineItems[parseInt(idx, 10)] &&
							props.errors.journalLineItems[parseInt(idx, 10)].creditAmount &&
							Object.keys(props.touched).length > 0 &&
							props.touched.journalLineItems &&
							props.touched.journalLineItems[parseInt(idx, 10)] &&
							props.touched.journalLineItems[parseInt(idx, 10)].creditAmount
								? 'is-invalid'
								: ''
						}`}
					/>
					{props.errors.journalLineItems &&
						props.errors.journalLineItems[parseInt(idx, 10)] &&
						props.errors.journalLineItems[parseInt(idx, 10)].creditAmount &&
						Object.keys(props.touched).length > 0 &&
						props.touched.journalLineItems &&
						props.touched.journalLineItems[parseInt(idx, 10)] &&
						props.touched.journalLineItems[parseInt(idx, 10)].creditAmount && (
							<div className='invalid-feedback'>
								{props.errors.journalLineItems[parseInt(idx, 10)].creditAmount}
							</div>

						)}
				</>
				)}
			/>
		);
	};

	addRow = () => {
		const data = [...this.state.data];
		this.setState(
			{
				data: data.concat({
					id: this.state.idCount + 1,
					description: '',
					transactionCategoryId: '',
					contactId: '',
					debitAmount: 0,
					creditAmount: 0,
				}),
				idCount: this.state.idCount + 1,
			},
			() => {
				this.formRef.current.setFieldValue(
					'journalLineItems',
					this.state.data,
					true,
				);
			},
		);
	};

	selectItem = (e, row, name, form, field) => {
		//	e.preventDefault();
		let idx;
		const data = this.state.data;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				if (name === 'debitAmount') {
					obj[`${name}`] = e;
					obj['creditAmount'] = 0;
				} else if (name === 'creditAmount') {
					obj[`${name}`] = e;
					obj['debitAmount'] = 0;
				} else {
					obj[`${name}`] = e;
				}
				idx = index;
			}
			return obj;
		});
		if (name === 'debitAmount') {
			form.setFieldValue(`journalLineItems.[${idx}].creditAmount`, 0, true);
			form.setFieldValue(
				field.name,
				this.state.data[parseInt(idx, 10)][`${name}`],
				true,
			);
			this.updateAmount(data);
		} else if (name === 'creditAmount') {
			form.setFieldValue(
				field.name,
				this.state.data[parseInt(idx, 10)][`${name}`],
				true,
			);
			form.setFieldValue(`journalLineItems.[${idx}].debitAmount`, 0, true);
			this.updateAmount(data);
		} else {
			this.setState({ data }, () => {
				this.formRef.current.setFieldValue(
					field.name,
					this.state.data[parseInt(idx, 10)][`${name}`],
					true,
				);
			});
		}
	};

	deleteRow = (e, row, props) => {
		const id = row['id'];
		let newData = [];
		e.preventDefault();
		const data = this.state.data;
		newData = data.filter((obj) => obj.id !== id);
		props.setFieldValue('journalLineItems', newData, true);
		this.updateAmount(newData);
	};

	updateAmount = (data) => {
		let subTotalDebitAmount = 0;
		let subTotalCreditAmount = 0;
		// let totalDebitAmount = 0;
		// let totalCreditAmount = 0;

		data.map((obj) => {
			if (obj.debitAmount || obj.creditAmount) {
				subTotalDebitAmount = subTotalDebitAmount + +obj.debitAmount;
				subTotalCreditAmount = subTotalCreditAmount + +obj.creditAmount;
			}
			return obj;
		});

		this.setState({
			data,
			initValue: {
				...this.state.initValue,
				...{
					subTotalDebitAmount,
					totalDebitAmount: subTotalDebitAmount,
					totalCreditAmount: subTotalCreditAmount,
					subTotalCreditAmount,
				},
			},
		});
	};

	deleteJournal = () => {
		const message1 =
			<text>
			<b>Delete Journal?</b>
			</text>
			const message = 'This Journal will be deleted permanently and cannot be recovered. ';
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={this.removeJournal}
					cancelHandler={this.removeDialog}
					message={message}
					message1={message1}
				/>
			),
		});
	};

	removeJournal = () => {
		this.setState({ disabled1: true,disableLeavePage : true });
		const { current_journal_id } = this.state;
		this.props.journalDetailActions
			.deleteJournal(current_journal_id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message :'Journal Deleted Successfully',
					);
					this.props.history.push('/admin/accountant/journal');
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Journal Deleted Unsuccessfully',
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	handleSubmit = (values) => {
		const { data, initValue } = this.state;
		if (initValue.totalCreditAmount === initValue.totalDebitAmount) {
			data.map((item) => {
				delete item.id;
				item.transactionCategoryId = item.transactionCategoryId
					? item.transactionCategoryId
					: '';
				item.contactId = item.contactId ? item.contactId : '';

				return item;
			});
			let currency='';
			if(values.currencyCode && values.currencyCode.value )
			{
				currency=values.currencyCode.value
			}
			else{
				if(values.currencyCode)
				{
					currency=values.currencyCode
				}			
			}
			const postData = {
				journalId: values.journalId,
				journalDate: values.journalDate ? values.journalDate : '',
				journalReferenceNo: values.journalReferenceNo
					? values.journalReferenceNo
					: '',
				description: values.description ? values.description : '',
				currencyCode: currency,
				subTotalCreditAmount: initValue.subTotalCreditAmount,
				subTotalDebitAmount: initValue.subTotalDebitAmount,
				totalCreditAmount: initValue.totalCreditAmount,
				totalDebitAmount: initValue.totalDebitAmount,
				journalLineItems: data,
			};
				this.setState({ disabled2: true });
				this.setState({ loading:true, disableLeavePage:true,loadingMsg:"Updating Journal..."});
			this.props.journalDetailActions
		
				.updateJournal(postData)
				.then((res) => {
					if (res.status === 200) {
							this.setState({ disabled2: false });
						this.props.commonActions.tostifyAlert(
							'success',
							res.data ? res.data.message :'Journal Updated Successfully',
						);
						this.props.history.push('/admin/accountant/journal');
						this.setState({ loading:false,});
					}
				})
				.catch((err) => {
					this.props.commonActions.tostifyAlert(
						'error',
						err.data ? err.data.message : 'Journal Updated Unsuccessfully'
					);
				});
		}
	};

	render() {
		strings.setLanguage(this.state.language);
		const { data, initValue, dialog, loading,loadingMsg } = this.state;
		const { currency_list,universal_currency_list, } = this.props;
		const { state } = this.props.location;

		return (
			loading ==true? <Loader loadingMsg={loadingMsg}/> :
		
<div>
			<div className="detail-journal-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="fa fa-diamond" />
												{/* <span className="ml-2">{strings.UpdateJournal}</span> */}
												<span className="ml-2">{initValue.postingReferenceType !== 'MANUAL' ? strings.ViewJournal : strings.UpdateJournal}</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									{dialog}
									{loading ? (
										<Loader />
									) : (
										<Row>
											<Col lg={12}>
												<Formik
													initialValues={initValue}
													ref={this.formRef}
													onSubmit={(values, { resetForm }) => {
														this.handleSubmit(values);
													}}
													validationSchema={Yup.object().shape({
														journalDate: Yup.date().required(
															'Journal date is required',
														),
														journalLineItems: Yup.array()
															.of(
																Yup.object().shape({
																	transactionCategoryId: Yup.string().required(
																		'Account is required',
																	),
																	debitAmount: Yup.string().required('Debit is required'),
																creditAmount: Yup.string().required('Credit is required'),
																}),
															)
															.min(
																2,
																'Atleast Two Journal Debit and Credit Details is mandatory',
															),
													})}
												>
													{(props) => (
														<Form onSubmit={props.handleSubmit}>
															<Row>
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="date">
																			<span className="text-danger">* </span>
																			{strings.JournalDate}
																		</Label>
																		<DatePicker
																			className="form-control"
																			id="journalDate"
																			name="journalDate"
																			placeholderText={strings.JournalDate}
																			disabled={
																				props.values.postingReferenceType ===
																				'MANUAL'
																					? false
																					: true
																			}
																			showMonthDropdown
																			showYearDropdown
																			dateFormat="dd-MM-yyyy"
																			minDate={new Date()}
																			dropdownMode="select"
																			autoComplete="off"
																			value={
																				props.values.journalDate
																					? moment(
																							props.values.journalDate,
																					  ).format('DD-MM-YYYY')
																					: ''
																			}
																			onChange={(value) => {
																				props.handleChange('journalDate')(
																					value,
																				);
																			}}
																		/>
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="journalReferenceNo">
																		{strings.JournalReference}
																		</Label>
																		<Input
																			type="text"
																			id="journalReferenceNo"
																			name="journalReferenceNo"
																			disabled
																			placeholder={strings.ReceiptNumber}
																			value={props.values.journalReferenceNo}
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regExBoth.test(
																						option.target.value,
																					)
																				) {
																					props.handleChange(
																						'journalReferenceNo',
																					)(option);
																				}
																			}}
																		/>
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																<Col lg={8}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="description">{strings.Notes}</Label>
																		<Input
																			type="textarea"
																			name="description"
																			id="description"
																			rows="5"
																			disabled={
																				props.values.postingReferenceType ===
																				'MANUAL'
																					? false
																					: true
																			}
																			placeholder={strings.DeliveryNotes}
																			value={props.values.description}
																			onChange={(value) => {
																				props.handleChange('description')(
																					value,
																				);
																			}}
																		/>
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="currencyCode">
																			 {strings.Currency}
																		</Label>
																		{console.log(currency_list,selectCurrencyFactory
																					.renderOptions(
																						'currencyName',
																						'currencyCode',
																						currency_list,
																						'Currency',
																					)?.[1])}
																		<Select
																			styles={customStyles}
																			className="select-default-width"
																			options={
																				currency_list
																					? selectCurrencyFactory.renderOptions(
																							'currencyName',
																							'currencyCode',
																							currency_list,
																							'Currency',
																					  )
																					: []
																			}
																			id="currencyCode"
																			name="currencyCode"
																			isDisabled={true}
																			value={
																				currency_list &&
																				selectCurrencyFactory
																					.renderOptions(
																						'currencyName',
																						'currencyCode',
																						currency_list,
																						'Currency',
																					)?.[1]
																					
																			}
																			onChange={(option) => {
																				if (option && option.value) {
																					props.handleChange('currencyCode')(
																						option,
																					);
																				} else {
																					props.handleChange('currencyCode')(
																						'',
																					);
																				}
																			}}
																		/>
																	</FormGroup>
																</Col>
															</Row>
															{props.values.postingReferenceType ===
																'MANUAL' && <hr />}
															<Row>
																<Col lg={12} className="mb-3">
																	{props.values.postingReferenceType ===
																		'MANUAL' && (
																		<Button
																			color="primary"
																			className="btn-square mr-3"
																			onClick={this.addRow}
																		>
																			<i className="fa fa-plus"></i> {strings.Addmore}
																		</Button>
																	)}
																</Col>
															</Row>

															{props.errors.journalLineItems &&
																typeof props.errors.journalLineItems ===
																	'string' && (
																	<div
																		className={
																			props.errors.journalLineItems
																				? 'is-invalid'
																				: ''
																		}
																	>
																		<div className="invalid-feedback">
																			<Badge
																				color="danger"
																				style={{
																					padding: '10px',
																					marginBottom: '5px',
																				}}
																			>
																				{props.errors.journalLineItems}
																			</Badge>
																		</div>
																	</div>
																)}
															{this.state.submitJournal &&
																this.state.initValue.totalCreditAmount.toFixed(
																	2,
																) !==
																	this.state.initValue.totalDebitAmount.toFixed(
																		2,
																	) && (
																	<div
																		className={
																			this.state.initValue.totalDebitAmount !==
																			this.state.initValue.totalCreditAmount
																				? 'is-invalid'
																				: ''
																		}
																	>
																		<div className="invalid-feedback">
																			<Badge
																				color="danger"
																				style={{
																					padding: '10px',
																					marginBottom: '5px',
																				}}
																			>
																				*Total Credit Amount and Total Debit
																				Amount Should be Equal
																			</Badge>
																		</div>
																	</div>
																)}

															<Row>
																<Col lg={12}>
																	<BootstrapTable
																		options={this.options}
																		data={data}
																		version="4"
																		hover
																		keyField="id"
																		className="journal-create-table"
																	>
																		<TableHeaderColumn
																			width="55"
																			dataAlign="center"
																			dataFormat={(cell, rows) =>
																				this.renderActions(cell, rows, props)
																			}
																		></TableHeaderColumn>
																		<TableHeaderColumn
																			dataField="transactionCategoryId"
																			width="400"
																			dataFormat={(cell, rows) =>
																				this.renderAccount(cell, rows, props)
																			}
																		>
																			 {strings.ACCOUNT}
																		</TableHeaderColumn>
																		<TableHeaderColumn
																			dataField="description"
																			dataFormat={(cell, rows) =>
																				this.renderDescription(
																					cell,
																					rows,
																					props,
																				)
																			}
																		>
																			{strings.DESCRIPTION}
																		</TableHeaderColumn>
																		<TableHeaderColumn
																			dataField="contactId"
																			dataFormat={(cell, rows) =>
																				this.renderContact(cell, rows, props)
																			}
																		>
																			 {strings.CONTACT}
																		</TableHeaderColumn>
																		<TableHeaderColumn
																			dataField="debitAmount"
																			dataFormat={(cell, rows) =>
																				this.renderDebits(cell, rows, props)
																			}
																		>
																			 {strings.DEBIT}
																		</TableHeaderColumn>
																		<TableHeaderColumn
																			dataField="creditAmount"
																			dataFormat={(cell, rows) =>
																				this.renderCredits(cell, rows, props)
																			}
																		>
																			{strings.CREDIT}
																		</TableHeaderColumn>
																	</BootstrapTable>
																</Col>
															</Row>
															{data.length > 0 ? (
																<Row>
																	<Col lg={4} className="ml-auto">
																		<div className="total-item p-2">
																			<Row>
																				<Col xs={4}></Col>
																				<Col xs={4}>
																					<h5 className="mb-0 text-right">
																						 {strings.Debit}
																					</h5>
																				</Col>
																				<Col xs={4}>
																					<h5 className="mb-0 text-right">
																					     {strings.Credit}
																					</h5>
																				</Col>
																			</Row>
																		</div>
																		<div className="total-item p-2">
																			<Row>
																				<Col xs={4}>
																					<h5 className="mb-0 text-right">
																						   {strings.SubTotal}
																					</h5>
																				</Col>
																				<Col xs={4} className="text-right">
																					<label className="mb-0">
																					{universal_currency_list[0] && (
																						<Currency
																						value={
																							this.state.initValue
																								.subTotalDebitAmount
																						}
																						currencySymbol={
																						universal_currency_list[0]
																						? universal_currency_list[0].currencyIsoCode
																						: 'USD'
																							}
																							/>
																							)}
																					</label>
																				</Col>
																				<Col xs={4} className="text-right">
																					<label className="mb-0">
																					{universal_currency_list[0] && (
																						<Currency
																						value={
																							this.state.initValue
																								.subTotalCreditAmount
																						}
																						currencySymbol={
																						universal_currency_list[0]
																						? universal_currency_list[0].currencyIsoCode
																						: 'USD'
																							}
																							/>
																							)}
																					</label>
																				</Col>
																			</Row>
																		</div>
																		<div className="total-item p-2">
																			<Row>
																				<Col xs={4}>
																					<h5 className="mb-0 text-right">
																						 {strings.Total}
																					</h5>
																				</Col>
																				<Col xs={4} className="text-right">
																					<label className="mb-0">
																					{universal_currency_list[0] && (
																						<Currency
																						value={
																							this.state.initValue
																								.subTotalDebitAmount
																						}
																						currencySymbol={
																						universal_currency_list[0]
																						? universal_currency_list[0].currencyIsoCode
																						: 'USD'
																							}
																							/>
																							)}
																					</label>
																				</Col>
																				<Col xs={4} className="text-right">
																					<label className="mb-0">
																					{universal_currency_list[0] && (
																						<Currency
																						value={
																							this.state.initValue
																								.subTotalCreditAmount
																						}
																						currencySymbol={
																						universal_currency_list[0]
																						? universal_currency_list[0].currencyIsoCode
																						: 'USD'
																							}
																							/>
																							)}
																					</label>
																				</Col>
																			</Row>
																		</div>
																	</Col>
																</Row>
															) : null}
															<Row>
																<Col
																	lg={12}
																	className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
																>
																	<FormGroup>
																		{props.values.postingReferenceType ===
																			'MANUAL' && (
																			<Button
																				type="button"
																				color="danger"
																				className="btn-square"
																						disabled1={this.state.disabled1}
																				disabled={
																					props.values.postingReferenceType ===
																					'MANUAL'
																						? false
																						: true
																				}
																				onClick={this.deleteJournal}
																			>
																				<i className="fa fa-trash"></i>  {this.state.disabled1
																			? 'Deleting...'
																			: strings.Delete }
																			</Button>
																		)}
																	</FormGroup>
																	<FormGroup className="text-right">
																		{props.values.postingReferenceType ===
																			'MANUAL' && (
																			<Button
																				type="button"
																				color="primary"
																				disabled={
																					props.values.postingReferenceType ===
																					'MANUAL'
																						? false
																						: true
																				}
																				className="btn-square mr-3"
																					disabled2={this.state.disabled2}
																				onClick={() => {
																					this.setState(
																						{
																							submitJournal: true,
																						},
																						() => {
																							props.handleSubmit();
																						},
																					);
																				}}
																			>
																				<i className="fa fa-dot-circle-o"></i>{' '}
																				{this.state.disabled2
																			? 'Updating...'
																			: strings.Update }
																			</Button>
																		)}
																		<Button
																			color="secondary"
																			className="btn-square"
																			onClick={() => {
																				this.props.journalActions.setCancelFlag(true);
																				this.props.history.push(
																					'/admin/accountant/journal',
																				);
																				if (state.renderURL) {
																					this.props.history.push(state.renderURL, {
																						id: state.renderId,
																						isCNWithoutProduct: state.renderCN,
																						expenseId: state.renderId,
																					})
																				}
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
				</div>
			</div>
			{this.state.disableLeavePage ?"":<LeavePage/>}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailJournal);
