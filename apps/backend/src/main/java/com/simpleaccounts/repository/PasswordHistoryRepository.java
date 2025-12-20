package com.simpleaccounts.repository;

import com.simpleaccounts.entity.PasswordHistory;
import com.simpleaccounts.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PasswordHistoryRepository extends JpaRepository<PasswordHistory, Integer> {
    public List<PasswordHistory> findPasswordHistoriesByUser(User user);
    
    // Custom query using userId instead of User entity to avoid entity detachment issues
    @Query("SELECT ph FROM PasswordHistory ph WHERE ph.user.userId = :userId")
    public List<PasswordHistory> findPasswordHistoriesByUserId(@Param("userId") Integer userId);
    
    // Native query to insert PasswordHistory without loading the User entity
    // Note: @Modifying queries require a transaction, but we rely on the calling method's transaction
    @Modifying
    @Query(value = "INSERT INTO PASSWORD_HISTORY (CREATED_BY, CREATED_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE, USER_ID, USER_PASSWORD, IS_ACTIVE, DELETE_FLAG, VERSION_NUMBER) " +
                   "VALUES (:createdBy, :createdDate, :lastUpdatedBy, :lastUpdateDate, :userId, :password, :isActive, false, 1)", 
           nativeQuery = true)
    public int insertPasswordHistory(@Param("createdBy") Integer createdBy,
                                     @Param("createdDate") java.time.LocalDateTime createdDate,
                                     @Param("lastUpdatedBy") Integer lastUpdatedBy,
                                     @Param("lastUpdateDate") java.time.LocalDateTime lastUpdateDate,
                                     @Param("userId") Integer userId,
                                     @Param("password") String password,
                                     @Param("isActive") Boolean isActive);

}
