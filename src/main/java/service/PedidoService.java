package service;

import java.util.List;
import java.util.Optional;

import dto.PedidoResumenDTO;
import model.Pedido;
import model.Usuario;

public interface PedidoService {
    List<Pedido> findAll();
    Optional<Pedido> findById(Integer id);
    List<Pedido> findByUsuario(Usuario usuario);
    Optional<Pedido> updateEstado(Integer id, Pedido.Estado nuevoEstado);
    boolean deleteById(Integer id);
    Pedido crearPedido(Integer usuarioId, List<Integer> productosIds,String direccionEntrega,String direccionFacturacion);
	PedidoResumenDTO generarResumen(Integer id);
	List<Pedido> findByEstado(Pedido.Estado estado);
	List<Pedido> findByUsuarioAndEstado(Usuario usuario, Pedido.Estado estado);
}
