// Example of fetching with Role-Based Authorization
const loggedInUser = JSON.parse(localStorage.getItem("user"));

fetch("http://localhost:5000/users", {
  headers: {
    "x-user-role": loggedInUser ? loggedInUser.role : "Guest"
  }
})
  .then(res => res.json())
  .then(data => {
    console.log(data);

    const list = document.getElementById("userList");

    data.forEach(user => {
      const li = document.createElement("li");
      li.textContent = user.name + " - " + user.email;
      list.appendChild(li);
    });
  })
  .catch(err => console.log(err));