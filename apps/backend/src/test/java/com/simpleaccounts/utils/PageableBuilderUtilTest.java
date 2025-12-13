package com.simpleaccounts.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@DisplayName("PageableBuilderUtil Tests")
class PageableBuilderUtilTest {

    @Nested
    @DisplayName("getPageable Tests")
    class GetPageableTests {

        @Test
        @DisplayName("Should create pageable with valid page size and page number")
        void shouldCreatePageableWithValidPageSizeAndPageNumber() {
            // when
            Pageable result = PageableBuilderUtil.getPageable(20, 0);

            // then
            assertThat(result).isNotNull();
            assertThat(result.getPageSize()).isEqualTo(20);
            assertThat(result.getPageNumber()).isEqualTo(0);
        }

        @Test
        @DisplayName("Should enforce minimum page size of 10")
        void shouldEnforceMinimumPageSizeOf10() {
            // when
            Pageable result = PageableBuilderUtil.getPageable(0, 0);

            // then
            assertThat(result.getPageSize()).isEqualTo(10);
        }

        @ParameterizedTest(name = "Page size {0} should be normalized to 10")
        @ValueSource(ints = {-5, -1, 0, 5, 9})
        @DisplayName("Should normalize small page sizes to minimum of 10")
        void shouldNormalizeSmallPageSizesToMinimum(int smallPageSize) {
            // when
            Pageable result = PageableBuilderUtil.getPageable(smallPageSize, 0);

            // then
            assertThat(result.getPageSize()).isEqualTo(10);
        }

        @Test
        @DisplayName("Should enforce maximum page size of 100")
        void shouldEnforceMaximumPageSizeOf100() {
            // when
            Pageable result = PageableBuilderUtil.getPageable(200, 0);

            // then
            assertThat(result.getPageSize()).isEqualTo(100);
        }

        @ParameterizedTest(name = "Page size {0} should be capped to 100")
        @ValueSource(ints = {101, 150, 500, 1000})
        @DisplayName("Should cap large page sizes to maximum of 100")
        void shouldCapLargePageSizesToMaximum(int largePageSize) {
            // when
            Pageable result = PageableBuilderUtil.getPageable(largePageSize, 0);

            // then
            assertThat(result.getPageSize()).isEqualTo(100);
        }

        @ParameterizedTest(name = "Page size {0} should remain unchanged")
        @ValueSource(ints = {10, 20, 50, 75, 100})
        @DisplayName("Should keep valid page sizes unchanged")
        void shouldKeepValidPageSizesUnchanged(int validPageSize) {
            // when
            Pageable result = PageableBuilderUtil.getPageable(validPageSize, 0);

            // then
            assertThat(result.getPageSize()).isEqualTo(validPageSize);
        }

        @ParameterizedTest(name = "Page number {0} should be preserved")
        @ValueSource(ints = {0, 1, 5, 10, 100})
        @DisplayName("Should preserve valid page numbers")
        void shouldPreserveValidPageNumbers(int pageNumber) {
            // when
            Pageable result = PageableBuilderUtil.getPageable(20, pageNumber);

            // then
            assertThat(result.getPageNumber()).isEqualTo(pageNumber);
        }
    }

    @Nested
    @DisplayName("getPageableNoUpperBoundRestrictionOnPageSize Tests")
    class GetPageableNoUpperBoundTests {

        @Test
        @DisplayName("Should create pageable without upper bound restriction")
        void shouldCreatePageableWithoutUpperBoundRestriction() {
            // given
            VatPageRequest request = new VatPageRequest();
            request.setPage(0);
            request.setSize(500);
            request.setSortStr(null);

            // when
            Pageable result = PageableBuilderUtil.getPageableNoUpperBoundRestrictionOnPageSize(request);

            // then
            assertThat(result).isNotNull();
            assertThat(result.getPageSize()).isEqualTo(500); // No upper bound
            assertThat(result.getPageNumber()).isEqualTo(0);
        }

        @Test
        @DisplayName("Should enforce minimum page size of 10")
        void shouldEnforceMinimumPageSizeOf10() {
            // given
            VatPageRequest request = new VatPageRequest();
            request.setPage(0);
            request.setSize(0);

            // when
            Pageable result = PageableBuilderUtil.getPageableNoUpperBoundRestrictionOnPageSize(request);

            // then
            assertThat(result.getPageSize()).isEqualTo(10);
        }

        @Test
        @DisplayName("Should use default size when negative")
        void shouldUseDefaultSizeWhenNegative() {
            // given
            VatPageRequest request = new VatPageRequest();
            request.setPage(0);
            request.setSize(-10);

            // when
            Pageable result = PageableBuilderUtil.getPageableNoUpperBoundRestrictionOnPageSize(request);

            // then
            assertThat(result.getPageSize()).isEqualTo(10);
        }

        @Test
        @DisplayName("Should handle negative page number")
        void shouldHandleNegativePageNumber() {
            // given
            VatPageRequest request = new VatPageRequest();
            request.setPage(-5);
            request.setSize(20);

            // when
            Pageable result = PageableBuilderUtil.getPageableNoUpperBoundRestrictionOnPageSize(request);

            // then
            assertThat(result.getPageNumber()).isEqualTo(0);
        }

        @Test
        @DisplayName("Should parse single sort property with direction")
        void shouldParseSingleSortPropertyWithDirection() {
            // given
            VatPageRequest request = new VatPageRequest();
            request.setPage(0);
            request.setSize(20);
            request.setSortStr("name,asc");

            // when
            Pageable result = PageableBuilderUtil.getPageableNoUpperBoundRestrictionOnPageSize(request);

            // then
            assertThat(result.getSort()).isNotNull();
            assertThat(result.getSort().isSorted()).isTrue();
            assertThat(result.getSort().getOrderFor("name")).isNotNull();
            assertThat(result.getSort().getOrderFor("name").getDirection()).isEqualTo(Sort.Direction.ASC);
        }

        @Test
        @DisplayName("Should parse descending sort direction")
        void shouldParseDescendingSortDirection() {
            // given
            VatPageRequest request = new VatPageRequest();
            request.setPage(0);
            request.setSize(20);
            request.setSortStr("createdDate,desc");

            // when
            Pageable result = PageableBuilderUtil.getPageableNoUpperBoundRestrictionOnPageSize(request);

            // then
            assertThat(result.getSort()).isNotNull();
            assertThat(result.getSort().getOrderFor("createdDate")).isNotNull();
            assertThat(result.getSort().getOrderFor("createdDate").getDirection()).isEqualTo(Sort.Direction.DESC);
        }

        @Test
        @DisplayName("Should parse multiple sort properties separated by semicolon")
        void shouldParseMultipleSortPropertiesSeparatedBySemicolon() {
            // given
            VatPageRequest request = new VatPageRequest();
            request.setPage(0);
            request.setSize(20);
            request.setSortStr("name,asc;createdDate,desc");

            // when
            Pageable result = PageableBuilderUtil.getPageableNoUpperBoundRestrictionOnPageSize(request);

            // then
            assertThat(result.getSort()).isNotNull();
            assertThat(result.getSort().isSorted()).isTrue();
        }

        @Test
        @DisplayName("Should handle null sort string")
        void shouldHandleNullSortString() {
            // given
            VatPageRequest request = new VatPageRequest();
            request.setPage(0);
            request.setSize(20);
            request.setSortStr(null);

            // when
            Pageable result = PageableBuilderUtil.getPageableNoUpperBoundRestrictionOnPageSize(request);

            // then
            assertThat(result.getSort()).isEqualTo(Sort.unsorted());
        }

        @Test
        @DisplayName("Should handle multiple properties with same direction")
        void shouldHandleMultiplePropertiesWithSameDirection() {
            // given
            VatPageRequest request = new VatPageRequest();
            request.setPage(0);
            request.setSize(20);
            request.setSortStr("firstName,lastName,asc");

            // when
            Pageable result = PageableBuilderUtil.getPageableNoUpperBoundRestrictionOnPageSize(request);

            // then
            assertThat(result.getSort()).isNotNull();
            assertThat(result.getSort().isSorted()).isTrue();
        }
    }

    @Nested
    @DisplayName("Edge Cases Tests")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should handle boundary page size of 10")
        void shouldHandleBoundaryPageSizeOf10() {
            // when
            Pageable result = PageableBuilderUtil.getPageable(10, 0);

            // then
            assertThat(result.getPageSize()).isEqualTo(10);
        }

        @Test
        @DisplayName("Should handle boundary page size of 100")
        void shouldHandleBoundaryPageSizeOf100() {
            // when
            Pageable result = PageableBuilderUtil.getPageable(100, 0);

            // then
            assertThat(result.getPageSize()).isEqualTo(100);
        }

        @Test
        @DisplayName("Should calculate correct offset")
        void shouldCalculateCorrectOffset() {
            // when
            Pageable result = PageableBuilderUtil.getPageable(20, 5);

            // then
            assertThat(result.getOffset()).isEqualTo(100); // page 5 * size 20 = offset 100
        }

        @Test
        @DisplayName("Should allow very large page numbers")
        void shouldAllowVeryLargePageNumbers() {
            // when
            Pageable result = PageableBuilderUtil.getPageable(20, 1000000);

            // then
            assertThat(result.getPageNumber()).isEqualTo(1000000);
        }
    }
}
