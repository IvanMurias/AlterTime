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
			navScript.onload = () => {
				cargarPerfil(token);
			};
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

	function cargarPerfil(token) {
		fetch("/api/usuarios/me", {
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
			.then(res => {
				if (!res.ok) throw new Error("No autorizado");
				return res.json();
			})
			.then(usuario => {
				document.getElementById("nombre").value = usuario.nombre;
				document.getElementById("apellidos").value = usuario.apellidos;
				document.getElementById("email").value = usuario.email;
				document.getElementById("dni").value = usuario.dni;
				document.getElementById("direccion").value = usuario.direccion;
				M.updateTextFields();
			})
			.catch(err => {
				console.error("Error al cargar perfil:", err);
				M.toast({ html: "Error al cargar datos del perfil" });
				window.location.href = "/login.html";
			});
	}

	document.getElementById("guardar-cambios").addEventListener("click", () => {
		const dni = document.getElementById("dni").value;

		if (!validarDNI(dni)) {
			M.toast({ html: "DNI/NIE no válido. Debe tener formato 12345678X o X1234567Y" });
			return;
		}
		const datosActualizados = {
			nombre: document.getElementById("nombre").value,
			apellidos: document.getElementById("apellidos").value,
			email: document.getElementById("email").value,
			dni: document.getElementById("dni").value,
			direccion: document.getElementById("direccion").value
		};

		fetch("/api/usuarios/me", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify(datosActualizados)
		})
			.then(async res => {
				if (!res.ok) throw res;
				return res.json();
			})
			.then(() => {
				M.toast({ html: "Perfil actualizado correctamente" });
				window.location.href="/perfil.html";
			})
			.catch(async err => {
				console.error("Error al actualizar perfil:", err);

				if (err instanceof Response) {
					const errorMsg = await err.text();
					M.toast({ html: errorMsg });
				} else {
					M.toast({ html: "Error al actualizar el perfil" });
				}
			});
	});
	function validarDNI(dni) {
		const regex1 = /^[0-9]{8}[A-Za-z]$/;
		const regex2 = /^[A-Za-z][0-9]{7}[A-Za-z]$/;
		return regex1.test(dni) || regex2.test(dni);
	}

	window.logout = function() {
		localStorage.clear();
		M.toast({ html: "Sesión cerrada" });
		window.location.href = "/index.html";
	};
});
document.getElementById("cambiar-password").addEventListener("click", () => {
	const actual = document.getElementById("password-actual").value;
	const nueva = document.getElementById("nueva-password").value;
	const confirmar = document.getElementById("confirmar-password").value;

	if (!actual || !nueva || !confirmar) {
		M.toast({ html: "Completa todos los campos de contraseña" });
		return;
	}
	if (!validarPass(nueva)) {
		M.toast({ html: "Contraseña no válida. Debe contener una mayuscula, una minuscula y un número al menos." });
		return;
	}
		
	if (nueva !== confirmar) {
		M.toast({ html: "Las contraseñas no coinciden" });
		return;
	}

	fetch("/api/usuarios/me/password", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({ actual, nueva })
	})
		.then(res => {
			if (!res.ok) throw new Error("No se pudo cambiar la contraseña");
			return res.text();
		})
		.then(msg => {
			M.toast({ html: msg || "Contraseña actualizada correctamente" });
			logout();
			window.location.href = "/login.html";

		})
		.catch(err => {
			console.error("Error al Contras contraseña:", err);
			M.toast({ html: "Contraseña actual errónea" });
		});
});
function validarPass(pass){
	const regex1=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
	return regex1.test(pass);
}
