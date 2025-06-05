package service;

import java.util.List;
import java.util.Optional;

import model.Usuario;

public interface UsuarioService {
    List<Usuario> findAll();
    Optional<Usuario> findById(Integer id);
    Optional<Usuario> updateUsuario(Integer id, Usuario usuario);
    boolean deleteById(Integer id);
    Optional<Usuario> findByEmail(String email);
	Usuario saveUsuario(Usuario usuario);
}
