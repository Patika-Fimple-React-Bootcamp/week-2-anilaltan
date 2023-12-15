const postsContainer = document.getElementById("postsContainer");
const searchInput = document.getElementById("searchInput");
const loading = document.getElementById("loading");
const numberOfPosts = document.getElementById("numberOfPosts");

let posts;

const fetchPosts = async () => {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  return res.json();
};

const createPostCard = (post) => {
  const postCard = document.createElement("div");
  postCard.className = "post-card";

  const title = document.createElement("h2");
  title.textContent = post.title;
  title.className = "title";
  title.addEventListener("click", () => {
    viewComments(post.id);
  });

  const body = document.createElement("p");
  body.textContent = post.body;
  body.className = "card-body";

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "DELETE";
  deleteButton.className = "delete-button";
  deleteButton.addEventListener("click", () => deletePost(post.id));

  postCard.appendChild(title);
  postCard.appendChild(body);
  postCard.appendChild(deleteButton);

  return postCard;
};

const printPosts = (posts) => {
  numberOfPosts.innerHTML = `<p>Number Of Posts: ${posts.length}</p>`;
  postsContainer.innerHTML = "";
  posts.forEach((post) => {
    const postCard = createPostCard(post);
    postsContainer.appendChild(postCard);
  });
  loading.style.display = "none";
};

const createModal = () => {
  const modal = document.createElement("div");
  modal.className = "modal";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  const modalTitle = document.createElement("h1");
  modalTitle.className = "modal-title";

  const closeButton = document.createElement("span");
  closeButton.innerHTML = "&times;";
  closeButton.className = "close-button";
  closeButton.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  modalContent.appendChild(closeButton);
  modalContent.appendChild(modalTitle);
  modal.appendChild(modalContent);

  return modal;
};

const deletePost = (postId) => {
  const postToDelete = posts.find((post) => post.id === postId);
  const modal = createModal();
  document.body.appendChild(modal);
  createConfirmDeleteModal(modal, postToDelete);
};

const createConfirmDeleteModal = (modal, postToDelete) => {
  modal.querySelector(".modal-title").innerText = "Delete Post";

  const modalBody = document.createElement("p");
  modalBody.innerText = "Are you sure you want to delete this post?";

  const buttonDiv = document.createElement("div");
  buttonDiv.className = "button-div";

  const cancelButton = document.createElement("button");
  cancelButton.innerText = "Cancel";
  cancelButton.className = "cancel-button";
  cancelButton.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  const confirmButton = document.createElement("button");
  confirmButton.innerText = "Delete";
  confirmButton.className = "confirm-button";
  confirmButton.addEventListener("click", () => {
    posts.splice(posts.indexOf(postToDelete), 1);
    searchInput.value = "";
    printPosts(posts);
    document.body.removeChild(modal);
  });

  buttonDiv.appendChild(cancelButton);
  buttonDiv.appendChild(confirmButton);
  modal.querySelector(".modal-content").appendChild(modalBody);
  modal.querySelector(".modal-content").appendChild(buttonDiv);
};

const viewComments = async (postId) => {
  const modal = createModal();
  document.body.appendChild(modal);

  try {
    modal.querySelector(".modal-title").innerText = "Post Comments:";
    const loadingMessage = document.createElement("p");
    loadingMessage.id = "loading";
    modal.querySelector(".modal-content").appendChild(loadingMessage);

    const res = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${postId}/comments`
    );
    const comments = await res.json();

    modal.querySelector(".modal-content").removeChild(loadingMessage);
    printComments(modal, comments);
  } catch (error) {
    modal.querySelector(".modal-content").removeChild(loadingMessage);
    const errorMessage = document.createElement("p");
    errorMessage.innerText = "Failed to load comments.";
    modal.querySelector(".modal-content").appendChild(errorMessage);
  }
};

const printComments = (modal, comments) => {
  const commentsList = document.createElement("ul");
  comments.forEach((comment) => {
    const commentItem = document.createElement("li");
    commentItem.textContent = comment.body;
    commentsList.appendChild(commentItem);
  });

  modal.querySelector(".modal-content").appendChild(commentsList);
};

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const init = async () => {
  const data = await fetchPosts();
  posts = JSON.parse(JSON.stringify(data));
  printPosts(posts);

  const debouncedSearch = debounce((searchTerm) => {
    if (searchTerm) {
      searchTerm = searchTerm.toLowerCase();
      const filteredPosts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm) ||
          post.body.toLowerCase().includes(searchTerm)
      );
      printPosts(filteredPosts);
    } else {
      printPosts(posts);
    }
  }, 400);

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value;
    debouncedSearch(searchTerm);
  });
};

init();
