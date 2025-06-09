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


	const form = document.getElementById("loginForm");

	if (form) {
		form.addEventListener("submit", async (e) => {
			e.preventDefault();

			const email = document.getElementById("email").value;
			const password = document.getElementById("password").value;

			try {
				const res = await fetch("/api/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password })
				});

				if (!res.ok) {
					const msg = await res.text();
					throw new Error(msg || "Credenciales inválidas");
				}

				const { token } = await res.json();
				localStorage.setItem("token", token);

				const userData = parseJwt(token);
				localStorage.setItem("email", userData.sub);
				localStorage.setItem("rol", userData.role);

				M.toast({ html: "¡Login exitoso!" });


				if (userData.role === "ADMIN") {
					window.location.href = "admin.html";
				} else {
					const pendiente = localStorage.getItem("carrito-pendiente");
					if (pendiente) {
						localStorage.setItem("carrito", pendiente);
						localStorage.removeItem("carrito-pendiente");
						window.location.href = "/carrito.html";
					} else {
						window.location.href = "index.html";
					}
				}

			} catch (err) {
				console.error(err);
				M.toast({ html: "Error: " + err.message });
			}

		});
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

