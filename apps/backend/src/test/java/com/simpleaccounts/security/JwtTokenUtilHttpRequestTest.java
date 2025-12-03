package com.simpleaccounts.security;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.User;
import com.simpleaccounts.service.UserService;
import io.jsonwebtoken.JwtException;
import java.util.ArrayList;
import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import org.junit.Before;
import org.junit.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

public class JwtTokenUtilHttpRequestTest {

    private JwtTokenUtil jwtTokenUtil;
    private UserService userService;
    private HttpServletRequest request;

    @Before
    public void setUp() {
        jwtTokenUtil = new JwtTokenUtil();
        userService = mock(UserService.class);
        request = mock(HttpServletRequest.class);

        ReflectionTestUtils.setField(jwtTokenUtil, "secret",
            "super-secret-key-for-tests-12345678901234567890");
        ReflectionTestUtils.setField(jwtTokenUtil, "userServiceNew", userService);
    }

    @Test
    public void testGetUserIdFromHttpRequestReturnsUserId() {
        String username = "user@example.com";
        UserDetails springUser = new org.springframework.security.core.userdetails.User(
            username, "password", new ArrayList<>());

        String token = jwtTokenUtil.generateToken(springUser);
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);

        User dbUser = new User();
        dbUser.setUserId(101);
        dbUser.setUserEmail(username);

        when(userService.getUserByEmail(username)).thenReturn(Optional.of(dbUser));

        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

        assertEquals(Integer.valueOf(101), userId);
    }

    @Test(expected = JwtException.class)
    public void testMissingAuthorizationHeaderThrowsJwtException() {
        when(request.getHeader("Authorization")).thenReturn(null);
        jwtTokenUtil.getUserIdFromHttpRequest(request);
    }
}

