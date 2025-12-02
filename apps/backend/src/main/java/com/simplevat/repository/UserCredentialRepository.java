package com.simplevat.repository;

import com.simplevat.entity.User;
import com.simplevat.entity.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserCredentialRepository extends JpaRepository<UserCredential, Integer> {
    public UserCredential findUserCredentialByUser(User user);
}
