/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.dao;

import java.util.List;
import java.util.Map;

import com.simpleaccounts.constant.dbfilter.PaymentFilterEnum;
import com.simpleaccounts.entity.Payment;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

/**
 *
 * @author Ashish
 */
public interface PaymentDao extends Dao<Integer, Payment> {

    public PaginationResponseModel getPayments(Map<PaymentFilterEnum, Object> filterMap,PaginationModel paginationModel);

    public void deleteByIds(List<Integer> ids);

}
