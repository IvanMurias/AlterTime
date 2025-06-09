package repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
	Optional<Usuario> findByEmail(String email);
}