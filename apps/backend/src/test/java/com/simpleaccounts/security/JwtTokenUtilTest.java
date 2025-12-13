package com.simpleaccounts.security;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;

import com.simpleaccounts.service.UserService;
import java.util.ArrayList;
import java.util.Date;
import org.junit.Before;
import org.junit.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

public class JwtTokenUtilTest {

    private JwtTokenUtil jwtTokenUtil;
    private String secret = "mySecretKeyForTestingOnly1234567890";
    private UserService userService;

    @Before
    public void setUp() {
        userService = mock(UserService.class);
        jwtTokenUtil = new JwtTokenUtil(userService);
        // Inject the secret value manually
        ReflectionTestUtils.setField(jwtTokenUtil, "secret", secret);
    }

    @Test
    public void testGenerateAndValidateToken() {
        // Create a dummy user
        UserDetails userDetails = new User("testuser", "password", new ArrayList<>());

        // Generate token
        String token = jwtTokenUtil.generateToken(userDetails);
        assertNotNull("Token should not be null", token);

        // Validate token
        String username = jwtTokenUtil.getUsernameFromToken(token);
        assertEquals("Username should match", "testuser", username);

        Boolean isValid = jwtTokenUtil.validateToken(token, userDetails);
        assertTrue("Token should be valid", isValid);
    }

    @Test
    public void testExpiration() {
        UserDetails userDetails = new User("testuser", "password", new ArrayList<>());
        String token = jwtTokenUtil.generateToken(userDetails);
        
        Date expiration = jwtTokenUtil.getExpirationDateFromToken(token);
        assertNotNull(expiration);
        assertTrue("Expiration should be in the future", expiration.after(new Date()));
    }
}
