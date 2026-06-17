import type { StoryBrief, GeneratedAsset } from "@/types/content-engine";

const ts = () => new Date().toISOString();
const id = (type: string, briefId: string) => `${type}-${briefId}-${Date.now()}`;

function asset(
  type: GeneratedAsset["type"],
  title: string,
  content: string,
  format: GeneratedAsset["format"],
  brief: StoryBrief
): GeneratedAsset {
  return {
    id: id(type, brief.id),
    briefId: brief.id,
    type,
    title,
    content,
    format,
    status: "generated",
    createdAt: ts(),
    updatedAt: ts(),
  };
}

export function generateStoryText(brief: StoryBrief): GeneratedAsset {
  const chars = brief.keyCharacters.join(" and ") || "a faithful person";
  const objects = brief.keyObjects.slice(0, 3).join(", ") || "the world";
  const content = `# ${brief.storyTitle}
*${brief.bibleReference}*

---

A long, long time ago, ${chars} was looking out at the beautiful world God had made. The ${objects} reminded ${brief.keyCharacters[0] || "them"} of just how great and loving God is.

${brief.storySummary}

${brief.keyCharacters[0] || "They"} felt a little uncertain at first. The task seemed big, the journey felt long. But God spoke gently: *"I am with you. Trust in Me."*

And in that moment, everything changed. Because when God is with us, we are never alone.

${brief.keyCharacters[0] || "They"} took a deep breath, looked up at the ${brief.keyObjects[0] || "sky"}, and smiled. ${brief.lesson}.

---

## 🌟 What We Learn

**${brief.lesson}**

---

## 💬 Talk Together

*${brief.reflectionQuestion}*

Take a moment to share your answer with someone you love!`;

  return asset("story_text", `${brief.storyTitle} — Story Text`, content, "markdown", brief);
}

export function generateColoringPrompt(brief: StoryBrief): GeneratedAsset {
  const content = `Create a full-page children's Christian coloring book illustration, black and white line art only.

**Story:** ${brief.storyTitle}
**Bible Reference:** ${brief.bibleReference}

**Scene:**
Create a gentle, child-friendly scene featuring:
- **Characters:** ${brief.keyCharacters.join(", ")}
- **Objects:** ${brief.keyObjects.join(", ")}
- **Themes:** ${brief.themes.join(", ")}
- **Visual tone:** ${brief.visualTone}

**Main idea:** ${brief.storySummary}

**Style requirements:**
- Black and white line art only
- Thick bold outlines (3–5px weight)
- Clean vector coloring book style
- No color, no grayscale, no shading
- Large open spaces for easy coloring
- Suitable for ${brief.targetAgeRange}
- Printable PDF quality (300 DPI)
- Commercial children's coloring book quality
- Sunday school and homeschool friendly
- Characters should look friendly, warm, and approachable
- Scene should be full-page with foreground, midground, and background elements

**Do NOT include:**
- Lesson text or reflection questions
- Captions or page numbers
- UI elements, mockups, or device frames
- Borders unless they are part of the scene
- Any color, shading, or grayscale values

**Generate ONLY the illustration.**`;

  return asset("coloring_prompt", `${brief.storyTitle} — Coloring Page Prompt`, content, "text", brief);
}

export function generateVerseCardPrompt(brief: StoryBrief): GeneratedAsset {
  const content = `Create a printable Bible verse card for children.

**Bible Reference:** ${brief.bibleReference}
**Theme:** ${brief.themes.join(", ")}
**Visual elements:** ${brief.keyObjects.slice(0, 4).join(", ")}

**Card design requirements:**
- Size: 4x6 inches, printable quality
- Style: Premium Christian kids printable
- Clean black and white line art
- Simple decorative frame with ${brief.themes[0] || "Bible"}-themed motif
- Small ${brief.keyObjects[0] || "Bible"}-themed icon in one corner
- Large, readable area for the verse text
- Child-friendly font style (not serif, not too formal)
- Suitable for Sunday school bulletin board or family fridge

**Layout:**
- Top: Small decorative icon (${brief.keyObjects[0] || "star"})
- Center: Large verse area (leave space for text)
- Bottom: Bible reference "${brief.bibleReference}"
- Border: Simple decorative frame

**Do NOT create a full coloring page. Create ONLY a verse card design.**`;

  return asset("verse_card_prompt", `${brief.storyTitle} — Verse Card Prompt`, content, "text", brief);
}

export function generateActivityPrompt(brief: StoryBrief): GeneratedAsset {
  const content = `Create a printable activity page for children (${brief.targetAgeRange}) based on:

**Story:** ${brief.storyTitle}
**Reference:** ${brief.bibleReference}
**Lesson:** ${brief.lesson}

**Activity concept:**
Create a simple educational activity related to "${brief.keyObjects.slice(0, 3).join(", ")}" and the themes of "${brief.themes.join(", ")}".

**Suggested activity ideas (choose the most fitting):**
- Word trace: Key words from the story like "${brief.keyObjects[0]}" or "${brief.themes[0]}"
- Simple maze from one character to another
- Draw and color: "Draw what ${brief.keyCharacters[0] || "the main character"} saw"
- Count and circle: Find the ${brief.keyObjects[0] || "objects"} hidden in the scene
- Fill in the blank: Complete the lesson sentence

**Activity layout requirements:**
- Black and white printable worksheet
- Clean, uncluttered layout with lots of white space
- Child-friendly and easy to understand instructions at the top
- One clear activity per page
- Large text and generous space for children to write/draw
- Bottom: Simple reflection prompt "${brief.reflectionQuestion}"
- Sunday school and homeschool friendly`;

  return asset("activity_prompt", `${brief.storyTitle} — Activity Page Prompt`, content, "text", brief);
}

export function generateQuizConfig(brief: StoryBrief): GeneratedAsset {
  const chars = brief.keyCharacters[0] || "the main character";
  const obj1 = brief.keyObjects[0] || "an important object";
  const obj2 = brief.keyObjects[1] || "another object";
  const theme1 = brief.themes[0] || "faith";

  const quiz = {
    title: `${brief.storyTitle} Quiz`,
    reference: brief.bibleReference,
    ageRange: brief.targetAgeRange,
    questions: [
      {
        question: `Who is the main character in "${brief.storyTitle}"?`,
        options: [chars, "Moses", "David"],
        answer: chars,
        feedback: `That's right! ${chars} is the main character in this story.`,
      },
      {
        question: `What important object appears in the story of ${brief.storyTitle}?`,
        options: [obj1, "a crown", "a sword"],
        answer: obj1,
        feedback: `Great job! The ${obj1} is an important part of this story.`,
      },
      {
        question: `What is the main theme of "${brief.storyTitle}"?`,
        options: [theme1, "jealousy", "anger"],
        answer: theme1,
        feedback: `Wonderful! This story teaches us about ${theme1}.`,
      },
      {
        question: `What lesson does "${brief.storyTitle}" teach us?`,
        options: [brief.lesson, "Be afraid of God", "Do things alone"],
        answer: brief.lesson,
        feedback: `Amazing! ${brief.lesson} — and God loves us very much!`,
      },
    ],
    successMessage: `Great job! You finished the quiz! Remember: ${brief.lesson}`,
    badge: `${brief.storyTitle} Scholar`,
  };

  return asset("quiz_config", `${brief.storyTitle} — Quiz Config`, JSON.stringify(quiz, null, 2), "json", brief);
}

export function generateMatchingGameConfig(brief: StoryBrief): GeneratedAsset {
  const chars = brief.keyCharacters;
  const objects = brief.keyObjects;

  const pairs = [
    { left: chars[0] || "Main Character", right: `Trusted God in ${brief.storyTitle}` },
    { left: objects[0] || "Special Object", right: `Part of the story in ${brief.bibleReference}` },
    { left: objects[1] || "Important thing", right: `Seen in the story of ${brief.storyTitle}` },
    { left: brief.themes[0] || "Main theme", right: `What this story teaches us` },
  ];

  const config = {
    title: `${brief.storyTitle} Matching Game`,
    type: "matching",
    ageRange: brief.targetAgeRange,
    pairs,
    successMessage: `Great job! ${brief.lesson}`,
    badge: `${brief.storyTitle} Helper`,
  };

  return asset("matching_game_config", `${brief.storyTitle} — Matching Game`, JSON.stringify(config, null, 2), "json", brief);
}

export function generateFindObjectGameConfig(brief: StoryBrief): GeneratedAsset {
  const config = {
    title: `Find the Objects: ${brief.storyTitle}`,
    type: "find_object",
    ageRange: brief.targetAgeRange,
    objectsToFind: brief.keyObjects.slice(0, 5),
    sceneDescription: `A ${brief.visualTone} child-friendly scene showing ${brief.keyCharacters.join(" and ")} in the story of ${brief.storyTitle} (${brief.bibleReference}). The scene includes ${brief.keyObjects.join(", ")}.`,
    successMessage: `Wonderful! You found everything! ${brief.lesson}`,
    badge: `${brief.storyTitle} Explorer`,
  };

  return asset("find_object_game_config", `${brief.storyTitle} — Find Object Game`, JSON.stringify(config, null, 2), "json", brief);
}

export function generateParentGuide(brief: StoryBrief): GeneratedAsset {
  const content = `# Parent Guide: ${brief.storyTitle}
*${brief.bibleReference}*

---

## What This Story Teaches

**${brief.lesson}**

${brief.storySummary}

This story is a wonderful opportunity to talk with your child about ${brief.themes.join(", ")} in a gentle, age-appropriate way.

---

## How to Share It With Your Child

Before reading together, create a calm moment. You might say:
*"I want to share a special Bible story with you about ${brief.keyCharacters[0] || "someone who loved God"}."*

As you read, pause and let your child notice the ${brief.keyObjects.slice(0, 2).join(" and ")} in the story. Ask them what they think those things mean.

After reading, affirm their thoughts warmly: *"That's a wonderful idea! God loves it when we think about His word."*

---

## Conversation Starters

- *"${brief.reflectionQuestion}"*
- *"Can you think of a time when you trusted someone? How did it feel?"*
- *"What would you do if God asked you to do something big?"*
- *"What is your favorite part of this story, and why?"*

---

## At-Home Activity

**${brief.keyObjects[0] ? `Look for a ${brief.keyObjects[0]}` : "Draw the story"} together:**

${brief.keyObjects[0]
  ? `Find a ${brief.keyObjects[0]} around your home or in nature. Use it as a reminder of the lesson: "${brief.lesson}." Place it somewhere visible for the week.`
  : `Have your child draw their favorite scene from the story. Ask them to explain their drawing to you.`}

---

## Prayer Moment

Close your time together with this simple prayer:

*"Dear God, thank You for the story of ${brief.storyTitle}. Help us to remember that ${brief.lesson.toLowerCase()}. We love You, God. Amen."*`;

  return asset("parent_guide", `${brief.storyTitle} — Parent Guide`, content, "markdown", brief);
}

export function generateTeacherGuide(brief: StoryBrief): GeneratedAsset {
  const content = `# Sunday School Teacher Guide: ${brief.storyTitle}
*${brief.bibleReference}*

---

## Lesson Objective

Children (${brief.targetAgeRange}) will understand that **${brief.lesson}** through the story of ${brief.storyTitle}.

---

## Materials Needed

- Printed coloring page for ${brief.storyTitle}
- Crayons or colored pencils
- Bible (open to ${brief.bibleReference})
- Printed verse card: *${brief.bibleReference}*
- Optional: printed activity worksheet
- Optional: matching game cards

---

## Class Flow (30–45 minutes)

**1. Welcome & Gathering (5 min)**
Greet each child warmly. Say: *"Today we're going to learn about ${brief.keyCharacters[0] || "someone special"} and how God showed them something amazing."*

**2. Read the Story (10 min)**
Read ${brief.storyTitle} aloud from the Bible or from the printed story card. Use an expressive, warm voice. Pause and ask: *"What do you think happened next?"*

**3. Discussion (5–7 min)**
Ask the class: *"${brief.reflectionQuestion}"*
Give every child who wants to speak a chance to share.

**4. Coloring Activity (10 min)**
Distribute the ${brief.storyTitle} coloring page. While children color, play soft background music. Walk around and gently narrate the story scene.

**5. Optional Game (5 min)**
If time allows, play the matching game or find-the-object activity to reinforce learning.

**6. Closing Prayer (3 min)**
*"Dear God, thank You for the story of ${brief.storyTitle}. Help each of us to remember that ${brief.lesson.toLowerCase()}. Amen."*

---

## Discussion Questions

1. *"${brief.reflectionQuestion}"*
2. *"What did ${brief.keyCharacters[0] || "the main character"} do that showed they trusted God?"*
3. *"How can we show ${brief.themes[0] || "faith"} this week?"*

---

## Differentiation

**For younger children (3–5):** Focus only on the coloring page and the main lesson. Keep discussion to 2–3 minutes.

**For older children (8–12):** Encourage them to find ${brief.bibleReference} in their own Bible and read it aloud.`;

  return asset("teacher_guide", `${brief.storyTitle} — Teacher Guide`, content, "markdown", brief);
}

export function generatePrintableDescription(brief: StoryBrief): GeneratedAsset {
  const content = `**${brief.storyTitle} Coloring Page**

A printable Bible coloring page for kids featuring *${brief.storyTitle}*, based on ${brief.bibleReference}. The scene shows ${brief.keyCharacters.join(" and ")} with ${brief.keyObjects.slice(0, 3).join(", ")} in a ${brief.visualTone} setting.

Perfect for Christian families, homeschool curriculum, Sunday school, and VBS. Suitable for ${brief.targetAgeRange}.

*Lesson:* ${brief.lesson}

**Format:** Printable PDF (US Letter + A4)
**Theme:** ${brief.themes.join(", ")}
**Access:** ${brief.accessLevel === "free" ? "Free Download" : "Premium"}`;

  return asset("printable_description", `${brief.storyTitle} — Printable Description`, content, "markdown", brief);
}

export function generateProductDescription(brief: StoryBrief): GeneratedAsset {
  const content = `# ${brief.storyTitle} Printable Activity Pack

A faith-filled printable activity pack that helps children (${brief.targetAgeRange}) learn the story of ${brief.storyTitle} (${brief.bibleReference}) through coloring, simple lessons, and creative activities.

**What's Included:**
- ✅ Full-page coloring illustration
- ✅ Bible verse card (${brief.bibleReference})
- ✅ Activity worksheet
- ✅ Parent guide (with conversation starters)
- ✅ Teacher / Sunday school guide
- ✅ Quiz game cards
- ✅ Matching game cards

**Perfect for:**
- Christian families doing devotionals at home
- Homeschool Bible curriculum
- Sunday school lessons
- VBS activities
- Kids' church programs

**Main Lesson:** ${brief.lesson}

**Ages:** ${brief.targetAgeRange}
**Format:** Printable PDF
**Pages:** 7–10 pages
**Themes:** ${brief.themes.join(", ")}`;

  return asset("product_description", `${brief.storyTitle} — Product Description`, content, "markdown", brief);
}

export function generateSalesPageCopy(brief: StoryBrief): GeneratedAsset {
  const content = `# HEADLINE
Help Your Child Learn "${brief.storyTitle}" Through Coloring and Play

# SUBHEADLINE
A printable and interactive Bible activity for kids ${brief.targetAgeRange}, designed for Christian families, homeschool, and Sunday school — no prep time needed.

# LEAD
You want your child to love God's Word. But keeping their attention isn't always easy.

That's why we created the **${brief.storyTitle} Printable Activity Pack** — a beautifully designed set of coloring pages, games, and guides that make Bible learning fun, screen-free, and meaningful.

# BENEFITS
✨ **Screen-free Bible learning** your child will actually enjoy
🖨️ **Print and use instantly** — no shipping, no waiting
📖 **Simple lesson:** "${brief.lesson}"
🎨 **Fun activities:** coloring, matching, quiz, and more
⛪ **Great for Sunday school, homeschool, and family devotionals**
💛 **Parent guide included** — so you feel confident teaching it

# WHAT'S INSIDE
Every pack includes:
- Full-page coloring illustration of ${brief.storyTitle}
- Bible verse card (${brief.bibleReference})
- Activity worksheet
- Parent guide with conversation starters
- Sunday school teacher guide
- Quiz cards and matching game

# SOCIAL PROOF PLACEHOLDER
★★★★★ "My kids asked to do this three times in one week!" — Sarah M.
★★★★★ "Perfect for our homeschool Bible time." — Rachel T.

# CTA
👉 **Get This Activity Pack Now**

*Instant download. Print at home. Teach God's Word today.*`;

  return asset("sales_page_copy", `${brief.storyTitle} — Sales Page Copy`, content, "markdown", brief);
}

export function generatePinterestCopy(brief: StoryBrief): GeneratedAsset {
  const content = `# Pinterest Pin — ${brief.storyTitle}

## Pin Title
${brief.storyTitle} Coloring Page for Kids | ${brief.bibleReference} | Free Bible Printable

## Pin Description
Help your child discover the story of ${brief.storyTitle} through this beautiful printable coloring page! Based on ${brief.bibleReference}, this ${brief.visualTone} illustration features ${brief.keyCharacters.join(", ")} and is perfect for Christian families, homeschool, Sunday school, and VBS. Ages ${brief.targetAgeRange}.

**Lesson:** ${brief.lesson}

Download yours and make Bible learning fun today! 🌟

## Target Keywords
1. ${brief.storyTitle} coloring page
2. Bible coloring pages for kids
3. ${brief.bookName} Bible activities
4. Christian homeschool printables
5. Sunday school activities ${brief.targetAgeRange}

## Hashtags
#BibleColoringPages #ChristianKids #HomeschoolBible #SundaySchool #BibleActivitiesForKids`;

  return asset("pinterest_copy", `${brief.storyTitle} — Pinterest Copy`, content, "markdown", brief);
}

export function generateFacebookAdCopy(brief: StoryBrief): GeneratedAsset {
  const content = `# Facebook Ad — ${brief.storyTitle}

## PRIMARY TEXT
Mamas, do you want your kids to LOVE Bible time? 💛

This beautiful "${brief.storyTitle}" printable activity pack makes it easy — no prep, no stress, just faith-filled fun for the whole family.

✅ Coloring page based on ${brief.bibleReference}
✅ Simple lesson: "${brief.lesson}"
✅ Activity worksheet, parent guide & more
✅ Print instantly at home
✅ Perfect for ages ${brief.targetAgeRange}

Whether you homeschool, go to Sunday school, or just want meaningful screen-free time — this is for you. 🙏

**👇 Download yours now — link in comments!**

## HEADLINE
Bible Coloring Activity for Kids | ${brief.storyTitle}

## DESCRIPTION
Printable coloring pages, games & guides based on ${brief.bibleReference}. Instant download for Christian families & homeschool.

## CTA BUTTON
Download Now

## AUDIENCE TARGETING NOTES
Target: Christian moms, homeschool families, Sunday school teachers
Interests: Bible, Christian parenting, homeschooling, kids activities, faith-based education
Ages: 25–45`;

  return asset("facebook_ad_copy", `${brief.storyTitle} — Facebook Ad Copy`, content, "markdown", brief);
}

export function generateInstagramCaption(brief: StoryBrief): GeneratedAsset {
  const content = `# Instagram Caption — ${brief.storyTitle}

## CAPTION

Look at this 🌟

We just created a brand new coloring page for **${brief.storyTitle}** (${brief.bibleReference}) and it is SO beautiful.

${brief.storySummary}

The lesson? **${brief.lesson.toLowerCase()}** ✨

This coloring page is perfect for:
👶 Ages ${brief.targetAgeRange}
🏠 Family devotionals
📚 Homeschool Bible time
⛪ Sunday school

And the best part? Your kids can color, learn, and play — all while discovering God's Word. 💛

Save this post and grab your free download through the link in bio!

## HASHTAGS
#BibleColoringPages #ChristianKids #HomeschoolMom #SundaySchool #BibleActivities #ChristianParenting #FaithBasedLearning #BiblicalStoriesForKids #${brief.bookName.replace(/\s/g, "")} #BibleJourney

## REEL HOOK IDEAS
- "3 reasons we LOVE this Bible activity for kids 👇"
- "When your kid asks to read the Bible again… 🙌"
- "The easiest way to teach ${brief.lesson.toLowerCase()} to your child 💛"`;

  return asset("instagram_caption", `${brief.storyTitle} — Instagram Caption`, content, "markdown", brief);
}

export function generateEmailLaunchCopy(brief: StoryBrief): GeneratedAsset {
  const content = `# Email Launch Copy — ${brief.storyTitle}

## SUBJECT LINE
✨ New Bible activity: "${brief.storyTitle}" is here for your family

## PREVIEW TEXT
Printable coloring page, games, parent guide + more — all based on ${brief.bibleReference}

## EMAIL BODY

Hi [First Name],

I have something special for you today 🌟

We just released our brand new **${brief.storyTitle} Activity Pack** — and I think your family is going to love it.

It's based on ${brief.bibleReference}, and the main lesson is simple and beautiful:

> **${brief.lesson}**

Inside the pack you'll find:

🎨 A full-page coloring illustration
📖 A Bible verse card (${brief.bibleReference})
🧩 A fun activity worksheet
👨‍👩‍👧 A parent guide with conversation starters
⛪ A Sunday school teacher guide
🎮 Quiz and matching game cards

Everything is printable, screen-free, and designed for kids ${brief.targetAgeRange}.

Whether you're a homeschool mama, a Sunday school teacher, or just a parent who wants meaningful Bible time — this is for you.

**[→ Get the ${brief.storyTitle} Activity Pack]**

With love & faith,
[Your Name]

P.S. If you have a child who loves to color, this pack is a must-have. The illustration is absolutely beautiful. 💛

## CTA BUTTON TEXT
Download the Activity Pack

## SEND TIMING
Best days: Tuesday or Thursday, 8–10am local time`;

  return asset("email_launch_copy", `${brief.storyTitle} — Email Launch Copy`, content, "markdown", brief);
}

export function generateAssetsFromBrief(brief: StoryBrief): GeneratedAsset[] {
  return [
    generateStoryText(brief),
    generateColoringPrompt(brief),
    generateVerseCardPrompt(brief),
    generateActivityPrompt(brief),
    generateQuizConfig(brief),
    generateMatchingGameConfig(brief),
    generateFindObjectGameConfig(brief),
    generateParentGuide(brief),
    generateTeacherGuide(brief),
    generatePrintableDescription(brief),
    generateProductDescription(brief),
    generateSalesPageCopy(brief),
    generatePinterestCopy(brief),
    generateFacebookAdCopy(brief),
    generateInstagramCaption(brief),
    generateEmailLaunchCopy(brief),
  ];
}
