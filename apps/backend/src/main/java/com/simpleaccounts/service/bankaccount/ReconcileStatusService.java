package com.simpleaccounts.service.bankaccount;

import com.simpleaccounts.constant.dbfilter.TransactionFilterEnum;
import com.simpleaccounts.entity.bankaccount.ReconcileStatus;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.SimpleAccountsService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public abstract class ReconcileStatusService extends SimpleAccountsService<Integer, ReconcileStatus> {

    public abstract List<ReconcileStatus> getAllReconcileStatusListByBankAccountId(Integer bankAccountId);
    public abstract ReconcileStatus getAllReconcileStatusByBankAccountId(Integer bankAccountId, LocalDateTime date);

    public abstract PaginationResponseModel getAllReconcileStatusList(Map<TransactionFilterEnum, Object> filterModel,
                                                                  PaginationModel paginationModel);

    public abstract void deleteByIds(ArrayList<Integer> ids);
}
