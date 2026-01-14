import { 
  ScrollView, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useRef, useEffect } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { chat, getSuggestedActions, generateNewsletter } from "@/lib/kaka-ai";
import { useRouter } from "expo-router";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: {
    type: string;
    payload: any;
  };
  timestamp: Date;
}

export default function ChatScreen() {
  const colors = useColors();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Namaste! 🙏 I'm Kaka, your family tree assistant. I can help you:\n\n• Add family members (\"Add my cousin Rahul born in 1990\")\n• Find relationships (\"How is Priya related to Suresh?\")\n• Navigate the tree (\"Show me Uncle Rajesh's family\")\n• Generate biographies\n• Answer questions about your family\n\nHow can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Load suggestions on mount
  useEffect(() => {
    getSuggestedActions().then(setSuggestions);
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const response = await chat(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        action: response.action,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Handle actions
      if (response.action) {
        handleAction(response.action);
      }
      
      // Refresh suggestions
      getSuggestedActions().then(setSuggestions);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleAction = (action: { type: string; payload: any }) => {
    switch (action.type) {
      case 'navigate_to_member':
        // Navigate to tree tab with focus on member
        router.push({
          pathname: '/(tabs)/tree',
          params: { focusId: action.payload.memberId }
        });
        break;
      case 'open_add_member':
        // Navigate to tree tab to add member
        router.push('/(tabs)/tree');
        break;
      default:
        break;
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
  };

  const handleGenerateNewsletter = async () => {
    setIsLoading(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: "Generate a family newsletter",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    scrollToBottom();

    try {
      const newsletter = await generateNewsletter();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `📰 **Family Newsletter**\n\n${newsletter}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Newsletter error:', error);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.role === 'user';
    
    return (
      <View className={`mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
        <View
          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
            isUser ? 'bg-primary' : 'bg-surface border border-border'
          }`}
        >
          <Text className={`text-base ${isUser ? 'text-white' : 'text-foreground'}`}>
            {message.content}
          </Text>
          {message.action && (
            <TouchableOpacity
              className="mt-2 bg-primary/20 rounded-lg px-3 py-2"
              onPress={() => handleAction(message.action!)}
              activeOpacity={0.7}
            >
              <Text className="text-primary text-sm font-medium">
                {message.action.type === 'navigate_to_member' ? 'View in Tree →' : 
                 message.action.type === 'open_add_member' ? 'Open Add Form →' : 
                 'Take Action →'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Text className="text-xs text-muted mt-1 px-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View className="px-6 py-4 border-b border-border">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-primary rounded-full items-center justify-center">
              <Text className="text-white text-lg">🧓</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground">Kaka</Text>
              <Text className="text-sm text-muted">Your Family AI Assistant</Text>
            </View>
            <TouchableOpacity
              className="bg-surface px-3 py-2 rounded-lg border border-border"
              onPress={handleGenerateNewsletter}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text className="text-primary text-sm font-medium">📰 Newsletter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          contentContainerStyle={{ flexGrow: 1 }}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <View className="items-start mb-4">
              <View className="bg-surface border border-border rounded-2xl px-4 py-3">
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Suggestions */}
        {suggestions.length > 0 && messages.length <= 2 && (
          <View className="px-4 pb-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    className="bg-surface border border-border px-4 py-2 rounded-full"
                    onPress={() => handleSuggestionPress(suggestion)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-foreground text-sm">{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Input */}
        <View className="px-4 py-3 border-t border-border bg-background">
          <View className="flex-row items-center gap-2">
            <View className="flex-1 bg-surface border border-border rounded-2xl flex-row items-center px-4">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask Kaka anything..."
                placeholderTextColor={colors.muted}
                className="flex-1 py-3 text-foreground text-base"
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
            </View>
            <TouchableOpacity
              className={`w-12 h-12 rounded-full items-center justify-center ${
                inputText.trim() && !isLoading ? 'bg-primary' : 'bg-muted/30'
              }`}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.7}
            >
              <IconSymbol 
                name="paperplane.fill" 
                size={20} 
                color={inputText.trim() && !isLoading ? '#FFFFFF' : colors.muted} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
