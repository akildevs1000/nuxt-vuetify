var myHeaders = new Headers();
myHeaders.append("token", "4fa25eb27e254ffdbfb53181cb648090");

var formdata = new FormData();
formdata.append("name", "Francis");
formdata.append("photos", "https://backend.eztime.online/media/employee/profile_picture/1693828060.jpg");
formdata.append("store", "1");
formdata.append("collections", "Employees");

var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow'
};

fetch("https://api.luxand.cloud/v2/person", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));