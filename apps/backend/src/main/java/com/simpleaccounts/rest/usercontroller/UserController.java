/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.usercontroller;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.DefaultTypeConstant;
import com.simpleaccounts.constant.EmailConstant;
import com.simpleaccounts.constant.dbfilter.ORDERBYENUM;
import com.simpleaccounts.constant.dbfilter.UserFilterEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.integration.MailIntegration;
import com.simpleaccounts.repository.PasswordHistoryRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.utils.*;
import io.swagger.annotations.ApiOperation;
import java.io.File;
import java.text.MessageFormat;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.mail.internet.MimeMultipart;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;

/**
 *
 * @author Sonu
 */
@RestController
@RequestMapping(value = "/rest/user")
@RequiredArgsConstructor
public class UserController{
	private static final String LOG_NO_DATA_FOUND = "NO DATA FOUND = INTERNAL_SERVER_ERROR";
	private static final String DATE_FORMAT_DD_MM_YYYY = "dd-MM-yyyy";
	private static final String LOG_ERROR = "Error";

	private  Logger logger = LoggerFactory.getLogger(UserController.class);

	private final UserService userService;

	private final EmaiLogsService emaiLogsService;

	private final  FileHelper fileUtility;

	private final  RoleService roleService;

	private final  ConfigurationService configurationService;

	private final JwtTokenUtil jwtTokenUtil;

	private final  CompanyService companyService;

	private final UserRestHelper userRestHelper;

	private final MailIntegration mailIntegration;

	private final TransactionCategoryService transactionCategoryService;

	private final CoacTransactionCategoryService coacTransactionCategoryService;

	private final EmployeeService employeeService;

	private final EmployeeUserRelationHelper employeeUserRelationHelper;

	private final PasswordHistoryRepository passwordHistoryRepository;

	@LogRequest
	@ApiOperation(value = "Get User List")
	@GetMapping(value = "/getList")
	public ResponseEntity<PaginationResponseModel> getUserList(UserRequestFilterModel filterModel) {
		try {
			Map<UserFilterEnum, Object> filterDataMap = new HashMap<>();
			filterDataMap.put(UserFilterEnum.FIRST_NAME, filterModel.getName());
			filterDataMap.put(UserFilterEnum.DELETE_FLAG, false);
			if (filterModel.getActive() != null)
				filterDataMap.put(UserFilterEnum.ACTIVE, filterModel.getActive().equals(1) ? true : false);
			if (filterModel.getDob() != null && !filterModel.getDob().isEmpty()) {
				SimpleDateFormat dateFormat = new SimpleDateFormat(DATE_FORMAT_DD_MM_YYYY);
				LocalDateTime dateTime = Instant.ofEpochMilli(dateFormat.parse(filterModel.getDob()).getTime())
						.atZone(ZoneId.systemDefault()).toLocalDateTime();
				filterDataMap.put(UserFilterEnum.DOB, dateTime);
			}
			if (filterModel.getCompanyId() != null) {
				filterDataMap.put(UserFilterEnum.COMPANY, companyService.findByPK(filterModel.getCompanyId()));
			}
			if (filterModel.getRoleId() != null) {
				filterDataMap.put(UserFilterEnum.ROLE, roleService.findByPK(filterModel.getRoleId()));
			}
			filterDataMap.put(UserFilterEnum.ORDER_BY, ORDERBYENUM.DESC);
			PaginationResponseModel response = userService.getUserList(filterDataMap, filterModel);
			if (response == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			} else {
				response.setData(userRestHelper.getModelList(response.getData()));
				return new ResponseEntity<>(response, HttpStatus.OK);
			}

		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete User")
	@DeleteMapping(value = "/delete")
	public ResponseEntity<String> deleteUser(@RequestParam(value = "id") Integer id) {
		User user = userService.findByPK(id);
		try {
			if (user == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			} else {
				user.setDeleteFlag(true);
				userService.update(user);

			}
			return new ResponseEntity<>("Deleted Successful",HttpStatus.OK);

		} catch (Exception e) {
			logger.error(LOG_ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);

		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete User In Bulks")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<String> deleteUsers(@RequestBody DeleteModel ids) {
		try {
			userService.deleteByIds(ids.getIds());
			return new ResponseEntity<>("Deleted successful",HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		logger.info(LOG_NO_DATA_FOUND);
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Save New User")
	@PostMapping(value = "/save")
	public ResponseEntity<String> save(@ModelAttribute UserModel selectedUser, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			boolean isUserNew = true;
			User creatingUser = userService.findByPK(userId);
			String password = selectedUser.getPassword();
			if (selectedUser.getId() != null) {
				User user = userService.getUserEmail(selectedUser.getEmail());
				isUserNew = user == null || !user.getUserId().equals(selectedUser.getId());
			}
			if (isUserNew) {
				Optional<User> userOptional = userService.getUserByEmail(selectedUser.getEmail());
				if (userOptional.isPresent()) {
					return new ResponseEntity<>("Email Id already Exist", HttpStatus.FORBIDDEN);
				}
			}

			if (password != null && !password.trim().isEmpty()) {
				BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
				String encodedPassword = passwordEncoder.encode(password);
				selectedUser.setPassword(encodedPassword);
			}
			User user = userRestHelper.getEntity(selectedUser);
			user.setCompany(creatingUser.getCompany());
			user.setCreatedBy(creatingUser.getUserId());
			user.setLastUpdatedBy(creatingUser.getUserId());
			if (user.getUserId() == null) {
				userService.persist(user);
				if (selectedUser.getEmployeeId()!=null) {
					Employee employee = null;
					if (selectedUser.getEmployeeId() != null) {
						employee = employeeService.findByPK(selectedUser.getEmployeeId());
						employeeUserRelationHelper.createUserForEmployee(employee, user);
					}
				}

				userService.createPassword(user,selectedUser,creatingUser);
				EmailLogs emailLogs = new EmailLogs();
				emailLogs.setEmailDate(LocalDateTime.now());
				emailLogs.setEmailTo(selectedUser.getEmail());
				emailLogs.setEmailFrom(creatingUser.getUserEmail());
				String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
						.replacePath(null)
						.build()
						.toUriString();
				System.out.println(baseUrl);
				emailLogs.setModuleName("USER");
				emailLogs.setBaseUrl(baseUrl);
				emaiLogsService.persist(emailLogs);

				return new ResponseEntity<>("User Profile saved successfully", HttpStatus.OK);
			} else {
				userService.update(user, user.getUserId());
				return new ResponseEntity<>("User Profile updated successfully", HttpStatus.OK);
			}
		} catch (Exception ex) {
			logger.error(ERROR, ex);
		}
		logger.info(LOG_NO_DATA_FOUND);
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}
	private void getTransactionCategory(User user, TransactionCategory contactCategory) {
		TransactionCategory category = new TransactionCategory();
		category.setChartOfAccount(contactCategory.getChartOfAccount());
		category.setEditableFlag(Boolean.FALSE);
		category.setSelectableFlag(Boolean.FALSE);
		category.setTransactionCategoryCode(transactionCategoryService
				.getNxtTransactionCatCodeByChartOfAccount(contactCategory.getChartOfAccount()));
		category.setTransactionCategoryName(user.getFirstName() + " " + user.getLastName());
		category.setTransactionCategoryDescription(user.getFirstName() + " " + user.getLastName());
		category.setParentTransactionCategory(contactCategory);
		category.setCreatedDate(LocalDateTime.now());
		category.setCreatedBy(user.getCreatedBy());
		category.setDefaltFlag(DefaultTypeConstant.NO);
		transactionCategoryService.persist(category);
		user.setTransactionCategory(category);
		userService.persist(user);
		coacTransactionCategoryService.addCoacTransactionCategory(user.getTransactionCategory().getChartOfAccount(),
				user.getTransactionCategory());
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update User")
	@PostMapping(value = "/update")
	public ResponseEntity<String> update(@ModelAttribute UserModel userModel, HttpServletRequest request) {
		User user = null;
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			user = userRestHelper.getEntity(userModel);
			if (userModel.getPassword() != null && !userModel.getPassword().trim().isEmpty()) {
				BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
				String encodedPassword = passwordEncoder.encode(userModel.getPassword());
				user.setPassword(encodedPassword);
			}
			user.setLastUpdateDate(LocalDateTime.now());
			user.setLastUpdatedBy(userId);
			userService.update(user);

			//added for employee user relation
			if (userModel.getEmployeeId()!=null) {
				Employee employee = null;
				employee = employeeService.findByPK(userModel.getEmployeeId());
				employeeUserRelationHelper.createUserForEmployee(employee, user);
			}//

			return new ResponseEntity<>("Updated successful",HttpStatus.OK);
		} catch (Exception e) {
			logger.info(LOG_NO_DATA_FOUND);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@ApiOperation(value = "Get UserBy Id")
	@GetMapping(value = "/getById")
	public ResponseEntity<UserModel> getById(@RequestParam(value = "id") Integer id) {
		try {
			User user = userService.findByPK(id);
			if (user == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			return new ResponseEntity<>(userRestHelper.getModel(user), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "Get Role List")
	@GetMapping(value = "/getrole")
	public ResponseEntity<List<Role>> comoleteRole() {
		List<Role> roles = roleService.getRoles();
		if (roles != null) {
			return new ResponseEntity<>(roles, HttpStatus.OK);
		} else {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}

	}

	@LogRequest
	@ApiOperation(value = "Get Current User")
	@GetMapping(value = "/current")
	public ResponseEntity<User> currentUser(HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			User user = userService.findByPK(userId);
			System.out.println("user "+user);
			return new ResponseEntity<>(user, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	private String sendNewUserMail(User user, String passwordToMail) {
		final String NEW_USER_EMAIL_TEMPLATE_FILE = "emailtemplate/new-user-created-template.html";
		try {
			MailEnum mailEnum = MailEnum.NEW_USER_CREATED;
			String recipientName = user.getFirstName();
			String url = "http://" + System.getenv("SIMPLEACCOUNTS_SUBDOMAIN") + "." + System.getenv("SIMPLEACCOUNTS_ENVIRONMENT")
					+ ".simpleaccounts.io";
			String userMail = user.getUserEmail();
			Object[] args = { recipientName, url, userMail, passwordToMail };
			ClassLoader classLoader = getClass().getClassLoader();
			File file = new File(classLoader.getResource(NEW_USER_EMAIL_TEMPLATE_FILE).getFile());
			String pathname = file.getAbsolutePath();
			MessageFormat msgFormat = new MessageFormat(fileUtility.readFile(pathname));
			MimeMultipart mimeMultipart = fileUtility.getMessageBody(msgFormat.format(args));
			String[] email = { userMail };
			MailConfigurationModel mailDefaultConfigurationModel = MailUtility
					.getEMailConfigurationList(configurationService.getConfigurationList());
			sendActivationMail(mailEnum, mimeMultipart, mailDefaultConfigurationModel.getMailusername(), email);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return null;
	}

	private void sendActivationMail(MailEnum mailEnum, MimeMultipart mimeMultipart, String userName,
									String[] senderMailAddress) {
		Thread t = new Thread(() -> {
			try {
				Mail mail = new Mail();
				mail.setFrom(userName);
				mail.setFromName(EmailConstant.ADMIN_EMAIL_SENDER_NAME);
				mail.setTo(senderMailAddress);
				mail.setSubject(mailEnum.getSubject());
				mailIntegration.sendHtmlEmail(mimeMultipart, mail,
						MailUtility.getJavaMailSender(configurationService.getConfigurationList()),false);
			} catch (Exception ex) {
				logger.error(ERROR, ex);
			}
		});
		t.start();
	}

	@LogRequest
	@GetMapping(value = "/getUserForDropdown")
	public ResponseEntity<List<DropdownModel>> getEmployeesForDropdown(HttpServletRequest request) {
		return new ResponseEntity<>(userService.getUserForDropdown(), HttpStatus.OK);
	}

	@LogRequest
	@ApiOperation(value = "Get test mail")
	@GetMapping(value = "/getTestmail")
	public ResponseEntity<String> getTestmail(@RequestParam(value = "id") Integer id) {
		try {
			User user = userService.findByPK(id);
			if (user == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			userService.testUserMail(user);

			return new ResponseEntity<>("Mail sent....", HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "Reset new password")
	@PostMapping(value = "/resetNewpassword")
	public ResponseEntity<Object> resetNewPassword(@ModelAttribute UserModel userModel, HttpServletRequest request) {

		try {
			SimpleAccountsMessage message= null;
			jwtTokenUtil.getUserIdFromHttpRequest(request);
			User user = userService.getUserPassword(userModel.getId());
			BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
			String encodedPassword = passwordEncoder.encode(userModel.getCurrentPassword());
			boolean match = passwordEncoder.matches(userModel.getCurrentPassword(), user.getPassword());
			if(match == true){
					List<PasswordHistory> passwordHistoryList = passwordHistoryRepository.findPasswordHistoriesByUser(user);
					if (passwordHistoryList!=null){
						for (PasswordHistory passwordHistory:passwordHistoryList){
							boolean passwordExist = passwordEncoder.matches(userModel.getPassword(), passwordHistory.getPassword());
							if (passwordExist==true){
								message = new SimpleAccountsMessage("",
										MessageUtil.getMessage("resetPassword.AlreadyExist.msg.0090"), true);
								return new ResponseEntity<>( message,HttpStatus.NOT_ACCEPTABLE);
							}
						}
					}
				String newEncodedPassword = passwordEncoder.encode(userModel.getPassword());
				user.setPassword(newEncodedPassword);
				user.setForgotPasswordToken(null);
				user.setForgotPasswordTokenExpiryDate(null);
			}
			userService.persist(user);
			//maintain user credential and password history
			message = userRestHelper.saveUserCredential(user, encodedPassword, message);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("resetPassword.created.UnSuccessful.msg.0089"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 *
	 * This Method will Send Create-password-mail to user
	 *
	 * @param userId
	 * @param loginUrl
	 * @param request
	 * @return
	 */
	@LogRequest
	@ApiOperation(value = "User Invite Password Email")
	@GetMapping(value = "/getUserInviteEmail")
	public ResponseEntity<Object> getUserInviteEmail(@RequestParam(value = "userId") Integer userId ,@RequestParam(value = "loginUrl")  String loginUrl , HttpServletRequest request){
		try {
			SimpleAccountsMessage message= null;
			UserModel selecteduser  = new UserModel();
			Integer senderUserId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			User senderUser = userService.findByPK(senderUserId);
			User user=userService.findByPK(userId);
			selecteduser.setEmail(user.getUserEmail());
			selecteduser.setUrl(loginUrl);
			userService.createPassword(user,selecteduser,senderUser);
			message = new SimpleAccountsMessage("","User Invite Mail Sent Successfully", true);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("","User Invite Mail Sent UnSuccessfully", true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
