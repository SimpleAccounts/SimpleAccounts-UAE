package com.simplevat.dao.impl.bankaccount;

import java.util.List;

import org.apache.commons.collections4.CollectionUtils;
import org.springframework.stereotype.Repository;

import com.simplevat.dao.bankaccount.ChartOfAccountDao;
import com.simplevat.entity.bankaccount.ChartOfAccount;
import com.simplevat.dao.AbstractDao;
import javax.persistence.TypedQuery;

@Repository
public class ChartOfAccountDaoImpl extends AbstractDao<Integer, ChartOfAccount> implements ChartOfAccountDao {

	@Override
	public ChartOfAccount updateOrCreateTransaction(ChartOfAccount chartOfAccount) {
		return this.update(chartOfAccount);
	}

	@Override
	public ChartOfAccount getChartOfAccount(Integer id) {
		return this.findByPK(id);
	}

	@Override
	public List<ChartOfAccount> findAll() {
		return this.executeNamedQuery("findAllChartOfAccount");
	}

	@Override
	public List<ChartOfAccount> findByText(String transactionTxt) {
		TypedQuery<ChartOfAccount> query = getEntityManager().createQuery(
				"SELECT c FROM ChartOfAccount c WHERE c.deleteFlag=false AND c.chartOfAccountName LIKE '%'||:searchToken||'%' ORDER BY c.defaltFlag DESC , c.orderSequence,c.chartOfAccounteName ASC",
				ChartOfAccount.class);
		query.setParameter("searchToken", transactionTxt);
		return query.getResultList();
	}

	@Override
	public ChartOfAccount getDefaultChartOfAccount() {
		List<ChartOfAccount> transactoinTypes = findAll();
		if (CollectionUtils.isNotEmpty(transactoinTypes)) {
			return transactoinTypes.get(0);
		}
		return null;
	}

	@Override
	public List<ChartOfAccount> findAllChild() {
		return this.executeNamedQuery("findAllChildChartOfAccount");
	}

}
