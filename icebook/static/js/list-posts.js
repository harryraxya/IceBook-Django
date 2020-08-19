import { iconClassNames } from './variables.js';

const getPosts  = async () => {
    try{
        let res = await fetch("/api/posts");
        let posts = await res.json();
        return posts;
    } catch(error){
        alert(error);
    }
}

const generatePostHTML = post => {
    const postedOn = new Date(post.created).toDateString().replace(" ", ", ");
    var md = window.markdownit();
    const html = `
    <article class="post-container">
        <section class="user-details">
            <div class="user-profile-pic">
                <img src="${post.user.profile_picture_url}" alt="User-img" height=50" width="50">
            </div>
            <div class="user-data">
                <h4 class="author-name">${post.user.username}</h4>
                <small>Posted On: ${postedOn}</small>
            </div>
        </section>
        <section class="post-data">
            <div class="markdown">
                <h2 class="post-title"><a href="#">${post.title}</a></h2>
                ${md.render(post.description)}
            </div>
        </section>
        <section class="social-btns">

            <span class="likes-no">${post.likes.length}</span><button type="button" class="social-btn like-btn"><i class="far fa-thumbs-up ${post.has_liked ? 'liked' : 'not-liked'}" data-id="${post.id}"></i></button>

            <span class="comments-no">${Object.keys(post.comments).length}</span><button type="button" class="social-btn comment-btn"><i class="far fa-comment" data-id="${post.id}"></i></button>

        </section>
    </article>
    `;
    return html;
}

getPosts().then(posts => {
    posts.forEach(post => {
        const postHTML = generatePostHTML(post);
        const postsDiv = document.querySelector(".posts");
        postsDiv.insertAdjacentHTML('beforeend', postHTML);
    })
    const likeBtns = document.querySelectorAll(".social-btn.like-btn i");
    const commentBtns = document.querySelectorAll(".social-btn.comment-btn i");
    likeBtns.forEach(btn => btn.addEventListener("click", toggleLike))
    commentBtns.forEach(btn => btn.addEventListener("click", e => viewComments(e, posts)))
})

const toggleLike = async (e) => {
    const postID = e.target.getAttribute("data-id");
    try{
        const response = await fetch(`/api/toggle-like/${postID}`);
        const result = await response.json();
        e.target.classList.toggle(iconClassNames.likedToggle);
        const likesNumSpan = document.querySelector(".likes-no");
    
        if (result.has_liked){
            likesNumSpan.innerText = +likesNumSpan.innerText + 1;
        }else{
            likesNumSpan.innerText = +likesNumSpan.innerText - 1;
        }
    }catch(error){
        alert(error)
    }
}

const viewComments = (e, posts) => {
    const commentsSection = document.querySelector(".comments-section");
    const postID = e.target.getAttribute("data-id");
    const postComments = posts.find(element => element.id == postID).comments;
    for (const [user, comment] of Object.entries(postComments)){
        const commentHTML = getCommentHTML(user, comment)
        commentsSection.insertAdjacentHTML('beforeend', commentHTML);
    }

    

    const commentsDiv = document.querySelector(".post-comments")
    commentsDiv.classList.add("comments-slide")

    const commentForm = document.querySelector(".add-comment-form")
    commentForm.addEventListener("submit", e => {
        e.preventDefault();
        const commentInputField = document.querySelector(".comment-input");
        const commentValue = commentInputField.value;
        commentInputField.value = "";
        postComment(commentValue, postID, commentsSection);
    })

    const exitBtn = document.querySelector(".exit-btn")
    exitBtn.addEventListener("click", e => {
        commentsSection.innerHTML = ""
        commentsDiv.classList.remove("comments-slide")
    })
}

const getCommentHTML = (user, comment) => {
    return `
    <div class="comment-container">
        <div class="comment">
            <h3 class="author-name">${user}</h3>
            <p>${comment}</p>
        </div>
    </div>
    `
}

const postComment = async (comment, postID, commentsSection) => {
    const csrfToken = document.cookie.split(";").map(el => el.split("=")).find(element => {
        if (element[0] === "csrftoken"){
            return element
        }
    })[1];
    const response = await fetch("/api/add-comment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({newComment: comment, postID: postID})
    })
    const result = await response.json()
    
    const user = result.user

    const commentHTML = getCommentHTML(user, comment)
    commentsSection.insertAdjacentHTML("afterbegin", commentHTML)

    
}