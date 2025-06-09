document.addEventListener('DOMContentLoaded', () => {
	const token = localStorage.getItem("token");
	let paginaActual = 1;
	const productosPorPagina = 9;

	const btnPrev = document.getElementById("btn-prev");
	const btnNext = document.getElementById("btn-next");
	const spanPagina = document.getElementById("pagina-actual");
	const contenedor = document.getElementById("productos-container");

	let productosTotales = [];
	

	function renderProductos() {
		const totalPaginas = Math.ceil(productosTotales.length / productosPorPagina);
		const inicio = (paginaActual - 1) * productosPorPagina;
		const productosPagina = productosTotales.slice(inicio, inicio + productosPorPagina);

		contenedor.innerHTML = "";
		productosPagina.forEach(producto => {
			const col = document.createElement("div");
			col.className = "col s12 m6 l4";
			col.innerHTML = `
				<a href="detalle.html?id=${producto.id}" style="text-decoration: none; color: inherit;">
					<div class="card hoverable">
						<div class="card-image">
							<img id="img-producto-${producto.id}" style="object-fit: cover; height: 250px;">
						</div>
						<div class="card-content">
							<span class="card-title">${producto.nombre}</span>
							<p>Marca: ${producto.marca}</p>
							<p>Año: ${producto.año}</p>
							<p>Precio: ${producto.precio} €</p>
						
						</div>
					</div>
				</a>
			`;
			contenedor.appendChild(col);

			fetch(`/api/productos/${producto.id}/imagen`)
				.then(res => res.json())
				.then(data => {
					const img = document.getElementById(`img-producto-${producto.id}`);
					img.src = data.url || "/images/default.jpg";
				})
				.catch(() => {});
		});

			spanPagina.textContent = paginaActual;
			btnPrev.disabled = paginaActual === 1;
			btnNext.disabled = paginaActual >= totalPaginas;
	}

	function cargarProductos() {
		fetch("/api/productos/disponibles", {
			headers: token ? { Authorization: "Bearer " + token } : {}
		})
			.then(res => res.json())
			.then(data => {
				productosTotales = data;
				paginaActual = 1;
				renderProductos();
			})
			.catch(err => {
				console.error("Error al cargar productos:", err);
				M.toast({ html: "Error al cargar productos" });
			});
	}

	btnPrev.addEventListener("click", () => {
		if (paginaActual > 1) {
			paginaActual--;
			renderProductos();
		}
	});

	btnNext.addEventListener("click", () => {
		const totalPaginas = Math.ceil(productosTotales.length / productosPorPagina);
		if (paginaActual < totalPaginas) {
			paginaActual++;
			renderProductos();
		}
	});

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

	cargarProductos();
});
