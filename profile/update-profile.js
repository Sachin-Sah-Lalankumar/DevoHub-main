const profileBox = document.querySelector(".main-pcon");

const saveBtn = document.querySelector(".save-btn");
const editBtn = document.querySelector(".edit-btn");

let file;

editBtn.addEventListener("click", () => {
  profileBox.classList.add("editable");
  inputFields.forEach((field) => {
    if (field.id != "email") field.removeAttribute("disabled");
  });
});

let newData = {};
saveBtn.addEventListener("click", () => {
  profileBox.classList.remove("editable");
  inputFields.forEach((field) => {
    field.setAttribute("disabled", "true");
    newData[field.id] = field.value;
  });

  if (file) {
    let uploadTask = firebase
      .storage()
      .ref()
      .child(`users/${uid}/dp`)
      .put(file);
    uploadTask.on(
      "state_changed",
      (progress) => {},
      (error) => {},
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          newData["profile-img"] = downloadURL;
          firebase.firestore().collection("users").doc(uid).update(newData);
        });
      }
    );
  } else {
    firebase.firestore().collection("users").doc(uid).update(newData);
  }
});

function updateProfileImg(e) {
  console.log(e.target.files[0]);
  file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      document.querySelector(".profile-img img").src = e.target.result;
    };
  }
}
