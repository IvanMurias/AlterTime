package controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dto.LoginRequest;
import dto.RegistroRequest;
import model.Usuario;
import model.Usuario.Rol;
import service.JwtUtil;
import service.UsuarioService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Usuario usuario = usuarioService.autenticar(request.getEmail(), request.getPassword());

        if (usuario == null) {
            return ResponseEntity.status(401).body("Credenciales inválidas");
        }

        String token = jwtUtil.generarToken(usuario.getUsuario_id(),usuario.getEmail(), usuario.getRol().name());

        return ResponseEntity.ok(java.util.Map.of(
        		"token", token,
        		"email",usuario.getEmail(),
        		"rol",usuario.getRol().name()
        		));
    }

    @PostMapping("/usuarios/registro")
    public ResponseEntity<?> registrar(@RequestBody RegistroRequest request) {
    	Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setApellidos(request.getApellidos());
        usuario.setdni(request.getDni());
        usuario.setEmail(request.getEmail());
        usuario.setDireccion(request.getDireccion());
        usuario.setPassword(request.getPassword());
        usuario.setRol(Rol.CLIENTE); 
        try {
            Usuario saved = usuarioService.saveUsuario(usuario);
            String token = jwtUtil.generarToken(saved.getUsuario_id(),saved.getEmail(), saved.getRol().name());
            return ResponseEntity.ok(java.util.Map.of("token", token));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}