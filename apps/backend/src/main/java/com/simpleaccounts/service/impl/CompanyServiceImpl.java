/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.service.impl;

import com.simpleaccounts.constant.dbfilter.CompanyFilterEnum;
import com.simpleaccounts.dao.CompanyDao;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.rest.DropdownModel;

import com.simpleaccounts.service.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author admin
 */
@Service("companyService")
@Transactional
public class CompanyServiceImpl extends CompanyService {

    private final Logger logger = LoggerFactory.getLogger(CompanyServiceImpl.class);
    @Autowired
    private CompanyDao companyDao;

    @Autowired
    private BankAccountService bankAccountService;

    @Autowired
    private TransactionCategoryService transactionCategoryService;

    @Autowired
    protected JournalService journalService;

    @Autowired
    private CoacTransactionCategoryService coacTransactionCategoryService;

    @Autowired
    private BankAccountStatusService bankAccountStatusService;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private CurrencyService currencyService;

    @Autowired
    private CompanyTypeService companyTypeService;

    @Autowired
    private IndustryTypeService industryTypeService;

    @Autowired
    private RoleService roleService;

    @Autowired
    private UserService userService;

    @Autowired
    private CurrencyExchangeService currencyExchangeService;

    @Autowired
    private BankAccountTypeService bankAccountTypeService;

    @Override
    protected Dao<Integer, Company> getDao() {
        return this.companyDao;
    }

    @Override
    public void updateCompanyExpenseBudget(BigDecimal expenseAmount, Company company) {
        company.setCompanyExpenseBudget(company.getCompanyExpenseBudget().add(expenseAmount));
        update(company);
    }

    @Override
    public void updateCompanyRevenueBudget(BigDecimal revenueAmount, Company company) {
        company.setCompanyRevenueBudget(company.getCompanyRevenueBudget().add(revenueAmount));
        update(company);
    }

    @Override
    public Company getCompany() {
        return companyDao.getCompany();
    }

    @Override
    public List<Company> getCompanyList(Map<CompanyFilterEnum, Object> filterMap) {
        return companyDao.getCompanyList(filterMap);
    }
    @Override
    public Integer getDbConncection(){
        return companyDao.getDbConncection();
    }

    @Override
    public void deleteByIds(ArrayList<Integer> ids) {
        companyDao.deleteByIds(ids);
    }

    @Override
    public List<DropdownModel> getCompaniesForDropdown() {
       return companyDao.getCompaniesForDropdown();
    }
    @Override
    public Currency getCompanyCurrency(){
        return companyDao.getCompanyCurrency();
    }

//    @Override
//    @Transactional(rollbackFor ={Exception.class})
//    public  String registerCompany(RegistrationModel registrationModel) throws Exception{
//        try {
//            String password = registrationModel.getPassword();
//            if (password != null && !password.trim().isEmpty()) {
//                BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
//                String encodedPassword = passwordEncoder.encode(password);
//                registrationModel.setPassword(encodedPassword);
//            }
//            User user = new User();
//            user.setFirstName(registrationModel.getFirstName());
//            user.setLastName(registrationModel.getLastName());
//            user.setUserEmail(registrationModel.getEmail());
//            user.setPassword(registrationModel.getPassword());
//            if (registrationModel.getTimeZone() != null)
//                user.setUserTimezone(registrationModel.getTimeZone());
//            user.setRole(roleService.findByPK(1));
//            user.setCreatedBy(1);
//            user.setIsActive(true);
//            userService.persist(user);
//
//            Map<String, Object> param = new HashMap<>();
//            param.put("companyName", registrationModel.getCompanyName());
//            List<Company> companyList = companyService.findByAttributes(param);
////            if (companyList!=null && !companyList.isEmpty()){
////                throw new RuntimeException("Throwing exception for demoing Rollback!!!");
////            }
//            Company company = new Company();
//            company.setCompanyName(registrationModel.getCompanyName());
//            if (registrationModel.getCompanyTypeCode() != null) {
//                company.setCompanyTypeCode(companyTypeService.findByPK(registrationModel.getCompanyTypeCode()));
//            }
//            if (registrationModel.getIndustryTypeCode() != null) {
//                company.setIndustryTypeCode(industryTypeService.findByPK(registrationModel.getIndustryTypeCode()));
//            }
//            if (registrationModel.getCurrencyCode() != null) {
//                company.setCurrencyCode(currencyService.findByPK(registrationModel.getCurrencyCode()));
//            }
//            currencyService.updateCurrencyProfile(company.getCurrencyCode().getCurrencyCode());
//            CurrencyConversion currencyConversion = new CurrencyConversion();
//            Currency currency = currencyService.findByPK(company.getCurrencyCode().getCurrencyCode());
//            currencyConversion.setCurrencyCode(currency);
//            currencyConversion.setCurrencyCodeConvertedTo(currency);
//            currencyConversion.setExchangeRate(BigDecimal.ONE);
//            currencyConversion.setCreatedDate(LocalDateTime.now());
//            currencyExchangeService.persist(currencyConversion);
//            company.setCreatedBy(user.getUserId());
//            company.setCreatedDate(LocalDateTime.now());
//            company.setDeleteFlag(Boolean.FALSE);
//            companyService.persist(company);
////        if (companyList!=null && !companyList.isEmpty()){
////            throw new RuntimeException("Throwing exception for demoing Rollback!!!");
////        }
//            user.setCompany(company);
//            userService.update(user);
//
//            BankAccount pettyCash = new BankAccount();
//            pettyCash.setBankName("PettyCash");
//            pettyCash.setBankAccountName(company.getCompanyName());
//            BankAccountType bankAccountType =bankAccountTypeService.getBankAccountType(3);
//            pettyCash.setBankAccountType(bankAccountType);
//            pettyCash.setCreatedBy(user.getCreatedBy());
//            pettyCash.setCreatedDate(LocalDateTime.now());
//            pettyCash.setBankAccountCurrency(company.getCurrencyCode());
//            pettyCash.setPersonalCorporateAccountInd('C');
//            pettyCash.setOpeningBalance(BigDecimal.ZERO);
//            pettyCash.setCurrentBalance(BigDecimal.ZERO);
//            pettyCash.setOpeningDate(LocalDateTime.now());
//            pettyCash.setAccountNumber("----------");
//            BankAccountStatus bankAccountStatus = bankAccountStatusService.getBankAccountStatusByName("ACTIVE");
//            pettyCash.setBankAccountStatus(bankAccountStatus);
//
//
//            // create transaction category with bankname-accout name
//
//            if (pettyCash.getTransactionCategory() == null) {
//                TransactionCategory bankCategory = transactionCategoryService
//                        .findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.PETTY_CASH.getCode());
//                pettyCash.setTransactionCategory(bankCategory);
//
//            }
//            bankAccountService.persist(pettyCash);
//
////                    if (companyList!=null && !companyList.isEmpty()){
////            throw new RuntimeException("Throwing exception for demoing Rollback!!!");
////        }
//            TransactionCategory category = transactionCategoryService.findByPK(pettyCash.getTransactionCategory().getTransactionCategoryId());
//            TransactionCategory transactionCategory = getValidTransactionCategory(category);
//            boolean isDebit = false;
//            if (StringUtils.equalsAnyIgnoreCase(transactionCategory.getTransactionCategoryCode(),
//                    TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode())) {
//                isDebit = true;
//            }
//
//            List<JournalLineItem> journalLineItemList = new ArrayList<>();
//            Journal journal = new Journal();
//            JournalLineItem journalLineItem1 = new JournalLineItem();
//            journalLineItem1.setTransactionCategory(category);
//            if (isDebit) {
//                journalLineItem1.setDebitAmount(pettyCash.getOpeningBalance());
//            } else {
//                journalLineItem1.setCreditAmount(pettyCash.getOpeningBalance());
//            }
//            journalLineItem1.setReferenceType(PostingReferenceTypeEnum.PETTY_CASH);
//            journalLineItem1.setReferenceId(category.getTransactionCategoryId());
//            journalLineItem1.setCreatedBy(user.getCreatedBy());
//            journalLineItem1.setJournal(journal);
//            journalLineItemList.add(journalLineItem1);
//
//            JournalLineItem journalLineItem2 = new JournalLineItem();
//            journalLineItem2.setTransactionCategory(transactionCategory);
//            if (!isDebit) {
//                journalLineItem2.setDebitAmount(pettyCash.getOpeningBalance());
//            } else {
//                journalLineItem2.setCreditAmount(pettyCash.getOpeningBalance());
//            }
//            journalLineItem2.setReferenceType(PostingReferenceTypeEnum.PETTY_CASH);
//            journalLineItem2.setReferenceId(transactionCategory.getTransactionCategoryId());
//            journalLineItem2.setCreatedBy(user.getCreatedBy());
//            journalLineItem2.setJournal(journal);
//            journalLineItemList.add(journalLineItem2);
//
//            journal.setJournalLineItems(journalLineItemList);
//            journal.setCreatedBy(user.getCreatedBy());
//            journal.setPostingReferenceType(PostingReferenceTypeEnum.PETTY_CASH);
//            journal.setJournalDate(LocalDate.now());
//            journal.setTransactionDate(LocalDateTime.now());
//            journalService.persist(journal);
//            coacTransactionCategoryService.addCoacTransactionCategory(pettyCash.getTransactionCategory().getChartOfAccount(),
//                    pettyCash.getTransactionCategory());
////            if (companyList!=null && !companyList.isEmpty()){
////                throw new RuntimeException("Throwing exception for demoing Rollback!!!");
////            }
//            return  "Company Registered Successfully";
//        } catch (Exception e) {
//            logger.error(ERROR, e);
//            throw e;
////            return  "Company Registration Failed";
//        }
//
//    }

//    private TransactionCategory getValidTransactionCategory(TransactionCategory transactionCategory) {
//        String transactionCategoryCode = transactionCategory.getChartOfAccount().getChartOfAccountCode();
//        ChartOfAccountCategoryCodeEnum chartOfAccountCategoryCodeEnum = ChartOfAccountCategoryCodeEnum.getChartOfAccountCategoryCodeEnum(transactionCategoryCode);
//        if (chartOfAccountCategoryCodeEnum == null)
//            return null;
//        switch (chartOfAccountCategoryCodeEnum) {
//            case BANK:
//            case CASH:
//                return transactionCategoryService
//                        .findTransactionCategoryByTransactionCategoryCode(
//                                TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode());
//        }
//        return transactionCategoryService
//                .findTransactionCategoryByTransactionCategoryCode(
//                        TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode());
//    }

}
