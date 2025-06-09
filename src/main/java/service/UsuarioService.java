package service;

import java.util.List;
import java.util.Optional;

import model.Usuario;

public interface UsuarioService {
    List<Usuario> findAll();
    Optional<Usuario> findById(Integer id);
    boolean deleteById(Integer id);
	Usuario saveUsuario(Usuario usuario);
	Usuario findByEmail(String email);
	Optional<Usuario> updateUsuarioComoAdmin(Integer id, Usuario usuario);
	Usuario autenticar(String email, String password);
	void actualizarPassword(Usuario usuario);
	Usuario actualizarCamposPerfil(Usuario usuarioExistente, Usuario datosActualizados);
}
