package service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import model.Producto;
import repositories.ProductoRepository;

@Service
public class ProductoServiceImpl implements ProductoService {

	@Autowired
	private ProductoRepository productoRepository;

	@Override
	public List<Producto> findAll() {
		return productoRepository.findAll();
	}

	@Override
	public Optional<Producto> findById(Integer id) {
		return productoRepository.findById(id);
	}

	@Override
	public Producto saveProducto(Producto producto) {
		return productoRepository.save(producto);
	}

	@Override
	public Optional<Producto> update(Integer id, Producto nuevoProducto) {
		return productoRepository.findById(id).map(producto -> {
			producto.setNombre(nuevoProducto.getNombre());
			producto.setAño(nuevoProducto.getAño());
			producto.setNumSerie(nuevoProducto.getNumSerie());
			producto.setPrecio(nuevoProducto.getPrecio());
			producto.setDisponibilidad(nuevoProducto.isDisponibilidad());

			if (nuevoProducto.getRutaImagen() != null) {
				producto.setRutaImagen(nuevoProducto.getRutaImagen());
			}
			return productoRepository.save(producto);
		});
	}

	@Override
	public boolean deleteById(Integer id) {
		if (productoRepository.existsById(id)) {
			productoRepository.deleteById(id);
			return true;
		}
		return false;
	}

	@Override
	public List<Producto> findDisponibles() {
		return productoRepository.findByDisponibilidadTrue();
	}

	@Override
	public Optional<Producto> findByNumSerie(Integer numSerie) {
		return productoRepository.findByNumSerie(numSerie);
	}
}
