package com.simplevat.dao;

import java.util.Optional;

import com.simplevat.constant.dbfilter.UserFilterEnum;
import com.simplevat.entity.User;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

public interface UserDao extends Dao<Integer, User> {

    public Optional<User> getUserByEmail(String emailAddress);

    public User getUserEmail(String emailAddress);

    public boolean getUserByEmail(String usaerName, String password);

    public User getUserPassword(Integer userId);

    public List<User> getAllUserNotEmployee();

    public void deleteByIds(List<Integer> ids);

	public PaginationResponseModel getUserList(Map<UserFilterEnum, Object> filterMap,PaginationModel paginationModel);

    public List<DropdownModel> getUserForDropdown();

    List<Integer> getAllUserIds();

    List<DropdownModel> getUserForPayrollDropdown(Integer userId);
}
    