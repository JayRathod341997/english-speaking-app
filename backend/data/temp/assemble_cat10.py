import json, os

with open('cat_10_part1.json', 'r', encoding='utf-8') as f:
    words_1_17 = json.load(f)
with open('cat_10_words_18_51.json', 'r', encoding='utf-8') as f:
    words_18_51 = json.load(f)
with open('cat_10_words_52_84.json', 'r', encoding='utf-8') as f:
    words_52_84 = json.load(f)
with open('cat_10_words_85_100.json', 'r', encoding='utf-8') as f:
    words_85_100 = json.load(f)

all_words = words_1_17 + words_18_51 + words_52_84 + words_85_100

dialogues = [
  {
    "id": 1,
    "title": "Bargaining at a Market",
    "situation": "Priya is shopping at a local street market and wants to buy a kurta.",
    "participants": ["Priya (buyer)", "Vendor"],
    "dialogue": [
      {"speaker": "Priya", "english": "How much is this kurta?", "gujarati": "આ કુર્તાની કિંમત કેટલી છે?"},
      {"speaker": "Vendor", "english": "The price tag says 800 rupees, madam.", "gujarati": "ભaval-chitthi 800 rupiya batave chhe, madam."},
      {"speaker": "Priya", "english": "That seems overpriced. Can you give me a discount?", "gujarati": "Ae ghanu mahnghu lagay chhe. Shya tame discount aapi shako?"},
      {"speaker": "Vendor", "english": "Okay, best offer — 650 rupees. It is genuine cotton, very durable.", "gujarati": "Sari, best offer — 650 rupiya. Ae asli cotton chhe, khub tikau."},
      {"speaker": "Priya", "english": "I will take it for 600 rupees. That is my final offer.", "gujarati": "Hu 600 rupiya-ma lais. Ae meri final offer chhe."},
      {"speaker": "Vendor", "english": "Deal! Here is your receipt.", "gujarati": "Deal! Lo thari receipt."}
    ],
    "vocabulary_focus": ["price tag", "overpriced", "discount", "best offer", "genuine", "durable", "receipt"]
  },
  {
    "id": 2,
    "title": "Returning a Defective Product",
    "situation": "Raj bought a fan from a department store but it stopped working the next day.",
    "participants": ["Raj (customer)", "Store Manager"],
    "dialogue": [
      {"speaker": "Raj", "english": "I bought this fan yesterday and it is already defective.", "gujarati": "Hu aa fan gaat-kal khadyo hto, ane ae pahela j kharab thai gayu."},
      {"speaker": "Store Manager", "english": "I am sorry to hear that. Do you have the receipt?", "gujarati": "Khed chhe ae janine. Thari paase receipt chhe?"},
      {"speaker": "Raj", "english": "Yes, here it is. I would like a full refund or an exchange.", "gujarati": "Haa, lo ae. Mane full refund ya exchange joiye."},
      {"speaker": "Store Manager", "english": "Since it is under warranty, we can exchange it immediately.", "gujarati": "Chuky ae warranty-ma chhe, ame tatkal exchange kari shakiye."},
      {"speaker": "Raj", "english": "Great. Can I also get a new receipt for the exchanged item?", "gujarati": "Saaru. Ane exchange karela item ni navi receipt pan mali shake?"},
      {"speaker": "Store Manager", "english": "Of course. Here is your brand new fan and a new receipt.", "gujarati": "Bilkul. Lo thamaro brand new fan ane navi receipt."}
    ],
    "vocabulary_focus": ["defective", "receipt", "refund", "exchange", "warranty", "brand new"]
  },
  {
    "id": 3,
    "title": "Opening a Bank Account",
    "situation": "Meena visits a bank to open her first savings account.",
    "participants": ["Meena (customer)", "Bank Officer"],
    "dialogue": [
      {"speaker": "Meena", "english": "I would like to open a savings account, please.", "gujarati": "Mane savings account kholvu chhe, please."},
      {"speaker": "Bank Officer", "english": "Sure. You will need to make an initial deposit of 1000 rupees.", "gujarati": "Bilkul. Tamne shuruat-ma 1000 rupiya deposit karva padse."},
      {"speaker": "Meena", "english": "What is the interest rate on the savings account?", "gujarati": "Savings account par interest rate ketlo chhe?"},
      {"speaker": "Bank Officer", "english": "It is 3.5 percent per year. You will receive a monthly statement by email.", "gujarati": "Ae varshe 3.5% chhe. Tamne email par monthly statement malse."},
      {"speaker": "Meena", "english": "Can I also get a debit card?", "gujarati": "Shu mane debit card pan mali shake?"},
      {"speaker": "Bank Officer", "english": "Yes, your debit card and account balance can be checked anytime via our app.", "gujarati": "Haa, thamari debit card ane account balance game tyare aapni app thi janchay."}
    ],
    "vocabulary_focus": ["savings account", "deposit", "interest rate", "statement", "debit card", "account balance"]
  },
  {
    "id": 4,
    "title": "Shopping for a Laptop Online",
    "situation": "Karan is buying a laptop on an e-commerce website and comparing payment options.",
    "participants": ["Karan", "Customer Support Agent"],
    "dialogue": [
      {"speaker": "Karan", "english": "Hi, I see the sticker price is 65000 rupees but I have a coupon code.", "gujarati": "Hi, Hu jou chhu ke sticker price 65000 rupiya chhe pan mara paas coupon code chhe."},
      {"speaker": "Support Agent", "english": "Great! Enter the coupon at checkout for a 10 percent discount.", "gujarati": "Saaru! Tame checkout vakhte coupon enter karo ane 10% discount malse."},
      {"speaker": "Karan", "english": "Is there a cashback offer too?", "gujarati": "Shu cashback offer pan chhe?"},
      {"speaker": "Support Agent", "english": "Yes, pay via UPI and earn 5 percent cashback — credited within 7 days.", "gujarati": "Haa, UPI thi chukavsho to 5% cashback malse — 7 din-ma credit thashe."},
      {"speaker": "Karan", "english": "Can I also choose an instalment plan?", "gujarati": "Shu hu instalment plan pan pasand kari sakhu?"},
      {"speaker": "Support Agent", "english": "Yes, a no-cost instalment plan is available for 6 months via your credit card.", "gujarati": "Haa, thamara credit card thi 6 mahine no-cost instalment plan uplabdh chhe."}
    ],
    "vocabulary_focus": ["sticker price", "coupon", "discount", "cashback", "UPI", "instalment plan", "credit card"]
  },
  {
    "id": 5,
    "title": "At a Currency Exchange Counter",
    "situation": "Nita is at the airport exchanging Indian Rupees to US Dollars before her trip abroad.",
    "participants": ["Nita (traveller)", "Exchange Officer"],
    "dialogue": [
      {"speaker": "Nita", "english": "I need to exchange some Indian Rupees to US Dollars.", "gujarati": "Mane kuch Indian Rupees ne US Dollars-ma exchange karva chhe."},
      {"speaker": "Exchange Officer", "english": "Today's exchange rate is 83 rupees per dollar.", "gujarati": "Aaj-ni exchange rate 83 rupiya per dollar chhe."},
      {"speaker": "Nita", "english": "I would like to exchange 83000 rupees — that should give me 1000 dollars.", "gujarati": "Mne 83000 rupiya exchange karva chhe — ae 1000 dollar apashe."},
      {"speaker": "Exchange Officer", "english": "Correct. Will you be paying in cash or via wire transfer?", "gujarati": "Sahi chhe. Tame cash-ma chukavsho ke wire transfer thi?"},
      {"speaker": "Nita", "english": "Cash please. And do you accept contactless payment?", "gujarati": "Cash please. Ane tame contactless payment sweekar karo chho?"},
      {"speaker": "Exchange Officer", "english": "Yes we do. Here is your foreign exchange and a receipt.", "gujarati": "Haa karie. Lo thamari foreign exchange ane receipt."}
    ],
    "vocabulary_focus": ["exchange rate", "foreign exchange", "cash", "wire transfer", "contactless payment", "receipt"]
  }
]

quiz = {
  "title": "Shopping & Money Quiz",
  "category": "Shopping & Money",
  "level": "Intermediate to Advanced",
  "instructions": "Choose the best answer.",
  "total_questions": 15,
  "questions": [
    {
      "id": 1, "type": "meaning_en_to_gu",
      "question": "What does 'Bargain' mean in Gujarati?",
      "options": ["ઓછી કિંમতે ખرidelyel chij", "ઉत्पाद par lagateli price-chitthi", "niyamit automatic payment", "asli vastu"],
      "answer": "ઓછી કિંમتে ખridayelu chij",
      "explanation": "Bargain = ઓChhi kimt-e kharidayelu (something bought cheap or price negotiated)."
    },
    {
      "id": 2, "type": "meaning_gu_to_en",
      "question": "Bank account-ma-thi paisa upadvu = ?",
      "options": ["Deposit", "Withdrawal", "Balance", "Interest"],
      "answer": "Withdrawal",
      "explanation": "Withdrawal = bank account-ma-thi paisa upadvu."
    },
    {
      "id": 3, "type": "synonym",
      "question": "Which word is a synonym of 'Genuine'?",
      "options": ["Counterfeit", "Authentic", "Defective", "Overpriced"],
      "answer": "Authentic",
      "explanation": "Genuine = Authentic = asli/original. Counterfeit is the antonym."
    },
    {
      "id": 4, "type": "antonym",
      "question": "What is the antonym of 'Wholesale'?",
      "options": ["Retail", "Surplus", "Vendor", "Markup"],
      "answer": "Retail",
      "explanation": "Wholesale = bulk selling at low price. Retail = selling to individual consumers."
    },
    {
      "id": 5, "type": "fill_blank",
      "question": "She used a ________ code to get 15% off her purchase online.",
      "options": ["Mortgage", "Coupon", "Collateral", "Overdraft"],
      "answer": "Coupon",
      "explanation": "A coupon (or promo code) gives a discount on purchases."
    },
    {
      "id": 6, "type": "definition",
      "question": "A numerical rating that represents a person's creditworthiness is called:",
      "options": ["Interest rate", "Credit score", "Overdraft", "Fixed deposit"],
      "answer": "Credit score",
      "explanation": "Credit score (CIBIL score in India) measures how trustworthy a borrower is."
    },
    {
      "id": 7, "type": "meaning_en_to_gu",
      "question": "What does 'Mortgage' mean?",
      "options": ["milkat kharidva-ni loan jema milkat girvi rahe", "bank-ma paisa jama karva", "chij-ni kimat ghataadvi", "automatic payment system"],
      "answer": "milkat kharidva-ni loan jema milkat girvi rahe",
      "explanation": "Mortgage = property loan where the property is held as security."
    },
    {
      "id": 8, "type": "fill_blank",
      "question": "The television comes with a 2-year ________ against manufacturing defects.",
      "options": ["Markup", "Warranty", "Remittance", "Instalment"],
      "answer": "Warranty",
      "explanation": "A warranty is a written guarantee to repair or replace defective products."
    },
    {
      "id": 9, "type": "synonym",
      "question": "Which word is closest in meaning to 'Refund'?",
      "options": ["Markup", "Invoice", "Reimbursement", "Bid"],
      "answer": "Reimbursement",
      "explanation": "Refund = Reimbursement = paisa pacha aapvu."
    },
    {
      "id": 10, "type": "meaning_gu_to_en",
      "question": "Paryavaran-ne nukshan-karak na hoy — which word matches?",
      "options": ["Durable", "Compact", "Eco-friendly", "Waterproof"],
      "answer": "Eco-friendly",
      "explanation": "Eco-friendly = not harmful to the environment = paryavaran-mitra."
    },
    {
      "id": 11, "type": "antonym",
      "question": "What is the antonym of 'Premium'?",
      "options": ["Durable", "Budget", "Genuine", "Versatile"],
      "answer": "Budget",
      "explanation": "Premium = high quality and high price. Budget = low cost and economical."
    },
    {
      "id": 12, "type": "definition",
      "question": "Money sent by a migrant worker to family in another country is called:",
      "options": ["Wire transfer", "Remittance", "Cashback", "Standing order"],
      "answer": "Remittance",
      "explanation": "Remittance specifically refers to money sent abroad, usually by migrant workers."
    },
    {
      "id": 13, "type": "fill_blank",
      "question": "She tapped her phone on the reader to make a ________ payment without entering a PIN.",
      "options": ["Contactless", "Wire", "Fixed", "Wholesale"],
      "answer": "Contactless",
      "explanation": "Contactless payment uses NFC technology — tap to pay without entering a PIN."
    },
    {
      "id": 14, "type": "meaning_en_to_gu",
      "question": "What is a 'Clearance sale'?",
      "options": ["paisa-no record", "purano stock uchha bhav-e vechavy", "purano stock ochha bhav-e udadvi devo", "navi chij launch"],
      "answer": "purano stock ochha bhav-e udadvi devo",
      "explanation": "Clearance sale = selling old stock cheaply to clear inventory."
    },
    {
      "id": 15, "type": "synonym",
      "question": "Which word is closest in meaning to 'Counterfeit'?",
      "options": ["Genuine", "Durable", "Fake", "Premium"],
      "answer": "Fake",
      "explanation": "Counterfeit = Fake = nakli = made to deceive, not genuine."
    }
  ]
}

final = {
  "id": 10,
  "category": "Shopping & Money",
  "level": "Intermediate to Advanced",
  "total_words": 100,
  "subcategories": ["Types of Shops", "Buying & Selling", "Prices & Bargaining", "Banking & Finance", "Currency & Payments", "Describing Products"],
  "subcategory_counts": {"Types of Shops": 17, "Buying & Selling": 17, "Prices & Bargaining": 17, "Banking & Finance": 17, "Currency & Payments": 16, "Describing Products": 16},
  "difficulty_counts": {"Intermediate": 85, "Advanced": 15},
  "words": all_words,
  "mini_dialogues": dialogues,
  "quiz": quiz
}

with open('cat_10.json', 'w', encoding='utf-8') as f:
    json.dump(final, f, ensure_ascii=False, indent=2)

print("Done!")
print(f"File size: {os.path.getsize('cat_10.json')} bytes")
print(f"Total words: {len(all_words)}")
