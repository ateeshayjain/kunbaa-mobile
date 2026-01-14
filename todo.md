# Kunbaa Mobile App TODO

## Branding & Setup
- [x] Generate custom app logo
- [x] Update app.config.ts with branding
- [x] Set up color theme in theme.config.js

## Database Schema
- [x] Family members table with relationships
- [x] Events table for calendar
- [x] Photo albums and photos tables
- [x] Chat messages and conversations tables
- [x] User profiles and authentication

Note: Using local AsyncStorage for mobile-first approach

## Core Features - Family Tree
- [x] Family tree data model and API
- [x] Interactive tree visualization component
- [x] Member node component with profile photo
- [ ] Zoom and pan gestures for tree navigation
- [x] Add new member form
- [ ] Edit member functionality
- [x] Relationship management (parent, child, spouse, sibling)
- [x] Generation tracking and display

## Core Features - Member Profiles
- [ ] Member profile screen layout
- [ ] Profile photo upload and display
- [ ] Personal information sections
- [ ] Family connections display
- [ ] Edit profile functionality
- [ ] Contact quick actions (call, message)

## Core Features - Events Calendar
- [ ] Calendar view component (month view)
- [ ] Event list display
- [ ] Event detail screen
- [ ] Create event form
- [ ] Edit/delete event functionality
- [ ] Event categories and filtering
- [ ] RSVP/attendance tracking
- [ ] Event reminders and notifications

## Core Features - Photo Albums
- [ ] Albums list screen
- [ ] Album detail with photo grid
- [ ] Photo upload functionality
- [ ] Fullscreen photo viewer
- [ ] Photo tagging (tag family members)
- [ ] Photo comments and reactions
- [ ] Album creation and management
- [ ] Photo sharing

## Core Features - Chat
- [ ] Conversation list screen
- [ ] Chat message display
- [ ] Send text messages
- [ ] Real-time message updates
- [ ] Message reactions
- [ ] Group chat creation
- [ ] Chat notifications
- [ ] Typing indicators
- [ ] Read receipts

## Home Dashboard
- [x] Activity feed component
- [x] Quick stats cards
- [x] Recent updates display
- [x] Quick action buttons
- [x] Pull-to-refresh functionality

## Navigation & UI
- [x] Bottom tab navigation setup
- [x] Tab icons mapping
- [x] Screen transitions
- [ ] Modal sheets for forms
- [ ] Loading states and skeletons
- [ ] Error handling and messages
- [x] Empty states

## User Experience
- [ ] Haptic feedback on interactions
- [ ] Press states for buttons
- [ ] Smooth animations
- [ ] Offline support indicators
- [ ] Search functionality
- [ ] Filter and sort options

## Settings & Profile
- [ ] User settings screen
- [ ] Notification preferences
- [ ] Privacy settings
- [ ] Theme toggle (light/dark)
- [ ] Profile editing
- [ ] Logout functionality

## Testing & Polish
- [ ] Test all user flows
- [ ] Verify data persistence
- [ ] Check responsive layouts
- [ ] Test on iOS and Android
- [ ] Performance optimization
- [ ] Accessibility improvements


## Google Gemini AI Integration
- [x] Request and configure Google Gemini API key
- [x] Set up AI service integration in the app
- [x] Implement AI-powered relationship suggestions
- [x] Add AI assistant for family tree navigation

## Advanced Family Tree Features
- [x] Implement bidirectional relationship auto-linking
- [x] Add "In-Law" propagation logic
- [x] Create dynamic rooted tree view (Ego View)
- [x] Implement tree re-rooting/focus navigation
- [x] Add "View Tree" / "Focus" on member tap
- [x] Create "Find Person" search functionality
- [x] Add "Starting Point" prompt for tree view selection

## Add Member Forms
- [x] Create Add Parent form with auto-linking
- [x] Create Add Spouse form with bidirectional link
- [x] Create Add Sibling form with parent sharing prompt
- [x] Create Add Child form
- [x] Implement intelligent relationship type suggestions


## Kaka AI - Actionable Features (High Impact)
- [x] Natural language data entry parsing
- [x] Pre-fill add member form from AI parsing
- [ ] Smart reminder creation from chat
- [x] Action confirmation dialogs
- [x] Intent detection for CRUD operations

## Kaka AI - Scalable Knowledge (RAG)
- [x] Implement member embedding/indexing
- [x] Context-aware member retrieval
- [x] Relationship path computation for queries
- [x] Support for 1000+ member families

## Kaka AI - Visual Intelligence
- [ ] Photo upload to chat
- [ ] Member tagging suggestions
- [ ] Photo search by description

## Kaka AI - Narrative Generation
- [x] Auto-generate member biographies
- [x] Monthly family newsletter summary
- [ ] Timeline event storytelling
