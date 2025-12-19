package com.simpleaccounts.rest.usercontroller;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.PasswordHistory;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.UserCredential;
import com.simpleaccounts.repository.EmployeeUserRelationRepository;
import com.simpleaccounts.repository.PasswordHistoryRepository;
import com.simpleaccounts.repository.UserCredentialRepository;
import com.simpleaccounts.service.RoleService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserRestHelper {
	private static final String DATE_FORMAT_DD_MM_YYYY = "dd-MM-yyyy";
	
	private final Logger logger = LoggerFactory.getLogger(UserRestHelper.class);
	private final RoleService roleService;

	private final UserService userService;

	private final DateFormatUtil dateUtil;

	private final PasswordHistoryRepository passwordHistoryRepository;

	private final UserCredentialRepository userCredentialRepository;
	private final EmployeeUserRelationRepository employeeUserRelationRepository;
	
	@PersistenceContext
	private EntityManager entityManager;

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
					userModel.setDob(dateUtil.getLocalDateTimeAsString(user.getDateOfBirth(), DATE_FORMAT_DD_MM_YYYY));
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
				user.setDateOfBirth(dateUtil.getDateStrAsLocalDateTime(userModel.getDob(), DATE_FORMAT_DD_MM_YYYY));
			}
			if (userModel.getRoleId() != null) {
				user.setRole(roleService.findByPK(userModel.getRoleId()));
			}
			user.setIsActive(userModel.getActive());
			if(userModel.getTimeZone()!=null)
				user.setUserTimezone(userModel.getTimeZone());
				if(Boolean.TRUE.equals(userModel.getUserPhotoChange())) {
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
				boolean designationEnabled = Boolean.TRUE.equals(userModel.getIsAlreadyAvailableEmployee())
						|| Boolean.TRUE.equals(userModel.getIsNewEmployee());
				user.setIsDesignationEnabled(designationEnabled);
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
	public SimpleAccountsMessage saveUserCredential(User user, String encodedPassword) {
		// Ensure user is managed and has all required fields
		User managedUser = userService.findByPK(user.getUserId());
		if (managedUser == null) {
			logger.error("User not found for userId: {}", user.getUserId());
			throw new RuntimeException("User not found for userId: " + user.getUserId());
		}
		// Verify userEmail is not null
		if (managedUser.getUserEmail() == null || managedUser.getUserEmail().trim().isEmpty()) {
			logger.error("User email is null for userId: {}", user.getUserId());
			throw new RuntimeException("User email is required but was null for userId: " + user.getUserId());
		}
		
		UserCredential existingUser = userCredentialRepository.findUserCredentialByUser(managedUser);
		if (existingUser!=null){
			// Try to save password history, but don't fail the entire operation if it fails
			try {
				savePasswordHistory(managedUser.getUserId(), existingUser.getPassword(), existingUser.getCreatedBy(), existingUser.getLastUpdatedBy(), existingUser.getIsActive());
			} catch (Exception e) {
				logger.warn("Failed to save password history for userId: {}. Password reset will continue, but password history will not be updated. Error: {}", 
					managedUser.getUserId(), e.getMessage());
				// Continue with the password reset even if password history fails
			}

			existingUser.setCreatedBy(managedUser.getUserId());
			existingUser.setCreatedDate(LocalDateTime.now());
			existingUser.setLastUpdatedBy(managedUser.getUserId());
			existingUser.setLastUpdateDate(LocalDateTime.now());
			existingUser.setUser(managedUser);
			existingUser.setIsActive(managedUser.getIsActive());
			existingUser.setPassword(encodedPassword);
			userCredentialRepository.save(existingUser);
		}
		else {
			//create new user credential
			UserCredential userCredential = new UserCredential();
			userCredential.setCreatedBy(managedUser.getUserId());
			userCredential.setCreatedDate(LocalDateTime.now());
			userCredential.setLastUpdatedBy(managedUser.getUserId());
			userCredential.setLastUpdateDate(LocalDateTime.now());
			userCredential.setUser(managedUser);
			userCredential.setIsActive(managedUser.getIsActive());
			userCredential.setPassword(encodedPassword);
			userCredentialRepository.save(userCredential);
		}
		SimpleAccountsMessage message = new SimpleAccountsMessage("0088",
				MessageUtil.getMessage("resetPassword.created.successful.msg.0088"), false);
		return message;
	}
	private void savePasswordHistory(Integer userId, String password, Integer createdBy, Integer lastUpdatedBy, Boolean isActive) {
		// First verify the user exists and has a valid email
		User user = userService.findByPK(userId);
		if (user == null) {
			logger.error("User not found for userId: {}", userId);
			throw new RuntimeException("User not found for userId: " + userId);
		}
		// Verify userEmail is not null
		if (user.getUserEmail() == null || user.getUserEmail().trim().isEmpty()) {
			logger.error("User email is null for userId: {}, cannot save password history. User details: firstName={}, lastName={}", 
				userId, user.getFirstName(), user.getLastName());
			throw new RuntimeException("User email is required but was null for userId: " + userId);
		}
		
		// Use custom query with userId instead of User entity to avoid entity detachment issues
		List<PasswordHistory> passwordHistoryList = passwordHistoryRepository.findPasswordHistoriesByUserId(userId);
		//this will delete the very first stored password in Password History
		if (passwordHistoryList!=null && passwordHistoryList.size()>9){
			passwordHistoryRepository.delete(passwordHistoryList.get(0));
		}
		
		// Use native SQL insert to avoid loading/setting the User entity, which causes Hibernate to try to persist it
		// This directly inserts the USER_ID foreign key without needing the User entity
		LocalDateTime now = LocalDateTime.now();
		passwordHistoryRepository.insertPasswordHistory(createdBy, now, lastUpdatedBy, now, userId, password, isActive);
	}
}
