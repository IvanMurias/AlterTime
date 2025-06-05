package service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import model.Usuario;
import repositories.UsuarioRepository;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

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
        return usuarioRepository.save(usuario);
    }

    @Override
    public Optional<Usuario> updateUsuario(Integer id, Usuario updatedusuario) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setNombre(updatedusuario.getNombre());
            usuario.setApellidos(updatedusuario.getApellidos());
            usuario.setDNI(updatedusuario.getDNI());
            usuario.setEmail(updatedusuario.getEmail());
            usuario.setDireccion(updatedusuario.getDireccion());
            usuario.setContraseña(updatedusuario.getContraseña());
            usuario.setRol(updatedusuario.getRol());
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
    public Optional<Usuario> findByEmail(String email) {
        return Optional.ofNullable(usuarioRepository.findByEmail(email));
    }
}
