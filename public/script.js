

const signInBtn = document.querySelector('#signInBtn')
const signUpBtn = document.querySelector('#signUpBtn')

const signInForm = document.querySelector('#signInForm')
const signUpForm = document.querySelector('#signUpForm')
const signInUserName = document.querySelector("#userName")
const signInPassword = document.querySelector("#password")
const signInSubmitBtn = document.querySelector('#signInSubmitBtn')
const signUpSubmitBtn = document.querySelector('#signUpSubmitBtn')
const fullName = document.querySelector('#fullName')
const newUserName = document.querySelector('#newUserName')
const newPassword = document.querySelector('#newPassword')
const email = document.querySelector('#email')



function showToast(message) {
  const toast = document.getElementById('toast-notification');
  
 
  toast.innerText = message;
  
 
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10); 
 
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 500);  
  }, 4000);
}
    


function showWarning(message) {
  const toast = document.getElementById('warning-notification');
  
 
  toast.innerText = message;
  
 
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10); 
 
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 500);  
  }, 4000);
}

//  button-toggle
signInBtn.addEventListener('click', () => {
    signInForm.classList.remove('hidden');
    signInBtn.classList.add('bg-white');

    signUpForm.classList.add('hidden')
    signUpBtn.classList.remove('bg-white')
})
signUpBtn.addEventListener('click', () => {
    signUpForm.classList.remove('hidden')
    signUpBtn.classList.add('bg-white')

    signInForm.classList.add('hidden')
    signInBtn.classList.remove('bg-white')
})



// posting data to backened for signIn
signInSubmitBtn.addEventListener('click', (e) => {
    e.preventDefault()

    let userInfo = {
        'userName': signInUserName.value,
        'password': signInPassword.value
    }

    function func_wrapper() {

        if (!signInUserName.value) {
            signInUserName.classList.remove('border-slate-300')
            signInUserName.classList.add('border-red-600')
            showWarning("Enter username")
            return;
        }
        if (!signInPassword.value) {
            signInPassword.classList.remove('border-slate-300')
            signInPassword.classList.add('border-red-600')
            showWarning("Enter password")

            return;
        }
        async function sendInfo() {
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify(userInfo)
            }
            let data = await fetch('/signIn', options)
            let response = await data.json();

            if (response.token) {

                localStorage.setItem('myAppToken', response.token)
                window.location.href = response.redirect;

            } else {
                showWarning(response.error)
                signInUserName.classList.remove('border-slate-300')
                signInUserName.classList.add('border-red-600')
                signInPassword.classList.remove('border-slate-300')
                signInPassword.classList.add('border-red-600')
            }


        }
        sendInfo()


    }
    func_wrapper();





})


//posting data to backened for signUp

signUpSubmitBtn.addEventListener('click', (e) => {
    e.preventDefault();

    let userInfo = {
        'fullName': fullName.value,
        'userName': newUserName.value,
        'password': newPassword.value,
        'email': email.value,
    }



    function func_wrapper() {
        if (!fullName.value) {
            fullName.classList.remove('border-slate-300')
            fullName.classList.add('border-red-600')
            showWarning("Enter fullname")

            return;
        }
        if (!newUserName.value) {
            newUserName.classList.remove('border-slate-300')
            newUserName.classList.add('border-red-600')
            showWarning("Enter username")

            return;
        }
        if (!newPassword.value) {
            newPassword.classList.remove('border-slate-300')
            newPassword.classList.add('border-red-600')
            showWarning("Enter password")

            return;
        }
        if (!email.value) {
            email.classList.remove('border-slate-300')
            email.classList.add('border-red-600')
            showWarning("Enter email")

            return;
        }

        async function sendInfo() {
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userInfo)
            }
            signUpSubmitBtn.value = "Signing Up"
            signUpSubmitBtn.disabled = true;
            let data = await fetch('/signUp', options)


            let response = await data.json();
            if (data.ok) {
                console.log(response)
           showToast(response.message)


                signUpSubmitBtn.value = 'Sign Up';
                signUpSubmitBtn.disabled = false;
                fullName.value = '';
                newUserName.value = '';
                newPassword.value = '';
                email.value = '';

            } else {
                
                showWarning(response.error)
                console.log(response.error)
                if (response.status == 409) {
                    newUserName.classList.remove('border-slate-300')
                    newUserName.classList.add('border-red-600')

                }
                signUpSubmitBtn.value = 'Sign Up'
                signUpSubmitBtn.disabled = false;

            }

        }
        sendInfo();
    }

    func_wrapper()

})


//removing the border red and setting it to gray again
fullName.addEventListener('click', () => {
    fullName.classList.remove('border-red-600')
    fullName.classList.add('border-slate-300')
})

newUserName.addEventListener('click', () => {
    newUserName.classList.remove('border-red-600')
    newUserName.classList.add('border-slate-300')
})

email.addEventListener('click', () => {
    email.classList.remove('border-red-600')
    email.classList.add('border-slate-300')
})

newPassword.addEventListener('click', () => {
    newPassword.classList.remove('border-red-600')
    newPassword.classList.add('border-slate-300')
})
signInPassword.addEventListener('click', () => {
    signInPassword.classList.remove('border-red-600')
    signInPassword.classList.add('border-slate-300')
})
signInUserName.addEventListener('click', () => {
    signInUserName.classList.remove('border-red-600')
    signInUserName.classList.add('border-slate-300')
})

