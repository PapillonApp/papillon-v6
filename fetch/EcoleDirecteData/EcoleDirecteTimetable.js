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

   console.log(ecoledirecteInstance)
  // TEMPORARY : remove 1 month
  day = new Date(day);

  console.log('ttForce : ', force);

    AsyncStorage.getItem('timetableCache').then((timetableCache) => {
        if (timetableCache && !force) {
        // if day is in cache, return it
        timetableCache = JSON.parse(timetableCache);

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
                return timetableCache[i].timetable;
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


      ecoledirecteInstance.timetable.fetchByDay(day).then(result => {
            console.log(result)

            /*result.sort((a, b) => a.start.localeCompare(b.start));

            // if two cours start at the same time, remove the cours with isCancelled = true
            result = removeDuplicateCourses(result);

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

            console.log(date);
            console.log(result);

            return result;*/
            return []
          })
          .catch(() => {
            require("./EcoleDirecteRefreshToken").default()
          })
        })
}

export { getTimetable };
