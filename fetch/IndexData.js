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