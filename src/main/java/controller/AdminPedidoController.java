package controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import model.Pedido;
import service.PdfService;
import service.PedidoService;
import service.UsuarioService;

@RestController
@RequestMapping("/api/admin/pedidos")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminPedidoController {

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private PdfService pdfService;

    @GetMapping
    public List<Pedido> getAllPedidos() {
        return pedidoService.findAll();
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Pedido> updateEstado(@PathVariable Integer id, @RequestBody Pedido pedidoEstado) {
        return pedidoService.updateEstado(id, pedidoEstado.getEstado())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePedido(@PathVariable Integer id) {
        boolean deleted = pedidoService.deleteById(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/estado/{estado}")
    public List<Pedido> getPedidosPorEstado(@PathVariable String estado) {
        return pedidoService.findByEstado(Pedido.Estado.valueOf(estado.toLowerCase()));
    }

    @GetMapping("/tickets/existe/{nombre}")
    public ResponseEntity<String> ticketExiste(@PathVariable String nombre) {
        boolean existe = pdfService.ticketExiste(nombre);
        return existe
                ? ResponseEntity.ok("Ticket disponible")
                : ResponseEntity.status(404).body("Ticket no encontrado");
    }
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Pedido>> getPedidosByUsuario(@PathVariable Integer usuarioId) {
        return usuarioService.findById(usuarioId)
                .map(usuario -> ResponseEntity.ok(pedidoService.findByUsuario(usuario)))
                .orElse(ResponseEntity.notFound().build());
    }
}
