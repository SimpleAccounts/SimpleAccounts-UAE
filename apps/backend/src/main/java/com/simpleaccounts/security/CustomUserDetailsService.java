package com.simpleaccounts.security;

import org.springframework.security.core.userdetails.UserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.simpleaccounts.entity.User;
import com.simpleaccounts.service.UserService;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * The Class UserLoginService
 */
@Component
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService
{
    private final UserService userService;

    //@Transactional(readOnly = true)
   // @Cacheable(cacheNames = "userCache", key = "#emailAddress")
    public CustomUserDetails loadUserByUsername(String emailAddress)
            throws UsernameNotFoundException {
        Optional<User> user = userService.getUserByEmail(emailAddress);

        if (user.isPresent()) {
            User singleUser = user.get();
            if(singleUser.getUserTimezone()!=null)
            			System.setProperty("simpleaccounts.user.timezone",singleUser.getUserTimezone());            return new CustomUserDetails(singleUser);
        } else {
            throw new UsernameNotFoundException("Email not found");
        }
    }

}