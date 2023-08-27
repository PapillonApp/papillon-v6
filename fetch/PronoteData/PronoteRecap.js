import { getTimetable } from "./PronoteTimetable";
import { getHomeworks } from "./PronoteHomeworks";
import { getGrades } from "./PronoteGrades";

function getRecap(day, force) {
    return Promise.all([
        getTimetable(day),
        getHomeworks(day),
        getGrades(force)
    ])
    .then((result) => {
        return result;
    });
}

export { getRecap };