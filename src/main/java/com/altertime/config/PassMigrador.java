/*
 
package com.altertime.config;
 
 

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import model.Usuario;
import service.UsuarioService;

@Component
public class PassMigrador implements CommandLineRunner {

   @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        List<Usuario> usuarios = usuarioService.findAll();

        for (Usuario usuario : usuarios) {
            String contraseña = usuario.getPassword();

            if (!contraseña.startsWith("$2a$")) {
                String cifrada = passwordEncoder.encode(contraseña);
                usuario.setPassword(cifrada);
                usuarioService.actualizarPassword(usuario);

                System.out.println("Contraseña cifrada para usuario: " + usuario.getEmail());
            }
        }

        System.out.println("Migración de contraseñas completa.");
    }
}

*/
