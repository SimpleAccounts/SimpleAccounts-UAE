package com.simpleaccounts.dao;

import java.util.List;
import java.util.Map;

import com.simpleaccounts.constant.dbfilter.DateFormatFilterEnum;
import com.simpleaccounts.entity.DateFormat;

public interface DateFormatDao extends Dao<Integer, DateFormat >{

	   public List<DateFormat> getDateFormatList(Map<DateFormatFilterEnum , Object> filterMap);

	    public void deleteByIds(List<Integer> ids);
}
