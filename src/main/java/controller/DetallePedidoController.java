package controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import model.DetallePedido;
import service.DetallePedidoService;
import service.PedidoService;

@RestController
@RequestMapping("/api/detalles")
@CrossOrigin(origins = "*")
public class DetallePedidoController {

    @Autowired
    private DetallePedidoService detallePedidoService;

    @Autowired
    private PedidoService pedidoService;

    @GetMapping
    public List<DetallePedido> getAllDetalles() {
        return detallePedidoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetallePedido> getDetalleById(@PathVariable Integer id) {
        return detallePedidoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<List<DetallePedido>> getDetallesByPedido(@PathVariable Integer pedidoId) {
        return pedidoService.findById(pedidoId)
                .map(pedido -> ResponseEntity.ok(detallePedidoService.findByPedido(pedido)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public DetallePedido createDetalle(@RequestBody DetallePedido detalle) {
        return detallePedidoService.save(detalle);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetalle(@PathVariable Integer id) {
        boolean deleted = detallePedidoService.deleteById(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
