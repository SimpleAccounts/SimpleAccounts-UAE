package com.simplevat.security;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.simplevat.entity.User;
import com.simplevat.service.UserService;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * The Class UserLoginService
 */
@Component
public class CustomUserDetailsService implements UserDetailsService
{
    @Autowired
    private UserService userService;

    //@Transactional(readOnly = true)
   // @Cacheable(cacheNames = "userCache", key = "#emailAddress")
    public CustomUserDetails loadUserByUsername(String emailAddress)
            throws UsernameNotFoundException {
        Optional<User> user = userService.getUserByEmail(emailAddress);

        if (user.isPresent()) {
            User singleUser = user.get();
            if(singleUser.getUserTimezone()!=null)
            System.setProperty("simplevat.user.timezone",singleUser.getUserTimezone());
            return new CustomUserDetails(singleUser);
        } else {
            throw new UsernameNotFoundException("Email not found");
        }
    }

}