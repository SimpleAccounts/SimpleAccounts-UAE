package com.simpleaccounts.repository;

import com.simpleaccounts.entity.PasswordHistory;
import com.simpleaccounts.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordHistoryRepository extends JpaRepository<PasswordHistory, Integer> {
    public List<PasswordHistory> findPasswordHistoriesByUser(User user);

}
