package com.simpleaccounts.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LogExecutionTimeAspect {
	
	@Around("@annotation(LogExecutionTime)")
	public Object logDuration(ProceedingJoinPoint joinPoint) throws Throwable{
		long startTime = System.currentTimeMillis();
		Object result = joinPoint.proceed();
		long endTime = System.currentTimeMillis();
		long duration = endTime - startTime;
		log.info("{}.{} execution time : {} ms", joinPoint.getTarget().getClass().getName(), joinPoint.getSignature().getName(), duration);
		return result;
	}

}
