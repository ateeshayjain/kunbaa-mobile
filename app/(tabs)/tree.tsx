import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useEffect, useState } from "react";
import { getFamilyMembers, getRelationships } from "@/lib/storage";
import type { FamilyMember, Relationship } from "@/lib/types";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TreeScreen() {
  const colors = useColors();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [loadedMembers, loadedRelationships] = await Promise.all([
        getFamilyMembers(),
        getRelationships(),
      ]);
      setMembers(loadedMembers);
      setRelationships(loadedRelationships);
    };
    loadData();
  }, []);

  const getGenerationMembers = (gen: number) => {
    return members.filter(m => m.generation === gen);
  };

  const generations = Array.from(new Set(members.map(m => m.generation))).sort();

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Family Tree</Text>
            <Text className="text-base text-muted">{members.length} family members</Text>
          </View>

          {/* Tree by Generation */}
          {generations.map((gen) => {
            const genMembers = getGenerationMembers(gen);
            return (
              <View key={gen} className="gap-3">
                <Text className="text-lg font-semibold text-foreground">
                  Generation {gen}
                </Text>
                {genMembers.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    className="bg-surface rounded-xl p-4 border border-border"
                    style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.7 : 1 })}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                        <IconSymbol name="person.fill" size={24} color={colors.primary} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {member.firstName} {member.lastName}
                        </Text>
                        {member.dateOfBirth && (
                          <Text className="text-sm text-muted mt-1">
                            Born {new Date(member.dateOfBirth).getFullYear()}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}

          {/* Empty State */}
          {members.length === 0 && (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-lg font-semibold text-foreground mb-2">
                No Family Members Yet
              </Text>
              <Text className="text-sm text-muted text-center mb-6">
                Start building your family tree
              </Text>
              <TouchableOpacity
                className="bg-primary px-6 py-3 rounded-full"
                style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <Text className="text-white font-semibold">Add Member</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
