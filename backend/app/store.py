"""In-memory store — replaces PostgreSQL for all runtime state."""
from datetime import date

SCENARIOS: list[dict] = [
    {"id": 1, "category": "Workplace", "title": "Meeting a New Colleague", "description": "Introduce yourself to a new coworker and start a friendly conversation.", "difficulty": "beginner", "ai_role": "your new colleague named Priya who just joined the company", "user_role": "an existing employee welcoming a new team member", "example_opener": "Hi! I'm Priya, I just joined the team today. It's so nice to meet everyone! What do you do here?", "icon": "🤝", "estimated_minutes": 8, "system_prompt": ""},
    {"id": 2, "category": "Workplace", "title": "Professional Meeting & Presentation", "description": "Present your project update in a team meeting and handle questions.", "difficulty": "intermediate", "ai_role": "your manager named Rahul who is chairing the weekly team meeting", "user_role": "a team member presenting your weekly project update", "example_opener": "Good morning everyone. Let's start with project updates. Can you walk us through where things stand with your work this week?", "icon": "📊", "estimated_minutes": 12, "system_prompt": ""},
    {"id": 3, "category": "Social", "title": "Casual Chat with Friends", "description": "Have a relaxed conversation about weekends, hobbies, and daily life.", "difficulty": "beginner", "ai_role": "your friend Alex who you haven't seen in a while", "user_role": "catching up with an old friend", "example_opener": "Hey! It's been so long! What have you been up to lately? Did you do anything fun this weekend?", "icon": "😊", "estimated_minutes": 7, "system_prompt": ""},
    {"id": 4, "category": "Services", "title": "At the Bank", "description": "Open a new account, ask about services, or resolve an issue at the bank.", "difficulty": "beginner", "ai_role": "a bank customer service representative named Ms. Sharma", "user_role": "a customer visiting the bank to open a savings account", "example_opener": "Good morning! Welcome to City Bank. How can I assist you today?", "icon": "🏦", "estimated_minutes": 10, "system_prompt": ""},
    {"id": 5, "category": "Services", "title": "Hospital / Doctor Appointment", "description": "Describe symptoms to a doctor and understand medical advice.", "difficulty": "intermediate", "ai_role": "Dr. Patel, a general physician at a clinic", "user_role": "a patient coming in for a consultation about a health issue", "example_opener": "Hello, please come in and have a seat. I'm Dr. Patel. What brings you in today? Tell me about what you've been experiencing.", "icon": "🏥", "estimated_minutes": 12, "system_prompt": ""},
    {"id": 6, "category": "Food & Dining", "title": "Ordering at a Restaurant", "description": "Order food, ask about the menu, and handle dietary preferences at a restaurant.", "difficulty": "beginner", "ai_role": "a friendly waiter named Sam at an upscale restaurant", "user_role": "a customer dining out for dinner", "example_opener": "Good evening and welcome! My name is Sam and I'll be your server tonight. Can I start you off with something to drink, or would you like a few minutes to look at the menu?", "icon": "🍽️", "estimated_minutes": 8, "system_prompt": ""},
    {"id": 7, "category": "Shopping", "title": "Shopping at a Store", "description": "Ask for help finding items, negotiate, and complete a purchase.", "difficulty": "beginner", "ai_role": "a store assistant named Jake at a clothing shop", "user_role": "a customer looking for a specific outfit", "example_opener": "Hi there! Welcome to StyleHub. Are you looking for something specific today, or just browsing? I'd love to help you find something!", "icon": "🛍️", "estimated_minutes": 8, "system_prompt": ""},
    {"id": 8, "category": "Education", "title": "Asking a Teacher for Help", "description": "Approach a teacher or professor to ask for help, clarification, or guidance.", "difficulty": "beginner", "ai_role": "Professor Williams, a university lecturer in business studies", "user_role": "a student who needs help understanding a concept from today's lecture", "example_opener": "Come in! You wanted to speak with me? Please, have a seat. What's on your mind?", "icon": "📚", "estimated_minutes": 10, "system_prompt": ""},
    {"id": 9, "category": "Career", "title": "HR Job Interview", "description": "Answer common HR interview questions about your background, strengths, and goals.", "difficulty": "intermediate", "ai_role": "Sarah, an HR Manager interviewing candidates for a software company", "user_role": "a job applicant interviewing for a mid-level position", "example_opener": "Good morning! Please come in and make yourself comfortable. I'm Sarah from HR. Thank you for coming in today. Before we begin, can you tell me a little bit about yourself?", "icon": "💼", "estimated_minutes": 15, "system_prompt": ""},
    {"id": 10, "category": "Career", "title": "Technical Interview", "description": "Handle technical questions, explain your approach, and demonstrate problem-solving skills.", "difficulty": "advanced", "ai_role": "Arjun, a senior software engineer conducting a technical interview", "user_role": "a software developer candidate in a technical interview", "example_opener": "Hi, welcome! I'm Arjun, I'm a senior engineer on the backend team. Today I'd like to discuss your technical background and work through a few scenarios together. First, tell me about a challenging technical problem you've solved recently.", "icon": "💻", "estimated_minutes": 20, "system_prompt": ""},
    {"id": 11, "category": "Communication", "title": "Telephone Conversation", "description": "Make and receive phone calls for appointments, inquiries, or complaints.", "difficulty": "beginner", "ai_role": "a customer support agent at a mobile phone company", "user_role": "a customer calling to report a billing issue", "example_opener": "Thank you for calling TechMobile support. My name is Lisa. How may I help you today?", "icon": "📞", "estimated_minutes": 8, "system_prompt": ""},
    {"id": 12, "category": "Travel", "title": "At the Airport", "description": "Check in, ask about your flight, and navigate airport services in English.", "difficulty": "intermediate", "ai_role": "an airline check-in staff member at the international departures counter", "user_role": "a passenger checking in for an international flight", "example_opener": "Good morning! Welcome to SkyAir check-in. May I see your passport and booking confirmation please?", "icon": "✈️", "estimated_minutes": 10, "system_prompt": ""},
    {"id": 13, "category": "Public Speaking", "title": "Self Introduction & Public Speaking", "description": "Introduce yourself confidently in a group setting or give a short speech.", "difficulty": "intermediate", "ai_role": "the host of a networking event who has invited you to introduce yourself to the group", "user_role": "a professional giving a 2-minute self-introduction to 20 people at a networking event", "example_opener": "Ladies and gentlemen, we have a new face joining us today! Please welcome our guest. Could you come up and tell us a bit about yourself — who you are, what you do, and what brought you here today?", "icon": "🎤", "estimated_minutes": 10, "system_prompt": ""},
    {"id": 14, "category": "Conflict & Negotiation", "title": "Handling a Complaint", "description": "Professionally raise or respond to a complaint and negotiate a resolution.", "difficulty": "advanced", "ai_role": "the customer service manager at a hotel where you had a bad experience", "user_role": "a guest who had problems with your room and wants the issue resolved", "example_opener": "Good afternoon. I understand you'd like to speak with a manager? I'm the guest relations manager here. Please tell me what happened — I'm here to help make things right.", "icon": "🗣️", "estimated_minutes": 12, "system_prompt": ""},
]

_SCENARIO_BY_ID: dict[int, dict] = {s["id"]: s for s in SCENARIOS}


def get_scenario(scenario_id: int) -> dict | None:
    return _SCENARIO_BY_ID.get(scenario_id)


sessions: dict[str, dict] = {}

stats: dict = {
    "total_sessions": 0,
    "total_minutes": 0,
    "current_streak": 0,
    "best_streak": 0,
    "vocabulary_count": 0,
    "avg_score": 0.0,
    "level": "beginner",
}

DAILY_CHALLENGE = {
    "scenario_id": 1,
    "prompt": "Introduce yourself to a new colleague at work. Tell them your name, your role, and one thing you enjoy about your job.",
    "target_phrases": ["Nice to meet you", "I'm responsible for", "I really enjoy"],
    "date": str(date.today()),
}
