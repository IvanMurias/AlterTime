package repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
	Usuario findByEmail(String email); 
}