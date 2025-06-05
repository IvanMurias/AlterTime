package com.altertime;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@ComponentScan(basePackages = {"controller","repositories","service"})
@EntityScan(basePackages = {"model"})
@EnableJpaRepositories(basePackages = {"repositories"})
@SpringBootApplication
public class AlterTimeApplication {

	public static void main(String[] args) {
		SpringApplication.run(AlterTimeApplication.class, args);
	}

}
