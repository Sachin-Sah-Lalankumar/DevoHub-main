// API LINKS >> https://docs.github.com/en/rest/repos/autolinks?apiVersion=2022-11-28

// Using axios to fetch api
// now we are able to reach post and get

const APIURL = "https://api.github.com/users/";

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");

async function getUser(username) {
  // When we have a promise "request" >> we can use then as another solving technique
  try {
    const { data } = await axios(APIURL + username);
    // console.log(res.data)
    // data which is user data
    createUserCard(data);
    getRepos(username);
  } catch (err) {
    if (err.response.status == 404) {
      // Put a message in here
      createErrorCard("No profile with this username");
    }
    //console.log(err)
  }
}

// Function to get repository
async function getRepos(username) {
  try {
    const { data } = await axios(APIURL + username + "/repos?sort=created");

    addReposeToCard(data);
  } catch (err) {
    createErrorCard("Problem fetching repos");
  }
}

function createUserCard(user) {
  //We can add these extra 2 information of the user
  const userID = user.name || user.login;
  const userBio = user.bio ? `<p>${user.bio}</p>` : "";

  // Grab this from main html
  const cardHTML = `
    <div class="card">
    <div>
      <img src="${user.avatar_url}" alt="${user.name}" class="avatar">
    </div>
    <div class="user-info">
        <h2>${userID}<a href="${user.html_url}" target="_blank" class="goto"><span class="material-symbols-outlined">
        more_up
        </span></a></h2>
      ${userBio}
      <ul>
        <li>${user.followers} <strong>Followers</strong></li>
        <li>${user.following} <strong>Following</strong></li>
        <li>${user.public_repos} <strong>Repos</strong></li>
      </ul>
      <div id="repos"></div>
    </div>
  </div>
    `;
  main.innerHTML = cardHTML;
}

function createErrorCard(message) {
  const cardHTML = `
    <div class="card">
    <h1>${message}</h1>
    </div>
    `;
  main.innerHTML = cardHTML;
}

function addReposeToCard(repos) {
  const reposEl = document.getElementById("repos");

  // Let's get 10 of repositories
  //getting latest 5 projects
  //added sort top getRepos
  repos.slice(0, 10).forEach((repo) => {
    const repoEl = document.createElement("a");

    // add class of repo
    //for each one
    repoEl.classList.add("repo");
    repoEl.href = repo.html_url;
    repoEl.target = "_blank";
    repoEl.innerText = repo.name;

    // For each repo save that element
    reposEl.appendChild(repoEl);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  // Prevent default behaviour

  const user = search.value;

  if (user) {
    getUser(user);

    // Clear search value
    search.value = "";
  }
});
