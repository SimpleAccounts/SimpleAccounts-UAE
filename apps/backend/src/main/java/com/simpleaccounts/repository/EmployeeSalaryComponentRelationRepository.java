package com.simpleaccounts.repository;

import com.simpleaccounts.entity.EmployeeSalaryComponentRelation;
import com.simpleaccounts.entity.SalaryComponent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeSalaryComponentRelationRepository extends JpaRepository<EmployeeSalaryComponentRelation,Integer> {

	@Query(value="select * from employee_salary_component_relation escr where escr.EMPLOYEE_ID =:empId", nativeQuery=true)
	List<EmployeeSalaryComponentRelation> findByemployeeId(Integer empId);

	List<EmployeeSalaryComponentRelation> findBySalaryComponentId(SalaryComponent SalaryComponentId);

	@Query(value="select * from employee_salary_component_relation escr where escr.SALARY_COMPONENT_ID =:salaryComponentId AND escr.delete_Flag = false", nativeQuery=true)
	List<EmployeeSalaryComponentRelation> findBySalaryComponentIdAndDeleteFlag(Integer salaryComponentId);
}
