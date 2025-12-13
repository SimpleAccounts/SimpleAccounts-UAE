package com.simpleaccounts.service.impl.bankaccount;

import com.simpleaccounts.constant.TransactionExplinationStatusEnum;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.constant.dbfilter.TransactionFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.bankaccount.ReconcileStatusDao;
import com.simpleaccounts.entity.bankaccount.ReconcileStatus;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.bankaccount.ReconcileStatusService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service("reconcileStatusService")
@Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
@RequiredArgsConstructor
public class ReconcileStatusServiceImpl extends ReconcileStatusService  {

    private final ReconcileStatusDao reconcilestatusDao;
    private final TransactionServiceImpl transactionService;

    @Override
    public  List<ReconcileStatus> getAllReconcileStatusListByBankAccountId(Integer bankAccountId){

        return reconcilestatusDao.getAllReconcileStatusListByBankAccountId(bankAccountId);

    }

    @Override
    public  ReconcileStatus getAllReconcileStatusByBankAccountId(Integer bankAccountId, LocalDateTime date){

        return reconcilestatusDao.getAllReconcileStatusByBankAccountId(bankAccountId,date);

    }

    @Override
    protected Dao<Integer, ReconcileStatus> getDao() {
        return this.reconcilestatusDao;
    }

    @Override
    public PaginationResponseModel getAllReconcileStatusList(Map<TransactionFilterEnum, Object> filterModel,
                                                         PaginationModel paginationModel) {
        return reconcilestatusDao.getAllReconcileStatusList(filterModel, paginationModel);
    }
    @Override
    public  void deleteByIds(ArrayList<Integer> ids)
    {
        for(Integer reconcileId : ids)
        {
            ReconcileStatus status = reconcilestatusDao.findByPK(reconcileId);
            transactionService.updateTransactionStatusReconcile(status.getReconciledStartDate(),status.getReconciledDate()
                    ,status.getBankAccount().getBankAccountId(), TransactionExplinationStatusEnum.FULL);
            status.setDeleteFlag(Boolean.TRUE);
            reconcilestatusDao.update(status);
        }

    }
}
