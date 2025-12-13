/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.service;

import com.simpleaccounts.constant.dbfilter.PaymentFilterEnum;
import com.simpleaccounts.entity.Payment;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Ashish
 */
public abstract class PaymentService extends SimpleAccountsService<Integer, Payment> {
    
    public abstract PaginationResponseModel getPayments(Map<PaymentFilterEnum, Object> map,PaginationModel paginationModel);
    
    public abstract void deleteByIds(List<Integer> ids);
    
}
