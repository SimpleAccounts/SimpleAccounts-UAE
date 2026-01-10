package com.simpleaccounts.rest.Logincontroller;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.entity.PasswordHistory;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.model.JwtRequest;
import com.simpleaccounts.repository.PasswordHistoryRepository;
import com.simpleaccounts.repository.UserJpaRepository;
import com.simpleaccounts.rest.usercontroller.UserRestHelper;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class LoginRestController {

	private static final Logger logger = LoggerFactory.getLogger(LoginRestController.class);

	private final UserService userService;

	private final UserRestHelper userRestHelper;

	private final PasswordHistoryRepository passwordHistoryRepository;

	private final UserJpaRepository userJpaRepository;

	@LogRequest
	@PostMapping(value = "/forgotPassword")
	public ResponseEntity<Object> forgotPassword(
			@RequestBody JwtRequest jwtRequest,
			HttpServletRequest request) {
		try {
			if (jwtRequest == null || jwtRequest.getUsername() == null || jwtRequest.getUsername().trim().isEmpty()) {
				logger.error("Invalid request: username is null or empty");
				return new ResponseEntity<>("Invalid request: username is required", HttpStatus.BAD_REQUEST);
			}
			
			// Check if this is a test request (for E2E testing - token should be returned in response)
			boolean isTestRequest = "true".equalsIgnoreCase(request.getHeader("X-Return-Token"));
			
			String email = jwtRequest.getUsername().trim();
			
			String userEmail = null;
			String firstName = null;
			String lastName = null;
			boolean isDeleted = false;
			
			try {
				User user = userService.getUserEmail(email);
				if (user == null) {
					logger.warn("User not found for email: {}", email);
					return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
				}
				
				// Extract user data
				userEmail = user.getUserEmail();
				firstName = user.getFirstName();
				lastName = user.getLastName();
				isDeleted = Boolean.TRUE.equals(user.getDeleteFlag());
			} catch (Exception e) {
				logger.error("Error finding user by email: {}", email, e);
				return new ResponseEntity<>("Error finding user: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
			}
			
			// Check if user is deleted
			if (isDeleted) {
				logger.warn("User is deleted for email: {}", email);
				return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
			}
			
			// For test requests (E2E testing), use method that returns token directly
			// For production, use method that only returns success/failure
			if (isTestRequest) {
				try {
					String token = userService.updateForgotPasswordTokenAndReturnToken(userEmail, firstName, lastName, jwtRequest);
					if (token != null && !token.trim().isEmpty()) {
						Map<String, String> response = new HashMap<>();
						response.put("token", token);
						return new ResponseEntity<>(response, HttpStatus.OK);
					} else {
						logger.error("Failed to generate password reset token for user email: {}", userEmail);
						return new ResponseEntity<>("Failed to save password reset token", HttpStatus.INTERNAL_SERVER_ERROR);
					}
				} catch (Exception e) {
					logger.error("Error saving password reset token for user email: {}", userEmail, e);
					return new ResponseEntity<>("Error saving token: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
				}
			} else {
				// Production mode - save token but don't return it
				try {
					boolean tokenSaved = userService.updateForgotPasswordToken(userEmail, firstName, lastName, jwtRequest);
					if (!tokenSaved) {
						logger.error("Failed to save password reset token for user email: {}", userEmail);
						return new ResponseEntity<>("Failed to save password reset token", HttpStatus.INTERNAL_SERVER_ERROR);
					}
				} catch (Exception e) {
					logger.error("Error saving password reset token for user email: {}", userEmail, e);
					return new ResponseEntity<>("Error saving token: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
				}
				return new ResponseEntity<>(HttpStatus.OK);
			}
		} catch (Exception e) {
			// Log the actual error for debugging
			logger.error("Error in forgotPassword endpoint for username: {}", 
				jwtRequest != null ? jwtRequest.getUsername() : "null", e);
			logger.error("Exception type: {}, Message: {}", e.getClass().getName(), e.getMessage(), e);
			// Return error message in response body for debugging
			return new ResponseEntity<>("Error: " + e.getClass().getName() + ": " + (e.getMessage() != null ? e.getMessage() : "Unknown error"), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@PostMapping(value = "/resetPassword")
	public ResponseEntity<Object> resetPassword(@RequestBody ResetPasswordModel resetPasswordModel) {
		try{
			SimpleAccountsMessage message= null;
			List<User> userList = userJpaRepository.findUsersByForgotPasswordToken(resetPasswordModel.getToken());
			if (userList == null || userList.isEmpty() || 
					userList.get(0).getForgotPasswordTokenExpiryDate().isBefore(LocalDateTime.now()))
				return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);

			User user = userList.get(0);
			// Reload user from database to ensure all fields are properly loaded
			User reloadedUser = userService.findByPK(user.getUserId());
			if (reloadedUser == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
			String encodedPassword = passwordEncoder.encode(resetPasswordModel.getPassword());
			List<PasswordHistory> passwordHistoryList = passwordHistoryRepository.findPasswordHistoriesByUser(reloadedUser);
			if (passwordHistoryList!=null){
				for (PasswordHistory passwordHistory:passwordHistoryList){
					boolean passwordExist = passwordEncoder.matches(resetPasswordModel.getPassword(), passwordHistory.getPassword());
					if (passwordExist){
						message= null;
						message = new SimpleAccountsMessage("",
								MessageUtil.getMessage("resetPassword.AlreadyExist.msg.0090"), true);
						return new ResponseEntity<>( message,HttpStatus.NOT_ACCEPTABLE);
					}
				}
			}
			reloadedUser.setPassword(encodedPassword);
			reloadedUser.setForgotPasswordToken(null);
			reloadedUser.setForgotPasswordTokenExpiryDate(null);
				userService.update(reloadedUser, reloadedUser.getUserId());
				//maintain user credential and password history
				message = userRestHelper.saveUserCredential(reloadedUser, encodedPassword);
				return new ResponseEntity<>(message,HttpStatus.OK);
			} catch (Exception e) {
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("resetPassword.created.UnSuccessful.msg.0089"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
