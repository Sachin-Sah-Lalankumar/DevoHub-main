let logEmail = document.getElementById("logEmail");
let logPassword = document.getElementById("logPassword");
let loginForm = document.querySelector(".login-form");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  firebase
    .auth()
    .signInWithEmailAndPassword(logEmail.value, logPassword.value)
    .then((userCredential) => {
      firebase
        .firestore()
        .collection("users")
        .doc(userCredential.user.uid)
        .onSnapshot((data) => {
          if (data.data()["role"] == "admin") window.location = "./admin";
          else window.location = "./home";
        });
    })
    .catch((error) => {
      console.log(error);
      alert(error.message);
    });
});
