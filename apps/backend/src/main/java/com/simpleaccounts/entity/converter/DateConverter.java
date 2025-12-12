package com.simpleaccounts.entity.converter;

import lombok.extern.slf4j.Slf4j;

import com.simpleaccounts.aop.LogRequest;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.sql.Timestamp;
import java.time.LocalDateTime;

/**
 * Created by Utkarsh Bhavsar on 03/04/17.
 */
@Slf4j
@Converter(autoApply = true)
public class DateConverter implements AttributeConverter<LocalDateTime, Timestamp> {

    @Override
    @LogRequest
    public Timestamp convertToDatabaseColumn(LocalDateTime localDateTime) {
        try {
            if (localDateTime == null) {
                return null;
            }
//            localDateTime = LocalDateTime.ofInstant(localDateTime.toInstant(ZoneOffset.UTC), ZoneId.of(System.getProperty("simpleaccounts.user.timezone","Asia/Dubai")));
//            localDateTime =localDateTime.with(LocalTime.MIN);

            return Timestamp.valueOf(localDateTime);

        } catch (Exception e) {
            throw new RuntimeException("failed to convert localDateTime [" + localDateTime + "] to string for storing to database", e);
        }
    }

    @Override
    public LocalDateTime convertToEntityAttribute(Timestamp databaseValue) {
        try {
            if (databaseValue == null) {
                return null;
            }

            return databaseValue.toLocalDateTime();
        } catch (Exception e) {
            throw new RuntimeException("failed to convert databaseValue [" + databaseValue + "] to ZonedDateTime when reading from database", e);
        }
    }

}

