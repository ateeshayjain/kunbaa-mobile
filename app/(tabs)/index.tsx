import { ScrollView, Text, View, TouchableOpacity, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useEffect, useState } from "react";
import { getAllMembers, initializeSampleFamilyTree } from "@/lib/family-tree";
import { getEvents } from "@/lib/storage";
import type { FamilyMember, Event } from "@/lib/types";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { getSuggestedActions } from "@/lib/kaka-ai";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    // Initialize sample data if needed
    await initializeSampleFamilyTree();
    
    const [loadedMembers, loadedEvents, loadedSuggestions] = await Promise.all([
      getAllMembers(),
      getEvents(),
      getSuggestedActions(),
    ]);
    
    setMembers(loadedMembers);
    setEvents(loadedEvents);
    setSuggestions(loadedSuggestions);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const upcomingEvents = events
    .filter(e => new Date(e.eventDate) > new Date())
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 3);

  // Calculate upcoming birthdays
  const upcomingBirthdays = members
    .filter(m => m.dateOfBirth)
    .map(m => {
      const dob = new Date(m.dateOfBirth!);
      const today = new Date();
      const thisYearBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      if (thisYearBday < today) {
        thisYearBday.setFullYear(today.getFullYear() + 1);
      }
      return { member: m, nextBirthday: thisYearBday };
    })
    .sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime())
    .slice(0, 3);

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View className="flex-1 p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Welcome to Kunbaa</Text>
            <Text className="text-base text-muted">Your family connection hub</Text>
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-3">
            <TouchableOpacity 
              className="flex-1 bg-surface rounded-2xl p-4 border border-border"
              onPress={() => router.push('/(tabs)/tree')}
              activeOpacity={0.7}
            >
              <Text className="text-2xl font-bold text-foreground">{members.length}</Text>
              <Text className="text-sm text-muted mt-1">Family Members</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-surface rounded-2xl p-4 border border-border"
              onPress={() => router.push('/(tabs)/events')}
              activeOpacity={0.7}
            >
              <Text className="text-2xl font-bold text-foreground">{upcomingEvents.length}</Text>
              <Text className="text-sm text-muted mt-1">Upcoming Events</Text>
            </TouchableOpacity>
          </View>

          {/* Upcoming Birthdays */}
          {upcomingBirthdays.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">🎂 Upcoming Birthdays</Text>
              {upcomingBirthdays.map(({ member, nextBirthday }) => (
                <TouchableOpacity
                  key={member.id}
                  className="bg-surface rounded-xl p-4 border border-border"
                  onPress={() => router.push('/(tabs)/tree')}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                      <IconSymbol name="person.fill" size={24} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {member.firstName} {member.lastName || ''}
                      </Text>
                      <Text className="text-sm text-muted mt-1">
                        {format(nextBirthday, 'MMM d')} • {format(nextBirthday, 'EEEE')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">📅 Upcoming Events</Text>
              {upcomingEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  className="bg-surface rounded-xl p-4 border border-border"
                  onPress={() => router.push('/(tabs)/events')}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                      <IconSymbol name="calendar" size={24} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">{event.title}</Text>
                      <Text className="text-sm text-muted mt-1">
                        {format(new Date(event.eventDate), 'MMM d, yyyy')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">💡 Suggested Actions</Text>
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-surface rounded-xl p-4 border border-border flex-row items-center"
                  onPress={() => router.push('/(tabs)/chat')}
                  activeOpacity={0.7}
                >
                  <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-3">
                    <Text className="text-primary">✨</Text>
                  </View>
                  <Text className="flex-1 text-foreground">{suggestion}</Text>
                  <IconSymbol name="chevron.right" size={16} color={colors.muted} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Quick Actions</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-primary rounded-xl p-4 items-center"
                onPress={() => router.push('/(tabs)/tree')}
                activeOpacity={0.8}
              >
                <IconSymbol name="person.fill" size={24} color="#FFFFFF" />
                <Text className="text-sm font-semibold text-white mt-2">View Tree</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-xl p-4 items-center"
                onPress={() => router.push('/(tabs)/chat')}
                activeOpacity={0.8}
              >
                <Text className="text-2xl">🧓</Text>
                <Text className="text-sm font-semibold text-white mt-2">Ask Kaka</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Empty State */}
          {members.length === 0 && (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-lg font-semibold text-foreground mb-2">
                Start Building Your Family Tree
              </Text>
              <Text className="text-sm text-muted text-center mb-6">
                Add family members to get started
              </Text>
              <TouchableOpacity
                className="bg-primary px-6 py-3 rounded-full"
                onPress={() => router.push('/(tabs)/tree')}
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold">Add First Member</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
