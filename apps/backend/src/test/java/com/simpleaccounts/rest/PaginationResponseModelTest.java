package com.simpleaccounts.rest;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("PaginationResponseModel Tests")
class PaginationResponseModelTest {

    @Test
    @DisplayName("Should create pagination response model with constructor")
    void testPaginationResponseModelConstructor() {
        List<String> data = Arrays.asList("Item1", "Item2");
        PaginationResponseModel model = new PaginationResponseModel(2, data);

        assertThat(model.getCount()).isEqualTo(2);
        assertThat(model.getData()).isEqualTo(data);
    }

    @Test
    @DisplayName("Should create pagination response model with no-args constructor")
    void testPaginationResponseModelNoArgsConstructor() {
        PaginationResponseModel model = new PaginationResponseModel();
        model.setCount(5);
        List<String> data = Arrays.asList("A", "B", "C", "D", "E");
        model.setData(data);

        assertThat(model.getCount()).isEqualTo(5);
        assertThat(data).hasSize(5);
    }

    @Test
    @DisplayName("Should test equals and hashCode")
    void testEqualsAndHashCode() {
        List<String> data = Arrays.asList("Item1");
        PaginationResponseModel model1 = new PaginationResponseModel(1, data);
        PaginationResponseModel model2 = new PaginationResponseModel(1, data);

        assertThat(model1).isEqualTo(model2);
        assertThat(model1.hashCode()).isEqualTo(model2.hashCode());
    }

    @Test
    @DisplayName("Should test toString")
    void testToString() {
        PaginationResponseModel model = new PaginationResponseModel(1, "Data");

        assertThat(model.toString()).isNotNull();
    }
}
