import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import type { FamilyMember } from '@/lib/types';
import {
  addParent,
  addSpouse,
  addSibling,
  addChild,
  getMemberRelationships,
} from '@/lib/family-tree';

type RelationshipType = 'parent' | 'spouse' | 'sibling' | 'child';

interface AddMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onMemberAdded: (member: FamilyMember) => void;
  relativeTo?: FamilyMember;
  suggestedRelationship?: RelationshipType;
  prefillData?: Partial<FamilyMember>;
}

export function AddMemberModal({
  visible,
  onClose,
  onMemberAdded,
  relativeTo,
  suggestedRelationship,
  prefillData,
}: AddMemberModalProps) {
  const colors = useColors();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('parent');
  const [shareParents, setShareParents] = useState(true);
  const [loading, setLoading] = useState(false);
  const [existingRelations, setExistingRelations] = useState<{
    parents: FamilyMember[];
    spouses: FamilyMember[];
    siblings: FamilyMember[];
    children: FamilyMember[];
  }>({ parents: [], spouses: [], siblings: [], children: [] });

  // Load existing relationships when relativeTo changes
  useEffect(() => {
    if (relativeTo) {
      getMemberRelationships(relativeTo.id).then(setExistingRelations);
    }
  }, [relativeTo]);

  // Apply prefill data and suggested relationship
  useEffect(() => {
    if (prefillData) {
      if (prefillData.firstName) setFirstName(prefillData.firstName);
      if (prefillData.lastName) setLastName(prefillData.lastName);
      if (prefillData.gender) setGender(prefillData.gender);
      if (prefillData.dateOfBirth) setDateOfBirth(prefillData.dateOfBirth);
    }
    if (suggestedRelationship) {
      setRelationshipType(suggestedRelationship);
    }
  }, [prefillData, suggestedRelationship]);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setGender('male');
    setDateOfBirth('');
    setRelationshipType('parent');
    setShareParents(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!firstName.trim()) return;
    if (!relativeTo) return;

    setLoading(true);

    try {
      const memberData = {
        firstName: firstName.trim(),
        lastName: lastName.trim() || relativeTo.lastName,
        gender,
        dateOfBirth: dateOfBirth || undefined,
        generation: relativeTo.generation,
        isBornIntoFamily: relationshipType !== 'spouse',
        isAlive: true,
      };

      let newMember: FamilyMember;

      switch (relationshipType) {
        case 'parent':
          newMember = await addParent(relativeTo.id, memberData);
          break;
        case 'spouse':
          newMember = await addSpouse(relativeTo.id, memberData);
          break;
        case 'sibling':
          newMember = await addSibling(relativeTo.id, memberData, shareParents);
          break;
        case 'child':
          newMember = await addChild(relativeTo.id, memberData);
          break;
        default:
          throw new Error('Invalid relationship type');
      }

      onMemberAdded(newMember);
      handleClose();
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setLoading(false);
    }
  };

  const relationshipOptions: { type: RelationshipType; label: string; icon: string }[] = [
    { type: 'parent', label: 'Parent', icon: 'person.fill' },
    { type: 'spouse', label: 'Spouse', icon: 'heart.fill' },
    { type: 'sibling', label: 'Sibling', icon: 'person.3.fill' },
    { type: 'child', label: 'Child', icon: 'person.fill' },
  ];

  const getRelationshipHint = () => {
    if (!relativeTo) return '';
    
    switch (relationshipType) {
      case 'parent':
        if (existingRelations.siblings.length > 0) {
          return `Will also be linked as parent to ${existingRelations.siblings.map(s => s.firstName).join(', ')}`;
        }
        return `Will be added as ${relativeTo.firstName}'s parent`;
      case 'spouse':
        return `Will be linked as ${relativeTo.firstName}'s spouse`;
      case 'sibling':
        if (shareParents && existingRelations.parents.length > 0) {
          return `Will share parents: ${existingRelations.parents.map(p => p.firstName).join(' & ')}`;
        }
        return `Will be added as ${relativeTo.firstName}'s sibling`;
      case 'child':
        if (existingRelations.spouses.length > 0) {
          return `Will also be linked as child of ${existingRelations.spouses.map(s => s.firstName).join(', ')}`;
        }
        return `Will be added as ${relativeTo.firstName}'s child`;
      default:
        return '';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-background"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <TouchableOpacity onPress={handleClose}>
            <Text className="text-primary text-base">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">Add Family Member</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!firstName.trim() || loading}
            style={{ opacity: !firstName.trim() || loading ? 0.5 : 1 }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text className="text-primary text-base font-semibold">Add</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Relative To Info */}
          {relativeTo && (
            <View className="bg-surface rounded-xl p-4 mb-6 border border-border">
              <Text className="text-sm text-muted mb-1">Adding relative to</Text>
              <Text className="text-lg font-semibold text-foreground">
                {relativeTo.firstName} {relativeTo.lastName}
              </Text>
            </View>
          )}

          {/* Relationship Type Selection */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-muted mb-3">Relationship Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {relationshipOptions.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  onPress={() => setRelationshipType(option.type)}
                  className={`flex-row items-center px-4 py-3 rounded-xl border ${
                    relationshipType === option.type
                      ? 'bg-primary border-primary'
                      : 'bg-surface border-border'
                  }`}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    name={option.icon as any}
                    size={18}
                    color={relationshipType === option.type ? '#FFFFFF' : colors.foreground}
                  />
                  <Text
                    className={`ml-2 font-medium ${
                      relationshipType === option.type ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Relationship Hint */}
            <Text className="text-sm text-muted mt-3 italic">{getRelationshipHint()}</Text>
          </View>

          {/* Share Parents Toggle for Siblings */}
          {relationshipType === 'sibling' && existingRelations.parents.length > 0 && (
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => setShareParents(!shareParents)}
                className="flex-row items-center"
              >
                <View
                  className={`w-6 h-6 rounded-md border-2 mr-3 items-center justify-center ${
                    shareParents ? 'bg-primary border-primary' : 'border-border'
                  }`}
                >
                  {shareParents && <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />}
                </View>
                <Text className="text-foreground">Share the same parents</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Name Fields */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-muted mb-2">First Name *</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground text-base"
              returnKeyType="next"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-muted mb-2">Last Name</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder={relativeTo?.lastName || 'Enter last name'}
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground text-base"
              returnKeyType="next"
            />
          </View>

          {/* Gender Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-muted mb-2">Gender</Text>
            <View className="flex-row gap-2">
              {(['male', 'female', 'other'] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  className={`flex-1 py-3 rounded-xl border items-center ${
                    gender === g ? 'bg-primary border-primary' : 'bg-surface border-border'
                  }`}
                >
                  <Text
                    className={`font-medium capitalize ${
                      gender === g ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date of Birth */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-muted mb-2">Date of Birth</Text>
            <TextInput
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground text-base"
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
