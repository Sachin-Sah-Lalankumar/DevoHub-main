document
  .querySelector(".theme-card .theme-toggle-wrapper")
  .addEventListener("click", function () {
    let d = localStorage.getItem("lightmode");
    if (d == "false") {
      localStorage.setItem("lightmode", true);
      document.body.classList.add("light");
    } else {
      localStorage.setItem("lightmode", false);
      document.body.classList.remove("light");
    }
  });
