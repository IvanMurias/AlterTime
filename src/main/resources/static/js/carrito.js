document.addEventListener('DOMContentLoaded', () => {
	const token = localStorage.getItem("token");

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
	const container = document.getElementById("carrito-container");
	const totalContainer = document.getElementById("total-carrito");
	let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

	function renderCarrito() {
		if (carrito.length === 0) {
			container.innerHTML = "<p>No hay productos en el carrito.</p>";
			totalContainer.textContent = "";
			return;
		}

		let html = `
    <table class="highlight">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
  `;

		let total = 0;
		carrito.forEach(p => {
			html += `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.precio} €</td>
        <td><a class="btn red" onclick="eliminarDelCarrito(${p.id})">Eliminar</a></td>
      </tr>
    `;
			total += p.precio;
		});

		html += "</tbody></table>";
		container.innerHTML = html;
		totalContainer.textContent = `Total: ${total.toFixed(2)} €`;
	}

	window.eliminarDelCarrito = function(id) {
		carrito = carrito.filter(p => p.id !== id);
		localStorage.setItem("carrito", JSON.stringify(carrito));
		renderCarrito();
		M.toast({ html: "Producto eliminado del carrito" });
	};

	document.getElementById("btn-comprar").addEventListener("click", async () => {
		const direccionEntrega = document.getElementById("direccionEntrega").value.trim();
		const direccionFacturacion = document.getElementById("direccionFacturacion").value.trim();

		if (!direccionEntrega || !direccionFacturacion) {
			M.toast({ html: "Debes completar ambas direcciones" });
			return;
		}

		if (carrito.length === 0) {
			M.toast({ html: "Tu carrito está vacío" });
			return;
		}

		const token = localStorage.getItem("token");
		if (!token) {
			M.toast({ html: "Debes iniciar sesión para finalizar la compra" });
			localStorage.setItem("carrito-pendiente", JSON.stringify(carrito));
			window.location.href = "/login.html";
			return;
		}

		const items = carrito.map(p => ({
			nombre: p.nombre,
			cantidad: 1,
			precio: p.precio
		}));

		try {
			const res = await fetch("/api/pago/crear-sesion", {
				method: "POST",
				headers: { "Content-Type": "application/json",
						   "Authorization": `Bearer ${token}`
				},
				body: JSON.stringify(items)
			});

			if (!res.ok) throw new Error("No se pudo crear la sesión de pago");

			const data = await res.json();
			localStorage.setItem("direccionEntrega", direccionEntrega);
			localStorage.setItem("direccionFacturacion", direccionFacturacion);
			localStorage.setItem("usuarioId", JSON.parse(atob(token.split('.')[1])).id);

			window.location.href = data.url;
		} catch (err) {
			console.error("Error con Stripe:", err);
			M.toast({ html: "Error al iniciar el pago" });
		}
	});
renderCarrito();
});
