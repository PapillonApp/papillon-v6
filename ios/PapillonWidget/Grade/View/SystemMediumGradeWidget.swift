import SwiftUI

struct SystemMediumGradeWidget: View {
  
    var entry: GradeWidgetProvider.Entry
  
    var body: some View {
      if entry.grades.isEmpty {
        GeometryReader { reader in
          VStack {
            Color("WidgetBackground")
                .frame(height: 14)
          }
        }
      } else {
        GeometryReader { reader in
          VStack {
            Color(hex: entry.grades.first!.color)
                .frame(height: 14)
            HStack(spacing: 0) {
              VStack(alignment: .leading) {
                if Int(entry.grades.count.description) == 1 {
                  Text("Note")
                    .font(Font.system(size: 17, weight: .bold, design: .rounded))
                    .foregroundStyle(Color(hex: entry.grades.first!.color))
                } else {
                  Text("Notes")
                    .font(Font.system(size: 17, weight: .bold, design: .rounded))
                    .foregroundStyle(Color(hex: entry.grades.first!.color))
                }
                Text(entry.grades.count.description)
                  .font(Font.system(size: 24, weight: .bold, design: .rounded))
                Spacer()
                Circle()
                  .strokeBorder(Color(hex: entry.grades.first!.color), lineWidth: 3)
                  .background(Circle().fill(Color(hex: entry.grades.first!.color)))
                  .frame(width: 32, height: 32, alignment: .center)
                  .overlay(
                    Image(systemName: "chart.pie")
                      .font(Font.system(size: 16.5, weight: .bold, design: .rounded))
                      .foregroundStyle(.white)
                  )
              }
              Spacer()
              VStack(alignment: .leading) {
                ForEach(entry.grades.prefix(3), id: \.id) { grade in
                  VStack(alignment: .leading) {
                    HStack(alignment: .center) {
                      Circle()
                        .strokeBorder(Color.primary.opacity(0.25), lineWidth: 1)
                        .frame(width: 35, height: 35, alignment: .center)
                        .overlay(
                          Text(grade.emoji)
                            .font(Font.system(size: 18))
                        )
                      VStack(alignment: .leading) {
                        Text(grade.description)
                          .font(Font.system(size: 15))
                          .bold()
                          .lineLimit(1)
                        Text(grade.subject)
                          .lineLimit(1)
                          .font(Font.system(size: 12))
                          .foregroundStyle(Color.primary.opacity(0.5))
                      }
                      
                      HStack(alignment: .center, spacing: 0) {
                        Text(String(format: "%.2f", grade.grade.value.value))
                          .font(.system(size: 17, design: .rounded))
                          .bold()
                        Text("/" + String(format: "%.0f", grade.grade.outOf.value))
                          .font(.system(size: 13, design: .rounded))
                          .baselineOffset(2)
                          .foregroundStyle(Color.primary.opacity(0.5))
                      }
                    }
                    
                  }
                }
                .frame(height: (reader.size.height - 14) / 3)
                if Int(entry.grades.count.description)! < 3 {
                  Spacer()
                }
              }
            }
            .padding(.horizontal)
            .padding(.bottom, 14)
            .widgetBackground(Color("Background"))
          }
        }
      }
    }
}
