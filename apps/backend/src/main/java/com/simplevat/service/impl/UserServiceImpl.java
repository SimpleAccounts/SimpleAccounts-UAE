package com.simplevat.service.impl;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.mail.MessagingException;

import com.simplevat.model.JwtRequest;
import com.simplevat.repository.UserJpaRepository;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.usercontroller.UserModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ResourceLoader;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.simplevat.constant.EmailConstant;
import com.simplevat.constant.dbfilter.UserFilterEnum;
import com.simplevat.entity.User;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.UserService;
import com.simplevat.utils.DateUtils;
import com.simplevat.utils.EmailSender;
import com.simplevat.utils.RandomString;

import java.time.LocalDateTime;

import com.simplevat.dao.UserDao;

import static com.simplevat.rest.invoicecontroller.HtmlTemplateConstants.TEST_MAIL_TEMPLATE;
import static com.simplevat.rest.invoicecontroller.HtmlTemplateConstants.THANK_YOU_TEMPLATE;

@Service("userService")
public class UserServiceImpl extends UserService{

	private final Logger logger = LoggerFactory.getLogger(UserService.class);

	@Autowired
	private UserJpaRepository userJpaRepo;
	
	@Value("${simplevat.baseUrl}")
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
 					emailSender.resetPassword.replace("LINK",jwtRequest.getUrl()+ "/reset-password?token=" + token)
							       			 .replace("{UserName}", user.getFirstName()+" "+user.getLastName()),
					EmailConstant.ADMIN_SUPPORT_EMAIL,
					EmailConstant.ADMIN_EMAIL_SENDER_NAME, true);
		} catch (MessagingException e) {
			logger.error("Error", e);
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
					emailSender.newPassword.replace("LINK",selectedUser.getUrl()+ "/new-password?token=" + token)
							.replace("{UserName}", user.getFirstName()+" "+user.getLastName())
							.replace("{SenderName}", sender!=null?
										(sender.getFirstName()+" "+sender.getLastName()+"  of  "+sender.getCompany().getCompanyName())
										:EmailConstant.ADMIN_EMAIL_SENDER_NAME+" Team"
							        ),
					EmailConstant.ADMIN_SUPPORT_EMAIL,
					EmailConstant.ADMIN_EMAIL_SENDER_NAME, true);
		} catch (MessagingException e) {
			logger.error("Error", e);
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
					emailSender.newuser.replace("{userName}", user.getFirstName()+" "+user.getLastName())
										.replace("{loginUrl}",loginUrl)
							            .replace("{userEmail}", user.getUserEmail())
										.replace("{password}", password),
					EmailConstant.ADMIN_SUPPORT_EMAIL,
					EmailConstant.ADMIN_EMAIL_SENDER_NAME, true);
		} catch (MessagingException e) {
			logger.error("Error", e);
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
			logger.error("Error", e);
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
