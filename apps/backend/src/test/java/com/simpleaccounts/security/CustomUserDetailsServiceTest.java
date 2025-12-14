package com.simpleaccounts.security;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

/**
 * Unit tests for CustomUserDetailsService.
 * Tests user loading and authentication details.
 */
@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    private User testUser;
    private Role testRole;

    @BeforeEach
    void setUp() {
        testRole = new Role();
        testRole.setRoleCode(1);
        testRole.setRoleName("ADMIN");

        testUser = new User();
        testUser.setUserId(1);
        testUser.setUserEmail("test@example.com");
        testUser.setPassword("encodedPassword123");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setRole(testRole);
        testUser.setIsActive(true);
        testUser.setDeleteFlag(false);
    }

    // ========== Successful User Load Tests ==========

    @Test
    void shouldLoadUserByUsername() {
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        CustomUserDetails result = customUserDetailsService.loadUserByUsername("test@example.com");

        assertNotNull(result);
        assertEquals("test@example.com", result.getUsername());
        verify(userService).getUserByEmail("test@example.com");
    }

    @Test
    void shouldLoadUserWithCorrectPassword() {
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        CustomUserDetails result = customUserDetailsService.loadUserByUsername("test@example.com");

        assertEquals("encodedPassword123", result.getPassword());
    }

    @Test
    void shouldLoadUserWithCorrectUserId() {
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        CustomUserDetails result = customUserDetailsService.loadUserByUsername("test@example.com");

        assertEquals(1, result.getUserId());
    }

    @Test
    void shouldLoadUserWithCorrectRole() {
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        CustomUserDetails result = customUserDetailsService.loadUserByUsername("test@example.com");

        assertNotNull(result.getRole());
        assertEquals("ADMIN", result.getRole().getRoleName());
    }

    // ========== User Not Found Tests ==========

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        when(userService.getUserByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            customUserDetailsService.loadUserByUsername("nonexistent@example.com");
        });
    }

    @Test
    void shouldThrowExceptionWithCorrectMessage() {
        when(userService.getUserByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        UsernameNotFoundException exception = assertThrows(UsernameNotFoundException.class, () -> {
            customUserDetailsService.loadUserByUsername("nonexistent@example.com");
        });

        assertEquals("Email not found", exception.getMessage());
    }

    // ========== Role-based Authority Tests ==========

    @Test
    void shouldReturnAdminAuthorityForAdminRole() {
        testRole.setRoleName("ADMIN");
        when(userService.getUserByEmail("admin@example.com")).thenReturn(Optional.of(testUser));

        CustomUserDetails result = customUserDetailsService.loadUserByUsername("admin@example.com");

        assertTrue(result.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")));
    }

    @Test
    void shouldReturnEmployeeAuthorityForEmployeeRole() {
        testRole.setRoleName("EMPLOYEE");
        when(userService.getUserByEmail("employee@example.com")).thenReturn(Optional.of(testUser));

        CustomUserDetails result = customUserDetailsService.loadUserByUsername("employee@example.com");

        assertTrue(result.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_EMPLOYEE")));
    }

    @Test
    void shouldReturnEmployeeAuthorityForNonAdminRole() {
        testRole.setRoleName("USER");
        when(userService.getUserByEmail("user@example.com")).thenReturn(Optional.of(testUser));

        CustomUserDetails result = customUserDetailsService.loadUserByUsername("user@example.com");

        assertTrue(result.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_EMPLOYEE")));
    }

    // ========== User Account Status Tests ==========

    @Test
    void shouldReturnActiveAccountStatus() {
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        CustomUserDetails result = customUserDetailsService.loadUserByUsername("test@example.com");

        assertTrue(result.isEnabled());
        assertTrue(result.isAccountNonExpired());
        assertTrue(result.isAccountNonLocked());
        assertTrue(result.isCredentialsNonExpired());
    }

    // ========== User with Timezone Tests ==========

    @Test
    void shouldSetTimezoneSystemPropertyWhenUserHasTimezone() {
        testUser.setUserTimezone("America/New_York");
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        customUserDetailsService.loadUserByUsername("test@example.com");

        assertEquals("America/New_York", System.getProperty("simpleaccounts.user.timezone"));
    }

    @Test
    void shouldNotSetTimezoneWhenUserHasNoTimezone() {
        testUser.setUserTimezone(null);
        String originalTimezone = System.getProperty("simpleaccounts.user.timezone");
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        customUserDetailsService.loadUserByUsername("test@example.com");

        // Timezone should remain unchanged
        assertEquals(originalTimezone, System.getProperty("simpleaccounts.user.timezone"));
    }

    // ========== Edge Cases ==========

    @Test
    void shouldHandleEmailWithSpecialCharacters() {
        String specialEmail = "test+tag@sub.domain.example.com";
        testUser.setUserEmail(specialEmail);
        when(userService.getUserByEmail(specialEmail)).thenReturn(Optional.of(testUser));

        CustomUserDetails result = customUserDetailsService.loadUserByUsername(specialEmail);

        assertEquals(specialEmail, result.getUsername());
    }

    @Test
    void shouldHandleEmailCaseInsensitiveSearch() {
        when(userService.getUserByEmail("TEST@EXAMPLE.COM")).thenReturn(Optional.of(testUser));

        CustomUserDetails result = customUserDetailsService.loadUserByUsername("TEST@EXAMPLE.COM");

        assertNotNull(result);
    }

    @Test
    void shouldVerifyServiceMethodCalledOnce() {
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        customUserDetailsService.loadUserByUsername("test@example.com");

        verify(userService, times(1)).getUserByEmail("test@example.com");
    }

    @Test
    void shouldHandleMultipleSequentialCalls() {
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        CustomUserDetails result1 = customUserDetailsService.loadUserByUsername("test@example.com");
        CustomUserDetails result2 = customUserDetailsService.loadUserByUsername("test@example.com");
        CustomUserDetails result3 = customUserDetailsService.loadUserByUsername("test@example.com");

        assertNotNull(result1);
        assertNotNull(result2);
        assertNotNull(result3);
        verify(userService, times(3)).getUserByEmail("test@example.com");
    }

    @Test
    void shouldCreateCustomUserDetailsWithAllFields() {
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        CustomUserDetails result = customUserDetailsService.loadUserByUsername("test@example.com");

        assertNotNull(result.getUserId());
        assertNotNull(result.getUsername());
        assertNotNull(result.getPassword());
        assertNotNull(result.getRole());
        assertNotNull(result.getAuthorities());
    }

    // ========== Admin Role Case Insensitivity Tests ==========

    @Test
    void shouldRecognizeAdminRoleCaseInsensitive() {
        testRole.setRoleName("admin");
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        CustomUserDetails result = customUserDetailsService.loadUserByUsername("test@example.com");

        assertTrue(result.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")));
    }

    @Test
    void shouldRecognizeAdminRoleMixedCase() {
        testRole.setRoleName("Admin");
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        CustomUserDetails result = customUserDetailsService.loadUserByUsername("test@example.com");

        assertTrue(result.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")));
    }
}
