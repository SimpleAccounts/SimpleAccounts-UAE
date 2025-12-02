package com.simplevat.repository;

import com.simplevat.entity.PasswordHistory;
import com.simplevat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PasswordHistoryRepository extends JpaRepository<PasswordHistory, Integer> {
    public List<PasswordHistory> findPasswordHistoriesByUser(User user);

}
