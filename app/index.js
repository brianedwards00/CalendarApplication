// Global variables
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const calendar = document.getElementById('calendar')
const addEditor = document.getElementById('newEvent')
const deleteEditor = document.getElementById('deleteEvent')
const eventInput = document.getElementById('eventInput')
const eventStart = document.getElementById('eventStart')
const eventEnd = document.getElementById('eventEnd')
const eventDesc = document.getElementById('eventDesc')
const eventColor = document.getElementById('eventColor')
const backDrop = document.getElementById('backDrop')

const errors = ["Fill in all fields before saving.", "Start/end time range makes no sense"]
// Default (0) is current month
let month_pointer = 0
let global_event = null
let day_clicked = null
let events = localStorage.getItem('events')
if (events != null) {
    let temp_events = events
    events = JSON.parse(temp_events)
} else {
    events = []
}

function loadCalendar() {
    calendar.innerHTML = ''
    const date = new Date()
    date.setMonth(new Date().getMonth()+month_pointer)
    const month = date.getMonth()
    const day = date.getDate()
    const year = date.getFullYear()
    const numDays = new Date(year, month + 1, 0).getDate()
    const firstDayofMonth = new Date(year, month, 1).getDay()
    document.getElementById('monthName').innerText = `${months[month]} ${year}`

    // For each day of the month, create a day box and add any events it may have to it
    for(let i = 1; i <= firstDayofMonth + numDays; i++) {
        const dayContainer = document.createElement('div')
        dayContainer.classList.add('day')
        const dateString = `${months[month]}/${i-firstDayofMonth}/${year}`

        if (i > firstDayofMonth) {
            dayContainer.innerText = i - firstDayofMonth
            dayContainer.addEventListener('click', () => displayAddEvent(dateString))
            const eventsForDay = events.filter(event => event.date === dateString)
            eventsForDay.sort(function(a,b){
                return new Date('2022-01-01 '+a.start) - new Date('2022-01-01 '+b.start)
            })

            // Check for any events given a certain day
            if(eventsForDay.length > 0) {
                for(const event of eventsForDay) {
                    const eventDiv = document.createElement('div')
                    eventDiv.classList.add('event')
                    eventDiv.style.backgroundColor = event.color
                    eventDiv.innerText = event.title
                    eventDiv.addEventListener('click',function(e){
                        displayEvent(event)
                        e.cancelBubble = true
                    })
                    eventDiv.addEventListener('mouseenter', function(e){
                        eventDiv.style.backgroundColor = "black"
                        e.cancelBubble = true
                    })
                    eventDiv.addEventListener('mouseleave', function(e){
                        eventDiv.style.backgroundColor = event.color
                        e.cancelBubble = true
                    })
                    dayContainer.appendChild(eventDiv)
                }
            }
            if(month_pointer === 0 && i-firstDayofMonth === day) {
                dayContainer.id = 'currentDay'
            }
        } else {
            dayContainer.classList.add('padding')
        }
        calendar.appendChild(dayContainer)
    }
}

// Initialize buttons
function initBtns() {
    document.getElementById('btnPrevious').addEventListener('click', function(event) {
        month_pointer--
        loadCalendar()
    })
    document.getElementById('btnNext').addEventListener('click', function(event) {
        month_pointer++
        loadCalendar()
    })
    document.getElementById('btnSave').addEventListener('click', saveEvent)
    document.getElementById('btnCancel').addEventListener('click', removeBackDrop)
    document.getElementById('btnDelete').addEventListener('click', deleteEvent)
    document.getElementById('btnClose').addEventListener('click', removeBackDrop)
    document.getElementById('theme').addEventListener('click', function(event){
        if (event.target.value === "Gray") {
            document.getElementById("css").href = "gray.css"
            localStorage.setItem('theme', JSON.stringify({color:"gray"}))
        } else if (event.target.value === "Peach") {
            document.getElementById("css").href = "peach.css"
            localStorage.setItem('theme', JSON.stringify({color:"peach"}))
        }
    })
}

function displayAddEvent(date) {
    addEditor.style.display = 'block'
    backDrop.style.display = 'block'
    day_clicked = date
}

// Displaying an event in more detail
function displayEvent(event) {
    global_event = event
    const eventForDay = events.find(e => e === event)

    if (eventForDay) {
        document.getElementById('eventText').innerText = eventForDay.title
        let start_minutes = new Date('2022-01-01 '+eventForDay.start).getMinutes()
        let end_minutes = new Date('2022-01-01 '+eventForDay.end).getMinutes()

        if (String(start_minutes).length == 1) {
            start_minutes = "0"+String(start_minutes)[0]
        }

        if (String(end_minutes).length == 1) {
            end_minutes = "0"+String(end_minutes)[0]
        }

        document.getElementById('eventS').innerText = new Date('2022-01-01 '+eventForDay.start).toLocaleString("en-US",{hour:'numeric'}).split(" ")[0]
            +":"+ start_minutes
            + new Date('2022-01-01 '+eventForDay.start).toLocaleString("en-US",{hour:'numeric'}).split(" ")[1]
        document.getElementById('eventE').innerText = new Date('2022-01-01 '+eventForDay.end).toLocaleString("en-US",{hour:'numeric'}).split(" ")[0]
        +":"+ end_minutes
        + new Date('2022-01-01 '+eventForDay.end).toLocaleString("en-US",{hour:'numeric'}).split(" ")[1]
        deleteEditor.style.display = 'block'
        document.getElementById('eventD').innerText = eventForDay.description
    } else {
        addEditor.style.display = 'block'
    }
    backDrop.style.display = 'block'
}

function saveEvent() {
    date = day_clicked
    // Check if any errors are already being shown, delete them if they are shown
    if(errors.find(error => error === addEditor.lastChild.innerText)) {
        addEditor.removeChild(addEditor.lastChild)
        addEditor.removeChild(addEditor.lastChild)
        addEditor.removeChild(addEditor.lastChild)
    }
    
    // Ensuring user fills out required fields, error otherwise
    if (eventInput.value && eventStart.value && eventEnd.value) {
        if (new Date('2022-01-01 '+eventStart.value) >= new Date('2022-01-01 '+eventEnd.value)) {
            addEditor.appendChild(document.createElement('br'))
            addEditor.appendChild(document.createElement('br'))
            const error = document.createElement('div')
            error.id = "errorText"
            error.innerText = errors[1]
            addEditor.appendChild(error)
        } else {
            events.push({date:date, title:eventInput.value, start:eventStart.value,
                end: eventEnd.value, description: eventDesc.value, color: eventColor.value})
            localStorage.setItem('events', JSON.stringify(events))
            removeBackDrop()
        }
    } else {
        fieldsEmptyError = errors.find(error => error === addEditor.lastChild.innerText)
        if(fieldsEmptyError == undefined) {
            addEditor.appendChild(document.createElement('br'))
            addEditor.appendChild(document.createElement('br'))
            const error = document.createElement('div')
            error.id = "errorText"
            error.innerText = errors[0]
            addEditor.appendChild(error)
        }
    }
    document.getElementById('btnSave').removeEventListener('click',()=> saveEvent(date))
}


function removeBackDrop() {
    eventInput.classList.remove('error')
    eventInput.value = ''
    eventStart.value = ''
    eventEnd.value = ''
    eventDesc.value = ''
    addEditor.style.display = 'none'
    deleteEditor.style.display = 'none'
    backDrop.style.display = 'none'
    if(errors.find(error => error === addEditor.lastChild.innerText)) {
        addEditor.removeChild(addEditor.lastChild)
        addEditor.removeChild(addEditor.lastChild)
        addEditor.removeChild(addEditor.lastChild)
    }
    document.getElementById('btnSave').removeEventListener('click',()=> saveEvent(date))
    loadCalendar()
}


function deleteEvent() {
    events = events.filter(e => e !== global_event)
    localStorage.setItem('events',JSON.stringify(events))
    removeBackDrop()
}

loadCalendar()
initBtns()