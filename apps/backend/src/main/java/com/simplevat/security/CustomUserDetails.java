/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.security;

import com.simplevat.entity.Role;
import com.simplevat.entity.User;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 *
 * @author Sonu
 */
public class CustomUserDetails implements UserDetails {

    private Integer userId;
    private String username;
    private String password;
    private Role role;

    public CustomUserDetails() {
    }

    public CustomUserDetails(User user) {
        this.userId = user.getUserId();
        this.username = user.getUserEmail();
        this.password = user.getPassword();
        this.role = user.getRole();
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    @Override
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleString = "ROLE_EMPLOYEE";
        if (role.getRoleName().equalsIgnoreCase("ADMIN")) {
            roleString = "ROLE_ADMIN";
        }
        return new ArrayList<>(Collections.singletonList(new SimpleGrantedAuthority(roleString)));
    }

}
