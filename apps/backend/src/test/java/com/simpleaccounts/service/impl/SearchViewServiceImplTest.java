package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import com.simpleaccounts.dao.SearchViewDao;
import com.simpleaccounts.entity.SearchView;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for SearchViewServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
class SearchViewServiceImplTest {

    @Mock
    private SearchViewDao searchViewDao;

    @InjectMocks
    private SearchViewServiceImpl searchViewService;

    private SearchView testSearchView;

    @BeforeEach
    void setUp() {
        testSearchView = new SearchView();
        testSearchView.setId(1);
        testSearchView.setName("Test Invoice");
        testSearchView.setDescription("Invoice Description");
        testSearchView.setCreatedBy(1);
        testSearchView.setCreatedDate(LocalDateTime.now());
        testSearchView.setDeleteFlag(false);
    }

    // ========== getSearchedItem Tests ==========

    @Test
    void shouldReturnSearchResultsForValidToken() {
        String searchToken = "Invoice";
        SearchView view1 = createSearchView(1, "Invoice 001", "First invoice");
        SearchView view2 = createSearchView(2, "Invoice 002", "Second invoice");
        List<SearchView> expectedResults = Arrays.asList(view1, view2);

        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(expectedResults);

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull().hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Invoice 001");
        assertThat(result.get(1).getName()).isEqualTo("Invoice 002");
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldReturnEmptyListWhenNoMatches() {
        String searchToken = "NonExistent";
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(Collections.emptyList());

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull().isEmpty();
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldHandleEmptySearchToken() {
        String emptyToken = "";
        when(searchViewDao.getSearchedItem(emptyToken)).thenReturn(Collections.emptyList());

        List<SearchView> result = searchViewService.getSearchedItem(emptyToken);

        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    void shouldHandleNullSearchToken() {
        when(searchViewDao.getSearchedItem(null)).thenReturn(Collections.emptyList());

        List<SearchView> result = searchViewService.getSearchedItem(null);

        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    void shouldReturnSingleResult() {
        String searchToken = "UniqueItem";
        List<SearchView> expectedResults = Collections.singletonList(testSearchView);

        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(expectedResults);

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1);
    }

    @Test
    void shouldHandleSearchWithSpecialCharacters() {
        String specialToken = "Invoice #123 & Order @456";
        when(searchViewDao.getSearchedItem(specialToken)).thenReturn(Collections.singletonList(testSearchView));

        List<SearchView> result = searchViewService.getSearchedItem(specialToken);

        assertThat(result).isNotNull();
        verify(searchViewDao).getSearchedItem(specialToken);
    }

    @Test
    void shouldHandleSearchWithNumbers() {
        String numericToken = "INV-2024-001";
        SearchView invoiceView = createSearchView(100, "INV-2024-001", "Invoice for 2024");
        when(searchViewDao.getSearchedItem(numericToken)).thenReturn(Collections.singletonList(invoiceView));

        List<SearchView> result = searchViewService.getSearchedItem(numericToken);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("INV-2024-001");
    }

    @Test
    void shouldHandleLargeResultSet() {
        String searchToken = "common";
        List<SearchView> largeList = new java.util.ArrayList<>();
        for (int i = 0; i < 100; i++) {
            largeList.add(createSearchView(i, "Item " + i, "Description " + i));
        }

        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(largeList);

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).hasSize(100);
    }

    @Test
    void shouldHandleSearchWithUnicode() {
        String unicodeToken = "فاتورة";
        SearchView arabicView = createSearchView(1, "فاتورة 001", "Arabic invoice");
        when(searchViewDao.getSearchedItem(unicodeToken)).thenReturn(Collections.singletonList(arabicView));

        List<SearchView> result = searchViewService.getSearchedItem(unicodeToken);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("فاتورة 001");
    }

    @Test
    void shouldCallDaoExactlyOnce() {
        String searchToken = "test";
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(Collections.emptyList());

        searchViewService.getSearchedItem(searchToken);

        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldPreserveResultOrder() {
        String searchToken = "ordered";
        SearchView first = createSearchView(1, "First", "First item");
        SearchView second = createSearchView(2, "Second", "Second item");
        SearchView third = createSearchView(3, "Third", "Third item");
        List<SearchView> orderedResults = Arrays.asList(first, second, third);

        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(orderedResults);

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result.get(0).getName()).isEqualTo("First");
        assertThat(result.get(1).getName()).isEqualTo("Second");
        assertThat(result.get(2).getName()).isEqualTo("Third");
    }

    @Test
    void shouldHandleCaseSensitiveSearch() {
        String lowerCaseToken = "invoice";
        String upperCaseToken = "INVOICE";

        when(searchViewDao.getSearchedItem(lowerCaseToken)).thenReturn(Collections.singletonList(testSearchView));
        when(searchViewDao.getSearchedItem(upperCaseToken)).thenReturn(Collections.emptyList());

        List<SearchView> lowerResult = searchViewService.getSearchedItem(lowerCaseToken);
        List<SearchView> upperResult = searchViewService.getSearchedItem(upperCaseToken);

        assertThat(lowerResult).hasSize(1);
        assertThat(upperResult).isEmpty();
    }

    @Test
    void shouldHandleWhitespaceInSearchToken() {
        String tokenWithSpaces = "  test  ";
        when(searchViewDao.getSearchedItem(tokenWithSpaces)).thenReturn(Collections.singletonList(testSearchView));

        List<SearchView> result = searchViewService.getSearchedItem(tokenWithSpaces);

        assertThat(result).isNotNull();
        verify(searchViewDao).getSearchedItem(tokenWithSpaces);
    }

    // ========== Helper Methods ==========

    private SearchView createSearchView(int id, String name, String description) {
        SearchView view = new SearchView();
        view.setId(id);
        view.setName(name);
        view.setDescription(description);
        view.setCreatedBy(1);
        view.setCreatedDate(LocalDateTime.now());
        view.setDeleteFlag(false);
        return view;
    }
}
