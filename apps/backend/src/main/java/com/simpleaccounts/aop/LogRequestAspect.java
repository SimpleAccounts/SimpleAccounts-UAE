package com.simpleaccounts.aop;

import java.util.Arrays;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class LogRequestAspect {

	@Before("@annotation(LogRequest)")
	public void logRequest(JoinPoint joinPoint){
		String className = joinPoint.getSignature().getDeclaringType().getSimpleName();
		String methodName = joinPoint.getSignature().getName();
		log.info("LogRequestAspect: {}.{} called with args: {}", 
			className, methodName, Arrays.toString(joinPoint.getArgs()));
	}
}
