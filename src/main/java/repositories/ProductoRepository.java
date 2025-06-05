package repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import model.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {
	List<Producto> findByNombreContaining(String nombre);
}
