document.addEventListener("DOMContentLoaded", function() {

	fetch("navbar.html")
		.then(res => res.text())
		.then(html => {
			document.getElementById("navbar-placeholder").innerHTML = html;

			const navScript = document.createElement("script");
			navScript.src = "js/navbar.js";
			navScript.type = "text/javascript";
			document.body.appendChild(navScript);
		});

	fetch("footer.html")
		.then(res => res.text())
		.then(html => {
			document.getElementById("footer-placeholder").innerHTML = html;

			const footerScript = document.createElement("script");
			footerScript.src = "js/footer.js";
			footerScript.type = "text/javascript";
			document.body.appendChild(footerScript);
		});
});
document.getElementById('registro-form').addEventListener('submit', async (e) => {
	e.preventDefault();
	const password = document.getElementById('password').value;
	const dni = document.getElementById('dni').value;
	const confirmar = document.getElementById('confirmar-password').value;
	if (password !== confirmar) {
	  M.toast({ html: "Las contraseñas no coinciden" });
	  return;
	}
	if (!validarDNI(dni)) {
		M.toast({ html: "DNI/NIE no válido. Debe tener formato 12345678X o X1234567Y" });
		return;
	}
	if (!validarPass(password)) {
			M.toast({ html: "Contraseña no válida. Debe contener una mayuscula, una minuscula y un número al menos." });
			return;
		}
	

	const nuevoUsuario = {
		nombre: document.getElementById('nombre').value,
		apellidos: document.getElementById('apellidos').value,
		dni,
		email: document.getElementById('email').value,
		direccion: document.getElementById('direccion').value,
		password,
		confirmar	
	};

	try {
		const response = await fetch('/api/usuarios/registro', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(nuevoUsuario)
		});

		if (!response.ok) throw new Error("Error al registrar");

		M.toast({ html: "Registro exitoso. Inicia sesión." });
		window.location.href = "/login.html";
	} catch (error) {
		M.toast({ html: error.message });
	}
});
function validarDNI(dni) {
	const regex1 = /^[0-9]{8}[A-Za-z]$/;
	const regex2 = /^[A-Za-z][0-9]{7}[A-Za-z]$/;
	return regex1.test(dni) || regex2.test(dni);
}

function validarPass(pass){
	const regex1=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
	return regex1.test(pass);
}