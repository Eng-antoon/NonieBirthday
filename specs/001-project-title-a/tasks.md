# Tasks: Birthday Surprise Website

**Input**: Design documents from `/specs/001-project-title-a/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack (Vite + GSAP + Cloudinary), libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
   → quickstart.md: Extract test scenarios → validation tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, components
   → Integration: media loading, animations
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All components implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `src/` at repository root
- **Build output**: `dist/`
- **Tests**: `tests/`

## Phase 3.1: Setup
- [ ] T001 Create project structure per implementation plan (src/components/, src/data/, src/styles/, src/utils/)
- [ ] T002 Initialize Vite project with GSAP and Cloudinary dependencies
- [ ] T003 [P] Configure ESLint and Prettier for code formatting
- [ ] T004 [P] Set up environment configuration (.env template)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T005 [P] Contract test data interface loadSiteData() in tests/contract/test_data_interface.js
- [ ] T006 [P] Contract test Cloudinary URL generation in tests/contract/test_media_urls.js
- [ ] T007 [P] Contract test slideshow controller interface in tests/contract/test_slideshow.js
- [ ] T008 [P] Integration test hero section animation sequence in tests/integration/test_hero_animations.js
- [ ] T009 [P] Integration test gallery slideshow functionality in tests/integration/test_gallery_slideshow.js
- [ ] T010 [P] Integration test video section loading in tests/integration/test_video_section.js
- [ ] T011 [P] Integration test message cards scroll animations in tests/integration/test_message_cards.js
- [ ] T012 [P] Integration test mobile responsiveness in tests/integration/test_mobile_responsive.js

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T013 [P] SiteContent model with validation in src/data/models/SiteContent.js
- [ ] T014 [P] PhotoSlide model with validation in src/data/models/PhotoSlide.js
- [ ] T015 [P] VideoMessage model with validation in src/data/models/VideoMessage.js
- [ ] T016 [P] DigitalCard model with validation in src/data/models/DigitalCard.js
- [ ] T017 [P] Data loader service with validation in src/utils/dataLoader.js
- [ ] T018 [P] Cloudinary URL generator utility in src/utils/cloudinaryUtils.js
- [ ] T019 [P] Firebase video URL processor in src/utils/videoUtils.js
- [ ] T020 [P] Hero section component in src/components/HeroSection.js
- [ ] T021 [P] Photo gallery component in src/components/PhotoGallery.js
- [ ] T022 [P] Video section component in src/components/VideoSection.js
- [ ] T023 [P] Message cards component in src/components/MessageCards.js
- [ ] T024 Create main site data file in src/data/siteData.js
- [ ] T025 Implement slideshow controller with GSAP animations in src/utils/slideshowController.js
- [ ] T026 Implement scroll trigger animations setup in src/utils/scrollAnimations.js
- [ ] T027 Create main CSS with mobile-first responsive design in src/styles/main.css
- [ ] T028 Implement main application initialization in src/main.js

## Phase 3.4: Integration
- [ ] T029 Connect data loader to all components
- [ ] T030 Initialize GSAP animations and scroll triggers
- [ ] T031 Set up media loading with error handling and fallbacks
- [ ] T032 Implement touch/swipe controls for mobile gallery
- [ ] T033 Add accessibility features (alt text, keyboard navigation, reduced motion)
- [ ] T034 Configure performance optimizations (lazy loading, preloading)

## Phase 3.5: Polish
- [ ] T035 [P] Unit tests for data validation utilities in tests/unit/test_data_validation.js
- [ ] T036 [P] Unit tests for URL generation utilities in tests/unit/test_url_utils.js
- [ ] T037 [P] Unit tests for animation utilities in tests/unit/test_animation_utils.js
- [ ] T038 Performance optimization for 60fps animations and <3s load time
- [ ] T039 Cross-browser compatibility testing and fixes
- [ ] T040 [P] Update deployment configuration for GitHub Pages
- [ ] T041 Run complete testing scenarios from quickstart.md
- [ ] T042 Code cleanup and remove any placeholder content

## Dependencies
- Setup (T001-T004) before Tests (T005-T012)
- Tests (T005-T012) before implementation (T013-T028)
- Models (T013-T016) before services (T017-T019)
- Components (T020-T023) depend on models and services
- T024 (siteData.js) blocks T025-T028
- Integration (T029-T034) requires all core implementation
- Polish (T035-T042) requires all previous phases

## Parallel Example
```
# Launch T005-T012 together (Contract and Integration Tests):
Task: "Contract test data interface loadSiteData() in tests/contract/test_data_interface.js"
Task: "Contract test Cloudinary URL generation in tests/contract/test_media_urls.js"
Task: "Contract test slideshow controller interface in tests/contract/test_slideshow.js"
Task: "Integration test hero section animation sequence in tests/integration/test_hero_animations.js"
Task: "Integration test gallery slideshow functionality in tests/integration/test_gallery_slideshow.js"
Task: "Integration test video section loading in tests/integration/test_video_section.js"
Task: "Integration test message cards scroll animations in tests/integration/test_message_cards.js"
Task: "Integration test mobile responsiveness in tests/integration/test_mobile_responsive.js"

# Launch T013-T023 together (Models and Components):
Task: "SiteContent model with validation in src/data/models/SiteContent.js"
Task: "PhotoSlide model with validation in src/data/models/PhotoSlide.js"
Task: "VideoMessage model with validation in src/data/models/VideoMessage.js"
Task: "DigitalCard model with validation in src/data/models/DigitalCard.js"
Task: "Data loader service with validation in src/utils/dataLoader.js"
Task: "Cloudinary URL generator utility in src/utils/cloudinaryUtils.js"
Task: "Firebase video URL processor in src/utils/videoUtils.js"
Task: "Hero section component in src/components/HeroSection.js"
Task: "Photo gallery component in src/components/PhotoGallery.js"
Task: "Video section component in src/components/VideoSection.js"
Task: "Message cards component in src/components/MessageCards.js"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Use npm run dev for development server testing
- Use npm run build before deployment
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - data-interface.md → loadSiteData(), validation, URL generation tests
   - Each interface method → implementation task

2. **From Data Model**:
   - SiteContent entity → model creation task [P]
   - PhotoSlide entity → model creation task [P]
   - VideoMessage entity → model creation task [P]
   - DigitalCard entity → model creation task [P]

3. **From Quickstart Scenarios**:
   - Hero section test → integration test [P]
   - Gallery slideshow test → integration test [P]
   - Video section test → integration test [P]
   - Message cards test → integration test [P]
   - Mobile responsiveness test → integration test [P]

4. **Ordering**:
   - Setup → Tests → Models → Services → Components → Integration → Polish
   - GSAP animations depend on components being ready
   - Media loading depends on URL utilities

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (data-interface.md → T005-T007)
- [x] All entities have model tasks (SiteContent, PhotoSlide, VideoMessage, DigitalCard → T013-T016)
- [x] All tests come before implementation (T005-T012 before T013-T028)
- [x] Parallel tasks truly independent (different files marked [P])
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] All quickstart scenarios have corresponding integration tests
- [x] All critical user journeys covered (hero → gallery → video → messages)