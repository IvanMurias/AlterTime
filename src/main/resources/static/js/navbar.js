const token = localStorage.getItem("token");
const rol = localStorage.getItem("rol");

const navUserLinks = document.getElementById("nav-user-links");
const sidenavUserLinks = document.getElementById("sidenav-user-links");

const linksHTML = token
	? `
	  ${rol === "ADMIN" ? "" : `<li><a href="../perfil.html">Mi perfil</a></li>`}
	  ${rol === "ADMIN" ? "" : `<li><a href="../misPedidos.html">Mis pedidos</a></li>`}
      ${rol === "ADMIN" ? `<li><a href="admin.html">Admin</a></li>` : ""}
      <li><a href="#!" onclick="logout()">Cerrar sesión</a></li>
	  <li><a href="carrito.html"><i class="material-icons">shopping_cart</i></a></li>

    `
	: `
      <li><a href="login.html">Login</a></li>
      <li><a href="registro.html">Registro</a></li>
	  <li><a href="carrito.html"><i class="material-icons">shopping_cart</i></a></li>
    `;

if (navUserLinks) navUserLinks.innerHTML = linksHTML;
if (sidenavUserLinks) sidenavUserLinks.innerHTML = linksHTML;

function logout() {
	localStorage.clear();
	M.toast({ html: "Sesión cerrada" });
	window.location.href = "login.html";
}

window.logout = logout;

M.Sidenav.init(document.querySelectorAll(".sidenav"));
