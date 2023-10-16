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
              .strokeBorder(Color.white.opacity(0.5), lineWidth: 3)
              .background(Circle().fill(Color.white.opacity(0.2)))
              .frame(width: 50, height: 50, alignment: .center)
              .overlay(
                Text(currentCourse.emoji)
              )
            Spacer()
            Image("logo")
              .resizable()
              .frame(width: 35, height: 35)
            }
            Spacer()
            HStack {
              VStack(alignment: .leading) {
                Text(currentCourse.subject)
                  .textCase(.uppercase)
                  .font(.headline)
                if currentCourse.isCancelled == true {
                  Text("Annulé")
                    .foregroundStyle(Color.white.opacity(0.5))
                    .font(.subheadline)
                    .textCase(.uppercase)
                } else {
                  Text("salle \(currentCourse.room)")
                    .foregroundStyle(Color.white.opacity(0.5))
                    .font(.subheadline)
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
                .strokeBorder(Color.white.opacity(0.5), lineWidth: 3)
                .background(Circle().fill(Color.white.opacity(0.2)))
                .frame(width: 50, height: 50, alignment: .center)
                .overlay(
                  Text(upcomingCourses.first!.emoji)
                )
                Spacer()
                Image("logo")
                  .resizable()
                  .frame(width: 35, height: 35)
                      }
              Spacer()
              HStack {
                VStack(alignment: .leading) {
                  Text(upcomingCourses.first!.subject)
                      .textCase(.uppercase)
                      .font(.headline)
                  if upcomingCourses.first!.isCancelled == true {
                    Text("Annulé ")
                        .foregroundStyle(Color.white.opacity(0.5))
                        .font(.subheadline)
                        .textCase(.uppercase)
                  } else {
                    Text("debut à \(formattedTime(upcomingCourses.first!.start))")
                        .foregroundStyle(Color.white.opacity(0.5))
                        .font(.subheadline)
                  }
                }
              Spacer()
            }
          }
          .padding()
          .foregroundColor(.white)
          .widgetBackground(Color(hex: upcomingCourses.first!.backgroundColor))
          } else {
              VStack {
                HStack(alignment: .top){
                  Circle()
                    .strokeBorder(Color.white.opacity(0.5), lineWidth: 3)
                    .background(Circle().fill(Color.white.opacity(0.2)))
                    .frame(width: 50, height: 50, alignment: .center)
                    .overlay(
                      Text("😴")
                    )
                  Spacer()
                  Image("logo")
                    .resizable()
                    .frame(width: 35, height: 35)
                }
                Spacer()
                HStack {
                  VStack(alignment: .leading) {
                    Text("Plus de cours pour aujourd'hui")
                      .textCase(.uppercase)
                      .font(.headline)
                  }
                Spacer()
                }
              }
              .padding()
              .foregroundColor(.white)
              .widgetBackground(Color("WidgetBackground"))
            }
          }
    }
}
