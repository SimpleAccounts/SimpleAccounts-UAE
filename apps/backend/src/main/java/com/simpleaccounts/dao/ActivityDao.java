package com.simpleaccounts.dao;

import java.util.List;

import com.simpleaccounts.entity.Activity;

public interface ActivityDao extends Dao<Integer, Activity> {

    List<Activity> getLatestActivites(int maxActiviyCount);
}
