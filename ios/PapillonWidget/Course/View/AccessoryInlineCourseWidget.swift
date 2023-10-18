//
//  AccessoryInlineCourseWidget.swift
//  PapillonWidgetExtension
//
//  Created by Tom Theret on 16/10/2023.
//

import SwiftUI

struct AccessoryInlineCourseWidget: View {
  
  let currentDate = Date()
  
  var entry : CourseWidgetProvider.Entry
  
    var body: some View {
      //Liste des cours à venir
      let upcomingCourses = entry.courses.filter { course in
        return currentDate.timeIntervalSince1970 * 1000 < course.start
      }
      //Compte le nombre de cours restant
      let numberOfSubjects = upcomingCourses.reduce(0) { count, course in
          return count + 1
      }
      if numberOfSubjects == 0 { //Si les cours sont finis
        Text("Aucun cours restant")
      } else if numberOfSubjects == 1 { //S'il reste un cours
        Text("1 cours restant")
      } else { //S'il reste plusieurs cours
        Text("\(numberOfSubjects) cours restants")
      }
    }
}
