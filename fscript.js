const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registration_form");
const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");
const profileDiv = document.getElementById("userInfo");
const profileBtn = document.getElementById("ProfileBtn");

loginForm.addEventListener('submit', async(e) =>{
    e.preventDefault();
    const data = {
        email: loginForm.email.value,
        password: loginForm.password.value
    };
    const result = await fetch('http://localhost:3000/login',{
        method: 'POST',
        headers:{
            'content-type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    const res = await result.json();
    // how to store cookie : it is stored by the browser.
    loginMessage.textContent = res.message || res.error;
});


registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('register form clicked');
    const data = {
        email: registerForm.email.value,
        password: registerForm.password.value
    };
    
    const result = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers:{
            "content-type": "application/json"
        },
        body: JSON.stringify(data),
    });
    
    const res = await result.json();
    registerMessage.textContent = res.message || res.error;
});

profileBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    // send a request to fill profile data.
    const result = await fetch("http://localhost:3000/profile",{
        method: "GET",
        headers:{
            "content-type": "application/json",
        }});
    const res = await result.json();
    if (res.error)
    {
        console.log(res.error);
        profileDiv.innerHTML = `<p><strong> ${res.error}</strong></p>`;
    }
    else if (res.message)
    {
        profileDiv.innerHTML = `<p><strong>${res.message}</strong></p>
        <p><strong>Id : </strong> ${res.user.id}</p>
        <p><strong>Email: </strong>${res.user.email}</p>`
    }
    });
