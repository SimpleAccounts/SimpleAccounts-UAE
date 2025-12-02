package com.simplevat.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.simplevat.constant.dbfilter.UserFilterEnum;
import com.simplevat.entity.User;
import com.simplevat.model.JwtRequest;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.usercontroller.UserModel;

public abstract class UserService extends SimpleVatService<Integer, User> {

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
