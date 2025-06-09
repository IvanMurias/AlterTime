package com.altertime.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import security.JwtFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

	@Autowired
	private JwtFilter jwtfilter;

	@Bean
	SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.disable())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/api/login", "/api/usuarios/registro",
								"/productos.html", "/index.html", "/admin.html",
								"/login.html", "/registro.html", "/images/**", "/css/**", "/js/**", "/", "/navbar.html",
								"/footer.html", "/favicon.ico", "/api/productos/**","/detalle.html", 
								"/detalle.html*","/carrito.html","/favicon.ico","/pago-exitoso.html",
								"/pago-cancelado.html","/misPedidos.html","/pedidoDetalle.html", "/perfil.html")
						.permitAll().requestMatchers("/api/admin/**").hasRole("ADMIN")
						.requestMatchers("/api/cliente/**","/api/usuarios/me","/api/pago/**").hasRole("CLIENTE").anyRequest().authenticated());

		http.addFilterBefore(jwtfilter, UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}

	@Bean
	AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}