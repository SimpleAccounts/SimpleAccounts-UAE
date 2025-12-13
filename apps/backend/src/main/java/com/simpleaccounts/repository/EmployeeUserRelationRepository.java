package com.simpleaccounts.repository;

import com.simpleaccounts.entity.EmployeeUserRelation;
import com.simpleaccounts.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeUserRelationRepository extends JpaRepository<EmployeeUserRelation,Integer> {
    List<EmployeeUserRelation> findByUser(User user);
}