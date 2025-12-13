package com.simpleaccounts.repository;

import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.payroll.UserDto;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserJpaRepository extends JpaRepository<User, Integer> {

	@Query("SELECT u from User u "
			+ "INNER JOIN u.role r WHERE r.roleCode= :roleCode")
	List<User> findAllUserByRole(@Param("roleCode") Integer roleCode);

	@Query("SELECT new com.simpleaccounts.rest.payroll.UserDto(u.userId,concat(u.firstName,' ',u.lastName)) FROM User u INNER JOIN u.role r WHERE r.roleName IN (:roleName) and u.isActive=true")
	public List<UserDto> findApprovedUser(@Param("roleName") List<String> roleName);

	List<User> findUsersByForgotPasswordToken(String token);
}
