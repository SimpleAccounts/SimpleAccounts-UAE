package com.simpleaccounts.dao.bankaccount;

import com.simpleaccounts.constant.dbfilter.TransactionFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.bankaccount.ReconcileStatus;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface ReconcileStatusDao extends Dao<Integer, ReconcileStatus> {

    public List<ReconcileStatus> getAllReconcileStatusListByBankAccountId(Integer bankAccountId);

    public ReconcileStatus getAllReconcileStatusByBankAccountId(Integer bankAccountId, LocalDateTime date);

    public PaginationResponseModel getAllReconcileStatusList(Map<TransactionFilterEnum, Object> filterMap,
                                                         PaginationModel paginationModel);
}
