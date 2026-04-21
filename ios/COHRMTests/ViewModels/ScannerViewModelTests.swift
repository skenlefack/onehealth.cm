// ScannerViewModelTests.swift
// COHRM Cameroun - Tests for ReportViewModel (wizard state machine)

import XCTest
@testable import COHRM

final class ScannerViewModelTests: XCTestCase {

    var viewModel: ReportViewModel!

    override func setUp() {
        super.setUp()
        // Clear any saved draft before each test
        UserDefaults.standard.removeObject(forKey: "cohrm_report_draft")
        UserDefaults.standard.removeObject(forKey: "cohrm_report_draft_photos_count")
        viewModel = ReportViewModel()
    }

    override func tearDown() {
        viewModel?.clearDraft()
        viewModel = nil
        super.tearDown()
    }

    // MARK: - Initial State

    func testInitialState_currentStepIsOne() {
        XCTAssertEqual(viewModel.currentStep, 1)
    }

    func testInitialState_totalStepsIsFive() {
        XCTAssertEqual(viewModel.totalSteps, 5)
    }

    func testInitialState_isNotSubmitting() {
        XCTAssertFalse(viewModel.isSubmitting)
    }

    func testInitialState_didNotSubmitSuccessfully() {
        XCTAssertFalse(viewModel.didSubmitSuccessfully)
    }

    func testInitialState_noSubmitError() {
        XCTAssertNil(viewModel.submitError)
    }

    func testInitialState_createdReportCodeIsNil() {
        XCTAssertNil(viewModel.createdReportCode)
    }

    func testInitialState_isFirstStep() {
        XCTAssertTrue(viewModel.isFirstStep)
    }

    func testInitialState_isNotLastStep() {
        XCTAssertFalse(viewModel.isLastStep)
    }

    func testInitialState_photosAreEmpty() {
        XCTAssertTrue(viewModel.selectedPhotos.isEmpty)
    }

    func testInitialState_reportDataIsEmpty() {
        XCTAssertTrue(viewModel.reportData.category.isEmpty)
        XCTAssertTrue(viewModel.reportData.region.isEmpty)
        XCTAssertTrue(viewModel.reportData.title.isEmpty)
        XCTAssertTrue(viewModel.reportData.description.isEmpty)
    }

    // MARK: - Step Navigation

    func testNextStep_withoutValidData_doesNotAdvance() {
        // Step 1 requires non-empty category
        XCTAssertEqual(viewModel.currentStep, 1)
        viewModel.nextStep()
        XCTAssertEqual(viewModel.currentStep, 1, "Should not advance past step 1 without a category")
    }

    func testNextStep_withValidCategory_advancesToStep2() {
        viewModel.reportData.category = "human_health"
        viewModel.nextStep()
        XCTAssertEqual(viewModel.currentStep, 2)
    }

    func testNextStep_withValidStep2_advancesToStep3() {
        viewModel.reportData.category = "human_health"
        viewModel.nextStep() // -> step 2
        viewModel.reportData.region = "Centre"
        viewModel.nextStep() // -> step 3
        XCTAssertEqual(viewModel.currentStep, 3)
    }

    func testNextStep_withValidStep3_advancesToStep4() {
        viewModel.reportData.category = "human_health"
        viewModel.nextStep() // -> step 2
        viewModel.reportData.region = "Centre"
        viewModel.nextStep() // -> step 3
        viewModel.reportData.title = "Test Title"
        viewModel.reportData.description = "Test Description"
        viewModel.nextStep() // -> step 4
        XCTAssertEqual(viewModel.currentStep, 4)
    }

    func testNextStep_step4Anonymous_advancesToStep5() {
        advanceToStep(4)
        viewModel.reportData.isAnonymous = true
        viewModel.nextStep() // -> step 5
        XCTAssertEqual(viewModel.currentStep, 5)
        XCTAssertTrue(viewModel.isLastStep)
    }

    func testNextStep_step4NonAnonymousWithoutInfo_doesNotAdvance() {
        advanceToStep(4)
        viewModel.reportData.isAnonymous = false
        viewModel.reportData.reporterName = ""
        viewModel.reportData.reporterPhone = ""
        viewModel.nextStep()
        XCTAssertEqual(viewModel.currentStep, 4, "Should not advance without reporter info when non-anonymous")
    }

    func testNextStep_step4NonAnonymousWithValidInfo_advances() {
        advanceToStep(4)
        viewModel.reportData.isAnonymous = false
        viewModel.reportData.reporterName = "Jean Dupont"
        viewModel.reportData.reporterPhone = "691234567"
        viewModel.nextStep()
        XCTAssertEqual(viewModel.currentStep, 5)
    }

    func testNextStep_atLastStep_doesNotGoFurther() {
        advanceToStep(5)
        viewModel.nextStep()
        XCTAssertEqual(viewModel.currentStep, 5, "Should not exceed step 5")
    }

    func testPreviousStep_atStep1_doesNotGoBelow() {
        XCTAssertEqual(viewModel.currentStep, 1)
        viewModel.previousStep()
        XCTAssertEqual(viewModel.currentStep, 1, "Should not go below step 1")
    }

    func testPreviousStep_atStep3_goesToStep2() {
        advanceToStep(3)
        viewModel.previousStep()
        XCTAssertEqual(viewModel.currentStep, 2)
    }

    // MARK: - canProceed Validation

    func testCanProceed_step1_requiresCategory() {
        viewModel.reportData.category = ""
        XCTAssertFalse(viewModel.canProceed)

        viewModel.reportData.category = "human_health"
        XCTAssertTrue(viewModel.canProceed)
    }

    func testCanProceed_step2_requiresRegion() {
        viewModel.reportData.category = "human_health"
        viewModel.nextStep()
        XCTAssertEqual(viewModel.currentStep, 2)

        viewModel.reportData.region = ""
        XCTAssertFalse(viewModel.canProceed)

        viewModel.reportData.region = "Centre"
        XCTAssertTrue(viewModel.canProceed)
    }

    func testCanProceed_step3_requiresTitleAndDescription() {
        advanceToStep(3)

        viewModel.reportData.title = ""
        viewModel.reportData.description = ""
        XCTAssertFalse(viewModel.canProceed)

        viewModel.reportData.title = "Title"
        viewModel.reportData.description = ""
        XCTAssertFalse(viewModel.canProceed)

        viewModel.reportData.title = ""
        viewModel.reportData.description = "Description"
        XCTAssertFalse(viewModel.canProceed)

        viewModel.reportData.title = "Title"
        viewModel.reportData.description = "Description"
        XCTAssertTrue(viewModel.canProceed)
    }

    func testCanProceed_step3_whitespaceOnlyIsInvalid() {
        advanceToStep(3)
        viewModel.reportData.title = "   "
        viewModel.reportData.description = "   "
        XCTAssertFalse(viewModel.canProceed)
    }

    // MARK: - Symptom Management

    func testToggleSymptom_addsSymptom() {
        XCTAssertFalse(viewModel.isSymptomSelected(.FI))
        viewModel.toggleSymptom(.FI)
        XCTAssertTrue(viewModel.isSymptomSelected(.FI))
    }

    func testToggleSymptom_removesSymptom() {
        viewModel.toggleSymptom(.FI)
        XCTAssertTrue(viewModel.isSymptomSelected(.FI))
        viewModel.toggleSymptom(.FI)
        XCTAssertFalse(viewModel.isSymptomSelected(.FI))
    }

    func testToggleSymptom_multipleSymptoms() {
        viewModel.toggleSymptom(.FI)
        viewModel.toggleSymptom(.VO)
        viewModel.toggleSymptom(.DI)
        XCTAssertTrue(viewModel.isSymptomSelected(.FI))
        XCTAssertTrue(viewModel.isSymptomSelected(.VO))
        XCTAssertTrue(viewModel.isSymptomSelected(.DI))
        XCTAssertFalse(viewModel.isSymptomSelected(.TO))
        XCTAssertEqual(viewModel.reportData.symptoms.count, 3)
    }

    // MARK: - Photo Management

    func testCanAddPhotos_initiallyTrue() {
        XCTAssertTrue(viewModel.canAddPhotos)
    }

    func testMaxPhotos_isFive() {
        XCTAssertEqual(viewModel.maxPhotos, 5)
    }

    func testRemovePhoto_atValidIndex_removesPhoto() {
        // We can't easily create UIImage in tests without a bundle,
        // but we can test with empty image
        let image = UIImage()
        viewModel.selectedPhotos = [image]
        XCTAssertEqual(viewModel.selectedPhotos.count, 1)
        viewModel.removePhoto(at: 0)
        XCTAssertTrue(viewModel.selectedPhotos.isEmpty)
    }

    func testRemovePhoto_atInvalidIndex_doesNothing() {
        viewModel.removePhoto(at: 10)
        XCTAssertTrue(viewModel.selectedPhotos.isEmpty)
    }

    func testRemovePhoto_atNegativeIndex_doesNothing() {
        let image = UIImage()
        viewModel.selectedPhotos = [image]
        viewModel.removePhoto(at: -1)
        XCTAssertEqual(viewModel.selectedPhotos.count, 1)
    }

    // MARK: - Category / Species Selection

    func testSelectedCategory_getterFromReportData() {
        viewModel.reportData.category = "human_health"
        XCTAssertEqual(viewModel.selectedCategory, .humanHealth)
    }

    func testSelectedCategory_setterUpdatesReportData() {
        viewModel.selectedCategory = .animalHealth
        XCTAssertEqual(viewModel.reportData.category, "animal_health")
    }

    func testSelectedCategory_setterResetsSpecies() {
        viewModel.reportData.species = "BOV"
        viewModel.selectedCategory = .environmental
        XCTAssertTrue(viewModel.reportData.species.isEmpty,
                       "Changing category should reset species")
    }

    func testSelectedCategory_invalidRawValue_returnsNil() {
        viewModel.reportData.category = "invalid_category"
        XCTAssertNil(viewModel.selectedCategory)
    }

    func testSelectedSpecies_getterAndSetter() {
        viewModel.selectedSpecies = .BOV
        XCTAssertEqual(viewModel.reportData.species, "BOV")
        XCTAssertEqual(viewModel.selectedSpecies, .BOV)
    }

    // MARK: - Reset Form

    func testResetForm_clearsAllState() {
        viewModel.reportData.category = "human_health"
        viewModel.reportData.title = "Test"
        viewModel.currentStep = 3
        viewModel.isSubmitting = true
        viewModel.didSubmitSuccessfully = true
        viewModel.submitError = "Some error"
        viewModel.createdReportCode = "OH-12345"

        viewModel.resetForm()

        XCTAssertEqual(viewModel.currentStep, 1)
        XCTAssertTrue(viewModel.reportData.category.isEmpty)
        XCTAssertTrue(viewModel.reportData.title.isEmpty)
        XCTAssertTrue(viewModel.selectedPhotos.isEmpty)
        XCTAssertFalse(viewModel.isSubmitting)
        XCTAssertFalse(viewModel.didSubmitSuccessfully)
        XCTAssertNil(viewModel.submitError)
        XCTAssertNil(viewModel.createdReportCode)
    }

    // MARK: - Button Titles

    func testNextButtonIcon_atLastStep_isPaperplane() {
        advanceToStep(5)
        XCTAssertEqual(viewModel.nextButtonIcon, "paperplane.fill")
    }

    func testNextButtonIcon_atOtherStep_isChevron() {
        XCTAssertEqual(viewModel.nextButtonIcon, "chevron.right")
    }

    // MARK: - Step Labels

    func testStepLabels_hasFiveEntries() {
        XCTAssertEqual(ReportViewModel.stepLabels.count, 5)
    }

    // MARK: - Helpers

    /// Advances the wizard to the specified step by setting valid data for each prior step
    private func advanceToStep(_ target: Int) {
        viewModel.reportData.category = "human_health"
        if target > 1 {
            viewModel.nextStep() // -> 2
            viewModel.reportData.region = "Centre"
        }
        if target > 2 {
            viewModel.nextStep() // -> 3
            viewModel.reportData.title = "Test Title"
            viewModel.reportData.description = "Test Description"
        }
        if target > 3 {
            viewModel.nextStep() // -> 4
            viewModel.reportData.isAnonymous = true
        }
        if target > 4 {
            viewModel.nextStep() // -> 5
        }
    }
}
