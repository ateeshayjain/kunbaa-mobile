# Kunbaa Family Hub - Mobile App Design

## Overview
Kunbaa is a comprehensive family connection platform designed for mobile-first experience. The app enables families to stay connected through an interactive family tree, shared events, photos, and real-time communication. The design follows Apple Human Interface Guidelines for a native iOS feel while supporting Android.

## Design Principles
- **Mobile Portrait Orientation (9:16)**: All screens optimized for one-handed usage
- **Native iOS Feel**: Follows Apple HIG with familiar navigation patterns
- **Clarity First**: Clean, uncluttered interfaces with clear visual hierarchy
- **Family-Centric**: Warm, welcoming design that brings families together

## Color Palette
- **Primary**: `#8B4513` (Saddle Brown) - Represents family roots and heritage
- **Secondary**: `#D4AF37` (Gold) - Warmth and celebration
- **Background**: White (#FFFFFF) / Dark (#151718)
- **Surface**: Light Gray (#F5F5F5) / Dark Gray (#1E2022)
- **Accent**: `#4A7C59` (Forest Green) - Growth and connection
- **Success**: Green for positive actions
- **Warning**: Amber for alerts
- **Error**: Red for critical issues

## Screen List & Layout

### 1. Home Screen (Dashboard)
**Primary Content:**
- Welcome header with user's profile photo
- Quick stats card (total family members, upcoming events, unread messages)
- Recent activity feed (birthdays, anniversaries, new photos, updates)
- Quick action buttons (Add Member, Create Event, Upload Photo, Start Chat)

**Functionality:**
- Pull-to-refresh for latest updates
- Tap stats to navigate to respective sections
- Tap activity items to view details
- Bottom tab navigation always visible

### 2. Family Tree Screen
**Primary Content:**
- Interactive tree visualization showing generational hierarchy
- Zoomable/pannable canvas with pinch gestures
- Member nodes with profile photos and names
- Generation labels (Gen 1, Gen 2, etc.)
- Relationship lines connecting family members

**Functionality:**
- Tap member node to view profile
- Long-press for quick actions (Edit, Add Child, Add Spouse)
- Filter by generation or family branch
- Search members by name
- Add new member floating action button

### 3. Member Profile Screen
**Primary Content:**
- Large profile photo at top
- Name, relationship, and generation badge
- Personal information sections (collapsible):
  - Basic Info (DOB, age, location)
  - Contact Details (phone, email, social media)
  - Family Connections (parents, spouse, children, siblings)
  - Bio/Notes
- Recent activity by this member
- Shared photos featuring this member

**Functionality:**
- Edit button (top-right) for authorized users
- Call/Message quick actions
- View family connections (tap to navigate)
- Scroll through shared content

### 4. Events Calendar Screen
**Primary Content:**
- Month view calendar with event indicators
- Upcoming events list below calendar
- Event categories (Birthdays, Anniversaries, Gatherings, Holidays)
- Color-coded event types

**Functionality:**
- Swipe between months
- Tap date to view events
- Tap event to see details
- Add event floating action button
- Filter by event type
- Set reminders/notifications

### 5. Event Detail Screen
**Primary Content:**
- Event title and type badge
- Date, time, and location
- Description/notes
- Attendee list with profile photos
- Related photos from the event
- Comments section

**Functionality:**
- RSVP/attendance tracking
- Add to device calendar
- Share event details
- Upload event photos
- Post comments

### 6. Photo Albums Screen
**Primary Content:**
- Grid of album covers with titles
- Album metadata (photo count, date range)
- Recent photos section at top
- Family group albums

**Functionality:**
- Tap album to view photos
- Create new album
- Upload photos to albums
- Search photos by date or people
- Share albums with family members

### 7. Album Detail Screen
**Primary Content:**
- Album title and description
- Photo grid (3 columns)
- Photo metadata (date, uploader, tagged members)

**Functionality:**
- Tap photo for fullscreen view
- Swipe between photos
- Tag family members in photos
- Download photos
- Add comments/reactions
- Share photos

### 8. Chat Screen
**Primary Content:**
- List of conversations (direct and group chats)
- Chat preview (last message, timestamp, unread badge)
- Family group chat rooms
- Birthday-specific chat rooms

**Functionality:**
- Tap to open conversation
- Swipe to delete/archive
- Search conversations
- Create new group chat
- Filter by chat type

### 9. Conversation Screen
**Primary Content:**
- Chat header (participant names/photos)
- Message bubbles (sent/received)
- Timestamp groups
- Message reactions
- Read receipts
- Input field with send button

**Functionality:**
- Send text messages
- Share photos from gallery
- React to messages (emoji)
- Reply to specific messages
- Real-time message updates
- Typing indicators

### 10. Profile Settings Screen
**Primary Content:**
- User profile section (edit photo, name, bio)
- Account settings
- Notification preferences
- Privacy settings
- Theme toggle (light/dark)
- About/Help section

**Functionality:**
- Update profile information
- Manage notification settings
- Control privacy preferences
- Switch theme
- Log out

## Key User Flows

### Flow 1: View Family Tree → View Member Profile
1. User taps "Family Tree" tab in bottom navigation
2. Tree visualization loads with all family members
3. User pinches to zoom or pans to navigate
4. User taps on a family member node
5. Member profile screen slides up from bottom
6. User views profile details and can edit if authorized

### Flow 2: Add New Family Member
1. User taps floating "+" button on Family Tree screen
2. "Add Family Member" sheet appears from bottom
3. User fills in basic information (name, relationship, DOB)
4. User selects parent(s) to establish tree connection
5. User optionally adds photo and additional details
6. User taps "Save"
7. New member appears in family tree
8. Success message confirms addition

### Flow 3: Create Family Event
1. User taps "Events" tab in bottom navigation
2. User taps "+" button to create event
3. Event creation sheet appears
4. User enters event details (title, date, time, type, location)
5. User selects attendees from family members
6. User optionally adds description and photo
7. User taps "Create Event"
8. Event appears in calendar
9. Notifications sent to attendees

### Flow 4: Upload and Share Photos
1. User taps "Albums" tab in bottom navigation
2. User selects an album or creates new one
3. User taps "Upload Photos" button
4. Photo picker opens with gallery access
5. User selects multiple photos
6. User optionally tags family members in photos
7. User adds captions/descriptions
8. User taps "Upload"
9. Photos appear in album
10. Activity feed notifies family members

### Flow 5: Start Group Chat
1. User taps "Chat" tab in bottom navigation
2. User taps "New Chat" button
3. User selects "Group Chat"
4. User selects family members to include
5. User names the group chat
6. User taps "Create"
7. Group chat appears in conversation list
8. User can immediately send first message

## Navigation Structure

### Bottom Tab Bar (Always Visible)
- **Home** (house icon): Dashboard with activity feed
- **Tree** (tree icon): Interactive family tree
- **Events** (calendar icon): Family calendar and events
- **Albums** (photo icon): Photo albums and galleries
- **Chat** (message icon): Conversations and messaging

### Navigation Patterns
- **Tab Navigation**: Primary navigation via bottom tabs
- **Stack Navigation**: Drill-down within each tab (push/pop)
- **Modal Sheets**: Forms and quick actions (slide up from bottom)
- **Fullscreen Modals**: Photo viewer, video player
- **Gestures**: Swipe back, pull-to-refresh, pinch-to-zoom

## Component Patterns

### Cards
- Rounded corners (12px radius)
- Subtle shadow for elevation
- White background (light) / Dark surface (dark)
- Padding: 16px
- Used for: Activity items, event cards, member cards

### Lists
- Dividers between items (subtle gray)
- Swipe actions for delete/archive
- Pull-to-refresh at top
- Infinite scroll for long lists

### Buttons
- **Primary**: Filled with primary color, white text
- **Secondary**: Outlined with primary color
- **Tertiary**: Text only, primary color
- Rounded corners (8px)
- Height: 44px (minimum touch target)

### Forms
- Clear labels above inputs
- Input fields with subtle borders
- Validation messages below fields
- Required field indicators (*)
- Save/Cancel buttons at bottom

### Images
- Profile photos: Circular with border
- Event/Album covers: Rounded rectangles (8px radius)
- Photo grid: Square thumbnails with 2px gaps
- Lazy loading for performance

## Interaction Patterns

### Gestures
- **Tap**: Select item, open detail, trigger action
- **Long Press**: Context menu, quick actions
- **Swipe**: Navigate back, delete item, reveal actions
- **Pinch**: Zoom in/out (family tree, photos)
- **Pan**: Scroll, navigate tree canvas
- **Pull Down**: Refresh content

### Feedback
- **Haptics**: Light tap on button press, medium on toggle
- **Visual**: Button scale (0.97) on press, opacity change
- **Loading**: Spinner for async operations
- **Success**: Checkmark animation, success message
- **Error**: Shake animation, error message

### Animations
- Screen transitions: Slide (300ms)
- Modal appearance: Slide up (250ms)
- List item appearance: Fade in (200ms)
- Button press: Scale (80ms)
- Loading states: Skeleton screens

## Accessibility
- Minimum touch target: 44x44 points
- Text contrast ratio: 4.5:1 (WCAG AA)
- Dynamic type support (scalable text)
- VoiceOver labels for all interactive elements
- Semantic HTML for screen readers
- Keyboard navigation support (web)

## Performance Considerations
- Lazy load images and heavy components
- Virtualized lists for large datasets (FlatList)
- Optimistic UI updates for better perceived performance
- Cache frequently accessed data (AsyncStorage)
- Compress uploaded photos before sending
- Pagination for large data sets (events, photos, messages)

## Offline Support
- Cache family tree data locally
- Queue messages for sending when online
- Show offline indicator in UI
- Sync data when connection restored
- Local photo storage before upload

## Privacy & Security
- Role-based access control (Admin, Editor, Viewer)
- Privacy settings for profile information
- Option to hide sensitive data (health info, social media)
- Secure authentication (OAuth, biometrics)
- End-to-end encryption for chat (future consideration)
