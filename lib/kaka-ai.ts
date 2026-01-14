import type { FamilyMember } from './types';
import { getAllMembers, getMemberById, getMemberRelationships, searchMembers, getRootedTree } from './family-tree';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Intent types that Kaka can detect and act upon
export type KakaIntent = 
  | { type: 'add_member'; data: AddMemberIntent }
  | { type: 'search_member'; data: SearchMemberIntent }
  | { type: 'show_relationship'; data: ShowRelationshipIntent }
  | { type: 'create_reminder'; data: CreateReminderIntent }
  | { type: 'generate_biography'; data: GenerateBiographyIntent }
  | { type: 'general_query'; data: GeneralQueryIntent }
  | { type: 'navigate_tree'; data: NavigateTreeIntent };

interface AddMemberIntent {
  firstName: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  relationshipType: 'parent' | 'spouse' | 'sibling' | 'child';
  relativeToName?: string;
}

interface SearchMemberIntent {
  query: string;
}

interface ShowRelationshipIntent {
  fromName: string;
  toName: string;
}

interface CreateReminderIntent {
  title: string;
  date?: string;
  memberName?: string;
  eventType?: string;
}

interface GenerateBiographyIntent {
  memberName: string;
}

interface GeneralQueryIntent {
  question: string;
}

interface NavigateTreeIntent {
  memberName: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
  error?: {
    message: string;
  };
}

/**
 * Call Gemini API with a prompt
 */
async function callGemini(prompt: string, maxTokens: number = 1024): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }
  
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: maxTokens,
      },
    }),
  });
  
  const data: GeminiResponse = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }
  
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Build a compact family context for RAG-style retrieval
 * Only includes relevant members based on the query
 */
async function buildRelevantContext(query: string): Promise<string> {
  const allMembers = await getAllMembers();
  
  // If family is small, include all
  if (allMembers.length <= 20) {
    return allMembers.map(m => 
      `- ${m.firstName} ${m.lastName || ''} (${m.gender || 'unknown'}, Gen ${m.generation}${m.dateOfBirth ? `, born ${m.dateOfBirth}` : ''})`
    ).join('\n');
  }
  
  // For larger families, search for relevant members
  const searchResults = await searchMembers(query);
  const relevantIds = new Set<string>();
  
  // Add search results
  for (const member of searchResults.slice(0, 5)) {
    relevantIds.add(member.id);
    
    // Add their close relations
    const relations = await getMemberRelationships(member.id);
    relations.parents.forEach(p => relevantIds.add(p.id));
    relations.children.forEach(c => relevantIds.add(c.id));
    relations.spouses.forEach(s => relevantIds.add(s.id));
    relations.siblings.forEach(s => relevantIds.add(s.id));
  }
  
  const relevantMembers = allMembers.filter(m => relevantIds.has(m.id));
  
  return relevantMembers.map(m => 
    `- ${m.firstName} ${m.lastName || ''} (${m.gender || 'unknown'}, Gen ${m.generation}${m.dateOfBirth ? `, born ${m.dateOfBirth}` : ''})`
  ).join('\n');
}

/**
 * Detect user intent from natural language input
 */
export async function detectIntent(userMessage: string): Promise<KakaIntent> {
  const members = await getAllMembers();
  const memberNames = members.map(m => m.firstName).join(', ');
  
  const prompt = `You are Kaka, a family tree AI assistant. Analyze the user's message and determine their intent.

Family members in the tree: ${memberNames || 'None yet'}

User message: "${userMessage}"

Determine the intent and extract relevant data. Respond ONLY with valid JSON in one of these formats:

For adding a family member:
{"type": "add_member", "data": {"firstName": "name", "lastName": "optional", "gender": "male/female/other", "dateOfBirth": "YYYY-MM-DD or null", "relationshipType": "parent/spouse/sibling/child", "relativeToName": "existing member name"}}

For searching a member:
{"type": "search_member", "data": {"query": "search term"}}

For showing relationship between two people:
{"type": "show_relationship", "data": {"fromName": "person1", "toName": "person2"}}

For creating a reminder:
{"type": "create_reminder", "data": {"title": "reminder text", "date": "YYYY-MM-DD or null", "memberName": "optional member name", "eventType": "birthday/anniversary/call/other"}}

For generating a biography:
{"type": "generate_biography", "data": {"memberName": "member name"}}

For navigating/focusing on someone in the tree:
{"type": "navigate_tree", "data": {"memberName": "member name"}}

For general questions:
{"type": "general_query", "data": {"question": "the question"}}

Respond with ONLY the JSON, no other text.`;

  try {
    const response = await callGemini(prompt, 512);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as KakaIntent;
    }
  } catch (error) {
    console.error('Error detecting intent:', error);
  }
  
  // Default to general query
  return {
    type: 'general_query',
    data: { question: userMessage }
  };
}

/**
 * Process an intent and generate a response
 */
export async function processIntent(intent: KakaIntent): Promise<{
  response: string;
  action?: {
    type: 'open_add_member' | 'navigate_to_member' | 'show_search_results' | 'create_notification';
    payload: any;
  };
}> {
  switch (intent.type) {
    case 'add_member': {
      const { firstName, lastName, gender, dateOfBirth, relationshipType, relativeToName } = intent.data;
      
      // Find the relative
      let relativeTo: FamilyMember | null = null;
      if (relativeToName) {
        const results = await searchMembers(relativeToName);
        relativeTo = results[0] || null;
      }
      
      if (!relativeTo) {
        const members = await getAllMembers();
        if (members.length > 0) {
          return {
            response: `I'd like to add ${firstName} to the family tree. Who should they be related to? Please specify a family member.`,
          };
        }
      }
      
      return {
        response: `I'll help you add ${firstName}${lastName ? ' ' + lastName : ''} as ${relativeTo?.firstName || 'someone'}'s ${relationshipType}. Let me open the form for you.`,
        action: {
          type: 'open_add_member',
          payload: {
            prefillData: { firstName, lastName, gender, dateOfBirth },
            relationshipType,
            relativeTo,
          }
        }
      };
    }
    
    case 'search_member': {
      const results = await searchMembers(intent.data.query);
      
      if (results.length === 0) {
        return {
          response: `I couldn't find anyone matching "${intent.data.query}" in your family tree.`,
        };
      }
      
      const memberList = results.slice(0, 5).map(m => 
        `• ${m.firstName} ${m.lastName || ''} (Generation ${m.generation})`
      ).join('\n');
      
      return {
        response: `I found ${results.length} member(s) matching "${intent.data.query}":\n\n${memberList}`,
        action: {
          type: 'show_search_results',
          payload: { results }
        }
      };
    }
    
    case 'show_relationship': {
      const { fromName, toName } = intent.data;
      const fromResults = await searchMembers(fromName);
      const toResults = await searchMembers(toName);
      
      if (fromResults.length === 0 || toResults.length === 0) {
        return {
          response: `I couldn't find one or both of the people you mentioned. Please check the names.`,
        };
      }
      
      const from = fromResults[0];
      const to = toResults[0];
      
      // Get relationship context
      const context = await buildRelevantContext(`${fromName} ${toName}`);
      
      const prompt = `Based on this family data:
${context}

What is the relationship between ${from.firstName} and ${to.firstName}? 
Explain in simple terms, using both English and Hindi relationship terms where appropriate.
Keep the response concise (2-3 sentences).`;

      const explanation = await callGemini(prompt, 256);
      
      return {
        response: explanation,
      };
    }
    
    case 'navigate_tree': {
      const results = await searchMembers(intent.data.memberName);
      
      if (results.length === 0) {
        return {
          response: `I couldn't find "${intent.data.memberName}" in your family tree.`,
        };
      }
      
      const member = results[0];
      
      return {
        response: `Focusing the tree on ${member.firstName} ${member.lastName || ''}. You'll now see their immediate family connections.`,
        action: {
          type: 'navigate_to_member',
          payload: { memberId: member.id }
        }
      };
    }
    
    case 'generate_biography': {
      const results = await searchMembers(intent.data.memberName);
      
      if (results.length === 0) {
        return {
          response: `I couldn't find "${intent.data.memberName}" in your family tree.`,
        };
      }
      
      const member = results[0];
      const relations = await getMemberRelationships(member.id);
      
      const prompt = `Generate a warm, personal biography for this family member:

Name: ${member.firstName} ${member.lastName || ''}
Gender: ${member.gender || 'unknown'}
Date of Birth: ${member.dateOfBirth || 'unknown'}
Generation: ${member.generation}
Parents: ${relations.parents.map(p => p.firstName).join(', ') || 'Not recorded'}
Spouse(s): ${relations.spouses.map(s => s.firstName).join(', ') || 'Not recorded'}
Children: ${relations.children.map(c => c.firstName).join(', ') || 'Not recorded'}
Siblings: ${relations.siblings.map(s => s.firstName).join(', ') || 'Not recorded'}

Write a 3-4 sentence biography that could be displayed on their profile. Be warm and respectful.`;

      const biography = await callGemini(prompt, 512);
      
      return {
        response: `Here's a biography for ${member.firstName}:\n\n${biography}`,
      };
    }
    
    case 'create_reminder': {
      const { title, date, memberName, eventType } = intent.data;
      
      return {
        response: `I'll create a reminder: "${title}"${date ? ` for ${date}` : ''}${memberName ? ` related to ${memberName}` : ''}.`,
        action: {
          type: 'create_notification',
          payload: { title, date, memberName, eventType }
        }
      };
    }
    
    case 'general_query':
    default: {
      const context = await buildRelevantContext(intent.data.question);
      
      const prompt = `You are Kaka, a friendly and knowledgeable family tree assistant for the Kunbaa app. You help users understand and navigate their family relationships.

Family context:
${context || 'No family members added yet.'}

User question: ${intent.data.question}

Provide a helpful, warm response. If relevant, use both English and Hindi family terms (like Maasi for mother's sister, Chacha for father's brother, etc.). Keep responses concise but informative.`;

      const response = await callGemini(prompt, 512);
      
      return { response };
    }
  }
}

/**
 * Main chat function - combines intent detection and processing
 */
export async function chat(userMessage: string): Promise<{
  response: string;
  action?: {
    type: 'open_add_member' | 'navigate_to_member' | 'show_search_results' | 'create_notification';
    payload: any;
  };
}> {
  const intent = await detectIntent(userMessage);
  return processIntent(intent);
}

/**
 * Generate a monthly family newsletter summary
 */
export async function generateNewsletter(): Promise<string> {
  const members = await getAllMembers();
  const now = new Date();
  const currentMonth = now.getMonth();
  
  // Find birthdays this month
  const birthdays = members.filter(m => {
    if (!m.dateOfBirth) return false;
    const birthMonth = new Date(m.dateOfBirth).getMonth();
    return birthMonth === currentMonth;
  });
  
  const prompt = `Generate a warm, friendly family newsletter for ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}.

Family size: ${members.length} members
Birthdays this month: ${birthdays.map(m => `${m.firstName} (${m.dateOfBirth})`).join(', ') || 'None'}

Write a brief (3-4 paragraphs) newsletter that:
1. Greets the family warmly
2. Mentions upcoming birthdays
3. Encourages family connection
4. Has a positive, loving tone

Use a mix of English with occasional Hindi terms of endearment.`;

  return callGemini(prompt, 1024);
}

/**
 * Get AI-suggested next actions for the family tree
 */
export async function getSuggestedActions(): Promise<string[]> {
  const members = await getAllMembers();
  
  if (members.length === 0) {
    return [
      'Add yourself as the first family member',
      'Start by adding your parents',
      'Ask Kaka for help getting started'
    ];
  }
  
  const suggestions: string[] = [];
  
  // Check for incomplete data
  for (const member of members.slice(0, 10)) {
    const relations = await getMemberRelationships(member.id);
    
    if (relations.parents.length === 0 && member.generation > 1) {
      suggestions.push(`Add parents for ${member.firstName}`);
    }
    
    if (!member.dateOfBirth) {
      suggestions.push(`Add birth date for ${member.firstName}`);
    }
  }
  
  // Add general suggestions
  if (suggestions.length < 3) {
    suggestions.push('Explore the family tree visualization');
    suggestions.push('Ask Kaka about family relationships');
  }
  
  return suggestions.slice(0, 5);
}
