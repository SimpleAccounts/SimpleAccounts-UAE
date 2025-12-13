package com.simpleaccounts.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.simpleaccounts.constant.dbfilter.UserFilterEnum;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.model.JwtRequest;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.usercontroller.UserModel;

public abstract class UserService extends SimpleAccountsService<Integer, User> {

	public abstract Optional<User> getUserByEmail(String emailAddress);

	public abstract User getUserEmail(String emailAddress);

	public abstract List<User> findAll();

	public abstract boolean authenticateUser(String usaerName, String password);

	public abstract User getUserPassword (Integer userId);

	public abstract List<User> getAllUserNotEmployee();

	public abstract void deleteByIds(List<Integer> ids);

	public abstract PaginationResponseModel getUserList(Map<UserFilterEnum, Object> filterMap,PaginationModel paginationModel);

	public abstract boolean updateForgotPasswordToken(User user, JwtRequest jwtRequest);

	public abstract boolean createPassword (User user,UserModel selectedUser,User sender);

	public abstract boolean newUserMail(User user,String loginUrl,String pas);
	public abstract boolean testUserMail(User user) throws IOException;

	public abstract List<DropdownModel> getUserForDropdown();
	public abstract List<DropdownModel> getUserForPayrollDropdown(Integer userId);
	
	public abstract Optional<User> findUserById(Integer id);
}
