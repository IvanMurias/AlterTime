package repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import model.Pedido;
import model.Usuario;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
	List<Pedido> findByUsuario(Usuario usuario);
}
