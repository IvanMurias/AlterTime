/*package controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dto.RegistroRequest;
import model.Usuario;
import service.UsuarioService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class RegistroController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody RegistroRequest request) {
        if (usuarioService.findByEmail(request.getEmail()) != null) {
            return ResponseEntity.badRequest().body("El email ya está registrado.");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setApellidos(request.getApellidos());
        usuario.setdni(request.getDni());
        usuario.setEmail(request.getEmail());
        usuario.setDireccion(request.getDireccion());
        usuario.setPassword(passwordEncoder.encode(request.getPassword())); 
        usuario.setRol(Usuario.Rol.CLIENTE);

        Usuario guardado = usuarioService.saveUsuario(usuario);
        return ResponseEntity.ok(guardado);
    }
}*/
