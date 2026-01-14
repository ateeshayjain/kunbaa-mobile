// Core data types for Kunbaa Family Hub

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName?: string;
  nickname?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  dateOfDeath?: string;
  profilePhoto?: string;
  bio?: string;
  location?: string;
  phone?: string;
  email?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  generation: number;
  isBornIntoFamily: boolean;
  isAlive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Relationship {
  id: string;
  memberId: string;
  relatedMemberId: string;
  relationshipType: 'parent' | 'child' | 'spouse' | 'sibling';
  createdAt: string;
}

export interface Marriage {
  id: string;
  spouse1Id: string;
  spouse2Id: string;
  marriageDate?: string;
  divorceDate?: string;
  status: 'married' | 'divorced' | 'separated' | 'widowed';
  hideExSpouse: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: 'birthday' | 'anniversary' | 'gathering' | 'holiday';
  eventDate: string;
  endDate?: string;
  location?: string;
  coverPhoto?: string;
  isRecurring: boolean;
  recurringPattern?: string;
  attendees: string[]; // member IDs
  createdAt: string;
  updatedAt: string;
}

export interface Album {
  id: string;
  title: string;
  description?: string;
  coverPhoto?: string;
  eventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  albumId: string;
  photoUrl: string;
  caption?: string;
  takenDate?: string;
  taggedMembers: string[]; // member IDs
  createdAt: string;
}

export interface Conversation {
  id: string;
  title?: string;
  isGroupChat: boolean;
  participants: string[]; // user IDs
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  messageText?: string;
  messageType: 'text' | 'image' | 'video' | 'audio';
  mediaUrl?: string;
  replyToId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  activityType: 'post' | 'photo_upload' | 'event_created' | 'member_added' | 'birthday' | 'anniversary';
  activityText: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  notificationType: string;
  notificationText: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
}
