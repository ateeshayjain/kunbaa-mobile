import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useEffect, useState } from "react";
import { getAlbums } from "@/lib/storage";
import type { Album } from "@/lib/types";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function AlbumsScreen() {
  const colors = useColors();
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const loadedAlbums = await getAlbums();
      setAlbums(loadedAlbums);
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
              <Text className="text-3xl font-bold text-foreground">Albums</Text>
              <Text className="text-base text-muted">{albums.length} albums</Text>
            </View>
            <TouchableOpacity
              className="w-12 h-12 bg-primary rounded-full items-center justify-center"
              style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <IconSymbol name="plus.circle.fill" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Albums Grid */}
          {albums.length > 0 && (
            <View className="gap-4">
              {albums.map((album) => (
                <TouchableOpacity
                  key={album.id}
                  className="bg-surface rounded-xl overflow-hidden border border-border"
                  style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <View className="aspect-video bg-muted/10 items-center justify-center">
                    <IconSymbol name="photo.on.rectangle" size={48} color={colors.muted} />
                  </View>
                  <View className="p-4">
                    <Text className="text-base font-semibold text-foreground">{album.title}</Text>
                    {album.description && (
                      <Text className="text-sm text-muted mt-1" numberOfLines={2}>
                        {album.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Empty State */}
          {albums.length === 0 && (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-lg font-semibold text-foreground mb-2">
                No Albums Yet
              </Text>
              <Text className="text-sm text-muted text-center mb-6">
                Create your first photo album
              </Text>
              <TouchableOpacity
                className="bg-primary px-6 py-3 rounded-full"
                style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <Text className="text-white font-semibold">Create Album</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
