package service;

import java.util.List;
import java.util.Optional;

import model.DetallePedido;
import model.Pedido;

public interface DetallePedidoService {
    List<DetallePedido> findAll();
    List<DetallePedido> findByPedido(Pedido pedido);
    Optional<DetallePedido> findById(Integer id);
    DetallePedido save(DetallePedido detalle);
    boolean deleteById(Integer id);
}
