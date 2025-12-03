import {
    authApi
  } from 'utils'


  export const getEmployeeById = (_id) => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/employee/getById?id=${_id}`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }

  export const getSalarySlipList = (_id) => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/Salary/getSalarySlipList?id=${_id}`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }

  export const getSalaryComponentByEmployeeId = (_id) => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/payroll/getSalaryComponentByEmployeeId?id=${_id}`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }

  export const getSalarySlip = (obj) => {
	return (dispatch) => {
		let id=obj.id;
		let salaryDate=obj.salaryDate;
	  let data = {
		method: 'GET',
		// url: `/rest/Salary/getSalariesByEmployeeId?id=${id}&salaryDate=${salaryDate}`
		url: `/rest/Salary/getSalariesByEmployeeId?id=${id}&salaryDate=${salaryDate}`
		
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }
    
//   export const getSalarySlip= (obj) => {
// 	return (dispatch) => {
// 	  let data = {
// 		method: 'GET',
// 		url: '/rest/Salary/getSalariesByEmployeeId',
// 		data: obj
// 	  }
// 	  return authApi(data).then((res) => {
// 		return res
// 	  }).catch((err) => {
// 		throw err
// 	  })
// 	}
//   }
