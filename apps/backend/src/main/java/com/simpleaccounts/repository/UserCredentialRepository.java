package com.simpleaccounts.repository;

import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserCredentialRepository extends JpaRepository<UserCredential, Integer> {
    public UserCredential findUserCredentialByUser(User user);
}
