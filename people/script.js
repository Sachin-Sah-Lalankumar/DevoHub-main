const followingUsersDiv = document.querySelector(".users.following");
const topUsersDiv = document.querySelector(".users.top");

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot((data) => {
        showFollowingUsers(data.data().following);
      });
    showTopUsers();
  }
});

function showFollowingUsers(uids) {
  followingUsersDiv.innerHTML = "";

  if (!uids || uids.length === 0) {
    followingUsersDiv.innerHTML = "<h1>You are not following anyone.</h1>";
    return;
  }

  uids.forEach((uid) => {
    firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          let card = document.createElement("div");
          card.classList.add("card");
          card.innerHTML = `
            <div class="card-image">
            <img src="${userData["profile-img"]}" alt="Profile image" />
            </div>
            <p class="name">${userData["first-name"]} ${userData["last-name"]}</p>
            <h4 class="followers">${userData["follower-count"]} Followers</h4>
            <p>${userData["profile-title"]}</p>
            `;
          card.addEventListener("click", () => {
            window.location.href = `../profile/user-profile.html?uid=${userData["uid"]}`;
          });
          followingUsersDiv.appendChild(card);
        }
      });
  });
}

function showTopUsers() {
  firebase
    .firestore()
    .collection("users")
    .orderBy("follower-count", "desc")
    .onSnapshot((users) => {
      topUsersDiv.innerHTML = "";
      users.forEach((user) => {
        let card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
        <div class="card-image">
        <img src="${user.data()["profile-img"]}" alt="Profile image" />
        </div>
        <p class="name">${
          user.data()["first-name"] + " " + user.data()["last-name"]
        }</p>
        <h4 class="followers">${user.data()["follower-count"]} Followers</h4>
        <p>${user.data()["profile-title"]}</p>
        `;
        card.addEventListener("click", () => {
          window.location.href = `../profile/user-profile.html?uid=${
            user.data()["uid"]
          }`;
        });
        topUsersDiv.appendChild(card);
      });
    });
}
