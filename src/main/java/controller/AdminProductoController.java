package controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import model.Producto;
import service.ProductoService;

@RestController
@RequestMapping("/api/admin/productos")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminProductoController {

    @Autowired
    private ProductoService productoService;
    
    
    @GetMapping("/{id}")
    public ResponseEntity<Producto> getProductoById(@PathVariable Integer id) {
        Optional<Producto> producto = productoService.findById(id);
        return producto.map(ResponseEntity::ok)
                       .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/imagen")
    public ResponseEntity<?> obtenerRutaImagen(@PathVariable Integer id) {
        return productoService.findById(id)
        		.map(p -> ResponseEntity.ok(Map.of("url", p.getRutaImagen() != null ? p.getRutaImagen() : "/images/default.jpg")))
        		.orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{id}/imagen")
    public ResponseEntity<?> subirImagenProducto(
            @PathVariable Integer id,
            @RequestParam("imagen") MultipartFile archivo) {

        Producto producto = productoService.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));

        if (archivo == null || archivo.isEmpty()) {
            return ResponseEntity.badRequest().body("No se recibió ningún archivo o está vacío");
        }

        String nombreOriginal = archivo.getOriginalFilename();
        if (nombreOriginal == null || !nombreOriginal.matches("(?i).*\\.(jpg|jpeg|png)$")) {
            return ResponseEntity.badRequest().body("Solo se permiten archivos JPG, JPEG o PNG");
        }
        System.out.println("Archivo recibido: " + archivo.getOriginalFilename());
        System.out.println("Producto ID: " + id);
        System.out.println("NumSerie: " + producto.getNumSerie());
        try {

            String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf('.'));
            String nombreArchivo = producto.getId()+"_"+System.currentTimeMillis()+ extension.toLowerCase();
            Path ruta = Paths.get(System.getProperty("user.dir"), "images", nombreArchivo);
            Files.createDirectories(ruta.getParent());
            	
            archivo.transferTo(ruta.toFile());

            producto.setRutaImagen("/images/" + nombreArchivo);
            productoService.saveProducto(producto);

            return ResponseEntity.ok(Map.of("url", producto.getRutaImagen()));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al subir imagen");
        }
    }

    @PostMapping
    public Producto crearProducto(@RequestBody Producto producto) {
        return productoService.saveProducto(producto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Integer id, @RequestBody Producto actualizado) {
        return productoService.update(id, actualizado)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    @PutMapping("/{id}/deshabilitar")
    public ResponseEntity<Producto> deshabilitarProducto(@PathVariable Integer id) {
        return productoService.findById(id).map(producto -> {
            producto.setDisponibilidad(false);
            Producto actualizado = productoService.saveProducto(producto);
            return ResponseEntity.ok(actualizado);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Integer id) {
    	Optional<Producto> productoOpt = productoService.findById(id);

        if (productoOpt.isPresent()) {
            productoService.deleteById(id);
            return ResponseEntity.noContent().build();
        }


        return ResponseEntity.notFound().build();
    }

    @GetMapping
    public List<Producto> listarTodosLosProductos() {
        return productoService.findAll();
    }
}