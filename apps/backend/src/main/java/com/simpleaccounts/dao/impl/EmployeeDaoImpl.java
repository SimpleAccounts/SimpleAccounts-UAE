package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.EmployeeFilterEnum;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.EmployeeDao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeUserRelation;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.persistence.Query;
import javax.persistence.TypedQuery;

import org.apache.commons.collections4.CollectionUtils;

/**
 * Created by Uday on 26/12/2019.
 */
@Repository(value = "employeeDao")
@RequiredArgsConstructor
public class EmployeeDaoImpl extends AbstractDao<Integer, Employee> implements EmployeeDao {
	private final DatatableSortingFilterConstant dataTableUtil;

	@Override
	public List<DropdownModel> getEmployeesForDropdown() {

		String query = "SELECT e FROM Employee e WHERE e.isActive = true and e.deleteFlag = false";
		TypedQuery<Employee> typedQuery = getEntityManager().createQuery(query, Employee.class);
		List<Employee> employeeList = typedQuery.getResultList();

		List<DropdownModel> dropdownObjectModelList = new ArrayList<>();
		if (employeeList != null && employeeList.size() > 0) {
			for (Employee employee : employeeList) {
				DropdownModel dropdownObjectModel = new DropdownModel(employee.getId(), employee.getFirstName()+" "+employee.getLastName());
				dropdownObjectModelList.add(dropdownObjectModel);
			}
		}
		return dropdownObjectModelList;
		//return getEntityManager().createNamedQuery("employeesForDropdown", DropdownModel.class).getResultList();
	}

	/**
	 *
	 * @return
	 */
	public List<DropdownObjectModel> getEmployeesNotInUserForDropdown() {

		String query = "SELECT e FROM Employee e WHERE e.deleteFlag = false";
		TypedQuery<Employee> typedQuery = getEntityManager().createQuery(query, Employee.class);
		List<Employee> employeeDbList = typedQuery.getResultList();
		String query1 = "SELECT er FROM EmployeeUserRelation er ";
		TypedQuery<EmployeeUserRelation> typedQuery1 = getEntityManager().createQuery(query1, EmployeeUserRelation.class);
		List<EmployeeUserRelation> employeeUserRelationsList1 = typedQuery1.getResultList();

		List<Employee> employeeList = new ArrayList<>();
		for (Employee employee : employeeDbList){
			if(employee.getIsActive()!=null &&  employee.getIsActive() != false){
				employeeList.add(employee);
			}
		}

		for (Employee employee : employeeDbList){
			for(EmployeeUserRelation employeeUserRelation : employeeUserRelationsList1) {

				if (employeeUserRelation.getEmployee().getId()==employee.getId()) {
					employeeList.remove(employee);
				}
			}
		}

		List<DropdownObjectModel> dropdownObjectModelList = new ArrayList<>();
		if (employeeList != null && employeeList.size() > 0) {
			for (Employee employee : employeeList) {
				DropdownObjectModel dropdownObjectModel = new DropdownObjectModel(employee.getId(), employee.getFirstName()+" "+employee.getLastName());
				dropdownObjectModelList.add(dropdownObjectModel);
			}
		}
		return dropdownObjectModelList;
	}

	/**
	 *
	 * @param searchQuery
	 * @param pageNo
	 * @param pageSize
	 * @return
	 */
	@Override
	public List<Employee> getEmployees(String searchQuery, Integer pageNo, Integer pageSize) {
		return getEntityManager().createNamedQuery("employeesByName", Employee.class)
				.setParameter("name", "%" + searchQuery + "%").setMaxResults(pageSize).setFirstResult(pageNo * pageSize)
				.getResultList();
	}

	/**
	 *
	 * @param pageNo
	 * @param pageSize
	 * @return
	 */
	@Override
	public List<Employee> getEmployees(Integer pageNo, Integer pageSize) {
		return getEntityManager().createNamedQuery("allEmployees", Employee.class).setMaxResults(pageSize)
				.setFirstResult(pageNo * pageSize).getResultList();
	}

	/**
	 *
	 * @param email
	 * @return
	 */
	@Override
	public Optional<Employee> getEmployeeByEmail(String email) {
		Query query = getEntityManager().createNamedQuery("employeeByEmail", Employee.class).setParameter("email",email);
		List resultList = query.getResultList();
		if (CollectionUtils.isNotEmpty(resultList) && resultList.size() == 1) {
			return Optional.of((Employee) resultList.get(0));
		}
		return Optional.empty();
	}

	/**
	 *
	 * @param filterMap
	 * @param paginationModel
	 * @return
	 */
	@Override
	public PaginationResponseModel getEmployeeList(Map<EmployeeFilterEnum, Object> filterMap,
			PaginationModel paginationModel) {
		List<DbFilter> dbFilters = new ArrayList<>();
		filterMap.forEach(
				(productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
						.condition(productFilter.getCondition()).value(value).build()));
		paginationModel.setSortingCol(dataTableUtil.getColName(paginationModel.getSortingCol(), DatatableSortingFilterConstant.EMPLOYEE));
		return new PaginationResponseModel(this.getResultCount(dbFilters),
				this.executeQuery(dbFilters, paginationModel));

	}

	/**
	 *
	 * @param ids
	 */
	@Override
	public void deleteByIds(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				Employee employee = findByPK(id);
				employee.setDeleteFlag(Boolean.TRUE);
				update(employee);
			}
		}
	}

}
