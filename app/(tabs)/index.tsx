import { ScrollView, Text, View, TouchableOpacity, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useEffect, useState } from "react";
import { getFamilyMembers, getEvents, getActivities, initializeSampleData } from "@/lib/storage";
import type { FamilyMember, Event, Activity } from "@/lib/types";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { format } from "date-fns";

export default function HomeScreen() {
  const colors = useColors();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    // Initialize sample data if needed
    await initializeSampleData();
    
    const [loadedMembers, loadedEvents, loadedActivities] = await Promise.all([
      getFamilyMembers(),
      getEvents(),
      getActivities(),
    ]);
    
    setMembers(loadedMembers);
    setEvents(loadedEvents);
    setActivities(loadedActivities);
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
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-2xl font-bold text-foreground">{members.length}</Text>
              <Text className="text-sm text-muted mt-1">Family Members</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-2xl font-bold text-foreground">{upcomingEvents.length}</Text>
              <Text className="text-sm text-muted mt-1">Upcoming Events</Text>
            </View>
          </View>

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">Upcoming Events</Text>
              {upcomingEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  className="bg-surface rounded-xl p-4 border border-border"
                  style={({ pressed }: { pressed: boolean }) => [{ opacity: pressed ? 0.7 : 1 }]}
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

          {/* Recent Activity */}
          {activities.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">Recent Activity</Text>
              {activities.slice(0, 5).map((activity) => (
                <View key={activity.id} className="bg-surface rounded-xl p-4 border border-border">
                  <Text className="text-sm text-foreground">{activity.activityText}</Text>
                  <Text className="text-xs text-muted mt-2">
                    {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Quick Actions</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-primary rounded-xl p-4 items-center"
                style={({ pressed }: { pressed: boolean }) => [{ opacity: pressed ? 0.8 : 1 }]}
              >
                <IconSymbol name="person.fill" size={24} color="#FFFFFF" />
                <Text className="text-sm font-semibold text-white mt-2">Add Member</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-xl p-4 items-center"
                style={({ pressed }: { pressed: boolean }) => [{ opacity: pressed ? 0.8 : 1 }]}
              >
                <IconSymbol name="calendar" size={24} color="#FFFFFF" />
                <Text className="text-sm font-semibold text-white mt-2">Create Event</Text>
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
                style={({ pressed }: { pressed: boolean }) => [{ opacity: pressed ? 0.8 : 1 }]}
              >
                <Text className="text-background font-semibold">Add First Member</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
