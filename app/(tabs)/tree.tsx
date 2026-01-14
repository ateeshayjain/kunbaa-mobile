import { ScrollView, Text, View, TouchableOpacity, TextInput, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useEffect, useState, useCallback } from "react";
import { 
  getAllMembers, 
  getRootedTree, 
  searchMembers,
  initializeSampleFamilyTree,
} from "@/lib/family-tree";
import type { FamilyMember } from "@/lib/types";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { AddMemberModal } from "@/components/add-member-modal";

type RelationshipType = 'parent' | 'spouse' | 'sibling' | 'child';

export default function TreeScreen() {
  const colors = useColors();
  const [allMembers, setAllMembers] = useState<FamilyMember[]>([]);
  const [focusMember, setFocusMember] = useState<FamilyMember | null>(null);
  const [rootedTree, setRootedTree] = useState<{
    focus: FamilyMember | null;
    parents: FamilyMember[];
    grandparents: FamilyMember[];
    spouses: FamilyMember[];
    children: FamilyMember[];
    siblings: FamilyMember[];
    auntsUncles: FamilyMember[];
    cousins: FamilyMember[];
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FamilyMember[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Add member modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addRelativeTo, setAddRelativeTo] = useState<FamilyMember | undefined>();
  const [suggestedRelationship, setSuggestedRelationship] = useState<RelationshipType | undefined>();

  const loadData = useCallback(async () => {
    await initializeSampleFamilyTree();
    const members = await getAllMembers();
    setAllMembers(members);
    
    // Set default focus to "self" or first member
    const selfMember = members.find(m => m.id === 'self') || members[0];
    if (selfMember && (!focusMember || !members.find(m => m.id === focusMember.id))) {
      setFocusMember(selfMember);
    }
  }, [focusMember]);

  // Load rooted tree when focus changes
  useEffect(() => {
    if (focusMember) {
      getRootedTree(focusMember.id).then(setRootedTree);
    }
  }, [focusMember]);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      searchMembers(searchQuery).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleFocusMember = (member: FamilyMember) => {
    setFocusMember(member);
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleAddRelative = (member: FamilyMember, relationship: RelationshipType) => {
    setAddRelativeTo(member);
    setSuggestedRelationship(relationship);
    setShowAddModal(true);
  };

  const handleMemberAdded = async () => {
    await loadData();
    if (focusMember) {
      const tree = await getRootedTree(focusMember.id);
      setRootedTree(tree);
    }
  };

  const MemberCard = ({ 
    member, 
    relationship,
    showActions = true,
  }: { 
    member: FamilyMember; 
    relationship?: string;
    showActions?: boolean;
  }) => (
    <TouchableOpacity
      className="bg-surface rounded-xl p-4 border border-border mb-3"
      onPress={() => handleFocusMember(member)}
      style={{ opacity: 1 }}
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
          {relationship && (
            <Text className="text-sm text-primary mt-0.5">{relationship}</Text>
          )}
          {member.dateOfBirth && (
            <Text className="text-sm text-muted mt-0.5">
              Born {new Date(member.dateOfBirth).getFullYear()}
            </Text>
          )}
        </View>
        {member.id !== focusMember?.id && (
          <View className="items-center">
            <Text className="text-xs text-muted">Tap to focus</Text>
          </View>
        )}
      </View>
      
      {/* Quick add buttons */}
      {showActions && member.id === focusMember?.id && (
        <View className="flex-row gap-2 mt-3 pt-3 border-t border-border">
          <TouchableOpacity
            className="flex-1 bg-primary/10 rounded-lg py-2 items-center"
            onPress={() => handleAddRelative(member, 'parent')}
            activeOpacity={0.7}
          >
            <Text className="text-primary text-sm font-medium">+ Parent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-primary/10 rounded-lg py-2 items-center"
            onPress={() => handleAddRelative(member, 'spouse')}
            activeOpacity={0.7}
          >
            <Text className="text-primary text-sm font-medium">+ Spouse</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-primary/10 rounded-lg py-2 items-center"
            onPress={() => handleAddRelative(member, 'child')}
            activeOpacity={0.7}
          >
            <Text className="text-primary text-sm font-medium">+ Child</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const RelationshipSection = ({ 
    title, 
    members, 
    relationship,
    emptyText,
  }: { 
    title: string; 
    members: FamilyMember[]; 
    relationship: string;
    emptyText?: string;
  }) => {
    if (members.length === 0 && !emptyText) return null;
    
    return (
      <View className="mb-4">
        <Text className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">
          {title} {members.length > 0 && `(${members.length})`}
        </Text>
        {members.length > 0 ? (
          members.map((member) => (
            <MemberCard 
              key={member.id} 
              member={member} 
              relationship={relationship}
              showActions={false}
            />
          ))
        ) : emptyText ? (
          <Text className="text-sm text-muted italic">{emptyText}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View className="flex-1 p-6 gap-4">
          {/* Header with Search */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-3xl font-bold text-foreground">Family Tree</Text>
                <Text className="text-base text-muted">{allMembers.length} members</Text>
              </View>
              <TouchableOpacity
                className="w-10 h-10 bg-surface rounded-full items-center justify-center border border-border"
                onPress={() => setShowSearch(!showSearch)}
                activeOpacity={0.7}
              >
                <IconSymbol name="house.fill" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            {/* Search Bar */}
            {showSearch && (
              <View className="bg-surface rounded-xl border border-border flex-row items-center px-4">
                <IconSymbol name="house.fill" size={18} color={colors.muted} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Find a family member..."
                  placeholderTextColor={colors.muted}
                  className="flex-1 py-3 px-3 text-foreground"
                  autoFocus
                  returnKeyType="search"
                />
                {searchQuery && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <IconSymbol name="plus.circle.fill" size={18} color={colors.muted} />
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <View className="bg-surface rounded-xl border border-border p-3">
                <Text className="text-sm font-semibold text-muted mb-2">Search Results</Text>
                {searchResults.slice(0, 5).map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    className="flex-row items-center py-2 border-b border-border last:border-b-0"
                    onPress={() => handleFocusMember(member)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name="person.fill" size={16} color={colors.primary} />
                    <Text className="ml-2 text-foreground">
                      {member.firstName} {member.lastName || ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* View Selector */}
          {allMembers.length > 1 && (
            <View className="bg-surface rounded-xl p-3 border border-border">
              <Text className="text-sm text-muted mb-2">Quick Views</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {allMembers.slice(0, 6).map((member) => (
                    <TouchableOpacity
                      key={member.id}
                      className={`px-4 py-2 rounded-full ${
                        focusMember?.id === member.id ? 'bg-primary' : 'bg-background border border-border'
                      }`}
                      onPress={() => handleFocusMember(member)}
                      activeOpacity={0.7}
                    >
                      <Text className={focusMember?.id === member.id ? 'text-white font-medium' : 'text-foreground'}>
                        {member.firstName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Rooted Tree View */}
          {rootedTree && rootedTree.focus && (
            <View className="gap-2">
              {/* Grandparents */}
              <RelationshipSection
                title="Grandparents"
                members={rootedTree.grandparents}
                relationship="Grandparent"
              />

              {/* Parents */}
              <RelationshipSection
                title="Parents"
                members={rootedTree.parents}
                relationship="Parent"
                emptyText={focusMember?.generation === 1 ? undefined : "No parents added"}
              />

              {/* Aunts/Uncles */}
              <RelationshipSection
                title="Aunts & Uncles"
                members={rootedTree.auntsUncles}
                relationship="Aunt/Uncle"
              />

              {/* Focus Member (Center) */}
              <View className="my-2">
                <Text className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">
                  Viewing As
                </Text>
                <MemberCard member={rootedTree.focus} showActions={true} />
              </View>

              {/* Siblings */}
              <RelationshipSection
                title="Siblings"
                members={rootedTree.siblings}
                relationship="Sibling"
              />

              {/* Spouse */}
              <RelationshipSection
                title="Spouse"
                members={rootedTree.spouses}
                relationship="Spouse"
              />

              {/* Children */}
              <RelationshipSection
                title="Children"
                members={rootedTree.children}
                relationship="Child"
              />

              {/* Cousins */}
              <RelationshipSection
                title="Cousins"
                members={rootedTree.cousins}
                relationship="Cousin"
              />
            </View>
          )}

          {/* Empty State */}
          {allMembers.length === 0 && (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-lg font-semibold text-foreground mb-2">
                No Family Members Yet
              </Text>
              <Text className="text-sm text-muted text-center mb-6">
                Start building your family tree
              </Text>
              <TouchableOpacity
                className="bg-primary px-6 py-3 rounded-full"
                onPress={() => {
                  setAddRelativeTo(undefined);
                  setShowAddModal(true);
                }}
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold">Add First Member</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Member Modal */}
      <AddMemberModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddRelativeTo(undefined);
          setSuggestedRelationship(undefined);
        }}
        onMemberAdded={handleMemberAdded}
        relativeTo={addRelativeTo}
        suggestedRelationship={suggestedRelationship}
      />
    </ScreenContainer>
  );
}
