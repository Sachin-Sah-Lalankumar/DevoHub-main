document
  .querySelector(".search-bar span")
  .addEventListener("click", handleSearch);

document
  .getElementById("search-box")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      handleSearch();
    }
  });

function handleSearch() {
  const searchText = document.getElementById("search-box").value;
  const url = `../search/index.html?search=${encodeURIComponent(searchText)}`;
  window.location.href = url;
}

const settingsMenu = document.querySelector(".setting-menu");

function settingsMenuToggle() {
  settingsMenu.classList.toggle("settings-menu-height");
}

const headerNavDP = document.querySelector("#header-nav-dp");
const settingMenuDP = document.querySelector("#setting-menu-dp");
const settingMenuUsername = document.querySelector("#setting-menu-username");

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    updateNav(user.uid);
  } else {
    window.location.assign("../index.html");
  }
});

let role;

function updateNav(uid) {
  firebase
    .firestore()
    .collection("users")
    .doc(uid)
    .onSnapshot((data) => {
      if (data.data()["role"] == "admin") role = "admin";
      headerNavDP.src = data.data()["profile-img"];
      settingMenuDP.src = data.data()["profile-img"];
      settingMenuUsername.innerHTML = `${data.data()["first-name"]} ${
        data.data()["last-name"]
      }`;
      if (window.location.href.includes("/admin") && !role) {
        window.location.replace("../home");
      }
      if (role == "admin") addAdminNav();
    });
}

function addAdminNav() {
  let navLink = document.createElement("a");
  navLink.href = "../admin";
  navLink.setAttribute("class", "nav-link");
  navLink.innerHTML = `<span class="material-symbols-outlined">admin_panel_settings</span><h4>Admin Panel</h4>`;
  document.querySelector(".nav-links").prepend(navLink);
  if (window.location.href.includes("/admin/")) {
    navLink.classList.add("active");
  }
}
