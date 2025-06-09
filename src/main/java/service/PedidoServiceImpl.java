package service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.altertime.config.TicketProperties;

import dto.PedidoResumenDTO;
import model.DetallePedido;
import model.Pedido;
import model.Producto;
import model.Usuario;
import repositories.PedidoRepository;
import repositories.ProductoRepository;
import repositories.UsuarioRepository;


@Service
public class PedidoServiceImpl implements PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private ProductoRepository productoRepository; 
    
    @Autowired
    private PdfService pdfservice;
   
    @Override
    public List<Pedido> findAll() {
        return pedidoRepository.findAll();
    }

    @Override
    public Optional<Pedido> findById(Integer id) {
        return pedidoRepository.findById(id);
    }

    @Override
    public List<Pedido> findByUsuario(Usuario usuario) {
        return pedidoRepository.findByUsuario(usuario);
    }

    @Override
    @Transactional
    public Pedido crearPedido(Integer usuarioId, List<Integer> productosIds, String direccionEntrega,String direccionFacturacion) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setFechaPedido(LocalDate.now());
        pedido.setDireccionEntrega(direccionEntrega);       
        pedido.setDireccionFacturacion(direccionFacturacion);
        pedido.setEstado(Pedido.Estado.pendiente);

        List<DetallePedido> detalles = new ArrayList<>();
        double total = 0.0;

        for (Integer productoId : productosIds) {
            Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto con ID " + productoId + " no encontrado"));

            if (!producto.isDisponibilidad()) {
                throw new RuntimeException("El producto con ID " + productoId + " ya fue vendido");
            }

            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setPrecio(producto.getPrecio());

            detalles.add(detalle);
            total += producto.getPrecio();

            producto.setDisponibilidad(false);
            productoRepository.save(producto);
            
        }

        pedido.setTotal(total);
        pedido.setDetalles(detalles);
        pedido = pedidoRepository.save(pedido);

        String rutaTicket =pedido.getUsuario().getUsuario_id() + "_" + pedido.getPedido_id() + ".pdf";
        pedido.setDir_ticket(rutaTicket);
        pedidoRepository.save(pedido);

        pdfservice.generarTicketPDF(pedido);
        return pedido;
    }

    @Override
    public Optional<Pedido> updateEstado(Integer id, Pedido.Estado nuevoEstado) {
        return pedidoRepository.findById(id).map(pedido -> {
            pedido.setEstado(nuevoEstado);
            
            if (nuevoEstado == Pedido.Estado.cancelado) {
                for (DetallePedido detalle : pedido.getDetalles()) {
                    Producto producto = detalle.getProducto();
                    producto.setDisponibilidad(true);
                    productoRepository.save(producto);
                }
            }

            return pedidoRepository.save(pedido);
        });
    }

    @Override
    public boolean deleteById(Integer id) {
        if (pedidoRepository.existsById(id)) {
            pedidoRepository.deleteById(id);
            return true;
        }
        return false;
    }
    @Override
    public PedidoResumenDTO generarResumen(Integer pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        PedidoResumenDTO resumen = new PedidoResumenDTO();
        resumen.setPedido_id(pedido.getPedido_id());
        resumen.setFecha(pedido.getFechaPedido());
        resumen.setUsuario(pedido.getUsuario().getNombre());
        resumen.setDireccion(pedido.getDir_ticket());
        resumen.setEstado(pedido.getEstado().name());
        resumen.setTotal(pedido.getTotal());

        List<PedidoResumenDTO.ProductoResumen> productos = pedido.getDetalles().stream()
            .map(detalle -> new PedidoResumenDTO.ProductoResumen(
                    detalle.getProducto().getNombre(),
                    detalle.getPrecio(),
            		detalle.getProducto().getAño()))
            		.toList();

        resumen.setProductos(productos);
        return resumen;
    }

    @Override
    public List<Pedido> findByEstado(Pedido.Estado estado) {
        return pedidoRepository.findByEstado(estado);
    }

    @Override
    public List<Pedido> findByUsuarioAndEstado(Usuario usuario, Pedido.Estado estado) {
        return pedidoRepository.findByUsuarioAndEstado(usuario, estado);
    }
    

}
