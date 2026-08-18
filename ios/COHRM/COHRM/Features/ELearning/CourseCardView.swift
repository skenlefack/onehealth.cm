// CourseCardView.swift
// One Health Cameroon - Carte de cours réutilisable

import SwiftUI

/// Carte de cours pour les listes et grilles
struct CourseCardView: View {

    let course: ELCourse

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Thumbnail
            ZStack(alignment: .topTrailing) {
                AsyncImage(url: serverImageURL(course.thumbnail)) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    LinearGradient(colors: [Color(hex: 0x9B59B6).opacity(0.3), Color(hex: 0x7C3AED).opacity(0.2)], startPoint: .topLeading, endPoint: .bottomTrailing)
                }
                .frame(height: 140)
                .clipped()

                // Level badge
                Text(course.localizedLevel)
                    .font(.caption2).fontWeight(.semibold)
                    .padding(.horizontal, 8).padding(.vertical, 4)
                    .background(levelColor.opacity(0.9))
                    .foregroundStyle(.white)
                    .clipShape(Capsule())
                    .padding(8)
            }

            // Info
            VStack(alignment: .leading, spacing: 6) {
                // Category
                if let cat = course.categoryNameFr {
                    Text(cat)
                        .font(.caption2)
                        .foregroundStyle(Color(hex: 0x9B59B6))
                        .lineLimit(1)
                }

                // Title
                Text(course.localizedTitle)
                    .font(.subheadline).fontWeight(.semibold)
                    .foregroundStyle(AppColors.textPrimary)
                    .lineLimit(2)

                // Instructor
                if let instructor = course.instructorName {
                    Text(instructor)
                        .font(.caption2)
                        .foregroundStyle(AppColors.textSecondary)
                }

                // Meta row
                HStack(spacing: 12) {
                    if let hours = course.durationHours, hours > 0 {
                        Label("\(Int(hours))h", systemImage: "clock")
                    }
                    if let modules = course.moduleCount {
                        Label("\(modules)", systemImage: "folder")
                    }
                    if let enrolled = course.enrolledCount, enrolled > 0 {
                        Label("\(enrolled)", systemImage: "person.2")
                    }
                }
                .font(.caption2)
                .foregroundStyle(AppColors.textTertiary)

                // Price / Free badge
                if course.isFree == true {
                    Text(String(localized: "elearning.free"))
                        .font(.caption2).fontWeight(.bold)
                        .foregroundStyle(AppColors.success)
                }
            }
            .padding(12)
        }
        .background(AppColors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .shadow(color: .black.opacity(0.06), radius: 6, y: 3)
    }

    private var levelColor: Color {
        switch course.level {
        case "beginner": Color(hex: 0x4CAF50)
        case "intermediate": Color(hex: 0xFF9800)
        case "advanced": Color(hex: 0xF44336)
        default: AppColors.muted
        }
    }

}
