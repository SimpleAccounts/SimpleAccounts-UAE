package com.simpleaccounts.rest.payroll.service.Impl;

import com.simpleaccounts.entity.Payroll;
import com.simpleaccounts.repository.PayrollRepository;
import com.simpleaccounts.rest.payroll.service.PayrollService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
@Service
@RequiredArgsConstructor
public class PayrollServiceImpl implements PayrollService{

	private final PayrollRepository payrollRepo;
	
	@Override
	public List<Payroll> findAll(){
		
		return payrollRepo.findAll();
		
	}
	
}
