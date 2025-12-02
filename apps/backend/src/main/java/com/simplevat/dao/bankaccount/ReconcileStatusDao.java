package com.simplevat.dao.bankaccount;

import com.simplevat.constant.dbfilter.TransactionFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.entity.bankaccount.ReconcileStatus;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface ReconcileStatusDao extends Dao<Integer, ReconcileStatus> {

    public List<ReconcileStatus> getAllReconcileStatusListByBankAccountId(Integer bankAccountId);

    public ReconcileStatus getAllReconcileStatusByBankAccountId(Integer bankAccountId, LocalDateTime date);

    public PaginationResponseModel getAllReconcileStatusList(Map<TransactionFilterEnum, Object> filterMap,
                                                         PaginationModel paginationModel);
}
