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
				setTimeout(cargarPedidos, 0);
				break;
			case "usuarios":
				contenedor.innerHTML = "<h4>Gestión de usuarios</h4><div id='usuarios-container'</div>";
				setTimeout(cargarUsuarios, 0);
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

	function cargarPedidos() {
		const container = document.getElementById("contenido-principal");
		container.innerHTML = `
			<h4>Gestión de pedidos</h4>
			<div class="row">
				<div class="input-field col s4">
					<input type="text" id="buscar-id" placeholder="Buscar por ID de pedido">
				</div>
				<div class="input-field col s4">
					<input type="text" id="buscar-usuario-email" placeholder="Buscar por Email de usuario">
				</div>
				<div class="input-field col s4">
					<a class="btn blue" id="btn-buscar">Buscar</a>
					<a class="btn grey" id="btn-reset">Reset</a>
				</div>
			</div>
			<div id="formulario-edicion" style="display: none; margin-bottom: 20px;"></div>
			<table class="highlight responsive-table">
				<thead>
					<tr>
						<th>ID</th>
						<th>Cliente</th>
						<th>Fecha</th>
						<th>Total (€)</th>
						<th>Estado</th>
						<th>Entrega</th>
						<th>Facturación</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody id="tabla-pedidos">
				</tbody>
			</table>
		`;

		document.getElementById("btn-buscar").addEventListener("click", async () => {
			const id = document.getElementById("buscar-id").value.trim();
			const usuarioemail = document.getElementById("buscar-usuario-email").value.trim();

			if (id) {
				const res = await fetch(`/api/admin/pedidos/${id}`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				if (res.ok) {
					const pedido = await res.json();
					mostrarPedidos([pedido]);
				} else {
					M.toast({ html: "Pedido no encontrado" });
				}
			} else if (usuarioemail) {
				const res = await fetch(`/api/admin/pedidos/usuario/email/${encodeURIComponent(usuarioEmail)}`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				if (res.ok) {
					const pedidos = await res.json();
					mostrarPedidos(pedidos);
				} else {
					M.toast({ html: "Usuario no encontrado o sin pedidos" });
				}
			} else {
				cargarTodosPedidos();
			}
		});

		document.getElementById("btn-reset").addEventListener("click", () => {
			document.getElementById("buscar-id").value = "";
			document.getElementById("buscar-usuario-email").value = "";
			cargarTodosPedidos();
		});

		cargarTodosPedidos();
	}

	async function cargarTodosPedidos() {
		try {
			const res = await fetch("/api/admin/pedidos", {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) throw new Error("Error al obtener pedidos");
			const pedidos = await res.json();
			mostrarPedidos(pedidos);
		} catch (err) {
			console.error(err);
			M.toast({ html: "No se pudieron cargar los pedidos" });
		}
	}

	function mostrarPedidos(pedidos) {
		const tbody = document.getElementById("tabla-pedidos");
		tbody.innerHTML = "";

		pedidos.forEach(p => {
			tbody.innerHTML += `
				<tr>
					<td>${p.pedido_id}</td>
					<td>${p.usuario?.email || "-"}</td>
					<td>${p.fechaPedido}</td>
					<td>${p.total.toFixed(2)}</td>
					<td>${p.estado}</td>
					<td>${p.direccionEntrega}</td>
					<td>${p.direccionFacturacion}</td>
					<td>
						<a class="btn-small yellow darken-2" onclick="editarPedido(${p.pedido_id})">Editar</a>
						<a class="btn-small red" onclick="eliminarPedido(${p.pedido_id})">Eliminar</a>
					</td>
				</tr>
			`;
		});
	}

	window.editarPedido = async function(id) {
		try {
			const res = await fetch(`/api/admin/pedidos/${id}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) throw new Error("No se encontró el pedido");
			const p = await res.json();

			const formWrapper = document.getElementById("formulario-edicion");
			formWrapper.innerHTML = `
				<div class="card">
					<div class="card-content">
						<span class="card-title">Editar Pedido #${p.pedido_id}</span>
						<form id="form-editar-pedido">
							<div class="input-field">
								<select id="estado">
									<option value="pendiente" ${p.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
									<option value="enviado" ${p.estado === 'enviado' ? 'selected' : ''}>Enviado</option>
									<option value="cancelado" ${p.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
								</select>
								<label>Estado</label>
							</div>
							<div class="input-field">
								<input type="text" id="direccionEntrega" value="${p.direccionEntrega || ''}" required>
								<label class="active">Dirección de entrega</label>
							</div>
							<div class="input-field">
								<input type="text" id="direccionFacturacion" value="${p.direccionFacturacion || ''}" required>
								<label class="active">Dirección de facturación</label>
							</div>
							<button class="btn green" type="submit">Guardar</button>
							<a class="btn red right" onclick="document.getElementById('formulario-edicion').style.display='none'">Cancelar</a>
						</form>
					</div>
				</div>
			`;
			formWrapper.style.display = "block";
			M.FormSelect.init(formWrapper.querySelectorAll('select'));

			document.getElementById("form-editar-pedido").addEventListener("submit", async (e) => {
				e.preventDefault();

				const pedidoActualizado = {
					pedido_id: p.pedido_id,
					estado: document.getElementById("estado").value,
					direccionEntrega: document.getElementById("direccionEntrega").value,
					direccionFacturacion: document.getElementById("direccionFacturacion").value,
					usuario: { usuario_id: p.usuario.usuario_id },
					fechaPedido: p.fechaPedido,
					total: p.total,
					dir_ticket: p.dir_ticket,
					detalles: p.detalles
				};

				try {
					const res = await fetch(`/api/admin/pedidos/${p.pedido_id}`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify(pedidoActualizado)
					});
					if (!res.ok) throw new Error("Error al actualizar el pedido");

					M.toast({ html: "Pedido actualizado" });
					document.getElementById("formulario-edicion").style.display = "none";
					cargarTodosPedidos();
				} catch (err) {
					console.error(err);
					M.toast({ html: "Error: " + err.message });
				}
			});
		} catch (err) {
			console.error(err);
			M.toast({ html: "Error al cargar pedido: " + err.message });
		}
	};

	window.eliminarPedido = async function(id) {
		if (!confirm("¿Estás seguro de eliminar este pedido?")) return;

		try {
			const res = await fetch(`/api/admin/pedidos/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) throw new Error("Error al eliminar el pedido");

			M.toast({ html: "Pedido eliminado" });
			cargarTodosPedidos();
		} catch (err) {
			console.error(err);
			M.toast({ html: "Error: " + err.message });
		}
	};
	function cargarUsuarios() {
		const container = document.getElementById("contenido-principal");
		container.innerHTML = `
			<h4>Gestión de usuarios</h4>
			<div class="row">
				<div class="input-field col s4">
					<input type="text" id="buscar-email" placeholder="Buscar por email">
				</div>
				<div class="input-field col s4">
				    <input type="text" id="buscar-dni" placeholder="Buscar por DNI">
				  </div>
				<div class="input-field col s6">
					<a class="btn blue" id="btn-buscar-usuario">Buscar</a>
					<a class="btn grey" id="btn-reset-usuario">Reset</a>
				</div>
			</div>
			<div id="formulario-edicion-usuario" style="display: none; margin-bottom: 20px;"></div>
			<table class="highlight responsive-table">
				<thead>
					<tr>
						<th>ID</th>
						<th>Nombre</th>
						<th>Email</th>
						<th>DNI</th>
						<th>Dirección</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody id="tabla-usuarios"></tbody>
			</table>
		`;

		document.getElementById("btn-buscar-usuario").addEventListener("click", async () => {
			const email = document.getElementById("buscar-email").value.trim();
			const dni = document.getElementById("buscar-dni").value.trim();

			try {
				if (email) {
					const res = await fetch(`/api/admin/usuarios/email/${encodeURIComponent(email)}`, {
						headers: { Authorization: `Bearer ${token}` }
					});
					if (!res.ok) throw new Error("No se encontró el usuario por email");
					const usuario = await res.json();
					mostrarUsuarios([usuario]);
				} else if (dni) {
					const res = await fetch(`/api/admin/usuarios/dni/${encodeURIComponent(dni)}`, {
						headers: { Authorization: `Bearer ${token}` }
					});
					if (!res.ok) throw new Error("No se encontró el usuario por DNI");
					const usuario = await res.json();
					mostrarUsuarios([usuario]);
				} else {
					cargarTodosUsuarios();
				}
			} catch (err) {
				M.toast({ html: err.message });
			}
		});

		document.getElementById("btn-reset-usuario").addEventListener("click", () => {
			document.getElementById("buscar-email").value = "";
			document.getElementById("buscar-dni").value = "";
			cargarTodosUsuarios();
		});

		cargarTodosUsuarios();
	}

	async function cargarTodosUsuarios() {
		try {
			const res = await fetch("/api/admin/usuarios", {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) throw new Error("Error al obtener usuarios");
			const usuarios = await res.json();
			mostrarUsuarios(usuarios);
		} catch (err) {
			console.error(err);
			M.toast({ html: err.message });
		}
	}

	function mostrarUsuarios(usuarios) {
		const tbody = document.getElementById("tabla-usuarios");
		tbody.innerHTML = "";
		usuarios.forEach(u => {
			tbody.innerHTML += `
				<tr>
					<td>${u.usuario_id}</td>
					<td>${u.nombre} ${u.apellidos}</td>
					<td>${u.email}</td>
					<td>${u.dni}</td>
					<td>${u.direccion}</td>
					<td>
						<a class="btn-small yellow darken-2" onclick="editarUsuario(${u.usuario_id})">Editar</a>
						<a class="btn-small red" onclick="eliminarUsuario(${u.usuario_id})">Eliminar</a>
					</td>
				</tr>
			`;
		});
	}

	window.editarUsuario = async function(id) {
		try {
			const res = await fetch(`/api/admin/usuarios/${id}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) throw new Error("No se encontró el usuario");
			const u = await res.json();

			document.getElementById("formulario-edicion-usuario").innerHTML = `
				<div class="card">
					<div class="card-content">
						<span class="card-title">Editar Usuario</span>
						<form id="form-editar-usuario">
							<div class="input-field">
								<input type="text" id="nombre" value="${u.nombre}" required>
								<label class="active">Nombre</label>
							</div>
							<div class="input-field">
								<input type="text" id="apellidos" value="${u.apellidos}" required>
								<label class="active">Apellidos</label>
							</div>
							<div class="input-field">
								<input type="text" id="dni" value="${u.dni}" required>
								<label class="active">DNI</label>
							</div>
							<div class="input-field">
								<input type="email" id="email" value="${u.email}" required>
								<label class="active">Email</label>
							</div>
							<div class="input-field">
								<input type="text" id="direccion" value="${u.direccion}" required>
								<label class="active">Dirección</label>
							</div>
							<button class="btn green" type="submit">Guardar</button>
							<a class="btn red right" onclick="document.getElementById('formulario-edicion-usuario').style.display='none'">Cancelar</a>
						</form>
					</div>
				</div>
			`;
			document.getElementById("formulario-edicion-usuario").style.display = "block";

			document.getElementById("form-editar-usuario").addEventListener("submit", async (e) => {
				e.preventDefault();
				const usuarioEditado = {
					nombre: document.getElementById("nombre").value,
					apellidos: document.getElementById("apellidos").value,
					dni: document.getElementById("dni").value,
					email: document.getElementById("email").value,
					direccion: document.getElementById("direccion").value
				};

				try {
					const res = await fetch(`/api/admin/usuarios/${id}`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify(usuarioEditado)
					});
					if (!res.ok) throw new Error("Error al actualizar el usuario");
					M.toast({ html: "Usuario actualizado" });
					document.getElementById("formulario-edicion-usuario").style.display = "none";
					cargarTodosUsuarios();
				} catch (err) {
					M.toast({ html: err.message });
				}
			});
		} catch (err) {
			console.error(err);
			M.toast({ html: err.message });
		}
	};

	window.eliminarUsuario = async function(id) {
		if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
		try {
			const res = await fetch(`/api/admin/usuarios/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) throw new Error("Error al eliminar usuario");
			M.toast({ html: "Usuario eliminado" });
			cargarTodosUsuarios();
		} catch (err) {
			console.error(err);
			M.toast({ html: err.message });
		}
	};

});
