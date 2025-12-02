/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.service.impl;

import com.simplevat.constant.dbfilter.PaymentFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.dao.PaymentDao;
import com.simplevat.entity.Payment;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.PaymentService;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author admin
 */
@Service("paymentService")
@Transactional
public class PaymentServiceImpl extends PaymentService {

	@Autowired
	private PaymentDao paymentDao;

	@Override
	protected Dao<Integer, Payment> getDao() {
		return this.paymentDao;
	}

	@Override
	public PaginationResponseModel getPayments(Map<PaymentFilterEnum, Object> map, PaginationModel paginationModel) {
		return this.paymentDao.getPayments(map, paginationModel);
	}

	@Override
	public void deleteByIds(List<Integer> ids) {
		paymentDao.deleteByIds(ids);
	}

}
