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

            // Update every 15 minutes (or as desired)
            let refreshDate = Calendar.current.date(byAdding: .minute, value: 1, to: currentDate)!
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

    var body: some View {
        // Display your shared data in the widget
        VStack {
            ForEach(entry.courses) { course in
                Text(course.subject)
                    .font(.title)
                    .bold()
                    .foregroundStyle(Color(hex: course.backgroundColor ))
              Text(course.room)
              Text(String(course.isCancelled))
                Text("\(formattedTime(course.start))")
            }
        }
        .padding()
    }

    private func formattedTime(_ timestamp: TimeInterval) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "HH:mm"
        return dateFormatter.string(from: Date(timeIntervalSince1970: timestamp / 1000))
    }
}

struct CourseWidget: Widget {
    let kind: String = "CourseWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CourseWidgetProvider()) { entry in
            CourseWidgetView(entry: entry)
        }
        .configurationDisplayName("Course Widget")
        .description("Affiche des informations sur les cours")
    }
}

struct CourseWidget_Previews: PreviewProvider {
    static var previews: some View {
        CourseWidgetView(entry: CourseWidgetEntry(date: Date(), courses: []))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}

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
