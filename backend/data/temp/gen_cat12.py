import json

with open(r'D:\Jay Rathod\Projects\english-speaking-app\backend\data\temp\cat_12_words.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

words = data['words']

mini_dialogues = [
    {
        "id": 1,
        "title": "Before the Storm",
        "situation": "Two colleagues discuss an approaching storm and decide whether to cancel their outdoor plans.",
        "turns": [
            {"speaker": "A", "text": "Have you checked the forecast? There's a storm warning for tonight."},
            {"speaker": "B", "text": "Yes, the barometric pressure has been dropping all afternoon. That usually means heavy rain."},
            {"speaker": "A", "text": "The sky is already overcast and I can hear distant thunder. Should we cancel the picnic?"},
            {"speaker": "B", "text": "Definitely. The weather app says there could even be a tornado warning in some areas."},
            {"speaker": "A", "text": "Better safe than sorry. Let's reschedule for next weekend — hopefully we'll get a breezy, sunny day."},
            {"speaker": "B", "text": "Agreed. I'll send a message to everyone now before the downpour starts."}
        ],
        "words_used": ["storm warning", "barometric pressure", "overcast", "thunder", "tornado", "breezy", "downpour"]
    },
    {
        "id": 2,
        "title": "Talking About Seasons and Climate",
        "situation": "A teacher explains seasonal weather changes to curious students.",
        "turns": [
            {"speaker": "Teacher", "text": "Can anyone tell me what happens during the summer solstice?"},
            {"speaker": "Student", "text": "It's the longest day of the year, right? When the sun is at its furthest point north."},
            {"speaker": "Teacher", "text": "Excellent! And what about the equinox — how is that different?"},
            {"speaker": "Student", "text": "On the equinox, day and night are equal in length. It happens twice a year."},
            {"speaker": "Teacher", "text": "Perfect. Now, why do deciduous trees lose their leaves in autumn?"},
            {"speaker": "Student", "text": "Because the autumnal season brings cooler temperatures and less light, so the trees become dormant to survive."}
        ],
        "words_used": ["solstice", "equinox", "deciduous", "autumnal", "dormant"]
    },
    {
        "id": 3,
        "title": "A Walk Through the Wetlands",
        "situation": "Two nature enthusiasts explore a wetland reserve and discuss its ecological importance.",
        "turns": [
            {"speaker": "Riya", "text": "This wetland is incredible! I had no idea so many species of birds migrate here every winter."},
            {"speaker": "Dev", "text": "Yes, flamingos especially love the shallow lagoon over there. It's a classic example of migration."},
            {"speaker": "Riya", "text": "And look at those mangrove roots along the estuary. They look like they're walking on water!"},
            {"speaker": "Dev", "text": "Mangroves are amazing. They protect the coast and support incredible biodiversity."},
            {"speaker": "Riya", "text": "It's a shame that habitat loss is threatening places like this."},
            {"speaker": "Dev", "text": "Exactly. Deforestation and pollution are driving so many ecosystems to the brink. Conservation is urgent."}
        ],
        "words_used": ["wetland", "species", "migration", "lagoon", "mangrove", "estuary", "biodiversity", "habitat loss", "deforestation", "pollution", "ecosystem"]
    },
    {
        "id": 4,
        "title": "After the Earthquake",
        "situation": "Two survivors discuss what happened after a major earthquake struck their city.",
        "turns": [
            {"speaker": "Meera", "text": "That earthquake last night was terrifying. Do you know where the epicentre was?"},
            {"speaker": "Arjun", "text": "The news said it was about 40 kilometres from the city. We felt strong tremors here, but the damage was worse closer to the epicentre."},
            {"speaker": "Meera", "text": "I heard there were several aftershocks early this morning too."},
            {"speaker": "Arjun", "text": "Yes, seismic activity in this region has been increasing. Scientists have been monitoring it for months."},
            {"speaker": "Meera", "text": "At least there was a storm warning system that alerted people in coastal areas about the tsunami risk."},
            {"speaker": "Arjun", "text": "Early warnings save lives. We need stronger earthquake-resistant buildings and better disaster preparedness."}
        ],
        "words_used": ["earthquake", "epicentre", "aftershock", "seismic activity", "tsunami", "storm warning"]
    },
    {
        "id": 5,
        "title": "The Climate Change Debate",
        "situation": "Two friends discuss environmental problems and what can be done about them.",
        "turns": [
            {"speaker": "Priya", "text": "Did you see the news? Wildfires are burning across three states and drought conditions are spreading fast."},
            {"speaker": "Karan", "text": "Climate change is making extreme weather events like these far more frequent. The heatwave last month was record-breaking."},
            {"speaker": "Priya", "text": "And the glaciers are retreating rapidly. Once they are gone, millions of people lose a vital water source."},
            {"speaker": "Karan", "text": "We need large-scale carbon sequestration and a rapid switch to renewable energy. Our carbon footprint as a society is far too high."},
            {"speaker": "Priya", "text": "Desertification is also accelerating in arid regions — fertile land turning to desert because of overuse and drought."},
            {"speaker": "Karan", "text": "Sustainability has to become the foundation of every policy decision. Otherwise the damage will be irreversible."}
        ],
        "words_used": ["wildfire", "drought", "climate change", "heatwave", "glacier", "carbon sequestration", "renewable energy", "carbon footprint", "desertification", "arid", "sustainability"]
    }
]

quiz_questions = [
    {
        "id": 1,
        "type": "meaning_en_to_gu",
        "word_id": 1,
        "question": "What does 'Drizzle' mean in Gujarati?",
        "options": [
            "A) હળવો, ઝીણો વરસાદ",
            "B) ભારે, અચાનક વરસાદ",
            "C) જોરદાર પવન",
            "D) ઘટ્ટ ધુમ્મસ"
        ],
        "answer": "A"
    },
    {
        "id": 2,
        "type": "meaning_gu_to_en",
        "word_id": 10,
        "question": "ભારે બરફ અને જોરદાર પવન સાથે આવતું ભીષણ હિમ-તોફાન — આ Gujarati meaning ક્યા word ની છે?",
        "options": [
            "A) Frost",
            "B) Sleet",
            "C) Blizzard",
            "D) Hailstorm"
        ],
        "answer": "C"
    },
    {
        "id": 3,
        "type": "synonym",
        "word_id": 6,
        "question": "Which word is the best synonym for 'Gale'?",
        "options": [
            "A) Breeze",
            "B) Squall",
            "C) Drizzle",
            "D) Fog"
        ],
        "answer": "B"
    },
    {
        "id": 4,
        "type": "antonym",
        "word_id": 4,
        "question": "What is the antonym of 'Humid'?",
        "options": [
            "A) Muggy",
            "B) Sultry",
            "C) Arid",
            "D) Breezy"
        ],
        "answer": "C"
    },
    {
        "id": 5,
        "type": "fill_blank",
        "word_id": 18,
        "question": "Farmers in India eagerly await the ________ season every year for their crops.",
        "options": [
            "A) Blizzard",
            "B) Monsoon",
            "C) Drought",
            "D) Equinox"
        ],
        "answer": "B"
    },
    {
        "id": 6,
        "type": "definition",
        "word_id": 26,
        "question": "Which definition best describes 'Drought'?",
        "options": [
            "A) A sudden and heavy fall of rain lasting one hour",
            "B) A prolonged period of abnormally low rainfall leading to water shortage",
            "C) The thinning of the ozone layer due to pollution",
            "D) A violent, rotating column of air extending from a storm cloud"
        ],
        "answer": "B"
    },
    {
        "id": 7,
        "type": "meaning_en_to_gu",
        "word_id": 40,
        "question": "What does 'Glacier' mean in Gujarati?",
        "options": [
            "A) ઊભા ખડકો વચ્ચેની ઊંડી ખાડી",
            "B) ઘણા વર્ષો સુધી જામેલ, ધીમે ધીમે ખસતો વિશાળ બરફ-ભૂ",
            "C) નદી-સમુદ્ર મળ્યા ત્યાં ત્રિકોણ ભૂ-રચના",
            "D) ઘાસ-ઢંકાયેલ ઉષ્ણ-પ્રદેશ"
        ],
        "answer": "B"
    },
    {
        "id": 8,
        "type": "meaning_gu_to_en",
        "word_id": 58,
        "question": "ઋતુ-ક્રમ અનુસાર પ્રાણી/પક્ષી ખોરાક અથવા પ્રજનન માટે દૂર પ્રવાસ — આ meaning ક્યા word ની છે?",
        "options": [
            "A) Hibernation",
            "B) Camouflage",
            "C) Migration",
            "D) Symbiosis"
        ],
        "answer": "C"
    },
    {
        "id": 9,
        "type": "fill_blank",
        "word_id": 69,
        "question": "__________ in the Amazon rainforest is threatening thousands of species with extinction.",
        "options": [
            "A) Photosynthesis",
            "B) Deforestation",
            "C) Pollination",
            "D) Biodiversity"
        ],
        "answer": "B"
    },
    {
        "id": 10,
        "type": "synonym",
        "word_id": 64,
        "question": "Which word is the best synonym for 'Biodiversity'?",
        "options": [
            "A) Monoculture",
            "B) Homogeneity",
            "C) Ecological richness",
            "D) Carbon footprint"
        ],
        "answer": "C"
    },
    {
        "id": 11,
        "type": "antonym",
        "word_id": 96,
        "question": "Which option is the antonym of 'Aftershock' in earthquake terminology?",
        "options": [
            "A) Tremor",
            "B) Foreshock",
            "C) Seismic event",
            "D) Epicentre"
        ],
        "answer": "B"
    },
    {
        "id": 12,
        "type": "definition",
        "word_id": 87,
        "question": "What is a 'Cyclone'?",
        "options": [
            "A) A thin layer of ice crystals that forms on cold surfaces overnight",
            "B) The point on the Earth's surface directly above the focus of an earthquake",
            "C) A large, destructive system of winds rotating around a centre of low pressure over the ocean",
            "D) The gradual wearing away of land by wind or water"
        ],
        "answer": "C"
    },
    {
        "id": 13,
        "type": "meaning_en_to_gu",
        "word_id": 77,
        "question": "What does 'Sustainability' mean in Gujarati?",
        "options": [
            "A) પ્રાકૃ-ઉ (environment) ઉ-ઉ (resources) ઘ-ઉ (reduce) — environmental damage",
            "B) વર્તમાન જરૂ-ઉ (needs) ભ-ઉ (future) ક્ષ-ઉ (capacity) ઘ-ઉ (without reducing) — sustainability",
            "C) CO₂ ઉ-ઉ (long-term store) — carbon capture",
            "D) ઉ-ઉ (bacteria) ઉ-ઉ (naturally break down) — decompose"
        ],
        "answer": "B"
    },
    {
        "id": 14,
        "type": "fill_blank",
        "word_id": 9,
        "question": "A severe ________ struck northern India last June, with temperatures exceeding 47 degrees Celsius for over a week.",
        "options": [
            "A) Blizzard",
            "B) Heatwave",
            "C) Frost",
            "D) Monsoon"
        ],
        "answer": "B"
    },
    {
        "id": 15,
        "type": "definition",
        "word_id": 71,
        "question": "Which statement correctly describes the 'Greenhouse effect'?",
        "options": [
            "A) The process by which green plants use sunlight to produce food from CO2 and water",
            "B) The warming of the Earth caused by gases in the atmosphere trapping heat from the sun",
            "C) The large-scale clearing of forests for agriculture and construction",
            "D) A close, long-term interaction between two different species for mutual benefit"
        ],
        "answer": "B"
    }
]

output = {
    "id": 12,
    "category": "Weather & Nature",
    "level": "Intermediate to Advanced",
    "total_words": 100,
    "subcategories": [
        "Weather Conditions",
        "Seasons & Climate",
        "Natural Features",
        "Plants & Wildlife",
        "Environmental Issues",
        "Natural Disasters"
    ],
    "subcategory_counts": {
        "Weather Conditions": 17,
        "Seasons & Climate": 17,
        "Natural Features": 17,
        "Plants & Wildlife": 17,
        "Environmental Issues": 16,
        "Natural Disasters": 16
    },
    "difficulty_counts": {
        "Intermediate": 64,
        "Advanced": 36
    },
    "words": words,
    "mini_dialogues": mini_dialogues,
    "quiz": {
        "title": "Weather & Nature Quiz",
        "category": "Weather & Nature",
        "level": "Intermediate to Advanced",
        "instructions": "Choose the best answer.",
        "total_questions": 15,
        "questions": quiz_questions
    }
}

with open(r'D:\Jay Rathod\Projects\english-speaking-app\backend\data\temp\cat_12.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("File written successfully!")
print("Words count:", len(output['words']))
print("Dialogues count:", len(output['mini_dialogues']))
print("Quiz questions count:", len(output['quiz']['questions']))
