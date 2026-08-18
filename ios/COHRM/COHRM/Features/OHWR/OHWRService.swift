// OHWRService.swift
// One Health Cameroon - Service API OHWR (Cartographie des Ressources)

import Foundation

/// Service API pour le module OHWR
actor OHWRService {

    static let shared = OHWRService()
    private let client = APIClient.shared
    private init() {}

    private let base = "/mapping"

    // MARK: - Stats & Map

    func getStats() async throws -> APIResponse<OHWRStats> {
        try await client.get("\(base)/stats", responseType: APIResponse<OHWRStats>.self)
    }

    func getMarkers(types: String? = nil) async throws -> APIResponse<[OHWRMarker]> {
        var params: [String: String] = [:]
        if let types { params["types"] = types }
        return try await client.get("\(base)/markers", queryParams: params, responseType: APIResponse<[OHWRMarker]>.self)
    }

    func getRegions() async throws -> APIResponse<[OHWRRegion]> {
        try await client.get("\(base)/regions", responseType: APIResponse<[OHWRRegion]>.self)
    }

    // MARK: - Config

    func getAllConfig() async throws -> APIResponse<OHWRConfigAll> {
        try await client.get("\(base)/config/all", responseType: APIResponse<OHWRConfigAll>.self)
    }

    // MARK: - Experts

    func getExperts(page: Int = 1, limit: Int = 20, category: String? = nil, region: String? = nil, search: String? = nil) async throws -> OHWRPaginatedResponse<OHWRExpert> {
        var params: [String: String] = ["page": "\(page)", "limit": "\(limit)"]
        if let category { params["category"] = category }
        if let region { params["region"] = region }
        if let search, !search.isEmpty { params["search"] = search }
        return try await client.get("\(base)/experts", queryParams: params, responseType: OHWRPaginatedResponse<OHWRExpert>.self)
    }

    func getExpertDetail(id: Int) async throws -> APIResponse<OHWRExpert> {
        try await client.get("\(base)/experts/\(id)", responseType: APIResponse<OHWRExpert>.self)
    }

    // MARK: - Organizations

    func getOrganizations(page: Int = 1, limit: Int = 20, type: String? = nil, region: String? = nil, search: String? = nil) async throws -> OHWRPaginatedResponse<OHWROrganization> {
        var params: [String: String] = ["page": "\(page)", "limit": "\(limit)"]
        if let type { params["type"] = type }
        if let region { params["region"] = region }
        if let search, !search.isEmpty { params["search"] = search }
        return try await client.get("\(base)/organizations", queryParams: params, responseType: OHWRPaginatedResponse<OHWROrganization>.self)
    }

    func getOrganizationDetail(id: Int) async throws -> APIResponse<OHWROrganization> {
        try await client.get("\(base)/organizations/\(id)", responseType: APIResponse<OHWROrganization>.self)
    }

    // MARK: - Materials

    func getMaterials(page: Int = 1, limit: Int = 20, type: String? = nil, region: String? = nil, search: String? = nil) async throws -> OHWRPaginatedResponse<OHWRMaterial> {
        var params: [String: String] = ["page": "\(page)", "limit": "\(limit)"]
        if let type { params["type"] = type }
        if let region { params["region"] = region }
        if let search, !search.isEmpty { params["search"] = search }
        return try await client.get("\(base)/materials", queryParams: params, responseType: OHWRPaginatedResponse<OHWRMaterial>.self)
    }

    // MARK: - Documents

    func getDocuments(page: Int = 1, limit: Int = 20, type: String? = nil, search: String? = nil) async throws -> OHWRPaginatedResponse<OHWRDocument> {
        var params: [String: String] = ["page": "\(page)", "limit": "\(limit)"]
        if let type { params["type"] = type }
        if let search, !search.isEmpty { params["search"] = search }
        return try await client.get("\(base)/documents", queryParams: params, responseType: OHWRPaginatedResponse<OHWRDocument>.self)
    }

    func getFeaturedDocuments(limit: Int = 6) async throws -> APIResponse<[OHWRDocument]> {
        try await client.get("\(base)/documents/featured", queryParams: ["limit": "\(limit)"], responseType: APIResponse<[OHWRDocument]>.self)
    }
}
