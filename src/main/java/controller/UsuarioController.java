package controller;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import model.Usuario;
import service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public Usuario getPerfil(@AuthenticationPrincipal Usuario usuario) {
        return usuario;
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<?> actualizarPerfil(
            @AuthenticationPrincipal Usuario usuarioAutenticado,
            @RequestBody Usuario datosActualizados
    ) {
        Optional<Usuario> opt = usuarioService.findById(usuarioAutenticado.getUsuario_id());
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        try {
            Usuario actualizado = usuarioService.actualizarCamposPerfil(opt.get(), datosActualizados);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/me/password")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<String> cambiarPassword(
        @AuthenticationPrincipal Usuario usuario,
        @RequestBody Map<String, String> contrasenas
    ) {
        String actual = contrasenas.get("actual");
        String nueva = contrasenas.get("nueva");

        if (!passwordEncoder.matches(actual, usuario.getPassword())) {
            return ResponseEntity.badRequest().body("La contraseña actual no es correcta.");
        }

        usuario.setPassword(passwordEncoder.encode(nueva));
        usuarioService.actualizarPassword(usuario);
        return ResponseEntity.ok("Contraseña actualizada correctamente.");
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> eliminarMiCuenta(@AuthenticationPrincipal Usuario usuario) {
        boolean eliminado = usuarioService.deleteById(usuario.getUsuario_id());
        return eliminado ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
    
}