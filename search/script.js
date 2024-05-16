firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    showUsers(getSearchQuery());
  } else {
    // window.location.assign("../index.html");
  }
});

const usersDiv = document.querySelector(".users");

function getSearchQuery() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get("search") || "";
}

function showUsers(searchText = "") {
  document.getElementById("search-box").value = searchText;
  if (searchText == "") return;
  firebase
    .firestore()
    .collection("users")
    .orderBy("follower-count", "desc")
    .onSnapshot((querySnapshot) => {
      let usersFound = false;
      usersDiv.innerHTML = "";
      querySnapshot.forEach((doc) => {
        const user = doc.data();
        const name = user["first-name"] + " " + user["last-name"];
        console.log(name.toLowerCase());
        if (name.toLowerCase().includes(searchText.toLowerCase())) {
          usersFound = true;
          let card = document.createElement("div");
          card.classList.add("card");
          card.innerHTML = `
                      <div class="card-image">
                          <img src="${user["profile-img"]}" alt="Profile image" />
                      </div>
                      <p class="name">${name}</p>
                      <h4 class="followers">${user["follower-count"]} Followers</h4>
                      <p>${user["profile-title"]}</p>
                  `;
          card.addEventListener("click", () => {
            window.location.href = `../profile/user-profile.html?uid=${user["uid"]}`;
          });
          usersDiv.appendChild(card);
        }
      });
      if (!usersFound) {
        usersDiv.innerHTML = "<h1>No results found</h1>";
      }
    });
}
