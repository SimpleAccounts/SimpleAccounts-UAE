package com.simpleaccounts.rest.payroll.service.Impl;

import java.util.List;

import com.simpleaccounts.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simpleaccounts.entity.Payroll;
import com.simpleaccounts.rest.payroll.service.PayrollService;


@Service
public class PayrollServiceImpl implements PayrollService{

	@Autowired
	private PayrollRepository payrollRepo;
	
	@Override
	public List<Payroll> findAll(){
		
		return payrollRepo.findAll();
		
	}
	
}
