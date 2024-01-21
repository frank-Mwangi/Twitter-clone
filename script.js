const bio = document.querySelector(".bio");
const select = document.querySelector(".searchfield");
const left = document.querySelector(".left");
const right = document.querySelector(".right");
const tweetContent = document.querySelector(".tweet-content");
let userData = [];

async function fetchUsers() {
  try {
    const storedUserData = localStorage.getItem("userData");
    const storedSelectedUserId = localStorage.getItem("selectedUserId");
    if (storedUserData) {
      userData = JSON.parse(storedUserData);
      populateSelectOptions(userData);
    } else {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users/"
      );
      userData = await response.json();
      localStorage.setItem("userData", JSON.stringify(userData));
      populateSelectOptions(userData);
    }

    if (storedSelectedUserId) {
      select.value = storedSelectedUserId;
      populateBio(userData[storedSelectedUserId - 1]);
      await fetchPosts(storedSelectedUserId);
      await fetchComments(1);
    } else {
      populateBio(userData[0]);
      await fetchPosts(1);
      await fetchComments(1);
    }
    select.addEventListener("input", async (e) => {
      const selectedUserId = e.target.value;
      localStorage.setItem("selectedUserId", selectedUserId);
      console.log(selectedUserId);

      const selectedUser = userData[selectedUserId - 1];
      //   console.log(selectedUser);
      populateBio(selectedUser);
      localStorage.removeItem("feed");
      await fetchPosts(selectedUserId);
    });
  } catch (error) {
    console.log(`Error fetching userData: ${error}`);
  }
}

const populateBio = (user) => {
  //console.log(user);
  const city = bio.querySelector(".city") || document.createElement("div");
  city.classList.add("city");

  const name = bio.querySelector(".name");
  const handle = bio.querySelector(".handle");
  const website = bio.querySelector(".website");
  const about = bio.querySelector(".about");
  const location = bio.querySelector(".location");

  name.textContent = user.name;
  handle.textContent = `@${user.username}`;
  website.textContent = user.website;
  about.textContent = user.company.catchPhrase;
  city.textContent = user.address.city;
  if (!bio.contains(city)) {
    location.appendChild(city);
  }
};

const populateSelectOptions = (userData) => {
  const users = [];
  for (const key in userData) {
    users.push(userData[key]);
  }

  //console.log(users);
  for (const user of users) {
    //console.log(user);
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = user.name;
    select.appendChild(option);
  }
};

const fetchPosts = async (id) => {
  try {
    const storedFeed = localStorage.getItem("feed");
    if (storedFeed) {
      feed = JSON.parse(storedFeed);
      populateFeed(feed);
      return;
    } else {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts?userId=${id}`
      );
      const feed = await response.json();
      //   console.log("Feed:" + feed);
      localStorage.setItem("feed", JSON.stringify(feed));
      populateFeed(feed);
    }
  } catch (error) {
    console.log(`Error fetching posts: ${error}`);
  }
};

const populateFeed = (feed) => {
  tweetContent.innerHTML = "";
  const tweets = left.querySelectorAll(".tweet");
  for (const tweet of tweets) {
    tweet.addEventListener("click", (e) => {
      console.log("tweet clicked!");
      const clickedTweet = e.target.closest(".tweet");
      console.log(clickedTweet);
      if (clickedTweet) {
        const postId = clickedTweet.Id;
        fetchComments(postId);
      } else {
        fetchComments(1);
      }
    });
  }
  const selectedUser = userData[select.value - 1];
  console.log(selectedUser);
  for (let i = 0; i < Math.min(tweets.length, feed.length); i++) {
    const tweet = tweets[i];
    const post = feed[i];
    console.log(post);
    tweet.querySelector(".name").textContent = selectedUser.name;
    tweet.querySelector(".tweet-content").textContent = post.body;
  }
};

const fetchComments = async (postId) => {
  try {
    const storedComments = localStorage.getItem(`comments_${postId}`);
    if (storedComments) {
      const comments = JSON.parse(storedComments);
      populateComments(comments);
    } else {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/comments?postId=${postId}`
      );
      const comments = await response.json();
      console.log(comments);
      localStorage.setItem(`comments_${postId}`, JSON.stringify(comments));
      populateComments(comments);
    }
  } catch (error) {
    console.log("Error fetching comments: " + error);
  }
};

const populateComments = (comments) => {
  const replies = right.querySelectorAll(".comment-content");

  for (let i = 0; i < Math.min(replies.length, comments.length); i++) {
    const reply = replies[i];
    const comment = comments[i];
    const commentTitle = reply.querySelector(".title");
    commentTitle.textContent = comment.name;
    reply.querySelector(".body").textContent = comment.body;
  }
};

window.addEventListener("DOMContentLoaded", async () => {
  await fetchUsers();
});
