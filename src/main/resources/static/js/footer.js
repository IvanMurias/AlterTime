const yearSpan = document.getElementById("footer-year");
  if (yearSpan) {
    const year = new Date().getFullYear();
    yearSpan.textContent = `© ${year}`;
  }
