package service;

import model.Producto;

import java.util.List;
import java.util.Optional;

public interface ProductoService {
    List<Producto> findAll();
    Producto saveProducto(Producto producto);
    Optional<Producto> update(Integer id, Producto producto);
    boolean deleteById(Integer id);
	Optional<Producto> findById(Integer id);
	List<Producto> findDisponibles();
}
