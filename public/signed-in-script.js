const token = localStorage.getItem('myAppToken')
const logo = document.getElementById("logo")
const logoutButton = document.querySelector("#logoutButton")

if (!token) {
    window.location.href = '/'
} else {
    try {
        async function getting_data() {
            let options = {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            }
            let data = await fetch('/api/user-data', options)
            let response = await data.json();

            if (!data.ok) {
                let response = await data.json();
                localStorage.removeItem('myAppToken');
                window.location.href = '/'

            } else {
          
                let userNameDiv = document.createElement("div")
                let fullName = (response.fullName)[0].toUpperCase() + (response.fullName).slice(1)
                userNameDiv.innerText = `Welcome back! ${fullName}`
                userNameDiv.classList.add("text-4xl","text-center", "text-blue-500", "font-bold")
                logo.after(userNameDiv)

                
                
            }

        }
        getting_data();
    } catch (error) {
        console.log('error loading dashboard')
    }
}

logoutButton.addEventListener('click' , () => {
                    localStorage.removeItem('myAppToken')

                    window.location.href = '/'
                })
