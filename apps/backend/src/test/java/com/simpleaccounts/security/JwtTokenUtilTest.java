package com.simpleaccounts.security;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.Optional;

import com.simpleaccounts.entity.User;
import com.simpleaccounts.service.UserService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import javax.servlet.http.HttpServletRequest;

@ExtendWith(MockitoExtension.class)
class JwtTokenUtilTest {

    private JwtTokenUtil jwtTokenUtil;
    private static final String SECRET = "mySecretKeyForTestingOnly1234567890";

    @Mock
    private UserService userService;

    @Mock
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        jwtTokenUtil = new JwtTokenUtil(userService);
        ReflectionTestUtils.setField(jwtTokenUtil, "secret", SECRET);
    }

    // ========== Token Generation Tests ==========

    @Test
    void shouldGenerateValidToken() {
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            "testuser@example.com", "password", new ArrayList<>());

        String token = jwtTokenUtil.generateToken(userDetails);

        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts
    }

    @Test
    void shouldGenerateTokenWithCorrectUsername() {
        String expectedUsername = "user@test.com";
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            expectedUsername, "password", new ArrayList<>());

        String token = jwtTokenUtil.generateToken(userDetails);
        String extractedUsername = jwtTokenUtil.getUsernameFromToken(token);

        assertEquals(expectedUsername, extractedUsername);
    }

    @Test
    void shouldGenerateDifferentTokensForDifferentUsers() {
        UserDetails user1 = new org.springframework.security.core.userdetails.User(
            "user1@test.com", "password", new ArrayList<>());
        UserDetails user2 = new org.springframework.security.core.userdetails.User(
            "user2@test.com", "password", new ArrayList<>());

        String token1 = jwtTokenUtil.generateToken(user1);
        String token2 = jwtTokenUtil.generateToken(user2);

        assertNotEquals(token1, token2);
    }

    // ========== Token Validation Tests ==========

    @Test
    void shouldValidateCorrectToken() {
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            "testuser@example.com", "password", new ArrayList<>());
        String token = jwtTokenUtil.generateToken(userDetails);

        Boolean isValid = jwtTokenUtil.validateToken(token, userDetails);

        assertTrue(isValid);
    }

    @Test
    void shouldInvalidateTokenForDifferentUser() {
        UserDetails tokenUser = new org.springframework.security.core.userdetails.User(
            "user1@test.com", "password", new ArrayList<>());
        UserDetails differentUser = new org.springframework.security.core.userdetails.User(
            "user2@test.com", "password", new ArrayList<>());

        String token = jwtTokenUtil.generateToken(tokenUser);
        Boolean isValid = jwtTokenUtil.validateToken(token, differentUser);

        assertFalse(isValid);
    }

    // ========== Token Expiration Tests ==========

    @Test
    void shouldHaveExpirationDateInFuture() {
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            "testuser@example.com", "password", new ArrayList<>());
        String token = jwtTokenUtil.generateToken(userDetails);

        Date expiration = jwtTokenUtil.getExpirationDateFromToken(token);

        assertNotNull(expiration);
        assertTrue(expiration.after(new Date()));
    }

    @Test
    void shouldHaveIssuedAtDateBeforeExpiration() {
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            "testuser@example.com", "password", new ArrayList<>());
        String token = jwtTokenUtil.generateToken(userDetails);

        Date issuedAt = jwtTokenUtil.getIssuedAtDateFromToken(token);
        Date expiration = jwtTokenUtil.getExpirationDateFromToken(token);

        assertNotNull(issuedAt);
        assertTrue(issuedAt.before(expiration));
    }

    @Test
    void shouldReturnTrueWhenTokenCanBeRefreshed() {
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            "testuser@example.com", "password", new ArrayList<>());
        String token = jwtTokenUtil.generateToken(userDetails);

        Boolean canRefresh = jwtTokenUtil.canTokenBeRefreshed(token);

        assertTrue(canRefresh);
    }

    // ========== Claims Extraction Tests ==========

    @Test
    void shouldExtractUsernameFromToken() {
        String expectedUsername = "test.user@example.com";
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            expectedUsername, "password", new ArrayList<>());
        String token = jwtTokenUtil.generateToken(userDetails);

        String username = jwtTokenUtil.getUsernameFromToken(token);

        assertEquals(expectedUsername, username);
    }

    @Test
    void shouldExtractClaimsUsingCustomResolver() {
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            "testuser@example.com", "password", new ArrayList<>());
        String token = jwtTokenUtil.generateToken(userDetails);

        String subject = jwtTokenUtil.getClaimFromToken(token, claims -> claims.getSubject());

        assertEquals("testuser@example.com", subject);
    }

    // ========== Error Handling Tests ==========

    @Test
    void shouldThrowExceptionForMalformedToken() {
        String malformedToken = "this.is.not.a.valid.token";

        assertThrows(MalformedJwtException.class, () -> {
            jwtTokenUtil.getUsernameFromToken(malformedToken);
        });
    }

    @Test
    void shouldThrowExceptionForInvalidSignature() {
        // Create a token with different secret
        JwtTokenUtil differentKeyUtil = new JwtTokenUtil(userService);
        ReflectionTestUtils.setField(differentKeyUtil, "secret", "differentSecretKey12345678901234567890");

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            "testuser@example.com", "password", new ArrayList<>());
        String tokenWithDifferentKey = differentKeyUtil.generateToken(userDetails);

        assertThrows(SignatureException.class, () -> {
            jwtTokenUtil.getUsernameFromToken(tokenWithDifferentKey);
        });
    }

    @Test
    void shouldThrowExceptionForEmptyToken() {
        assertThrows(IllegalArgumentException.class, () -> {
            jwtTokenUtil.getUsernameFromToken("");
        });
    }

    // ========== getUserIdFromHttpRequest Tests ==========

    @Test
    void shouldGetUserIdFromValidRequest() {
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            "user@test.com", "password", new ArrayList<>());
        String token = jwtTokenUtil.generateToken(userDetails);

        User user = new User();
        user.setUserId(123);
        user.setUserEmail("user@test.com");

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(userService.getUserByEmail("user@test.com")).thenReturn(Optional.of(user));

        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

        assertEquals(123, userId);
        verify(userService).getUserByEmail("user@test.com");
    }

    @Test
    void shouldReturnNullWhenUserNotFound() {
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            "nonexistent@test.com", "password", new ArrayList<>());
        String token = jwtTokenUtil.generateToken(userDetails);

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(userService.getUserByEmail("nonexistent@test.com")).thenReturn(Optional.empty());

        Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

        assertNull(userId);
    }

    @Test
    void shouldThrowExceptionWhenNoAuthorizationHeader() {
        when(request.getHeader("Authorization")).thenReturn(null);

        assertThrows(io.jsonwebtoken.JwtException.class, () -> {
            jwtTokenUtil.getUserIdFromHttpRequest(request);
        });
    }

    @Test
    void shouldThrowExceptionWhenInvalidAuthorizationFormat() {
        when(request.getHeader("Authorization")).thenReturn("InvalidFormat token123");

        assertThrows(io.jsonwebtoken.JwtException.class, () -> {
            jwtTokenUtil.getUserIdFromHttpRequest(request);
        });
    }

    @Test
    void shouldThrowExceptionWhenMissingBearerPrefix() {
        when(request.getHeader("Authorization")).thenReturn("token123");

        assertThrows(io.jsonwebtoken.JwtException.class, () -> {
            jwtTokenUtil.getUserIdFromHttpRequest(request);
        });
    }

    // ========== Token Validity Constant Tests ==========

    @Test
    void shouldHaveCorrectTokenValidityPeriod() {
        // JWT_TOKEN_VALIDITY should be 5 hours in seconds
        assertEquals(5L * 60 * 60, JwtTokenUtil.JWT_TOKEN_VALIDITY);
    }

    // ========== Edge Cases ==========

    @Test
    void shouldHandleSpecialCharactersInUsername() {
        String specialUsername = "user+tag@sub.domain.com";
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            specialUsername, "password", new ArrayList<>());
        String token = jwtTokenUtil.generateToken(userDetails);

        String extractedUsername = jwtTokenUtil.getUsernameFromToken(token);

        assertEquals(specialUsername, extractedUsername);
    }

    @Test
    void shouldHandleUnicodeInUsername() {
        String unicodeUsername = "usuario@例え.日本";
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            unicodeUsername, "password", new ArrayList<>());
        String token = jwtTokenUtil.generateToken(userDetails);

        String extractedUsername = jwtTokenUtil.getUsernameFromToken(token);

        assertEquals(unicodeUsername, extractedUsername);
    }

    @Test
    void shouldGenerateConsistentTokenFormat() {
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            "testuser@example.com", "password", new ArrayList<>());
        String token = jwtTokenUtil.generateToken(userDetails);

        // JWT should have 3 base64 encoded parts separated by dots
        String[] parts = token.split("\\.");
        assertEquals(3, parts.length);
        for (String part : parts) {
            assertTrue(part.length() > 0);
        }
    }
}
