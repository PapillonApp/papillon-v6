//
//  SystemSmallCourseWidget.swift
//  PapillonWidgetExtension
//
//  Created by Tom Theret on 16/10/2023.
//

import SwiftUI

struct SystemSmallCourseWidget: View {
  
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
    VStack {
      let upcomingCourses = entry.courses.filter { course in
        return currentDate.timeIntervalSince1970 * 1000 < course.start
      }
      if let currentCourse = currentCourse {
        VStack {
          HStack(alignment: .top){
            Circle()
              .strokeBorder(Color.white.opacity(0.5), lineWidth: 2)
              .background(Circle().fill(Color.white.opacity(0.2)))
              .frame(width: 50, height: 50, alignment: .center)
              .overlay(
                Text(currentCourse.emoji)
              )
            Spacer()
            Image("logo")
              .resizable()
              .frame(width: 30, height: 30)
            }
            Spacer()
            HStack {
              VStack(alignment: .leading) {
                Text(currentCourse.subject)
                  .font(.system(.headline, design: .rounded))
                if currentCourse.isCancelled == true {
                  Text("Annulé")
                    .foregroundStyle(Color.white.opacity(0.5))
                    .font(.system(.subheadline, design: .rounded))
                } else {
                  Text("salle \(currentCourse.room)")
                    .foregroundStyle(Color.white.opacity(0.5))
                    .font(.system(.subheadline, design: .rounded))
                }
              }
              Spacer()
            }
          }
          .padding()
          .foregroundColor(.white)
          .widgetBackground(Color(hex: currentCourse.backgroundColor))
        }else if !upcomingCourses.isEmpty {
          VStack {
            HStack(alignment: .top){
              Circle()
                .strokeBorder(Color.white.opacity(0.5), lineWidth: 2)
                .background(Circle().fill(Color.white.opacity(0.2)))
                .frame(width: 50, height: 50, alignment: .center)
                .overlay(
                  Text(upcomingCourses.first!.emoji)
                )
                Spacer()
                Image("logo")
                  .resizable()
                  .frame(width: 30, height: 30)
                      }
              Spacer()
              HStack {
                VStack(alignment: .leading) {
                  Text(upcomingCourses.first!.subject)
                      .font(.system(.headline, design: .rounded))
                  if upcomingCourses.first!.isCancelled == true {
                    Text("Annulé ")
                        .foregroundStyle(Color.white.opacity(0.5))
                        .font(.system(.subheadline, design: .rounded))
                  } else {
                    Text("début à \(formattedTime(upcomingCourses.first!.start))")
                        .foregroundStyle(Color.white.opacity(0.5))
                        .font(.system(.subheadline, design: .rounded))
                  }
                }
              Spacer()
            }
          }
          .padding()
          .foregroundColor(.white)
          .widgetBackground(Color(hex: upcomingCourses.first!.backgroundColor))
          } else {
            VStack(alignment: .center) {
              Color("WidgetBackground")
                  .frame(height: 14)
              Spacer()
              VStack(spacing: 0) {
                Image("cal")
                  .font(.system(size: 24, design: .rounded))
                Text("Aucun cours")
                  .font(.system(.subheadline, design: .rounded))
              }
              .foregroundStyle(Color.primary.opacity(0.5))
              .multilineTextAlignment(.center)
              Spacer()
            }
            .widgetBackground(Color("Background"))
            }
          }
    }
}
