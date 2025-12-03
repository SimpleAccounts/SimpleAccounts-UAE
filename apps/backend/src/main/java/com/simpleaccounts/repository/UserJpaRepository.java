package com.simpleaccounts.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.simpleaccounts.entity.Payroll;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.payroll.UserDto;

@Repository
public interface UserJpaRepository extends JpaRepository<User, Integer> {

	//All crud operation method pre-defined like save/update, delete, findAll, findById etc.

	//Custome query can be write like below

	@Query("SELECT u from User u "
			+ "INNER JOIN u.role r WHERE r.roleCode= :roleCode")
	List<User> findAllUserByRole(@Param("roleCode") Integer roleCode);
	
	//@Query("SELECT new com.simpleaccounts.rest.payroll.UserDto(u.userId,concat(u.firstName,' ',u.lastName)) FROM User u INNER JOIN u.role r WHERE r.roleName = :roleName")
	//public List<UserDto> findApprovedUser(@Param("roleName")String roleName);

	@Query("SELECT new com.simpleaccounts.rest.payroll.UserDto(u.userId,concat(u.firstName,' ',u.lastName)) FROM User u INNER JOIN u.role r WHERE r.roleName IN (:roleName) and u.isActive=true")
	public List<UserDto> findApprovedUser(@Param("roleName") List<String> roleName);

	List<User> findUsersByForgotPasswordToken(String token);
}
