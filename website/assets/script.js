const email = document.getElementById('email')
const password = document.getElementById('password')
const login = document.getElementById('login')
const myStorage = window.localStorage
const botLogin = document.getElementById('botLogin')
const botApp = document.getElementById('botApp')
const logout = document.getElementById('logout')
const myProfile = document.getElementById('myProfile')
const botEditProfile = document.getElementById('botEditProfile')
const back = document.getElementById('goBack')
const editNumber = document.getElementById('editNumber')
const submitNumber = document.getElementById('submitNumber')
const newNumber = document.getElementById('newNumber')
const dataField = document.getElementById('dataField')
const checkbox = document.getElementById('checkbox')
const accordion = document.getElementById('accordion')
let userID
let userPhoneNumber = document.getElementById('userPhoneNumber')
let userEmail = document.getElementById('userEmail')
let accountName = document.querySelectorAll('.account-name')
let accountRole = document.querySelectorAll('.account-role')



login.addEventListener('click', (e) => {
    if (!(login && password)) {
        alert('Provide both, Email and Password!')
    } else {
        const xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                const data = JSON.parse(xhttp.responseText)
                myStorage.setItem('currentUser', xhttp.responseText)

                loginSuccess()
                getData(data.userID)
                userID = data.userID
            }
            if (this.readyState == 4 && this.status > 400) {
                alert(`Login unsuccessful, error: ${this.status}`)
            }
        }
        xhttp.open('POST', 'http://127.0.0.1:8600/api/login')
        xhttp.setRequestHeader('Content-Type', 'application/json')
        const payload = {
            email: email.value,
            password: password.value
        }
        xhttp.send(JSON.stringify(payload))

    }
}, false)

logout.addEventListener('click', (e) => {
    myStorage.removeItem('currentUser')
    location.reload()
})

password.addEventListener("keyup", function (e) {
    if (e.keyCode === 13) {
        // event.preventDefault();
        login.click();
    }
})

function loginSuccess() {
    botLogin.classList.add('hidden')
    botApp.classList.remove('hidden')
    
}

myProfile.addEventListener('click', (e) => {
    botApp.classList.add('hidden')
    botEditProfile.classList.remove('hidden')
})

function getData(id) {
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const data = JSON.parse(xhttp.responseText)

            accountName.forEach((accName) => {
                accName.innerHTML = data.firstName + ' ' + data.lastName
            })
            accountRole.forEach((accRole) => {
                accRole.innerHTML = data.role.roleName
            })
            userEmail.innerHTML = data.email
            userPhoneNumber.innerHTML = data.phoneNumber

            readClasses(id)
            if (data.role.roleID == 1) {
                getStudents()
            } else {
                getAttendance(id)
            }

        }
        if (this.readyState == 4 && this.status > 400) {
            alert(`error: ${this.status}`)
        }
    }
    xhttp.open('GET', `http://127.0.0.1:8600/api/users/${id}`);
    xhttp.setRequestHeader('x-authentication-token', JSON.parse(myStorage.getItem('currentUser')).token);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(id))

}


back.addEventListener('click', (e) => {
    botApp.classList.remove('hidden')
    botEditProfile.classList.add('hidden')
    const bla = document.querySelector('.toggler')
    bla.checked = false
})





editNumber.addEventListener('click', (e) => {
    submitNumber.classList.remove('hidden')
    newNumber.classList.remove('hidden')
    editNumber.classList.add('hidden')
    userPhoneNumber.classList.add('hidden')
})

submitNumber.addEventListener('click', (e) => {
    submitNumber.classList.add('hidden')
    newNumber.classList.add('hidden')
    editNumber.classList.remove('hidden')
    userPhoneNumber.classList.remove('hidden')
    // userPhoneNumber.innerHTML = newNumber.value
    phoneNumber =
    {
        phoneNumber: newNumber.value
    }

    newNumber.value = null

    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const data = JSON.parse(xhttp.responseText)
            userPhoneNumber.innerHTML = data.phoneNumber
        }
        if (this.readyState == 4 && this.status > 400) {
            alert(`error: ${this.status}`)
        }
    }
    xhttp.open('PATCH', `http://127.0.0.1:8600/api/users/${userID}`);
    xhttp.setRequestHeader('x-authentication-token', JSON.parse(myStorage.getItem('currentUser')).token);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(phoneNumber))
})

function readClasses(id) {
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const data = JSON.parse(xhttp.responseText)
            data.forEach((classs) => {
                const cardWrapDiv = document.createElement('div')
                cardWrapDiv.classList.add('card')
                cardWrapDiv.dataset.classid = classs.classID
                accordion.appendChild(cardWrapDiv)

                const cardHeader = document.createElement('div')
                cardHeader.classList.add('card-header')
                cardWrapDiv.appendChild(cardHeader)

                const classButton = document.createElement('button')
                classButton.classList.add('btn', 'btn-link')
                classButton.dataset.toggle = 'collapse'
                classButton.dataset.target = `#class${classs.classID}`
                classButton.innerHTML = classs.className
                cardHeader.appendChild(classButton)

                const studentList = document.createElement('div')
                studentList.id = `class${classs.classID}`
                studentList.classList.add('collapse')
                studentList.dataset.parent = '#accordion'
                cardWrapDiv.appendChild(studentList)

                if (id > 3) {
                    const pieChart = document.createElement('div')
                    pieChart.id = `piechart${classs.classID}`
                    studentList.appendChild(pieChart)
                }
            })

        }
        if (this.readyState == 4 && this.status > 400) {
            alert(`error: ${this.status}`)
        }
    }
    xhttp.open('GET', `http://127.0.0.1:8600/api/class/${id}`);
    xhttp.setRequestHeader('x-authentication-token', JSON.parse(myStorage.getItem('currentUser')).token);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send()
}

function getStudents() {
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const data = JSON.parse(xhttp.responseText)

            studentList = document.querySelector('.collapse')
            data.forEach((student) => {
                const studentWrapDiv = document.createElement('div')
                studentWrapDiv.id = 'dataField'
                studentWrapDiv.classList.add('card-body', 'd-flex')
                studentList.appendChild(studentWrapDiv)

                const studentName = document.createElement('p')
                studentName.classList.add('pr-5')
                studentName.innerHTML = student.firstName + ' ' + student.lastName
                studentWrapDiv.appendChild(studentName)

                const checkWrapperDiv = document.createElement('label')
                checkWrapperDiv.classList.add('switch')
                studentWrapDiv.appendChild(checkWrapperDiv)

                const checkbox = document.createElement('input')
                checkbox.id = 'checkbox'
                checkbox.type = 'checkbox'
                checkbox.dataset.id = `${student.userID}`
                checkWrapperDiv.appendChild(checkbox)

                const slider = document.createElement('span')
                slider.classList.add('slider', 'round')
                checkWrapperDiv.appendChild(slider)
            })

            const studentDiv = document.querySelector('.collapse')
            const submitAttendance = document.createElement('button')
            submitAttendance.classList.add('submitAttendance')
            submitAttendance.innerHTML = 'Submit Attendance'
            studentDiv.appendChild(submitAttendance)

            attendanceData = document.querySelectorAll('[data-id]')
            attendancePayload = []

            submitAttendance.addEventListener('click', (e) => {
                attendanceData.forEach((studentRecord) => {
                    let present = 0
                    if (studentRecord.checked) {
                        present = 1
                    }
                    const studentData = {
                        id: studentRecord.dataset.id,
                        present: present
                    }
                    attendancePayload.push(studentData)
                })
                console.log(attendancePayload)

                const classID = document.querySelector('[data-classid]')
                const classIdValue = classID.dataset.classid
                sendAttendance(classIdValue , attendancePayload)
            })
        }
        if (this.readyState == 4 && this.status > 400) {
            alert(`error: ${this.status}`)
        }
    }
    xhttp.open('GET', `http://127.0.0.1:8600/api/students`);
    xhttp.setRequestHeader('x-authentication-token', JSON.parse(myStorage.getItem('currentUser')).token);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send()
}


function sendAttendance(classID, payload){
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // const data = JSON.parse(xhttp.responseText)
            
        }
        if (this.readyState == 4 && this.status > 400) {
            alert(`error: ${this.status}`)
        }
    }
    xhttp.open('POST', `http://127.0.0.1:8600/api/attendance/${classID}`);
    xhttp.setRequestHeader('x-authentication-token', JSON.parse(myStorage.getItem('currentUser')).token);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(payload))
}



function getAttendance(id){
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const data = JSON.parse(xhttp.responseText)
            // const class1 = getElementById('class')
            let x1, y1, x2, y2, x3, y3
            x1 = y1 = x2 = y2 = x3 = y3 = 0

            data.forEach((record) => {
                console.log(record)
                recordWrapDiv = document.getElementById(`class${record.classID}`)
                if (record.classID == 1) {
                    if (record.present == 1) {
                        x1++
                    } else {
                        y1++
                    }
                }
                if (record.classID == 2) {
                    if (record.present == 1) {
                        x2++
                    } else {
                        y2++
                    }
                }
                if (record.classID == 3) {
                    if (record.present == 1) {
                        x3++
                    } else {
                        y3++
                    }
                }

            })
            drawChart(x1, y1, x2, y2, x3, y3)
        }
        if (this.readyState == 4 && this.status > 400) {
            alert(`error: ${this.status}`)
        }
    }
    xhttp.open('GET', `http://127.0.0.1:8600/api/attendance/${id}`);
    xhttp.setRequestHeader('x-authentication-token', JSON.parse(myStorage.getItem('currentUser')).token);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send()

}



// Load google charts
google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

// Draw the chart and set the chart values
function drawChart(x1, y1, x2, y2, x3, y3) {
    var data1 = google.visualization.arrayToDataTable([
        ['Attendance', 'Count'],
        ['Present', x1],
        ['Absent', y1],
    ]);
    var data2 = google.visualization.arrayToDataTable([
        ['Attendance', 'Count'],
        ['Present', x2],
        ['Absent', y2],
    ]);
    var data3 = google.visualization.arrayToDataTable([
        ['Attendance', 'Count'],
        ['Present', x3],
        ['Absent', y3],
    ]);

    // Display the chart inside the <div> element with id="piechart"
    var chart1 = new google.visualization.PieChart(document.getElementById('piechart1'));
    var chart2 = new google.visualization.PieChart(document.getElementById('piechart2'));
    var chart3 = new google.visualization.PieChart(document.getElementById('piechart3'));
    chart1.draw(data1);
    chart2.draw(data2);
    chart3.draw(data3);
}

/*  function for date JS
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;
    document.write(today);

    function for date SQL
    INSERT INTO t1 (dateposted) VALUES ( NOW() )
    // Yes, you use the same NOW() without the quotes.
    // Because your datatype is set to DATE it will insert only the date
    */
