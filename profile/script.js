const inputFields = document.querySelectorAll(".input-field");
inputFields.forEach((field) => {
  field.setAttribute("disabled", "true");
});

const followBtn = document.querySelector(".follow-btn");
const followerCnt = document.querySelector(".followers-btn span");
const followingCnt = document.querySelector(".following-btn span");

const postsDiv = document.querySelector(".posts");

const deleteBtn = document.querySelector(".delete-btn");

const urlParams = new URLSearchParams(window.location.search);
let urlUid = urlParams.get("uid");
let uid;
let userData;
let selfData;

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    if (user.uid == urlUid) window.location.replace("../profile");
    uid = urlUid ? urlUid : user.uid;

    firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot((data) => {
        selfData = data.data();
        firebase
          .firestore()
          .collection("users")
          .doc(uid)
          .onSnapshot((data) => {
            userData = data.data();
            if (selfData.role == "admin" && deleteBtn)
              addDeleteFeature(userData.uid, userData);
            populateForm(data.data());
            showPosts(uid);
          });
      });
  } else {
    // window.location.assign("../index.html");
  }
});

function addDeleteFeature(uid, user) {
  deleteBtn.style.display = "flex";

  deleteBtn.addEventListener("click", () => {
    firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .delete()
      .then(() => {
        firebase
          .firestore()
          .collection("posts")
          .where("uid", "==", uid)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              doc.ref.delete().then(() => {});
            });
          });
        const secondaryApp = firebase.initializeApp(
          firebaseConfig,
          "Secondary"
        );
        secondaryApp
          .auth()
          .signInWithEmailAndPassword(user.email, user.password)
          .then(() => {
            const userInFirebaseAuth = secondaryApp.auth().currentUser;
            console.log(userInFirebaseAuth);
            userInFirebaseAuth.delete();
            secondaryApp.auth().signOut();
            secondaryApp.delete();
            window.history.back();
          });
      })
      .catch((error) => {
        alert("Error occured while deleting:", error.message);
      });
  });
}

function populateForm(fieldKeyMap) {
  document.querySelector(".nav-link.active h4").innerText =
    fieldKeyMap["first-name"];

  document.querySelector(".profile-img img").src = fieldKeyMap["profile-img"];
  document.querySelector(".portfolio-container iframe").src =
    fieldKeyMap["portfolio"];

  for (let fieldId in fieldKeyMap) {
    if (document.getElementById(fieldId)) {
      document.getElementById(fieldId).value = fieldKeyMap[fieldId];
    }
  }

  const shareBtn = document.querySelector(".share-btn");
  shareBtn.addEventListener("click", () => {
    const shareData = {
      title: `See ${fieldKeyMap["first-name"]} on DevoHub.`,
      text: fieldKeyMap["user-bio"],
      url: urlUid
        ? window.location.href
        : window.location.href +
          `./user-profile.html?uid=${fieldKeyMap["uid"]}`,
    };
    navigator.share(shareData);
  });

  for (let follower = 0; follower < fieldKeyMap["follower-count"]; follower++) {
    if (fieldKeyMap["followers"][follower] == selfData["uid"]) {
      followBtn.classList.add("followed");
      break;
    }
  }

  followerCnt.innerText = fieldKeyMap["follower-count"];
  followingCnt.innerText = fieldKeyMap["following-count"];
}

followBtn?.addEventListener("click", () => {
  let followed = false;
  for (let follower = 0; follower < userData["follower-count"]; follower++) {
    if (userData["followers"][follower] == selfData["uid"]) {
      followed = true;
      userData["followers"].splice(follower, 1);
      selfData["following"] = selfData["following"].filter(
        (id) => id !== userData["uid"]
      );
      followBtn.classList.remove("followed");
      break;
    }
  }
  if (!followed) {
    followBtn.classList.add("followed");
    userData["followers"].push(selfData["uid"]);
    selfData["following"].push(userData["uid"]);
  }
  firebase.firestore().collection("users").doc(uid).update({
    followers: userData["followers"],
    "follower-count": userData["followers"].length,
  });
  firebase.firestore().collection("users").doc(selfData["uid"]).update({
    following: selfData["following"],
    "following-count": selfData["following"].length,
  });
});

const viewPortfolioBtn = document.querySelector(".portfolio-btn");
const closePortfolioBtn = document.querySelector(".portfolio-close-btn");
const portfolioContainer = document.querySelector(".portfolio-container");

viewPortfolioBtn.addEventListener("click", () => {
  toggleActive(portfolioContainer);
});

closePortfolioBtn.addEventListener("click", () => {
  toggleActive(portfolioContainer);
});

const viewPostsBtn = document.querySelector(".posts-btn");
const closePostsBtn = document.querySelector(".posts-close-btn");
const postsContainer = document.querySelector(".posts-container");

viewPostsBtn.addEventListener("click", () => {
  toggleActive(postsContainer);
});

closePostsBtn.addEventListener("click", () => {
  toggleActive(postsContainer);
});

function toggleActive(element) {
  element.classList.toggle("active");
}

function showPosts(query) {
  if (query) {
    firebase
      .firestore()
      .collection("posts")
      .where("uid", "==", query)
      .onSnapshot((posts) => {
        postsDiv.innerHTML = "";
        if (posts.docs.length != 0) {
          posts.forEach((post) => {
            getPostCreater(post.data());
          });
        } else {
          postsDiv.innerHTML = "<h1>No posts</h1>";
        }
      });
  }

  function getPostCreater(postData) {
    firebase
      .firestore()
      .collection("users")
      .doc(postData.uid)
      .onSnapshot((user) => {
        addPostCard(user.data(), postData);
      });
  }

  function addPostCard(userData, postData) {
    let postCard = document.createElement("div");
    postCard.classList.add("post-container");
    postCard.addEventListener("click", () => {
      expandPost(postData.id);
    });
    let isLiked = false;

    for (let likeIndex = 0; likeIndex < postData["likes"].length; likeIndex++) {
      if (postData["likes"][likeIndex] === uid) {
        isLiked = true;
      }
    }

    postCard.innerHTML = `
    <div class="top-row">
      <div class="dp-name">
        <img src="${userData["profile-img"]}" />
        <h3>${userData["first-name"]} ${
      userData["last-name"] ? userData["last-name"][0] + "..." : ""
    }</h3>
      </div>
      <div class="category">${postData["category"]}</div>
    </div>
    <div class="main-img">
      <img src="${postData["imgURL"]}" alt="post" />
    </div>
    <div class="down-row">
      <h4 class="title">
      ${postData["title"]}
      </h4>
      <div class="likes ${isLiked ? "liked" : ""}">
        <span class="material-symbols-outlined l-span"> relax </span>
        <span class="material-symbols-outlined n-span"> favorite </span>${
          postData["likes"].length
        }
      </div>
    </div>
    `;
    postsDiv.appendChild(postCard);
  }
  function expandPost(id) {
    window.location = "../post/index.html?id=" + id;
  }
}
