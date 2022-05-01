import scrivxJSON from './fixtures/scrivener-example3-jsonified.json'
import { cloneDeep, keys, upperFirst, values } from 'lodash'
import { emptyFile, initialState, tree } from 'pltr/v2'
import {
  concatenateValues,
  createCustomAttributes,
  createNewBeat,
  createNewBook,
  createNewCard,
  createNewCategory,
  createNewCharacter,
  createNewLine,
  createNewNote,
  createNewPlace,
  createNewTag,
  createSlateEditor,
  createSlateParagraph,
  generateTagIds,
  getManuscriptSectionItems,
  getMatchedRelevantFiles,
  getRTFContents,
  getSection,
  getVer_2_7_matchName,
  isATag,
  isNotExcludedAttribute,
  keepRTFNonSectionItems,
  mapMatchedFiles,
  mergePairAttributes,
  nextPositionInLine,
  objectifyRTFContents,
  strippedDefaultAttributes,
  withStoryLineIfItExists,
} from '../importer'
import { relevantFiles } from './fixtures/scrivener-example3-relevantFiles'

const UUIDFolderRegEx = /[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}/
const UUID = '0819AE12-01F2-4F7A-B64F-B5EB07589699'
const SECTION_ITEMS = ['characters', 'notes', 'places', 'tags']
const BOOK_TITLE = 'example3'
const TEST_STRING_1 = 'Test string 1...'
const TEST_STRING_2 = 'Test string 2...'
const TEST_STRING_3 = 'Test string 3...'

const TEXT_OBJECT_1 = {
  text: TEST_STRING_1,
}

const TEXT_OBJECT_2 = {
  text: TEST_STRING_2,
}

const TEXT_OBJECT_3 = {
  text: TEST_STRING_3,
}

const MAIN_CATEGORY_OBJ = { id: 1, name: 'Main', position: 0 }

const EXCLUDED_ATTRIBUTES = ['Tags', 'Description', 'Notes', 'Category', '...']
const BEAT_BOOK_ID_KEYS = ['heap', 'children', 'index']
const FLATTEN_ATTRIBUTES = [
  {
    isBold: true,
    text: 'Married',
  },
  {
    isBold: false,
    text: 'During the story, to Jane',
  },
  {
    isBold: true,
    text: 'Description',
  },
  {
    isBold: false,
    text: "Mr. Darcy's best friend",
  },
  {
    isBold: false,
    text: "A sweet, easygoing man with an open heart who moves to Netherfield at the book's beginning.",
  },
  {
    isBold: false,
    text: 'While she is tolerable, she is not handsome enough to tempt HIM! Gasp!',
  },
  {
    isBold: false,
    text: "Why? Because one touched him before he fell ill? They're drawn to him?  ",
  },
  {
    isBold: true,
    text: 'notes',
  },
  {
    isBold: false,
    text: "A sweet, easygoing man with an open heart who moves to Netherfield at the book's beginning.",
  },
  {
    isBold: false,
    text: 'While she is tolerable, she is not handsome enough to tempt HIM! Gasp!',
  },
  {
    isBold: false,
    text: "Why? Because one touched him before he fell ill? They're drawn to him?  ",
  },
  {
    isBold: false,
    text: "They attack or drain something from him? Just because there's long been a suspected connection between Failures and illness?</ul>\\n<li>Observing Irene's attempts to investigate the Failures, the Perfected approach her to offer help to study the Failures and guidance on what direction to take with them. With their help, she founds a sophisticated research lab, The Galath Institute. Over time, she recruits more scientists and eventually, student lab assistants down to the youngest, 1st year undergrad Rasa (in the year before series start)\\n</ul>\\n\\n\\n\\n<b>Tessa</b>\\n<ul>\\n<li>Tessa was raised at the lab from ",
  },
  {
    isBold: false,
    text: "~age 6 to present for rehabilitation and decontamination - and study - until she is safe for the general public, gradually being exposed more to the outside world and given more freedom.\\n<li>She has a bedroom/bathroom that's connected to the kitchen of the main lab, and the longterm lab team acts as her guardians and somewhat family. When she was younger, the lab team stayed in rotation to always have an adult present, but now she's sometimes left on her own, though they always check in - she's not neglected. \\n<li>Though the lab team is a family to Tessa, and she sees Irene as a mother figure, Irene's rather distant, though not unkind, and tries to keep her family life and emotions separate from Tessa and the lab. Irene's family knows about the discovery of a child who is being rehabilitated/studied at the lab, but not that it's a duplicate of Teresa.\\n<li>The discovery of Tessa, along with the holes to nowhere, gives them the first hints about the existence of other layers, and comparing her with Teresa allows them to figure out the idea of im",
  },
  {
    isBold: false,
    text: 'provement from layer to layer.\\n</ul>\\n\\n<b>Perfection and the end to death</b>\\n<ul>\\n<li>Guided by the Perfected who was T from Layer 2 (now one of the senior Perfected directing the Institute) and her distorted, obsessive desire for perfection, plus the links they discover between personal excellence and increased Perfection Immune Response, the Game takes on a cult-like enthusiasm for self-improvement. \\n<li>Younger people have a stronger Perfection immune response and can stably tolerate greater stimulation of it through Failure implants, so youth becomes associated with power and potential. And as their implant technique improves enough to allow it (and they become fucked up enough to be okay with subjecting kids to this), they start recruiting younger people for active involvement in the Game, first graduate students, then undergrads, and at the start of the series they begin using senior high school students. \\n<ul>\\n<li> This creates a theme about adulthood, the way kids are more able to take implants being linked to their purity of focus, innocence and intensity, while adults becoming jaded and more shades',
  },
  {
    isBold: false,
    text: "-of-grey and turning from the big issues in favour of smaller joys and human connections is seen as failure and becoming boring grownups, loss, but could eventually show it as a kind of softening and realization of the importance of shades of grey and finding how to keep magic alive in a flawed world by genuinely loving the small, imperfect things. (magic-for-adults/solving the problem with Susan?)\\n</ul>\\n<li>It becomes apparent that the failure Kaho, who are appearing in increasing numbers, will eventually spread this illness to everyone; the Dad is the canary in the mine, but everyone is susceptible. Personal perfection-defense and the cure Irene believes she can create from the most powerful Failures seem too small a solution, and the Failures' contamination spreads be",
  },
  {
    isBold: false,
    text: "yond people to all things. So the goal becomes protecting <i>everything</i> by escaping the Failures altogether and raising up to some more perfect world.  Few know the details of this, but there's talk from the Perfected about a heaven they may achieve.\\n<ul>\\n<li> The Perfected can explicitly tell Irene some of this: a cure isn't enough, you can't defeat them, not all of them, they're endless, they're death, and the only way to escape it is to raise the whole world up and sever the thread connecting them to the world infected with death. To create heaven and end death and time.\\n<li>Or maybe Irene figures out that the illness <i>is</i> death in a more aggressive form, by connecting the ancient Failure that is the First Death with dying of the illness, and then figuring out (?by dying by plan in a previous layer to leave the info to next layer self) that the First Death is what comes for everyone at death.\\n<ul><li> but how d",
  },
  {
    isBold: false,
    text: "oes the First Death come for everyone? Maybe it still exists at the borderline between life and death as well as (meta/)physically in L0, so it just appears as a vision when you're dying?\\n\\t</ul>\\n</ul>\\n</ul>\\n\\n<b>The key projects</b>\\n<ul>\\n<li><b>The Gilgamesh Project - Irene</b> - The main research, directs/contributes to much of the other projects using/implanting the samples etc, seeing everything involving the players as a sub-category of her own research, but the ultimate goal is curing the Failure-sickness and the higher goal of immortality.\\n<li><b>The Orpheus Project - Vincent</b> - Focused on self-improvement, the project recruits and trains artistically talented people, towards a special performance that he hopes will produce a mass Ascension. <ul>\\n<li>At one point, it was intended to take over the goal of the abandoned Icarus project and summon the Elevator (though they don't know it's specifically an elevator), but once Tessa does that, it switches over to  blowing up the sky, another  former goal of the Icarus Project. \\n<li>Somewhat competit",
  },
  {
    isBold: false,
    text: "ive with the Gilgamesh Project, believing perfecting the people in 'normal' fields is more important than the samples (and has possibly lost sight of the goal of a cure in favour of ascension, which could perhaps also represent 'winning' Davis over Irene.\\n</ul>\\n<li><b>The Icarus Project - Jahan (now defunct)</b> - Began with building a second tower to purify the area that's now the elevator shaft, but on the discovery of the holes to nowhere and Tessa and the resulting theories about a destroyed world(s), as well as the Perfected's hints about Descend to Rise, becomes a project to build a tower so high it pierces the sky and houses the mechanism to connect to other layers (the Elevator), which he believed would  allow the descent the Perfected talked about, into this other world(s) which was necessary to ascension. \\n<ul>\\n<li> The tower was never completed, and the site was left abandoned after Jahan's death. And he was unable to figure out how to build that final part to make the elevator work, because only the myth-power of ascension can do that leap from the concrete and current to the previous worlds/layers that don't actually exist in this layer, which they didn't realize required an Ascension to make the leap to symbolic-plane forces.\\n<li>After Jahan's death, Vincent takes over some of this while they scheme for Rasa and Kaveh to take up the remainder when they're older, though it's not a terribly concrete plan; with Rasa working for Irene and Kaveh's strong entry into the hunt, suggesting they'll play other roles , Vincent takes it over more fully. \\n</ul>\\n<li><b>The ?? Project - First Gabby, then Mentor</b> -  the hunt, training increasingly young fighters (as Irene's work makes younger players more possible) to hunt Failures, both to provide subjects for Irene's Gilgamesh Project and with destroying the Failures as a goal in itself. The eventual goal (though it may not be known by the project's leaders) is to kill the First Death and end death forever.\\n<ul>\\n<li> This might be called the Tyr Project (the players courageously sacrifice themselves)? Or the Odin project? (sacrifice for wisdom, though this project is less focused on the wisdom side of things). \\n</ul>\\n<li><b>?? - Davis</b> - something history-related, using records and myths to speculate what has happened in previous layers and find items and events that could be useful? But how much do/can they know about other layer prior to unlocking the elevator, would it be enough for them to draw the conclusion that their myths and history might be reflections of other layers (with the contradictions and differences because it goes differently in different layers)? \\n</ul>\\n\\n\\nGalath is an alternate name for Galahad, who was said (in the medieval texts, such as the Vulgate Cycle Arthurian epic and  Malory's Le Morte d'Artur – Malory makes a nice link to the Mallory's!) to have been granted the power to die at a time of his own choosing when he finds the grail, and when he is visited by Joseph of Arimathia and experiences such rapture that he chooses to die then and immediately ascends to heaven accompanied by angels.\\n\\n<h2>The Game</h2>\\n<ul>\\n<li>?Called The Hunt?\\n<li",
  },
  {
    isBold: false,
    text: ">The Perfected provide Irene a way to more effectively hunt Failures, through a sample of Failure core material that, implanted into a person, triggers a Perfection Immune Response and gives them special powers to hunt Failures. Irene and Davis recruit their friends to help, getting cores for research and to implant into the hunters to study and to improve their hunting - the beginnings of The Game. \\n<li>Typically, if a hunter gets a core, they get it implanted in them; it's nearly unheard of for it to be refused to them.\\n<li>They begin to seek more powerful Failures' cores, both because they more greatly increase the power of the person they're implanted into and because their cores show more Failure Particles and other info, giving them more hints about the science, as well as the history they're beginning to suspect.\\n<li>Over time, they recruit and train more and increasingly younger people to assist with the hunt, and it",
  },
  {
    isBold: false,
    text: " becomes organized.\\n</ul>\\n\\n<b>Powers</b>\\n<ul>\\n<li>Each person's powers are different, with glowing white light with a  “shape”/format/feel and way of moving exclusive to them, but are somewhat flexible in how they can be used, typically having both an attack and a defensive or control use (eg. Sunburst radiating from the body that can block or shoot outwards to attack, or resembling a flock of birds that can divebomb, follow or obstruct, snake-like shapes rising from the ground to grab or strike).\\n<li>The person uses their powers with a movement, for some people it will be just a flick of the hand, for others it might big large, directing gestures or wielding it like a weapon. \\n<ul>\\n<li>Possibly that's just the basic power, but they can get more or different power with some kind of sacrifice?\\n</ul>\\n<li>?Maybe the powers are inspired by/based on my element system, singly or each person gets  a combo of two elements for their personality that determine the feel of their power(but behind-the-scenes, just for my use, not explicitly)\\n<li>Tessa's should be the same as Teresa's but with dark patterning running through it or a more crooked shape than Teresa\\n</ul>\\n\\n<b>How hunting works</b>\\n<ul>\\n<li>Although hunters use their powers to restrain",
  },
  {
    isBold: false,
    text: " Failures, defend and (temporarily) damage their form, the way to get their cores is to make them \\\"open up\\\" and reduce their defences over their normally protected core area so they can grab it (with powers or by hand). \\n<ul>\\n<li>This can be more physical for simpler Failures, like occupying all its tendrils for defense, slicing through it enough to access its core or less physical but still basic, like feigning vulnerability to make it let down its guard,\\n<li>For more powerful Failures, they may be too strong to fight normally without some kind of advantage, so it can be much more complicated/psychological like tapping into its traumas to have an advantage in fight or even fulfilling its demands to be granted the core willingly \\n<ul>\\n<li>maybe objects symbolic to the story of that layer or actions which recall for the Failure some aspect of the theme or emotional dynamic of the tragedy somehow weaken it? Pin it in place? Force it to try and get the object/react to the person in echo of their role in the story, thus distracting it and giving them openings to better attack (should probably be stronger than just a distraction, that doesn't seem like it'd make the difference between not having a chance against a Failure and beating it)? \\n<ul><li>Maybe a lot of important objects are repeated in different layers, so sometimes it's actually something they own, and it emotionally lands up connecting with/getting messed with by/the layer story because it's currently of importance to their own story in their current layer. Can't do that every time, probably, that'll be too hard to keep objects of relevence (but look at the Black Rose",
  },
  {
    isBold: false,
    text: " arc of Utena for object use, the items that appear on the desks). So sometimes it'll just be bringing up themes that hit on something current (though often the characters experiencing it in the current layer aren't the same ones as the ghosts in the echo)</ul>\\n<li>Or a Failure's core is an object meaningful to its story, encased in crystal, and it creates weird, shifting, labyrithine landscapes to entrap and hinder hunters, but a similar object with the same symbolic weight can cut through the labyrinth to get to the Failure?\\n</ul>\\n<li>So after some accidental stumbles into it and trial and error, they start using the ghostly layer-stories as mysteries they can unravel (while dodging/fighting/trying not to stumble on the big Failure of the level) to hit on things that will bring up a reaction for the Failure holding the key to the next layer. Bringing objects, other Failures or their trophies, play-acting arguments (that land up hitting on sore points that turn into real arguments), just going in to fight and using those baits mid-battle to disadvantage the Failure or to break through ",
  },
  {
    isBold: false,
    text: "its hallucination-like labyrith\\n<ul><li>But it's going to be hard to turn that dynamic into something with more room for manipulation. Sometimes maybe it's less adversarial, the Failure wants to help but is confused or doesn't know what will unlock the layer? Or different Failures competing or not all being hostile, offering things or wanting things, and it's not known which one they have to get the key from, so they never know what they're going to be in for. \\n</ul>\\n</ul>\\n<li>The leaders of the hunting side of things send out junior and more senior hunters to deal with specific Failures or problems suspected caused by Failures",
  },
  {
    isBold: false,
    text: ', according to their skill level.  \\n<ul>\\n<li>??As they go further in and things get more psychological, they select hunters in part on what issues they think the Failures involved will hit on; the people at the top are aware that emotional distress is a big part of the Ascension process and manipulate the players to achieve it ??\\n</ul>\\n<li>The Failures may also obsessively try to get the characters to re-enact their tragedy (not necessarily in a straightforward one-to-one way, could call on different characters to do things that echo the ghost’s issues on some level but also hit on the issues of characters other than the ghost’s c',
  },
  {
    isBold: false,
    text: "urrent version),  even can land up with them acting out or echoing a portion of the events, and it transforms for a moment so we can see the original characters doing it (but it’s not that the demand is “act this out for me,” it just results in echoing portions. \\n</ul>\\n\\n\\n<h2>The School </h2>\\n<ul>\\n<li>Begins from senior players starting projects to improve young people in various ways for future involvement in the Game, eventually coalescing into the school. Centered around perfecting students in academics, the arts, athletics, and preparing them for hunting; they are encouraged to be well-rounded but there are also opportunities to specialize in their talents and join prestigious projects directed by Game founders. \\n<li>The hunting is sold as entry to prestigious defense force against the Failures, a semi extra-curricular activity open only to the top competitors. In it, student are compete to get cores as trophies from the Failures, which the Perfected will award in a secret ceremony that embetters them with magic (really, the Failure material implanting process).\\n<li>As they become more advanced (starting with the opening of the layers), they get more involved with the Institute side of things; they may be interviewed about an encounter with a failure, learn that they're collecting sample for science, s or be studied by Research",
  },
  {
    isBold: false,
    text: ' Mom or the other adults (but more with the uni students than the parents). But initially they don\'t realize that the Institute\'s research is actually the main point of the hunting, or that World Ascension and Final Ascension, not fighting Failures or even curing the illness, is the final goal. \\n<li>Possible names: Prometheus (b/c bringing fire to humanity as the school seeks to bring the skills to students that they need to protect humanity.  Also, in Aeschylus\' plays Prometheus Bound, he says as a \\"medicine\\" for death, he planted blind hope in humans.)  **Ithas** is another name for Prometheus. Or Pkharmat, similar figure in Vainakh mythology (of Eastern Europe) or Sata, the goddess who assisted him stealing it from her husband. Or Amirani, Georgian equivalent, or Pataraz, the Circassian and Abkhaz version. Or Amirani or Amiran \\n</ul>",',
  },
  {
    isBold: true,
    text: 'In possession of fortune',
  },
  {
    isBold: false,
    text: 'Yes',
  },
  {
    isBold: true,
    text: 'Category',
  },
  {
    isBold: false,
    text: 'Other',
  },
  {
    isBold: false,
    text: '...',
  },
]

let currentState = cloneDeep(initialState)
const isNewFile = true
let bookId = 1
currentState = emptyFile(BOOK_TITLE)
currentState.beats = {
  series: tree.newTree('id'),
}
currentState.lines = []

function isAnObject(val) {
  if (val && typeof val === 'object') {
    return true
  } else {
    return false
  }
}

const asNumber = (x) => {
  if (typeof x === 'number') return true
  if (typeof x !== 'string') return false

  return !isNaN(Number.parseInt(x)) && Number.parseInt(x)
}

const checkCase = (val) => {
  if (!isNaN(val * 1)) {
    return 'isNumeric'
  } else {
    if (val == val.toUpperCase()) {
      return 'uppercase'
    }
    if (val == val.toLowerCase()) {
      return 'lowercase'
    }
  }
}

expect.extend({
  toBeANaturalNumber(received) {
    const pass =
      (typeof received === 'string' || typeof received === 'number') && asNumber(received) >= 1
    if (pass) {
      return {
        message: () => `expected ${received} to be a natural number`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be a natural number`,
        pass: false,
      }
    }
  },
  toBeANaturalNumberorNull(received) {
    const pass =
      received === null ||
      received === 'null' ||
      ((typeof received === 'string' || typeof received === 'number') && asNumber(received) >= 1)
    if (pass) {
      return {
        message: () => `expected ${received} to be a natural number or null`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be a natural number or null`,
        pass: false,
      }
    }
  },
  toBeASlateObject(received) {
    const hasType = !!received.type && typeof received.type == 'string'
    const hasChildren = !!received.children && Array.isArray(received.children)
    const childrenHasTextProp =
      !!received.children && !!received.children[0] && typeof received.children[0].text == 'string'

    if (hasType && hasChildren && childrenHasTextProp) {
      return {
        message: () => `expected ${received} to be a slate object`,
        pass: true,
      }
    } else if (hasType && hasChildren && !childrenHasTextProp) {
      return {
        message: () =>
          `expected ${received.children} property should be an array of objects, and each object should have text property`,
        pass: false,
      }
    } else if (!hasType || !hasChildren) {
      return {
        message: () => `expected ${received} should have a type and children property`,
        pass: false,
      }
    } else {
      return {
        message: () => `expected ${received} to be a slate object`,
        pass: false,
      }
    }
  },
})

const manuscript = scrivxJSON['ScrivenerProject']['Binder']['BinderItem'].find(
  (n) => n['_attributes']['Type'] == 'DraftFolder' || n['Title']['_text'] == 'Manuscript'
)

const sectionsJSON = scrivxJSON['ScrivenerProject']['Binder']['BinderItem'].filter(
  (n) => n['_attributes']['Type'] != 'DraftFolder' && n['_attributes']['Type'] != 'TrashFolder'
)

const characters = getSection(sectionsJSON, 'Characters').filter((i) => i)
const notes = getSection(sectionsJSON, 'Notes').filter((i) => i)
const places = getSection(sectionsJSON, 'Places').filter((i) => i)

const charactersBinderItem = Array.isArray(characters[0]['Children']['BinderItem'])
  ? characters[0]['Children']['BinderItem']
  : [characters[0]['Children']['BinderItem']]

// const notesBinderItem = Array.isArray(notes[0]['Children']['BinderItem'])
//   ? notes[0]['Children']['BinderItem']
//   : [notes[0]['Children']['BinderItem']]

// const placesBinderItem = Array.isArray(places[0]['Children']['BinderItem'])
//   ? places[0]['Children']['BinderItem']
//   : [places[0]['Children']['BinderItem']]

describe('ScrivenerImporter', () => {
  describe('createNewBook', () => {
    const bookId = createNewBook(currentState.books)
    it('should return integer', () => {
      expect(typeof bookId).toBe('number')
    })

    it('should return an incremented value by 1', () => {
      expect(bookId).toBe(2)
    })
  })

  describe('withStoryLineIfItExists', () => {
    const rootKeys = [
      'ui',
      'file',
      'series',
      'books',
      'characters',
      'cards',
      'lines',
      'customAttributes',
      'places',
      'tags',
      'notes',
      'beats',
      'categories',
      'images',
      'hierarchyLevels',
      'featureFlags',
    ]

    const storyLines = withStoryLineIfItExists(
      manuscript,
      currentState,
      BOOK_TITLE,
      bookId,
      isNewFile,
      relevantFiles
    )
    const arrayedBookId = [bookId]
    const stringyfiedBookId = String(bookId)
    const arrayStoryLineKeys = ['characters', 'cards', 'lines', 'places', 'tags', 'notes']
    const objectStoryLineKeys = rootKeys.filter((item) => !arrayStoryLineKeys.includes(item))

    it('should return a json', () => {
      expect(isAnObject(storyLines)).toBeTruthy()
    })

    it('should contain all root keys', () => {
      const storyLineKeys = keys(storyLines)
      expect(storyLineKeys).toEqual(rootKeys)
    })

    if (bookId && stringyfiedBookId) {
      it('should contain stringyfied book id and allId keys', () => {
        expect(storyLines.books.allIds).toBeDefined()
        expect(storyLines.books[stringyfiedBookId]).toBeDefined()
        expect(storyLines.books.allIds).toEqual(expect.arrayContaining(arrayedBookId))
      })
    }

    it('should return "characters", "cards", "lines", "places", "tags", and "notes" as an array', () => {
      Object.keys(storyLines).forEach((key) => {
        if (arrayStoryLineKeys.includes(storyLines[key])) {
          expect(Array.isArray(storyLines[key])).toBeTruthy()
          expect(isAnObject(storyLines[key])).toBeFalsy()
        }
      })
    })

    it('should return the other remaining keys as an object', () => {
      Object.keys(storyLines).forEach((key) => {
        if (objectStoryLineKeys.includes(storyLines[key])) {
          expect(isAnObject(storyLines[key])).toBeTruthy()
          expect(Array.isArray(storyLines[key])).toBeFalsy()
        }
      })
    })

    it('categories should contain all SECTION_ITEMS as keys', () => {
      const categoryKeys = keys(storyLines.categories)
      expect(categoryKeys).toEqual(expect.arrayContaining(SECTION_ITEMS))
    })
  })

  describe('getSection', () => {
    it('should return an array of files', () => {
      expect(Array.isArray(characters)).toBeTruthy()
      expect(Array.isArray(notes)).toBeTruthy()
      expect(Array.isArray(places)).toBeTruthy()
    })
  })

  describe('createNewCharacter', () => {
    const currentCharacters = currentState.characters
    const lastCharId = currentCharacters.length
      ? currentCharacters[currentCharacters.length - 1].id
      : 0
    const newCharacter1 = createNewCharacter(currentCharacters, {
      name: TEST_STRING_1,
      bookId,
    })
    const newCharacter2 = createNewCharacter(currentCharacters, {
      name: TEST_STRING_2,
      bookId,
    })
    const newCharacter3 = createNewCharacter(currentCharacters, {
      name: TEST_STRING_3,
      bookId,
    })
    const newCharacter4 = createNewCharacter(currentCharacters, {
      name: TEST_STRING_3,
      bookId,
    })

    it('should return an id interger', () => {
      expect(typeof newCharacter1).toBe('number')
      expect(typeof newCharacter2).toBe('number')
    })

    it('should return an incremented value by 1', () => {
      expect(newCharacter1).toBeGreaterThan(lastCharId)
      expect(newCharacter2).toBeGreaterThan(newCharacter1)
      expect(newCharacter3).toBeGreaterThan(newCharacter2)
    })

    it('should return found character id if name of character exists', () => {
      expect(newCharacter4).toEqual(newCharacter3)
    })
  })

  describe('createNewNote', () => {
    const currentNotes = currentState.notes
    const lastNoteId = currentNotes.length ? currentNotes[currentNotes.length - 1].id : 0

    const newNote1 = createNewNote(currentNotes, { title: TEST_STRING_1, bookId })
    const newNote2 = createNewNote(currentNotes, { title: TEST_STRING_2, bookId })
    const newNote3 = createNewNote(currentNotes, { title: TEST_STRING_3, bookId })
    const newNote4 = createNewNote(currentNotes, { title: TEST_STRING_3, bookId })

    it('should return an id interger', () => {
      expect(typeof newNote1).toBe('number')
      expect(typeof newNote2).toBe('number')
    })

    it('should return an incremented value by 1', () => {
      expect(newNote1).toBeGreaterThan(lastNoteId)
      expect(newNote2).toBeGreaterThan(newNote1)
      expect(newNote3).toBeGreaterThan(newNote2)
    })

    it('should return found note id if title of note exists', () => {
      expect(newNote4).toEqual(newNote3)
    })
  })

  describe('createNewPlace', () => {
    const currentPlaces = currentState.places
    const lastPlaceId = currentPlaces.length ? currentPlaces[currentPlaces.length - 1].id : 0

    const newPlace1 = createNewPlace(currentPlaces, { name: TEST_STRING_1, bookId })
    const newPlace2 = createNewPlace(currentPlaces, { name: TEST_STRING_2, bookId })
    const newPlace3 = createNewPlace(currentPlaces, { name: TEST_STRING_3, bookId })
    const newPlace4 = createNewPlace(currentPlaces, { name: TEST_STRING_3, bookId })
    it('should return an id interger', () => {
      expect(typeof newPlace1).toBe('number')
      expect(typeof newPlace2).toBe('number')
    })

    it('should return an incremented value by 1', () => {
      expect(newPlace1).toBeGreaterThan(lastPlaceId)
      expect(newPlace2).toBeGreaterThan(newPlace1)
      expect(newPlace3).toBeGreaterThan(newPlace2)
    })

    it('should return found place id if name of place exists', () => {
      expect(newPlace4).toEqual(newPlace3)
    })
  })

  describe('createNewCard', () => {
    let currentCards = currentState.cards
    currentCards = createNewCard(currentCards, { title: TEST_STRING_1, bookId, id: 1 })
    currentCards = createNewCard(currentCards, { title: TEST_STRING_2, bookId, id: 2 })
    currentCards = createNewCard(currentCards, { title: TEST_STRING_3, bookId, id: 3 })
    currentCards = createNewCard(currentCards, { title: TEST_STRING_3, bookId, id: 4 })
    currentCards = createNewCard(currentCards, { title: TEST_STRING_3, bookId, id: 4 })
    const similarCards = currentCards.filter((item) => item.title == TEST_STRING_3)

    it('should return an Array', () => {
      expect(Array.isArray(currentCards)).toBeTruthy()
    })

    it('should return an Array', () => {
      expect(Array.isArray(currentCards)).toBeTruthy()
    })

    currentCards.forEach((card) => {
      if (card.description) {
        card.description.forEach((desc) => {
          it('should be a slate object', () => {
            expect(desc).toBeASlateObject()
          })
        })
      }
    })

    it('should create a new card regardless if title already exists', () => {
      expect(similarCards).toHaveLength(2)
      expect(similarCards[0].title).toEqual(similarCards[1].title)
    })

    it('should not create card if title and id exists', () => {
      expect(similarCards[0].id).not.toEqual(similarCards[1].id)
      expect(currentCards).toHaveLength(4)
    })
  })

  describe('createNewLine', () => {
    const newLine = createNewLine(currentState.lines, { title: TEST_STRING_1 }, bookId)
    const prevLineId = currentState.lines[currentState.lines.length - 1].lineId
      ? currentState.lines[0].lineId
      : 0

    it('should return the line id', () => {
      expect(newLine).toBeANaturalNumber()
    })

    it('newLine id should increment by 1', () => {
      expect(newLine).toBeGreaterThan(prevLineId)
      expect(newLine).not.toEqual(prevLineId)
      expect(newLine).not.toBeLessThan(prevLineId)
    })
  })

  describe('createNewBeat', () => {
    const newBeat = createNewBeat(currentState, { title: TEST_STRING_1 }, bookId)
    const stringyfiedBookId = String(bookId)

    it('should return an object', () => {
      expect(isAnObject(newBeat)).toBeTruthy()
    })

    if (stringyfiedBookId) {
      it('should contain the keys of a stringyfied bookId and "series"', () => {
        expect(typeof stringyfiedBookId).toBe('string')
        expect(stringyfiedBookId).toBeANaturalNumber()
        expect(newBeat[stringyfiedBookId]).toBeDefined()
        expect(newBeat['series']).toBeDefined()
      })

      it('bookId should have "children", "heap", "index"', () => {
        const bookObjKeysInBeats = keys(newBeat[stringyfiedBookId])
        expect(bookObjKeysInBeats).toEqual(expect.arrayContaining(BEAT_BOOK_ID_KEYS))
      })
    }
  })

  describe('createNewCategory', () => {
    const newCategory1 = createNewCategory(currentState.categories.notes, TEST_STRING_1)
    const newCategory2 = createNewCategory(currentState.categories.notes, TEST_STRING_3)
    const newCategory3 = createNewCategory(currentState.categories.characters, TEST_STRING_3)
    const newCategory4 = createNewCategory(currentState.categories.characters, TEST_STRING_3)

    it('should return an id interger', () => {
      expect(typeof newCategory1).toBe('number')
      expect(typeof newCategory2).toBe('number')
    })

    it('should return an incremented value by 1', () => {
      expect(newCategory2).toBeGreaterThan(newCategory1)
      expect(newCategory2 - newCategory1).toBe(1)
    })

    it('should a default category name of "Main" except for places', () => {
      const characters = currentState.categories.characters.find((cat) => cat.name == 'Main')
      const notes = currentState.categories.notes.find((cat) => cat.name == 'Main')
      const tags = currentState.categories.tags.find((cat) => cat.name == 'Main')
      const places = currentState.categories.places.find((cat) => cat && cat.name == 'Main')

      expect(characters).toEqual(MAIN_CATEGORY_OBJ)
      expect(notes).toEqual(MAIN_CATEGORY_OBJ)
      expect(tags).toEqual(MAIN_CATEGORY_OBJ)
      expect(places).not.toEqual(MAIN_CATEGORY_OBJ)
      expect(places).toBeUndefined()
    })

    it('should return found category id if name of category exists', () => {
      expect(newCategory4).toEqual(newCategory3)
    })
  })

  describe('createNewTag', () => {
    const currentTags = currentState.tags
    const lastTagId = currentTags.length ? currentTags[currentTags.length - 1].id : 0
    const newTag1 = createNewTag(currentTags, TEST_STRING_1)
    const newTag2 = createNewTag(currentTags, TEST_STRING_2)
    const newTag3 = createNewTag(currentTags, TEST_STRING_3)
    const newTag4 = createNewTag(currentTags, TEST_STRING_3)

    it('should return an id interger', () => {
      expect(typeof newTag1).toBe('number')
      expect(typeof newTag2).toBe('number')
    })

    it('should return an incremented value by 1', () => {
      expect(newTag1).toBeGreaterThan(lastTagId)
      expect(newTag2).toBeGreaterThan(newTag1)
      expect(newTag3).toBeGreaterThan(newTag2)
    })

    it('should return found tag id if title of tag exists', () => {
      expect(newTag4).toEqual(newTag3)
    })
  })

  describe('createSlateParagraph', () => {
    const slateObj1 = createSlateParagraph(TEXT_OBJECT_1)
    const slateObj2 = createSlateParagraph(TEXT_OBJECT_2)

    it('should return an object', () => {
      expect(isAnObject(slateObj1)).toBeTruthy()
      expect(isAnObject(slateObj2)).toBeTruthy()
    })

    it('should return have a "children" key', () => {
      const childrenArr = keys(slateObj1).find((item) => item == 'children')
      expect(childrenArr).toBeTruthy()
    })
  })

  describe('createSlateEditor', () => {
    const slateEditorObj = createSlateEditor([TEXT_OBJECT_1, TEXT_OBJECT_2])

    it('should return an object', () => {
      expect(isAnObject(slateEditorObj)).toBeTruthy()
    })

    it('should have "type" and "children" object keys', () => {
      expect(slateEditorObj).toMatchObject({
        type: expect.any(String),
        children: expect.any(Array),
      })
    })
  })

  describe('getMatchedRelevantFiles', () => {
    const files = getMatchedRelevantFiles(relevantFiles, UUID)

    it('should return an array', () => {
      expect(Array.isArray(files)).toBeTruthy()
    })

    it('should have a "filePath" and "contents" keys', () => {
      files.forEach((file) => {
        expect(file).toMatchObject({ filePath: expect.any(String), contents: expect.any(Object) })
      })
    })
  })

  describe('getVer_2_7_matchName', () => {
    const file = relevantFiles.filter((f) => !UUIDFolderRegEx.test(f.filePath))
    const relevantFileNames = ['notes.rtf', 'synopsis.txt']

    file.forEach((f) => {
      const matchedFile = getVer_2_7_matchName(f.filePath, UUID)
      const strippedMatchedFileName = matchedFile.split('_').pop()

      it('should not have relevant files', () => {
        expect(relevantFileNames).toEqual(expect.not.arrayContaining([strippedMatchedFileName]))
      })
    })
  })

  describe('nextPositionInLine', () => {
    const lineId = 1
    const beatId = 1
    let currentCards = currentState.cards
    currentCards = createNewCard(currentCards, {
      title: TEST_STRING_1,
      bookId,
      lineId,
      beatId,
      positionWithinLine: nextPositionInLine(currentCards, lineId, beatId),
    })
    currentCards = createNewCard(currentCards, {
      title: TEST_STRING_1,
      bookId,
      lineId,
      beatId,
      positionWithinLine: nextPositionInLine(currentCards, lineId, beatId),
    })

    it('should return next positionWithinLine if previous and current card have the same beatId and lineId', () => {
      currentCards.forEach((card, idx) => {
        if (
          currentCards[idx - 1] &&
          card.beatId == currentCards[idx - 1].beatId &&
          card.lineId == currentCards[idx - 1].lineId
        ) {
          expect(card.positionWithinLine).toBeGreaterThan(currentCards[idx - 1].positionWithinLine)
        }
      })
    })

    it('should return 0 as positionWithinLine if previous and current card beatId and lineId is not the same', () => {
      currentCards.forEach((card, idx) => {
        if (currentCards[idx - 1] && card.beatId == !currentCards[idx - 1].beatId) {
          expect(card.positionWithinLine).toBe(0)
        }
      })
    })
  })

  describe('withStoryLineIfItExists', () => {
    const storyLines = withStoryLineIfItExists(
      manuscript,
      currentState,
      BOOK_TITLE,
      bookId,
      isNewFile,
      relevantFiles
    )
    it('should return a json', () => {
      expect(isAnObject(storyLines)).toBeTruthy()
    })
  })

  describe('mapMatchedFiles', () => {
    const files = getMatchedRelevantFiles(relevantFiles, UUID)
    let fileContents = { txtContent: createSlateParagraph(''), rtfContents: [] }
    const matchedFiles = mapMatchedFiles(currentState, files, fileContents, bookId)

    it('should return an object', () => {
      expect(isAnObject(matchedFiles)).toBeTruthy()
    })

    it('should have "rtfContents" and "txtContent" keys', () => {
      const expectedKeys = ['rtfContents', 'txtContent']
      const fileContentKeys = keys(fileContents)
      expect(fileContentKeys).toHaveLength(2)
      expect(fileContentKeys).toEqual(expect.arrayContaining(expectedKeys))
    })
  })

  describe('getManuscriptSectionItems', () => {
    const files = getMatchedRelevantFiles(relevantFiles, UUID)
    let fileContents = { txtContent: createSlateParagraph(''), rtfContents: [] }
    const mappedFiles = mapMatchedFiles(currentState, files, fileContents, bookId)
    fileContents = {
      ...fileContents,
      rtfContents: mappedFiles.rtfContents,
    }
    const contents = fileContents.rtfContents.contents
    const sectionItemsFromManuscript = getManuscriptSectionItems(currentState, contents, bookId)

    it('should return an array of objects', () => {
      expect(Array.isArray(sectionItemsFromManuscript)).toBeTruthy()

      sectionItemsFromManuscript.forEach((section) => {
        expect(isAnObject(section)).toBeTruthy()
      })
    })

    it('should have an object key name that belongs included in "SECTION_ITEMS"', () => {
      sectionItemsFromManuscript.forEach((section) => {
        const sectionItemKey = keys(section)[0]
        expect(SECTION_ITEMS).toContain(sectionItemKey)
      })
    })
  })

  describe('keepRTFNonSectionItems', () => {
    const files = getMatchedRelevantFiles(relevantFiles, UUID)
    let fileContents = { txtContent: createSlateParagraph(''), rtfContents: [] }
    const mappedFiles = mapMatchedFiles(currentState, files, fileContents, bookId)
    fileContents = {
      ...fileContents,
      rtfContents: mappedFiles.rtfContents,
    }
    const contents = fileContents.rtfContents.contents
    const nonSectionItems = keepRTFNonSectionItems(contents)

    it('should return an array of objects', () => {
      expect(Array.isArray(nonSectionItems)).toBeTruthy()

      nonSectionItems.forEach((item) => {
        expect(isAnObject(item)).toBeTruthy()
      })
    })

    it('should not have an object key name that belongs to "SECTION_ITEMS"', () => {
      nonSectionItems.forEach((item) => {
        const sectionItemKey = keys(item)[0]
        expect(SECTION_ITEMS).not.toContain(sectionItemKey)
      })
    })
  })

  describe('getRTFContents', () => {
    const files = getMatchedRelevantFiles(relevantFiles, UUID)

    it('should return an object', () => {
      files.forEach((file) => {
        const RTFContents = getRTFContents(currentState, currentState.lines, file, UUID, bookId)
        if (RTFContents) {
          expect(isAnObject(RTFContents)).toBeTruthy()
        }
      })
    })

    it('should have a "contents" key name', () => {
      files.forEach((file) => {
        const RTFContents = getRTFContents(currentState, currentState.lines, file, UUID, bookId)
        if (RTFContents) {
          expect(RTFContents).toHaveProperty('contents')
        }
      })
    })

    it('should have "type" and "children" key names if content is not empty', () => {
      const expectedKeys = ['type', 'children']
      files.forEach((file) => {
        const RTFContents = getRTFContents(currentState, currentState.lines, file, UUID, bookId)
        if (RTFContents) {
          const contents = RTFContents.contents

          if (contents) {
            expect(Array.isArray(contents)).toBeTruthy()

            contents.forEach((item) => {
              const itemKey = keys(item)[0]
              expect(expectedKeys).toContain(itemKey)
            })
          }
        }
      })
    })
  })

  describe('objectifyRTFContents', () => {
    const sectionItem = 'character'

    it('should return an array of objects from the file', () => {
      charactersBinderItem.forEach((item, key) => {
        const name =
          item['Title'] && item['Title']['_text'] ? item['Title']['_text'] : `Character ${key}`
        const id = item['_attributes']['UUID'] || item['_attributes']['ID']
        const matchFile = getMatchedRelevantFiles(relevantFiles, id)
        const RTFmatch = matchFile.find((item) => item.filePath.includes('.rtf'))
        const customAttributes = objectifyRTFContents(RTFmatch, sectionItem, name)

        expect(Array.isArray(customAttributes)).toBeTruthy()

        customAttributes.forEach((attrib) => {
          expect(isAnObject(attrib)).toBeTruthy()
        })
      })
    })
  })

  describe('isATag', () => {
    const sectionItem = 'character'

    charactersBinderItem.forEach((item, key) => {
      const name =
        item['Title'] && item['Title']['_text'] ? item['Title']['_text'] : `Character ${key}`
      const matchFile = getMatchedRelevantFiles(relevantFiles, UUID)
      const RTFmatch = matchFile.find((item) => item.filePath.includes('.rtf'))
      const customAttributes = objectifyRTFContents(RTFmatch, sectionItem, name)

      customAttributes
        .filter((item) => keys(item)[0] != '...')
        .forEach((attrib) => {
          const attrKey = keys(attrib)[0]

          it('should return a boolean', () => {
            const isTag = isATag(attrKey)
            expect(typeof isTag).toBe('boolean')
          })
        })
    })
  })

  describe('generateTagIds', () => {
    const sectionItem = 'character'

    it('should return an array of integers', () => {
      charactersBinderItem.forEach((item, key) => {
        const name =
          item['Title'] && item['Title']['_text'] ? item['Title']['_text'] : `Character ${key}`
        const id = item['_attributes']['UUID'] || item['_attributes']['ID']
        const matchFile = getMatchedRelevantFiles(relevantFiles, id)
        const RTFmatch = matchFile.find((item) => item.filePath.includes('.rtf'))
        const customAttributes = objectifyRTFContents(RTFmatch, sectionItem, name)

        expect(Array.isArray(customAttributes)).toBeTruthy()

        customAttributes
          .filter((item) => keys(item)[0] != '...')
          .forEach((attrib) => {
            const attrKey = keys(attrib)[0]
            const attrVal = values(attrib)[0]
            const isTag = isATag(attrKey)

            if (isTag) {
              const tagIds = generateTagIds(currentState, attrVal)
              expect(Array.isArray(tagIds)).toBeTruthy()

              tagIds.forEach((tag) => {
                expect(tag).toBeANaturalNumber()
              })
            }
          })
      })
    })
  })

  describe('strippedDefaultAttributes', () => {
    const sectionItem = 'character'

    charactersBinderItem.forEach((item, key) => {
      const name =
        item['Title'] && item['Title']['_text'] ? item['Title']['_text'] : `Character ${key}`
      const id = item['_attributes']['UUID'] || item['_attributes']['ID']
      const matchFile = getMatchedRelevantFiles(relevantFiles, id)
      const RTFmatch = matchFile.find((item) => item.filePath.includes('.rtf'))
      const customAttributes = objectifyRTFContents(RTFmatch, sectionItem, name)

      expect(Array.isArray(customAttributes)).toBeTruthy()

      customAttributes
        .filter((item) => keys(item)[0] != '...')
        .forEach((attrib) => {
          const attrKey = keys(attrib)[0]
          const attrVal = values(attrib)[0]
          const isTag = isATag(attrKey)
          if (!isTag) {
            const strippedAttribute = strippedDefaultAttributes(
              currentState,
              `${sectionItem}s`,
              attrKey,
              attrVal
            )

            it('should return an object', () => {
              expect(isAnObject(strippedAttribute)).toBeTruthy()
            })

            it('should return a lowercase key name if key name is found in "EXCLUDED_ATTRIBUTES"', () => {
              const strippedKey = keys(strippedAttribute)[0]
              const isDefaultAttrbute = EXCLUDED_ATTRIBUTES.includes(strippedKey)
              if (isDefaultAttrbute) {
                expect(checkCase(strippedKey)).toBe('lowercase')
                expect(checkCase(strippedKey)).not.toBe('uppercase')
                expect(checkCase(strippedKey)).not.toBe('isNumeric')
              }
            })
          }
        })
    })
  })

  describe('mergePairAttributes', () => {
    const mergedAttributes = mergePairAttributes(FLATTEN_ATTRIBUTES)

    it('should return an array of objects', () => {
      expect(Array.isArray(mergedAttributes)).toBeTruthy()

      mergedAttributes.forEach((attr) => {
        expect(isAnObject(mergedAttributes)).toBeTruthy()
      })
    })
  })

  describe('concatenateValues', () => {
    const concatenated = concatenateValues(FLATTEN_ATTRIBUTES)

    it('should return an array', () => {
      expect(Array.isArray(concatenated)).toBeTruthy()
    })

    it('should have an isBold and text property', () => {
      concatenated.forEach((item) => {
        expect(typeof item.isBold).toBe('boolean')
        expect(typeof item.text).toBe('string')
      })
    })
  })

  describe('isNotExcludedAttribute', () => {
    const testAttributes = ['notes', 'name', 'tags', 'place', 'home', 'line']

    it('should return false for values found in EXCLUDED_ATTRIBUTES', () => {
      testAttributes.forEach((attr) => {
        if (EXCLUDED_ATTRIBUTES.includes(upperFirst(attr.toLowerCase().trim()))) {
          expect(isNotExcludedAttribute(attr)).toBeFalsy()
        } else {
          expect(isNotExcludedAttribute(attr)).toBeTruthy()
        }
      })
    })
  })

  describe('createCustomAttributes', () => {
    const sectionItem = 'character'

    it('should return an array of objects', () => {
      charactersBinderItem.forEach((item, key) => {
        const name =
          item['Title'] && item['Title']['_text'] ? item['Title']['_text'] : `Character ${key}`
        const id = item['_attributes']['UUID'] || item['_attributes']['ID']
        const matchFile = getMatchedRelevantFiles(relevantFiles, id)
        const RTFmatch = matchFile.find((item) => item.filePath.includes('.rtf'))
        const customAttributes = objectifyRTFContents(RTFmatch, sectionItem, name)
        createCustomAttributes(currentState, customAttributes, `${sectionItem}s`)

        expect(isAnObject(currentState.customAttributes)).toBeTruthy()
      })
    })

    it('should have a name and type key name', () => {
      currentState.customAttributes[`${sectionItem}s`].forEach((attrib) => {
        const attrKeys = keys(attrib)
        expect(isAnObject(attrib)).toBeTruthy()
        expect(attrKeys[0]).toBe('name')
        expect(attrKeys[1]).toBe('type')
        expect(attrib.name).toBeDefined()
        expect(attrib.type).toBeDefined()
      })
    })
  })
})
