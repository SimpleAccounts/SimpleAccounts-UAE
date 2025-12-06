package com.simpleaccounts.helper;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

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

    @Test
    @DisplayName("Should generate cache key with username and normalized months")
    void shouldGenerateCacheKeyWithUsernameAndNormalizedMonths() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("testuser", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);
        Integer monthNo = 6;

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(monthNo);

        // then
        assertThat(cacheKey).isEqualTo("testuser:6");
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
    @DisplayName("Should normalize months to minimum 1")
    void shouldNormalizeMonthsToMinimum1() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("user123", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);
        Integer monthNo = 0;

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(monthNo);

        // then
        assertThat(cacheKey).isEqualTo("user123:1");
    }

    @Test
    @DisplayName("Should normalize months to maximum 12")
    void shouldNormalizeMonthsToMaximum12() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("admin", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);
        Integer monthNo = 24;

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(monthNo);

        // then
        assertThat(cacheKey).isEqualTo("admin:12");
    }

    @Test
    @DisplayName("Should normalize negative months to 1")
    void shouldNormalizeNegativeMonthsTo1() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("testuser", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);
        Integer monthNo = -5;

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(monthNo);

        // then
        assertThat(cacheKey).isEqualTo("testuser:1");
    }

    @Test
    @DisplayName("Should accept valid month number 1")
    void shouldAcceptValidMonthNumber1() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("user1", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);
        Integer monthNo = 1;

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(monthNo);

        // then
        assertThat(cacheKey).isEqualTo("user1:1");
    }

    @Test
    @DisplayName("Should accept valid month number 12")
    void shouldAcceptValidMonthNumber12() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("user12", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);
        Integer monthNo = 12;

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(monthNo);

        // then
        assertThat(cacheKey).isEqualTo("user12:12");
    }

    @Test
    @DisplayName("Should accept valid month number in middle range")
    void shouldAcceptValidMonthNumberInMiddleRange() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("testuser", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);
        Integer monthNo = 6;

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(monthNo);

        // then
        assertThat(cacheKey).isEqualTo("testuser:6");
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

    @Test
    @DisplayName("Should handle very large month number")
    void shouldHandleVeryLargeMonthNumber() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("testuser", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);
        Integer monthNo = Integer.MAX_VALUE;

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(monthNo);

        // then
        assertThat(cacheKey).isEqualTo("testuser:12");
    }

    @Test
    @DisplayName("Should handle very small month number")
    void shouldHandleVerySmallMonthNumber() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("testuser", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);
        Integer monthNo = Integer.MIN_VALUE;

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(monthNo);

        // then
        assertThat(cacheKey).isEqualTo("testuser:1");
    }

    @Test
    @DisplayName("Should handle all valid month values from 1 to 12")
    void shouldHandleAllValidMonthValuesFrom1To12() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("rangeuser", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);

        // when & then
        for (int month = 1; month <= 12; month++) {
            String cacheKey = DashboardCacheKeyUtil.profitLossKey(month);
            assertThat(cacheKey).isEqualTo("rangeuser:" + month);
        }
    }

    @Test
    @DisplayName("Should handle edge case just below valid range")
    void shouldHandleEdgeCaseJustBelowValidRange() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("edgeuser", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(-1);

        // then
        assertThat(cacheKey).isEqualTo("edgeuser:1");
    }

    @Test
    @DisplayName("Should handle edge case just above valid range")
    void shouldHandleEdgeCaseJustAboveValidRange() {
        // given
        authentication = new UsernamePasswordAuthenticationToken("edgeuser", "password", new ArrayList<>());
        when(securityContext.getAuthentication()).thenReturn(authentication);

        // when
        String cacheKey = DashboardCacheKeyUtil.profitLossKey(13);

        // then
        assertThat(cacheKey).isEqualTo("edgeuser:12");
    }
}
