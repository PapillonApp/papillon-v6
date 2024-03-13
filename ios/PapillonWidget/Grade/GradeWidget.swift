import WidgetKit
import SwiftUI
import Foundation

// MARK: - Grades List
struct Grades: Identifiable {
    let id = UUID()
    let subject, emoji, description, color: String
    let date: TimeInterval
    let grade: Grade
    let isBonus, isOptional, isOutOf20: Bool

    enum CodingKeys: String, CodingKey {
        case subject, emoji, description, color, date, grade
        case isBonus = "is_bonus"
        case isOptional = "is_optional"
        case isOutOf20 = "is_out_of_20"
    }
}

// MARK: Grade
struct Grade: Codable {
  var value, outOf, average, max: Average
  var min: Average

    enum CodingKeys: String, CodingKey {
        case value
        case outOf = "out_of"
        case average, max, min
    }
}

// MARK: Average
struct Average: Codable {
    let significant: Bool
    let value: Double
}


//MARK: - Retrieve shared data from UserDefaults shared between your app and widget
func retrieveSharedGrades() -> [Grades]? {
    let sharedDefaults = UserDefaults(suiteName: "group.xyz.getpapillon")
    
    if let jsonString = sharedDefaults?.string(forKey: "getGradesF"),
       
       let jsonData = jsonString.data(using: .utf8) {
        print(jsonData)
        
        do {
            let jsonArray = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [[String: Any]]
            var grades = [Grades]()
            
            for gradeDict in jsonArray ?? [] {
                if let subject = gradeDict["subject"] as? String,
                   let emoji = gradeDict["emoji"] as? String,
                   let description = gradeDict["description"] as? String,
                   let color = gradeDict["color"] as? String,
                   let date = gradeDict["date"] as? TimeInterval,
                   let gradeValue = gradeDict["grade"] as? [String: Any],
                   let isBonus = gradeDict["is_bonus"] as? Bool,
                   let isOptional = gradeDict["is_optional"] as? Bool,
                   let isOutOf20 = gradeDict["is_out_of_20"] as? Bool {
                    
                  var grade = Grade(value: Average(significant: false, value: 0),
                                    outOf: Average(significant: false, value: 0),
                                    average: Average(significant: false, value: 0),
                                    max: Average(significant: false, value: 0),
                                    min: Average(significant: false, value: 0))
                    
                    if let value = gradeValue["value"] as? [String: Any],
                       let significant = value["significant"] as? Bool,
                       let valueValue = value["value"] as? Double {
                        grade.value = Average(significant: significant, value: valueValue)
                    }
                    
                    if let outOf = gradeValue["out_of"] as? [String: Any],
                       let significant = outOf["significant"] as? Bool,
                       let valueValue = outOf["value"] as? Double {
                        grade.outOf = Average(significant: significant, value: valueValue)
                    }
                    
                    if let average = gradeValue["average"] as? [String: Any],
                       let significant = average["significant"] as? Bool,
                       let valueValue = average["value"] as? Double {
                        grade.average = Average(significant: significant, value: valueValue)
                    }
                    
                    if let max = gradeValue["max"] as? [String: Any],
                       let significant = max["significant"] as? Bool,
                       let valueValue = max["value"] as? Double {
                        grade.max = Average(significant: significant, value: valueValue)
                    }
                    
                    if let min = gradeValue["min"] as? [String: Any],
                       let significant = min["significant"] as? Bool,
                       let valueValue = min["value"] as? Double {
                        grade.min = Average(significant: significant, value: valueValue)
                    }
                    
                    let decodedGrade = Grades(subject: subject, emoji: emoji, description: description, color: color, date: date, grade: grade, isBonus: isBonus, isOptional: isOptional, isOutOf20: isOutOf20)
                    grades.append(decodedGrade)
                }
            }
            print("[getGradesF]: ", grades)
            return grades
        } catch {
            print("Erreur lors du décodage JSON : \(error)")
        }
    }
    return nil
}

// Widget TimelineProvider
struct GradeWidgetProvider: TimelineProvider {
  typealias Entry = GradeWidgetEntry

  func placeholder(in context: Context) -> GradeWidgetEntry {
    GradeWidgetEntry(date: Date(), grades: [])
  }

  func getSnapshot(in context: Context, completion: @escaping (GradeWidgetEntry) -> Void) {
    if let sharedGrades = retrieveSharedGrades() {
      let entry = GradeWidgetEntry(date: Date(), grades: sharedGrades)
      completion(entry)
    } else {
      let entry = GradeWidgetEntry(date: Date(), grades: [])
      completion(entry)
    }
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<GradeWidgetEntry>) -> Void) {
    if let sharedGrades = retrieveSharedGrades() {
      let currentDate = Date()
      let entry = GradeWidgetEntry(date: currentDate, grades: sharedGrades)
      // Mettre à jour le widget toutes les 15 minutes
      let refreshDate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
      let timeline = Timeline(entries: [entry], policy: .after(refreshDate))
      completion(timeline)
      print("Refresh")
    } else {
      let currentDate = Date()
      let entry = GradeWidgetEntry(date: currentDate, grades: [])
      completion(Timeline(entries: [entry], policy: .atEnd))
    }
  }
}

struct GradeWidgetEntry: TimelineEntry {
  let date: Date
  let grades: [Grades]
}

// Widget View
struct GradeWidgetView: View {
  var entry: GradeWidgetEntry


    @Environment(\.widgetFamily) var family
    @State var size: CGSize = .zero
    @ViewBuilder
    var body: some View {
      switch family {
        case .systemSmall: SystemSmallGradeWidget(entry: entry)
        case .systemMedium: SystemMediumGradeWidget(entry: entry)
        //case .accessoryInline: AccessoryInlineCourseWidget(entry: entry)
        //case .accessoryRectangular: AccessoryRectangularCourseWidget(entry: entry)
        default:
          Text("Bug")
        }
    }

}

struct GradeWidget: Widget {
  private let supportedFamilies: [WidgetFamily] = {
    if #available(iOSApplicationExtension 16.0, *) {
      print("IOS 16+")
        return [.systemSmall, .systemMedium, .accessoryInline, .accessoryRectangular]
    }else {
      print("IOS 15")
        return [.systemSmall, .systemMedium, .systemLarge]
    }
  }()
  
  let kind: String = "GradeWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: GradeWidgetProvider()) { entry in
        GradeWidgetView(entry: entry)
    }
    .configurationDisplayName("Notes")
    .description("Affiche les dernières notes")
    .supportedFamilies(supportedFamilies)
    .contentMarginsDisabled()
  }
}

struct GradeWidget_Previews: PreviewProvider {
  static var previews: some View {
    GradeWidgetView(entry: GradeWidgetEntry(date: Date(), grades: []))
      .previewContext(WidgetPreviewContext(family: .systemSmall))
  }
}
