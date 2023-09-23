//
//  StreakWidget.swift
//  StreakWidget
//
//  Created by MAC on 28/04/23.
//

import WidgetKit
import SwiftUI
import Intents

// Fix des background pour iOS 17
extension View {
    func widgetBackground(backgroundView: some View) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            return containerBackground(for: .widget) {
                backgroundView
            }
        } else {
            return background(backgroundView)
        }
    }
}

struct WidgetData: Decodable {
    var subjet: String
    var teacher: String
    var room: String
    var start: Date
    var end: Date
    var background_color: String
    var emoji: String
    var is_cancelled: Bool
}

struct Provider: IntentTimelineProvider {
   func placeholder(in context: Context) -> SimpleEntry {
      SimpleEntry(date: Date(), configuration: ConfigurationIntent(), subjet: "Cours", teacher: "Professeur", room: "salle", start: Date(), end: Date(), background_color: "", emoji: "📝", is_cancelled: false)
  }
  
  func getSnapshot(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (SimpleEntry) -> ()) {
      let entry = SimpleEntry(date: Date(), configuration: configuration, subjet: "Cours", teacher: "Professeur", room: "salle", start: Date(), end: Date(), background_color: "", emoji: "📝", is_cancelled: false)
      completion(entry)
  }
  
   func getTimeline(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> Void) {
      let userDefaults = UserDefaults.init(suiteName: "group.plus.pronote")
      if userDefaults != nil {
        let entryDate = Date()
        if let savedData = userDefaults!.value(forKey: "getEdtF") as? String {
            let decoder = JSONDecoder()
            let data = savedData.data(using: .utf8)
            if let parsedData = try? decoder.decode(WidgetData.self, from: data!) {
                let nextRefresh = Calendar.current.date(byAdding: .minute, value: 5, to: entryDate)!
              let entry = SimpleEntry(date: nextRefresh, configuration: configuration, subjet: parsedData.subjet, teacher: parsedData.teacher, room: parsedData.room, start: parsedData.start, end: parsedData.end, background_color: parsedData.background_color, emoji: parsedData.emoji, is_cancelled: parsedData.is_cancelled)
                let timeline = Timeline(entries: [entry], policy: .atEnd)
                completion(timeline)
              
              print(savedData)
            } else {
                print("Could not parse data")
            }
        } else {
            let nextRefresh = Calendar.current.date(byAdding: .minute, value: 1, to: entryDate)!
            let entry = SimpleEntry(date: nextRefresh, configuration: configuration, subjet: "No data set", teacher: "No data set", room: "No data set", start: nextRefresh, end: nextRefresh, background_color: "WidgetBackground", emoji: "❌", is_cancelled: false)
            let timeline = Timeline(entries: [entry], policy: .atEnd)
            completion(timeline)
          print("pas de data")
        }
      }
  }
}

struct SimpleEntry: TimelineEntry {
   let date: Date
      let configuration: ConfigurationIntent
      let subjet: String
      let teacher: String
      let room: String
      let start: Date
      let end: Date
      let background_color: String
      let emoji: String
      let is_cancelled: Bool

}

struct PapillonWidgetEntryView : View {
  var entry: Provider.Entry
  
  var body: some View {
    HStack(alignment: .top) {
      VStack(alignment: .leading) {
        VStack {
          HStack {
            VStack {
              Text(entry.emoji)
                .font(.title)
                .multilineTextAlignment(.center)
              
                .frame(width: 25, height: 25, alignment: .center)
                .padding()
                .background(.white.opacity(0.2), in: Circle())
                .overlay(
                    Circle()
                      .stroke(Color.white.opacity(0.5), lineWidth: 2)
                )
              Spacer()
            }
            
            Spacer()
            VStack {
              Image("logo")
                .resizable()
                    .frame(width: 32.0, height: 32.0)
              Spacer()
            }
            
          }
          Spacer()
        }
        
        Spacer()
        
        VStack(alignment: .leading) {
          //Text(entry.date, style: .time)
            

          Text(entry.subjet.uppercased())
          .font(.headline)
          Text(entry.room)
          .font(.subheadline)
          //Text(entry.configuration.favoriteEmoji)
        }
          
          
        }.foregroundStyle(.white)
        .widgetBackground(backgroundView: Color("WidgetBackground"))
    }
        
    
  }
}
  

struct PapillonWidget: Widget {
  let kind: String = "StreakWidget"
  
  var body: some WidgetConfiguration {
    IntentConfiguration(kind: kind, intent: ConfigurationIntent.self, provider: Provider()) { entry in
      PapillonWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("My Widget")
    .description("This is an example widget.")
  }
}

struct StreakWidget_Previews: PreviewProvider {
  static var previews: some View {
    PapillonWidgetEntryView(entry: SimpleEntry(date: Date(), configuration: ConfigurationIntent(), subjet: "Espagnol LV2", teacher: "", room: "salle B206", start: Date(), end: Date(), background_color: "#ffffff", emoji: "🇪🇸", is_cancelled: false ))
      .previewContext(WidgetPreviewContext(family: .systemSmall))
    
  }
}
