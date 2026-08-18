// OHWRModels.swift
// One Health Cameroon - Modèles OHWR (Cartographie des Ressources)

import Foundation
import CoreLocation

// MARK: - Stats

struct OHWRStats: Codable {
    let humanResources: OHWRStatGroup?
    let materialResources: OHWRStatGroup?
    let organizations: OHWRStatGroup?
    let documents: OHWRStatGroup?

    enum CodingKeys: String, CodingKey {
        case humanResources = "human_resources"
        case materialResources = "material_resources"
        case organizations, documents
    }
}

struct OHWRStatGroup: Codable {
    let total: Int?
    let byCategory: [String: Int]?
    let byRegion: [String: Int]?
    let byType: [String: Int]?

    enum CodingKeys: String, CodingKey {
        case total
        case byCategory = "by_category"
        case byRegion = "by_region"
        case byType = "by_type"
    }
}

// MARK: - Map Marker

struct OHWRMarker: Codable, Identifiable {
    let id: Int
    let type: String
    let name: String
    let title: String?
    let category: String?
    let status: String?
    let acronym: String?
    let lat: Double?
    let lng: Double?
    let region: String?
    let city: String?
    let photo: String?
    let logo: String?

    var coordinate: CLLocationCoordinate2D? {
        guard let lat, let lng else { return nil }
        return CLLocationCoordinate2D(latitude: lat, longitude: lng)
    }

    var displayName: String {
        if let acronym, !acronym.isEmpty { return "\(name) (\(acronym))" }
        return name
    }

    var markerIcon: String {
        switch type {
        case "human": "person.fill"
        case "material": "wrench.and.screwdriver.fill"
        case "organization": "building.2.fill"
        default: "mappin"
        }
    }
}

// MARK: - Expert

struct OHWRExpert: Codable, Identifiable {
    let id: Int
    let firstName: String?
    let lastName: String?
    let title: String?
    let category: String?
    let organizationId: Int?
    let organizationName: String?
    let organizationAcronym: String?
    let email: String?
    let phone: String?
    let photo: String?
    let biography: String?
    let region: String?
    let city: String?
    let yearsExperience: Int?
    let isVerified: Int?
    let availableForCollaboration: Int?
    let expertiseSummary: String?
    let linkedinUrl: String?
    let publicationsCount: Int?
    let projectsCount: Int?
    let submissionStatus: String?

    enum CodingKeys: String, CodingKey {
        case id, title, category, email, phone, photo, biography, region, city
        case firstName = "first_name"
        case lastName = "last_name"
        case organizationId = "organization_id"
        case organizationName = "organization_name"
        case organizationAcronym = "organization_acronym"
        case yearsExperience = "years_experience"
        case isVerified = "is_verified"
        case availableForCollaboration = "available_for_collaboration"
        case expertiseSummary = "expertise_summary"
        case linkedinUrl = "linkedin_url"
        case publicationsCount = "publications_count"
        case projectsCount = "projects_count"
        case submissionStatus = "submission_status"
    }

    var fullName: String {
        [firstName, lastName].compactMap { $0 }.joined(separator: " ")
    }
}

// MARK: - Organization

struct OHWROrganization: Codable, Identifiable {
    let id: Int
    let name: String
    let acronym: String?
    let type: String?
    let description: String?
    let mission: String?
    let logo: String?
    let website: String?
    let region: String?
    let city: String?
    let address: String?
    let contactEmail: String?
    let contactPhone: String?
    let submissionStatus: String?
    let expertCount: Int?

    enum CodingKeys: String, CodingKey {
        case id, name, acronym, type, description, mission, logo, website
        case region, city, address
        case contactEmail = "contact_email"
        case contactPhone = "contact_phone"
        case submissionStatus = "submission_status"
        case expertCount = "expert_count"
    }

    var displayName: String {
        if let acronym, !acronym.isEmpty { return "\(name) (\(acronym))" }
        return name
    }
}

// MARK: - Material Resource

struct OHWRMaterial: Codable, Identifiable {
    let id: Int
    let name: String
    let type: String?
    let description: String?
    let capacity: String?
    let organizationName: String?
    let organizationAcronym: String?
    let region: String?
    let city: String?
    let status: String?
    let image: String?
    let contactEmail: String?
    let contactPhone: String?
    let submissionStatus: String?

    enum CodingKeys: String, CodingKey {
        case id, name, type, description, capacity, region, city, status, image
        case organizationName = "organization_name"
        case organizationAcronym = "organization_acronym"
        case contactEmail = "contact_email"
        case contactPhone = "contact_phone"
        case submissionStatus = "submission_status"
    }
}

// MARK: - Document

struct OHWRDocument: Codable, Identifiable {
    let id: Int
    let title: String
    let slug: String?
    let type: String?
    let description: String?
    let filePath: String?
    let fileType: String?
    let thumbnail: String?
    let organizationName: String?
    let organizationAcronym: String?
    let publicationDate: String?
    let language: String?
    let isFeatured: Int?
    let viewCount: Int?
    let downloadCount: Int?
    let accessLevel: String?
    let submissionStatus: String?

    enum CodingKeys: String, CodingKey {
        case id, title, slug, type, description, thumbnail, language
        case filePath = "file_path"
        case fileType = "file_type"
        case organizationName = "organization_name"
        case organizationAcronym = "organization_acronym"
        case publicationDate = "publication_date"
        case isFeatured = "is_featured"
        case viewCount = "view_count"
        case downloadCount = "download_count"
        case accessLevel = "access_level"
        case submissionStatus = "submission_status"
    }
}

// MARK: - Config Item (categories, types)

struct OHWRConfigItem: Codable, Identifiable {
    let id: Int
    let name: String
    let nameEn: String?
    let slug: String?
    let description: String?
    let icon: String?
    let color: String?
    let displayOrder: Int?
    let isActive: Int?

    enum CodingKeys: String, CodingKey {
        case id, name, slug, description, icon, color
        case nameEn = "name_en"
        case displayOrder = "display_order"
        case isActive = "is_active"
    }

    var localizedName: String {
        let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
        return (lang == "en" ? nameEn : nil) ?? name
    }
}

// MARK: - Config All

struct OHWRConfigAll: Codable {
    let materialTypes: [OHWRConfigItem]?
    let organizationTypes: [OHWRConfigItem]?
    let documentTypes: [OHWRConfigItem]?
    let expertCategories: [OHWRConfigItem]?
}

// MARK: - Region

struct OHWRRegion: Codable, Identifiable {
    let id: Int
    let name: String
    let code: String?
    let centerLat: String?
    let centerLng: String?

    enum CodingKeys: String, CodingKey {
        case id, name, code
        case centerLat = "center_lat"
        case centerLng = "center_lng"
    }
}

// MARK: - Pagination

struct OHWRPagination: Codable {
    let page: Int?
    let limit: Int?
    let total: Int?
    let pages: Int?
}

struct OHWRPaginatedResponse<T: Codable>: Codable {
    let success: Bool
    let data: [T]?
    let pagination: OHWRPagination?
    let message: String?
}
