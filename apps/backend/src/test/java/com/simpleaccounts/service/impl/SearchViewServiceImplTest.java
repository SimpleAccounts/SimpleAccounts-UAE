package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.SearchViewDao;
import com.simpleaccounts.entity.SearchView;
import com.simpleaccounts.exceptions.ServiceException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SearchViewServiceImplTest {

    @Mock
    private SearchViewDao searchViewDao;

    @InjectMocks
    private SearchViewServiceImpl searchViewService;

    private SearchView testSearchView1;
    private SearchView testSearchView2;
    private SearchView testSearchView3;

    @BeforeEach
    void setUp() {
        testSearchView1 = new SearchView();
        testSearchView1.setId(1);
        testSearchView1.setItemName("Customer ABC Company");
        testSearchView1.setItemType("Customer");
        testSearchView1.setItemCode("CUST001");

        testSearchView2 = new SearchView();
        testSearchView2.setId(2);
        testSearchView2.setItemName("Product ABC Widget");
        testSearchView2.setItemType("Product");
        testSearchView2.setItemCode("PROD001");

        testSearchView3 = new SearchView();
        testSearchView3.setId(3);
        testSearchView3.setItemName("Supplier ABC Traders");
        testSearchView3.setItemType("Supplier");
        testSearchView3.setItemCode("SUPP001");
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnSearchViewDaoWhenGetDaoCalled() {
        assertThat(searchViewService.getDao()).isEqualTo(searchViewDao);
    }

    @Test
    void shouldReturnNonNullDaoInstance() {
        assertThat(searchViewService.getDao()).isNotNull();
    }

    // ========== getSearchedItem Tests ==========

    @Test
    void shouldReturnMatchingItemsWhenSearchTokenProvided() {
        String searchToken = "ABC";
        List<SearchView> expectedResults = Arrays.asList(testSearchView1, testSearchView2, testSearchView3);
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(expectedResults);

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testSearchView1, testSearchView2, testSearchView3);
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldReturnEmptyListWhenNoItemsMatch() {
        String searchToken = "XYZ";
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(Collections.emptyList());

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldReturnSingleItemWhenOnlyOneMatches() {
        String searchToken = "Customer";
        List<SearchView> expectedResults = Collections.singletonList(testSearchView1);
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(expectedResults);

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(testSearchView1);
        assertThat(result.get(0).getItemType()).isEqualTo("Customer");
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldHandleEmptySearchToken() {
        String searchToken = "";
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(Collections.emptyList());

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldHandleNullSearchToken() {
        when(searchViewDao.getSearchedItem(null)).thenReturn(Collections.emptyList());

        List<SearchView> result = searchViewService.getSearchedItem(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(searchViewDao, times(1)).getSearchedItem(null);
    }

    @Test
    void shouldHandleCaseSensitiveSearch() {
        String searchToken = "abc";
        List<SearchView> expectedResults = Arrays.asList(testSearchView1, testSearchView2);
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(expectedResults);

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldReturnNullWhenDaoReturnsNull() {
        String searchToken = "test";
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(null);

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNull();
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldHandleSpecialCharactersInSearchToken() {
        String searchToken = "ABC@#$";
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(Collections.emptyList());

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldHandleNumericSearchToken() {
        String searchToken = "001";
        List<SearchView> expectedResults = Arrays.asList(testSearchView1, testSearchView2, testSearchView3);
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(expectedResults);

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldHandleWhitespaceInSearchToken() {
        String searchToken = "  ABC  ";
        List<SearchView> expectedResults = Collections.singletonList(testSearchView1);
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(expectedResults);

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldHandleMultipleConsecutiveSearches() {
        when(searchViewDao.getSearchedItem("ABC")).thenReturn(Arrays.asList(testSearchView1));
        when(searchViewDao.getSearchedItem("Product")).thenReturn(Arrays.asList(testSearchView2));
        when(searchViewDao.getSearchedItem("Supplier")).thenReturn(Arrays.asList(testSearchView3));

        List<SearchView> result1 = searchViewService.getSearchedItem("ABC");
        List<SearchView> result2 = searchViewService.getSearchedItem("Product");
        List<SearchView> result3 = searchViewService.getSearchedItem("Supplier");

        assertThat(result1).hasSize(1);
        assertThat(result2).hasSize(1);
        assertThat(result3).hasSize(1);
        verify(searchViewDao, times(1)).getSearchedItem("ABC");
        verify(searchViewDao, times(1)).getSearchedItem("Product");
        verify(searchViewDao, times(1)).getSearchedItem("Supplier");
    }

    @Test
    void shouldReturnItemsWithCompleteData() {
        SearchView detailedView = new SearchView();
        detailedView.setId(10);
        detailedView.setItemName("Detailed Item Name");
        detailedView.setItemType("DetailedType");
        detailedView.setItemCode("DET001");

        String searchToken = "Detailed";
        List<SearchView> expectedResults = Collections.singletonList(detailedView);
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(expectedResults);

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(10);
        assertThat(result.get(0).getItemName()).isEqualTo("Detailed Item Name");
        assertThat(result.get(0).getItemType()).isEqualTo("DetailedType");
        assertThat(result.get(0).getItemCode()).isEqualTo("DET001");
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldHandleLongSearchToken() {
        String searchToken = "This is a very long search token with multiple words and characters";
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(Collections.emptyList());

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldHandleSingleCharacterSearchToken() {
        String searchToken = "A";
        List<SearchView> expectedResults = Arrays.asList(testSearchView1, testSearchView2);
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(expectedResults);

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindSearchViewByPrimaryKey() {
        when(searchViewDao.findByPK(1)).thenReturn(testSearchView1);

        SearchView result = searchViewService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testSearchView1);
        assertThat(result.getId()).isEqualTo(1);
        verify(searchViewDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenSearchViewNotFoundByPK() {
        when(searchViewDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> searchViewService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(searchViewDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewSearchView() {
        searchViewService.persist(testSearchView1);

        verify(searchViewDao, times(1)).persist(testSearchView1);
    }

    @Test
    void shouldPersistMultipleSearchViews() {
        searchViewService.persist(testSearchView1);
        searchViewService.persist(testSearchView2);
        searchViewService.persist(testSearchView3);

        verify(searchViewDao, times(1)).persist(testSearchView1);
        verify(searchViewDao, times(1)).persist(testSearchView2);
        verify(searchViewDao, times(1)).persist(testSearchView3);
    }

    @Test
    void shouldUpdateExistingSearchView() {
        when(searchViewDao.update(testSearchView1)).thenReturn(testSearchView1);

        SearchView result = searchViewService.update(testSearchView1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testSearchView1);
        verify(searchViewDao, times(1)).update(testSearchView1);
    }

    @Test
    void shouldUpdateSearchViewAndReturnUpdatedEntity() {
        testSearchView1.setItemName("Updated Item Name");
        testSearchView1.setItemType("Updated Type");
        when(searchViewDao.update(testSearchView1)).thenReturn(testSearchView1);

        SearchView result = searchViewService.update(testSearchView1);

        assertThat(result).isNotNull();
        assertThat(result.getItemName()).isEqualTo("Updated Item Name");
        assertThat(result.getItemType()).isEqualTo("Updated Type");
        verify(searchViewDao, times(1)).update(testSearchView1);
    }

    @Test
    void shouldDeleteSearchView() {
        searchViewService.delete(testSearchView1);

        verify(searchViewDao, times(1)).delete(testSearchView1);
    }

    @Test
    void shouldDeleteMultipleSearchViews() {
        searchViewService.delete(testSearchView1);
        searchViewService.delete(testSearchView2);

        verify(searchViewDao, times(1)).delete(testSearchView1);
        verify(searchViewDao, times(1)).delete(testSearchView2);
    }

    @Test
    void shouldFindSearchViewsByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("itemType", "Customer");

        List<SearchView> expectedList = Collections.singletonList(testSearchView1);
        when(searchViewDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<SearchView> result = searchViewService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testSearchView1);
        verify(searchViewDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("itemType", "Unknown");

        when(searchViewDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<SearchView> result = searchViewService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(searchViewDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<SearchView> result = searchViewService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(searchViewDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<SearchView> result = searchViewService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(searchViewDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindSearchViewsByMultipleAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("itemType", "Product");
        attributes.put("itemCode", "PROD001");

        List<SearchView> expectedList = Collections.singletonList(testSearchView2);
        when(searchViewDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<SearchView> result = searchViewService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getItemType()).isEqualTo("Product");
        assertThat(result.get(0).getItemCode()).isEqualTo("PROD001");
        verify(searchViewDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleSearchViewWithMinimalData() {
        SearchView minimalView = new SearchView();
        minimalView.setId(99);

        String searchToken = "minimal";
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(Collections.singletonList(minimalView));

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(99);
        assertThat(result.get(0).getItemName()).isNull();
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldHandleLargeListOfSearchResults() {
        List<SearchView> largeList = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            SearchView view = new SearchView();
            view.setId(i);
            view.setItemName("Item " + i);
            view.setItemType("Type");
            largeList.add(view);
        }

        String searchToken = "Item";
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(largeList);

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(100);
        assertThat(result.get(0).getItemName()).isEqualTo("Item 1");
        assertThat(result.get(99).getItemName()).isEqualTo("Item 100");
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldHandleSearchViewWithEmptyStrings() {
        SearchView emptyView = new SearchView();
        emptyView.setId(50);
        emptyView.setItemName("");
        emptyView.setItemType("");
        emptyView.setItemCode("");

        String searchToken = "empty";
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(Collections.singletonList(emptyView));

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getItemName()).isEmpty();
        assertThat(result.get(0).getItemType()).isEmpty();
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldVerifyDaoInteractionForMultipleSearches() {
        when(searchViewDao.getSearchedItem(anyString())).thenReturn(Collections.emptyList());

        searchViewService.getSearchedItem("search1");
        searchViewService.getSearchedItem("search2");
        searchViewService.getSearchedItem("search3");

        verify(searchViewDao, times(3)).getSearchedItem(anyString());
    }

    @Test
    void shouldHandleSearchTokenWithUnicodeCharacters() {
        String searchToken = "ABC€£¥";
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(Collections.emptyList());

        List<SearchView> result = searchViewService.getSearchedItem(searchToken);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(searchViewDao, times(1)).getSearchedItem(searchToken);
    }

    @Test
    void shouldHandleRepeatedSearchesWithSameToken() {
        String searchToken = "ABC";
        when(searchViewDao.getSearchedItem(searchToken)).thenReturn(Arrays.asList(testSearchView1));

        searchViewService.getSearchedItem(searchToken);
        searchViewService.getSearchedItem(searchToken);
        searchViewService.getSearchedItem(searchToken);

        verify(searchViewDao, times(3)).getSearchedItem(searchToken);
    }
}
