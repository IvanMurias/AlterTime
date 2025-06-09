document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    M.toast({ html: "Debes iniciar sesión" });
    window.location.href = "/login.html";
    return;
  }

  fetch("navbar.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("navbar-placeholder").innerHTML = html;
      const navScript = document.createElement("script");
      navScript.src = "js/navbar.js";
      document.body.appendChild(navScript);
    });

  fetch("footer.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("footer-placeholder").innerHTML = html;
      const footerScript = document.createElement("script");
      footerScript.src = "js/footer.js";
      document.body.appendChild(footerScript);
    });

  const urlParams = new URLSearchParams(window.location.search);
  const pedidoId = urlParams.get("pedidoId");

  if (!pedidoId) {
    M.toast({ html: "ID de pedido no proporcionado" });
    return;
  }

  fetch(`/api/cliente/pedidos/${pedidoId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("No se pudo obtener el pedido");
      return res.json();
    })
    .then(pedido => {
      document.getElementById("pedido-info").innerHTML = `
        <h5>Pedido #${pedido.pedido_id}</h5>
        <p><strong>Fecha:</strong> ${new Date(pedido.fechaPedido).toLocaleString()}</p>
        <p><strong>Estado:</strong> ${pedido.estado}</p>
        <p><strong>Total:</strong> ${pedido.total} €</p>
        <p><strong>Dirección de entrega:</strong> ${pedido.dir_ticket}</p>
      `;

      const detalles = pedido.detalles || [];

      if (detalles.length === 0) {
        document.getElementById("detalle-lista").innerHTML = "<p>No hay productos en este pedido.</p>";
        return;
      }

      let html = `
        <table class="striped">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
      `;
	
      detalles.forEach(d => {
        html += `
          <tr>
            <td>${d.producto.nombre}</td>
            <td>${d.producto.precio} €</td>
          </tr>
        `;
      });
	  

      html += `<tr><td>Total:</td> <td>${pedido.total}</tr></tbody></table>`;
      document.getElementById("detalle-lista").innerHTML = html;
    })
    .catch(err => {
      console.error("Error al cargar detalle del pedido:", err);
      M.toast({ html: "Error al cargar detalle del pedido" });
    });
});
