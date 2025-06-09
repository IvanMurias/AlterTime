document.addEventListener("DOMContentLoaded", async () => {
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
	
	

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const direccionEntrega = localStorage.getItem("direccionEntrega");
  const direccionFacturacion = localStorage.getItem("direccionFacturacion");

  if (!token || carrito.length === 0 || !direccionEntrega || !direccionFacturacion) {
    M.toast({ html: "Datos de compra incompletos. Pedido no procesado." });
    window.location.href = "/carrito.html";
    return;
  }
  const userData = parseJwt(token);
  const usuarioId = userData.id;
  const productosIds = carrito.map(p => p.id);

  try {
    const res = await fetch("/api/cliente/pedidos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
		usuarioId,
        productosIds,
        direccionEntrega,
        direccionFacturacion
      })
    });

    if (!res.ok) throw new Error("Error al crear el pedido");
	
	
    const data = await res.json();
    M.toast({ html: "Pedido creado con éxito" });

    localStorage.removeItem("carrito");
    localStorage.removeItem("direccionEntrega");
    localStorage.removeItem("direccionFacturacion");

    setTimeout(() => {
      window.location.href = "/misPedidos.html";
    }, 1500);

  } catch (err) {
    console.error(err);
    M.toast({ html: "Error al procesar el pedido tras el pago" });
  }
});
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));

  return JSON.parse(jsonPayload);
}
