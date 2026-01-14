import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useEffect, useState } from "react";
import { getEvents } from "@/lib/storage";
import type { Event } from "@/lib/types";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { format } from "date-fns";

export default function EventsScreen() {
  const colors = useColors();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const loadedEvents = await getEvents();
      setEvents(loadedEvents.sort((a, b) => 
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      ));
    };
    loadData();
  }, []);

  const upcomingEvents = events.filter(e => new Date(e.eventDate) > new Date());
  const pastEvents = events.filter(e => new Date(e.eventDate) <= new Date());

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="gap-2">
              <Text className="text-3xl font-bold text-foreground">Events</Text>
              <Text className="text-base text-muted">{events.length} total events</Text>
            </View>
            <TouchableOpacity
              className="w-12 h-12 bg-primary rounded-full items-center justify-center"
              style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <IconSymbol name="plus.circle.fill" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">Upcoming</Text>
              {upcomingEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  className="bg-surface rounded-xl p-4 border border-border"
                  style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                      <IconSymbol name="calendar" size={24} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">{event.title}</Text>
                      <Text className="text-sm text-muted mt-1">
                        {format(new Date(event.eventDate), 'EEEE, MMM d, yyyy')}
                      </Text>
                      {event.location && (
                        <Text className="text-sm text-muted mt-1">{event.location}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">Past</Text>
              {pastEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  className="bg-surface rounded-xl p-4 border border-border opacity-60"
                  style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.5 : 0.6 })}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-muted/10 rounded-full items-center justify-center">
                      <IconSymbol name="calendar" size={24} color={colors.muted} />
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

          {/* Empty State */}
          {events.length === 0 && (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-lg font-semibold text-foreground mb-2">
                No Events Yet
              </Text>
              <Text className="text-sm text-muted text-center mb-6">
                Create your first family event
              </Text>
              <TouchableOpacity
                className="bg-primary px-6 py-3 rounded-full"
                style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <Text className="text-white font-semibold">Create Event</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
