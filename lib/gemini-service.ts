import type { FamilyMember } from './types';
import { getAllMembers, getMemberRelationships } from './family-tree';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

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
async function callGemini(prompt: string): Promise<string> {
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
        temperature: 0.7,
        maxOutputTokens: 1024,
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
 * Get AI suggestions for relationship type based on context
 */
export async function suggestRelationshipType(
  existingMember: FamilyMember,
  newMemberName: string,
  newMemberGender?: 'male' | 'female' | 'other'
): Promise<{
  suggestedType: 'parent' | 'child' | 'spouse' | 'sibling';
  confidence: number;
  reasoning: string;
}> {
  const relationships = await getMemberRelationships(existingMember.id);
  
  const prompt = `You are a family relationship analyzer. Based on the following information, suggest the most likely relationship type.

Existing family member: ${existingMember.firstName} ${existingMember.lastName || ''} (${existingMember.gender}, born ${existingMember.dateOfBirth || 'unknown'})

Current relationships:
- Parents: ${relationships.parents.map(p => p.firstName).join(', ') || 'None'}
- Children: ${relationships.children.map(c => c.firstName).join(', ') || 'None'}
- Spouse: ${relationships.spouses.map(s => s.firstName).join(', ') || 'None'}
- Siblings: ${relationships.siblings.map(s => s.firstName).join(', ') || 'None'}

New person being added: ${newMemberName} (${newMemberGender || 'unknown gender'})

Based on typical Indian family naming patterns and the existing relationships, what is the most likely relationship between ${existingMember.firstName} and ${newMemberName}?

Respond in JSON format only:
{
  "suggestedType": "parent" | "child" | "spouse" | "sibling",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;

  try {
    const response = await callGemini(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error getting AI suggestion:', error);
  }
  
  // Default fallback
  return {
    suggestedType: 'parent',
    confidence: 0.3,
    reasoning: 'Unable to determine relationship, defaulting to parent',
  };
}

/**
 * Get Indian relationship term based on relationship path
 */
export async function getIndianRelationshipTerm(
  fromMember: FamilyMember,
  toMember: FamilyMember,
  relationshipPath: string
): Promise<{
  hindi: string;
  english: string;
  description: string;
}> {
  const prompt = `You are an expert in Indian family relationship terminology.

Person A: ${fromMember.firstName} (${fromMember.gender})
Person B: ${toMember.firstName} (${toMember.gender})
Relationship: ${relationshipPath}

What is the correct Indian (Hindi) term for how Person A would address or refer to Person B?

Consider:
- Gender of both people
- Whether it's maternal or paternal side
- Common North Indian family terms

Respond in JSON format only:
{
  "hindi": "the Hindi term",
  "english": "English transliteration",
  "description": "brief explanation of the relationship"
}`;

  try {
    const response = await callGemini(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error getting relationship term:', error);
  }
  
  return {
    hindi: relationshipPath,
    english: relationshipPath,
    description: `${fromMember.firstName}'s ${relationshipPath.toLowerCase()}`,
  };
}

/**
 * Ask AI about family relationships
 */
export async function askFamilyQuestion(question: string): Promise<string> {
  const members = await getAllMembers();
  
  // Build family context
  const familyContext = members.map(m => {
    return `- ${m.firstName} ${m.lastName || ''} (${m.gender || 'unknown'}, Generation ${m.generation})`;
  }).join('\n');
  
  const prompt = `You are a helpful family tree assistant for the Kunbaa app. You help users understand their family relationships and navigate their family tree.

Current family members:
${familyContext}

User question: ${question}

Provide a helpful, concise answer. If the question is about relationships, explain using both English and Hindi terms where appropriate.`;

  try {
    return await callGemini(prompt);
  } catch (error) {
    console.error('Error asking family question:', error);
    return 'I apologize, but I encountered an error processing your question. Please try again.';
  }
}

/**
 * Validate and suggest corrections for family tree data
 */
export async function validateFamilyTree(): Promise<{
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}> {
  const members = await getAllMembers();
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  for (const member of members) {
    const relationships = await getMemberRelationships(member.id);
    
    // Check for missing parents
    if (relationships.parents.length === 0 && member.generation > 1) {
      issues.push(`${member.firstName} has no parents linked but is in generation ${member.generation}`);
    }
    
    // Check for too many parents
    if (relationships.parents.length > 2) {
      issues.push(`${member.firstName} has more than 2 parents linked`);
    }
    
    // Check for age consistency
    if (member.dateOfBirth) {
      const birthYear = new Date(member.dateOfBirth).getFullYear();
      
      for (const parent of relationships.parents) {
        if (parent.dateOfBirth) {
          const parentBirthYear = new Date(parent.dateOfBirth).getFullYear();
          const ageDiff = birthYear - parentBirthYear;
          
          if (ageDiff < 15) {
            issues.push(`${member.firstName}'s parent ${parent.firstName} is only ${ageDiff} years older`);
          }
        }
      }
    }
  }
  
  // Generate suggestions using AI if there are issues
  if (issues.length > 0) {
    const prompt = `As a family tree expert, review these issues and provide brief suggestions to fix them:

Issues:
${issues.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

Provide 2-3 actionable suggestions.`;

    try {
      const response = await callGemini(prompt);
      suggestions.push(response);
    } catch (error) {
      suggestions.push('Review the listed issues and correct any data entry errors.');
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}
