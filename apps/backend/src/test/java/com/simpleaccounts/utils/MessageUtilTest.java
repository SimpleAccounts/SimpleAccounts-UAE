package com.simpleaccounts.utils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationContext;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Locale;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MessageUtil Tests")
class MessageUtilTest {

    @Mock
    private ApplicationContext applicationContext;

    @Mock
    private ReloadableResourceBundleMessageSource messageSource;

    @InjectMocks
    private MessageUtil messageUtil;

    @BeforeEach
    void setUp() {
        LocaleContextHolder.setLocale(Locale.US);
    }

    @Test
    @DisplayName("Should set application context correctly")
    void testSetApplicationContext() {
        // Given
        ApplicationContext mockContext = mock(ApplicationContext.class);

        // When
        messageUtil.setApplicationContext(mockContext);

        // Then
        Object appContext = ReflectionTestUtils.getField(MessageUtil.class, "appContext");
        assertThat(appContext).isEqualTo(mockContext);
    }

    @Test
    @DisplayName("Should retrieve message successfully with valid key")
    void testGetMessage_WithValidKey() {
        // Given
        String key = "test.message.key";
        String expectedMessage = "Test Message";

        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", messageSource);

        when(messageSource.getMessage(eq(key), isNull(), eq(Locale.US)))
            .thenReturn(expectedMessage);

        // When
        String result = MessageUtil.getMessage(key);

        // Then
        assertThat(result).isEqualTo(expectedMessage);
        verify(messageSource).setDefaultEncoding("UTF-8");
        verify(messageSource).getMessage(key, null, Locale.US);
    }

    @Test
    @DisplayName("Should initialize message source from application context when null")
    void testGetMessage_InitializesMessageSource() {
        // Given
        String key = "test.key";
        String expectedMessage = "Test";

        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", null);

        when(applicationContext.getBean(ReloadableResourceBundleMessageSource.class))
            .thenReturn(messageSource);
        when(messageSource.getMessage(eq(key), isNull(), eq(Locale.US)))
            .thenReturn(expectedMessage);

        // When
        String result = MessageUtil.getMessage(key);

        // Then
        assertThat(result).isEqualTo(expectedMessage);
        verify(applicationContext).getBean(ReloadableResourceBundleMessageSource.class);
    }

    @Test
    @DisplayName("Should use US locale even when different locale is set")
    void testGetMessage_ForcesUSLocale() {
        // Given
        String key = "message.key";
        String expectedMessage = "English Message";
        LocaleContextHolder.setLocale(Locale.FRENCH);

        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", messageSource);

        when(messageSource.getMessage(eq(key), isNull(), eq(Locale.US)))
            .thenReturn(expectedMessage);

        // When
        String result = MessageUtil.getMessage(key);

        // Then
        assertThat(result).isEqualTo(expectedMessage);
        verify(messageSource).getMessage(key, null, Locale.US);
    }

    @Test
    @DisplayName("Should set UTF-8 encoding on message source")
    void testGetMessage_SetsUTF8Encoding() {
        // Given
        String key = "encoding.test";

        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", messageSource);

        when(messageSource.getMessage(anyString(), isNull(), any(Locale.class)))
            .thenReturn("test");

        // When
        MessageUtil.getMessage(key);

        // Then
        verify(messageSource).setDefaultEncoding("UTF-8");
    }

    @Test
    @DisplayName("Should handle empty message key")
    void testGetMessage_WithEmptyKey() {
        // Given
        String key = "";
        String expectedMessage = "";

        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", messageSource);

        when(messageSource.getMessage(eq(key), isNull(), eq(Locale.US)))
            .thenReturn(expectedMessage);

        // When
        String result = MessageUtil.getMessage(key);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle multiple consecutive message retrievals")
    void testGetMessage_MultipleCalls() {
        // Given
        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", messageSource);

        when(messageSource.getMessage(eq("key1"), isNull(), eq(Locale.US)))
            .thenReturn("Message 1");
        when(messageSource.getMessage(eq("key2"), isNull(), eq(Locale.US)))
            .thenReturn("Message 2");
        when(messageSource.getMessage(eq("key3"), isNull(), eq(Locale.US)))
            .thenReturn("Message 3");

        // When
        String result1 = MessageUtil.getMessage("key1");
        String result2 = MessageUtil.getMessage("key2");
        String result3 = MessageUtil.getMessage("key3");

        // Then
        assertThat(result1).isEqualTo("Message 1");
        assertThat(result2).isEqualTo("Message 2");
        assertThat(result3).isEqualTo("Message 3");
        verify(messageSource, times(3)).setDefaultEncoding("UTF-8");
    }

    @Test
    @DisplayName("Should handle German locale and fallback to US")
    void testGetMessage_WithGermanLocale() {
        // Given
        String key = "test.message";
        String expectedMessage = "Test Message";
        LocaleContextHolder.setLocale(Locale.GERMAN);

        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", messageSource);

        when(messageSource.getMessage(eq(key), isNull(), eq(Locale.US)))
            .thenReturn(expectedMessage);

        // When
        String result = MessageUtil.getMessage(key);

        // Then
        assertThat(result).isEqualTo(expectedMessage);
        verify(messageSource).getMessage(key, null, Locale.US);
    }

    @Test
    @DisplayName("Should handle Japanese locale and fallback to US")
    void testGetMessage_WithJapaneseLocale() {
        // Given
        String key = "test.message";
        String expectedMessage = "Test Message";
        LocaleContextHolder.setLocale(Locale.JAPANESE);

        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", messageSource);

        when(messageSource.getMessage(eq(key), isNull(), eq(Locale.US)))
            .thenReturn(expectedMessage);

        // When
        String result = MessageUtil.getMessage(key);

        // Then
        assertThat(result).isEqualTo(expectedMessage);
        verify(messageSource).getMessage(key, null, Locale.US);
    }

    @Test
    @DisplayName("Should handle message with special characters")
    void testGetMessage_WithSpecialCharacters() {
        // Given
        String key = "special.message";
        String expectedMessage = "Spëçïål Çhårāçtërs: €£¥";

        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", messageSource);

        when(messageSource.getMessage(eq(key), isNull(), eq(Locale.US)))
            .thenReturn(expectedMessage);

        // When
        String result = MessageUtil.getMessage(key);

        // Then
        assertThat(result).isEqualTo(expectedMessage);
        assertThat(result).contains("€", "£", "¥");
    }

    @Test
    @DisplayName("Should handle message with line breaks")
    void testGetMessage_WithLineBreaks() {
        // Given
        String key = "multiline.message";
        String expectedMessage = "Line 1\nLine 2\nLine 3";

        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", messageSource);

        when(messageSource.getMessage(eq(key), isNull(), eq(Locale.US)))
            .thenReturn(expectedMessage);

        // When
        String result = MessageUtil.getMessage(key);

        // Then
        assertThat(result).isEqualTo(expectedMessage);
        assertThat(result).contains("\n");
    }

    @Test
    @DisplayName("Should handle very long message keys")
    void testGetMessage_WithLongKey() {
        // Given
        String key = "very.long.message.key.with.many.dots.and.segments.test";
        String expectedMessage = "Long key message";

        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", messageSource);

        when(messageSource.getMessage(eq(key), isNull(), eq(Locale.US)))
            .thenReturn(expectedMessage);

        // When
        String result = MessageUtil.getMessage(key);

        // Then
        assertThat(result).isEqualTo(expectedMessage);
    }

    @Test
    @DisplayName("Should handle very long message content")
    void testGetMessage_WithLongMessage() {
        // Given
        String key = "long.message";
        String expectedMessage = "This is a very long message content that contains multiple sentences. " +
                "It might be used for detailed error messages or help text. " +
                "The content can span multiple lines and contain various information.";

        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", messageSource);

        when(messageSource.getMessage(eq(key), isNull(), eq(Locale.US)))
            .thenReturn(expectedMessage);

        // When
        String result = MessageUtil.getMessage(key);

        // Then
        assertThat(result).isEqualTo(expectedMessage);
        assertThat(result.length()).isGreaterThan(100);
    }

    @Test
    @DisplayName("Should handle English locale without issues")
    void testGetMessage_WithEnglishLocale() {
        // Given
        String key = "english.message";
        String expectedMessage = "English Message";
        LocaleContextHolder.setLocale(Locale.ENGLISH);

        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", messageSource);

        when(messageSource.getMessage(eq(key), isNull(), eq(Locale.US)))
            .thenReturn(expectedMessage);

        // When
        String result = MessageUtil.getMessage(key);

        // Then
        assertThat(result).isEqualTo(expectedMessage);
        verify(messageSource).getMessage(key, null, Locale.US);
    }

    @Test
    @DisplayName("Should cache message source after first initialization")
    void testGetMessage_CachesMessageSource() {
        // Given
        String key1 = "key1";
        String key2 = "key2";

        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", null);

        when(applicationContext.getBean(ReloadableResourceBundleMessageSource.class))
            .thenReturn(messageSource);
        when(messageSource.getMessage(anyString(), isNull(), eq(Locale.US)))
            .thenReturn("test");

        // When
        MessageUtil.getMessage(key1);
        MessageUtil.getMessage(key2);

        // Then
        verify(applicationContext, times(1)).getBean(ReloadableResourceBundleMessageSource.class);
    }

    @Test
    @DisplayName("Should handle message keys with dots and underscores")
    void testGetMessage_WithComplexKey() {
        // Given
        String key = "error.validation.user_name.required";
        String expectedMessage = "User name is required";

        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", messageSource);

        when(messageSource.getMessage(eq(key), isNull(), eq(Locale.US)))
            .thenReturn(expectedMessage);

        // When
        String result = MessageUtil.getMessage(key);

        // Then
        assertThat(result).isEqualTo(expectedMessage);
    }

    @Test
    @DisplayName("Should handle numeric message keys")
    void testGetMessage_WithNumericKey() {
        // Given
        String key = "error.code.404";
        String expectedMessage = "Not Found";

        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", messageSource);

        when(messageSource.getMessage(eq(key), isNull(), eq(Locale.US)))
            .thenReturn(expectedMessage);

        // When
        String result = MessageUtil.getMessage(key);

        // Then
        assertThat(result).isEqualTo(expectedMessage);
    }

    @Test
    @DisplayName("Should handle Chinese locale and fallback to US")
    void testGetMessage_WithChineseLocale() {
        // Given
        String key = "test.message";
        String expectedMessage = "Test Message";
        LocaleContextHolder.setLocale(Locale.CHINESE);

        ReflectionTestUtils.setField(MessageUtil.class, "appContext", applicationContext);
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", messageSource);

        when(messageSource.getMessage(eq(key), isNull(), eq(Locale.US)))
            .thenReturn(expectedMessage);

        // When
        String result = MessageUtil.getMessage(key);

        // Then
        assertThat(result).isEqualTo(expectedMessage);
        verify(messageSource).getMessage(key, null, Locale.US);
    }

    @Test
    @DisplayName("Should work correctly as Spring component")
    void testMessageUtilIsComponent() {
        // Then
        assertThat(MessageUtil.class.isAnnotationPresent(org.springframework.stereotype.Component.class))
            .isTrue();
    }
}
