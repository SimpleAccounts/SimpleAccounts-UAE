package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;

import com.simpleaccounts.entity.Title;
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
@DisplayName("TitleDaoImpl Unit Tests")
class TitleDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<Title> titleTypedQuery;

    @InjectMocks
    private TitleDaoImpl titleDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(titleDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(titleDao, "entityClass", Title.class);
    }

    @Test
    @DisplayName("Should return all titles")
    void getTitlesReturnsAllTitles() {
        // Arrange
        List<Title> expectedTitles = createTitleList(5);

        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(expectedTitles);

        // Act
        List<Title> result = titleDao.getTitles();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(expectedTitles);
    }

    @Test
    @DisplayName("Should return empty list when no titles exist")
    void getTitlesReturnsEmptyListWhenNoTitles() {
        // Arrange
        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<Title> result = titleDao.getTitles();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use correct named query")
    void getTitlesUsesCorrectNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        titleDao.getTitles();

        // Assert
        verify(entityManager).createNamedQuery("allTitles", Title.class);
    }

    @Test
    @DisplayName("Should return single title when only one exists")
    void getTitlesReturnsSingleTitle() {
        // Arrange
        List<Title> titles = Collections.singletonList(
            createTitle(1, "Mr.")
        );

        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(titles);

        // Act
        List<Title> result = titleDao.getTitles();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitleName()).isEqualTo("Mr.");
    }

    @Test
    @DisplayName("Should handle large list of titles")
    void getTitlesHandlesLargeList() {
        // Arrange
        List<Title> titles = createTitleList(100);

        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(titles);

        // Act
        List<Title> result = titleDao.getTitles();

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should return consistent results on multiple calls")
    void getTitlesReturnsConsistentResults() {
        // Arrange
        List<Title> titles = createTitleList(4);

        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(titles);

        // Act
        List<Title> result1 = titleDao.getTitles();
        List<Title> result2 = titleDao.getTitles();

        // Assert
        assertThat(result1).isEqualTo(result2);
    }

    @Test
    @DisplayName("Should call getResultList on typed query")
    void getTitlesCallsGetResultList() {
        // Arrange
        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        titleDao.getTitles();

        // Assert
        verify(titleTypedQuery).getResultList();
    }

    @Test
    @DisplayName("Should return titles in correct order")
    void getTitlesReturnsInCorrectOrder() {
        // Arrange
        Title title1 = createTitle(1, "Mr.");
        Title title2 = createTitle(2, "Mrs.");
        Title title3 = createTitle(3, "Ms.");
        List<Title> titles = Arrays.asList(title1, title2, title3);

        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(titles);

        // Act
        List<Title> result = titleDao.getTitles();

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getTitleId()).isEqualTo(1);
        assertThat(result.get(1).getTitleId()).isEqualTo(2);
        assertThat(result.get(2).getTitleId()).isEqualTo(3);
    }

    @Test
    @DisplayName("Should call entity manager exactly once")
    void getTitlesCallsEntityManagerOnce() {
        // Arrange
        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        titleDao.getTitles();

        // Assert
        verify(entityManager, times(1)).createNamedQuery("allTitles", Title.class);
    }

    @Test
    @DisplayName("Should handle null result list gracefully")
    void getTitlesHandlesNullResultList() {
        // Arrange
        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<Title> result = titleDao.getTitles();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return titles with common prefixes")
    void getTitlesReturnsCommonTitles() {
        // Arrange
        Title mr = createTitle(1, "Mr.");
        Title mrs = createTitle(2, "Mrs.");
        Title ms = createTitle(3, "Ms.");
        Title dr = createTitle(4, "Dr.");
        List<Title> titles = Arrays.asList(mr, mrs, ms, dr);

        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(titles);

        // Act
        List<Title> result = titleDao.getTitles();

        // Assert
        assertThat(result).hasSize(4);
        assertThat(result).extracting(Title::getTitleName)
            .containsExactly("Mr.", "Mrs.", "Ms.", "Dr.");
    }

    @Test
    @DisplayName("Should return titles with special characters")
    void getTitlesHandlesSpecialCharacters() {
        // Arrange
        List<Title> titles = Arrays.asList(
            createTitle(1, "Prof."),
            createTitle(2, "Eng."),
            createTitle(3, "Capt.")
        );

        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(titles);

        // Act
        List<Title> result = titleDao.getTitles();

        // Assert
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should verify typed query class type")
    void getTitlesUsesCorrectTypedQueryClass() {
        // Arrange
        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        titleDao.getTitles();

        // Assert
        verify(entityManager).createNamedQuery(eq("allTitles"), eq(Title.class));
    }

    @Test
    @DisplayName("Should handle titles with long names")
    void getTitlesHandlesLongTitleNames() {
        // Arrange
        List<Title> titles = Collections.singletonList(
            createTitle(1, "His Excellency")
        );

        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(titles);

        // Act
        List<Title> result = titleDao.getTitles();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitleName()).isEqualTo("His Excellency");
    }

    @Test
    @DisplayName("Should handle titles with numbers")
    void getTitlesHandlesTitlesWithNumbers() {
        // Arrange
        List<Title> titles = Collections.singletonList(
            createTitle(1, "Title 123")
        );

        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(titles);

        // Act
        List<Title> result = titleDao.getTitles();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitleName()).contains("123");
    }

    @Test
    @DisplayName("Should return titles with different IDs")
    void getTitlesReturnsDifferentIds() {
        // Arrange
        Title title1 = createTitle(10, "Mr.");
        Title title2 = createTitle(20, "Mrs.");
        Title title3 = createTitle(30, "Ms.");
        List<Title> titles = Arrays.asList(title1, title2, title3);

        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(titles);

        // Act
        List<Title> result = titleDao.getTitles();

        // Assert
        assertThat(result).extracting(Title::getTitleId)
            .containsExactly(10, 20, 30);
    }

    @Test
    @DisplayName("Should handle zero ID title")
    void getTitlesHandlesZeroId() {
        // Arrange
        List<Title> titles = Collections.singletonList(
            createTitle(0, "Unknown")
        );

        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(titles);

        // Act
        List<Title> result = titleDao.getTitles();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitleId()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should verify executeNamedQuery is used from AbstractDao")
    void getTitlesUsesExecuteNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        titleDao.getTitles();

        // Assert
        verify(entityManager).createNamedQuery("allTitles", Title.class);
        verify(titleTypedQuery).getResultList();
    }

    @Test
    @DisplayName("Should handle titles with empty string names")
    void getTitlesHandlesEmptyStringNames() {
        // Arrange
        List<Title> titles = Collections.singletonList(
            createTitle(1, "")
        );

        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(titles);

        // Act
        List<Title> result = titleDao.getTitles();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitleName()).isEmpty();
    }

    @Test
    @DisplayName("Should handle maximum integer ID")
    void getTitlesHandlesMaxIntegerId() {
        // Arrange
        List<Title> titles = Collections.singletonList(
            createTitle(Integer.MAX_VALUE, "Test")
        );

        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(titles);

        // Act
        List<Title> result = titleDao.getTitles();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitleId()).isEqualTo(Integer.MAX_VALUE);
    }

    @Test
    @DisplayName("Should return titles with duplicate names but different IDs")
    void getTitlesHandlesDuplicateNames() {
        // Arrange
        Title title1 = createTitle(1, "Mr.");
        Title title2 = createTitle(2, "Mr.");
        List<Title> titles = Arrays.asList(title1, title2);

        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(titles);

        // Act
        List<Title> result = titleDao.getTitles();

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result).extracting(Title::getTitleName)
            .containsExactly("Mr.", "Mr.");
    }

    @Test
    @DisplayName("Should verify result list is fetched from query")
    void getTitlesFetchesResultListFromQuery() {
        // Arrange
        List<Title> titles = createTitleList(3);

        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(titles);

        // Act
        titleDao.getTitles();

        // Assert
        verify(titleTypedQuery, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should handle titles with whitespace")
    void getTitlesHandlesWhitespace() {
        // Arrange
        List<Title> titles = Arrays.asList(
            createTitle(1, "  Mr.  "),
            createTitle(2, " Mrs. ")
        );

        when(entityManager.createNamedQuery("allTitles", Title.class))
            .thenReturn(titleTypedQuery);
        when(titleTypedQuery.getResultList())
            .thenReturn(titles);

        // Act
        List<Title> result = titleDao.getTitles();

        // Assert
        assertThat(result).hasSize(2);
    }

    private List<Title> createTitleList(int count) {
        List<Title> titles = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            titles.add(createTitle(i + 1, "Title " + (i + 1)));
        }
        return titles;
    }

    private Title createTitle(Integer id, String name) {
        Title title = new Title();
        title.setTitleId(id);
        title.setTitleName(name);
        return title;
    }
}
