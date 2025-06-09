package service;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.altertime.config.TicketProperties;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;

import model.DetallePedido;
import model.Pedido;
import model.Producto;

@Service
public class PdfService {
	
	@Autowired
	private TicketProperties ticketProperties;
	
	public void generarTicketPDF(Pedido pedido) {
	    Document document = new Document();
	    try {
	    	String ruta = ticketProperties.getPath();;
	    	File carpeta = new File(ruta);
	        if (!carpeta.exists()) {
	            carpeta.mkdirs();
	        }
	        
	        String rutaPedido = ruta+pedido.getDir_ticket();
	        PdfWriter.getInstance(document, new FileOutputStream(rutaPedido));
	        document.open();

	        document.add(new Paragraph("Ticket de Compra"));
	        document.add(new Paragraph(" "));
	        document.add(new Paragraph("Pedido ID: " + pedido.getPedido_id()));
	        document.add(new Paragraph("Fecha: " + pedido.getFechaPedido()));
	        document.add(new Paragraph("Cliente: " + pedido.getUsuario().getNombre())); 
	        document.add(new Paragraph("Dirección de entrega: " + pedido.getDireccionEntrega()));
	        document.add(new Paragraph("Dirección de facturación: " + pedido.getDireccionFacturacion()));
	        document.add(new Paragraph(" "));

	        document.add(new Paragraph("Productos:"));
	        for (DetallePedido detalle : pedido.getDetalles()) {
	            Producto producto = detalle.getProducto();
	            document.add(new Paragraph("- " + producto.getNombre() + "-----------------------→        " + detalle.getPrecio() + " €"));
	            document.add(new Paragraph(" "));
	        }

	        document.add(new Paragraph(" "));
	        document.add(new Paragraph(" "));
	        document.add(new Paragraph("Total: " + pedido.getTotal() + " €"));

	    } catch (Exception e) {
	        e.printStackTrace();
	    } finally {
	        document.close();
	    }
	}

	public boolean ticketExiste(String nombre) {
	    if (nombre == null || nombre.isEmpty()) {
	        return false;
	    }
	    String rutaCompleta = Paths.get(ticketProperties.getPath(), nombre).toString();
	    File archivo = new File(rutaCompleta);
	    return archivo.exists() && archivo.canRead();
	}
}
