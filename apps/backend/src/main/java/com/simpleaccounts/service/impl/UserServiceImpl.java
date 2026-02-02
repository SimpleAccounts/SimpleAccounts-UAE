package com.simpleaccounts.service.impl;

import static com.simpleaccounts.rest.invoicecontroller.HtmlTemplateConstants.TEST_MAIL_TEMPLATE;

import com.simpleaccounts.constant.EmailConstant;
import com.simpleaccounts.constant.dbfilter.UserFilterEnum;
import com.simpleaccounts.dao.UserDao;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.model.JwtRequest;
import com.simpleaccounts.repository.UserJpaRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.usercontroller.UserModel;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.DateUtils;
import com.simpleaccounts.utils.EmailSender;
import com.simpleaccounts.utils.RandomString;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

@Service("userService")
public class UserServiceImpl extends UserService{
	private static final String LOG_ERROR = "Error";

	private final Logger logger = LoggerFactory.getLogger(UserService.class);

	private final UserJpaRepository userJpaRepo;
	
	@Value("${simpleaccounts.baseUrl}")
	private String baseUrl;

	private final UserDao dao;

	private final RandomString randomString;

	private final EmailSender emailSender;
	private final ResourceLoader resourceLoader;
	private final DateUtils dateUtils;
	
	// Self-injection to ensure REQUIRES_NEW works through proxy (lazy to avoid circular dependency)
	@org.springframework.beans.factory.annotation.Autowired
	@org.springframework.beans.factory.annotation.Qualifier("userService")
	@org.springframework.context.annotation.Lazy
	private UserServiceImpl self;

	public UserServiceImpl(
			UserJpaRepository userJpaRepo,
			@Qualifier("userDao") UserDao dao,
			RandomString randomString,
			EmailSender emailSender,
			ResourceLoader resourceLoader,
			DateUtils dateUtils) {
		this.userJpaRepo = userJpaRepo;
		this.dao = dao;
		this.randomString = randomString;
		this.emailSender = emailSender;
		this.resourceLoader = resourceLoader;
		this.dateUtils = dateUtils;
	}

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
	@org.springframework.transaction.annotation.Transactional
	public void deleteByIds(List<Integer> ids) {
		getDao().deleteByIds(ids);
	}

	@Override
	public PaginationResponseModel getUserList(Map<UserFilterEnum, Object> filterMap, PaginationModel paginationModel) {
		return dao.getUserList(filterMap, paginationModel);
	}

	@Override
	public boolean updateForgotPasswordToken(String userEmail, String firstName, String lastName, JwtRequest jwtRequest) {
		if (userEmail == null || userEmail.trim().isEmpty()) {
			logger.error("User email is null or empty");
			return false;
		}

		// Clear EntityManager to ensure no stale entities interfere
		try {
			getDao().getEntityManager().clear();
		} catch (Exception e) {
			logger.warn("Could not clear EntityManager: {}", e.getMessage());
		}

		String token = randomString.getAlphaNumericString(30);
		
		// Save token first (important: token must be saved even if email fails)
		// Use the DAO method which has REQUIRES_NEW propagation to ensure it commits independently
		LocalDateTime expiryDate = dateUtils.add(LocalDateTime.now(), 1);
		try {
			java.sql.Timestamp expiryTimestamp = java.sql.Timestamp.valueOf(expiryDate);
			java.sql.Timestamp updateTimestamp = java.sql.Timestamp.valueOf(LocalDateTime.now());
			
			boolean updated = getDao().updateForgotPasswordTokenByEmail(userEmail, token, expiryTimestamp, updateTimestamp);
			
			if (!updated) {
				logger.error("Token update failed for email: {}", userEmail);
				return false;
			}
			
			logger.info("Token saved successfully for email: {}", userEmail);
			
			// Clear EntityManager after DAO method completes to prevent any managed entities from overwriting the token
			try {
				getDao().getEntityManager().clear();
			} catch (Exception e) {
				logger.warn("Could not clear entity manager after token save: {}", e.getMessage());
			}
		} catch (Exception e) {
			logger.error("Failed to save password reset token for email: {} - Exception: {}", userEmail, e.getMessage(), e);
			return false;
		}
		
		// Try to send email (will gracefully fail if SMTP not configured)
		// Token is already saved, so this is best-effort
		try {
			String baseUrl = jwtRequest != null && jwtRequest.getUrl() != null ? jwtRequest.getUrl() : "http://localhost:3000";
			String resetLink = baseUrl + "/reset-password?token=" + token;
			
			// Use the firstName/lastName parameters passed in (no User entity query needed to avoid Hibernate issues)
			String firstNameStr = firstName != null ? firstName : "";
			String lastNameStr = lastName != null ? lastName : "";
			String userName = (firstNameStr + " " + lastNameStr).trim();
			if (userName.isEmpty()) {
				userName = userEmail;
			}
			
			emailSender.send(userEmail, "Reset Password",
					EmailSender.RESET_PASSWORD.replace("LINK", resetLink)
							.replace("{UserName}", userName),
					EmailConstant.ADMIN_SUPPORT_EMAIL,
					EmailConstant.ADMIN_EMAIL_SENDER_NAME, true);
			
			logger.info("Password reset email sent successfully for email: {}", userEmail);
		} catch (MessagingException e) {
			logger.warn("Email not sent (SMTP may not be configured): {}. Token was saved and can be used directly.", e.getMessage());
		} catch (Exception e) {
			logger.warn("Failed to send password reset email for user: {}. Token was saved.", userEmail, e);
		}
		
		return true;
	}
	
	@Override
	public String updateForgotPasswordTokenAndReturnToken(String userEmail, String firstName, String lastName, JwtRequest jwtRequest) {
		if (userEmail == null || userEmail.trim().isEmpty()) {
			logger.error("User email is null or empty");
			return null;
		}

		// Clear EntityManager to ensure no stale entities interfere
		try {
			getDao().getEntityManager().clear();
		} catch (Exception e) {
			logger.warn("Could not clear EntityManager: {}", e.getMessage());
		}

		String token = randomString.getAlphaNumericString(30);
		
		// Save token first (important: token must be saved even if email fails)
		// Use the DAO method which has REQUIRES_NEW propagation to ensure it commits independently
		LocalDateTime expiryDate = dateUtils.add(LocalDateTime.now(), 1);
		try {
			java.sql.Timestamp expiryTimestamp = java.sql.Timestamp.valueOf(expiryDate);
			java.sql.Timestamp updateTimestamp = java.sql.Timestamp.valueOf(LocalDateTime.now());
			
			boolean updated = getDao().updateForgotPasswordTokenByEmail(userEmail, token, expiryTimestamp, updateTimestamp);
			
			if (!updated) {
				logger.error("Token update failed for email: {}", userEmail);
				return null;
			}
			
			logger.info("Token saved successfully for email: {}", userEmail);
			
			// Clear EntityManager after DAO method completes to prevent any managed entities from overwriting the token
			try {
				getDao().getEntityManager().clear();
			} catch (Exception e) {
				logger.warn("Could not clear entity manager after token save: {}", e.getMessage());
			}
		} catch (Exception e) {
			logger.error("Failed to save password reset token for email: {} - Exception: {}", userEmail, e.getMessage(), e);
			return null;
		}
		
		// Try to send email (will gracefully fail if SMTP not configured)
		// Token is already saved, so this is best-effort
		try {
			String baseUrl = jwtRequest != null && jwtRequest.getUrl() != null ? jwtRequest.getUrl() : "http://localhost:3000";
			String resetLink = baseUrl + "/reset-password?token=" + token;
			
			// Use the firstName/lastName parameters passed in (no User entity query needed to avoid Hibernate issues)
			String firstNameStr = firstName != null ? firstName : "";
			String lastNameStr = lastName != null ? lastName : "";
			String userName = (firstNameStr + " " + lastNameStr).trim();
			if (userName.isEmpty()) {
				userName = userEmail;
			}
			
			emailSender.send(userEmail, "Reset Password",
					EmailSender.RESET_PASSWORD.replace("LINK", resetLink)
							.replace("{UserName}", userName),
					EmailConstant.ADMIN_SUPPORT_EMAIL,
					EmailConstant.ADMIN_EMAIL_SENDER_NAME, true);
			
			logger.info("Password reset email sent successfully for email: {}", userEmail);
		} catch (MessagingException e) {
			logger.warn("Email not sent (SMTP may not be configured): {}. Token was saved and can be used directly.", e.getMessage());
		} catch (Exception e) {
			logger.warn("Failed to send password reset email for user: {}. Token was saved.", userEmail, e);
		}
		
		return token;
	}
	

	@Override
	public String createPassword(User user,UserModel selectedUser,User sender) {

		String token = randomString.getAlphaNumericString(30);

		// Always save the token first so user can set password via link
		user.setForgotPasswordToken(token);
		user.setForgotPasswordTokenExpiryDate(dateUtils.add(LocalDateTime.now(), 1));
		persist(user);

		// Try to send email (will gracefully fail if SMTP not configured)
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
			logger.warn("Email not sent (SMTP may not be configured): {}", e.getMessage());
			// Don't fail - token is saved, user can use the link directly
		}

		return token;
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
			logger.info("Test email sent successfully to: {}", user.getUserEmail());
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
	
	@Override
	public String verifyTokenFromDatabase(String userEmail) {
		return getDao().verifyTokenFromDatabase(userEmail);
	}
}
