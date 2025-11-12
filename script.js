const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registration_form");
const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");
const profileDiv = document.getElementById("userInfo");
const profileBtn = document.getElementById("ProfileBtn");

loginForm.addEventListener('submit', async(e) =>{
    e.preventDefault();
    const data = {
        username: loginForm.username.value,
        password: loginForm.password.value
    };
    try
    {
        const result = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers:{
            "content-type": "application/json"
        },
        body: JSON.stringify(data)
        });
        const res = await result.json();
        loginMessage.textContent = res.token || res.message || res.error;
        if(res.token) // save JWT in localStorage
            localStorage.setItem("token", res.token);
    }
    catch (err){
        loginMessage.textContent = "network error";
    }
    });

registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = {
        username: registerForm.username.value,
        password: registerForm.password.value
    };
    const result = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers:{
            "content-type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const res = await result.json();
    registerMessage.textContent = res.token || res.message || res.error;
});

profileBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    // send a request to fill profile data.
    const jwt = localStorage.getItem('token');
    if (jwt === null || jwt === undefined)
    {
        console.log(`empty jwt`);
        profileDiv.innerHTML = `<p><strong>Empty JWT value please
         log in first</strong></p>`;
        return ;
    }
    else
    {
        console.log('hi');
    }
        const result = await fetch("http://localhost:3000/profile",{
        method: "GET",
        headers:{
            "content-type": "application/json",
            'authorization': `Bearer ${jwt}`
        }});
    const res = await result.json();
    if (res.error)
    {
        profileDiv.innerHTML = `<p><strong>Invalid JWT token</strong></p>`;
    }
    else if (res.message)
    {
        profileDiv.innerHTML = `<p><strong>Valid JWT token</strong></p>
        <p><strong>Id : </strong> ${res.user.id}</p>
        <p><strong>username: </strong>${res.user.username}</p>`
    }
    });
