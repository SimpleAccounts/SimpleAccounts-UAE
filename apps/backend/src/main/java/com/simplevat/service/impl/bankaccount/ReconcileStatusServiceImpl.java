package com.simplevat.service.impl.bankaccount;

import com.simplevat.constant.TransactionExplinationStatusEnum;
import com.simplevat.constant.dbfilter.TransactionFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.dao.bankaccount.ReconcileStatusDao;
import com.simplevat.dao.impl.bankaccount.ReconcileStatusDaoImpl;
import com.simplevat.entity.bankaccount.ReconcileStatus;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.bankaccount.ReconcileStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service("reconcileStatusService")
@Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
public class ReconcileStatusServiceImpl extends ReconcileStatusService  {

    @Autowired
    private ReconcileStatusDao reconcilestatusDao;
    @Autowired
    TransactionServiceImpl transactionService;

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
