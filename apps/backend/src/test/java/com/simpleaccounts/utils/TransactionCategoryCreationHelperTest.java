package com.simpleaccounts.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.TransactionCategoryCodeEnum;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.ContactTransactionCategoryRelation;
import com.simpleaccounts.entity.DesignationTransactionCategory;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeDesignation;
import com.simpleaccounts.entity.EmployeeTransactionCategoryRelation;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.ContactTransactionCategoryService;
import com.simpleaccounts.service.CoacTransactionCategoryService;
import com.simpleaccounts.service.DesignationTransactionCategoryService;
import com.simpleaccounts.service.EmployeeDesignationService;
import com.simpleaccounts.service.EmployeeTransactioncategoryService;
import com.simpleaccounts.service.TransactionCategoryService;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionCategoryCreationHelper Tests")
class TransactionCategoryCreationHelperTest {

    @Mock
    private TransactionCategoryService transactionCategoryService;

    @Mock
    private CoacTransactionCategoryService coacTransactionCategoryService;

    @Mock
    private ContactTransactionCategoryService contactTransactionCategoryService;

    @Mock
    private EmployeeTransactioncategoryService employeeTransactioncategoryService;

    @Mock
    private ContactService contactService;

    @Mock
    private DesignationTransactionCategoryService designationTransactionCategoryService;

    @Mock
    private EmployeeDesignationService employeeDesignationService;

    private TransactionCategoryCreationHelper helper;

    @BeforeEach
    void setUp() {
        helper = new TransactionCategoryCreationHelper(
                transactionCategoryService,
                coacTransactionCategoryService,
                contactTransactionCategoryService,
                employeeTransactioncategoryService,
                contactService,
                designationTransactionCategoryService,
                employeeDesignationService
        );
    }

    @Nested
    @DisplayName("createTransactionCategoryForEmployee Tests")
    class CreateTransactionCategoryForEmployeeTests {

        @Test
        @DisplayName("Should not create category when employee designation is null")
        void shouldNotCreateCategoryWhenEmployeeDesignationIsNull() {
            // given
            Employee employee = new Employee();
            employee.setEmployeeDesignationId(null);

            // when
            helper.createTransactionCategoryForEmployee(employee);

            // then
            verify(employeeTransactioncategoryService, never()).persist(any(EmployeeTransactionCategoryRelation.class));
        }

        @Test
        @DisplayName("Should create category for employee with designation")
        void shouldCreateCategoryForEmployeeWithDesignation() {
            // given
            Employee employee = createEmployeeWithDesignation();
            List<DesignationTransactionCategory> designationCategories = createDesignationTransactionCategories();

            when(designationTransactionCategoryService.findByAttributes(anyMap())).thenReturn(designationCategories);
            when(transactionCategoryService.getNxtTransactionCatCodeByChartOfAccount(any())).thenReturn("TC-001");

            // when
            helper.createTransactionCategoryForEmployee(employee);

            // then
            verify(transactionCategoryService, times(1)).persist(any(TransactionCategory.class));
            verify(employeeTransactioncategoryService, times(1)).persist(any(EmployeeTransactionCategoryRelation.class));
        }

        @Test
        @DisplayName("Should use parent designation when available")
        void shouldUseParentDesignationWhenAvailable() {
            // given
            Employee employee = createEmployeeWithParentDesignation();
            EmployeeDesignation parentDesignation = new EmployeeDesignation();
            parentDesignation.setId(100);

            when(employeeDesignationService.findByPK(100)).thenReturn(parentDesignation);
            when(designationTransactionCategoryService.findByAttributes(anyMap())).thenReturn(Collections.emptyList());

            // when
            helper.createTransactionCategoryForEmployee(employee);

            // then
            verify(employeeDesignationService).findByPK(100);
        }

        private Employee createEmployeeWithDesignation() {
            Employee employee = new Employee();
            employee.setFirstName("John");
            employee.setLastName("Doe");
            employee.setCreatedBy(1);

            EmployeeDesignation designation = new EmployeeDesignation();
            designation.setId(1);
            designation.setParentId(null);
            employee.setEmployeeDesignationId(designation);

            return employee;
        }

        private Employee createEmployeeWithParentDesignation() {
            Employee employee = new Employee();
            employee.setFirstName("Jane");
            employee.setLastName("Smith");
            employee.setCreatedBy(1);

            EmployeeDesignation designation = new EmployeeDesignation();
            designation.setId(1);
            designation.setParentId(100);
            employee.setEmployeeDesignationId(designation);

            return employee;
        }

        private List<DesignationTransactionCategory> createDesignationTransactionCategories() {
            List<DesignationTransactionCategory> list = new ArrayList<>();

            TransactionCategory category = new TransactionCategory();
            category.setTransactionCategoryName("Salary");
            category.setChartOfAccount(new ChartOfAccount());

            DesignationTransactionCategory dtc = new DesignationTransactionCategory();
            dtc.setTransactionCategory(category);
            list.add(dtc);

            return list;
        }
    }

    @Nested
    @DisplayName("updateEmployeeTransactionCategory Tests")
    class UpdateEmployeeTransactionCategoryTests {

        @Test
        @DisplayName("Should delete existing categories and create new ones")
        void shouldDeleteExistingCategoriesAndCreateNewOnes() {
            // given
            Employee employee = createEmployeeWithDesignation();
            employee.setId(1);

            List<EmployeeTransactionCategoryRelation> existingRelations = createExistingRelations();
            when(employeeTransactioncategoryService.findByAttributes(anyMap())).thenReturn(existingRelations);
            when(designationTransactionCategoryService.findByAttributes(anyMap())).thenReturn(Collections.emptyList());

            // when
            helper.updateEmployeeTransactionCategory(employee);

            // then
            verify(employeeTransactioncategoryService).delete(any(EmployeeTransactionCategoryRelation.class));
            verify(transactionCategoryService).update(any(TransactionCategory.class));
        }

        private Employee createEmployeeWithDesignation() {
            Employee employee = new Employee();
            employee.setFirstName("John");
            employee.setLastName("Doe");
            employee.setCreatedBy(1);

            EmployeeDesignation designation = new EmployeeDesignation();
            designation.setId(1);
            designation.setParentId(null);
            employee.setEmployeeDesignationId(designation);

            return employee;
        }

        private List<EmployeeTransactionCategoryRelation> createExistingRelations() {
            List<EmployeeTransactionCategoryRelation> list = new ArrayList<>();

            TransactionCategory category = new TransactionCategory();
            category.setDeleteFlag(false);

            EmployeeTransactionCategoryRelation relation = new EmployeeTransactionCategoryRelation();
            relation.setTransactionCategory(category);
            list.add(relation);

            return list;
        }
    }

    @Nested
    @DisplayName("createTransactionCategoryForContact Tests")
    class CreateTransactionCategoryForContactTests {

        @Test
        @DisplayName("Should create category for supplier (type 1)")
        void shouldCreateCategoryForSupplier() {
            // given
            Contact contact = createContact(1); // Supplier
            TransactionCategory parentCategory = createParentCategory("Accounts Payable");

            when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(
                    TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode())).thenReturn(parentCategory);
            when(transactionCategoryService.getNxtTransactionCatCodeByChartOfAccount(any())).thenReturn("TC-002");

            // when
            helper.createTransactionCategoryForContact(contact);

            // then
            verify(transactionCategoryService, times(1)).persist(any(TransactionCategory.class));
            verify(contactTransactionCategoryService, times(1)).persist(any(ContactTransactionCategoryRelation.class));
            verify(contactService, times(1)).persist(contact);

            // Verify contact type is set correctly
            ArgumentCaptor<ContactTransactionCategoryRelation> captor =
                    ArgumentCaptor.forClass(ContactTransactionCategoryRelation.class);
            verify(contactTransactionCategoryService).persist(captor.capture());
            assertThat(captor.getValue().getContactType()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should create category for customer (type 2)")
        void shouldCreateCategoryForCustomer() {
            // given
            Contact contact = createContact(2); // Customer
            TransactionCategory parentCategory = createParentCategory("Accounts Receivable");

            when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(
                    TransactionCategoryCodeEnum.ACCOUNT_RECEIVABLE.getCode())).thenReturn(parentCategory);
            when(transactionCategoryService.getNxtTransactionCatCodeByChartOfAccount(any())).thenReturn("TC-003");

            // when
            helper.createTransactionCategoryForContact(contact);

            // then
            verify(transactionCategoryService, times(1)).persist(any(TransactionCategory.class));
            verify(contactTransactionCategoryService, times(1)).persist(any(ContactTransactionCategoryRelation.class));

            ArgumentCaptor<ContactTransactionCategoryRelation> captor =
                    ArgumentCaptor.forClass(ContactTransactionCategoryRelation.class);
            verify(contactTransactionCategoryService).persist(captor.capture());
            assertThat(captor.getValue().getContactType()).isEqualTo(2);
        }

        @Test
        @DisplayName("Should create both categories for supplier and customer (type 3)")
        void shouldCreateBothCategoriesForSupplierAndCustomer() {
            // given
            Contact contact = createContact(3); // Both supplier and customer
            TransactionCategory payableCategory = createParentCategory("Accounts Payable");
            TransactionCategory receivableCategory = createParentCategory("Accounts Receivable");

            when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(
                    TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode())).thenReturn(payableCategory);
            when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(
                    TransactionCategoryCodeEnum.ACCOUNT_RECEIVABLE.getCode())).thenReturn(receivableCategory);
            when(transactionCategoryService.getNxtTransactionCatCodeByChartOfAccount(any())).thenReturn("TC-004");

            // when
            helper.createTransactionCategoryForContact(contact);

            // then
            verify(transactionCategoryService, times(2)).persist(any(TransactionCategory.class));
            verify(contactTransactionCategoryService, times(2)).persist(any(ContactTransactionCategoryRelation.class));
            verify(contactService, times(1)).persist(contact);
        }

        @Test
        @DisplayName("Should use organization name when available")
        void shouldUseOrganizationNameWhenAvailable() {
            // given
            Contact contact = createContact(1);
            contact.setOrganization("Acme Corp");
            TransactionCategory parentCategory = createParentCategory("Accounts Payable");

            when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(
                    TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode())).thenReturn(parentCategory);
            when(transactionCategoryService.getNxtTransactionCatCodeByChartOfAccount(any())).thenReturn("TC-005");

            // when
            helper.createTransactionCategoryForContact(contact);

            // then
            ArgumentCaptor<TransactionCategory> captor = ArgumentCaptor.forClass(TransactionCategory.class);
            verify(transactionCategoryService).persist(captor.capture());
            assertThat(captor.getValue().getTransactionCategoryName()).contains("Acme Corp");
        }

        @Test
        @DisplayName("Should use contact name when organization is empty")
        void shouldUseContactNameWhenOrganizationIsEmpty() {
            // given
            Contact contact = createContact(1);
            contact.setOrganization("");
            contact.setFirstName("John");
            contact.setLastName("Doe");
            TransactionCategory parentCategory = createParentCategory("Accounts Payable");

            when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(
                    TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode())).thenReturn(parentCategory);
            when(transactionCategoryService.getNxtTransactionCatCodeByChartOfAccount(any())).thenReturn("TC-006");

            // when
            helper.createTransactionCategoryForContact(contact);

            // then
            ArgumentCaptor<TransactionCategory> captor = ArgumentCaptor.forClass(TransactionCategory.class);
            verify(transactionCategoryService).persist(captor.capture());
            assertThat(captor.getValue().getTransactionCategoryName()).contains("John Doe");
        }

        @Test
        @DisplayName("Should not create category for unknown contact type")
        void shouldNotCreateCategoryForUnknownContactType() {
            // given
            Contact contact = createContact(99); // Unknown type

            // when
            helper.createTransactionCategoryForContact(contact);

            // then
            verify(transactionCategoryService, never()).persist(any(TransactionCategory.class));
            verify(contactService, never()).persist(any(Contact.class));
        }

        private Contact createContact(int contactType) {
            Contact contact = new Contact();
            contact.setContactType(contactType);
            contact.setFirstName("Test");
            contact.setLastName("Contact");
            contact.setCreatedBy(1);
            return contact;
        }

        private TransactionCategory createParentCategory(String name) {
            TransactionCategory category = new TransactionCategory();
            category.setTransactionCategoryName(name);
            category.setChartOfAccount(new ChartOfAccount());
            return category;
        }
    }

    @Nested
    @DisplayName("getTransactionCategory Tests")
    class GetTransactionCategoryTests {

        @Test
        @DisplayName("Should create transaction category with correct properties")
        void shouldCreateTransactionCategoryWithCorrectProperties() {
            // given
            String categoryName = "Test Category";
            String description = "Test Description";
            Integer userId = 1;
            TransactionCategory parentCategory = new TransactionCategory();
            parentCategory.setChartOfAccount(new ChartOfAccount());

            when(transactionCategoryService.getNxtTransactionCatCodeByChartOfAccount(any())).thenReturn("TC-TEST");

            // when
            TransactionCategory result = helper.getTransactionCategory(categoryName, description, userId, parentCategory);

            // then
            assertThat(result).isNotNull();
            assertThat(result.getTransactionCategoryName()).isEqualTo(categoryName);
            assertThat(result.getTransactionCategoryDescription()).isEqualTo(description);
            assertThat(result.getCreatedBy()).isEqualTo(userId);
            assertThat(result.getParentTransactionCategory()).isEqualTo(parentCategory);
            assertThat(result.getEditableFlag()).isFalse();
            assertThat(result.getSelectableFlag()).isFalse();
            assertThat(result.getTransactionCategoryCode()).isEqualTo("TC-TEST");

            verify(transactionCategoryService).persist(result);
        }
    }
}
