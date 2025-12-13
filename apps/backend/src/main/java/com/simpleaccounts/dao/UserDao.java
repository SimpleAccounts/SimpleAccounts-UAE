package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.UserFilterEnum;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    