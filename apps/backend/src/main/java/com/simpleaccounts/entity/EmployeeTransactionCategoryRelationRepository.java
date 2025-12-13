package com.simpleaccounts.entity;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EmployeeTransactionCategoryRelationRepository extends JpaRepository<EmployeeTransactionCategoryRelation, Integer> {
    @Query(value="select etc.transaction_category_id from employee_transaction_category_relation etc where etc.employee_id=:employeeId and delete_flag=false ", nativeQuery=true)
    List<Integer> getAllTransactionCategoryByEmployeeId(@Param("employeeId")Integer employeeId);
}