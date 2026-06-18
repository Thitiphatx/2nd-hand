package com.thitiphatx.secondhand;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableMongoAuditing
@EnableScheduling
public class SecondhandApplication {

	public static void main(String[] args) {

		org.springframework.context.ConfigurableApplicationContext context = SpringApplication.run(SecondhandApplication.class, args);
		System.out.println("SPRING_DATA_MONGODB_URI: " + context.getEnvironment().getProperty("SPRING_DATA_MONGODB_URI"));
		System.out.println("spring.data.mongodb.uri: " + context.getEnvironment().getProperty("spring.data.mongodb.uri"));
	}

}
