package com.simpleaccounts.dao;

import java.util.List;
import java.util.Map;

import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.dbfilter.JournalFilterEnum;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

public interface JournalDao extends Dao<Integer, Journal> {

	public void deleteByIds(List<Integer> ids);
	public void deleteAndUpdateByIds(List<Integer> ids,Boolean updateOpeningBalance);
	public PaginationResponseModel getJornalList(Map<JournalFilterEnum, Object> filterMap,
			PaginationModel paginationModel);
    public Journal getJournalByReferenceId(Integer transactionId);

    public Journal getJournalByReferenceIdAndType(Integer transactionId, PostingReferenceTypeEnum refType);

}
