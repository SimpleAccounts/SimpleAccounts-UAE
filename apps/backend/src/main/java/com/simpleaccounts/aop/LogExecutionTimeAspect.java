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
		String className = joinPoint.getTarget().getClass().getName();
		String methodName = joinPoint.getSignature().getName();
		
		long startTime = System.currentTimeMillis();
		
		try {
		Object result = joinPoint.proceed();
		long endTime = System.currentTimeMillis();
		long duration = endTime - startTime;
			log.info("{}.{} execution time: {} ms", className, methodName, duration);
		return result;
		} catch (Throwable e) {
			long endTime = System.currentTimeMillis();
			long duration = endTime - startTime;
			log.error("Exception in {}.{} after {} ms: {}", className, methodName, duration, e.getMessage(), e);
			throw e;
		}
	}

}
