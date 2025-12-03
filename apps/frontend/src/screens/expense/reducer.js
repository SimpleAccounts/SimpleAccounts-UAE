import { EXPENSE } from 'constants/types';

const initState = {
	expense_list: [],
	expense_detail: {},
	currency_list: [],
	supplier_list: [],
	project_list: [],
	employee_list: [],
	expense_categories_list: [],
	vat_list: [],
	bank_list: [],
	pay_mode_list: [],
	pay_to_list:[],
};

const ExpenseReducer = (state = initState, action) => {
	const { type, payload } = action;
	switch (type) {
		case EXPENSE.EXPENSE_LIST:
			return {
				...state,
				expense_list: Object.assign([], payload),
			};

		case EXPENSE.EXPENSE_DETAIL:
			return {
				...state,
				expense_detail: Object.assign({}, payload),
			};

		case EXPENSE.BANK_LIST:
			return {
				...state,
				bank_list: Object.assign([], payload.data),
			};

		case EXPENSE.CURRENCY_LIST:
			// const currency_list = payload.map(currency => {
			//   return { label: currency.currencyName, value: currency.currencyCode }
			// })

			return {
				...state,
				currency_list: Object.assign([], payload.data),
			};

		case EXPENSE.PROJECT_LIST:
			//   const project_list = payload.map(project => {
			//     return { label: project.projectName, value: project.projectId }
			//   })

			return {
				...state,
				project_list: Object.assign([], payload),
			};

		case EXPENSE.SUPPLIER_LIST:
			//   const supplier_list = payload.map(supplier => {
			//     return { label: supplier.firstName, value: supplier.contactId }
			//   })

			return {
				...state,
				supplier_list: Object.assign([], payload),
			};

		case EXPENSE.EMPLOYEE_LIST:
			//   const bank_account_list = payload.map(bank_account => {
			//     return { label: bank_account.bankAccountId, value: bank_account.bankAccountName }
			//   })

			return {
				...state,
				employee_list: Object.assign([], payload),
			};

		case EXPENSE.PAYMENT_LIST:
			//   const payment_list = payload.map(payment => {
			//     return { label: payment.amount, value: payment.paymentID }
			//   })

			return {
				...state,
				payment_list: Object.assign([], payload),
			};

		case EXPENSE.VAT_LIST:
			// const vat_list = payload.data.map(vat => {
			//   return { label: vat.name, value: vat.id }
			// })

			return {
				...state,
				vat_list: Object.assign([], payload.data),
			};

		case EXPENSE.EXPENSE_CATEGORIES_LIST:
			//   const chart_of_account_list = payload.map((item) => {
			//     return { label: item.transactionCategoryDescription, value: item.transactionCategoryId }
			//   })

			return {
				...state,
				expense_categories_list: Object.assign([], payload),
			};

		case EXPENSE.PAY_MODE:
			let list1=payload;		
			if(list1 &&
			   list1.length &&
			   list1.length>0)	
			   list1=list1.map((data,index)=>{
					if(index==0)
				      data.label="Petty Cash"
					  return data;
			    })
			return {
				...state,
				pay_mode_list: Object.assign([], list1),
			};

		case EXPENSE.USER_LIST:
			
			if(payload && payload[0] && payload[0].label){
				let obj=new Object({label: "Company Expense",value: "Company Expense"});
	     	    payload.unshift(obj);
			}
					
			return {
				...state,
				user_list: Object.assign([],payload),
			};
			case EXPENSE.PAY_TO_LIST:		
				let list=payload;
				list.unshift({value: "Company Expense",label: "Company Expense" })
			return {
				...state,
				pay_to_list: Object.assign([], list),
			};

		default:
			return state;
	}
};
export default ExpenseReducer;
