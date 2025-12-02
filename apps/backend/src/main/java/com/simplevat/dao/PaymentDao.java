/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao;

import java.util.List;
import java.util.Map;

import com.simplevat.constant.dbfilter.PaymentFilterEnum;
import com.simplevat.entity.Payment;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

/**
 *
 * @author Ashish
 */
public interface PaymentDao extends Dao<Integer, Payment> {

    public PaginationResponseModel getPayments(Map<PaymentFilterEnum, Object> filterMap,PaginationModel paginationModel);

    public void deleteByIds(List<Integer> ids);

}
