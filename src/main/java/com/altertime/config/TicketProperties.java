package com.altertime.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "pdf.ticket")
public class TicketProperties {
    private String path;

    public String getPath() {
        return path.endsWith("/") ? path : path + "/";
    }

    public void setPath(String path) {
        this.path = path;
    }
}
