package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.TransactionCategoryClosingBalanceDao;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.model.VatReportModel;
import com.simpleaccounts.model.VatReportResponseModel;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.rest.financialreport.FinancialReportRequestModel;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.CurrencyExchangeService;
import com.simpleaccounts.service.TransactionCategoryClosingBalanceService;
import com.simpleaccounts.utils.DateFormatUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class TransactionCategoryClosingBalanceServiceImpl extends TransactionCategoryClosingBalanceService {

    @Autowired
    private TransactionCategoryClosingBalanceDao transactionCategoryClosingBalanceDao;

    @Autowired
    private DateFormatUtil dateFormatUtil;

    @Autowired
    BankAccountService bankAccountService;

    @Autowired
    CurrencyExchangeService currencyExchangeService;

    @Override
    protected Dao<Integer, TransactionCategoryClosingBalance> getDao() {
        return transactionCategoryClosingBalanceDao;
    }

    public List<TransactionCategoryClosingBalance> getList(ReportRequestModel reportRequestModel)
    {
        return transactionCategoryClosingBalanceDao.getList(reportRequestModel);
    }

    public List<TransactionCategoryClosingBalance> getListByChartOfAccountIds(ReportRequestModel reportRequestModel)
    {
        return transactionCategoryClosingBalanceDao.getListByChartOfAccountIds(reportRequestModel);
    }
    public List<VatReportModel> getListByPlaceOfSupply(FinancialReportRequestModel reportRequestModel)
    {
        return transactionCategoryClosingBalanceDao.getListByplaceOfSupply(reportRequestModel);
    }

    public TransactionCategoryClosingBalance getLastClosingBalanceByDate(TransactionCategory category){
        return transactionCategoryClosingBalanceDao.getLastClosingBalanceByDate(category);
    }

    public void updateClosingBalance(JournalLineItem lineItem)
    {
        TransactionCategory category = lineItem.getTransactionCategory();
            Transaction transaction = new Transaction();
        LocalDateTime journalDate=null;
        if ( lineItem.getJournal().getTransactionDate()!=null)
             journalDate = lineItem.getJournal().getTransactionDate().atStartOfDay();
        else
            journalDate = lineItem.getJournal().getJournalDate().atStartOfDay();
            boolean isDebit = (lineItem.getDebitAmount() != null && lineItem.getDebitAmount().compareTo(BigDecimal.ZERO) !=0)
                    ? Boolean.TRUE
                    : Boolean.FALSE;
            if(isDebit)
                transaction.setDebitCreditFlag('C');
            else
                transaction.setDebitCreditFlag('D');
            transaction.setCreatedBy(lineItem.getCreatedBy());
            transaction.setTransactionDate(journalDate);
            BigDecimal transactionAmount = isDebit ? lineItem.getDebitAmount():lineItem.getCreditAmount();
           if(lineItem.getDeleteFlag()&&isDebit)
           {
               transaction.setDebitCreditFlag('D');
           }
           else if(lineItem.getDeleteFlag()&&!isDebit){
               transaction.setDebitCreditFlag('C');
           }
            transaction.setExchangeRate(lineItem.getExchangeRate());
            transaction.setTransactionAmount(transactionAmount);
            updateClosingBalance(transaction,category);
    }

    public synchronized BigDecimal updateClosingBalance(Transaction transaction,TransactionCategory category) {
        Boolean isBankTransaction = false;
        BigDecimal  bankTransactionAmount =BigDecimal.ZERO;
        List<TransactionCategoryClosingBalance> balanceList = new ArrayList<>();
        if ((category.getChartOfAccount().getChartOfAccountId()==7 || category.getChartOfAccount().getChartOfAccountId()==8 )
                && category.getTransactionCategoryId()!=46){
            Map<String,Object> filterMap = new HashMap<>();
            filterMap.put("transactionCategory",category);
            BankAccount bankAccount = bankAccountService.findByAttributes(filterMap).get(0);
            CurrencyConversion getBaseCurrency =  currencyExchangeService.getExchangeRate(bankAccount.getBankAccountCurrency().getCurrencyCode());

            if (bankAccount.getBankAccountCurrency().equals(getBaseCurrency.getCurrencyCodeConvertedTo())){
                bankTransactionAmount = (transaction.getTransactionAmount());
            }
            else
            {
                bankTransactionAmount = (transaction.getTransactionAmount().divide(transaction.getExchangeRate(), 2, RoundingMode.HALF_UP));
            }
            isBankTransaction = true;
        }
        if (transaction != null) {
            boolean isUpdateOpeningBalance=false;
            boolean isDebit = transaction.getDebitCreditFlag().equals('D')
                    ? Boolean.TRUE
                    : Boolean.FALSE;
            BigDecimal transactionAmount = transaction.getTransactionAmount()!=null?transaction.getTransactionAmount():BigDecimal.ZERO;

            Map<String, Object> param = new HashMap<>();
            param.put("transactionCategory", category);
            param.put("closingBalanceDate", transaction.getTransactionDate());

            TransactionCategoryClosingBalance balance = getFirstElement(findByAttributes(param));
            BigDecimal closingBalance = BigDecimal.ZERO;
            BigDecimal bankClosingBalance =BigDecimal.ZERO;
            BigDecimal bankOpeningBalance = BigDecimal.ZERO;
            if (balance == null) {
                param = new HashMap<>();
                param.put("transactionCategory", category);
                TransactionCategoryClosingBalance lastBalance = transactionCategoryClosingBalanceDao.getClosingBalanceLessThanCurrentDate(transaction.getTransactionDate()
                        ,category);//getLastElement(findByAttributes(param));
                if(lastBalance == null && balance != null) {
                    balance = new TransactionCategoryClosingBalance();
                    balance.setTransactionCategory(category);
                    balance.setCreatedBy(transaction.getCreatedBy());
                    balance.setOpeningBalance(BigDecimal.ZERO);
                    balance.setEffectiveDate(new Date());
                    balance.setClosingBalanceDate(transaction.getTransactionDate());
                    balanceList.add(balance);
                }
                else if(lastBalance != null)
                {
                    balance = new TransactionCategoryClosingBalance();
                    balance.setTransactionCategory(lastBalance.getTransactionCategory());
                    balance.setCreatedBy(transaction.getCreatedBy());
                    balance.setOpeningBalance(lastBalance.getClosingBalance());
                    balance.setEffectiveDate(new Date());
                    balance.setClosingBalanceDate(transaction.getTransactionDate());
                    balance.setClosingBalance(lastBalance.getClosingBalance());
                    balance.setBankAccountClosingBalance(lastBalance.getBankAccountClosingBalance());
                    balanceList.add(balance);
                    List<TransactionCategoryClosingBalance> upperbalanceList = transactionCategoryClosingBalanceDao.
                            getClosingBalanceGreaterThanCurrentDate(balance.getClosingBalanceDate(),balance.getTransactionCategory());
                    if(upperbalanceList.size() > 0) {
                        balanceList.addAll(upperbalanceList);
                        isUpdateOpeningBalance = true;
                    }
                }
                else
                {
                    balance = new TransactionCategoryClosingBalance();
                    balance.setTransactionCategory(category);
                    balance.setCreatedBy(transaction.getCreatedBy());
                    balance.setOpeningBalance(BigDecimal.ZERO);
                    balance.setEffectiveDate(new Date());
                    balance.setClosingBalanceDate(transaction.getTransactionDate());
                    balance.setClosingBalance(BigDecimal.ZERO);
                    balanceList.add(balance);
                    List<TransactionCategoryClosingBalance> upperbalanceList = transactionCategoryClosingBalanceDao.
                            getClosingBalanceGreaterThanCurrentDate(balance.getClosingBalanceDate(),balance.getTransactionCategory());
                    if(upperbalanceList.size() > 0) {
                        balanceList.addAll(upperbalanceList);
                        isUpdateOpeningBalance = true;
                    }
                }
            }
            else
            {
                param = new HashMap<>();
                param.put("transactionCategory", category);
                closingBalance = balance.getClosingBalance();
                TransactionCategoryClosingBalance lastBalance = transactionCategoryClosingBalanceDao.getLastClosingBalanceByDate(category); //getLastElement(findByAttributes(param));
                if(lastBalance!=null && lastBalance.getClosingBalance() != balance.getClosingBalance() &&
                !(lastBalance.getClosingBalanceDate().isEqual(balance.getClosingBalanceDate())))
                {
                    isUpdateOpeningBalance = true;
                    balanceList = transactionCategoryClosingBalanceDao.
                            getClosingBalanceForTimeRange(balance.getClosingBalanceDate(),lastBalance.getClosingBalanceDate()
                                    ,balance.getTransactionCategory());
                }
                else
                    balanceList.add(balance);
            }
            boolean firstTransaction = true;
            for(TransactionCategoryClosingBalance transactionCategoryClosingBalance : balanceList) {
                closingBalance = transactionCategoryClosingBalance.getClosingBalance();
                if ( isBankTransaction){
                    if (transactionCategoryClosingBalance.getBankAccountClosingBalance()==null){
                        bankClosingBalance = BigDecimal.ZERO;
                    }
                    else {
                        bankClosingBalance = transactionCategoryClosingBalance.getBankAccountClosingBalance();
                    }
                }
                if (isDebit) {
                    closingBalance = closingBalance
                            .subtract(transactionAmount);
                    if ( isBankTransaction)
                    bankClosingBalance = bankClosingBalance.subtract(bankTransactionAmount);
                } else {
                    closingBalance = closingBalance
                            .add(transactionAmount);
                    if ( isBankTransaction)
                    bankClosingBalance  = bankClosingBalance.add(bankTransactionAmount);
                }
                if(isUpdateOpeningBalance &&!firstTransaction){
                    BigDecimal openingBalance = transactionCategoryClosingBalance.getOpeningBalance();
                    if ( isBankTransaction){
                        if (transactionCategoryClosingBalance.getBankAccountOpeningBalance()==null){
                            bankOpeningBalance = BigDecimal.ZERO;
                        }
                        else {
                            bankOpeningBalance = transactionCategoryClosingBalance.getBankAccountOpeningBalance();
                        }
                    }
                    if (isDebit) {
                        openingBalance = openingBalance
                                .subtract(transactionAmount);
                        if ( isBankTransaction) {
                            bankOpeningBalance = bankOpeningBalance.subtract(bankTransactionAmount);
                        }
                    } else {
                        openingBalance = openingBalance
                                .add(transactionAmount);
                        if ( isBankTransaction) {
                            bankOpeningBalance = bankOpeningBalance.add(bankTransactionAmount);
                        }
                    }
                    transactionCategoryClosingBalance.setOpeningBalance(openingBalance);
                    if (isBankTransaction){
                        transactionCategoryClosingBalance.setBankAccountOpeningBalance(bankOpeningBalance);
                    }
                }
                firstTransaction= false;
                transactionCategoryClosingBalance.setClosingBalance(closingBalance);
                if (isBankTransaction){
                    transactionCategoryClosingBalance.setBankAccountClosingBalance(bankClosingBalance);
                }
                transactionCategoryClosingBalanceDao.update(transactionCategoryClosingBalance);
            }
            return balance.getClosingBalance();
        }
        return null;
    }

    @Override
    public BigDecimal matchClosingBalanceForReconcile(LocalDateTime reconcileDate, TransactionCategory category) {
        TransactionCategoryClosingBalance transactionCategoryClosingBalance = transactionCategoryClosingBalanceDao.
                getClosingBalanceLessThanCurrentDate(reconcileDate,category);
        if(transactionCategoryClosingBalance !=null)
            return transactionCategoryClosingBalance.getBankAccountClosingBalance();
        return BigDecimal.ZERO;
    }

      @Override
    public void sumOfTotalAmountExce(FinancialReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel){
        transactionCategoryClosingBalanceDao.sumOfTotalAmountExce(reportRequestModel,vatReportResponseModel);
    }

    @Override
    public BigDecimal sumOfTotalAmountClosingBalance(FinancialReportRequestModel reportRequestModel, String lastMonth){
        return transactionCategoryClosingBalanceDao.sumOfTotalAmountClosingBalance(reportRequestModel,lastMonth);

    }

}
