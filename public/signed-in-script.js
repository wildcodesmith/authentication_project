const token = localStorage.getItem('myAppToken')

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

            if (!data.ok) {
                let response = await data.json();
                localStorage.removeItem('myAppToken');
                window.location.href = '/'

            } else {
                console.log('successful')
            }

        }
        getting_data();
    } catch (error) {
        console.log('error loading dashboard')
    }
}