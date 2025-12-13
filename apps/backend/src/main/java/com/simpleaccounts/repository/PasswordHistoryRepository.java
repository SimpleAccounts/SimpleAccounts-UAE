package com.simpleaccounts.repository;

import com.simpleaccounts.entity.PasswordHistory;
import com.simpleaccounts.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PasswordHistoryRepository extends JpaRepository<PasswordHistory, Integer> {
    public List<PasswordHistory> findPasswordHistoriesByUser(User user);

}
