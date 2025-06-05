package repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import model.DetallePedido;
import model.Pedido;

public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Integer> {
	List<DetallePedido> findByPedido(Pedido pedido);
}