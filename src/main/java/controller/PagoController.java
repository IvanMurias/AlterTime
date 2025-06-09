package controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

import model.Usuario;

@RestController
@RequestMapping("/api/pago")
@CrossOrigin(origins = "*")
public class PagoController {

    @PostMapping("/crear-sesion")
    public ResponseEntity<?> crearSesionPago(
            @RequestBody List<Map<String, Object>> items,
            @AuthenticationPrincipal Usuario usuarioAutenticado) {

        try {
            List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();

            for (Map<String, Object> item : items) {
                SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                    .setQuantity(((Number) item.get("cantidad")).longValue())
                    .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("eur")
                            .setUnitAmount(((Number) item.get("precio")).longValue() * 100)
                            .setProductData(
                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName((String) item.get("nombre"))
                                    .build()
                            )
                            .build()
                    )
                    .build();
                lineItems.add(lineItem);
            }

            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:8000/pago-exitoso.html")
                .setCancelUrl("http://localhost:8000/pago-cancelado.html")
                .setCustomerEmail(usuarioAutenticado.getEmail()) // <- Aquí Stripe enviará el recibo
                .addAllLineItem(lineItems)
                .build();

            Session session = Session.create(params);
            return ResponseEntity.ok(Map.of("url", session.getUrl()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al crear la sesión de Stripe");
        }
    }
}
