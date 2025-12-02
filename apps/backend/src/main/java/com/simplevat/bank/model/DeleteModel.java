/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.bank.model;

import java.io.Serializable;
import java.util.ArrayList;
import lombok.Data;

/**
 *
 * @author sonu
 */
@Data
public class DeleteModel implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	private ArrayList<Integer> ids;
}
