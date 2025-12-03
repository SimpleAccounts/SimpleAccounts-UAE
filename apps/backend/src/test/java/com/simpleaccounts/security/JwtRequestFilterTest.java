package com.simpleaccounts.security;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import javax.servlet.FilterChain;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.security.core.context.SecurityContextHolder;

import io.jsonwebtoken.ExpiredJwtException;
import com.simpleaccounts.entity.Role;

/**
 * Tests for JWT Request Filter.
 * These tests verify the filter chain works correctly before/after JJWT upgrades.
 *
 * Covers: JJWT library upgrade, Spring Security filter chain
 */
@RunWith(MockitoJUnitRunner.class)
public class JwtRequestFilterTest {

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @InjectMocks
    private JwtRequestFilter jwtRequestFilter;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @Before
    public void setUp() {
        SecurityContextHolder.clearContext();
    }

    private CustomUserDetails createTestUserDetails(String username, String password) {
        CustomUserDetails userDetails = new CustomUserDetails();
        userDetails.setUsername(username);
        userDetails.setPassword(password);
        // Set role to avoid NPE in getAuthorities()
        Role role = new Role();
        role.setRoleName("EMPLOYEE");
        userDetails.setRole(role);
        return userDetails;
    }

    @Test
    public void testValidTokenAuthentication() throws Exception {
        // Arrange
        String validToken = "valid.jwt.token";
        String username = "testuser";
        CustomUserDetails userDetails = createTestUserDetails(username, "password");

        when(request.getHeader("Authorization")).thenReturn("Bearer " + validToken);
        when(jwtTokenUtil.getUsernameFromToken(validToken)).thenReturn(username);
        when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);
        when(jwtTokenUtil.validateToken(validToken, userDetails)).thenReturn(true);

        // Act
        jwtRequestFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        verify(jwtTokenUtil).getUsernameFromToken(validToken);
        verify(jwtTokenUtil).validateToken(validToken, userDetails);
    }

    @Test
    public void testNoAuthorizationHeader() throws Exception {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(null);

        // Act
        jwtRequestFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        verify(jwtTokenUtil, never()).getUsernameFromToken(anyString());
        assertNull("Security context should be empty",
            SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    public void testInvalidTokenFormat() throws Exception {
        // Arrange - Token without "Bearer " prefix
        when(request.getHeader("Authorization")).thenReturn("InvalidToken");

        // Act
        jwtRequestFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        verify(jwtTokenUtil, never()).getUsernameFromToken(anyString());
    }

    @Test
    public void testExpiredToken() throws Exception {
        // Arrange
        String expiredToken = "expired.jwt.token";
        when(request.getHeader("Authorization")).thenReturn("Bearer " + expiredToken);
        when(jwtTokenUtil.getUsernameFromToken(expiredToken))
            .thenThrow(new ExpiredJwtException(null, null, "Token expired"));

        // Act
        jwtRequestFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        assertNull("Security context should be empty for expired token",
            SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    public void testMalformedToken() throws Exception {
        // Arrange
        String malformedToken = "malformed.token";
        when(request.getHeader("Authorization")).thenReturn("Bearer " + malformedToken);
        when(jwtTokenUtil.getUsernameFromToken(malformedToken))
            .thenThrow(new IllegalArgumentException("Invalid token"));

        // Act
        jwtRequestFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        assertNull("Security context should be empty for malformed token",
            SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    public void testTokenValidationFails() throws Exception {
        // Arrange
        String validToken = "valid.jwt.token";
        String username = "testuser";
        CustomUserDetails userDetails = createTestUserDetails(username, "password");

        when(request.getHeader("Authorization")).thenReturn("Bearer " + validToken);
        when(jwtTokenUtil.getUsernameFromToken(validToken)).thenReturn(username);
        when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);
        when(jwtTokenUtil.validateToken(validToken, userDetails)).thenReturn(false);

        // Act
        jwtRequestFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
        // Authentication should not be set when validation fails
    }
}
