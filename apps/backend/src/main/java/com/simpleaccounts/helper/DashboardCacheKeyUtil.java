package com.simpleaccounts.helper;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility to build consistent cache keys for dashboard responses.
 */
public final class DashboardCacheKeyUtil {

    private static final int MAX_MONTHS = 12;

    private DashboardCacheKeyUtil() {
    }

    public static String profitLossKey(Integer monthNo) {
        int normalizedMonths = normalizeMonthCount(monthNo);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : "anonymous";
        return username + ':' + normalizedMonths;
    }

    private static int normalizeMonthCount(Integer monthNo) {
        if (monthNo == null) {
            return MAX_MONTHS;
        }
        return Math.min(Math.max(monthNo, 1), MAX_MONTHS);
    }
}








