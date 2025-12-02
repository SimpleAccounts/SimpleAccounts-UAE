import { SALARY_TEMPLATE } from 'constants/types'
import {
  authApi
} from 'utils'

// export const getSalaryTemplateList = (obj) => {

//   let pageNo = obj.pageNo ? obj.pageNo : '';
//   let pageSize = obj.pageSize ? obj.pageSize : '';
//   let order = obj.order ? obj.order : '';
//   let sortingCol = obj.sortingCol ? obj.sortingCol : '';
//   let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false

//   return (dispatch) => {
//     let data = {
//       method: 'GET',
//       url: `/rest/payroll/salaryTemplateList?&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`
//     }
//     return authApi(data).then((res) => {
//       if(!obj.paginationDisable) {
//         dispatch({
//           type: SALARY_TEMPLATE.TEMPLATE_LIST,
//           payload: res.data
//         })
//       }
//       return res
//     }).catch((err) => {
//       throw err
//     })
//   }
// };

export const getSalaryTemplateList  = (id) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/payroll/getDefaultSalaryTemplates',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};


export const getSalaryStructureForDropdown = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/payroll/getSalaryStructureForDropdown',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
            type: SALARY_TEMPLATE.SALARY_STRUCTURE_DROPDOWN,
						payload: {
							data: res.data,
						},
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getSalaryRolesForDropdown = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/payroll/getSalaryRolesForDropdown',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
            type: SALARY_TEMPLATE.SALARY_ROLE_DROPDOWN,
						payload: {
							data: res.data,
						},
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};