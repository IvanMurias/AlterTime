package com.altertime.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private TicketProperties ticketProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absoluteTicketPath = new File(ticketProperties.getPath()).getAbsolutePath();

        registry.addResourceHandler("/tickets/**")
                .addResourceLocations("file:" + absoluteTicketPath + "/");

        String absoluteImagesPath = new File("images").getAbsolutePath();
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + absoluteImagesPath + "/");
    }
}
