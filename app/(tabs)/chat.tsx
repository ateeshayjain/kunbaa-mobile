import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useEffect, useState } from "react";
import { getConversations } from "@/lib/storage";
import type { Conversation } from "@/lib/types";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function ChatScreen() {
  const colors = useColors();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const loadedConversations = await getConversations();
      setConversations(loadedConversations);
    };
    loadData();
  }, []);

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="gap-2">
              <Text className="text-3xl font-bold text-foreground">Chat</Text>
              <Text className="text-base text-muted">{conversations.length} conversations</Text>
            </View>
            <TouchableOpacity
              className="w-12 h-12 bg-primary rounded-full items-center justify-center"
              style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <IconSymbol name="plus.circle.fill" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Conversations List */}
          {conversations.length > 0 && (
            <View className="gap-3">
              {conversations.map((conversation) => (
                <TouchableOpacity
                  key={conversation.id}
                  className="bg-surface rounded-xl p-4 border border-border"
                  style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                      <IconSymbol 
                        name={conversation.isGroupChat ? "person.3.fill" : "person.fill"} 
                        size={24} 
                        color={colors.primary} 
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {conversation.title || "Direct Message"}
                      </Text>
                      {conversation.lastMessage && (
                        <Text className="text-sm text-muted mt-1" numberOfLines={1}>
                          {conversation.lastMessage.messageText}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Empty State */}
          {conversations.length === 0 && (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-lg font-semibold text-foreground mb-2">
                No Conversations Yet
              </Text>
              <Text className="text-sm text-muted text-center mb-6">
                Start chatting with your family
              </Text>
              <TouchableOpacity
                className="bg-primary px-6 py-3 rounded-full"
                style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <Text className="text-white font-semibold">New Chat</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
