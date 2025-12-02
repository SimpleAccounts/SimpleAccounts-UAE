package com.simplevat.rest.Logincontroller;

import lombok.Data;

@Data
public class ResetPasswordModel {

	private String token;
	private String password;
}
