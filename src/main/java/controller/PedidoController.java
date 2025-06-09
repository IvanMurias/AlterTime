package controller;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.altertime.config.TicketProperties;

import dto.PedidoResumenDTO;
import model.Pedido;
import model.Usuario;
import service.PedidoService;

@RestController
@RequestMapping("/api/cliente/pedidos")
@PreAuthorize("hasRole('CLIENTE')")
@CrossOrigin(origins = "*")
public class PedidoController {

	@Autowired
	private TicketProperties ticketProperties;
	
    @Autowired
    private PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<Pedido> crearPedido(
        @AuthenticationPrincipal Usuario usuario,
        @RequestBody Map<String, Object> body
    ) {
        @SuppressWarnings("unchecked")
        List<Integer> productosIds = (List<Integer>) body.get("productosIds");
        String direccionEntrega = (String) body.get("direccionEntrega");
        String direccionFacturacion = (String) body.get("direccionFacturacion");

        Pedido nuevoPedido = pedidoService.crearPedido(
            usuario.getUsuario_id(),
            productosIds,
            direccionEntrega,
            direccionFacturacion
        );
        return ResponseEntity.ok(nuevoPedido);
    }

    @GetMapping("/misPedidos")
    public ResponseEntity<List<Pedido>> getMisPedidos(@AuthenticationPrincipal Usuario usuario) {
        List<Pedido> pedidos = pedidoService.findByUsuario(usuario);
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> getPedidoById(@PathVariable Integer id, @AuthenticationPrincipal Usuario usuario) {
        return pedidoService.findById(id)
                .filter(pedido -> pedido.getUsuario().getUsuario_id().equals(usuario.getUsuario_id()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(403).build());
    }

    @GetMapping("/{id}/resumen")
    public ResponseEntity<PedidoResumenDTO> getResumenPedido(@PathVariable Integer id) {
        try {
            PedidoResumenDTO resumen = pedidoService.generarResumen(id);
            return ResponseEntity.ok(resumen);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/{id}/ticket")
    public ResponseEntity<Resource> descargarTicket(@PathVariable Integer id, @AuthenticationPrincipal Usuario usuario) {
        Optional<Pedido> pedidoOpt = pedidoService.findById(id);

        if (pedidoOpt.isEmpty() || !pedidoOpt.get().getUsuario().getUsuario_id().equals(usuario.getUsuario_id())) {
            System.out.println("Pedido usuario_id: " + pedidoOpt.get().getUsuario().getUsuario_id());
            System.out.println("Usuario autenticado id: " + usuario.getUsuario_id());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        String ruta = ticketProperties.getPath();;
        Pedido pedido = pedidoOpt.get();
        String path = ruta+pedido.getDir_ticket();

        
        try {
	    	
            Path filePath = Paths.get(path).toAbsolutePath();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarPedido(@PathVariable Integer id, @AuthenticationPrincipal Usuario usuario) {
        Optional<Pedido> pedidoOpt = pedidoService.findById(id);

        if (pedidoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Pedido pedido = pedidoOpt.get();

        if (!pedido.getUsuario().getUsuario_id().equals(usuario.getUsuario_id())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (pedido.getEstado() != Pedido.Estado.pendiente) {
            return ResponseEntity.badRequest().body("Solo se pueden cancelar pedidos pendientes.");
        }

        pedidoService.updateEstado(id, Pedido.Estado.cancelado);
        return ResponseEntity.ok("Pedido cancelado correctamente.");
    }

}