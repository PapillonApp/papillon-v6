import AsyncStorage from '@react-native-async-storage/async-storage';
let service;
AsyncStorage.getItem("service").then((value) => {
    service = value
})

//[Service]Grades.js

export async function getGrades(force = false) {
    if(service === "Pronote") return require(`./PronoteData/PronoteGrades.js`).getGrades(force)
}

export function getEvaluations(force = false) {
    if(service === "Pronote") return require(`./PronoteData/PronoteGrades.js`).getEvaluations(force)
}

export function changePeriod(period) {
    if(service === "Pronote") return require(`./PronoteData/PronoteGrades.js`).changePeriod(period)
}

//[Service]Homeworks.js
export function getHomeworks(day) {
    if(service === "Pronote") return require(`./PronoteData/PronoteHomeworks.js`).getHomeworks(day)
}

export function changeHomeworkState(day, id) {
    if(service === "Pronote") return require(`./PronoteData/PronoteHomeworks.js`).changeHomeworkState(day, id)
}

//[Service]News.js
export function getNews(force = false) {
    if(service === "Pronote") return require(`./PronoteData/PronoteNews.js`).getNews(force)
}

//[Service]Recap.js
export function getRecap(day, force = false) {
    if(service === "Pronote") return require(`./PronoteData/PronoteRecap.js`).getRecap(day, force = false)
}

//[Service]Timetable.js
export function getTimetable(day, force = false) {
    if(service === "Pronote") return require(`./PronoteData/PronoteTimetable.js`).getTimetable(day, force)
}

//[Service]User.js
export function getUser(force = false) {
    if(service === "Pronote") return require(`./PronoteData/PronoteUser.js`).getUser(force)
}

//[Service]Viesco.js
export function getViesco(force = false) {
    if(service === "Pronote") return require(`./PronoteData/PronoteViesco.js`).getViesco(force)
}