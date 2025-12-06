package com.simpleaccounts.utils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RandomString Utility Tests")
class RandomStringTest {

    @InjectMocks
    private RandomString randomString;

    @BeforeEach
    void setUp() {
        randomString = new RandomString();
    }

    @Test
    @DisplayName("Should generate string with correct length")
    void shouldGenerateStringWithCorrectLength() {
        // given
        int length = 10;

        // when
        String result = randomString.getAlphaNumericString(length);

        // then
        assertThat(result).hasSize(length);
    }

    @Test
    @DisplayName("Should generate string with only alphanumeric characters")
    void shouldGenerateStringWithOnlyAlphanumericCharacters() {
        // given
        int length = 20;
        Pattern alphanumericPattern = Pattern.compile("^[a-zA-Z0-9]+$");

        // when
        String result = randomString.getAlphaNumericString(length);

        // then
        assertThat(result).matches(alphanumericPattern);
    }

    @Test
    @DisplayName("Should generate empty string when length is zero")
    void shouldGenerateEmptyStringWhenLengthIsZero() {
        // given
        int length = 0;

        // when
        String result = randomString.getAlphaNumericString(length);

        // then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should generate single character when length is one")
    void shouldGenerateSingleCharacterWhenLengthIsOne() {
        // given
        int length = 1;

        // when
        String result = randomString.getAlphaNumericString(length);

        // then
        assertThat(result).hasSize(1);
        assertThat(result).matches("[a-zA-Z0-9]");
    }

    @Test
    @DisplayName("Should generate different strings on multiple calls")
    void shouldGenerateDifferentStringsOnMultipleCalls() {
        // given
        int length = 15;
        Set<String> generatedStrings = new HashSet<>();

        // when
        for (int i = 0; i < 100; i++) {
            String result = randomString.getAlphaNumericString(length);
            generatedStrings.add(result);
        }

        // then - at least 90% should be unique (high probability with random strings)
        assertThat(generatedStrings).hasSizeGreaterThan(90);
    }

    @Test
    @DisplayName("Should generate very long string successfully")
    void shouldGenerateVeryLongStringSuccessfully() {
        // given
        int length = 1000;

        // when
        String result = randomString.getAlphaNumericString(length);

        // then
        assertThat(result).hasSize(length);
        assertThat(result).matches("^[a-zA-Z0-9]+$");
    }

    @Test
    @DisplayName("Should generate string with uppercase letters")
    void shouldGenerateStringWithUppercaseLetters() {
        // given
        int length = 100;

        // when
        String result = randomString.getAlphaNumericString(length);

        // then - high probability of having at least one uppercase letter
        assertThat(result).matches(".*[A-Z].*");
    }

    @Test
    @DisplayName("Should generate string with lowercase letters")
    void shouldGenerateStringWithLowercaseLetters() {
        // given
        int length = 100;

        // when
        String result = randomString.getAlphaNumericString(length);

        // then - high probability of having at least one lowercase letter
        assertThat(result).matches(".*[a-z].*");
    }

    @Test
    @DisplayName("Should generate string with digits")
    void shouldGenerateStringWithDigits() {
        // given
        int length = 100;

        // when
        String result = randomString.getAlphaNumericString(length);

        // then - high probability of having at least one digit
        assertThat(result).matches(".*[0-9].*");
    }

    @Test
    @DisplayName("Should not generate null string")
    void shouldNotGenerateNullString() {
        // given
        int length = 10;

        // when
        String result = randomString.getAlphaNumericString(length);

        // then
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should handle negative length gracefully")
    void shouldHandleNegativeLengthGracefully() {
        // given
        int length = -5;

        // when
        String result = randomString.getAlphaNumericString(length);

        // then - should return empty string for negative length
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should generate consistent length for medium strings")
    void shouldGenerateConsistentLengthForMediumStrings() {
        // given
        int length = 50;

        // when & then
        for (int i = 0; i < 20; i++) {
            String result = randomString.getAlphaNumericString(length);
            assertThat(result).hasSize(length);
        }
    }

    @Test
    @DisplayName("Should not contain special characters")
    void shouldNotContainSpecialCharacters() {
        // given
        int length = 30;

        // when
        String result = randomString.getAlphaNumericString(length);

        // then
        assertThat(result).doesNotContain("!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "=", "+");
        assertThat(result).doesNotContain("[", "]", "{", "}", ";", ":", "'", "\"", ",", ".", "<", ">", "/", "?");
    }

    @Test
    @DisplayName("Should generate string within valid character range")
    void shouldGenerateStringWithinValidCharacterRange() {
        // given
        int length = 50;
        String validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvxyz";

        // when
        String result = randomString.getAlphaNumericString(length);

        // then
        for (char c : result.toCharArray()) {
            assertThat(validChars).contains(String.valueOf(c));
        }
    }

    @Test
    @DisplayName("Should be performant for reasonable lengths")
    void shouldBePerformantForReasonableLengths() {
        // given
        int length = 100;

        // when
        long startTime = System.currentTimeMillis();
        for (int i = 0; i < 1000; i++) {
            randomString.getAlphaNumericString(length);
        }
        long endTime = System.currentTimeMillis();

        // then - should complete 1000 generations in less than 1 second
        assertThat(endTime - startTime).isLessThan(1000);
    }

    @Test
    @DisplayName("Should generate multiple strings of different lengths")
    void shouldGenerateMultipleStringsOfDifferentLengths() {
        // when
        String short1 = randomString.getAlphaNumericString(5);
        String medium = randomString.getAlphaNumericString(15);
        String long1 = randomString.getAlphaNumericString(50);

        // then
        assertThat(short1).hasSize(5);
        assertThat(medium).hasSize(15);
        assertThat(long1).hasSize(50);
    }

    @Test
    @DisplayName("Should have good randomness distribution")
    void shouldHaveGoodRandomnessDistribution() {
        // given
        int length = 10;
        int iterations = 100;
        Set<String> uniqueStrings = new HashSet<>();

        // when
        for (int i = 0; i < iterations; i++) {
            uniqueStrings.add(randomString.getAlphaNumericString(length));
        }

        // then - with 10 character strings, should have very high uniqueness
        assertThat(uniqueStrings.size()).isGreaterThan(95);
    }

    @Test
    @DisplayName("Should handle boundary case of length 2")
    void shouldHandleBoundaryCaseOfLengthTwo() {
        // given
        int length = 2;

        // when
        String result = randomString.getAlphaNumericString(length);

        // then
        assertThat(result).hasSize(2);
        assertThat(result).matches("^[a-zA-Z0-9]{2}$");
    }

    @Test
    @DisplayName("Should not throw exception for large length")
    void shouldNotThrowExceptionForLargeLength() {
        // given
        int length = 10000;

        // when & then
        assertThatCode(() -> randomString.getAlphaNumericString(length))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Should generate valid strings for typical use cases")
    void shouldGenerateValidStringsForTypicalUseCases() {
        // given
        int[] typicalLengths = {6, 8, 10, 12, 16, 32, 64};

        // when & then
        for (int length : typicalLengths) {
            String result = randomString.getAlphaNumericString(length);
            assertThat(result)
                    .hasSize(length)
                    .matches("^[a-zA-Z0-9]+$");
        }
    }
}
