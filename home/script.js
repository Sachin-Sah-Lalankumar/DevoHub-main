const followingUsersDiv = document.querySelector(".story-gallery");
const storiesDiv = document.querySelector(".story-gallery");
const categoryBar = document.querySelector(".category-bar");

storiesDiv.addEventListener("wheel", (evt) => {
  evt.preventDefault();
  storiesDiv.scrollLeft += evt.deltaY;
});
categoryBar.addEventListener("wheel", (evt) => {
  evt.preventDefault();
  categoryBar.scrollLeft += evt.deltaY;
});

const postsDiv = document.querySelector(".posts");

let uid;

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    uid = user.uid;
    firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .onSnapshot((data) => {
        showFollowingUsers(data.data().following, data.data());
        updateCPS(data.data());
        showPosts();
      });
  } else {
    // window.location.assign("../index.html");
  }
});

function showFollowingUsers(uids, loginUser) {
  followingUsersDiv.innerHTML = "";

  let card = document.createElement("div");
  card.classList.add("story");

  card.style.backgroundImage = `linear-gradient(transparent 70%, #0009), url(${loginUser["profile-img"]})`;
  card.style.marginInline = "10px";
  card.style.borderTop = "1px solid var(--accent-clr-2)";
  card.style.borderBottom = "1px solid var(--accent-clr)";

  card.innerHTML = `<p>You</p>`;
  card.addEventListener("click", () => {
    window.location.href = `../profile`;
  });
  followingUsersDiv.appendChild(card);

  if (!uids || uids.length === 0) {
    let text = document.createElement("h1");
    text.innerText = "You are not following anyone.";
    followingUsersDiv.append(text);
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
          card.classList.add("story");
          card.style.backgroundImage = `linear-gradient(transparent 70%, #0009), url(${userData["profile-img"]})`;
          card.innerHTML = `
            <p>${userData["first-name"]} ${userData["last-name"]}</p>
            `;
          card.addEventListener("click", () => {
            window.location.href = `../profile/user-profile.html?uid=${userData["uid"]}`;
          });
          followingUsersDiv.appendChild(card);
        }
      });
  });
}

function updateCPS(data) {
  document.getElementById("cps-dp").src = data["profile-img"];
  document.getElementById(
    "cps-username"
  ).innerText = `${data["first-name"]} ${data["last-name"]}`;
}

let curCategory = document.getElementById("trending");
function changeCategory(query) {
  if (query != "trending") showPosts(query);
  else showPosts();

  curCategory?.classList.remove("active");
  curCategory = document.getElementById(query);
  console.log(curCategory);
  curCategory.classList.add("active");
}

function showPosts(query = undefined) {
  if (query) {
    firebase
      .firestore()
      .collection("posts")
      .where("category", "==", query)
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
  } else {
    firebase
      .firestore()
      .collection("posts")
      .orderBy("date", "desc")
      .onSnapshot((posts) => {
        postsDiv.innerHTML = "";
        posts.forEach((post) => {
          getPostCreater(post.data());
        });
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
