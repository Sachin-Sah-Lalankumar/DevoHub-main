document.querySelector(".card .btn").addEventListener("click", function () {
  console.log("ehl");
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.location.assign("../");
    });
});
