package controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import model.Producto;
import service.ProductoService;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @GetMapping
    public List<Producto> getAllProductos() {
        return productoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> getProductoById(@PathVariable Integer id) {
        Optional<Producto> producto = productoService.findById(id);
        return producto.map(ResponseEntity::ok)
                       .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping("/disponibles")
    public List<Producto> getDisponibles() {
        return productoService.findDisponibles();
    }
    
    @GetMapping("/{id}/imagen")
    public ResponseEntity<?> obtenerImagenProducto(@PathVariable Integer id) {
        return productoService.findById(id)
            .map(p -> ResponseEntity.ok(Map.of("url", p.getRutaImagen() != null ? p.getRutaImagen() : "/images/default.jpg")))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
