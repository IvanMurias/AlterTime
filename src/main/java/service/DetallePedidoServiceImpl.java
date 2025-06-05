package service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import model.DetallePedido;
import model.Pedido;
import model.Producto;
import repositories.DetallePedidoRepository;
import repositories.ProductoRepository;

@Service
public class DetallePedidoServiceImpl implements DetallePedidoService {

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;
    
    @Autowired
    private ProductoRepository productoRepository;

    @Override
    public List<DetallePedido> findAll() {
        return detallePedidoRepository.findAll();
    }

    @Override
    public List<DetallePedido> findByPedido(Pedido pedido) {
        return detallePedidoRepository.findByPedido(pedido);
    }

    @Override
    public Optional<DetallePedido> findById(Integer id) {
        return detallePedidoRepository.findById(id);
    }

    @Override
    public DetallePedido save(DetallePedido detalle) {
    	Producto producto = detalle.getProducto();
    	
    	if (!producto.isDisponibilidad()) {
            throw new IllegalArgumentException("El producto ya ha sido vendido: " + producto.getNombre());
        }
        producto.setDisponibilidad(false);
        productoRepository.save(producto);

        return detallePedidoRepository.save(detalle);
    }

    @Override
    public boolean deleteById(Integer id) {
        if (detallePedidoRepository.existsById(id)) {
            detallePedidoRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
