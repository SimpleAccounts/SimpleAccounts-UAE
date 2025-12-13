package com.simpleaccounts.rest.Logincontroller;

import com.simpleaccounts.aop.LogRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.entity.EmailLogs;
import com.simpleaccounts.entity.PasswordHistory;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.model.JwtRequest;
import com.simpleaccounts.repository.PasswordHistoryRepository;
import com.simpleaccounts.repository.UserJpaRepository;
import com.simpleaccounts.rest.usercontroller.UserRestHelper;
import com.simpleaccounts.service.EmaiLogsService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import io.swagger.annotations.ApiOperation;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class LoginRestController {

	private final UserService userService;

	private final EmaiLogsService emaiLogsService;

	private final UserRestHelper userRestHelper;

	private final PasswordHistoryRepository passwordHistoryRepository;

	private final UserJpaRepository userJpaRepository;

	@LogRequest
	@ApiOperation(value = "forgotPassword")
	@PostMapping(value = "/forgotPassword")
	public ResponseEntity<String> forgotPassword(@RequestBody JwtRequest jwtRequest) {

		Map<String, Object> attribute = new HashMap<String, Object>();
		attribute.put("userEmail", jwtRequest.getUsername());
		List<User> userList = userService.findByAttributes(attribute);
		if (userList == null || userList.isEmpty())
			return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
		for(User user :userList) {

				if (!Boolean.TRUE.equals(user.getDeleteFlag())) {
					userService.updateForgotPasswordToken(user, jwtRequest);
					EmailLogs emailLogs = new EmailLogs();
					emailLogs.setCreatedBy(user.getUserId());
                emailLogs.setCreatedDate(LocalDateTime.now());
				emailLogs.setEmailDate(LocalDateTime.now());
				emailLogs.setEmailTo(user.getUserEmail());
				emailLogs.setEmailFrom(user.getUserEmail());
				emailLogs.setModuleName("RESET PASSWORD");
				emailLogs.setBaseUrl(jwtRequest.getUrl());
				emaiLogsService.persist(emailLogs);
				return new ResponseEntity<>(HttpStatus.OK);
			}
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "resetPassword")
	@PostMapping(value = "/resetPassword")
	public ResponseEntity<Object> resetPassword(@RequestBody ResetPasswordModel resetPasswordModel) {
		try{
			SimpleAccountsMessage message= null;
			List<User> userList = userJpaRepository.findUsersByForgotPasswordToken(resetPasswordModel.getToken());
			if (userList == null || userList.isEmpty() || 
					userList.get(0).getForgotPasswordTokenExpiryDate().isBefore(LocalDateTime.now()))
				return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);

			User user = userList.get(0);
			BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
			String encodedPassword = passwordEncoder.encode(resetPasswordModel.getPassword());
			List<PasswordHistory> passwordHistoryList = passwordHistoryRepository.findPasswordHistoriesByUser(user);
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
			user.setPassword(encodedPassword);
			user.setForgotPasswordToken(null);
			user.setForgotPasswordTokenExpiryDate(null);
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
}
