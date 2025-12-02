package com.simplevat;

import javax.annotation.PostConstruct;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.cache.annotation.EnableCaching;

import com.simplevat.service.migrationservices.FileStorageProperties;

@SpringBootApplication
@EnableCaching

@EnableConfigurationProperties({
    FileStorageProperties.class
})
public class Application extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(Application.class);
    }
    @PostConstruct
    public void init(){
        // Setting Spring Boot SetTimeZone
//      TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }
}
