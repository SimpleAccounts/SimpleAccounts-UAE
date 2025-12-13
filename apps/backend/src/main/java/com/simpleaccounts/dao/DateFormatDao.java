package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.DateFormatFilterEnum;
import com.simpleaccounts.entity.DateFormat;
import java.util.List;
import java.util.Map;

public interface DateFormatDao extends Dao<Integer, DateFormat >{

	   public List<DateFormat> getDateFormatList(Map<DateFormatFilterEnum , Object> filterMap);

	    public void deleteByIds(List<Integer> ids);
}
