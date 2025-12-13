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
		log.info("{}::{}: {}",joinPoint.getSignature().getDeclaringType().getSimpleName(),
				joinPoint.getSignature().getName(), Arrays.toString(joinPoint.getArgs()));
	}
}
