package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.ContactFilterEnum;
import com.simpleaccounts.dao.ContactDao;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.EmailLogs;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.contactcontroller.ContactRequestFilterModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.EmaiLogsService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.EmailSender;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

@ExtendWith(MockitoExtension.class)
class ContactServiceImplTest {

    @Mock
    private ContactDao contactDao;

    @Mock
    private UserService userService;

    @Mock
    private EmailSender emailSender;

    @Mock
    private EmaiLogsService emaiLogsService;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private ResourceLoader resourceLoader;

    @InjectMocks
    private ContactServiceImpl contactService;

    private Contact testContact;
    private Currency testCurrency;
    private User testUser;
    private Company testCompany;

    @BeforeEach
    void setUp() {
        testCurrency = new Currency();
        testCurrency.setCurrencyCode(1);
        testCurrency.setCurrencyIsoCode("AED");

        testContact = new Contact();
        testContact.setContactId(1);
        testContact.setFirstName("John");
        testContact.setLastName("Doe");
        testContact.setEmail("john.doe@example.com");
        testContact.setOrganization("Test Org");
        testContact.setCurrency(testCurrency);

        testCompany = new Company();
        testCompany.setCompanyId(1);
        testCompany.setCompanyLogo(new byte[]{1, 2, 3});

        testUser = new User();
        testUser.setUserId(1);
        testUser.setUserEmail("admin@example.com");
        testUser.setCompany(testCompany);
    }

    @Test
    void shouldGetContactForDropdownWithContactType() {
        DropdownModel dropdown1 = new DropdownModel(1, "Contact 1");
        DropdownModel dropdown2 = new DropdownModel(2, "Contact 2");
        List<DropdownModel> expectedList = Arrays.asList(dropdown1, dropdown2);

        when(contactDao.getContactForDropdown(2)).thenReturn(expectedList);

        List<DropdownModel> result = contactService.getContactForDropdown(2);

        assertThat(result).isEqualTo(expectedList);
        assertThat(result).hasSize(2);
        verify(contactDao, times(1)).getContactForDropdown(2);
    }

    @Test
    void shouldGetContactForDropdownWithNullContactType() {
        when(contactDao.getContactForDropdown(null)).thenReturn(Collections.emptyList());

        List<DropdownModel> result = contactService.getContactForDropdown(null);

        assertThat(result).isEmpty();
        verify(contactDao, times(1)).getContactForDropdown(null);
    }

    @Test
    void shouldGetContactForDropdownObjectModelWithContactType() {
        DropdownObjectModel dropdown1 = new DropdownObjectModel(1, "Contact 1");
        DropdownObjectModel dropdown2 = new DropdownObjectModel(2, "Contact 2");

        List<DropdownObjectModel> expectedList = Arrays.asList(dropdown1, dropdown2);

        when(contactDao.getContactForDropdownObjectModel(2)).thenReturn(expectedList);

        List<DropdownObjectModel> result = contactService.getContactForDropdownObjectModel(2);

        assertThat(result).isEqualTo(expectedList);
        assertThat(result).hasSize(2);
        verify(contactDao, times(1)).getContactForDropdownObjectModel(2);
    }

    @Test
    void shouldGetContactForDropdownObjectModelWhenEmpty() {
        when(contactDao.getContactForDropdownObjectModel(anyInt())).thenReturn(Collections.emptyList());

        List<DropdownObjectModel> result = contactService.getContactForDropdownObjectModel(1);

        assertThat(result).isEmpty();
        verify(contactDao, times(1)).getContactForDropdownObjectModel(1);
    }

    @Test
    void shouldGetContactListWithFilterAndPagination() {
        Map<ContactFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ContactFilterEnum.CONTACT_TYPE, 2);

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setCount(100);

        when(contactDao.getContactList(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = contactService.getContactList(filterMap, paginationModel);

        assertThat(result).isEqualTo(expectedResponse);
        assertThat(result.getCount()).isEqualTo(100);
        verify(contactDao, times(1)).getContactList(filterMap, paginationModel);
    }

    @Test
    void shouldGetContactListWithEmptyFilter() {
        Map<ContactFilterEnum, Object> emptyMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel();

        when(contactDao.getContactList(emptyMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = contactService.getContactList(emptyMap, paginationModel);

        assertThat(result).isEqualTo(expectedResponse);
        verify(contactDao, times(1)).getContactList(emptyMap, paginationModel);
    }

    @Test
    void shouldGetAllContactsWithPagination() {
        List<Contact> expectedContacts = Arrays.asList(testContact);

        when(contactDao.getAllContacts(0, 10)).thenReturn(expectedContacts);

        List<Contact> result = contactService.getAllContacts(0, 10);

        assertThat(result).isEqualTo(expectedContacts);
        assertThat(result).hasSize(1);
        verify(contactDao, times(1)).getAllContacts(0, 10);
    }

    @Test
    void shouldGetAllContactsWithNullPagination() {
        when(contactDao.getAllContacts(null, null)).thenReturn(Collections.emptyList());

        List<Contact> result = contactService.getAllContacts(null, null);

        assertThat(result).isEmpty();
        verify(contactDao, times(1)).getAllContacts(null, null);
    }

    @Test
    void shouldGetContactsWithFilterModel() {
        ContactRequestFilterModel filterModel = new ContactRequestFilterModel();
        filterModel.setName("John");
        filterModel.setEmail("john@example.com");
        filterModel.setContactType(2);

        List<Contact> expectedContacts = Arrays.asList(testContact);

        when(contactDao.getContacts(filterModel, 0, 10)).thenReturn(expectedContacts);

        List<Contact> result = contactService.getContacts(filterModel, 0, 10);

        assertThat(result).isEqualTo(expectedContacts);
        assertThat(result).hasSize(1);
        verify(contactDao, times(1)).getContacts(filterModel, 0, 10);
    }

    @Test
    void shouldGetContactsWithNullFilterModel() {
        when(contactDao.getContacts(null, 0, 10)).thenReturn(Collections.emptyList());

        List<Contact> result = contactService.getContacts(null, 0, 10);

        assertThat(result).isEmpty();
        verify(contactDao, times(1)).getContacts(null, 0, 10);
    }

    @Test
    void shouldGetContactsByTypeAndSearchQuery() {
        List<Contact> expectedContacts = Arrays.asList(testContact);

        when(contactDao.getContacts(2, "John", 0, 10)).thenReturn(expectedContacts);

        List<Contact> result = contactService.getContacts(2, "John", 0, 10);

        assertThat(result).isEqualTo(expectedContacts);
        assertThat(result).hasSize(1);
        verify(contactDao, times(1)).getContacts(2, "John", 0, 10);
    }

    @Test
    void shouldGetContactsByTypeWithEmptySearchQuery() {
        when(contactDao.getContacts(2, "", 0, 10)).thenReturn(Collections.emptyList());

        List<Contact> result = contactService.getContacts(2, "", 0, 10);

        assertThat(result).isEmpty();
        verify(contactDao, times(1)).getContacts(2, "", 0, 10);
    }

    @Test
    void shouldGetContactsByTypeWithNullSearchQuery() {
        when(contactDao.getContacts(2, null, 0, 10)).thenReturn(Collections.emptyList());

        List<Contact> result = contactService.getContacts(2, null, 0, 10);

        assertThat(result).isEmpty();
        verify(contactDao, times(1)).getContacts(2, null, 0, 10);
    }

    @Test
    void shouldReturnContactDao() {
        assertThat(contactService.getDao()).isEqualTo(contactDao);
    }

    @Test
    void shouldGetContactByEmail() {
        when(contactDao.getContactByEmail("john.doe@example.com"))
                .thenReturn(Optional.of(testContact));

        Optional<Contact> result = contactService.getContactByEmail("john.doe@example.com");

        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo(testContact);
        assertThat(result.get().getEmail()).isEqualTo("john.doe@example.com");
        verify(contactDao, times(1)).getContactByEmail("john.doe@example.com");
    }

    @Test
    void shouldReturnEmptyWhenContactNotFoundByEmail() {
        when(contactDao.getContactByEmail("nonexistent@example.com"))
                .thenReturn(Optional.empty());

        Optional<Contact> result = contactService.getContactByEmail("nonexistent@example.com");

        assertThat(result).isEmpty();
        verify(contactDao, times(1)).getContactByEmail("nonexistent@example.com");
    }

    @Test
    void shouldGetContactByEmailWithNullEmail() {
        when(contactDao.getContactByEmail(null)).thenReturn(Optional.empty());

        Optional<Contact> result = contactService.getContactByEmail(null);

        assertThat(result).isEmpty();
        verify(contactDao, times(1)).getContactByEmail(null);
    }

    @Test
    void shouldGetContactById() {
        when(contactDao.getContactByID(1)).thenReturn(Optional.of(testContact));

        Optional<Contact> result = contactService.getContactByID(1);

        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo(testContact);
        assertThat(result.get().getContactId()).isEqualTo(1);
        verify(contactDao, times(1)).getContactByID(1);
    }

    @Test
    void shouldReturnEmptyWhenContactNotFoundById() {
        when(contactDao.getContactByID(999)).thenReturn(Optional.empty());

        Optional<Contact> result = contactService.getContactByID(999);

        assertThat(result).isEmpty();
        verify(contactDao, times(1)).getContactByID(999);
    }

    @Test
    void shouldGetContactByIdWithNullId() {
        when(contactDao.getContactByID(null)).thenReturn(Optional.empty());

        Optional<Contact> result = contactService.getContactByID(null);

        assertThat(result).isEmpty();
        verify(contactDao, times(1)).getContactByID(null);
    }

    @Test
    void shouldDeleteByIds() {
        List<Integer> ids = Arrays.asList(1, 2, 3);
        doNothing().when(contactDao).deleteByIds(ids);

        contactService.deleleByIds(ids);

        verify(contactDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldDeleteByIdsWithEmptyList() {
        List<Integer> emptyIds = Collections.emptyList();
        doNothing().when(contactDao).deleteByIds(emptyIds);

        contactService.deleleByIds(emptyIds);

        verify(contactDao, times(1)).deleteByIds(emptyIds);
    }

    @Test
    void shouldDeleteByIdsWithSingleId() {
        List<Integer> singleId = Collections.singletonList(1);
        doNothing().when(contactDao).deleteByIds(singleId);

        contactService.deleleByIds(singleId);

        verify(contactDao, times(1)).deleteByIds(singleId);
    }

    @Test
    void shouldGetCurrencyCodeByInputColumnValue() {
        when(contactDao.getCurrencyCodeByInputColoumnValue("AED")).thenReturn(1);

        Integer result = contactService.getCurrencyCodeByInputColoumnValue("AED");

        assertThat(result).isEqualTo(1);
        verify(contactDao, times(1)).getCurrencyCodeByInputColoumnValue("AED");
    }

    @Test
    void shouldGetCurrencyCodeByInputColumnValueWithNullValue() {
        when(contactDao.getCurrencyCodeByInputColoumnValue(null)).thenReturn(null);

        Integer result = contactService.getCurrencyCodeByInputColoumnValue(null);

        assertThat(result).isNull();
        verify(contactDao, times(1)).getCurrencyCodeByInputColoumnValue(null);
    }

    @Test
    void shouldGetAllContactsWithoutPagination() {
        List<Contact> expectedContacts = Arrays.asList(testContact);

        when(contactDao.getAllContacts()).thenReturn(expectedContacts);

        List<Contact> result = contactService.getAllContacts();

        assertThat(result).isEqualTo(expectedContacts);
        assertThat(result).hasSize(1);
        verify(contactDao, times(1)).getAllContacts();
    }

    @Test
    void shouldGetAllContactsWhenNoneExist() {
        when(contactDao.getAllContacts()).thenReturn(Collections.emptyList());

        List<Contact> result = contactService.getAllContacts();

        assertThat(result).isEmpty();
        verify(contactDao, times(1)).getAllContacts();
    }

    @Test
    void shouldUpdateContacts() {
        doNothing().when(contactDao).updateContacts(2, "John", "Doe");

        contactService.updateContacts(2, "John", "Doe");

        verify(contactDao, times(1)).updateContacts(2, "John", "Doe");
    }

    @Test
    void shouldUpdateContactsWithNullValues() {
        doNothing().when(contactDao).updateContacts(null, null, null);

        contactService.updateContacts(null, null, null);

        verify(contactDao, times(1)).updateContacts(null, null, null);
    }

    @Test
    void shouldGetCustomerContacts() {
        List<Contact> expectedContacts = Arrays.asList(testContact);

        when(contactDao.getCustomerContacts(testCurrency)).thenReturn(expectedContacts);

        List<Contact> result = contactService.getCustomerContacts(testCurrency);

        assertThat(result).isEqualTo(expectedContacts);
        assertThat(result).hasSize(1);
        verify(contactDao, times(1)).getCustomerContacts(testCurrency);
    }

    @Test
    void shouldGetCustomerContactsWithNullCurrency() {
        when(contactDao.getCustomerContacts(null)).thenReturn(Collections.emptyList());

        List<Contact> result = contactService.getCustomerContacts(null);

        assertThat(result).isEmpty();
        verify(contactDao, times(1)).getCustomerContacts(null);
    }

    @Test
    void shouldGetSupplierContacts() {
        List<Contact> expectedContacts = Arrays.asList(testContact);

        when(contactDao.getSupplierContacts(testCurrency)).thenReturn(expectedContacts);

        List<Contact> result = contactService.getSupplierContacts(testCurrency);

        assertThat(result).isEqualTo(expectedContacts);
        assertThat(result).hasSize(1);
        verify(contactDao, times(1)).getSupplierContacts(testCurrency);
    }

    @Test
    void shouldGetSupplierContactsWithNullCurrency() {
        when(contactDao.getSupplierContacts(null)).thenReturn(Collections.emptyList());

        List<Contact> result = contactService.getSupplierContacts(null);

        assertThat(result).isEmpty();
        verify(contactDao, times(1)).getSupplierContacts(null);
    }

    @Test
    void shouldSendInvoiceThankYouMailForInvoiceType1() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Resource resource = mock(Resource.class);

        String htmlTemplate = "<html>{name}{date}{amount}{companylogo}{dueAmount}{paymode}{number}{currency}</html>";
        Path tempFile = Files.createTempFile("test", ".html");
        Files.write(tempFile, htmlTemplate.getBytes());

        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.getURI()).thenReturn(tempFile.toUri());
        doNothing().when(emailSender).send(anyString(), anyString(), anyString(), anyString(), anyString(), eq(true));
        when(request.getRequestURL()).thenReturn(new StringBuffer("http://localhost:8080/api/test"));
        when(request.getRequestURI()).thenReturn("/api/test");
        when(request.getContextPath()).thenReturn("");
        when(request.getServletPath()).thenReturn("/api/test");
        doNothing().when(emaiLogsService).persist(any(EmailLogs.class));

        boolean result = contactService.sendInvoiceThankYouMail(
                testContact, 1, "INV-001", "1000.00", "2024-01-01",
                new BigDecimal("500.00"), request);

        assertThat(result).isTrue();
        verify(emailSender, times(1)).send(
                eq(testContact.getEmail()),
                eq("Payment receipt information for INV-001"),
                anyString(),
                anyString(),
                anyString(),
                eq(true));
        verify(emaiLogsService, times(1)).persist(any(EmailLogs.class));

        Files.deleteIfExists(tempFile);
    }

    @Test
    void shouldSendInvoiceThankYouMailForInvoiceType2() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Resource resource = mock(Resource.class);

        String htmlTemplate = "<html>{name}{date}{amount}{companylogo}{dueAmount}{paymode}{number}{currency}</html>";
        Path tempFile = Files.createTempFile("test", ".html");
        Files.write(tempFile, htmlTemplate.getBytes());

        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.getURI()).thenReturn(tempFile.toUri());
        doNothing().when(emailSender).send(anyString(), anyString(), anyString(), anyString(), anyString(), eq(true));
        when(request.getRequestURL()).thenReturn(new StringBuffer("http://localhost:8080/api/test"));
        when(request.getRequestURI()).thenReturn("/api/test");
        when(request.getContextPath()).thenReturn("");
        when(request.getServletPath()).thenReturn("/api/test");
        doNothing().when(emaiLogsService).persist(any(EmailLogs.class));

        boolean result = contactService.sendInvoiceThankYouMail(
                testContact, 2, "BILL-001", "2000.00", "2024-01-01",
                new BigDecimal("1000.00"), request);

        assertThat(result).isTrue();
        verify(emailSender, times(1)).send(
                eq(testContact.getEmail()),
                eq("Payment receipt information for BILL-001"),
                anyString(),
                anyString(),
                anyString(),
                eq(true));

        Files.deleteIfExists(tempFile);
    }

    @Test
    void shouldSendInvoiceThankYouMailForInvoiceType7() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Resource resource = mock(Resource.class);

        String htmlTemplate = "<html>{name}{date}{amount}{companylogo}{dueAmount}{paymode}{number}{currency}</html>";
        Path tempFile = Files.createTempFile("test", ".html");
        Files.write(tempFile, htmlTemplate.getBytes());

        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.getURI()).thenReturn(tempFile.toUri());
        doNothing().when(emailSender).send(anyString(), anyString(), anyString(), anyString(), anyString(), eq(true));
        when(request.getRequestURL()).thenReturn(new StringBuffer("http://localhost:8080/api/test"));
        when(request.getRequestURI()).thenReturn("/api/test");
        when(request.getContextPath()).thenReturn("");
        when(request.getServletPath()).thenReturn("/api/test");
        doNothing().when(emaiLogsService).persist(any(EmailLogs.class));

        boolean result = contactService.sendInvoiceThankYouMail(
                testContact, 7, "REF-001", "500.00", "2024-01-01",
                new BigDecimal("250.00"), request);

        assertThat(result).isTrue();
        verify(emailSender, times(1)).send(
                eq(testContact.getEmail()),
                eq("Payment receipt information for REF-001"),
                anyString(),
                anyString(),
                anyString(),
                eq(true));

        Files.deleteIfExists(tempFile);
    }

    @Test
    void shouldReturnFalseWhenEmailSendingFails() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Resource resource = mock(Resource.class);

        String htmlTemplate = "<html>{name}{date}{amount}{companylogo}{dueAmount}{paymode}{number}{currency}</html>";
        Path tempFile = Files.createTempFile("test", ".html");
        Files.write(tempFile, htmlTemplate.getBytes());

        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.getURI()).thenReturn(tempFile.toUri());
        when(request.getRequestURL()).thenReturn(new StringBuffer("http://localhost:8080/api/test"));
        when(request.getRequestURI()).thenReturn("/api/test");
        when(request.getContextPath()).thenReturn("");
        when(request.getServletPath()).thenReturn("/api/test");

        doNothing().doThrow(new MessagingException("Email sending failed"))
                .when(emailSender).send(anyString(), anyString(), anyString(), anyString(), anyString(), eq(true));

        boolean result = contactService.sendInvoiceThankYouMail(
                testContact, 1, "INV-001", "1000.00", "2024-01-01",
                new BigDecimal("500.00"), request);

        assertThat(result).isFalse();
        verify(emaiLogsService, never()).persist(any(EmailLogs.class));

        Files.deleteIfExists(tempFile);
    }

    @Test
    void shouldUseOrganizationNameWhenAvailable() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Resource resource = mock(Resource.class);

        testContact.setOrganization("ACME Corporation");
        String htmlTemplate = "<html>{name}{date}{amount}{companylogo}{dueAmount}{paymode}{number}{currency}</html>";
        Path tempFile = Files.createTempFile("test", ".html");
        Files.write(tempFile, htmlTemplate.getBytes());

        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.getURI()).thenReturn(tempFile.toUri());
        doNothing().when(emailSender).send(anyString(), anyString(), anyString(), anyString(), anyString(), eq(true));
        when(request.getRequestURL()).thenReturn(new StringBuffer("http://localhost:8080/api/test"));
        when(request.getRequestURI()).thenReturn("/api/test");
        when(request.getContextPath()).thenReturn("");
        when(request.getServletPath()).thenReturn("/api/test");
        doNothing().when(emaiLogsService).persist(any(EmailLogs.class));

        boolean result = contactService.sendInvoiceThankYouMail(
                testContact, 1, "INV-001", "1000.00", "2024-01-01",
                new BigDecimal("500.00"), request);

        assertThat(result).isTrue();

        ArgumentCaptor<String> emailBodyCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailSender, times(1)).send(
                anyString(),
                anyString(),
                emailBodyCaptor.capture(),
                anyString(),
                anyString(),
                eq(true));

        assertThat(emailBodyCaptor.getValue()).contains("ACME Corporation");

        Files.deleteIfExists(tempFile);
    }

    @Test
    void shouldUseFirstAndLastNameWhenOrganizationIsEmpty() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Resource resource = mock(Resource.class);

        testContact.setOrganization("");
        String htmlTemplate = "<html>{name}{date}{amount}{companylogo}{dueAmount}{paymode}{number}{currency}</html>";
        Path tempFile = Files.createTempFile("test", ".html");
        Files.write(tempFile, htmlTemplate.getBytes());

        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.getURI()).thenReturn(tempFile.toUri());
        doNothing().when(emailSender).send(anyString(), anyString(), anyString(), anyString(), anyString(), eq(true));
        when(request.getRequestURL()).thenReturn(new StringBuffer("http://localhost:8080/api/test"));
        when(request.getRequestURI()).thenReturn("/api/test");
        when(request.getContextPath()).thenReturn("");
        when(request.getServletPath()).thenReturn("/api/test");
        doNothing().when(emaiLogsService).persist(any(EmailLogs.class));

        boolean result = contactService.sendInvoiceThankYouMail(
                testContact, 1, "INV-001", "1000.00", "2024-01-01",
                new BigDecimal("500.00"), request);

        assertThat(result).isTrue();

        ArgumentCaptor<String> emailBodyCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailSender, times(1)).send(
                anyString(),
                anyString(),
                emailBodyCaptor.capture(),
                anyString(),
                anyString(),
                eq(true));

        assertThat(emailBodyCaptor.getValue()).contains("John Doe");

        Files.deleteIfExists(tempFile);
    }

    @Test
    void shouldHandleUserWithNullCompany() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Resource resource = mock(Resource.class);

        testUser.setCompany(null);
        String htmlTemplate = "<html>{name}{date}{amount}{companylogo}{dueAmount}{paymode}{number}{currency}</html>";
        Path tempFile = Files.createTempFile("test", ".html");
        Files.write(tempFile, htmlTemplate.getBytes());

        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.getURI()).thenReturn(tempFile.toUri());
        doNothing().when(emailSender).send(anyString(), anyString(), anyString(), anyString(), anyString(), eq(true));
        when(request.getRequestURL()).thenReturn(new StringBuffer("http://localhost:8080/api/test"));
        when(request.getRequestURI()).thenReturn("/api/test");
        when(request.getContextPath()).thenReturn("");
        when(request.getServletPath()).thenReturn("/api/test");
        doNothing().when(emaiLogsService).persist(any(EmailLogs.class));

        boolean result = contactService.sendInvoiceThankYouMail(
                testContact, 1, "INV-001", "1000.00", "2024-01-01",
                new BigDecimal("500.00"), request);

        assertThat(result).isTrue();

        Files.deleteIfExists(tempFile);
    }

    @Test
    void shouldHandleCompanyWithNullLogo() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Resource resource = mock(Resource.class);

        testCompany.setCompanyLogo(null);
        String htmlTemplate = "<html>{name}{date}{amount}{companylogo}{dueAmount}{paymode}{number}{currency}</html>";
        Path tempFile = Files.createTempFile("test", ".html");
        Files.write(tempFile, htmlTemplate.getBytes());

        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.getURI()).thenReturn(tempFile.toUri());
        doNothing().when(emailSender).send(anyString(), anyString(), anyString(), anyString(), anyString(), eq(true));
        when(request.getRequestURL()).thenReturn(new StringBuffer("http://localhost:8080/api/test"));
        when(request.getRequestURI()).thenReturn("/api/test");
        when(request.getContextPath()).thenReturn("");
        when(request.getServletPath()).thenReturn("/api/test");
        doNothing().when(emaiLogsService).persist(any(EmailLogs.class));

        boolean result = contactService.sendInvoiceThankYouMail(
                testContact, 1, "INV-001", "1000.00", "2024-01-01",
                new BigDecimal("500.00"), request);

        assertThat(result).isTrue();

        Files.deleteIfExists(tempFile);
    }

    @Test
    void shouldVerifyEmailLogsAreSavedCorrectly() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Resource resource = mock(Resource.class);

        String htmlTemplate = "<html>{name}{date}{amount}{companylogo}{dueAmount}{paymode}{number}{currency}</html>";
        Path tempFile = Files.createTempFile("test", ".html");
        Files.write(tempFile, htmlTemplate.getBytes());

        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.getURI()).thenReturn(tempFile.toUri());
        doNothing().when(emailSender).send(anyString(), anyString(), anyString(), anyString(), anyString(), eq(true));
        when(request.getRequestURL()).thenReturn(new StringBuffer("http://localhost:8080/api/test"));
        when(request.getRequestURI()).thenReturn("/api/test");
        when(request.getContextPath()).thenReturn("");
        when(request.getServletPath()).thenReturn("/api/test");
        doNothing().when(emaiLogsService).persist(any(EmailLogs.class));

        contactService.sendInvoiceThankYouMail(
                testContact, 1, "INV-001", "1000.00", "2024-01-01",
                new BigDecimal("500.00"), request);

        ArgumentCaptor<EmailLogs> emailLogsCaptor = ArgumentCaptor.forClass(EmailLogs.class);
        verify(emaiLogsService, times(1)).persist(emailLogsCaptor.capture());

        EmailLogs capturedEmailLogs = emailLogsCaptor.getValue();
        assertThat(capturedEmailLogs.getEmailTo()).isEqualTo(testContact.getEmail());
        assertThat(capturedEmailLogs.getEmailFrom()).isEqualTo(testUser.getUserEmail());
        assertThat(capturedEmailLogs.getModuleName()).isEqualTo("PAYMENT");
        assertThat(capturedEmailLogs.getEmailDate()).isNotNull();

        Files.deleteIfExists(tempFile);
    }
}
