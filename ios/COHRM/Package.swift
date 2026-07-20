// swift-tools-version: 5.9
// Package.swift
// COHRM Cameroun - Swift Package Manager configuration
//
// This file defines the build configuration for the COHRM iOS app.
// To create an Xcode project from this package:
//   1. Open Xcode
//   2. File > Open > select this Package.swift
//   3. Or run: xcodegen generate (if using XcodeGen)
//
// NOTE: This Package.swift is provided for reference and dependency management.
// For a full iOS app build, an .xcodeproj is required. See XCODE_SETUP.md
// for instructions on creating the Xcode project.

import PackageDescription

let package = Package(
    name: "COHRM",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "COHRMLib",
            targets: ["COHRMLib"]
        ),
    ],
    targets: [
        .target(
            name: "COHRMLib",
            path: "COHRM",
            sources: [
                "App",
                "Core",
                "Features",
                "Models",
                "Services",
                "Theme",
                "Utils",
            ],
            resources: [
                .process("Resources"),
            ]
        ),
        .testTarget(
            name: "COHRMTests",
            dependencies: ["COHRMLib"],
            path: "../COHRMTests"
        ),
    ]
)
