package com.simpleaccounts.dao;

import com.simpleaccounts.entity.Activity;
import java.util.List;

public interface ActivityDao extends Dao<Integer, Activity> {

    List<Activity> getLatestActivites(int maxActiviyCount);
}
