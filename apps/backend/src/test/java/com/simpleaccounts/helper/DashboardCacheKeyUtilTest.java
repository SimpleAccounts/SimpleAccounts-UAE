package com.simpleaccounts.helper;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
@DisplayName("DashboardCacheKeyUtil Tests")
class DashboardCacheKeyUtilTest {

    private SecurityContext securityContext;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        securityContext = mock(SecurityContext.class);
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @ParameterizedTest(name = "monthNo={0}, expectedMonth={1}")
    @DisplayName("Should normalize month values to valid range [1-12]")
    @CsvSource({
        "6, 6",       // valid middle range
        "0, 1",       // below minimum normalized to 1
        "24, 12",     // above maximum normalized to 12
        "-5, 1",      // negative normalized to 1
        "1, 1",       // minimum boundary
        "12, 12",     // maximum boundary
        "-1, 1",      // edge case just below valid range
        "13, 12",     // edge case just above valid range
        "2147483647, 12",  // Integer.MAX_VALUE
        "-2147483648, 1"   // Integer.MIN_VALUE
    })
    void shouldNormalizeMonthValues(Integer inputMonth, int expectedMonth) {
        // given
        authentication = new UsernamePasswordAuthenticationToken("testuser", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(inputMonth);

        // then
        assertThat(cacheKey).isEqualTo("testuser:" + expectedMonth);
    }

    @Test
    @DisplayName("Should use default 12 months when monthNo is null")
    void shouldUseDefault12MonthsWhenMonthNoIsNull() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("john.doe", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(null);

        // then
        assertThat(cacheKey).isEqualTo("john.doe:12");
    }

    @Test
    @DisplayName("Should use anonymous when authentication is null")
    void shouldUseAnonymousWhenAuthenticationIsNull() {
        // given
        when(securityContext.getAuthentication()).thenReturn(null);
        Integer monthNo = 3;

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(monthNo);

        // then
        assertThat(cacheKey).isEqualTo("anonymous:3");
    }

    @Test
    @DisplayName("Should handle username with special characters")
    void shouldHandleUsernameWithSpecialCharacters() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("user.name@example.com", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);
        Integer monthNo = 5;

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(monthNo);

        // then
        assertThat(cacheKey).isEqualTo("user.name@example.com:5");
    }

    @Test
    @DisplayName("Should handle long username")
    void shouldHandleLongUsername() {
        // given
        String longUsername = "very.long.username.with.many.dots.and.characters@example.com";
        authentication = new UsernamePasswordAuthenticationToken(longUsername, "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);
        Integer monthNo = 8;

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(monthNo);

        // then
        assertThat(cacheKey).isEqualTo(longUsername + ":8");
    }

    @Test
    @DisplayName("Should generate consistent cache keys for same user and month")
    void shouldGenerateConsistentCacheKeysForSameUserAndMonth() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("consistentuser", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);
        Integer monthNo = 7;

        // when
        String cacheKey1 = DashboardCacheKeyUtil.profitLossKey(monthNo);
        String cacheKey2 = DashboardCacheKeyUtil.profitLossKey(monthNo);

        // then
        assertThat(cacheKey1).isEqualTo(cacheKey2);
    }

    @Test
    @DisplayName("Should generate different cache keys for different users")
    void shouldGenerateDifferentCacheKeysForDifferentUsers() {
        // given
        Integer monthNo = 6;

        authentication = new UsernamePasswordAuthenticationToken("user1", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);
        String cacheKey1 = DashboardCacheKeyUtil.profitLossKey(monthNo);

        authentication = new UsernamePasswordAuthenticationToken("user2", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);
        String cacheKey2 = DashboardCacheKeyUtil.profitLossKey(monthNo);

        // then
        assertThat(cacheKey1).isNotEqualTo(cacheKey2);
        assertThat(cacheKey1).isEqualTo("user1:6");
        assertThat(cacheKey2).isEqualTo("user2:6");
    }

    @Test
    @DisplayName("Should generate different cache keys for different months")
    void shouldGenerateDifferentCacheKeysForDifferentMonths() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("testuser", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);

        // when
        String cacheKey1 = DashboardCacheKeyUtil.profitLossKey(3);
        String cacheKey2 = DashboardCacheKeyUtil.profitLossKey(9);

        // then
        assertThat(cacheKey1).isNotEqualTo(cacheKey2);
        assertThat(cacheKey1).isEqualTo("testuser:3");
        assertThat(cacheKey2).isEqualTo("testuser:9");
    }

    @Test
    @DisplayName("Should use colon as delimiter in cache key")
    void shouldUseColonAsDelimiterInCacheKey() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("delimiter_test", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);
        Integer monthNo = 4;

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(monthNo);

        // then
        assertThat(cacheKey).contains(":");
        String[] parts = cacheKey.split(":");
        assertThat(parts).hasSize(2);
        assertThat(parts[0]).isEqualTo("delimiter_test");
        assertThat(parts[1]).isEqualTo("4");
    }

}
