document.addEventListener("DOMContentLoaded", () => {
	const token = localStorage.getItem("token");
	if (!token) {
		M.toast({ html: "Debes iniciar sesión" });
		window.location.href = "/login.html";
		return;
	}
	function descargarTicket(pedidoId) {
	  const token = localStorage.getItem("token");
	  if (!token) {
	    M.toast({ html: "Debes iniciar sesión para descargar el ticket" });
	    return;
	  }

	  fetch(`/api/cliente/pedidos/${pedidoId}/ticket`, {
	    method: "GET",
	    headers: {
	      Authorization: `Bearer ${token}`
	    }
	  })
	  .then(res => {
	    if (!res.ok) {
	      throw new Error("Error al descargar el ticket (403 o archivo no encontrado)");
	    }
	    return res.blob();
	  })
	  .then(blob => {
	    const url = window.URL.createObjectURL(blob);
	    const a = document.createElement("a");
	    a.href = url;
	    a.download = `ticket_pedido_${pedidoId}.pdf`;
	    document.body.appendChild(a);
	    a.click();
	    a.remove();
	    window.URL.revokeObjectURL(url);
	  })
	  .catch(err => {
	    console.error(err);
	    M.toast({ html: "No se pudo descargar el ticket" });
	  });
	}

	// Navbar y footer
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

	fetch("/api/cliente/pedidos/misPedidos", {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})
		.then(res => {
			if (!res.ok) throw new Error("No se pudieron obtener los pedidos");
			return res.json();
		})
		.then(pedidos => {
			const contenedor = document.getElementById("lista-pedidos");

			if (pedidos.length === 0) {
				contenedor.innerHTML = `<p class="center-align">No tienes pedidos realizados.</p>`;
				return;
			}

			let html = `
        <table class="highlight">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
      `;


			pedidos.forEach(p => {
				html += `
		<tr>
	      <th>#${p.pedido_id}</th>
	      <td>${new Date(p.fechaPedido).toLocaleDateString()}</td>
	      <td>${p.total} €</td>
	      <td>${p.estado}</td>
	      <td>
	        <a href="pedidoDetalle.html?pedidoId=${p.pedido_id}" class="btn green">Ver detalles</a>
			<button class="btn blue btn-descargar-ticket" data-id="${p.pedido_id}">Descargar ticket</button>
			<button class="btn red btn-cancelar" data-id="${p.pedido_id}">Cancelar pedido</button>
		  </tr>
	    `;
			});

			html += `</tbody></table>`;
			contenedor.innerHTML = html;

			document.querySelectorAll(".btn-descargar-ticket").forEach(btn => {
				btn.addEventListener("click", () => {
					const id = btn.getAttribute("data-id");
					descargarTicket(id);
				});
			});
			document.querySelectorAll(".btn-cancelar").forEach(btn => {
			  btn.addEventListener("click", () => {
			    const id = btn.getAttribute("data-id");
			    fetch(`/api/cliente/pedidos/${id}/cancelar`, {
			      method: "PATCH",
			      headers: { Authorization: `Bearer ${token}` }
			    })
			    .then(res => {
			      if (!res.ok) throw new Error();
			      M.toast({ html: "Pedido cancelado" });
			      location.reload();
			    })
			    .catch(() => M.toast({ html: "No se pudo cancelar el pedido" }));
			  });
			});
			
		})
		.catch(err => {
			console.error("Error al cargar pedidos:", err);
			M.toast({ html: "Error al cargar pedidos" });
		});
});