let courseModalContainer = document.querySelector(".modal-details");
let courseContainers = document.querySelectorAll(".course");

// Attach a loadCourse onClick listener onto every course
courseContainers.forEach(function(course) {
    var courseID = course.getAttribute("data-course");

    course.addEventListener('click', function() {
        loadCourse(courseID);
    })
});

// Function to load a course from the API and show the modal
function loadCourse(courseID) {
    fetch("api/getCourseDetails.php?courseID=" + courseID)
        .then(function(response) {
            return response.json();
        })
        .then(function(courseData) {
            if(courseData.status[0] == 200) {
                constructModal(courseData);
                courseModalContainer.classList.add("open");
            }
        });
}

// Function to close the modal
function closeModal() {
    courseModalContainer.classList.remove("open");
}

// Function to load the received JSON data into the modal
function constructModal(courseData) {
    // COURSE DETAILS
    let modalHolderTitle = document.querySelector("#modalHolderTitle");
    let modalHolderShortDescription = document.querySelector("#modalHolderShortDescription");
    let modalHolderDifficulty = document.querySelector("#modalHolderDifficulty");
    let modalHolderLongDescription = document.querySelector("#modalHolderLongDescription");

    modalHolderTitle.innerHTML = courseData.data.title;
    modalHolderShortDescription.innerHTML = courseData.data.short_description;
    modalHolderLongDescription.innerHTML = courseData.data.long_description;


    // Hardcoding the output HTML instead of generating it via document.createElement to make the code shorter and because the output is static
    let difficultyHTML = "";
    switch(courseData.data.difficulty) {
        default:
        case 1:
            difficultyHTML = '<span class="icons"><i class="mdi mdi-star"></i><i class="mdi mdi-star-outline"></i><i class="mdi mdi-star-outline"></i></span><span class="text">Anfängerkurs</span>';
            break;
        case 2:
            difficultyHTML = '<span class="icons"><i class="mdi mdi-star"></i><i class="mdi mdi-star"></i><i class="mdi mdi-star-outline"></i></span><span class="text">Mittlere Schwierigkeit</span>';
            break;
        case 3:
            difficultyHTML = '<span class="icons"><i class="mdi mdi-star"></i><i class="mdi mdi-star"></i><i class="mdi mdi-star"></i></span><span class="text">Fortgeschrittenenkurse</span>';
            break;
    }
    modalHolderDifficulty.innerHTML = difficultyHTML;

    // COURSE DATES
    let modalHolderDates = document.querySelector("#modalHolderDates");
    let modalConfirmButton = document.querySelector("#btnCourseConfirm");
    let modalNotification = document.querySelector(".box-coursedates .notification");

    // Reset Classes
    modalHolderDates.parentNode.classList.remove("action-done");
    modalConfirmButton.classList.remove("button-gone");

    // Reset all previous Eventlisteners by cloning the confirm button
    let newModalConfirmButton = modalConfirmButton.cloneNode(true);
    modalConfirmButton.parentNode.replaceChild(newModalConfirmButton, modalConfirmButton);
    modalConfirmButton = newModalConfirmButton;

    // Set Buttons and Dates
    if(courseData.data.booking == null) {
        // There is no booking, prepare initial booking view
        modalConfirmButton.classList.add("button-disabled");
        modalConfirmButton.innerText = "Kursanmeldung bestätigen";

        // Add EventListener to submit button
        modalConfirmButton.addEventListener('click', function() {
            submitDateSelection();
        });

        // Reset containers
        modalHolderDates.classList.add("interactable");
        modalHolderDates.innerHTML = "";
        modalNotification.innerText = "Klicke einen der Termine oben an, um dich für diesen Kurs vorzuanmelden.";

        // Load each date
        courseData.data.dates.forEach(function(data) {
            loadCourseDate(modalHolderDates, data, false, false);
        });
    } else {
        // there is already a booking, disable interaction and show "remove booking" option
        let bookedCourseID = courseData.data.booking.id;

        modalConfirmButton.classList.remove("button-disabled");
        modalConfirmButton.innerText = "Kursanmeldung abbrechen";
        modalConfirmButton.addEventListener('click', function() {
            submitDateCancellation(bookedCourseID);
        })

        // Reset containers
        modalHolderDates.classList.remove("interactable");
        modalHolderDates.innerHTML = "";
        modalNotification.innerText = "Du bist bereits vorangemeldet. Klicke auf den Button unten, um deine voranmeldung zurückzuziehen.";

        // Load each date
        courseData.data.dates.forEach(function(data) {
            if(data.id === bookedCourseID) {
                loadCourseDate(modalHolderDates, data, true, true);
            } else {
                loadCourseDate(modalHolderDates, data, true, false);
            }
        });
    }
}

function loadCourseDate(holderContainer, data, isAlreadyBooked, isBookedItem) {
    let courseDate = new Date(data.course_date);

    let newCourseDate = document.createElement("div");
    newCourseDate.classList.add("course-date");
    newCourseDate.setAttribute("data-course", data.course);
    newCourseDate.setAttribute("data-date", data.id);

    let dayOfWeek = "";
    switch(courseDate.getDay()) {
        case 0:
            dayOfWeek = "Mo";
            break;
        case 1:
            dayOfWeek = "Di";
            break;
        case 2:
            dayOfWeek = "Mi";
            break;
        case 3:
            dayOfWeek = "Do";
            break;
        case 4:
            dayOfWeek = "Fr";
            break;
        case 5:
            dayOfWeek = "Sa";
            break;
        case 6:
            dayOfWeek = "So";
            break;
    }
    let newCourseDateSpan1 = document.createElement("span");
    newCourseDateSpan1.innerText = dayOfWeek;
    newCourseDate.appendChild(newCourseDateSpan1);

    let newCourseDateSpan2 = document.createElement("span");
    newCourseDateSpan2.innerText = courseDate.getDate() + "." + (courseDate.getMonth() + 1) + "." + courseDate.getFullYear();
    newCourseDate.appendChild(newCourseDateSpan2);

    if(!isAlreadyBooked) {
        // Add Select Handler
        newCourseDate.addEventListener('click', function () {
            changeDateSelection(newCourseDate);
        });
    }

    if(isBookedItem) {
        newCourseDate.classList.add("active");
    }

    holderContainer.appendChild(newCourseDate);
}

function changeDateSelection(dateToSelect) {
    let otherDates = document.querySelectorAll("#modalHolderDates .course-date");
    let modalConfirmButton = document.querySelector("#btnCourseConfirm");
    let modalHolderDates = document.querySelector("#modalHolderDates");

    // Only change selection if dates are interactable
    if(modalHolderDates.classList.contains("interactable")) {
        otherDates.forEach(function(otherDate) {
            otherDate.classList.remove("active");
        });

        dateToSelect.classList.add("active");

        // Enable button if previously disabled
        modalConfirmButton.classList.remove("button-disabled");
    }
}

function changeDateSectionToNothing() {
    let allDates = document.querySelectorAll("#modalHolderDates .course-date");
    let modalConfirmButton = document.querySelector("#btnCourseConfirm");

    allDates.forEach(function (otherDate) {
        otherDate.classList.remove("active");
    });

    modalConfirmButton.classList.add("button-disabled");
}

function submitDateCancellation(bookingID) {
    let modalConfirmButton = document.querySelector("#btnCourseConfirm");
    let modalHolderDates = document.querySelector("#modalHolderDates");

    console.log("Cancel Booking #" + bookingID);

    // change notification text
    let modalNotification = document.querySelector(".box-coursedates .notification");
    modalNotification.innerText = "Du hast deine Voranmeldung erfolgreich zurückgezogen!";

    // Disable all functionality
    changeDateSectionToNothing();
    modalConfirmButton.classList.add("button-gone");
    modalHolderDates.parentNode.classList.add("action-done");
    modalHolderDates.classList.remove("interactable");
}

function submitDateSelection() {
    let currentSelectedDate = document.querySelector("#modalHolderDates .course-date.active");
    let dateID = currentSelectedDate.getAttribute("data-date");
    let courseID = currentSelectedDate.getAttribute("data-course");

    let modalConfirmButton = document.querySelector("#btnCourseConfirm");
    let modalHolderDates = document.querySelector("#modalHolderDates");

    console.log("Subscribe to Date #" + dateID + " of Course #" + courseID);

    // change notification text
    let modalNotification = document.querySelector(".box-coursedates .notification");
    modalNotification.innerText = "Du wurdest erfolgreich für diesen Kurs vorangemeldet!";

    // Disable all functionality
    modalConfirmButton.classList.add("button-gone");
    modalHolderDates.parentNode.classList.add("action-done");
    modalHolderDates.classList.remove("interactable");
}