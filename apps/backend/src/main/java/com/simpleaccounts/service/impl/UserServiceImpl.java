package com.simpleaccounts.service.impl;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.mail.MessagingException;

import com.simpleaccounts.model.JwtRequest;
import com.simpleaccounts.repository.UserJpaRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.usercontroller.UserModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ResourceLoader;

import org.springframework.stereotype.Service;

import com.simpleaccounts.constant.EmailConstant;
import com.simpleaccounts.constant.dbfilter.UserFilterEnum;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.DateUtils;
import com.simpleaccounts.utils.EmailSender;
import com.simpleaccounts.utils.RandomString;

import java.time.LocalDateTime;

import com.simpleaccounts.dao.UserDao;

import static com.simpleaccounts.rest.invoicecontroller.HtmlTemplateConstants.TEST_MAIL_TEMPLATE;

@Service("userService")
public class UserServiceImpl extends UserService{
	private static final String LOG_ERROR = "Error";

	private final Logger logger = LoggerFactory.getLogger(UserService.class);

	@Autowired
	private UserJpaRepository userJpaRepo;
	
	@Value("${simpleaccounts.baseUrl}")
	private String baseUrl;

	@Autowired
	@Qualifier(value = "userDao")
	private UserDao dao;

	@Autowired
	private RandomString randomString;

	@Autowired
	private EmailSender emailSender;
	@Autowired
	ResourceLoader resourceLoader;
	@Autowired
	private DateUtils dateUtils;

	@Override
	public UserDao getDao() {
		return dao;
	}

	@Override
	public List<User> findAll() {
		return this.executeNamedQuery("findAllUsers");
	}

	@Override
	public Optional<User> getUserByEmail(String emailAddress) {
		return getDao().getUserByEmail(emailAddress);
	}

	@Override
	public User getUserEmail(String emailAddress) {
		return getDao().getUserEmail(emailAddress);
	}

	@Override
	public boolean authenticateUser(String usaerName, String password) {
		return getDao().getUserByEmail(usaerName, password);
	}
	@Override
	public User getUserPassword(Integer userId) {
		return getDao().getUserPassword(userId);
	}

	@Override
	public List<User> getAllUserNotEmployee() {
		return getDao().getAllUserNotEmployee();
	}

	@Override
	public void deleteByIds(List<Integer> ids) {
		getDao().deleteByIds(ids);
	}

	@Override
	public PaginationResponseModel getUserList(Map<UserFilterEnum, Object> filterMap, PaginationModel paginationModel) {
		return dao.getUserList(filterMap, paginationModel);
	}

	@Override
	public boolean updateForgotPasswordToken(User user, JwtRequest jwtRequest) {

		String token = randomString.getAlphaNumericString(30);
		try {
			emailSender.send(user.getUserEmail(), "Reset Password",
 					emailSender.RESET_PASSWORD.replace("LINK",jwtRequest.getUrl()+ "/reset-password?token=" + token)
							       			 .replace("{UserName}", user.getFirstName()+" "+user.getLastName()),
					EmailConstant.ADMIN_SUPPORT_EMAIL,
					EmailConstant.ADMIN_EMAIL_SENDER_NAME, true);
		} catch (MessagingException e) {
			logger.error(LOG_ERROR, e);
			return false;
		}

		user.setForgotPasswordToken(token);
		user.setForgotPasswordTokenExpiryDate(dateUtils.add(LocalDateTime.now(), 1));
		persist(user);
		return true;
	}

	@Override
	public boolean createPassword(User user,UserModel selectedUser,User sender) {

		String token = randomString.getAlphaNumericString(30);
		try {
			emailSender.send(selectedUser.getEmail(), "Create Password",
					emailSender.NEW_PASSWORD.replace("LINK",selectedUser.getUrl()+ "/new-password?token=" + token)
							.replace("{UserName}", user.getFirstName()+" "+user.getLastName())
							.replace("{SenderName}", sender!=null?
										(sender.getFirstName()+" "+sender.getLastName()+"  of  "+sender.getCompany().getCompanyName())
										:EmailConstant.ADMIN_EMAIL_SENDER_NAME+" Team"
							        ),
					EmailConstant.ADMIN_SUPPORT_EMAIL,
					EmailConstant.ADMIN_EMAIL_SENDER_NAME, true);
		} catch (MessagingException e) {
			logger.error(LOG_ERROR, e);
			return false;
		}
		user.setForgotPasswordToken(token);
		user.setForgotPasswordTokenExpiryDate(dateUtils.add(LocalDateTime.now(), 1));
		persist(user);
		return true;
	}

	@Override
	public boolean newUserMail(User user,String loginUrl,String password) {

		try {
			emailSender.send(user.getUserEmail(), "Welcome To SimpleAccounts",
					emailSender.NEW_USER.replace("{userName}", user.getFirstName()+" "+user.getLastName())
										.replace("{loginUrl}",loginUrl)
							            .replace("{userEmail}", user.getUserEmail())
										.replace("{password}", password),
					EmailConstant.ADMIN_SUPPORT_EMAIL,
					EmailConstant.ADMIN_EMAIL_SENDER_NAME, true);
		} catch (MessagingException e) {
			logger.error(LOG_ERROR, e);
			return false;
		}

		return true;
	}
	@Override
	public boolean testUserMail(User user) throws IOException {
		byte[] contentData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:"+TEST_MAIL_TEMPLATE).getURI()));
		String testContent= new String(contentData, StandardCharsets.UTF_8).replace("{name}", user.getFirstName()+" "+user.getLastName())
				.replace("{userEmail}", user.getUserEmail());
		try {
			emailSender.send(user.getUserEmail(), "SimpleAccounts Test Mail",
					testContent,
					EmailConstant.ADMIN_SUPPORT_EMAIL,
					EmailConstant.ADMIN_EMAIL_SENDER_NAME, true);
			System.out.println("################# ########################## Mail Sent =  "+testContent);
		} catch (MessagingException e) {
			logger.error(LOG_ERROR, e);
			return false;
		}

		return true;
	}
	@Override
	public List<DropdownModel> getUserForDropdown(){
	return 	getDao().getUserForDropdown();
	}
	@Override
	public  List<DropdownModel> getUserForPayrollDropdown(Integer userId)
	{
		return 	getDao().getUserForPayrollDropdown(userId);
	}
	@Override
	public Optional<User> findUserById(Integer id){
		return userJpaRepo.findById(id);
	}
}
