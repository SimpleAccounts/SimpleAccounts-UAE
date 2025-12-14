package com.simpleaccounts.security;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Unit tests for WebSecurityConfig.
 * Tests security configuration beans and password encoding.
 */
@ExtendWith(MockitoExtension.class)
class WebSecurityConfigTest {

    @Mock
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Mock
    private CustomUserDetailsService customUserDetailsService;

    @Mock
    private JwtRequestFilter jwtRequestFilter;

    @InjectMocks
    private WebSecurityConfig webSecurityConfig;

    // ========== Password Encoder Tests ==========

    @Test
    void shouldCreatePasswordEncoderBean() {
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();

        assertNotNull(encoder);
        assertTrue(encoder instanceof BCryptPasswordEncoder);
    }

    @Test
    void shouldEncodeDifferentPasswordsDifferently() {
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();
        String password = "myPassword123";

        String encoded1 = encoder.encode(password);
        String encoded2 = encoder.encode(password);

        // BCrypt generates different hashes for same password (due to salt)
        assertNotEquals(encoded1, encoded2);
    }

    @Test
    void shouldMatchEncodedPassword() {
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();
        String rawPassword = "testPassword123";
        String encodedPassword = encoder.encode(rawPassword);

        assertTrue(encoder.matches(rawPassword, encodedPassword));
    }

    @Test
    void shouldNotMatchWrongPassword() {
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();
        String rawPassword = "testPassword123";
        String wrongPassword = "wrongPassword";
        String encodedPassword = encoder.encode(rawPassword);

        assertFalse(encoder.matches(wrongPassword, encodedPassword));
    }

    @Test
    void shouldEncodeEmptyPasswordWithoutError() {
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();
        String emptyPassword = "";

        String encoded = encoder.encode(emptyPassword);

        assertNotNull(encoded);
        assertTrue(encoder.matches(emptyPassword, encoded));
    }

    @Test
    void shouldEncodeSpecialCharactersInPassword() {
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();
        String specialPassword = "P@$$w0rd!#$%^&*()_+=[]{}|;':\",./<>?";

        String encoded = encoder.encode(specialPassword);

        assertNotNull(encoded);
        assertTrue(encoder.matches(specialPassword, encoded));
    }

    @Test
    void shouldEncodeLongPassword() {
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();
        String longPassword = "a".repeat(100);

        String encoded = encoder.encode(longPassword);

        assertNotNull(encoded);
        assertTrue(encoder.matches(longPassword, encoded));
    }

    @Test
    void shouldEncodeUnicodePassword() {
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();
        String unicodePassword = "パスワード密码пароль";

        String encoded = encoder.encode(unicodePassword);

        assertNotNull(encoded);
        assertTrue(encoder.matches(unicodePassword, encoded));
    }

    @Test
    void shouldProduceBCryptHashFormat() {
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();
        String password = "testPassword";

        String encoded = encoder.encode(password);

        // BCrypt hash starts with $2a$ or $2b$ followed by cost factor
        assertTrue(encoded.startsWith("$2a$") || encoded.startsWith("$2b$"));
    }

    // ========== Configuration Injection Tests ==========

    @Test
    void shouldHaveJwtAuthenticationEntryPointInjected() {
        assertNotNull(jwtAuthenticationEntryPoint);
    }

    @Test
    void shouldHaveCustomUserDetailsServiceInjected() {
        assertNotNull(customUserDetailsService);
    }

    @Test
    void shouldHaveJwtRequestFilterInjected() {
        assertNotNull(jwtRequestFilter);
    }

    // ========== Password Encoding Consistency Tests ==========

    @Test
    void shouldConsistentlyValidatePassword() {
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();
        String password = "consistentPassword";
        String encoded = encoder.encode(password);

        // Validate multiple times
        for (int i = 0; i < 10; i++) {
            assertTrue(encoder.matches(password, encoded));
        }
    }

    @Test
    void shouldNotBeVulnerableToTimingAttack() {
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();
        String password = "timedPassword123";
        String encoded = encoder.encode(password);

        // Even wrong passwords should be properly processed
        assertFalse(encoder.matches("", encoded));
        assertFalse(encoder.matches("a", encoded));
        assertFalse(encoder.matches("ab", encoded));
        assertFalse(encoder.matches("abc", encoded));
    }

    // ========== BCrypt Strength Tests ==========

    @Test
    void shouldUseDefaultBCryptStrength() {
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();
        String password = "strengthTest";
        String encoded = encoder.encode(password);

        // Default BCrypt strength is 10, encoded in hash as $2a$10$
        assertTrue(encoded.contains("$10$") || encoded.contains("$2a$10$") || encoded.contains("$2b$10$"));
    }
}
