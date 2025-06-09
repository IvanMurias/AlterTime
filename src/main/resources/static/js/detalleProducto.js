document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const token = localStorage.getItem("token");

  fetch("navbar.html")
    .then(res => res.text())
    .then(html => {
	console.log("navbar cargado");
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

  if (!id) {
    document.getElementById("producto-detalle").innerHTML = '<p class="red-text">ID de producto no especificado.</p>';
    return;
  }

  fetch(`/api/productos/${id}`)
    .then(res => {
      if (!res.ok) throw new Error("Producto no encontrado");
      return res.json();
    })
    .then(producto => {
      const container = document.getElementById("producto-detalle");
      container.innerHTML = `
        <div class="col s12 m6">
          <img id="imagen-producto" class="responsive-img" style="max-height: 400px; object-fit: cover;" />
        </div>
        <div class="col s12 m6">
          <h4>${producto.nombre}</h4>
          <p><strong>Marca:</strong> ${producto.marca}</p>
          <p><strong>Referencia:</strong> ${producto.referencia}</p>
          <p><strong>Año:</strong> ${producto.año}</p>
          <p><strong>Precio:</strong> ${producto.precio} €</p>
          <button class="btn blue" onclick="agregarAlCarrito(${producto.id})">Añadir al carrito</button>
        </div>
      `;

      return fetch(`/api/productos/${producto.id}/imagen`);
    })
    .then(res => res.json())
    .then(data => {
      document.getElementById("imagen-producto").src = data.url || "/images/default.jpg";
    })
    .catch(err => {
      document.getElementById("producto-detalle").innerHTML = `<p class="red-text">${err.message}</p>`;
    });

  window.agregarAlCarrito = function (idProducto) {
    fetch(`/api/productos/${idProducto}`)
      .then(res => res.json())
      .then(producto => {
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const index = carrito.findIndex(p => p.id === producto.id);
        if (index === -1) {
          carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
          });
          localStorage.setItem("carrito", JSON.stringify(carrito));
          M.toast({ html: "Producto añadido al carrito" });
        } else {
          M.toast({ html: "Este producto ya está en el carrito" });
        }
      })
      .catch(err => {
        console.error("Error al obtener el producto para el carrito", err);
        M.toast({ html: "Error al añadir al carrito" });
      });
  };
});