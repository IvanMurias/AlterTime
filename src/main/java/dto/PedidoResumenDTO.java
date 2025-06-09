package dto;

import java.time.LocalDate;
import java.util.List;

public class PedidoResumenDTO {

    private Integer pedido_id;
    private LocalDate fecha;
    private String usuario;
    private String direccion;
    private String estado;
    private double total;
    private List<ProductoResumen> productos;

    // Getters/setters

    public static class ProductoResumen {
        private String nombre;
        private double precio;
        private int año;

        public ProductoResumen() {}
        public ProductoResumen(String nombre, double precio,int año) {
            this.nombre = nombre;
            this.precio = precio;
            this.año = año;
        }

        public String getNombre() {
            return nombre;
        }

        public double getPrecio() {
            return precio;
        }
		public double getAño() {
			return año;
		}
	}

	public Integer getPedido_id() {
		return pedido_id;
	}

	public void setPedido_id(Integer pedido_id) {
		this.pedido_id = pedido_id;
	}

	public LocalDate getFecha() {
		return fecha;
	}

	public void setFecha(LocalDate fecha) {
		this.fecha = fecha;
	}

	public String getUsuario() {
		return usuario;
	}

	public void setUsuario(String usuario) {
		this.usuario = usuario;
	}

	public String getDireccion() {
		return direccion;
	}

	public void setDireccion(String direccion) {
		this.direccion = direccion;
	}

	public String getEstado() {
		return estado;
	}

	public void setEstado(String estado) {
		this.estado = estado;
	}

	public double getTotal() {
		return total;
	}

	public void setTotal(double total) {
		this.total = total;
	}

	public List<ProductoResumen> getProductos() {
		return productos;
	}

	public void setProductos(List<ProductoResumen> productos) {
		this.productos = productos;
	}
}