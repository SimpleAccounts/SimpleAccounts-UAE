package com.simpleaccounts.repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;

/**
 * Utility functions that emulate PostgreSQL helper functions inside H2 for tests.
 */
public final class H2Functions {

    private H2Functions() {
        // utility
    }

    public static Timestamp dateTrunc(String precision, Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        LocalDateTime dateTime = timestamp.toLocalDateTime();
        if ("day".equalsIgnoreCase(precision)) {
            dateTime = dateTime.toLocalDate().atStartOfDay();
        }
        return Timestamp.valueOf(dateTime);
    }
}



