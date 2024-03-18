//
//  systemMediumCourseWidget.swift
//  PapillonWidgetExtension
//
//  Created by Tom Theret on 16/10/2023.
//

import SwiftUI

struct systemMediumCourseWidget: View {
  
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
    GeometryReader { reader in
      VStack(spacing: 0) {
        let upcomingCourses = entry.courses.filter { course in
          return currentDate.timeIntervalSince1970 * 1000 < course.start
        }
        //S'il y a un cours en cours
        if let currentCourse = currentCourse {
          ZStack {
            Color(hex: currentCourse.backgroundColor)
            VStack {
              HStack {
                Circle()
                  .strokeBorder(Color.white.opacity(0.5), lineWidth: 3)
                  .background(Circle().fill(Color.white.opacity(0.2)))
                  .frame(width: 40, height: 40, alignment: .center)
                  .overlay(
                    Text(currentCourse.emoji)
                  )
                RoundedRectangle(cornerRadius: 25)
                  .fill(.clear)
                  .frame(width: 4, height: 40)
                VStack(alignment: .leading) {
                  Text(currentCourse.subject)
                    .font(.system(.headline, design: .rounded))
                  if currentCourse.isCancelled == true {
                    Text("Annulé")
                      .font(.system(.subheadline, design: .rounded))
                      .foregroundStyle(Color.white.opacity(0.5))
                  } else {
                    Text("\(currentCourse.room)")
                      .font(.system(.subheadline, design: .rounded))
                      .foregroundStyle(Color.white.opacity(0.5))
                  }
                }
                Spacer()
                
                VStack(alignment: .trailing){
                  RoundedRectangle(cornerRadius: 8)
                    .fill(.white.opacity(0.25))
                    .frame(width: 57, height: 25)
                    .overlay(
                      Text("\(formattedTime(currentCourse.start))")
                        .font(.system(.headline, design: .rounded))
                        .foregroundStyle(.white)
                    )
                }
              }
              .padding(.horizontal)
              .lineLimit(1)
              .foregroundStyle(.white)
            }
          }
          .frame(height: 60)
          // S'il reste au moins un cours
          if !upcomingCourses.isEmpty {
            ForEach(upcomingCourses.prefix(2), id: \.id) { course in
              VStack {
                HStack {
                  Circle()
                    .strokeBorder(Color.white.opacity(0), lineWidth: 3)
                    .background(Circle().fill(Color.white.opacity(0)))
                    .frame(width: 40, height: 40, alignment: .center)
                    .overlay(
                      Text(course.emoji)
                    )
                  RoundedRectangle(cornerRadius: 25)
                      .fill(Color(hex: course.backgroundColor))
                      .frame(width: 4, height: 40)
                  VStack(alignment: .leading) {
                    Text(course.subject)
                      .lineLimit(1)
                      .font(.system(.headline, design: .rounded))
                    Text(course.room)
                      .lineLimit(1)
                      .foregroundStyle(Color.primary.opacity(0.5))
                      .font(.system(.subheadline, design: .rounded))
                  }
                  Spacer()
                  if course.isCancelled == true {
                    RoundedRectangle(cornerRadius: 25)
                      .fill(Color(hex: course.backgroundColor).opacity(0.25))
                      .frame(width: 68, height: 25)
                      .overlay(
                        Text("Annulé")
                          .font(.system(.headline, design: .rounded))
                          .foregroundStyle(Color(hex: course.backgroundColor))
                      )
                  } else {
                    RoundedRectangle(cornerRadius: 8)
                      .fill(Color(hex: course.backgroundColor).opacity(0.25))
                      .frame(width: 57, height: 25)
                      .overlay(
                        Text("\(formattedTime(course.start))")
                          .font(.system(.headline, design: .rounded))
                          .foregroundStyle(Color(hex: course.backgroundColor))
                      )
                  }
                }
                .padding(.horizontal)
              }
              .frame(height: (reader.size.height - 60) * 0.5)
            }
          }
        } 
        // S'il reste au moins un cours suivant
        else if !upcomingCourses.isEmpty {
          ZStack {
            Color(hex: upcomingCourses.first!.backgroundColor)
            VStack {
              HStack {
                Circle()
                  .strokeBorder(Color.white.opacity(0.5), lineWidth: 3)
                  .background(Circle().fill(Color.white.opacity(0.2)))
                  .frame(width: 40, height: 40, alignment: .center)
                  .overlay(
                    Text(upcomingCourses.first!.emoji)
                  )
                VStack(alignment: .leading) {
                  Text(upcomingCourses.first!.subject)
                    .font(.headline)
                  if upcomingCourses.first!.isCancelled == true {
                    Text("Annulé")
                      .font(.system(.subheadline, design: .rounded))
                      .foregroundStyle(Color.white.opacity(0.5))
                  } else {
                    Text("salle \(upcomingCourses.first!.room)")
                      .font(.system(.subheadline, design: .rounded))
                      .foregroundStyle(Color.white.opacity(0.5))
                  }
                }
                Spacer()
                VStack(alignment: .trailing){
                  RoundedRectangle(cornerRadius: 8)
                    .fill(Color(hex: upcomingCourses.first!.backgroundColor).opacity(0.25))
                    .frame(width: 57, height: 25)
                    .overlay(
                      Text("\(formattedTime(upcomingCourses.first!.start))")
                        .font(.system(.headline, design: .rounded))
                        .foregroundStyle(Color(hex: upcomingCourses.first!.backgroundColor))
                    )
                }
              }
              .padding(.horizontal)
              .lineLimit(1)
              .foregroundStyle(.white)
            }
          }
           .frame(height: 60)
            //S'il reste au moins un cours
            if !upcomingCourses.isEmpty {
              ForEach(upcomingCourses.prefix(2), id: \.id) { course in
                VStack {
                  HStack {
                    Circle()
                      .strokeBorder(Color.white.opacity(0), lineWidth: 3)
                      .background(Circle().fill(Color.white.opacity(0)))
                      .frame(width: 40, height: 40, alignment: .center)
                      .overlay(
                        Text(course.emoji)
                      )
                    RoundedRectangle(cornerRadius: 25)
                        .fill(Color(hex: course.backgroundColor))
                        .frame(width: 4, height: 40)
                    VStack(alignment: .leading) {
                      Text(course.subject)
                        .lineLimit(1)
                        .font(.system(.headline, design: .rounded))
                      Text(course.room)
                        .lineLimit(1)
                        .foregroundStyle(Color.primary.opacity(0.5))
                        .font(.system(.subheadline, design: .rounded))
                    }
                    Spacer()
                    if course.isCancelled == true {
                      RoundedRectangle(cornerRadius: 25)
                        .fill(Color(hex: course.backgroundColor).opacity(0.25))
                        .frame(width: 68, height: 25)
                        .overlay(
                          Text("Annulé")
                            .font(.system(.headline, design: .rounded))
                            .foregroundStyle(Color(hex: course.backgroundColor))
                        )
                    } else {
                      RoundedRectangle(cornerRadius: 8)
                        .fill(Color(hex: course.backgroundColor).opacity(0.25))
                        .frame(width: 57, height: 25)
                        .overlay(
                          Text("\(formattedTime(course.start))")
                            .font(.system(.headline, design: .rounded))
                            .foregroundStyle(Color(hex: course.backgroundColor))
                        )
                    }
                  }
                  .padding(.horizontal)
                }
                .frame(height: (reader.size.height - 60) * 0.5)
              }
            }
          }
          // S'il y a plus rien
          else {
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
}
