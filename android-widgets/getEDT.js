import { requestWidgetUpdate } from 'react-native-android-widget';

let IndexData = require("../fetch/IndexDataInstance")
let instance = new IndexData.IndexDataInstance()

function getNextCours(classes) {
    if (!classes || classes.length === 0) {
        return {
        next: null,
        nextClasses: [],
        };
    }

    const now = new Date();

    let currentOrNextClass = null
    let isCurrentClass = false
    let isNextClass = false
    let minTimeDiff = Infinity;

    for (const classInfo of classes) {
        const startTime = new Date(classInfo.start);
        const endTime = new Date(classInfo.end);

        if (startTime <= now && now <= endTime) {
            classInfo.isCurrentClass = true
            currentOrNextClass = classInfo;
            isCurrentClass = true
            break; // Found the current class, no need to continue
        } else if (startTime > now) {
            const timeDiff = startTime - now;

            if (timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                classInfo.isNextClass = true
                currentOrNextClass = classInfo;
                isNextClass = true
            }
        }
    }

    if (currentOrNextClass === null) {
        return null;
    }

    if(currentOrNextClass.length === 0) return null

    const nextClasses = classes.filter((classInfo) => {
        const startTime = new Date(classInfo.start);
        return startTime > new Date(currentOrNextClass.start);
    });

    return {
        next: currentOrNextClass,
        isCurrentClass: isCurrentClass,
        isNextClass: isNextClass,
        nextClasses: nextClasses,
    };
}

module.exports = (Widget, name) => {
    instance.getTimetable("2023-11-06")
    .then((edt) => {
        console.log("edt", edt)
        if(edt.includes("ERR_NO_ACCOUNT")) {
            requestWidgetUpdate({
                widgetName: name,
                renderWidget: () => <Widget noaccount={true} />
            })
            return;
        }
        let next = getNextCours(edt)
        if(next.next === null) next = null
        requestWidgetUpdate({
            widgetName: name,
            renderWidget: () => <Widget edt={next} />
        })
    })
    .catch(err => {
        if(err.include("ERR_NO_ACCOUNT")) {
            requestWidgetUpdate({
                widgetName: name,
                renderWidget: () => <Widget noaccount={true} />
            })
        }
        else {
            requestWidgetUpdate({
                widgetName: name,
                renderWidget: () => <Widget error={true} />
            })
        }
    })
}