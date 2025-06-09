document.addEventListener("DOMContentLoaded", function () {

  fetch("navbar.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("navbar-placeholder").innerHTML = html;

      const navScript = document.createElement("script");
      navScript.src = "js/navbar.js";
	  navScript.type="text/javascript";
      document.body.appendChild(navScript);
    });

  fetch("footer.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("footer-placeholder").innerHTML = html;

      const footerScript = document.createElement("script");
      footerScript.src = "js/footer.js";
	  footerScript.type="text/javascript";
      document.body.appendChild(footerScript);
    });
});