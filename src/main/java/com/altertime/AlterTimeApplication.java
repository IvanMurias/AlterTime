package com.altertime;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.altertime.config.TicketProperties;


@ComponentScan(basePackages = {"controller","repositories","service","dto","com.altertime.config","security"})
@EntityScan(basePackages = {"model"})
@EnableJpaRepositories(basePackages = {"repositories"})
@SpringBootApplication
@EnableConfigurationProperties(TicketProperties.class)
public class AlterTimeApplication {

	public static void main(String[] args) {
		SpringApplication.run(AlterTimeApplication.class, args);
	}

}
