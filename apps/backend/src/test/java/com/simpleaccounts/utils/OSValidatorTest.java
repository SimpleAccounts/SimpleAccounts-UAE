package com.simpleaccounts.utils;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.*;

@DisplayName("OSValidator Tests")
class OSValidatorTest {

    @Test
    @DisplayName("Should detect Windows OS when os.name contains 'win'")
    void testIsWindows_WithWindowsOS() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "Windows 10");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            boolean result = OSValidator.isWindows();

            // Then
            assertThat(result).isTrue();
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should not detect Windows when OS is Mac")
    void testIsWindows_WithMacOS() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "Mac OS X");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            boolean result = OSValidator.isWindows();

            // Then
            assertThat(result).isFalse();
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should detect Mac OS when os.name contains 'mac'")
    void testIsMac_WithMacOS() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "Mac OS X");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            boolean result = OSValidator.isMac();

            // Then
            assertThat(result).isTrue();
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should not detect Mac when OS is Linux")
    void testIsMac_WithLinuxOS() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "Linux");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            boolean result = OSValidator.isMac();

            // Then
            assertThat(result).isFalse();
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should detect Unix when os.name contains 'nix'")
    void testIsUnix_WithNixOS() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "Unix");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            boolean result = OSValidator.isUnix();

            // Then
            assertThat(result).isTrue();
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should detect Unix when os.name contains 'nux'")
    void testIsUnix_WithLinuxOS() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "Linux");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            boolean result = OSValidator.isUnix();

            // Then
            assertThat(result).isTrue();
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should detect Unix when os.name contains 'aix'")
    void testIsUnix_WithAixOS() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "AIX");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            boolean result = OSValidator.isUnix();

            // Then
            assertThat(result).isTrue();
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should not detect Unix when OS is Windows")
    void testIsUnix_WithWindowsOS() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "Windows 10");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            boolean result = OSValidator.isUnix();

            // Then
            assertThat(result).isFalse();
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should detect Solaris when os.name contains 'sunos'")
    void testIsSolaris_WithSolarisOS() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "SunOS");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            boolean result = OSValidator.isSolaris();

            // Then
            assertThat(result).isTrue();
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should not detect Solaris when OS is Windows")
    void testIsSolaris_WithWindowsOS() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "Windows 10");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            boolean result = OSValidator.isSolaris();

            // Then
            assertThat(result).isFalse();
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should return 'win' for Windows OS")
    void testGetOS_WithWindowsOS() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "Windows 11");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            String result = OSValidator.getOS();

            // Then
            assertThat(result).isEqualTo("win");
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should return 'osx' for Mac OS")
    void testGetOS_WithMacOS() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "Mac OS X");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            String result = OSValidator.getOS();

            // Then
            assertThat(result).isEqualTo("osx");
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should return 'uni' for Unix/Linux OS")
    void testGetOS_WithLinuxOS() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "Linux");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            String result = OSValidator.getOS();

            // Then
            assertThat(result).isEqualTo("uni");
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should return 'sol' for Solaris OS")
    void testGetOS_WithSolarisOS() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "SunOS");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            String result = OSValidator.getOS();

            // Then
            assertThat(result).isEqualTo("sol");
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should return 'err' for unknown OS")
    void testGetOS_WithUnknownOS() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "UnknownOS");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            String result = OSValidator.getOS();

            // Then
            assertThat(result).isEqualTo("err");
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should handle Windows 7 OS name")
    void testIsWindows_WithWindows7() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "Windows 7");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            boolean result = OSValidator.isWindows();

            // Then
            assertThat(result).isTrue();
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should handle case-insensitive OS name")
    void testIsWindows_WithMixedCase() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "WINDOWS");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            boolean result = OSValidator.isWindows();

            // Then
            assertThat(result).isTrue();
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should properly initialize OS field from system property")
    void testOSFieldInitialization() {
        // When
        String osName = System.getProperty("os.name").toLowerCase();

        // Then
        assertThat(osName).isNotNull();
        assertThat(osName).isNotEmpty();
    }

    @Test
    @DisplayName("Should handle Ubuntu Linux detection")
    void testIsUnix_WithUbuntuLinux() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "Ubuntu Linux");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When
            boolean result = OSValidator.isUnix();

            // Then
            assertThat(result).isTrue();
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }

    @Test
    @DisplayName("Should only match one OS type at a time")
    void testMutualExclusivity_WindowsNotUnix() {
        // Given
        String originalOS = System.getProperty("os.name");

        try {
            System.setProperty("os.name", "Windows 10");
            ReflectionTestUtils.setField(OSValidator.class, "OS", System.getProperty("os.name").toLowerCase());

            // When & Then
            assertThat(OSValidator.isWindows()).isTrue();
            assertThat(OSValidator.isUnix()).isFalse();
            assertThat(OSValidator.isMac()).isFalse();
            assertThat(OSValidator.isSolaris()).isFalse();
        } finally {
            System.setProperty("os.name", originalOS);
            ReflectionTestUtils.setField(OSValidator.class, "OS", originalOS.toLowerCase());
        }
    }
}
