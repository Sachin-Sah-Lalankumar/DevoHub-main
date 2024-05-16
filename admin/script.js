firebase
  .firestore()
  .collection("users")
  .onSnapshot((users) => {
    document.querySelector(".users h1").innerText = users.size;
  });

firebase
  .firestore()
  .collection("posts")
  .onSnapshot((posts) => {
    document.querySelector(".posts h1").innerText = posts.size;
  });
