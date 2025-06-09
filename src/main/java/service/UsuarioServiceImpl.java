package service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import model.Usuario;
import repositories.UsuarioRepository;

@Service
public class UsuarioServiceImpl implements UsuarioService,UserDetailsService{

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    @Override
    public Optional<Usuario> findById(Integer id) {
        return usuarioRepository.findById(id);
    }

    @Override
    public Usuario saveUsuario(Usuario usuario) {
    	if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
    	    throw new RuntimeException("El email ya está registrado");
    	}
    	usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    @Override
    public Usuario actualizarCamposPerfil(Usuario usuarioExistente, Usuario datosActualizados) {
        if (datosActualizados.getEmail() != null && !datosActualizados.getEmail().isBlank()) {
            String nuevoEmail = datosActualizados.getEmail();
            Optional<Usuario> otroUsuarioConMismoEmail = usuarioRepository.findByEmail(nuevoEmail);

            if (otroUsuarioConMismoEmail.isPresent() && 
                !otroUsuarioConMismoEmail.get().getUsuario_id().equals(usuarioExistente.getUsuario_id())) {
                throw new IllegalArgumentException("El email ya está en uso por otro usuario.");
            }

            usuarioExistente.setEmail(nuevoEmail);
        }

        if (datosActualizados.getNombre() != null && !datosActualizados.getNombre().isBlank()) {
            usuarioExistente.setNombre(datosActualizados.getNombre());
        }

        if (datosActualizados.getApellidos() != null && !datosActualizados.getApellidos().isBlank()) {
            usuarioExistente.setApellidos(datosActualizados.getApellidos());
        }

        if (datosActualizados.getdni() != null && !datosActualizados.getdni().isBlank()) {
            usuarioExistente.setdni(datosActualizados.getdni());
        }

        if (datosActualizados.getDireccion() != null && !datosActualizados.getDireccion().isBlank()) {
            usuarioExistente.setDireccion(datosActualizados.getDireccion());
        }

        return usuarioRepository.save(usuarioExistente);
    }
    @Override
    public Optional<Usuario> updateUsuarioComoAdmin(Integer id, Usuario updatedUsuario) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setNombre(updatedUsuario.getNombre());
            usuario.setApellidos(updatedUsuario.getApellidos());
            usuario.setdni(updatedUsuario.getdni());
            usuario.setEmail(updatedUsuario.getEmail());
            usuario.setDireccion(updatedUsuario.getDireccion());
            return usuarioRepository.save(usuario);
        });
    }

    @Override
    public boolean deleteById(Integer id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    @Override
    public Usuario findByEmail(String email) {
        return usuarioRepository.findByEmail(email).orElse(null);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }
    public Usuario autenticar(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario != null && passwordEncoder.matches(password,usuario.getPassword())) {
            return usuario;
        }
        return null;
    }
    @Override
    public void actualizarPassword(Usuario usuario) {
        usuarioRepository.save(usuario);
    }

    @Override
    public Usuario findByDni(String dni) {
        return usuarioRepository.findByDni(dni).orElse(null);
    }
}

