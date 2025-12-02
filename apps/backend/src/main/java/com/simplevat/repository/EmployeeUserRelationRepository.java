package com.simplevat.repository;

import com.simplevat.entity.EmployeeUserRelation;
import com.simplevat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeUserRelationRepository extends JpaRepository<EmployeeUserRelation,Integer> {
    List<EmployeeUserRelation> findByUser(User user);
}