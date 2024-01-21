//
//  AccessoryRectangularCourseWidget.swift
//  PapillonWidgetExtension
//
//  Created by Tom Theret on 16/10/2023.
//

import SwiftUI

struct AccessoryRectangularCourseWidget: View {
  
  let currentDate = Date()
  
  var entry : CourseWidgetProvider.Entry

  var currentCourse: Course? {
    if let sharedCourses = retrieveSharedData() {
      // Convertissez la date actuelle en un timestamp en millisecondes si nécessaire
      let currentTimestamp = currentDate.timeIntervalSince1970 * 1000

      // Filtrer les cours qui ont commencé et ne sont pas encore terminés
      return sharedCourses.first { course in
         return currentTimestamp >= course.start && currentTimestamp <= course.end
      }
    }
    return nil
  }
  
  var body: some View {
    if #available(iOS 16, *) {
      //Liste des cours à venir
      let upcomingCourses = entry.courses.filter { course in
        return currentDate.timeIntervalSince1970 * 1000 < course.start
      }
      //S'il y a un cours en cours
      if let currentCourse = currentCourse {
        VStack(alignment: .leading) {
          Text(currentCourse.subject)
            .font(.system(.headline, design: .rounded))
            .lineLimit(1)
          Text(currentCourse.room)
            .font(.system(.subheadline, design: .rounded))
          Text("Maintenant")
            .font(.system(.subheadline, design: .rounded))
        }
      }
      //S'il y a au moins un prchain cours
      else if !upcomingCourses.isEmpty {
        VStack(alignment: .leading) {
          Text(upcomingCourses.first!.subject)
            .font(.system(.headline, design: .rounded))
            .lineLimit(1)
          Text("salle \(upcomingCourses.first!.room)")
            .font(.system(.subheadline, design: .rounded))
          Text("à \(formattedTime(upcomingCourses.first!.start))")
            .font(.system(.subheadline, design: .rounded))
        }
      }
      //Si tout est fini
      else { //Si tout est fini
        VStack(alignment: .leading) {
          Text("Plus de cours pour aujourd'hui")
            .font(.system(.headline, design: .rounded))
          Text("Repose-toi bien !")
            .font(.system(.subheadline, design: .rounded))
        }
      }
    }
  }
}

//Formatage du TimeStamp
public func formattedTime(_ timestamp: TimeInterval) -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "HH:mm"
    return dateFormatter.string(from: Date(timeIntervalSince1970: timestamp / 1000))
}
