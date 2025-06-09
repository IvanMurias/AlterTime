package repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import model.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {
	List<Producto> findByNombreContaining(String nombre);
	List<Producto> findByDisponibilidadTrue();
	Optional<Producto> findByNumSerie(Integer numSerie);
}
