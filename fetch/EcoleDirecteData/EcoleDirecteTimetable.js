import AsyncStorage from '@react-native-async-storage/async-storage';


function removeDuplicateCourses(courses) {
  const result = courses;

  for (let i = 0; i < courses.length; i += 1) {
    // if next cours starts at the same time
    if (i + 1 < courses.length && courses[i].start === courses[i + 1].start) {
      console.log('duplicate found');
      console.log(courses[i]);
      console.log(courses[i + 1]);

      if (courses[i + 1].is_cancelled) {
        result.splice(i + 1, 1);
      }

      if (courses[i].is_cancelled) {
        result.splice(i, 1);
      }
    }
  }

  return result;
}

function getTimetable(day, force = false, ecoledirecteInstance) {

  // TEMPORARY : remove 1 month
  day = new Date(day);

  console.log('ttForce : ', force);

  AsyncStorage.getItem('timetableCache').then((timetableCache) => {
    if (timetableCache && !force) {
      // if day is in cache, return it
      timetableCache = JSON.parse(timetableCache);
      console.log(timetableCache)

      for (let i = 0; i < timetableCache.length; i += 1) {
        const thisDay = new Date(day);
        const cacheDay = new Date(timetableCache[i].date);

        thisDay.setHours(0, 0, 0, 0);
        cacheDay.setHours(0, 0, 0, 0);

        if (thisDay.getTime() === cacheDay.getTime()) {
          const currentTime = new Date();
          currentTime.setHours(0, 0, 0, 0);

          const cacheTime = new Date(timetableCache[i].dateSaved);
          cacheTime.setHours(0, 0, 0, 0);

          if (currentTime.getTime() === cacheTime.getTime()) {
              console.log('timetable from cache');
              let objecttest = [{"background_color": "#173ED9", "end": "2023-11-08 10:00", "group_names": [], "id": "31#Bjren-WufehJ6HU4QWBRStFCpWllpIrvQ_vqUCQaNI0", "is_cancelled": false, "is_detention": false, "is_exempted": false, "is_outing": false, "is_test": false, "memo": null, "num": 410, "rooms": ["205"], "start": "2023-11-08 09:00", "status": null, "subject": {"groups": false, "id": "82#KHFm8_2TckkHflLLnKEMWOpM5x9EHumkFv4dGzFVq2k", "name": "ARTS PLASTIQUES"}, "teachers": ["DIALO H."], "virtual": []}]
              return objecttest; //timetableCache[i].timetable;
          }
        }
      }
    }

    // date = '2021-09-13' (YYYY-MM-DD)
    const date = new Date(day);
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let dayOfMonth = date.getDate();

    if (month < 10) {
      month = `0${month}`;
    }

    if (dayOfMonth < 10) {
      dayOfMonth = `0${dayOfMonth}`;
    }

    day = `${year}-${month}-${dayOfMonth}`;


    ecoledirecteInstance.timetable.fetchByDay(day).then(data => {
      let courses = data.data;
      let result = [];

      // if two cours start at the same time, remove the cours with isCancelled = true
      //result = removeDuplicateCourses(result);


      //Restructure data for papillon
      courses.forEach(course => {
        let newData = {
          "background_color": course.color,
          "end": course.end_date,
          "group_names": course.groupe.split(""),
          "is_cancelled": course.isAnnule,
          "is_detention": false,
          "is_exempted": false,
          "is_outing": false,
          "is_test": false,
          "memo": null,
          "num": 410,
          "rooms": course.salle.split(" "),
          "start": course.start_date,
          "status": null,
          "subject": {
            "groups": false,
            "name": "ARTS PLASTIQUES"
          },
          "teachers": course.prof.split(""),
          "virtual": []
        }
        result.push(newData)
      })

      result.sort((a, b) => a.start.localeCompare(b.start));



      // save in cache
      AsyncStorage.getItem('timetableCache').then((_timetableCache) => {
        let cachedTimetable = [];

        if (_timetableCache) {
          cachedTimetable = JSON.parse(_timetableCache);
        }

        cachedTimetable = cachedTimetable.filter(
          (entry) => entry.date !== day
        );

        cachedTimetable.push({
          date: day,
          dateSaved: new Date(),
          timetable: result,
        });

        AsyncStorage.setItem(
          'timetableCache',
          JSON.stringify(cachedTimetable)
        );
      });

      return result;

    }).catch(() => {
      require("./EcoleDirecteRefreshToken").default()
    })
  })
}

export { getTimetable };
