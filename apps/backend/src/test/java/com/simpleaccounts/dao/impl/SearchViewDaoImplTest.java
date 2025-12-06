package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.SearchView;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("SearchViewDaoImpl Unit Tests")
class SearchViewDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<SearchView> searchViewQuery;

    @InjectMocks
    private SearchViewDaoImpl searchViewDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(searchViewDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(searchViewDao, "entityClass", SearchView.class);
    }

    @Test
    @DisplayName("Should return searched items when matching by name")
    void getSearchedItemReturnsItemsMatchingByName() {
        // Arrange
        String searchToken = "invoice";
        List<SearchView> expectedItems = createSearchViewList(3, "Invoice");

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(expectedItems);

        // Act
        List<SearchView> result = searchViewDao.getSearchedItem(searchToken);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(expectedItems);
    }

    @Test
    @DisplayName("Should return searched items when matching by description")
    void getSearchedItemReturnsItemsMatchingByDescription() {
        // Arrange
        String searchToken = "payment";
        List<SearchView> expectedItems = createSearchViewList(2, "Pay");

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(expectedItems);

        // Act
        List<SearchView> result = searchViewDao.getSearchedItem(searchToken);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should return empty list when no items match search token")
    void getSearchedItemReturnsEmptyListWhenNoMatches() {
        // Arrange
        String searchToken = "nonexistent";

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<SearchView> result = searchViewDao.getSearchedItem(searchToken);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle null result list")
    void getSearchedItemHandlesNullResultList() {
        // Arrange
        String searchToken = "test";

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(null);

        // Act
        List<SearchView> result = searchViewDao.getSearchedItem(searchToken);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should set search token parameter correctly")
    void getSearchedItemSetsSearchTokenParameter() {
        // Arrange
        String searchToken = "customer";

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        searchViewDao.getSearchedItem(searchToken);

        // Assert
        verify(searchViewQuery).setParameter("searchToken", searchToken);
    }

    @Test
    @DisplayName("Should create query with correct JPQL using LIKE operator")
    void getSearchedItemCreatesCorrectQuery() {
        // Arrange
        String searchToken = "test";
        String expectedQuery = "SELECT s FROM SearchView s WHERE s.name LIKE '%'||:searchToken||'%' OR s.description LIKE '%'||:searchToken||'%'";

        when(entityManager.createQuery(eq(expectedQuery), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        searchViewDao.getSearchedItem(searchToken);

        // Assert
        verify(entityManager).createQuery(eq(expectedQuery), eq(SearchView.class));
    }

    @Test
    @DisplayName("Should handle empty search token")
    void getSearchedItemHandlesEmptySearchToken() {
        // Arrange
        String searchToken = "";
        List<SearchView> allItems = createSearchViewList(10, "Item");

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(allItems);

        // Act
        List<SearchView> result = searchViewDao.getSearchedItem(searchToken);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(10);
    }

    @Test
    @DisplayName("Should handle single character search token")
    void getSearchedItemHandlesSingleCharacterSearchToken() {
        // Arrange
        String searchToken = "a";
        List<SearchView> expectedItems = createSearchViewList(5, "Account");

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(expectedItems);

        // Act
        List<SearchView> result = searchViewDao.getSearchedItem(searchToken);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
    }

    @Test
    @DisplayName("Should handle long search token")
    void getSearchedItemHandlesLongSearchToken() {
        // Arrange
        String searchToken = "this is a very long search token with multiple words";
        List<SearchView> expectedItems = createSearchViewList(1, "Long");

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(expectedItems);

        // Act
        List<SearchView> result = searchViewDao.getSearchedItem(searchToken);

        // Assert
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should handle search token with special characters")
    void getSearchedItemHandlesSpecialCharactersInSearchToken() {
        // Arrange
        String searchToken = "test@#$%";
        List<SearchView> expectedItems = createSearchViewList(2, "Special");

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(expectedItems);

        // Act
        List<SearchView> result = searchViewDao.getSearchedItem(searchToken);

        // Assert
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should handle search token with whitespace")
    void getSearchedItemHandlesWhitespaceInSearchToken() {
        // Arrange
        String searchToken = "  test  ";

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        searchViewDao.getSearchedItem(searchToken);

        // Assert
        verify(searchViewQuery).setParameter("searchToken", searchToken);
    }

    @Test
    @DisplayName("Should call getResultList exactly once")
    void getSearchedItemCallsGetResultListOnce() {
        // Arrange
        String searchToken = "test";

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        searchViewDao.getSearchedItem(searchToken);

        // Assert
        verify(searchViewQuery, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should call createQuery exactly once")
    void getSearchedItemCallsCreateQueryOnce() {
        // Arrange
        String searchToken = "test";

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        searchViewDao.getSearchedItem(searchToken);

        // Assert
        verify(entityManager, times(1)).createQuery(anyString(), eq(SearchView.class));
    }

    @Test
    @DisplayName("Should return single item when only one match found")
    void getSearchedItemReturnsSingleItemWhenOneMatch() {
        // Arrange
        String searchToken = "unique";
        SearchView item = createSearchView(1, "Unique Item", "Unique description");
        List<SearchView> expectedItems = Collections.singletonList(item);

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(expectedItems);

        // Act
        List<SearchView> result = searchViewDao.getSearchedItem(searchToken);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Unique Item");
    }

    @Test
    @DisplayName("Should return multiple items when multiple matches found")
    void getSearchedItemReturnsMultipleItemsWhenMultipleMatches() {
        // Arrange
        String searchToken = "account";
        List<SearchView> expectedItems = createSearchViewList(7, "Account");

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(expectedItems);

        // Act
        List<SearchView> result = searchViewDao.getSearchedItem(searchToken);

        // Assert
        assertThat(result).hasSize(7);
    }

    @Test
    @DisplayName("Should handle case-sensitive search token")
    void getSearchedItemHandlesCaseSensitiveSearchToken() {
        // Arrange
        String searchToken = "TEST";
        List<SearchView> expectedItems = createSearchViewList(3, "Test");

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(expectedItems);

        // Act
        List<SearchView> result = searchViewDao.getSearchedItem(searchToken);

        // Assert
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should verify query searches both name and description fields")
    void getSearchedItemSearchesBothNameAndDescription() {
        // Arrange
        String searchToken = "search";
        String queryPattern = ".*s.name LIKE.*OR s.description LIKE.*";

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        searchViewDao.getSearchedItem(searchToken);

        // Assert
        verify(entityManager).createQuery(
            org.mockito.ArgumentMatchers.matches(queryPattern),
            eq(SearchView.class)
        );
    }

    @Test
    @DisplayName("Should handle numeric search token")
    void getSearchedItemHandlesNumericSearchToken() {
        // Arrange
        String searchToken = "12345";
        List<SearchView> expectedItems = createSearchViewList(2, "Item");

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(expectedItems);

        // Act
        List<SearchView> result = searchViewDao.getSearchedItem(searchToken);

        // Assert
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should return items sorted by result order")
    void getSearchedItemReturnsItemsInResultOrder() {
        // Arrange
        String searchToken = "item";
        SearchView item1 = createSearchView(1, "Item A", "First item");
        SearchView item2 = createSearchView(2, "Item B", "Second item");
        SearchView item3 = createSearchView(3, "Item C", "Third item");
        List<SearchView> expectedItems = Arrays.asList(item1, item2, item3);

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(expectedItems);

        // Act
        List<SearchView> result = searchViewDao.getSearchedItem(searchToken);

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getName()).isEqualTo("Item A");
        assertThat(result.get(1).getName()).isEqualTo("Item B");
        assertThat(result.get(2).getName()).isEqualTo("Item C");
    }

    @Test
    @DisplayName("Should handle search with different tokens returning different results")
    void getSearchedItemReturnsDifferentResultsForDifferentTokens() {
        // Arrange
        String token1 = "invoice";
        String token2 = "payment";
        List<SearchView> items1 = createSearchViewList(3, "Invoice");
        List<SearchView> items2 = createSearchViewList(5, "Payment");

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", token1))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", token2))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(items1)
            .thenReturn(items2);

        // Act
        List<SearchView> result1 = searchViewDao.getSearchedItem(token1);
        List<SearchView> result2 = searchViewDao.getSearchedItem(token2);

        // Assert
        assertThat(result1).hasSize(3);
        assertThat(result2).hasSize(5);
    }

    @Test
    @DisplayName("Should verify SearchView entity has required fields")
    void searchViewEntityHasRequiredFields() {
        // Arrange
        SearchView searchView = createSearchView(1, "Test Name", "Test Description");

        // Assert
        assertThat(searchView.getName()).isNotNull();
        assertThat(searchView.getDescription()).isNotNull();
        assertThat(searchView.getName()).isEqualTo("Test Name");
        assertThat(searchView.getDescription()).isEqualTo("Test Description");
    }

    @Test
    @DisplayName("Should handle large result set")
    void getSearchedItemHandlesLargeResultSet() {
        // Arrange
        String searchToken = "common";
        List<SearchView> expectedItems = createSearchViewList(1000, "Common");

        when(entityManager.createQuery(anyString(), eq(SearchView.class)))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.setParameter("searchToken", searchToken))
            .thenReturn(searchViewQuery);
        when(searchViewQuery.getResultList())
            .thenReturn(expectedItems);

        // Act
        List<SearchView> result = searchViewDao.getSearchedItem(searchToken);

        // Assert
        assertThat(result).hasSize(1000);
    }

    private List<SearchView> createSearchViewList(int count, String namePrefix) {
        List<SearchView> items = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            items.add(createSearchView(i + 1, namePrefix + " " + (i + 1), "Description for " + namePrefix + " " + (i + 1)));
        }
        return items;
    }

    private SearchView createSearchView(Integer id, String name, String description) {
        SearchView searchView = new SearchView();
        searchView.setName(name);
        searchView.setDescription(description);
        return searchView;
    }
}
