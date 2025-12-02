package com.simplevat.rest.usercontroller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.simplevat.entity.PasswordHistory;
import com.simplevat.entity.UserCredential;
import com.simplevat.entity.*;
import com.simplevat.repository.EmployeeUserRelationRepository;
import com.simplevat.repository.PasswordHistoryRepository;
import com.simplevat.repository.UserCredentialRepository;
import com.simplevat.utils.MessageUtil;
import com.simplevat.utils.SimpleVatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.simplevat.entity.User;
import com.simplevat.service.RoleService;
import com.simplevat.service.UserService;
import com.simplevat.utils.DateFormatUtil;

import static com.simplevat.constant.ErrorConstant.ERROR;

@Component
public class UserRestHelper {
	private final Logger logger = LoggerFactory.getLogger(UserRestHelper.class);
	@Autowired
	private RoleService roleService;

	@Autowired
	private UserService userService;

	@Autowired
	private DateFormatUtil dateUtil;

	@Autowired
	private PasswordHistoryRepository passwordHistoryRepository;

	@Autowired
	private UserCredentialRepository userCredentialRepository;
	@Autowired
	private EmployeeUserRelationRepository employeeUserRelationRepository;

	public List<UserModel> getModelList(Object userList) {
		List<UserModel> userModelList = new ArrayList<>();
		if (userList != null) {
			for (User user : (List<User>) userList) {
				UserModel userModel = new UserModel();
				userModel.setId(user.getUserId());
				userModel.setFirstName(user.getFirstName());
				userModel.setLastName(user.getLastName());
				userModel.setActive(user.getIsActive());
				if (user.getDateOfBirth() != null) {
					userModel.setDob(dateUtil.getLocalDateTimeAsString(user.getDateOfBirth(), "dd-MM-yyyy"));
				}
				if (user.getRole() != null) {
					userModel.setRoleId(user.getRole().getRoleCode());
					userModel.setRoleName(user.getRole().getRoleName());
				}
				if (user.getCompany() != null) {
					userModel.setCompanyId(user.getCompany().getCompanyId());
					userModel.setCompanyName(user.getCompany().getCompanyName());
				}
				if(user.getUserTimezone()!=null)
					userModel.setTimeZone(user.getUserTimezone());
				userModelList.add(userModel);
			}
		}
		return userModelList;
	}

	public User getEntity(UserModel userModel) {

		if (userModel != null) {
			User user = new User();
			if (userModel.getId() != null) {
				user = userService.findByPK(userModel.getId());
			}
			user.setFirstName(userModel.getFirstName());
			user.setLastName(userModel.getLastName());
			user.setUserEmail(userModel.getEmail());
			if (userModel.getDob() != null&& !userModel.getDob().isEmpty()) {
				user.setDateOfBirth(dateUtil.getDateStrAsLocalDateTime(userModel.getDob(), "dd-MM-yyyy"));
			}
			if (userModel.getRoleId() != null) {
				user.setRole(roleService.findByPK(userModel.getRoleId()));
			}
			user.setIsActive(userModel.getActive());
			if(userModel.getTimeZone()!=null)
				user.setUserTimezone(userModel.getTimeZone());
			if(userModel.getUserPhotoChange()) {
				if (userModel.getProfilePic() != null) {
					try {
						user.setProfileImageBinary(userModel.getProfilePic().getBytes());
					} catch (IOException e) {
						logger.error(ERROR, e);
					}
				} else {
					user.setProfileImageBinary(null);
				}
			}
			user.setIsActive(userModel.getActive());
			if (userModel.getIsAlreadyAvailableEmployee()!=null && userModel.getIsAlreadyAvailableEmployee() ||
					userModel.getIsNewEmployee()!=null && userModel.getIsNewEmployee() )
			{user.setIsDesignationEnabled(true);}
			else
			{user.setIsDesignationEnabled(false);}
			return user;
		}
		return null;
	}

	public UserModel getModel(User user) {

		if (user != null) {
			UserModel userModel = new UserModel();

			userModel.setId(user.getUserId());
			userModel.setFirstName(user.getFirstName());
			userModel.setLastName(user.getLastName());
			userModel.setEmail(user.getUserEmail());
			userModel.setActive(user.getIsActive());
			if (user.getDateOfBirth() != null) {
				userModel.setDob(dateUtil.getLocalDateTimeAsString(user.getDateOfBirth(), "dd-MM-yyyy"));
			}
			if (user.getPassword()!=null){
				userModel.setPassword(user.getPassword());
			}
			if (user.getRole() != null) {
				userModel.setRoleId(user.getRole().getRoleCode());
				userModel.setRoleName(user.getRole().getRoleName());
			}
			if (user.getCompany() != null) {
				userModel.setCompanyId(user.getCompany().getCompanyId());
				userModel.setCompanyName(user.getCompany().getCompanyName());
			}
			if (user.getProfileImageBinary() != null) {
				userModel.setProfilePicByteArray(user.getProfileImageBinary());
			}
			if(user.getUserTimezone()!=null)
				userModel.setTimeZone(user.getUserTimezone());
			List<EmployeeUserRelation> employeeUserRelationList = employeeUserRelationRepository.findByUser(user);
			if (!employeeUserRelationList.isEmpty()){
				for (EmployeeUserRelation employeeUserRelation : employeeUserRelationList) {
					userModel.setEmployeeId(employeeUserRelation.getEmployee().getId());
					userModel.setEmpFirstName(employeeUserRelation.getEmployee().getFirstName());
					userModel.setEmpLastName(employeeUserRelation.getEmployee().getLastName());
				}
			}
			return userModel;
		}
		return null;
	}
	public SimpleVatMessage saveUserCredential(User user, String encodedPassword, SimpleVatMessage message) {
		UserCredential existingUser = userCredentialRepository.findUserCredentialByUser(user);
		if (existingUser!=null){
			//for existing user will create new password history
			savePasswordHistory(existingUser);
			//for existing user will update user credential
			existingUser.setCreatedBy(user.getUserId());
			existingUser.setCreatedDate(LocalDateTime.now());
			existingUser.setLastUpdatedBy(user.getUserId());
			existingUser.setLastUpdateDate(LocalDateTime.now());
			existingUser.setUser(user);
			existingUser.setIsActive(user.getIsActive());
			existingUser.setPassword(encodedPassword);
			userCredentialRepository.save(existingUser);
		}
		else {
			//create new user credential
			UserCredential userCredential = new UserCredential();
			userCredential.setCreatedBy(user.getUserId());
			userCredential.setCreatedDate(LocalDateTime.now());
			userCredential.setLastUpdatedBy(user.getUserId());
			userCredential.setLastUpdateDate(LocalDateTime.now());
			userCredential.setUser(user);
			userCredential.setIsActive(user.getIsActive());
			userCredential.setPassword(encodedPassword);
			userCredentialRepository.save(userCredential);
		}
		message = new SimpleVatMessage("0088",
				MessageUtil.getMessage("resetPassword.created.successful.msg.0088"), false);
		return message;
	}
	private void savePasswordHistory(UserCredential existingUser) {
		List<PasswordHistory> passwordHistoryList = passwordHistoryRepository.findPasswordHistoriesByUser(existingUser.getUser());
		//this will delete the very first stored password in Password History
		if (passwordHistoryList!=null && passwordHistoryList.size()>9){
			passwordHistoryRepository.delete(passwordHistoryList.get(0));
		}
		PasswordHistory passwordHistory = new PasswordHistory();
		passwordHistory.setCreatedBy(existingUser.getCreatedBy());
		passwordHistory.setCreatedDate(LocalDateTime.now());
		passwordHistory.setLastUpdatedBy(existingUser.getLastUpdatedBy());
		passwordHistory.setLastUpdateDate(LocalDateTime.now());
		passwordHistory.setUser(existingUser.getUser());
		passwordHistory.setIsActive(existingUser.getIsActive());
		passwordHistory.setPassword(existingUser.getPassword());
		passwordHistoryRepository.save(passwordHistory);
	}
}
