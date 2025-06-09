let productoEditandoId = null;
const token = localStorage.getItem("token");

function parseJwt(token) {
	const base64Url = token.split('.')[1];
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
		'%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
	).join(''));
	return JSON.parse(jsonPayload);
}

function mostrarFormularioCrear() {
	resetFormulario();
	const formWrapper = document.getElementById("formulario-crear");
	const form = document.getElementById("form-crear-producto");
	const tituloForm = formWrapper.querySelector(".card-title");
	const submitButton = form.querySelector("button[type='submit']");

	if (!productoEditandoId) resetFormulario();

	formWrapper.style.display = "block";
	tituloForm.textContent = "Nuevo producto";
	submitButton.textContent = "Crear";
}

function resetFormulario() {
	productoEditandoId = null;
	const form = document.getElementById("form-crear-producto");
	document.getElementById("input-imagen").value = "";
	form.reset();
	form.querySelector("button[type='submit']").textContent = "Crear";
	document.querySelector(".card-title").textContent = "Nuevo producto";
}

function ocultarFormulario() {
	const formWrapper = document.getElementById("formulario-crear");
	formWrapper.style.display = "none";
}

function cancelarEdicion() {
	resetFormulario();
	ocultarFormulario();
}

document.addEventListener('DOMContentLoaded', () => {
	if (!token) {
		window.location.href = "/login.html";
		return;
	}

	const userData = parseJwt(token);
	if (userData.role !== "ADMIN") {
		alert("Acceso restringido solo a administradores");
		window.location.href = "/login.html";
		return;
	}

	function logout() {
		localStorage.clear();
		M.toast({ html: "Sesión cerrada" });
		window.location.href = "index.html";
	}

	window.logout = logout;

	M.Sidenav.init(document.querySelectorAll(".sidenav"));

	document.getElementById("admin-email").textContent = userData.sub;


	document.querySelectorAll(".nav-link").forEach(link => {
		link.addEventListener("click", e => {
			e.preventDefault();
			const section = link.getAttribute("href").substring(1);
			cargarSeccion(section);
		});
	});


	document.getElementById("logout").addEventListener("click", () => {
		logout();
	});

	function cargarSeccion(seccion) {
		const contenedor = document.getElementById("contenido-principal");
		switch (seccion) {
			case "inicio":
				window.location.href = "index.html";
				return;
			case "productos":
				contenedor.innerHTML = "<h4>Gestión de productos</h4><div id='productos-container'></div>";

				setTimeout(cargarProductos, 0);
				break;
			case "pedidos":
				contenedor.innerHTML = "<h4>Gestión de pedidos</h4><div id='pedidos-container'></div>";
				break;
			default:
				contenedor.innerHTML = "<p>Sección no encontrada.</p>";
		}
	}

	async function cargarProductos() {

		const container = document.getElementById("productos-container");

		try {
			const response = await fetch("/api/admin/productos", {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			if (!response.ok) throw new Error("Error al obtener productos");

			const productos = await response.json();

			let html = `
				<a class="btn" onclick="mostrarFormularioCrear()">Añadir producto</a>
				<div id="formulario-crear" style="margin-top: 20px; display: none;">
					<div class="card">
						<div class="card-content">
							<span class="card-title">Nuevo producto</span>
							<form id="form-crear-producto">
								<div class="input-field"><input id="nombre" name="nombre" required placeholder="Nombre"></div>
								<div class="input-field"><input id="marca" name="marca" placeholder="Marca" required></div>
								<div class="input-field"><input id="referencia" name="referencia" required placeholder="Referencia"></div>
								<div class="input-field"><input type="number" id="año" name="año" required placeholder="Año"></div>
								<div class="input-field"><input type="number" id="numSerie" name="numSerie" required placeholder="Nº de Serie"></div>
								<div class="input-field"><input type="number" step="0.01" name="precio" id="precio" required placeholder="Precio (€)"></div>
									<div class="input-field">
										<div class="btn">
											<span>Seleccionar Imagen</span>
											<input type="file" id="input-imagen" name="imagen" accept="image/*">
										</div>
									</div>

								<div class="switch">
									<label>
										No disponible
										<input type="checkbox" id="disponibilidad" checked>
										<span class="lever"></span>
										Disponible
									</label>
								</div>
								<button class="btn green" type="submit">Crear</button>
								<button class="btn red right" onclick="cancelarEdicion()">Cancelar</button>
							</form>
						</div>
					</div>
				</div>
				<table class="highlight responsive-table" style="margin-top: 20px;">
					<thead>
						<tr>
							<th>ID</th>
							<th>Nombre</th>
							<th>Marca</th>
							<th>Referencia</th>
							<th>Año</th>
							<th>Nº Serie</th>
							<th>Precio</th>
							<th>Disponible</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
			`;

			productos.forEach(p => {
				html += `
					<tr>
						<td>${p.id}</td>
						<td>${p.nombre}</td>
						<td>${p.marca}</td>
						<td>${p.referencia}</td>
						<td>${p.año}</td>
						<td>${p.numSerie}</td>
						<td>${p.precio} €</td>
						<td>${p.disponibilidad ? "Sí" : "No"}</td>
						<td class="botonera">
							<a class="btn-small yellow darken-2" onclick="editarProducto(${p.id})">Editar</a>
							<a class="btn-small red" onclick="deshabilitarProducto(${p.id})">Eliminar</a>
						</td>
					</tr>
				`;
			});

			html += `</tbody></table>`;

			container.innerHTML = html;
			const form = document.getElementById("form-crear-producto");
			form.addEventListener("submit", async (e) => {
				e.preventDefault();

				const nuevoProducto = {
					nombre: document.getElementById("nombre").value,
					marca: document.getElementById("marca").value,
					referencia: document.getElementById("referencia").value,
					año: parseInt(document.getElementById("año").value),
					numSerie: parseInt(document.getElementById("numSerie").value),
					precio: parseFloat(document.getElementById("precio").value),
					disponibilidad: document.getElementById("disponibilidad").checked
				};

				try {
					let productoId;

					if (productoEditandoId) {
						const res = await fetch(`/api/admin/productos/${productoEditandoId}`, {
							method: "PUT",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${token}`
							},
							body: JSON.stringify(nuevoProducto)
						});
						if (!res.ok) throw new Error("Error al actualizar el producto");
						productoId = productoEditandoId;
					} else {
						const resProducto = await fetch("/api/admin/productos", {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${token}`
							},
							body: JSON.stringify(nuevoProducto)
						});
						if (!resProducto.ok) throw new Error("Error al crear el producto");
						const productoCreado = await resProducto.json();
						productoId = productoCreado.id;
					}


					const archivo = document.getElementById("input-imagen").files[0];
					if (archivo) {
						const formData = new FormData();
						formData.append("imagen", archivo);

						const resImagen = await fetch(`/api/admin/productos/${productoId}/imagen`, {
							method: "POST",
							headers: {
								Authorization: `Bearer ${token}`
							},
							body: formData
						});
						if (!resImagen.ok) throw new Error("Imagen no se pudo subir");
					}

					M.toast({ html: productoEditandoId ? "Producto actualizado" : "Producto creado" });
					resetFormulario();
					cargarProductos();
					ocultarFormulario();

				} catch (err) {
					console.error(err);
					M.toast({ html: "Error: " + err.message });
				}
			});

		} catch (error) {
			container.innerHTML = `<p class="red-text">Error al cargar productos.</p>`;
			console.error(error);
		}
	}

	window.deshabilitarProducto = async function deshabilitarProducto(id) {
		if (!confirm("¿Seguro que quieres desactivar este producto?")) return;

		try {
			const res = await fetch(`/api/admin/productos/${id}/deshabilitar`, {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			if (!res.ok) throw new Error("Error al desactivar producto");
			M.toast({ html: "Producto desactivado correctamente" });
			cargarProductos();
		} catch (err) {
			console.error(err);
			M.toast({ html: "Error: " + err.message });
		}
	}

	window.editarProducto = async function editarProducto(id) {
		const form = document.getElementById("form-crear-producto");
		document.querySelector(".card-title").textContent = "Editar producto";
		document.querySelector("#form-crear-producto button[type='submit']").textContent = "Actualizar";
		document.getElementById("formulario-crear").style.display = "block";
		try {
			const res = await fetch(`/api/admin/productos/${id}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
				}
			});
			if (!res.ok) throw new Error("Error al obtener el producto");


			const producto = await res.json();
			productoEditandoId = producto.id;


			form.querySelector("#nombre").value = producto.nombre;
			form.querySelector("#marca").value = producto.marca;
			form.querySelector("#referencia").value = producto.referencia;
			form.querySelector("#año").value = producto.año;
			form.querySelector("#numSerie").value = producto.numSerie;
			form.querySelector("#precio").value = producto.precio;
			form.querySelector("#disponibilidad").checked = producto.disponibilidad;

		} catch (err) {
			console.error(err);
			M.toast({ html: "Error al cargar producto: " + err.message });
		}
	};
});
