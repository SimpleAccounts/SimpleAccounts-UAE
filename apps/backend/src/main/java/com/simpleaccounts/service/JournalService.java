package com.simpleaccounts.service;

import java.util.List;
import java.util.Map;

import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import org.springframework.stereotype.Service;

import com.simpleaccounts.constant.dbfilter.JournalFilterEnum;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

@Service
public abstract class JournalService extends SimpleAccountsService<Integer, Journal> {
	public abstract void deleteByIds(List<Integer> ids);

	public abstract void deleteAndUpdateByIds(List<Integer> ids,Boolean updateOpeningBalance);
	public abstract void updateOpeningBalance(Journal entity,Boolean updateOpeningBalance);

	public abstract PaginationResponseModel getJornalList(Map<JournalFilterEnum, Object> filterMap,
			PaginationModel paginationModel);

	public abstract Journal getJournalByReferenceId(Integer transactionId);
	public abstract Journal getJournalByReferenceIdAndType(Integer transactionId, PostingReferenceTypeEnum refType);

}
