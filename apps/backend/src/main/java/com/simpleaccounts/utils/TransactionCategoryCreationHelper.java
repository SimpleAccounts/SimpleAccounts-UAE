package com.simpleaccounts.utils;

import com.simpleaccounts.constant.DefaultTypeConstant;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.constant.TransactionCategoryCodeEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
	@SuppressWarnings("java:S6809")
	@RequiredArgsConstructor
public class TransactionCategoryCreationHelper {
	private static final String JSON_KEY_DESIGNATION = "designation";

    private final  TransactionCategoryService transactionCategoryService;

    private final  CoacTransactionCategoryService coacTransactionCategoryService;

    private final  ContactTransactionCategoryService contactTransactionCategoryService;

    private final  EmployeeTransactioncategoryService employeeTransactioncategoryService;

    private final  ContactService contactService;

    private final  DesignationTransactionCategoryService designationTransactionCategoryService;

    private final EmployeeDesignationService employeeDesignationService;

    @Transactional(rollbackFor = Exception.class)
    public void createTransactionCategoryForEmployee(Employee employee)
    {
        if(employee.getEmployeeDesignationId()!=null ){
            Map<String, Object> param = new HashMap<>();
            if (employee.getEmployeeDesignationId().getParentId()!=null){
                EmployeeDesignation employeeDesignation = employeeDesignationService.findByPK(employee.getEmployeeDesignationId().getParentId());
                param.put(JSON_KEY_DESIGNATION, employeeDesignation);
            }
            else {
                param.put(JSON_KEY_DESIGNATION, employee.getEmployeeDesignationId());
            }
            List<DesignationTransactionCategory> designationTransactionCategoryList=
                    designationTransactionCategoryService.findByAttributes(param);

            for (DesignationTransactionCategory designationTransactionCategory:designationTransactionCategoryList){
                String transactionCategoryName =designationTransactionCategory.getTransactionCategory().getTransactionCategoryName() +" - " +employee.getFirstName() + " " + employee.getLastName();
                TransactionCategory parentTransactionCategory =designationTransactionCategory.getTransactionCategory();

                TransactionCategory transactionCategory = getTransactionCategory(transactionCategoryName,transactionCategoryName,
                        employee.getCreatedBy(),parentTransactionCategory);

                EmployeeTransactionCategoryRelation employeeTransactionCategoryRelation = new EmployeeTransactionCategoryRelation();
                employeeTransactionCategoryRelation.setEmployee(employee);
                employeeTransactionCategoryRelation.setTransactionCategory(transactionCategory);
                employeeTransactioncategoryService.persist(employeeTransactionCategoryRelation);
            }
        }
    }
    public void updateEmployeeTransactionCategory( Employee employee) {
        Map<String, Object> param = new HashMap<>();
        param.put("employee", employee.getId());
        List<EmployeeTransactionCategoryRelation> employeeTransactionCategoryRelationList = employeeTransactioncategoryService.findByAttributes(param);

        for(EmployeeTransactionCategoryRelation employeeTransactionCategoryRelation: employeeTransactionCategoryRelationList)
        {
            TransactionCategory transactionCategory = employeeTransactionCategoryRelation.getTransactionCategory();
            employeeTransactioncategoryService.delete(employeeTransactionCategoryRelation);
            transactionCategory.setDeleteFlag(Boolean.TRUE);
            transactionCategoryService.update(transactionCategory);

        }
        if(employee.getEmployeeDesignationId()!=null ){
            Map<String, Object> map = new HashMap<>();
            if (employee.getEmployeeDesignationId().getParentId()!=null){
                EmployeeDesignation employeeDesignation = employeeDesignationService.findByPK(employee.getEmployeeDesignationId().getParentId());
                map.put(JSON_KEY_DESIGNATION, employeeDesignation);
            }
            else {
                map.put(JSON_KEY_DESIGNATION, employee.getEmployeeDesignationId());
            }
            List<DesignationTransactionCategory> designationTransactionCategoryList=
                    designationTransactionCategoryService.findByAttributes(map);

            for (DesignationTransactionCategory designationTransactionCategory:designationTransactionCategoryList){
                String transactionCategoryName =designationTransactionCategory.getTransactionCategory().getTransactionCategoryName() +" - " +employee.getFirstName() + " " + employee.getLastName();
                TransactionCategory parentTransactionCategory =designationTransactionCategory.getTransactionCategory();

                TransactionCategory transactionCategory = getTransactionCategory(transactionCategoryName,transactionCategoryName,
                        employee.getCreatedBy(),parentTransactionCategory);

                EmployeeTransactionCategoryRelation employeeTransactionCategoryRelation = new EmployeeTransactionCategoryRelation();
                employeeTransactionCategoryRelation.setEmployee(employee);
                employeeTransactionCategoryRelation.setTransactionCategory(transactionCategory);
                employeeTransactioncategoryService.persist(employeeTransactionCategoryRelation);
            }
        }

    }

    @Transactional(rollbackFor = Exception.class)
    public  void createTransactionCategoryForContact(Contact contact)
    {
        String transactionCategoryName = null;
       switch (contact.getContactType())
       {
           case 1:
               TransactionCategory parentTransactionCategory = transactionCategoryService
                       .findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode());

               if(contact.getOrganization() != null && !contact.getOrganization().isEmpty()){
                    transactionCategoryName = parentTransactionCategory.getTransactionCategoryName()+ "-" +contact.getOrganization();
               }else {
                    transactionCategoryName =parentTransactionCategory.getTransactionCategoryName()+ "-" + contact.getFirstName() + " " + contact.getLastName();
               }
               TransactionCategory transactionCategory = getTransactionCategory(transactionCategoryName,transactionCategoryName,
                       contact.getCreatedBy(),parentTransactionCategory);

               ContactTransactionCategoryRelation contactTransactionCategoryRelation = new ContactTransactionCategoryRelation();
               contactTransactionCategoryRelation.setContact(contact);
               contactTransactionCategoryRelation.setTransactionCategory(transactionCategory);
               contactTransactionCategoryRelation.setContactType(1);
               contactTransactionCategoryService.persist(contactTransactionCategoryRelation);

               contactService.persist(contact);
               break;
           case 2:
               parentTransactionCategory = transactionCategoryService
                       .findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.ACCOUNT_RECEIVABLE.getCode());
               if(contact.getOrganization() != null && !contact.getOrganization().isEmpty()){
                   transactionCategoryName = parentTransactionCategory.getTransactionCategoryName()+ "-" +contact.getOrganization();
               }else {
                   transactionCategoryName = parentTransactionCategory.getTransactionCategoryName()+ "-" +contact.getFirstName() + " " + contact.getLastName();
               }
               transactionCategory = getTransactionCategory(transactionCategoryName,transactionCategoryName,
                       contact.getCreatedBy(),parentTransactionCategory);

                contactTransactionCategoryRelation = new ContactTransactionCategoryRelation();
               contactTransactionCategoryRelation.setContact(contact);
               contactTransactionCategoryRelation.setTransactionCategory(transactionCategory);
               contactTransactionCategoryRelation.setContactType(2);
               contactTransactionCategoryService.persist(contactTransactionCategoryRelation);

               contactService.persist(contact);
               break;
           case 3:

               parentTransactionCategory = transactionCategoryService
                       .findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode());
               if(contact.getOrganization() != null && !contact.getOrganization().isEmpty()){
                   transactionCategoryName = parentTransactionCategory.getTransactionCategoryName()+ "-" +contact.getOrganization();
               }else {
                   transactionCategoryName = parentTransactionCategory.getTransactionCategoryName()+ "-" +contact.getFirstName() + " " + contact.getLastName();
               }
               transactionCategory = getTransactionCategory(transactionCategoryName,transactionCategoryName,
                       contact.getCreatedBy(),parentTransactionCategory);

               contactTransactionCategoryRelation = new ContactTransactionCategoryRelation();
               contactTransactionCategoryRelation.setContact(contact);
               contactTransactionCategoryRelation.setTransactionCategory(transactionCategory);
               contactTransactionCategoryRelation.setContactType(1);
               contactTransactionCategoryService.persist(contactTransactionCategoryRelation);
               parentTransactionCategory = transactionCategoryService
                       .findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.ACCOUNT_RECEIVABLE.getCode());
               if(contact.getOrganization() != null && !contact.getOrganization().isEmpty()){
                   transactionCategoryName = parentTransactionCategory.getTransactionCategoryName()+ "-" +contact.getOrganization();
               }else {
                   transactionCategoryName = parentTransactionCategory.getTransactionCategoryName()+ "-" +contact.getFirstName() + " " + contact.getLastName();
               }
               transactionCategory = getTransactionCategory(transactionCategoryName,transactionCategoryName,
                       contact.getCreatedBy(),parentTransactionCategory);

               contactTransactionCategoryRelation = new ContactTransactionCategoryRelation();
               contactTransactionCategoryRelation.setContact(contact);
               contactTransactionCategoryRelation.setTransactionCategory(transactionCategory);
               contactTransactionCategoryRelation.setContactType(2);
               contactTransactionCategoryService.persist(contactTransactionCategoryRelation);

               contactService.persist(contact);
               break;
           default:
               break;

       }
    }

    TransactionCategory getTransactionCategory(String transactionCategoryName,String transactionCategoryDescription,
                                                              Integer userId, TransactionCategory parentTransactionCategory) {
        TransactionCategory category = new TransactionCategory();
        category.setChartOfAccount(parentTransactionCategory.getChartOfAccount());
        category.setEditableFlag(Boolean.FALSE);
        category.setSelectableFlag(Boolean.FALSE);
        category.setTransactionCategoryCode(transactionCategoryService
                .getNxtTransactionCatCodeByChartOfAccount(parentTransactionCategory.getChartOfAccount()));
        category.setTransactionCategoryName(transactionCategoryName);
        category.setTransactionCategoryDescription(transactionCategoryDescription);
        category.setParentTransactionCategory(parentTransactionCategory);
        category.setCreatedDate(LocalDateTime.now());
        category.setCreatedBy(userId);
        category.setDefaltFlag(DefaultTypeConstant.NO);
        transactionCategoryService.persist(category);
        return category;

    }

}
