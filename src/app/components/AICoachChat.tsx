import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  X, 
  MessageCircle,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  FileQuestion
} from 'lucide-react';

interface AICoachChatProps {
  taskTitle: string;
  taskContext: string;
  onClose?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AICoachChat({ taskTitle, taskContext, onClose }: AICoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm your AI Coach for "${taskTitle}". I'm here to answer any questions and guide you through this task. What would you like to know?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Quick action prompts
  const quickPrompts = [
    { icon: Lightbulb, label: "What do I do first?", prompt: "What's the first step I should take to complete this task?" },
    { icon: AlertCircle, label: "Why is this important?", prompt: "Why is this task important for becoming bankable?" },
    { icon: CheckCircle2, label: "How do I know it's done?", prompt: "How do I verify that I've completed this task correctly?" },
    { icon: FileQuestion, label: "Common mistakes?", prompt: "What are common mistakes people make with this task?" },
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (in production, this would call your AI API)
    setTimeout(() => {
      const aiResponse = generateAIResponse(textToSend, taskTitle, taskContext);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <Card className="border-2 border-purple-300 shadow-xl">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold">Ask Your AI Coach</h3>
          </div>
          {onClose && (
            <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-xs opacity-90 mt-1">Get instant answers about: {taskTitle}</p>
      </div>

      <div className="p-4 space-y-4">
        
        {/* Messages */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((message, idx) => (
            <div 
              key={idx} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-purple-50 text-gray-800 border border-purple-200'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-purple-600">AI Coach</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center gap-2 text-purple-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AI Coach is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Prompts */}
        {messages.length === 1 && (
          <div>
            <p className="text-xs font-bold text-gray-700 mb-2">Quick Questions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(prompt.prompt)}
                  className="flex items-center gap-2 p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-left transition-colors"
                  disabled={isLoading}
                >
                  <prompt.icon className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span className="text-xs text-gray-700">{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about this task..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <Button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          💡 Tip: Ask specific questions for better answers!
        </p>
      </div>
    </Card>
  );
}

// Simulate AI responses (in production, this would use OpenAI API)
function generateAIResponse(userMessage: string, taskTitle: string, taskContext: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // Task-specific responses
  if (taskTitle.includes('Form Business Entity')) {
    if (lowerMessage.includes('first') || lowerMessage.includes('start')) {
      return `Great question! Here's how to start:

1. **Choose your entity type** - Most small businesses choose LLC for simplicity and protection. S-Corp is better if you'll have employees or significant income.

2. **Check name availability** - Search your state's business registry to ensure your name isn't taken.

3. **Use a USPS business address** - NOT a residential address. You can use a virtual office, co-working space, or UPS Store mailbox.

4. **File with your state** - Use LegalZoom or IncFile (recommended) or file directly with your Secretary of State.

Want me to explain any of these steps in more detail?`;
    }

    if (lowerMessage.includes('llc') || lowerMessage.includes('corporation') || lowerMessage.includes('difference')) {
      return `Here's the breakdown:

**LLC (Limited Liability Company)**
✓ Easier to manage (less paperwork)
✓ Flexible tax options
✓ Protects personal assets
✓ Good for: Solo businesses, small teams, service companies

**S-Corporation**
✓ Tax savings on self-employment tax
✓ Better for raising investment
✓ More credibility with lenders
⚠ More paperwork and compliance
✓ Good for: Businesses with employees, high-income businesses

**Most small businesses start with LLC** and can elect S-Corp tax status later if needed. Does that help?`;
    }

    if (lowerMessage.includes('important') || lowerMessage.includes('why')) {
      return `This is THE most critical task because:

🎯 **You CANNOT become bankable without a business entity.** Lenders won't even look at sole proprietorships for business credit.

💰 **Unlocks +45 FICO SBSS points** - This is your biggest single point gain!

🔓 **Unlocks 3 other modules:**
- Business Banking (can't get business bank account without entity)
- Building Credit (business credit reports require entity)
- Access Funding (lenders require entity)

🛡️ **Protects your personal assets** - If the business gets sued or goes into debt, your house/car/savings are protected.

This is your foundation. Everything else builds on top of this!`;
    }
  }

  if (taskTitle.includes('Trademark')) {
    if (lowerMessage.includes('first') || lowerMessage.includes('start')) {
      return `Let's check for trademark conflicts:

1. **Go to USPTO TESS database** - https://tess.uspto.gov (free official search)

2. **Search your exact business name** - Use the "Basic Word Mark Search"

3. **Check similar names too** - Search variations and close matches

4. **Look at the results:**
   - ✓ GREEN: No exact or similar matches = You're safe!
   - ⚠ YELLOW: Similar names in different industries = Probably OK
   - 🛑 RED: Exact or very similar name in your industry = STOP! Choose a different name

This only takes 15-30 minutes. Want help interpreting your results?`;
    }

    if (lowerMessage.includes('important') || lowerMessage.includes('why')) {
      return `Here's why this matters:

⚖️ **Legal Protection** - If someone already trademarked your name, they can force you to stop using it and rebrand EVERYTHING.

💸 **Financial Risk** - Rebranding costs thousands (new logo, website, business cards, credit reports under new name, etc.)

⏰ **Wasted Time** - All the credit you built under the old name is GONE. You start over from scratch.

🏢 **Real Example** - A client built 6 months of credit under "Apex Solutions" then got a cease & desist letter. Had to rebrand to "Apex Business Group" and lost all their credit history.

**30 minutes now saves you thousands later!**`;
    }
  }

  if (taskTitle.includes('High-Risk Terms')) {
    if (lowerMessage.includes('terms') || lowerMessage.includes('list') || lowerMessage.includes('which')) {
      return `Here are the high-risk terms that trigger auto-declines:

**🚫 AVOID THESE IN YOUR BUSINESS NAME:**

Financial Services:
• Loan, Lending, Credit, Debt, Financing, Capital, Funding

Regulated Industries:
• Cannabis, Marijuana, CBD, Hemp
• Tobacco, Vape, Vaping, E-Cigarette
• Gambling, Casino, Betting, Poker
• Adult, Escort, Dating
• Firearms, Guns, Ammunition
• Pharmacy, Dispensary

Generic Terms:
• Consulting (too vague)
• Services (too vague)
• Solutions (too vague)

**💡 What if your name has one of these?**
You have options:
1. Use a DBA (Doing Business As) with a safer name
2. Form entity under a different name
3. Rebrand now before building credit

Want help thinking of alternatives?`;
    }
  }

  // Generic helpful responses
  if (lowerMessage.includes('done') || lowerMessage.includes('complete') || lowerMessage.includes('verify')) {
    return `Here's how to verify this task is complete:

✓ **Documentation** - You should have official paperwork/confirmation
✓ **Upload to system** - Add your documents for coach review
✓ **Check the requirements** - Re-read the task description and ensure you did everything
✓ **Test it** - If it's something like "check a database," make sure you got results

If you're unsure, upload what you have and click "Request Coach Review" - a human coach will verify it for you within 24 hours!

Does this help?`;
  }

  if (lowerMessage.includes('mistake') || lowerMessage.includes('wrong') || lowerMessage.includes('error')) {
    return `Common mistakes with "${taskTitle}":

❌ **Rushing through** - Taking time now saves fixing later
❌ **Using residential address** - Use USPS business address only
❌ **Not keeping documents** - Save everything for your records
❌ **Assuming "close enough" is OK** - Lenders are strict, follow instructions exactly

✅ **Best Practice:** Complete the task step-by-step, upload your documents, and get coach approval before marking "complete."

Any specific concern I can address?`;
  }

  if (lowerMessage.includes('how long') || lowerMessage.includes('time')) {
    return `For "${taskTitle}":

⏱️ **Estimated time:** Check the task card for the time estimate

📅 **Due date:** Check the task card for your specific deadline

🚀 **Pro tip:** Break big tasks into 15-minute chunks. You can start now and finish later!

Want me to break this down into smaller steps?`;
  }

  if (lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('expensive')) {
    return `Good question about costs!

💰 **DIY Option:** Most tasks can be done for FREE or low cost if you do them yourself

🤖 **Auto-Service Option:** Some tasks have "We Can Do This For You" automation (usually $49-$99)

👥 **Service Providers:** We recommend trusted partners (LegalZoom, IncFile, etc.) - costs vary

📊 **Return on Investment:** Remember, completing this unlocks funding opportunities worth MUCH more than the cost!

Want specific pricing for this task?`;
  }

  // Default helpful response
  return `That's a great question about "${taskTitle}"!

Based on what you're asking, here are some things to consider:

${taskContext}

**My recommendation:**
1. Review the task details carefully
2. Click any recommended service links for guidance
3. If you're still unsure, upload what you have and request human coach review
4. Don't skip this - it's important for your bankable journey!

Can I clarify anything specific?`;
}
