package com.simpleaccounts.rest;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("DropdownModel Tests")
class DropdownModelTest {

    @Test
    @DisplayName("Should create dropdown model with constructor")
    void testDropdownModelConstructor() {
        DropdownModel model = new DropdownModel(1, "Test Label");

        assertThat(model.getValue()).isEqualTo(1);
        assertThat(model.getLabel()).isEqualTo("Test Label");
    }

    @Test
    @DisplayName("Should create dropdown model with no-args constructor")
    void testDropdownModelNoArgsConstructor() {
        DropdownModel model = new DropdownModel();
        model.setValue(2);
        model.setLabel("Another Label");

        assertThat(model.getValue()).isEqualTo(2);
        assertThat(model.getLabel()).isEqualTo("Another Label");
    }

    @Test
    @DisplayName("Should test equals and hashCode")
    void testEqualsAndHashCode() {
        DropdownModel model1 = new DropdownModel(1, "Test");
        DropdownModel model2 = new DropdownModel(1, "Test");

        assertThat(model1).isEqualTo(model2);
        assertThat(model1.hashCode()).isEqualTo(model2.hashCode());
    }

    @Test
    @DisplayName("Should test toString")
    void testToString() {
        DropdownModel model = new DropdownModel(1, "Test");

        assertThat(model.toString()).contains("1");
        assertThat(model.toString()).contains("Test");
    }
}
