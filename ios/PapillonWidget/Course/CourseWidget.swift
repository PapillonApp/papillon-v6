import WidgetKit
import SwiftUI
import Foundation

// Define your data model
struct Course: Identifiable {
  let id = UUID()
  let subject: String
  let teacher: String
  let room: String
  let start: TimeInterval
  let end: TimeInterval
  let backgroundColor: String
  let emoji: String
  let isCancelled: Bool
}

// Retrieve shared data from UserDefaults shared between your app and widget
func retrieveSharedData() -> [Course]? {
  let sharedDefaults = UserDefaults(suiteName: "group.plus.pronote")
  if let jsonString = sharedDefaults?.string(forKey: "getEdtF"),
   let jsonData = jsonString.data(using: .utf8) {
    do {
      if let jsonArray = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [[String: Any]] {
        var courses = [Course]()
        for courseDict in jsonArray {
          if let subject = courseDict["subject"] as? String,
             let teacher = courseDict["teacher"] as? String,
             let room = courseDict["room"] as? String,
             let start = courseDict["start"] as? TimeInterval,
             let end = courseDict["end"] as? TimeInterval,
             let backgroundColor = courseDict["background_color"] as? String,
             let emoji = courseDict["emoji"] as? String,
             let isCancelled = courseDict["is_cancelled"] as? Bool {
              let course = Course(subject: subject, teacher: teacher, room: room, start: start, end: end, backgroundColor: backgroundColor, emoji: emoji, isCancelled: isCancelled)
            courses.append(course)
          }
        }
        return courses
      }
    } catch {
      print("Erreur lors du décodage JSON : \(error)")
    }
  }
  return nil
}

// Widget TimelineProvider
struct CourseWidgetProvider: TimelineProvider {
  typealias Entry = CourseWidgetEntry

  func placeholder(in context: Context) -> CourseWidgetEntry {
    CourseWidgetEntry(date: Date(), courses: [])
  }

  func getSnapshot(in context: Context, completion: @escaping (CourseWidgetEntry) -> Void) {
    if let sharedCourses = retrieveSharedData() {
      let entry = CourseWidgetEntry(date: Date(), courses: sharedCourses)
      completion(entry)
    } else {
      let entry = CourseWidgetEntry(date: Date(), courses: [])
      completion(entry)
    }
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<CourseWidgetEntry>) -> Void) {
    if let sharedCourses = retrieveSharedData() {
      let currentDate = Date()
      let entry = CourseWidgetEntry(date: currentDate, courses: sharedCourses)
      // Mettre à jour le widget toutes les 15 minutes
      let refreshDate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
      let timeline = Timeline(entries: [entry], policy: .after(refreshDate))
      completion(timeline)
      print("Refresh")
    } else {
      let currentDate = Date()
      let entry = CourseWidgetEntry(date: currentDate, courses: [])
      completion(Timeline(entries: [entry], policy: .atEnd))
    }
  }
}

// Widget Entry
struct CourseWidgetEntry: TimelineEntry {
  let date: Date
  let courses: [Course]
}

// Widget View
struct CourseWidgetView: View {
  var entry: CourseWidgetEntry

  // Récupérez la date et l'heure actuelles
  let currentDate = Date()
    
  // Récupérez les données des cours depuis UserDefaults partagé
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

    @Environment(\.widgetFamily) var family
    @State var size: CGSize = .zero
    @ViewBuilder
    var body: some View {
      switch family {
        case .systemSmall: SystemSmallCourseWidget(entry: entry)
        case .systemMedium: systemMediumCourseWidget(entry: entry)
        case .accessoryInline: AccessoryInlineCourseWidget(entry: entry)   
        case .accessoryRectangular: AccessoryRectangularCourseWidget(entry: entry)
        default:
          Text("Bug")
        }
    }

    public func formattedTime(_ timestamp: TimeInterval) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "HH:mm"
        return dateFormatter.string(from: Date(timeIntervalSince1970: timestamp / 1000))
    }
}

struct CourseWidget: Widget {
  private let supportedFamilies: [WidgetFamily] = {
    if #available(iOSApplicationExtension 16.0, *) {
      print("IOS 16+")
        return [.systemSmall, .systemMedium, .accessoryInline, .accessoryRectangular]
    }else {
      print("IOS 15")
        return [.systemSmall, .systemMedium, .systemLarge]
    }
  }()
  
  let kind: String = "CourseWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: CourseWidgetProvider()) { entry in
        CourseWidgetView(entry: entry)
    }
    .configurationDisplayName("Emploi du temps")
    .description("Affiche des informations sur les cours")
    .supportedFamilies(supportedFamilies)
    .contentMarginsDisabled()
  }
}

struct CourseWidget_Previews: PreviewProvider {
  static var previews: some View {
    CourseWidgetView(entry: CourseWidgetEntry(date: Date(), courses: []))
      .previewContext(WidgetPreviewContext(family: .systemSmall))
  }
}

//Convertisseur HEX vers Color
extension Color {
  init(hex: String) {
    var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
    hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")
    var rgb: UInt64 = 0
    Scanner(string: hexSanitized).scanHexInt64(&rgb)
    let red = Double((rgb & 0xFF0000) >> 16) / 255.0
    let green = Double((rgb & 0x00FF00) >> 8) / 255.0
    let blue = Double(rgb & 0x0000FF) / 255.0
    self.init(red: red, green: green, blue: blue)
  }
}

//Widget background pour iOS 17
extension View {
  func widgetBackground(_ backgroundView: some View) -> some View {
    if #available(iOSApplicationExtension 17.0, *) {
      return containerBackground(for: .widget) {
        backgroundView
      }
    } else {
      return background(backgroundView)
    }
  }
}
