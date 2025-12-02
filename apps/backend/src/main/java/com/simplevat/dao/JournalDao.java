package com.simplevat.dao;

import java.util.List;
import java.util.Map;

import com.simplevat.constant.PostingReferenceTypeEnum;
import com.simplevat.constant.dbfilter.JournalFilterEnum;
import com.simplevat.entity.Journal;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

public interface JournalDao extends Dao<Integer, Journal> {

	public void deleteByIds(List<Integer> ids);
	public void deleteAndUpdateByIds(List<Integer> ids,Boolean updateOpeningBalance);
	public PaginationResponseModel getJornalList(Map<JournalFilterEnum, Object> filterMap,
			PaginationModel paginationModel);
    public Journal getJournalByReferenceId(Integer transactionId);

    public Journal getJournalByReferenceIdAndType(Integer transactionId, PostingReferenceTypeEnum refType);


}
