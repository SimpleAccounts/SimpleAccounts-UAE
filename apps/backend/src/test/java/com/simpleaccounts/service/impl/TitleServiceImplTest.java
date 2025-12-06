package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.TitleDao;
import com.simpleaccounts.entity.Title;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TitleServiceImplTest {

    @Mock
    private TitleDao titleDao;

    @InjectMocks
    private TitleServiceImpl titleService;

    private Title title1;
    private Title title2;
    private Title title3;
    private List<Title> titleList;

    @BeforeEach
    void setUp() {
        title1 = new Title();
        title1.setTitleId(1);
        title1.setTitleCode("MR");
        title1.setTitleDescription("Mr.");

        title2 = new Title();
        title2.setTitleId(2);
        title2.setTitleCode("MRS");
        title2.setTitleDescription("Mrs.");

        title3 = new Title();
        title3.setTitleId(3);
        title3.setTitleCode("MS");
        title3.setTitleDescription("Ms.");

        titleList = new ArrayList<>(Arrays.asList(title1, title2, title3));
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnTitleDaoWhenGetDaoCalled() {
        assertThat(titleService.getDao()).isEqualTo(titleDao);
    }

    @Test
    void shouldReturnSameDaoInstanceOnMultipleCalls() {
        TitleDao dao1 = titleService.getDao();
        TitleDao dao2 = titleService.getDao();
        TitleDao dao3 = titleService.getDao();

        assertThat(dao1).isEqualTo(titleDao);
        assertThat(dao2).isEqualTo(titleDao);
        assertThat(dao3).isEqualTo(titleDao);
        assertThat(dao1).isSameAs(dao2);
        assertThat(dao2).isSameAs(dao3);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(titleService.getDao()).isNotNull();
    }

    // ========== getTitles Tests ==========

    @Test
    void shouldReturnTitleListWhenTitlesExist() {
        when(titleDao.getTitles()).thenReturn(titleList);

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(title1, title2, title3);
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldReturnEmptyListWhenNoTitlesExist() {
        when(titleDao.getTitles()).thenReturn(Collections.emptyList());

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldReturnSingleTitleInList() {
        when(titleDao.getTitles()).thenReturn(Collections.singletonList(title1));

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(title1);
        assertThat(result.get(0).getTitleCode()).isEqualTo("MR");
        assertThat(result.get(0).getTitleDescription()).isEqualTo("Mr.");
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldReturnAllTitlesWithCorrectData() {
        when(titleDao.getTitles()).thenReturn(titleList);

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result.get(0).getTitleId()).isEqualTo(1);
        assertThat(result.get(0).getTitleCode()).isEqualTo("MR");
        assertThat(result.get(0).getTitleDescription()).isEqualTo("Mr.");
        assertThat(result.get(1).getTitleId()).isEqualTo(2);
        assertThat(result.get(1).getTitleCode()).isEqualTo("MRS");
        assertThat(result.get(1).getTitleDescription()).isEqualTo("Mrs.");
        assertThat(result.get(2).getTitleId()).isEqualTo(3);
        assertThat(result.get(2).getTitleCode()).isEqualTo("MS");
        assertThat(result.get(2).getTitleDescription()).isEqualTo("Ms.");
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldHandleLargeListOfTitles() {
        List<Title> largeTitleList = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            Title title = new Title();
            title.setTitleId(i);
            title.setTitleCode("TITLE" + i);
            title.setTitleDescription("Title " + i);
            largeTitleList.add(title);
        }

        when(titleDao.getTitles()).thenReturn(largeTitleList);

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(50);
        assertThat(result.get(0).getTitleId()).isEqualTo(1);
        assertThat(result.get(49).getTitleId()).isEqualTo(50);
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldCallDaoGetTitlesOnlyOnce() {
        when(titleDao.getTitles()).thenReturn(titleList);

        titleService.getTitles();

        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldCallDaoGetTitlesMultipleTimesWhenMethodInvokedMultipleTimes() {
        when(titleDao.getTitles()).thenReturn(titleList);

        titleService.getTitles();
        titleService.getTitles();
        titleService.getTitles();

        verify(titleDao, times(3)).getTitles();
    }

    @Test
    void shouldReturnSameListInstanceFromDao() {
        when(titleDao.getTitles()).thenReturn(titleList);

        List<Title> result = titleService.getTitles();

        assertThat(result).isSameAs(titleList);
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldHandleTitleWithNullId() {
        Title titleWithNullId = new Title();
        titleWithNullId.setTitleId(null);
        titleWithNullId.setTitleCode("DR");
        titleWithNullId.setTitleDescription("Dr.");

        when(titleDao.getTitles()).thenReturn(Collections.singletonList(titleWithNullId));

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitleId()).isNull();
        assertThat(result.get(0).getTitleCode()).isEqualTo("DR");
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldHandleTitleWithNullCode() {
        Title titleWithNullCode = new Title();
        titleWithNullCode.setTitleId(10);
        titleWithNullCode.setTitleCode(null);
        titleWithNullCode.setTitleDescription("Unknown");

        when(titleDao.getTitles()).thenReturn(Collections.singletonList(titleWithNullCode));

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitleId()).isEqualTo(10);
        assertThat(result.get(0).getTitleCode()).isNull();
        assertThat(result.get(0).getTitleDescription()).isEqualTo("Unknown");
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldHandleTitleWithNullDescription() {
        Title titleWithNullDesc = new Title();
        titleWithNullDesc.setTitleId(11);
        titleWithNullDesc.setTitleCode("PROF");
        titleWithNullDesc.setTitleDescription(null);

        when(titleDao.getTitles()).thenReturn(Collections.singletonList(titleWithNullDesc));

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitleId()).isEqualTo(11);
        assertThat(result.get(0).getTitleCode()).isEqualTo("PROF");
        assertThat(result.get(0).getTitleDescription()).isNull();
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldHandleTitleWithEmptyCode() {
        Title titleWithEmptyCode = new Title();
        titleWithEmptyCode.setTitleId(12);
        titleWithEmptyCode.setTitleCode("");
        titleWithEmptyCode.setTitleDescription("Empty Code");

        when(titleDao.getTitles()).thenReturn(Collections.singletonList(titleWithEmptyCode));

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitleCode()).isEmpty();
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldHandleTitleWithEmptyDescription() {
        Title titleWithEmptyDesc = new Title();
        titleWithEmptyDesc.setTitleId(13);
        titleWithEmptyDesc.setTitleCode("ENG");
        titleWithEmptyDesc.setTitleDescription("");

        when(titleDao.getTitles()).thenReturn(Collections.singletonList(titleWithEmptyDesc));

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitleDescription()).isEmpty();
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldHandleMixedValidAndInvalidTitles() {
        Title validTitle = new Title();
        validTitle.setTitleId(1);
        validTitle.setTitleCode("MR");
        validTitle.setTitleDescription("Mr.");

        Title titleWithNulls = new Title();
        titleWithNulls.setTitleId(null);
        titleWithNulls.setTitleCode(null);
        titleWithNulls.setTitleDescription(null);

        List<Title> mixedList = Arrays.asList(validTitle, titleWithNulls);

        when(titleDao.getTitles()).thenReturn(mixedList);

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitleId()).isEqualTo(1);
        assertThat(result.get(1).getTitleId()).isNull();
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldHandleSpecialCharactersInTitleCode() {
        Title specialTitle = new Title();
        specialTitle.setTitleId(20);
        specialTitle.setTitleCode("DR.");
        specialTitle.setTitleDescription("Doctor");

        when(titleDao.getTitles()).thenReturn(Collections.singletonList(specialTitle));

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitleCode()).isEqualTo("DR.");
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldHandleSpecialCharactersInDescription() {
        Title specialTitle = new Title();
        specialTitle.setTitleId(21);
        specialTitle.setTitleCode("PROF");
        specialTitle.setTitleDescription("Prof. (Professor)");

        when(titleDao.getTitles()).thenReturn(Collections.singletonList(specialTitle));

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitleDescription()).isEqualTo("Prof. (Professor)");
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldReturnTitlesInSameOrderAsDao() {
        when(titleDao.getTitles()).thenReturn(titleList);

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result).containsExactlyElementsOf(titleList);
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldHandleNullReturnFromDao() {
        when(titleDao.getTitles()).thenReturn(null);

        List<Title> result = titleService.getTitles();

        assertThat(result).isNull();
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldDelegateToDao() {
        when(titleDao.getTitles()).thenReturn(titleList);

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldHandleDuplicateTitleCodes() {
        Title duplicate1 = new Title();
        duplicate1.setTitleId(1);
        duplicate1.setTitleCode("MR");
        duplicate1.setTitleDescription("Mr.");

        Title duplicate2 = new Title();
        duplicate2.setTitleId(2);
        duplicate2.setTitleCode("MR");
        duplicate2.setTitleDescription("Mister");

        List<Title> duplicateList = Arrays.asList(duplicate1, duplicate2);

        when(titleDao.getTitles()).thenReturn(duplicateList);

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitleCode()).isEqualTo("MR");
        assertThat(result.get(1).getTitleCode()).isEqualTo("MR");
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldHandleLongTitleDescriptions() {
        Title longTitle = new Title();
        longTitle.setTitleId(30);
        longTitle.setTitleCode("LONG");
        longTitle.setTitleDescription("This is a very long title description that contains many characters and words");

        when(titleDao.getTitles()).thenReturn(Collections.singletonList(longTitle));

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitleDescription()).hasSize(79);
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldHandleNumericTitleIds() {
        Title title = new Title();
        title.setTitleId(Integer.MAX_VALUE);
        title.setTitleCode("MAX");
        title.setTitleDescription("Max ID");

        when(titleDao.getTitles()).thenReturn(Collections.singletonList(title));

        List<Title> result = titleService.getTitles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitleId()).isEqualTo(Integer.MAX_VALUE);
        verify(titleDao, times(1)).getTitles();
    }

    @Test
    void shouldHandleConsecutiveCalls() {
        when(titleDao.getTitles()).thenReturn(titleList);

        List<Title> result1 = titleService.getTitles();
        List<Title> result2 = titleService.getTitles();

        assertThat(result1).isNotNull();
        assertThat(result2).isNotNull();
        assertThat(result1).hasSize(3);
        assertThat(result2).hasSize(3);
        verify(titleDao, times(2)).getTitles();
    }

    @Test
    void shouldNotModifyTitleListFromDao() {
        when(titleDao.getTitles()).thenReturn(titleList);

        List<Title> result = titleService.getTitles();

        assertThat(result).isSameAs(titleList);
        assertThat(result).hasSize(3);
        verify(titleDao, times(1)).getTitles();
    }
}
