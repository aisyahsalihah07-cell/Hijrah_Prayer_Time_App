//GET HTML ELEMENTS
const PrayerZone = document.getElementById("PrayerZone");
const refreshBtn = document.getElementById("refreshBtn");

const currentDate = document.getElementById("currentDate");
const currentTime = document.getElementById("currentTime");
const apiMessage = document.getElementById("apiMessage");

const nextPrayerName = document.getElementById("nextPrayerName");
const countdown = document.getElementById("countdown");
const nextPrayerMessage = document.getElementById("nextPrayerMessage");

const prayerTimes = document.getElementById("prayerTimes");
const suggestion = document.getElementById("suggestion");

//variables
let todayPrayerTimes = null;
let countdownInterval;

//event button
refreshBtn.addEventListener("click", getPrayerTimes);
PrayerZone.addEventListener("change", getPrayerTimes);

//DISPLAY CURRENT DATE AND TIME
function updateDateTime() {

    const now = new Date();

    currentDate.textContent = now.toLocaleDateString("en-MY", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    currentTime.textContent = now.toLocaleTimeString("en-MY", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}

updateDateTime();
setInterval(updateDateTime, 1000);

//GET PRAYER TIMES API (JAKIM)
async function getPrayerTimes() {

    const selectedZone = PrayerZone.value;

    apiMessage.textContent = "Loading prayer times...";
    prayerTimes.innerHTML = "";

    clearInterval(countdownInterval);

    const url = "https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=" + selectedZone;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to get prayer times.");
        }

        const data = await response.json();

        if (!data.prayerTime || data.prayerTime.length === 0) {
            throw new Error("No prayer times found.");
        }

        todayPrayerTimes = data.prayerTime[0];

        displayPrayerTimes();
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
        apiMessage.textContent = "Prayer times loaded successfully.";

    } catch (error) {

        todayPrayerTimes = null;

        apiMessage.textContent = "Unable to load prayer times. Please try again.";
        nextPrayerName.textContent = "--";
        countdown.textContent = "00:00:00";
        nextPrayerMessage.textContent = "Prayer times unavailable.";
        suggestion.textContent = "Suggestions unavailable.";
        console.log(error);
    }
}

 //DISPLAY PRAYER TIMES
 function displayPrayerTimes() {

     const prayerNames = ["Imsak", "Subuh", "Syuruk", "Zohor", "Asar", "Maghrib", "Isyak"];

     const prayerValues = [
         todayPrayerTimes.imsak,
         todayPrayerTimes.fajr,
         todayPrayerTimes.syuruk,
         todayPrayerTimes.dhuhr,
         todayPrayerTimes.asr,
         todayPrayerTimes.maghrib,
         todayPrayerTimes.isha
     ];

     prayerTimes.innerHTML = "";

     for (let i = 0; i < prayerNames.length; i++) {

         prayerTimes.innerHTML += `
             <div class="prayer-item">
                 <span>${prayerNames[i]}</span>
                 <span>${prayerValues[i]}</span>
             </div> `;
     }
 }


//CALCULATE COUNTDOWN TO NEXT PRAYER
function updateCountdown() {

    if (todayPrayerTimes === null) {
        return;
    }

    const now = new Date();
    const prayerNames = ["Subuh", "Zohor", "Asar", "Maghrib", "Isyak"];

    const prayerValues = [
        todayPrayerTimes.fajr,
        todayPrayerTimes.dhuhr,
        todayPrayerTimes.asr,
        todayPrayerTimes.maghrib,
        todayPrayerTimes.isha
    ];

    let nextPrayer = "";
    let nextPrayerDate = null;

    //Check each prayer time
    for (let i = 0; i < prayerValues.length; i++) {

        const timeParts = prayerValues[i].split(":");

        const prayerDate = new Date();

        prayerDate.setHours(
            Number(timeParts[0]),
            Number(timeParts[1]),
            0,
            0
        );

        if (prayerDate > now) {
            nextPrayer = prayerNames[i];
            nextPrayerDate = prayerDate;
            break;
        }
    }

    // If all prayer times have passed, calculate until tomorrow's Subuh
    if (nextPrayerDate === null) {

        const subuhParts = todayPrayerTimes.fajr.split(":");

        nextPrayerDate = new Date();

        nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);

        nextPrayerDate.setHours(
            Number(subuhParts[0]),
            Number(subuhParts[1]),
            0,
            0
        );

        nextPrayer = "Subuh";
    }

    //Calculate remaining time
    const difference = nextPrayerDate - now;

    let hours = Math.floor(difference / 3600000);
    let minutes = Math.floor((difference % 3600000) / 60000);
    let seconds = Math.floor((difference % 60000) / 1000);

    //Add zero in front of single-digit numbers
    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    nextPrayerName.textContent = nextPrayer;
    countdown.textContent = hours + ":" + minutes + ":" + seconds;
    nextPrayerMessage.textContent = "Time remaining until " + nextPrayer + ".";

    displaySuggestion(now);
}

//SUGGEST RELIGIOUS ACTIVITIES
function displaySuggestion(now) {
    

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutes = (currentHour * 60) + currentMinute;

    const subuhParts = todayPrayerTimes.fajr.split(":");
    const zohorParts = todayPrayerTimes.dhuhr.split(":");
    const asarParts = todayPrayerTimes.asr.split(":");
    const maghribParts = todayPrayerTimes.maghrib.split(":");
    const isyakParts = todayPrayerTimes.isha.split(":");

    const subuh = (Number(subuhParts[0]) * 60) + Number(subuhParts[1]);
    const zohor = (Number(zohorParts[0]) * 60) + Number(zohorParts[1]);
    const asar = (Number(asarParts[0]) * 60) + Number(asarParts[1]);
    const maghrib = (Number(maghribParts[0]) * 60) + Number(maghribParts[1]);
    const isyak = (Number(isyakParts[0]) * 60) + Number(isyakParts[1]);

    if (currentMinutes >= subuh && currentMinutes < zohor) {

        suggestion.textContent = "Suggestion: Spend some time reading the Quran.";

    } 
    
    else if (currentMinutes >= zohor && currentMinutes < asar) {

        suggestion.textContent = "Suggestion: Practise Zikir or read Islamic books.";

    } 
    
    else if (currentMinutes >= asar && currentMinutes < maghrib) {

        suggestion.textContent = "Suggestion: Learn a new Dua or revise Quran memorisation.";

    } 
    
    else if (currentMinutes >= maghrib && currentMinutes < isyak) {

        suggestion.textContent = "Suggestion: Read the Quran or practise Zikir.";

    } 
    
    else{

        suggestion.textContent = "Suggestion: Prepare for prayer and spend time doing Zikir.";
    }

    localStorage.setItem("religiousSuggestion", suggestion.textContent);
}

//GET CALENDAR HTML ELEMENTS
const dashboardBtn = document.getElementById("dashboardBtn");
const calendarBtn = document.getElementById("calendarBtn");

const dashboardPage = document.getElementById("dashboardPage");
const calendarPage = document.getElementById("calendarPage");

const previousMonthBtn = document.getElementById("previousMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

const calendarMonth = document.getElementById("calendarMonth");
const calendar = document.getElementById("calendar");

const selectedDate = document.getElementById("selectedDate");
const selectedDateMessage = document.getElementById("selectedDateMessage");
const selectedPrayerTimes = document.getElementById("selectedPrayerTimes");

//calendar variable
let calendarDate = new Date();
let calendarData = [];
let selectedCalendarDay = new Date().getDate();

//Change page
dashboardBtn.addEventListener("click", function() {

    dashboardPage.hidden = false;
    calendarPage.hidden = true;

    dashboardBtn.classList.add("active");
    calendarBtn.classList.remove("active");

});

calendarBtn.addEventListener("click", function() {
    dashboardPage.hidden = true;
    calendarPage.hidden = false;

    calendarBtn.classList.add("active");
    dashboardBtn.classList.remove("active");

    loadCalendar();

});

//GET MONTHLY PRAYER TIMES FROM API (JAKIM)
async function loadCalendar() {

    const selectedZone = PrayerZone.value;
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDate = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0);

    const startDay = firstDate.getDate();
    const endDay = lastDate.getDate();

    let startMonth = month + 1;

    if (startMonth < 10) {
        startMonth = "0" + startMonth;
    }

    let endMonth = month + 1;

    if (endMonth < 10) {
        endMonth = "0" + endMonth;
    }

    const startDate = year + "-" + startMonth + "-01";

    let lastDay = endDay;

    if (lastDay < 10) {
        lastDay = "0" + lastDay;
    }

    const endDate = year + "-" + endMonth + "-" + lastDay;

    calendarMonth.textContent = firstDate.toLocaleDateString("en-MY", {
        month: "long",
        year: "numeric"
    });

    calendar.innerHTML = "Loading calendar...";
    selectedPrayerTimes.innerHTML = "";
    selectedDateMessage.textContent = "";

    const url = "https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=duration&zone=" + selectedZone;

    try {
        const response = await fetch(url, {

            method: "POST",

            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },

            body: "datestart=" + startDate + "&dateend=" + endDate

        });

        if (!response.ok){
            throw new Error("Failed to get calendar data.");
        }

        const data = await response.json();

        if (!data.prayerTime || data.prayerTime.length === 0){
            throw new Error("No calendar data found.");
        }

        calendarData = data.prayerTime;

        if (selectedCalendarDay > endDay){
            selectedCalendarDay = 1;
        }

        displayCalendar();
        displaySelectedDate(selectedCalendarDay);

    } catch (error) {

        calendar.innerHTML = "Unable to load calendar.";
        selectedDateMessage.textContent = "Please check your internet connection and try again.";
        console.log(error);
    }
}

//DISPLAY MONTHLY CALENDAR
function displayCalendar() {

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let calendarHTML = "";

    //Display day names
    for (let i = 0; i < dayNames.length; i++) {

        calendarHTML += `
            <div class="calendar-weekday">
                ${dayNames[i]}
            </div>
        `;
    }

    //Add an empty spaces before the first day
    for (let i = 0; i < firstDay; i++) {

        calendarHTML += `<div class="calendar-empty"></div>`;
    }

    //Display calendar dates

    for (let day = 1; day <= totalDays; day++) {

        let buttonClass = "calendar-day";

        if (day === selectedCalendarDay) {
            buttonClass += " selected";
        }

        calendarHTML += 
        `<button class="${buttonClass}" data-day="${day}">${day}</button>`;
    }

    calendar.innerHTML = calendarHTML;

    //Add click event to each date
    const dateButtons = calendar.querySelectorAll(".calendar-day");

    for (let i = 0; i < dateButtons.length; i++) {

        dateButtons[i].addEventListener("click", function() {

            const day = Number(this.getAttribute("data-day"));

            selectedCalendarDay = day;

            displayCalendar();

            displaySelectedDate(day);

        });
    }
}

//DISPLAY PRAYER TIMES FOR SELECTED DATE
function displaySelectedDate(day) {

    const prayerData = calendarData[day - 1];

    if (!prayerData) {

        selectedDateMessage.textContent =
            "Prayer times are not available for this date.";

        selectedPrayerTimes.innerHTML = "";

        return;
    }

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const chosenDate = new Date(year, month, day);

    selectedDate.textContent = chosenDate.toLocaleDateString("en-MY", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    selectedPrayerTimes.innerHTML = `

        <div class="prayer-item">
            <span>Imsak</span>
            <span>${prayerData.imsak}</span>
        </div>

        <div class="prayer-item">
            <span>Subuh</span>
            <span>${prayerData.fajr}</span>
        </div>

        <div class="prayer-item">
            <span>Syuruk</span>
            <span>${prayerData.syuruk}</span>
        </div>

        <div class="prayer-item">
            <span>Zohor</span>
            <span>${prayerData.dhuhr}</span>
        </div>

        <div class="prayer-item">
            <span>Asar</span>
            <span>${prayerData.asr}</span>
        </div>

        <div class="prayer-item">
            <span>Maghrib</span>
            <span>${prayerData.maghrib}</span>
        </div>

        <div class="prayer-item">
            <span>Isyak</span>
            <span>${prayerData.isha}</span>
        </div>
    `;
}

//Previous month button
previousMonthBtn.addEventListener("click", function() {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    selectedCalendarDay = 1;
    loadCalendar();

});

//Next month button
nextMonthBtn.addEventListener("click", function() {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    selectedCalendarDay = 1;
    loadCalendar();

});

//LOAD PRAYER TIMES WHEN APP OPENS
getPrayerTimes();

//DAILY DUA
const duas = [
    {
        title: "Dua Before Entering the Toilet",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
        translation: "O Allah, I seek refuge in You from male and female evil spirits.",
        reference: "Sahih al-Bukhari 142"
    },
    {
        title: "Dua When Riding in a Vehicle",
        arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ",
        translation: "Glory be to Him Who has subjected this to us, for we could never have accomplished this by ourselves. And surely to our Lord we will return.",
        reference: "Surah Az-Zukhruf 43:13–14"
    },
    {
        title: "Dua When Wearing Clothes",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        translation: "Praise be to Allah Who has clothed me with this garment and provided it for me without any power or strength on my part.",
        reference: "Sunan Abi Dawud 4023"
    },
    {
        title: "Dua for Good Character",
        arabic: "اللَّهُمَّ كَمَا حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي",
        translation: "O Allah, just as You have made my appearance beautiful, make my character beautiful.",
        reference: "General supplication"
    }
];

//Display the selected dua
function displayDua(dua) {
    document.getElementById("duatext").textContent = dua.arabic;
    document.getElementById("translation").textContent = dua.translation;
    document.getElementById("DuaReference").textContent = dua.title + " | " + dua.reference;
}

//Show a random dua then save it in Local Storage
function showRandomDua() {
    const randomIndex = Math.floor(Math.random() * duas.length);
    const selectedDua = duas[randomIndex];

    displayDua(selectedDua);

    localStorage.setItem("dailyDuaSuggestion", JSON.stringify(selectedDua));
}

//Retrieve the previously saved dua
const savedDua = JSON.parse(localStorage.getItem("dailyDuaSuggestion"));

if (savedDua) {
    displayDua(savedDua);
} else {
    showRandomDua();
}

//Next Dua button
document.getElementById("nextDuaBtn").addEventListener("click", showRandomDua);

 //Daily Prayers tracker
 const trackerButtons = document.querySelectorAll(".tracker-circle");
 const trackerMessage = document.getElementById("trackerMessage");

 //Today's date
 const today = new Date().toDateString();

 //Load saved data
 let trackerData = JSON.parse(localStorage.getItem(today));

 if (trackerData === null) {
    trackerData = [false, false, false, false, false];
 }

 //Display tracker
 function displayTracker() {

     let count = 0;

     for (let i = 0; i < 5; i++) {

         if (trackerData[i] === true) {

             trackerButtons[i].classList.add("completed");
             trackerButtons[i].textContent = "✓";

             count++;

         } else {

             trackerButtons[i].classList.remove("completed");
             trackerButtons[i].textContent = "";

         }
     }

     trackerMessage.textContent =
         count + " out of 5 prayers completed.";
 }

 //Click tracker buttons
 for (let i = 0; i < 5; i++) {
     trackerButtons[i].addEventListener("click", function() {

         if (trackerData[i] === false) {
             trackerData[i] = true;
         } 
         
         else {
             trackerData[i] = false;
         }

         // Save data
         localStorage.setItem(today, JSON.stringify(trackerData));

         displayTracker();

     });
 }

 //Display saved data when app opens
 displayTracker();
 
 //ACTIVITY REMINDERS
 const reminderForm = document.getElementById("reminderForm");
 const activityName = document.getElementById("activityName");
 const activityDate = document.getElementById("activityDate");
 const activityTime = document.getElementById("activityTime");
 const activityDescription = document.getElementById("activityDescription");
 const reminderList = document.getElementById("reminderList");
 const saveReminderBtn = document.getElementById("saveReminderBtn");
 const cancelEditBtn = document.getElementById("cancelEditBtn");

 let reminders = JSON.parse(localStorage.getItem("reminders"));

 if (reminders === null) {
     reminders = [];
 }

 let editIndex = -1;

 //Display reminders
 function displayReminders() {

     reminderList.innerHTML = "";

     if (reminders.length === 0) {
        reminderList.textContent = "No reminders saved yet.";
        return;
    }

     for (let i = 0; i < reminders.length; i++) {
         const reminder = reminders[i];

         const card = document.createElement("div");
         card.className = "reminder-card";

         const title = document.createElement("h3");
         title.textContent = reminder.name;

         const description = document.createElement("p");
         description.className = "reminder-description";
         description.textContent = reminder.description;

         const dateTime = document.createElement("p");
         dateTime.className = "reminder-date";
         dateTime.textContent = reminder.date + " | " + reminder.time;

         //Edit button
         const editBtn = document.createElement("button");
         editBtn.textContent = "Edit";
         editBtn.className = "edit-btn";

         editBtn.addEventListener("click", function() {

             activityName.value = reminder.name;
             activityDate.value = reminder.date;
             activityTime.value = reminder.time;
             activityDescription.value = reminder.description;

             editIndex = i;

             saveReminderBtn.textContent = "Update Reminder";
             cancelEditBtn.hidden = false;

             activityName.focus();
         });

         //Delete Button
         const deleteBtn = document.createElement("button");
         deleteBtn.textContent = "Delete";
         deleteBtn.className = "delete-btn";

         deleteBtn.addEventListener("click", function() {

             if (confirm("Delete this reminder?")) {

                 reminders.splice(i, 1);

                 localStorage.setItem("reminders", JSON.stringify(reminders));

                 reminderForm.reset();
                 editIndex = -1;
                 saveReminderBtn.textContent = "Add Reminder";
                 cancelEditBtn.hidden = true;

                 displayReminders();

                 alert("Reminder deleted successfully.");
             }
         });

         //Group edit and delete button
         const buttonGroup = document.createElement("div");
         buttonGroup.className = "reminder-buttons";

         buttonGroup.appendChild(editBtn);
         buttonGroup.appendChild(deleteBtn);

         card.appendChild(title);
         card.appendChild(description);
         card.appendChild(dateTime);
         card.appendChild(buttonGroup);

         reminderList.appendChild(card);
     }
 }

 //save or update reminder
 reminderForm.addEventListener("submit", function(event) {

     event.preventDefault();

     if (activityName.value.trim() === "" ||
         activityDate.value === "" ||
         activityTime.value === "") {

         alert("Please fill in all required fields.");
         return;
     }

     const reminder = {
         name: activityName.value.trim(),
         date: activityDate.value,
         time: activityTime.value,
         description: activityDescription.value.trim()
     };

     if (editIndex === -1) {

         reminders.push(reminder);
         alert("Reminder added successfully.");

     } else {

         reminders[editIndex] = reminder;
         alert("Reminder updated successfully.");
     }

     localStorage.setItem("reminders", JSON.stringify(reminders));

     reminderForm.reset();
     editIndex = -1;

     saveReminderBtn.textContent = "Add Reminder";
     cancelEditBtn.hidden = true;

     displayReminders();
 });

 //Cancel edit
 cancelEditBtn.addEventListener("click", function() {

     reminderForm.reset();
     editIndex = -1;

     saveReminderBtn.textContent = "Add Reminder";
     cancelEditBtn.hidden = true;
 });

 //DISPLAY SAVED DATA
 displayReminders();