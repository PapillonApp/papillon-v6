import { getTimetable } from "./PronoteTimetable";
import { getHomeworks } from "./PronoteHomeworks";
import { getGrades } from "./PronoteGrades";

function getRecap(day) {
    return Promise.all([
        getTimetable(day),
        getHomeworks(day),
        getGrades(day)
    ])
    .then((result) => {
        return result;
    });
}

export { getRecap };