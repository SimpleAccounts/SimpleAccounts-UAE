package com.simplevat.repository;

import com.simplevat.entity.Payroll;
import com.simplevat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {

	Payroll findById(Integer id);
	void deleteById(Integer id);
	@Query(value = "SELECT * FROM payroll order by PAYROLL_ID DESC", nativeQuery=true)
	List<Payroll> findAll();

	@Query(value = "SELECT * FROM Payroll p WHERE  p.PAYROLL_DATE BETWEEN :startDate and :endDate order by p.PAYROLL_DATE desc", nativeQuery=true)
	List<Payroll> findAllByPayrollDate(@Param("startDate") LocalDateTime startDate,@Param("endDate") LocalDateTime endDate);

	@Query(value="SELECT i.* FROM payroll i WHERE i.generated_by =:generatedBy OR i.payroll_approver =:userId and i.delete_flag = false", nativeQuery=true)
	List<Payroll> getPayrollCountByUserId(@Param("generatedBy")String generatedBy,@Param("userId")Integer userId );

}
