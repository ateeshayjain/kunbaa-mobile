import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FamilyMember, Relationship, Event, Album, Photo, Conversation, Message, Activity } from './types';

// Storage keys
const KEYS = {
  FAMILY_MEMBERS: '@kunbaa/family_members',
  RELATIONSHIPS: '@kunbaa/relationships',
  EVENTS: '@kunbaa/events',
  ALBUMS: '@kunbaa/albums',
  PHOTOS: '@kunbaa/photos',
  CONVERSATIONS: '@kunbaa/conversations',
  MESSAGES: '@kunbaa/messages',
  ACTIVITIES: '@kunbaa/activities',
};

// Generic storage functions
async function getItem<T>(key: string): Promise<T[]> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return [];
  }
}

async function setItem<T>(key: string, data: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
  }
}

// Family Members
export async function getFamilyMembers(): Promise<FamilyMember[]> {
  return getItem<FamilyMember>(KEYS.FAMILY_MEMBERS);
}

export async function saveFamilyMember(member: FamilyMember): Promise<void> {
  const members = await getFamilyMembers();
  const index = members.findIndex(m => m.id === member.id);
  if (index >= 0) {
    members[index] = member;
  } else {
    members.push(member);
  }
  await setItem(KEYS.FAMILY_MEMBERS, members);
}

export async function deleteFamilyMember(id: string): Promise<void> {
  const members = await getFamilyMembers();
  const filtered = members.filter(m => m.id !== id);
  await setItem(KEYS.FAMILY_MEMBERS, filtered);
}

// Relationships
export async function getRelationships(): Promise<Relationship[]> {
  return getItem<Relationship>(KEYS.RELATIONSHIPS);
}

export async function saveRelationship(relationship: Relationship): Promise<void> {
  const relationships = await getRelationships();
  const index = relationships.findIndex(r => r.id === relationship.id);
  if (index >= 0) {
    relationships[index] = relationship;
  } else {
    relationships.push(relationship);
  }
  await setItem(KEYS.RELATIONSHIPS, relationships);
}

export async function deleteRelationship(id: string): Promise<void> {
  const relationships = await getRelationships();
  const filtered = relationships.filter(r => r.id !== id);
  await setItem(KEYS.RELATIONSHIPS, filtered);
}

// Events
export async function getEvents(): Promise<Event[]> {
  return getItem<Event>(KEYS.EVENTS);
}

export async function saveEvent(event: Event): Promise<void> {
  const events = await getEvents();
  const index = events.findIndex(e => e.id === event.id);
  if (index >= 0) {
    events[index] = event;
  } else {
    events.push(event);
  }
  await setItem(KEYS.EVENTS, events);
}

export async function deleteEvent(id: string): Promise<void> {
  const events = await getEvents();
  const filtered = events.filter(e => e.id !== id);
  await setItem(KEYS.EVENTS, filtered);
}

// Albums
export async function getAlbums(): Promise<Album[]> {
  return getItem<Album>(KEYS.ALBUMS);
}

export async function saveAlbum(album: Album): Promise<void> {
  const albums = await getAlbums();
  const index = albums.findIndex(a => a.id === album.id);
  if (index >= 0) {
    albums[index] = album;
  } else {
    albums.push(album);
  }
  await setItem(KEYS.ALBUMS, albums);
}

export async function deleteAlbum(id: string): Promise<void> {
  const albums = await getAlbums();
  const filtered = albums.filter(a => a.id !== id);
  await setItem(KEYS.ALBUMS, filtered);
}

// Photos
export async function getPhotos(): Promise<Photo[]> {
  return getItem<Photo>(KEYS.PHOTOS);
}

export async function savePhoto(photo: Photo): Promise<void> {
  const photos = await getPhotos();
  const index = photos.findIndex(p => p.id === photo.id);
  if (index >= 0) {
    photos[index] = photo;
  } else {
    photos.push(photo);
  }
  await setItem(KEYS.PHOTOS, photos);
}

export async function deletePhoto(id: string): Promise<void> {
  const photos = await getPhotos();
  const filtered = photos.filter(p => p.id !== id);
  await setItem(KEYS.PHOTOS, filtered);
}

// Conversations
export async function getConversations(): Promise<Conversation[]> {
  return getItem<Conversation>(KEYS.CONVERSATIONS);
}

export async function saveConversation(conversation: Conversation): Promise<void> {
  const conversations = await getConversations();
  const index = conversations.findIndex(c => c.id === conversation.id);
  if (index >= 0) {
    conversations[index] = conversation;
  } else {
    conversations.push(conversation);
  }
  await setItem(KEYS.CONVERSATIONS, conversations);
}

export async function deleteConversation(id: string): Promise<void> {
  const conversations = await getConversations();
  const filtered = conversations.filter(c => c.id !== id);
  await setItem(KEYS.CONVERSATIONS, filtered);
}

// Messages
export async function getMessages(conversationId: string): Promise<Message[]> {
  const allMessages = await getItem<Message>(KEYS.MESSAGES);
  return allMessages.filter(m => m.conversationId === conversationId);
}

export async function saveMessage(message: Message): Promise<void> {
  const messages = await getItem<Message>(KEYS.MESSAGES);
  const index = messages.findIndex(m => m.id === message.id);
  if (index >= 0) {
    messages[index] = message;
  } else {
    messages.push(message);
  }
  await setItem(KEYS.MESSAGES, messages);
}

export async function deleteMessage(id: string): Promise<void> {
  const messages = await getItem<Message>(KEYS.MESSAGES);
  const filtered = messages.filter(m => m.id !== id);
  await setItem(KEYS.MESSAGES, filtered);
}

// Activities
export async function getActivities(): Promise<Activity[]> {
  return getItem<Activity>(KEYS.ACTIVITIES);
}

export async function saveActivity(activity: Activity): Promise<void> {
  const activities = await getActivities();
  activities.unshift(activity); // Add to beginning for newest first
  await setItem(KEYS.ACTIVITIES, activities);
}

// Initialize with sample data
export async function initializeSampleData(): Promise<void> {
  const members = await getFamilyMembers();
  if (members.length === 0) {
    // Add sample family members
    const sampleMembers: FamilyMember[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        gender: 'male',
        dateOfBirth: '1950-05-15',
        profilePhoto: undefined,
        generation: 1,
        isBornIntoFamily: true,
        isAlive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        firstName: 'Mary',
        lastName: 'Smith',
        gender: 'female',
        dateOfBirth: '1952-08-22',
        profilePhoto: undefined,
        generation: 1,
        isBornIntoFamily: false,
        isAlive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        firstName: 'Robert',
        lastName: 'Smith',
        gender: 'male',
        dateOfBirth: '1975-03-10',
        profilePhoto: undefined,
        generation: 2,
        isBornIntoFamily: true,
        isAlive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        firstName: 'Sarah',
        lastName: 'Smith',
        gender: 'female',
        dateOfBirth: '1977-11-05',
        profilePhoto: undefined,
        generation: 2,
        isBornIntoFamily: false,
        isAlive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const member of sampleMembers) {
      await saveFamilyMember(member);
    }

    // Add sample relationships
    const sampleRelationships: Relationship[] = [
      {
        id: 'r1',
        memberId: '1',
        relatedMemberId: '2',
        relationshipType: 'spouse',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'r2',
        memberId: '1',
        relatedMemberId: '3',
        relationshipType: 'child',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'r3',
        memberId: '2',
        relatedMemberId: '3',
        relationshipType: 'child',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'r4',
        memberId: '3',
        relatedMemberId: '4',
        relationshipType: 'spouse',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const relationship of sampleRelationships) {
      await saveRelationship(relationship);
    }

    // Add sample event
    const sampleEvent: Event = {
      id: 'e1',
      title: 'Family Reunion',
      description: 'Annual family gathering',
      eventType: 'gathering',
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      isRecurring: true,
      recurringPattern: 'yearly',
      attendees: ['1', '2', '3', '4'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveEvent(sampleEvent);
  }
}

// Clear all data (for testing)
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
