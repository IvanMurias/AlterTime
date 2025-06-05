package service;

import java.util.List;
import java.util.Optional;

import model.Pedido;
import model.Usuario;

public interface PedidoService {
    List<Pedido> findAll();
    Optional<Pedido> findById(Integer id);
    List<Pedido> findByUsuario(Usuario usuario);
    Pedido save(Pedido pedido);
    Optional<Pedido> updateEstado(Integer id, Pedido.Estado nuevoEstado);
    boolean deleteById(Integer id);
}
