/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.model;

import java.io.Serializable;

import lombok.Getter;
import lombok.Setter;

/**
 *
 * @author admin
 */
@Getter
@Setter
public class ContactType implements Serializable {

	private static final long serialVersionUID = 1L;

	private Integer id;
	private String name;

	public ContactType(Integer id, String name) {
		this.id = id;
		this.name = name;
	}

	public ContactType() {

	}

}
