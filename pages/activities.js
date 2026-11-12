/* =====================================================================
   SMART MUET GUIDE · Interactive eBook · ACTIVITIES (edit me!)
   ---------------------------------------------------------------------
   One block per unit (chapter). Each unit has 4 activity types:
     mcq   : multiple choice          {q, options:[..], answer:index, why, say?}
     tf    : true / false             {q, answer:true|false, why}
     fill  : fill in the blank        {q:"text with ___", answers:[..], why}
     match : matching pairs           {title, pairs:[[left,right],...]}
   `end` = the page number where the unit ends (the checkpoint appears there).
   `say` (optional, on mcq) = text read aloud by the device voice.
   ===================================================================== */

window.BOOK_CONFIG = {
 "title": "Smart MUET Guide · Band Up! 2027",
 "totalPages": 53,
 "pagePattern": "pages/p-{nn}.webp",
 "REQUIRE_COMPLETE": true,
 "PASS_PERCENT": 60,
 "STORAGE_KEY": "smartMuetFlipbook.v1"
};
window.BOOK_MEDIA = [
 {
  "page": 20,
  "type": "tts",
  "label": "🔊 Play dialogue",
  "x": 65,
  "y": 19.2,
  "w": 28,
  "h": 3.6,
  "times": 2,
  "lines": [
   [
    "Hana",
    "Are we still meeting on Tuesday morning for the study group?"
   ],
   [
    "Ravi",
    "That was the plan, but the lab is booked then. Wednesday afternoon is free."
   ],
   [
    "Hana",
    "Wednesday's no good for me. I've got a presentation. What about Thursday?"
   ],
   [
    "Ravi",
    "Thursday afternoon works. Let's make it then."
   ]
  ]
 }
];
window.BOOK_UNITS = [
 {
  "id": 1,
  "end": 10,
  "from": 4,
  "icon": "📘",
  "color": "#3542E8",
  "title": "Know your MUET",
  "mcq": [
   {
    "q": "Who sets and runs MUET?",
    "options": [
     "Majlis Peperiksaan Malaysia (MPM)",
     "Your own university",
     "Each polytechnic",
     "A private language school"
    ],
    "answer": 0,
    "why": "MUET is set and run by the Malaysian Examinations Council, Majlis Peperiksaan Malaysia (MPM)."
   },
   {
    "q": "How long is a MUET result valid?",
    "options": [
     "2 years",
     "3 years",
     "5 years",
     "10 years"
    ],
    "answer": 2,
    "why": "A result is valid for five years from the date it is released."
   },
   {
    "q": "Each of the four MUET papers is worth…",
    "options": [
     "60 marks",
     "75 marks",
     "90 marks",
     "100 marks"
    ],
    "answer": 2,
    "why": "Each paper is 90 marks, or 25% of your total (4 × 90 = 360)."
   }
  ],
  "tf": [
   {
    "q": "Speaking is taken on a different day from the written papers.",
    "answer": true,
    "why": "Speaking is taken on its own day."
   },
   {
    "q": "You need an SPM result to register for MUET.",
    "answer": false,
    "why": "MPM sets no entry conditions: anyone can sit MUET."
   }
  ],
  "fill": [],
  "match": {
   "title": "Match each paper to its format",
   "pairs": []
  }
 },
 {
  "id": 2,
  "end": 16,
  "from": 11,
  "icon": "🗓️",
  "color": "#00A88E",
  "title": "MUET admin (MPM portal)",
  "mcq": [
   {
    "q": "How much is the MUET fee for Malaysian citizens?",
    "options": [
     "RM25",
     "RM150",
     "RM350",
     "RM500"
    ],
    "answer": 1,
    "why": "RM150 for citizens and RM350 for non-citizens. (RM25 is the cost of changing details later.)"
   },
   {
    "q": "Which MPM page shows your exam centre, Speaking date and session?",
    "options": [
     "The MUET/D exam slip",
     "The MUETR result page",
     "The eSijil page",
     "The fees page"
    ],
    "answer": 0,
    "why": "MUET/D is your exam slip. Bring it with your IC."
   },
   {
    "q": "Which MUET option is computer-based and offered through the year?",
    "options": [
     "A regular session",
     "MUET on Demand (MoD)",
     "A re-check",
     "A transfer of centre"
    ],
    "answer": 1,
    "why": "MUET on Demand (MoD) is computer-based, with separate registration and result pages."
   }
  ],
  "tf": [
   {
    "q": "Type every detail exactly as it appears on your IC or passport.",
    "answer": true,
    "why": "Check before you tap Next. Changing details later costs RM25."
   },
   {
    "q": "If you do not finish paying in time, you may lose your centre seat.",
    "answer": true,
    "why": "Finish before the time shown, and keep your receipt."
   }
  ],
  "fill": [],
  "match": {
   "title": "Match each task to the MPM service",
   "pairs": []
  }
 },
 {
  "id": 3,
  "end": 23,
  "from": 17,
  "icon": "🎧",
  "color": "#3542E8",
  "title": "Listening · CLUE",
  "mcq": [
   {
    "q": "In CLUE, what does the C stand for?",
    "options": [
     "Check",
     "Copy",
     "Choose",
     "Count"
    ],
    "answer": 0,
    "why": "C = Check: read the question first and predict the answer type."
   },
   {
    "q": "How many times is each Listening recording played?",
    "options": [
     "Once",
     "Twice",
     "Three times",
     "As many times as you like"
    ],
    "answer": 1,
    "why": "Each recording is played twice: answer on the first play, confirm on the second."
   },
   {
    "q": "Listen to the dialogue. When will the study group meet?",
    "say": [
     [
      "Hana",
      "Are we still meeting on Tuesday morning?"
     ],
     [
      "Ravi",
      "That was the plan, but the lab is booked then. Wednesday afternoon is free."
     ],
     [
      "Hana",
      "Wednesday's no good for me. I've got a presentation. What about Thursday?"
     ],
     [
      "Ravi",
      "Thursday afternoon works. Let's make it then."
     ]
    ],
    "options": [
     "Tuesday morning",
     "Wednesday afternoon",
     "Thursday afternoon",
     "Friday morning"
    ],
    "answer": 2,
    "why": "The final agreement is Thursday afternoon. Being mentioned is not the same as being chosen."
   }
  ],
  "tf": [
   {
    "q": "Speakers often mention a wrong option first, then change their mind.",
    "answer": true,
    "why": "That is the word-match trap. Wait for the final decision."
   },
   {
    "q": "Words like “actually”, “instead” and “but” usually come just before the real answer.",
    "answer": true,
    "why": "These signposts warn you that the speaker is changing or correcting something."
   }
  ],
  "fill": [],
  "match": {
   "title": "Match each signpost word to its job",
   "pairs": []
  }
 },
 {
  "id": 4,
  "end": 30,
  "from": 24,
  "icon": "🎤",
  "color": "#00A88E",
  "title": "Speaking · PREP",
  "mcq": [
   {
    "q": "PREP starts with…",
    "options": [
     "An example",
     "Your point",
     "A question",
     "A reason"
    ],
    "answer": 1,
    "why": "P = Point: answer the task in one clear sentence."
   },
   {
    "q": "How long is the preparation time for Part 1?",
    "options": [
     "1 minute",
     "2 minutes",
     "3 minutes",
     "5 minutes"
    ],
    "answer": 1,
    "why": "Part 1 is 2 minutes to prepare and 2 minutes to speak."
   },
   {
    "q": "Which phrase invites a partner to speak?",
    "options": [
     "In conclusion…",
     "For example…",
     "What do you think about this, Aina?",
     "I disagree."
    ],
    "answer": 2,
    "why": "Inviting others in is an important Part 2 skill."
   }
  ],
  "tf": [
   {
    "q": "Your notes should be keywords, not full sentences.",
    "answer": true,
    "why": "Plan in 2 minutes with keywords."
   },
   {
    "q": "You should arrive 30 minutes early with your MUET/D slip and IC.",
    "answer": true,
    "why": "Be in the waiting room 30 minutes early."
   }
  ],
  "fill": [],
  "match": {
   "title": "Match each Part 2 job to a useful phrase",
   "pairs": []
  }
 },
 {
  "id": 5,
  "end": 37,
  "from": 31,
  "icon": "📖",
  "color": "#FF751F",
  "title": "Reading · SCAN",
  "mcq": [
   {
    "q": "In SCAN, what does the N stand for?",
    "options": [
     "Note",
     "Name",
     "Nail",
     "Next"
    ],
    "answer": 2,
    "why": "N = Nail: pick what the text supports and reject the rest."
   },
   {
    "q": "How many questions are there in the MUET Reading paper?",
    "options": [
     "30",
     "40",
     "50",
     "60"
    ],
    "answer": 1,
    "why": "7 parts · 40 questions · 75 minutes."
   },
   {
    "q": "An option is true in real life but is not stated in the text. Which trap is this?",
    "options": [
     "The word-match trap",
     "The own-knowledge trap",
     "The too-far trap",
     "The paraphrase trap"
    ],
    "answer": 1,
    "why": "Your own knowledge is not evidence. Use only what the text says."
   }
  ],
  "tf": [
   {
    "q": "A familiar word in an option makes that option correct.",
    "answer": false,
    "why": "A familiar word does not make an option correct. Confirm the whole meaning."
   },
   {
    "q": "Read the question first, then scan the text for its key words.",
    "answer": true,
    "why": "Question-first tip: underline the key words, then scan."
   }
  ],
  "fill": [],
  "match": {
   "title": "Word Detective: match each word to its meaning",
   "pairs": []
  }
 },
 {
  "id": 6,
  "end": 44,
  "from": 38,
  "icon": "✍️",
  "color": "#C80DA0",
  "title": "Writing · PEEL",
  "mcq": [
   {
    "q": "In this eBook, what does the second E in PEEL stand for?",
    "options": [
     "Essay",
     "Example",
     "Ending",
     "Error"
    ],
    "answer": 1,
    "why": "PEEL = Point, Explain, Example, Link."
   },
   {
    "q": "Which sentence EXPLAINS why “Internships help”?",
    "options": [
     "Internships are good.",
     "Students apply theory to real work.",
     "I like internships.",
     "Internships are popular."
    ],
    "answer": 1,
    "why": "An explanation shows why or how the point is true."
   },
   {
    "q": "What is the minimum length for Writing Task 2?",
    "options": [
     "100 words",
     "200 words",
     "250 words",
     "400 words"
    ],
    "answer": 2,
    "why": "Task 1: 100+ words. Task 2: 250+ words."
   }
  ],
  "tf": [
   {
    "q": "Task 1 needs at least 100 words.",
    "answer": true,
    "why": "Task 1: reply to an email or letter (100+ words)."
   },
   {
    "q": "Examiners mark task fulfilment, organisation, structure and lexis.",
    "answer": true,
    "why": "These are the four marking criteria."
   }
  ],
  "fill": [],
  "match": {
   "title": "Match each marking criterion to what it checks",
   "pairs": []
  }
 },
 {
  "id": 7,
  "end": 47,
  "from": 45,
  "icon": "🏆",
  "color": "#FFB400",
  "title": "Game Zone · Quiz Show",
  "mcq": [
   {
    "q": "Which sign-off suits a formal email to a director?",
    "options": [
     "See ya!",
     "Yours sincerely,",
     "Take care,",
     "Cheers"
    ],
    "answer": 1,
    "why": "“Yours sincerely,” is formal."
   },
   {
    "q": "You hear: “I wanted Tuesday, but actually Thursday works better.” Which day is the answer?",
    "options": [
     "Tuesday",
     "Thursday",
     "Both days"
    ],
    "answer": 1,
    "why": "“But actually” signals the change. The final choice is Thursday."
   },
   {
    "q": "Which note card suits Speaking Part 1?",
    "options": [
     "Point, Reason, Example, Point again as keywords",
     "Every sentence written in full",
     "One long paragraph to memorise"
    ],
    "answer": 0,
    "why": "Keywords in a PREP order keep you organised and natural."
   }
  ],
  "tf": [
   {
    "q": "You score one star for each correct answer.",
    "answer": true,
    "why": "One star per correct answer."
   }
  ],
  "fill": [],
  "match": {
   "title": "Match each paper to its technique",
   "pairs": []
  }
 },
 {
  "id": 8,
  "end": 53,
  "from": 48,
  "icon": "🎓",
  "color": "#17151E",
  "title": "Review & next steps",
  "mcq": [
   {
    "q": "Which technique goes with the Speaking paper?",
    "options": [
     "CLUE",
     "PREP",
     "SCAN",
     "PEEL"
    ],
    "answer": 1,
    "why": "PREP: Point, Reason, Example, Point again."
   },
   {
    "q": "The four paper scores add up to a total out of…",
    "options": [
     "100",
     "300",
     "360",
     "400"
    ],
    "answer": 2,
    "why": "4 × 90 = 360."
   }
  ],
  "tf": [
   {
    "q": "MPM dates may change, so check the portal before you plan.",
    "answer": true,
    "why": "Always check official announcements."
   }
  ],
  "fill": [],
  "match": {
   "title": "Match each score range to its CEFR level",
   "pairs": []
  }
 }
];
window.BOOK_MINIS = [
 {
  "id": "clue",
  "page": 19,
  "type": "quiz",
  "icon": "🎧",
  "label": "Try CLUE",
  "color": "#3542E8",
  "x": 6.5,
  "y": 87,
  "w": 40,
  "h": 4.6,
  "title": "Try CLUE · Catch the change",
  "intro": "Check the question first. Then listen and catch the signpost words.",
  "audio": [
   [
    "Aina",
    "Are we meeting at the library at two o'clock for the group project?"
   ],
   [
    "Daniel",
    "Actually, the library is fully booked. How about the cafeteria?"
   ],
   [
    "Aina",
    "The cafeteria is too noisy for recording. What about the seminar room?"
   ],
   [
    "Daniel",
    "Good idea. It's free after three, so let's meet there at three-thirty."
   ]
  ],
  "show": "after",
  "qs": [
   {
    "q": "Where and when will they meet?",
    "options": [
     "The library at two o'clock",
     "The cafeteria at three o'clock",
     "The seminar room at three-thirty",
     "The seminar room at three o'clock"
    ],
    "answer": 2,
    "why": "The library is fully booked and the cafeteria is too noisy. Daniel confirms the final plan in the last line: the seminar room at three-thirty."
   },
   {
    "q": "Which phrase shows the first plan has changed?",
    "options": [
     "Are we meeting",
     "Actually, the library is fully booked",
     "Good idea",
     "for the group project"
    ],
    "answer": 1,
    "why": "“Actually” is a contrast signpost. It tells you the plan you heard first is about to change."
   },
   {
    "q": "Why do they reject the cafeteria?",
    "options": [
     "It is closed",
     "It is too noisy for recording",
     "It is too far",
     "It is too expensive"
    ],
    "answer": 1,
    "why": "Aina says the cafeteria is too noisy for recording."
   },
   {
    "q": "What does “Good idea” show?",
    "options": [
     "Daniel rejects the seminar room",
     "Daniel accepts the suggestion",
     "Daniel changes the topic",
     "Daniel is unsure"
    ],
    "answer": 1,
    "why": "“Good idea” is agreement. Daniel accepts the seminar room and then fixes the time."
   },
   {
    "q": "Why does the seminar room work for them?",
    "options": [
     "It is near the library",
     "It is free after three",
     "It is quiet all day",
     "It has a projector"
    ],
    "answer": 1,
    "why": "Daniel says it is free after three, so they choose three-thirty."
   },
   {
    "q": "Why is two o'clock NOT the final time?",
    "options": [
     "Aina forgot the time",
     "The library is fully booked, so the plan changes",
     "Daniel is late",
     "The group project is cancelled"
    ],
    "answer": 1,
    "why": "The first plan (library at two) is cancelled because the library is booked. Wait for the final decision."
   }
  ]
 },
 {
  "id": "prep",
  "page": 26,
  "type": "prep",
  "icon": "🎤",
  "label": "Build my PREP",
  "color": "#00A88E",
  "x": 6.5,
  "y": 87,
  "w": 40,
  "h": 4.6,
  "title": "Build my PREP",
  "prompts": [
   {
    "prompt": "Is it better to study alone or in a group?",
    "model": {
     "P": "I think studying in a group is better for most students.",
     "R": "This is because friends can explain difficult ideas in simple words.",
     "E": "For example, before our last test, my group split the chapters, taught each other, and I finally understood the grammar rules.",
     "P2": "So, a study group helps students learn more than studying alone."
    }
   },
   {
    "prompt": "Should students do part-time jobs?",
    "model": {
     "P": "I think part-time jobs are good for students who can manage their time.",
     "R": "They teach responsibility and help students earn pocket money.",
     "E": "For example, a student who works at a café on weekends learns to serve customers and saves money for books.",
     "P2": "So, a part-time job can help students if they balance it with their studies."
    }
   },
   {
    "prompt": "Is online learning better than face-to-face classes?",
    "model": {
     "P": "I think face-to-face classes are better for most students.",
     "R": "Students can ask questions straight away and feel more connected to the class.",
     "E": "For example, in a speaking class my partner corrected my pronunciation immediately.",
     "P2": "So, face-to-face classes help students learn more effectively."
    }
   },
   {
    "prompt": "How can students manage their time better?",
    "model": {
     "P": "Students can manage their time better by using a weekly planner.",
     "R": "A planner shows deadlines clearly, so students do not leave work until the last minute.",
     "E": "For example, I write my assignments and test dates on Sunday and plan one task for each evening.",
     "P2": "So, a weekly planner helps students stay organised and less stressed."
    }
   }
  ],
  "fields": [
   {
    "k": "P",
    "label": "Point",
    "hint": "Answer the question in one clear sentence.",
    "ph": "I think studying in a group is better because…"
   },
   {
    "k": "R",
    "label": "Reason",
    "hint": "Explain why your point is true.",
    "ph": "You can share ideas and fix mistakes together."
   },
   {
    "k": "E",
    "label": "Example",
    "hint": "A real case: who, what, how. Try “for example”.",
    "ph": "For example, last semester my group…"
   },
   {
    "k": "P2",
    "label": "Point again",
    "hint": "Link back to the question.",
    "ph": "So, studying in a group is better for me."
   }
  ],
  "check": [
   "I answered the question directly.",
   "My reason is clear.",
   "My example is specific (who, what, how).",
   "I ended by linking back to the question."
  ]
 },
 {
  "id": "speak",
  "page": 28,
  "type": "speak",
  "icon": "⏱️",
  "label": "Speak now",
  "color": "#00A88E",
  "x": 6.5,
  "y": 89.3,
  "w": 40,
  "h": 3.6,
  "title": "Speak now · Plan, record, improve",
  "topics": [
   "Your favourite place on campus",
   "A skill every student needs",
   "The best way to relax after class",
   "Should phones be allowed in class?",
   "A useful app for students",
   "Your dream job and why"
  ],
  "check": [
   "I answered the topic.",
   "I gave a clear reason.",
   "I gave one specific example.",
   "I finished with a closing point."
  ]
 },
 {
  "id": "peel",
  "page": 41,
  "type": "peel",
  "icon": "✍️",
  "label": "Build a paragraph",
  "color": "#C80DA0",
  "x": 6.5,
  "y": 87,
  "w": 40,
  "h": 4.6,
  "title": "Build a PEEL paragraph",
  "sets": [
   {
    "task": "Should polytechnics offer free transport to students?",
    "sentences": [
     {
      "k": "P",
      "t": "Free breakfast at polytechnics can help students concentrate in class."
     },
     {
      "k": "E",
      "t": "Many students skip breakfast because of early lectures, so they feel tired and lose focus."
     },
     {
      "k": "E2",
      "t": "For instance, a student who arrives at an 8 a.m. lecture without eating may struggle to follow the lesson."
     },
     {
      "k": "L",
      "t": "Therefore, offering free breakfast would support better learning."
     }
    ]
   },
   {
    "task": "Should students join clubs?",
    "sentences": [
     {
      "k": "P",
      "t": "Phones can be useful learning tools for polytechnic students."
     },
     {
      "k": "E",
      "t": "They give quick access to dictionaries, notes and online lessons, so students can solve problems immediately."
     },
     {
      "k": "E2",
      "t": "For instance, a student can check an unfamiliar word during a reading task in a few seconds."
     },
     {
      "k": "L",
      "t": "Therefore, phones should be allowed in class when they are used for learning."
     }
    ]
   },
   {
    "task": "Should students do volunteer work?",
    "sentences": [
     {
      "k": "P",
      "t": "Regular exercise helps students perform better in their studies."
     },
     {
      "k": "E",
      "t": "It improves energy and mood, so students can concentrate for longer."
     },
     {
      "k": "E2",
      "t": "For instance, a student who jogs before class may feel more awake and ready to listen."
     },
     {
      "k": "L",
      "t": "Therefore, polytechnics should encourage students to exercise regularly."
     }
    ]
   }
  ],
  "fields": [
   {
    "k": "P",
    "label": "Point",
    "ph": "My point answers the question…"
   },
   {
    "k": "E",
    "label": "Explain",
    "ph": "This is true because…, so…"
   },
   {
    "k": "E2",
    "label": "Example",
    "ph": "For instance, …"
   },
   {
    "k": "L",
    "label": "Link",
    "ph": "Therefore, …"
   }
  ],
  "check": [
   "My point answers the question.",
   "My explanation says why the point is true.",
   "My example is specific.",
   "My link goes back to the question."
  ]
 },
 {
  "id": "self",
  "page": 10,
  "type": "self",
  "icon": "✅",
  "label": "Where am I now?",
  "color": "#6D3AE0",
  "title": "Where am I now?",
  "groups": [
   {
    "k": "L",
    "name": "Listening",
    "icon": "🎧",
    "items": [
     "I can follow the main points of a clear talk on a familiar topic.",
     "I can catch details, opinions and changes of mind in a discussion.",
     "I can follow a long talk and work out what the speaker really means."
    ]
   },
   {
    "k": "S",
    "name": "Speaking",
    "icon": "🎤",
    "items": [
     "I can give a simple opinion with one reason.",
     "I can develop a point with a reason and an example.",
     "I can lead a discussion, respond to others and compare ideas fluently."
    ]
   },
   {
    "k": "R",
    "name": "Reading",
    "icon": "📖",
    "items": [
     "I can find facts in notices, emails and short texts.",
     "I can follow the writer's main argument and opinion in an article.",
     "I can infer meaning and attitude in long, complex texts."
    ]
   },
   {
    "k": "W",
    "name": "Writing",
    "icon": "✍️",
    "items": [
     "I can write a short email that answers every note.",
     "I can write a clear essay with developed PEEL paragraphs.",
     "I can write a well-organised essay with precise, varied language."
    ]
   }
  ],
  "next": {
   "L": [
    "Chapter 3 · Listening",
    17
   ],
   "S": [
    "Chapter 4 · Speaking",
    24
   ],
   "R": [
    "Chapter 5 · Reading",
    31
   ],
   "W": [
    "Chapter 6 · Writing",
    38
   ]
  }
 },
 {
  "id": "c34",
  "page": 21,
  "type": "quiz",
  "icon": "🎧",
  "label": "Catch the clue",
  "color": "#3542E8",
  "title": "Catch the clue",
  "intro": "Four quick questions. Pick the best answer.",
  "bonus": {"title":"Signpost sort · match each word to its job","pairs":[["however","Contrast"],["moreover","Adding"],["for instance","Example"],["because","Reason"],["overall","Conclusion"]]},
    "qs": [
   {
    "q": "Before you hear “Where will the talk take place?”, predict the answer type.",
    "options": [
     "a time",
     "a place",
     "a reason"
    ],
    "answer": 1,
    "why": "“Where” asks for a place. Predicting the answer type helps you listen for the right detail."
   },
   {
    "q": "“I wanted the blue one, but in the end I bought the black one.” Which did the speaker buy?",
    "options": [
     "the blue one",
     "the black one",
     "both"
    ],
    "answer": 1,
    "why": "“But in the end” signals the final choice: the black one."
   },
   {
    "q": "Which word often signals a change of mind?",
    "options": [
     "also",
     "actually",
     "for instance"
    ],
    "answer": 1,
    "why": "“Actually” often introduces a correction or a new decision."
   },
   {
    "q": "“I'd love to come, but I've got a test tomorrow.” The speaker is…",
    "options": [
     "accepting",
     "refusing politely",
     "asking a question"
    ],
    "answer": 1,
    "why": "“I'd love to… but…” is a polite refusal. The reason comes after “but”."
   },
   {
    "q": "Which signpost shows a CONTRAST?",
    "options": [
     "however",
     "moreover",
     "for instance",
     "because"
    ],
    "answer": 0,
    "why": "“However” introduces a contrast. “Moreover” adds, “for instance” gives an example and “because” gives a reason."
   },
   {
    "q": "Which word gives a REASON?",
    "options": [
     "because",
     "however",
     "instead",
     "overall"
    ],
    "answer": 0,
    "why": "“Because” links a result to its reason."
   }
  ]
 },
 {
  "id": "s53",
  "page": 34,
  "type": "quiz",
  "icon": "🔎",
  "label": "Try it first: find it, then confirm it",
  "color": "#FF751F",
  "title": "SCAN · find it, then confirm it",
  "intro": "Read the text. Answer, then confirm with the evidence.",
  "passage": [
   "When the student council opened a small food bank in the library foyer last March, organisers expected about twenty visitors a week.",
   "Within a month, nearly eighty students were collecting basic items such as rice, oats and canned food.",
   "The council responded by moving the food bank to a larger room beside the cafeteria.",
   "Not everyone welcomed the change at first. Some students worried that the new location was too public.",
   "To protect privacy, volunteers now prepare packs in advance so that visitors can collect them quickly."
  ],
  "show": "always",
  "qs": [
   {
    "q": "Why do volunteers now prepare packs in advance?",
    "options": [
     "To serve more students",
     "To help visitors feel comfortable",
     "To reduce food costs"
    ],
    "answer": 1,
    "why": "Sentence 5: the new room felt too public, so packs are prepared to protect privacy. A familiar word (“students”) does not make A correct."
   },
   {
    "q": "How many visitors did the organisers expect each week?",
    "options": [
     "About twenty",
     "About eighty",
     "About two hundred"
    ],
    "answer": 0,
    "why": "Sentence 1 says about twenty. Eighty is the later number (word-match trap)."
   },
   {
    "q": "Why did the council move the food bank?",
    "options": [
     "Demand grew quickly",
     "It was too cold",
     "The library closed"
    ],
    "answer": 0,
    "why": "Sentences 2 and 3: nearly eighty students came, so the council chose a larger room."
   },
   {
    "q": "What worried some students about the new room?",
    "options": [
     "It was too public",
     "It was too far",
     "It was too small"
    ],
    "answer": 0,
    "why": "Sentence 4: they worried that the new location was too public."
   },
   {
    "q": "Which sentence is the best evidence for the answer to “Why prepare packs in advance?”",
    "options": [
     "Sentence 1",
     "Sentence 2",
     "Sentence 3",
     "Sentence 4",
     "Sentence 5"
    ],
    "answer": 4,
    "why": "Sentence 5 states the purpose: to protect privacy."
   }
  ]
 },
 {
  "id": "s54",
  "page": 35,
  "type": "quiz",
  "icon": "📖",
  "label": "Find the evidence",
  "color": "#FF751F",
  "title": "Find the evidence",
  "intro": "Read the notice, then answer.",
  "passage": [
   "LIBRARY NOTICE: From 1 March, the library will open at 8 a.m. instead of 9 a.m. on weekdays.",
   "Weekend hours stay the same.",
   "Students who want to book discussion rooms must now do so online at least one day in advance."
  ],
  "show": "always",
  "bonus": {"title":"Word Detective · match each word to its meaning","pairs":[["in advance","before a set time"],["qualifier","a small word that limits meaning (only, most)"],["paraphrase","same idea, different words"],["relocate","move to a new place"],["evidence","the words that prove an answer"],["inference","a conclusion the text supports"]]},
    "qs": [
   {
    "q": "What changes on weekdays?",
    "options": [
     "the closing time",
     "the opening time",
     "the weekend hours"
    ],
    "answer": 1,
    "why": "The library will open at 8 a.m. instead of 9 a.m."
   },
   {
    "q": "“do so” refers to…",
    "options": [
     "booking discussion rooms",
     "opening earlier",
     "studying online"
    ],
    "answer": 0,
    "why": "“Must now do so online” means must book discussion rooms online."
   },
   {
    "q": "Which statement is true?",
    "options": [
     "Same-day room bookings are fine.",
     "Weekend hours will change.",
     "Bookings must be made online."
    ],
    "answer": 2,
    "why": "Bookings must be made online at least one day in advance."
   },
   {
    "q": "In SCAN, “Circle” means…",
    "options": [
     "circle every word",
     "mark the key meaning",
     "circle the answer letter"
    ],
    "answer": 1,
    "why": "Circle the key meaning words, such as only, not and instead."
   },
   {
    "q": "“In advance” means…",
    "options": [
     "before a set time",
     "after the event",
     "during the class"
    ],
    "answer": 0,
    "why": "It means earlier than the event."
   },
   {
    "q": "“Paraphrase” means…",
    "options": [
     "same idea, different words",
     "copying the words",
     "a short title"
    ],
    "answer": 0,
    "why": "A paraphrase keeps the idea but changes the words."
   }
  ]
 }
];
