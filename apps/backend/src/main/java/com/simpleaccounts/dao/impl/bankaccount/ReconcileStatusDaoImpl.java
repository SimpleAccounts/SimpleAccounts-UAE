package com.simpleaccounts.dao.impl.bankaccount;

import com.simpleaccounts.constant.BankAccountConstant;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.TransactionFilterEnum;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.bankaccount.ReconcileStatusDao;
import com.simpleaccounts.entity.bankaccount.ReconcileStatus;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import org.springframework.stereotype.Repository;

import javax.persistence.TypedQuery;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
@Repository
public class ReconcileStatusDaoImpl extends AbstractDao<Integer,ReconcileStatus > implements ReconcileStatusDao {

    @Override
    public List<ReconcileStatus> getAllReconcileStatusListByBankAccountId(Integer bankAccountId) {
        TypedQuery<ReconcileStatus> query = getEntityManager().createQuery(
                "SELECT r FROM ReconcileStatus r  WHERE r.deleteFlag = false AND r.bankAccount.bankAccountId =:bankAccountId ORDER BY r.reconciledDate DESC ",
                ReconcileStatus.class);
        query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankAccountId);
        query.setMaxResults(1);
        List<ReconcileStatus> reconcileStatusList = query.getResultList();
        if (reconcileStatusList != null && !reconcileStatusList.isEmpty()) {
            return reconcileStatusList;
        }
        return new ArrayList<>();
    }

    @Override
    public ReconcileStatus getAllReconcileStatusByBankAccountId(Integer bankAccountId, LocalDateTime date) {
        TypedQuery<ReconcileStatus> query = getEntityManager().createQuery(
                "SELECT r FROM ReconcileStatus r  WHERE r.deleteFlag = false AND r.bankAccount.bankAccountId =:bankAccountId " +
                        "and r.reconciledDate <= :reconciledEndDate ORDER BY r.reconciledDate DESC",
                ReconcileStatus.class);
        query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankAccountId);
        query.setParameter("reconciledEndDate", date);
        List<ReconcileStatus> reconcileStatusList = query.getResultList();
        if (reconcileStatusList != null && !reconcileStatusList.isEmpty()) {
            return reconcileStatusList.get(0);
        }
        return null;
    }

    @Override
    public PaginationResponseModel getAllReconcileStatusList(Map<TransactionFilterEnum, Object> filterMap,
                                                         PaginationModel paginationModel) {
        List<DbFilter> dbFilters = new ArrayList<>();
        filterMap.forEach((filter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(filter.getDbColumnName())
                .condition(filter.getCondition()).value(value).build()));
        return new PaginationResponseModel(this.getResultCount(dbFilters),
                this.executeQuery(dbFilters, paginationModel));
    }

}
