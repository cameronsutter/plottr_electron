import migrate from '../2023.3.5'
import { hierarchyLevel } from '../../../store/initialState'
import {
  pre_2023_1_19,
  pre_2023_1_19_without_hierarchies,
  pre_2023_1_19_with_empty_hierarchies,
} from './fixtures'

const hierarchiesPerBook = {
  series: {
    0: {
      name: 'Act',
      level: 0,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'SOLID',
      backgroundColor: 'none',
      textColor: '#e5554f',
      borderColor: '#e5554f',
      dark: {
        textColor: '#ffb8b5',
        borderColor: '#ffb8b5',
      },
      light: {
        textColor: '#e5554f',
        borderColor: '#e5554f',
      },
    },
    1: {
      name: 'Chapter',
      level: 1,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'DASHED',
      backgroundColor: 'none',
      textColor: '#78be20',
      borderColor: '#78be20',
      dark: {
        textColor: '#baed79',
        borderColor: '#baed79',
      },
      light: {
        textColor: '#78be20',
        borderColor: '#78be20',
      },
    },
    2: {
      name: 'Chapter',
      level: 2,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'NONE',
      backgroundColor: 'none',
      textColor: '#0b1117',
      borderColor: '#6cace4',
      dark: {
        borderColor: '#c9e6ff',
        textColor: '#c9e6ff',
      },
      light: {
        borderColor: '#6cace4',
        textColor: '#0b1117',
      },
    },
  },
  1: {
    0: {
      name: 'Act',
      level: 0,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'SOLID',
      backgroundColor: 'none',
      textColor: '#e5554f',
      borderColor: '#e5554f',
      dark: {
        textColor: '#ffb8b5',
        borderColor: '#ffb8b5',
      },
      light: {
        textColor: '#e5554f',
        borderColor: '#e5554f',
      },
    },
    1: {
      name: 'Chapter',
      level: 1,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'DASHED',
      backgroundColor: 'none',
      textColor: '#78be20',
      borderColor: '#78be20',
      dark: {
        textColor: '#baed79',
        borderColor: '#baed79',
      },
      light: {
        textColor: '#78be20',
        borderColor: '#78be20',
      },
    },
    2: {
      name: 'Chapter',
      level: 2,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'NONE',
      backgroundColor: 'none',
      textColor: '#0b1117',
      borderColor: '#6cace4',
      dark: {
        borderColor: '#c9e6ff',
        textColor: '#c9e6ff',
      },
      light: {
        borderColor: '#6cace4',
        textColor: '#0b1117',
      },
    },
  },
  8: {
    0: {
      name: 'Act',
      level: 0,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'SOLID',
      backgroundColor: 'none',
      textColor: '#e5554f',
      borderColor: '#e5554f',
      dark: {
        textColor: '#ffb8b5',
        borderColor: '#ffb8b5',
      },
      light: {
        textColor: '#e5554f',
        borderColor: '#e5554f',
      },
    },
    1: {
      name: 'Chapter',
      level: 1,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'DASHED',
      backgroundColor: 'none',
      textColor: '#78be20',
      borderColor: '#78be20',
      dark: {
        textColor: '#baed79',
        borderColor: '#baed79',
      },
      light: {
        textColor: '#78be20',
        borderColor: '#78be20',
      },
    },
    2: {
      name: 'Chapter',
      level: 2,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'NONE',
      backgroundColor: 'none',
      textColor: '#0b1117',
      borderColor: '#6cace4',
      dark: {
        borderColor: '#c9e6ff',
        textColor: '#c9e6ff',
      },
      light: {
        borderColor: '#6cace4',
        textColor: '#0b1117',
      },
    },
  },
  5: {
    0: {
      name: 'Act',
      level: 0,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'SOLID',
      backgroundColor: 'none',
      textColor: '#e5554f',
      borderColor: '#e5554f',
      dark: {
        textColor: '#ffb8b5',
        borderColor: '#ffb8b5',
      },
      light: {
        textColor: '#e5554f',
        borderColor: '#e5554f',
      },
    },
    1: {
      name: 'Chapter',
      level: 1,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'DASHED',
      backgroundColor: 'none',
      textColor: '#78be20',
      borderColor: '#78be20',
      dark: {
        textColor: '#baed79',
        borderColor: '#baed79',
      },
      light: {
        textColor: '#78be20',
        borderColor: '#78be20',
      },
    },
    2: {
      name: 'Chapter',
      level: 2,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'NONE',
      backgroundColor: 'none',
      textColor: '#0b1117',
      borderColor: '#6cace4',
      dark: {
        borderColor: '#c9e6ff',
        textColor: '#c9e6ff',
      },
      light: {
        borderColor: '#6cace4',
        textColor: '#0b1117',
      },
    },
  },
  9: {
    0: {
      name: 'Act',
      level: 0,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'SOLID',
      backgroundColor: 'none',
      textColor: '#e5554f',
      borderColor: '#e5554f',
      dark: {
        textColor: '#ffb8b5',
        borderColor: '#ffb8b5',
      },
      light: {
        textColor: '#e5554f',
        borderColor: '#e5554f',
      },
    },
    1: {
      name: 'Chapter',
      level: 1,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'DASHED',
      backgroundColor: 'none',
      textColor: '#78be20',
      borderColor: '#78be20',
      dark: {
        textColor: '#baed79',
        borderColor: '#baed79',
      },
      light: {
        textColor: '#78be20',
        borderColor: '#78be20',
      },
    },
    2: {
      name: 'Chapter',
      level: 2,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'NONE',
      backgroundColor: 'none',
      textColor: '#0b1117',
      borderColor: '#6cace4',
      dark: {
        borderColor: '#c9e6ff',
        textColor: '#c9e6ff',
      },
      light: {
        borderColor: '#6cace4',
        textColor: '#0b1117',
      },
    },
  },
  6: {
    0: {
      name: 'Act',
      level: 0,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'SOLID',
      backgroundColor: 'none',
      textColor: '#e5554f',
      borderColor: '#e5554f',
      dark: {
        textColor: '#ffb8b5',
        borderColor: '#ffb8b5',
      },
      light: {
        textColor: '#e5554f',
        borderColor: '#e5554f',
      },
    },
    1: {
      name: 'Chapter',
      level: 1,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'DASHED',
      backgroundColor: 'none',
      textColor: '#78be20',
      borderColor: '#78be20',
      dark: {
        textColor: '#baed79',
        borderColor: '#baed79',
      },
      light: {
        textColor: '#78be20',
        borderColor: '#78be20',
      },
    },
    2: {
      name: 'Chapter',
      level: 2,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'NONE',
      backgroundColor: 'none',
      textColor: '#0b1117',
      borderColor: '#6cace4',
      dark: {
        borderColor: '#c9e6ff',
        textColor: '#c9e6ff',
      },
      light: {
        borderColor: '#6cace4',
        textColor: '#0b1117',
      },
    },
  },
  7: {
    0: {
      name: 'Act',
      level: 0,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'SOLID',
      backgroundColor: 'none',
      textColor: '#e5554f',
      borderColor: '#e5554f',
      dark: {
        textColor: '#ffb8b5',
        borderColor: '#ffb8b5',
      },
      light: {
        textColor: '#e5554f',
        borderColor: '#e5554f',
      },
    },
    1: {
      name: 'Chapter',
      level: 1,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'DASHED',
      backgroundColor: 'none',
      textColor: '#78be20',
      borderColor: '#78be20',
      dark: {
        textColor: '#baed79',
        borderColor: '#baed79',
      },
      light: {
        textColor: '#78be20',
        borderColor: '#78be20',
      },
    },
    2: {
      name: 'Chapter',
      level: 2,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'NONE',
      backgroundColor: 'none',
      textColor: '#0b1117',
      borderColor: '#6cace4',
      dark: {
        borderColor: '#c9e6ff',
        textColor: '#c9e6ff',
      },
      light: {
        borderColor: '#6cace4',
        textColor: '#0b1117',
      },
    },
  },
}

const defaultHierarchiesPerBook = {
  series: {
    0: hierarchyLevel,
  },
  1: {
    0: hierarchyLevel,
  },
  8: {
    0: hierarchyLevel,
  },
  5: {
    0: hierarchyLevel,
  },
  9: {
    0: hierarchyLevel,
  },
  6: {
    0: hierarchyLevel,
  },
  7: {
    0: hierarchyLevel,
  },
}

describe('2023.1.19', () => {
  describe('given a file with two books', () => {
    describe('and no hierarchies', () => {
      it('should create a hierarchies collection that has a default hierarchy for each book', () => {
        const result = migrate(pre_2023_1_19_without_hierarchies)
        for (const key of Object.keys(result)) {
          if (key === 'hierarchyLevels') {
            expect(result[key]).toEqual(defaultHierarchiesPerBook)
          } else {
            expect(result[key]).toBe(pre_2023_1_19_without_hierarchies[key])
          }
        }
      })
      it('should not apply twice in a row', () => {
        const result1 = migrate(pre_2023_1_19_without_hierarchies)
        expect(migrate(result1)).toBe(result1)
      })
    })
    describe('and empty hierarchies', () => {
      it('should create a hierarchies collection that has a default hierarchy for each book', () => {
        const result = migrate(pre_2023_1_19_with_empty_hierarchies)
        for (const key of Object.keys(result)) {
          if (key === 'hierarchyLevels') {
            expect(result[key]).toEqual(defaultHierarchiesPerBook)
          } else {
            expect(result[key]).toBe(pre_2023_1_19_with_empty_hierarchies[key])
          }
        }
      })
      it('should not apply twice in a row', () => {
        const result1 = migrate(pre_2023_1_19_with_empty_hierarchies)
        expect(migrate(result1)).toBe(result1)
      })
    })
    describe('and an existing hierarchy', () => {
      it('should replace that hierarchy with an arrangement per book that is a copy of the original', () => {
        const result = migrate(pre_2023_1_19)
        for (const key of Object.keys(result)) {
          if (key === 'hierarchyLevels') {
            expect(result[key]).toEqual(hierarchiesPerBook)
          } else {
            expect(result[key]).toBe(pre_2023_1_19[key])
          }
        }
      })
      it('should not apply twice in a row', () => {
        const result1 = migrate(pre_2023_1_19)
        expect(migrate(result1)).toBe(result1)
      })
    })
  })
  describe('given a built-in template before 2023.3.5', () => {
    it('should add hierarchies for book 1 and "series"', () => {
      const templateFile = {
        cards: [
          {
            imageId: null,
            fromTemplateId: null,
            positionWithinLine: 1,
            tags: [],
            places: [],
            characters: [],
            description: [
              {
                children: [
                  {
                    text: 'Ordinary World Notes:',
                    bold: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'The First Act sets up the Protagonist in their ordinary, mundane environment. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'In the first few chapters, introduce their friends and family members, their home, school or workplace. But you need to show what’s missing. You don’t want to start with a perfect, happy character who has everything (unless you’re going to take it all away, which is fine). ',
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'You need to give them space to grow. Maybe they have unresolved emotional issues. They’re probably shy, awkward, clumsy or embarrassed, or unpopular. Maybe they hate their job or just got dumped. You need to show what they want, their secret desires. What are they working towards? They probably have daydreams about things they don’t think will ever happen. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: 'How is their environment a reflection of their inner flaw? ',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'What is their favorite object? ',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Where are the sources of conflict?',
                      },
                    ],
                  },
                ],
                type: 'bulleted-list',
              },
            ],
            color: null,
            beatId: 2,
            lineId: 1,
            id: 42,
            bookId: null,
            positionInBeat: 0,
            templates: [],
            title: 'Ordinary World Notes',
          },
          {
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    bold: true,
                    text: 'Rebirth Notes:',
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'The Protagonist returns, changed. They’ve won – though if this is a series, it’s probably temporary (this Antagonist was defeated, but they or someone new will return). ',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The Protagonist once again faces challenges or bullies from the beginning of the story, but they may seem trivial now. The Protagonist is no longer lacking; they’ve grown in confidence, have a group of new friends, and a new hope for the future.',
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'The Antagonist has been defeated, but the Protagonist is forever changed. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: 'What have they lost? ',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'What have they gained? ',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'What object(s) symbolize those things?',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
                type: 'bulleted-list',
              },
            ],
            id: 41,
            title: 'B Story: Internal - Rebirth (Return to Ordinary World)',
            bookId: null,
            lineId: 5,
            fromTemplateId: null,
            positionWithinLine: 1,
            tags: [],
            positionInBeat: 0,
            places: [],
            templates: [],
            imageId: null,
            beatId: 26,
            characters: [],
            color: null,
          },
          {
            positionInBeat: 0,
            fromTemplateId: null,
            color: null,
            positionWithinLine: 1,
            characters: [],
            places: [],
            bookId: null,
            lineId: 1,
            description: [
              {
                children: [
                  {
                    bold: true,
                    text: 'First Plot Point Notes:',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Things have been getting weirder and/or more intriguing for several chapters. Your Protagonist tries to ignore the problems, but they keep interfering with their normal agenda. They get roped in, and something happens that forces them into the action. Everything changes, and there’s no going back to the Ordinary World. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'They might have met a teacher, or seen something that changes their perspective: a revelation of supernatural abilities; a murder or death; an accident or robbery or attack or disaster. Something pretty big that shatters what they thought they understood of the world and makes them feel vulnerable and exposed. This will be one of the major scenes in your book, so make it unforgettable.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'This is your Protagonist stepping off the cliff or going into the rabbit hole. It may not be a physical change of location. ',
                  },
                ],
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'What object symbolizes this transition? ',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'How does the environment reflect the inner change? ',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'What flash of color conveys the mood?',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Act One has ended and is about 25% of your book—by now, all the major characters should have already been introduced, or at least hinted at. ',
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'This is a section break: something big changes, so be aware that this is a big turning point of your story. Take a breath. Figure out how it impacts your Protagonist. Then continue writing the next chapter.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            title: 'B Story: Internal – First Plot Point',
            tags: [],
            id: 35,
            beatId: 6,
            imageId: null,
            templates: [],
          },
          {
            beatId: 5,
            places: [],
            positionInBeat: 0,
            imageId: null,
            title: 'A Story: External – Inciting Incident',
            tags: [],
            color: null,
            characters: [],
            description: [
              {
                children: [
                  {
                    bold: true,
                    text: 'Inciting Incident Notes:',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'In most books, the inciting incident should happen in the first few chapters. Start your book as near to the inciting incident as you can. But don’t think of it as just one scene or chapter. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'It’s an intrusion on the Ordinary World. Something big changes. Maybe a stranger moves to town, or a family member dies, or there’s an earthquake. It might be an invitation or a friend inviting your Protagonist to a party. It can’t be a huge crisis, but it will be annoying and noticeable, or exciting — it’s the beginning of your plot. ',
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'The “Call to Adventure” is usually followed by denial or refusal. The Protagonist doesn’t trust it or doesn’t want to make a decision. They’ll ignore it and continue focusing on their previous goals. They just want things to go back to normal. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: 'What object symbolizes the event and deepens character? ',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'How does the setting reflect the mood of the conflict? ',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'What’s remarkable and novel about the character and their setting?',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'This is a section break: something big changes, so be aware that this is a big turning point of your story. Take a breath. Figure out how it impacts your Protagonist. Then continue writing the next chapter.',
                  },
                ],
              },
            ],
            templates: [],
            bookId: null,
            lineId: 1,
            positionWithinLine: 1,
            id: 34,
            fromTemplateId: null,
          },
          {
            imageId: null,
            fromTemplateId: null,
            tags: [],
            title: 'Death of Self (Optional) ',
            positionWithinLine: 1,
            color: null,
            places: [],
            id: 33,
            beatId: 20,
            positionInBeat: 0,
            lineId: 5,
            bookId: null,
            characters: [],
            description: [
              {
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    bold: true,
                    text: 'End of Act 3:',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    italic: true,
                    text: 'Optional: Hints of future challenges or antagonist lives.',
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'This chapter may be used to fill in any remaining plot holes (perhaps by having the Protagonist in the hospital and visited by someone who fills in any information they may have missed). While optional, this chapter can be very powerful and can be a coming full circle or represent the rebirth of the Protagonist, as they have shifted from ambition to service. They always wanted their own thing, tried to get what they wanted, but ultimately sacrificed it to save others and defeat the Antagonist. This represents a very big shift and may even deserve an acknowledgement ceremony or public recognition of their service. This is also a great place to offer hints at future challenges if part of a series.',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Show how the Protagonist is recovering and dealing with the emotional fallout of their journey.',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Reaffirm the completion of the character arc for the Protagonist.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Show how the Protagonist now functions in the changed Ordinary World.',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Wrap up any loose ends.',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Acknowledge the Protagonist with a ceremony, being called up on stage, or other public celebration.',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Hint at future problems or that all may not be well.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'Breakdown:',
                    bold: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: 'Act 3 makes up the final 25% of the story.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Optional: Rebirth occurs around the 99 to 100% mark.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
                type: 'bulleted-list',
              },
            ],
            templates: [],
          },
          {
            characters: [],
            places: [],
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    bold: true,
                    text: 'End of Act 3:',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    italic: true,
                    text: 'Temporary victory. Innocents saved. How far they’ve come.',
                  },
                ],
              },
              {
                children: [
                  {
                    text: "The Protagonist has won the battle, and it is now time for a joyful celebration or bittersweet reflection. If part of a series, they may not have defeated the Antagonist; they may have just driven them off or been in a battle with a powerful but lesser henchman. In a standalone book, they may have a symbolic object they have held from the beginning, which they now discard because it is no longer needed. Either way, they foiled the Antagonist's plans and are a changed person. There may be a deliberate letting go scene or perhaps an acknowledgement ceremony as they return to the now changed Ordinary World.",
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Decide the wrap-up of the battle – will there be a joyful celebration or bittersweet reflection?',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Show how the Protagonist has changed and close all loose ends in their storylines, perhaps with a "letting go" scene.',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Conclude the storylines and character arcs of the other Main Characters and Allies.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Tie up any loose ends (unless moving on to the optional next chapter).',
                      },
                    ],
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'Breakdown:',
                    bold: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: 'Act 3 makes up the final 25% of the story.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Bittersweet Return occurs around the 96 to 100% mark.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
            ],
            positionInBeat: 0,
            fromTemplateId: null,
            id: 32,
            lineId: 5,
            positionWithinLine: 0,
            color: null,
            templates: [],
            title: 'Bittersweet Reflection',
            imageId: null,
            bookId: null,
            beatId: 26,
            tags: [],
          },
          {
            fromTemplateId: null,
            id: 31,
            imageId: null,
            lineId: 5,
            bookId: null,
            positionWithinLine: 0,
            places: [],
            description: [
              {
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    bold: true,
                    text: 'Late in Act 3:',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Secret weapon or ability, deep resolve, new understanding, unlikely ally. Remove glass shard. Sacrifice.',
                    italic: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Here is where the Antagonist believes they have won. However, the Protagonist now has a new understanding of themselves and the unhealed wound that was holding them back, and they decide to let it go or move past it. Their want versus need comes to a head here: they realize they may never achieve their want, but they are going to sacrifice it and fight anyway. The Protagonist has a secret weapon, one unexpected thing that was overlooked for the duration of the story, that will get them out of trouble and bring them victory.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: "Demonstrate the Protagonist's new understanding and willingness to leave their wants behind to attain victory.",
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Allow the Antagonist time to continue gloating until the Protagonist pulls forth the secret item, ability, or hidden Ally to get them out of trouble.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Have the Protagonist take the final steps in their character arc as they finally transform into their new self.',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Create the payoff for readers by presenting a satisfying ultimate victory over the Antagonist – all the struggles have led to this moment.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Do not be afraid to sacrifice more Allies and characters in this scene, perhaps even the Protagonist.',
                      },
                    ],
                  },
                ],
                type: 'bulleted-list',
              },
              {
                children: [
                  {
                    text: 'Breakdown:',
                    bold: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Act 3 makes up the final 25% of the story.',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Unexpected Victory occurs around the 92% mark.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
            ],
            positionInBeat: 0,
            title: 'Unexpected Victory',
            characters: [],
            color: null,
            beatId: 21,
            tags: [],
            templates: [],
          },
          {
            beatId: 22,
            templates: [],
            positionWithinLine: 1,
            id: 30,
            color: null,
            lineId: 5,
            fromTemplateId: null,
            imageId: null,
            places: [],
            characters: [],
            bookId: null,
            positionInBeat: 0,
            title: 'Ultimate Defeat',
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Mid Act 3:',
                    bold: true,
                  },
                ],
              },
              {
                children: [
                  {
                    italic: true,
                    text: 'Triumph of Villain. All hope is lost. Confront fatal flaw. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "This is the \"All is Lost\" moment for the Protagonist and the reader. The Protagonist thinks they understand their Fatal Flaw but really do not. They go into the battle confident, which leads to their undoing. The Protagonist may be at the mercy of the Antagonist, may be suffering through the Antagonist's gloating speech where plot holes are filled in and plans are laid bare, because it doesn't matter since they are about to be killed. This is a great place to wrap up some loose ends. It's where the Protagonist comes to a full understanding of their flaw and lets go of whatever was holding them back; it may even be the Antagonist who points the flaw out. The Protagonist has no hope of winning until they are able to face it.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: "Display the Protagonist's confidence as they enter the battle and then showcase how their fatal flaw defeats them.",
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Consider using this as a humiliation scene where the Protagonist is at the mercy of the Antagonist (e.g. tied up, at gunpoint, or other dire circumstance).',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Show the Protagonist react to their defeat, including the mental trauma of being caught, losing Allies, and being shown their true flaws by the Antagonist.',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Bring the Protagonist to their lowest point – show how they have lost all they wanted and dreamed of, and make the reader believe there is no way forward.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Show the Protagonist finally realizing their flaw and understanding what needs to be done to overcome it.',
                      },
                    ],
                  },
                ],
                type: 'bulleted-list',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    bold: true,
                    text: 'Breakdown:',
                  },
                ],
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: 'Act 3 makes up the final 25% of the story.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Ultimate Defeat occurs around the 88% mark.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
            ],
            tags: [],
          },
          {
            color: null,
            imageId: null,
            templates: [],
            positionInBeat: 0,
            beatId: 23,
            id: 29,
            title: 'A Story - External: Final Battle',
            characters: [],
            places: [],
            bookId: null,
            tags: [],
            lineId: 5,
            positionWithinLine: 1,
            description: [
              {
                children: [
                  {
                    bold: true,
                    text: 'Final Battle Notes:',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The Final Battle scene often includes a “Protagonist at the mercy of the Antagonist” scene, where the Protagonist is caught, so the Antagonist can gloat (or this can come earlier, just before the Second Plot Point). All is lost, the Protagonist is captured, the Antagonist gloats, then the Protagonist perseveres… usually simply by not giving up. In a sudden twist, the Protagonist reaches into themselves and finds the motivation and tenacity to persevere, unlocking access to their secret weapon and defeating the Antagonist. ',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Often the Final Battle scene also includes a “death of the Protagonist” scene, where the Protagonist, or an Ally/Romantic Interest, sacrifices themselves and appears to die… but then is brought back to life in joy and celebration. (Or if you want to keep it dark, just have them die, so the victory will be bittersweet). This doesn’t have to be a literal “battle.” It’s just the last, final straw, the most dramatic part of your story. It’s what forces the Protagonist to make a realization, change or grow – and it’s the place where they have a victory.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'This is a section break: something big changes, so be aware that this is a big turning point of your story. Take a breath. Figure out how it impacts your Protagonist. Then continue writing the next chapter.',
                  },
                ],
              },
            ],
            fromTemplateId: null,
          },
          {
            color: null,
            id: 28,
            places: [],
            positionInBeat: 0,
            beatId: 23,
            characters: [],
            bookId: null,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'Mid Act 3:',
                    bold: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Deliberate choice to continue, even if slim chance of success.',
                    italic: true,
                  },
                ],
              },
              {
                children: [
                  {
                    text: "While the Fatal Flaw realized in Chapter 20 may not be fully healed, it has at least been addressed, and the Protagonist now has the courage to Seize the Sword and make a deliberate choice to continue,  no matter how slim the odds of success. This is a good opportunity to reveal a piece of critical information that has been hidden to this point to give them an extra boost. As the Protagonist gears up for the Final Battle, they may need to complete tasks, like getting a special weapon or gathering troops or forces. Now it's time to confront the Antagonist.",
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: 'What object or information does the Protagonist receive?',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Bring the reader along for the decision to move forward despite slim chances.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Showcase the Protagonist and Allies gearing up for the final battle. What do they need to prepare? What do they need to attain? What is their plan?',
                      },
                    ],
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'Breakdown:',
                    bold: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: 'Act 3 makes up the final 25% of the story.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Seizing the Sword occurs around the 84% mark.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
            ],
            positionWithinLine: 0,
            tags: [],
            title: 'Seizing the Sword',
            templates: [],
            imageId: null,
            lineId: 5,
            fromTemplateId: null,
          },
          {
            fromTemplateId: null,
            title: 'Pep Talk',
            imageId: null,
            positionWithinLine: 0,
            lineId: 5,
            tags: [],
            places: [],
            positionInBeat: 0,
            characters: [],
            beatId: 24,
            templates: [],
            description: [
              {
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Early in Act 3:',
                    bold: true,
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'Encouragement from an Ally. Vulnerable share, inclusion. What’s at stake; choice.',
                    italic: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The Protagonist no longer believes in themselves and needs someone else to pull them out of their depressive cycle. This often comes in the form of a pep talk, encouragement from an Ally, or a vulnerable share; for example, this could be a revelation about the Protagonist, their past or true identity, or their fatal flaw – a blind spot the Protagonist has that explains why things have been going wrong and people keep getting hurt around them. Typically the fatal flaw is not brought fully to light, but this is a good point to have the Protagonist attempt to face it. Having this pep talk rebuilds their confidence, reaffirms what is at stake, and presents the choice of how to move forward.',
                  },
                ],
              },
              {
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Who offers the words of encouragement to the Protagonist? Why do their words matter and have an impact?',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: "What information is shared, and how does it confront the Protagonist's fatal flaw or lack?",
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'What steps can the Protagonist take to face their flaw?',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'How can this new information inspire them and give them courage to fight back?',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Reaffirm what is at stake and why the reader should care if the problem is resolved.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
                type: 'bulleted-list',
              },
              {
                children: [
                  {
                    bold: true,
                    text: 'Breakdown:',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: 'Act 3 makes up the final 25% of the story.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Pep Talk occurs around the 80% mark.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
            ],
            color: null,
            bookId: null,
            id: 27,
          },
          {
            positionWithinLine: 1,
            characters: [],
            id: 26,
            beatId: 25,
            lineId: 5,
            tags: [],
            bookId: null,
            fromTemplateId: null,
            templates: [],
            title: 'Giving Up',
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    bold: true,
                    text: 'Beginning of Act 3:',
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'Lead loses confidence; the forces are too great. What they want is unattainable.',
                    italic: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "Having lost the battle, the Protagonist loses their confidence and essentially gives up as they face the Dark Night of the Soul. They underestimated the Antagonist, their plan didn't work, and they lost their one shot at getting it right. They feel powerless as whatever hope they had is gone, leading them to self-doubt and feeling like a failure. Adding to their problems, they may also feel guilt and responsibility for the outcome.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'What is the fallout from their failure?',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'How did they underestimate the Antagonist?',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: "Display the Protagonist's mental state – are they angry, depressed, forlorn, or wracked with guilt?",
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Further increase the stakes and create the impression that victory is impossible.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
                type: 'bulleted-list',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    bold: true,
                    text: 'Breakdown:',
                  },
                ],
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Act 3 makes up the final 25% of the story.',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Giving Up occurs around the 76% mark.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
            ],
            places: [],
            color: null,
            positionInBeat: 0,
            imageId: null,
          },
          {
            tags: [],
            lineId: 4,
            characters: [],
            beatId: 19,
            imageId: null,
            positionInBeat: 0,
            positionWithinLine: 1,
            bookId: null,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Second Plot Point Notes:',
                    bold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The plan failed. ',
                    italic: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The secret weapon backfired. The worst has happened. The Antagonist has won. ',
                  },
                ],
              },
              {
                children: [
                  {
                    text: "Alternatively, the Second Pinch Point can be elevated conflict, followed by the Protagonist's reaction – leading to a total, devastating loss. Usually, this process happens over several chapters. But at the Second Plot Point, everything the Protagonist feared could happen has happened. They are destroyed. They cannot win. They give up. There’s no hope.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "They lose the battle, with serious consequences. Usually, the failure is due to the Protagonist's character flaw or a lack of knowledge. This marks a period of depression, prompting a change in mindset; the Protagonist has to give up what they want. They realize the thing they’ve been holding on to (often it’s just wanting to get back to the Ordinary World, back to normal) is completely gone. There is no chance for victory. The only way forward is through. ",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "They are forced to go in a new direction. This is tied to the Protagonist's flaw/lack of knowledge. When they figure out what they’ve been holding onto, what’s been holding them back or limiting them, and when they’re prepared to sacrifice what they want for the greater good, they finally become the Hero they need to be to defeat the Villain.",
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The Protagonist knew this was coming and felt somewhat prepared, but they were wrong. Make this scene heart-wrenching by taking something permanent from them or one of their Allies (destroyed house, lost limb, a death, etc).',
                  },
                ],
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: 'What object focuses the scene? ',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'What object does your Protagonist cling to afterwards, as a reminder?',
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'This is a section break: something big changes, so be aware that this is a big turning point of your story. Take a breath. Figure out how it impacts your Protagonist. Then continue writing the next chapter.',
                  },
                ],
              },
            ],
            templates: [],
            id: 25,
            fromTemplateId: null,
            title: 'B Story - Internal: Second Plot Point',
            places: [],
            color: null,
          },
          {
            lineId: 4,
            positionInBeat: 0,
            tags: [],
            fromTemplateId: null,
            imageId: null,
            title: 'Shocking Revelation',
            id: 24,
            positionWithinLine: 0,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'End of Act 2B:',
                    bold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The Antagonist’s full plan/true identity is revealed. Stakes are raised. Guilt and anger.',
                    italic: true,
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'The Protagonist learns new information in the new predicament they are facing, such as the true identity of the Antagonist or their full plan. The Protagonist may experience guilt and anger – anger at themselves for failing and/or anger at the Antagonist for outsmarting them or getting away. They may also feel personally responsible for letting everyone down. The stakes are raised as the worst has happened.',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Who is the Antagonist, and what is their full plan?',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'What new information do the Protagonist and Allies learn? How did they learn it?',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'How does this information inform future plans and decisions? ',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'What is the emotional state of the Protagonist, and how does this impact their wants and/or needs?',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Use this chapter to build tension, raise the stakes, and plant seeds of doubt.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    bold: true,
                    text: 'Breakdown:',
                  },
                ],
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: 'Act 2B makes up 25% of the story from 50% - 75%.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Socking Revelation occurs around the 72% mark.',
                      },
                    ],
                  },
                ],
              },
            ],
            templates: [],
            bookId: null,
            color: null,
            beatId: 19,
            characters: [],
            places: [],
          },
          {
            color: null,
            positionWithinLine: 0,
            templates: [],
            tags: [],
            beatId: 18,
            positionInBeat: 0,
            id: 23,
            imageId: null,
            characters: [],
            lineId: 4,
            bookId: null,
            title: 'Surprise Failure',
            places: [],
            fromTemplateId: null,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Late in Act 2B:',
                    bold: true,
                  },
                ],
              },
              {
                children: [
                  {
                    italic: true,
                    text: 'The plan goes horribly wrong, faulty information or assumption. Consequences.',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "The Protagonist's plans go horribly wrong, and they fail at their mission. Being in direct contact with the Antagonist's forces means their identity is revealed, and real consequences may arise, such as the death of an Ally, permanent disfigurement, or the loss of an important object. The plan may fail for a variety of reasons. In the end, they have failed, they are in real danger, and their plan has been shattered, leaving them at square one.",
                  },
                ],
              },
              {
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Deepen the problems for the Protagonist and their Allies.',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Do not be afraid to be aggressive in this scene – kill off characters, injure characters (including the Protagonist), or remove a key to their success.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Shake the Allies and the reader in the face of this failure.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Raise the stakes by having identities revealed, plans shattered, and the group at a loss for what to do next.',
                      },
                    ],
                  },
                ],
                type: 'bulleted-list',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    bold: true,
                    text: 'Breakdown:',
                  },
                ],
              },
              {
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Act 2B makes up 25% of the story from 50% - 75%.',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Surprise Failure occurs around the 68% mark.',
                      },
                    ],
                  },
                ],
                type: 'bulleted-list',
              },
            ],
          },
          {
            positionInBeat: 0,
            characters: [],
            templates: [],
            bookId: null,
            places: [],
            color: null,
            tags: [],
            imageId: null,
            fromTemplateId: null,
            title: 'Direct Conflict',
            lineId: 4,
            id: 22,
            beatId: 17,
            positionWithinLine: 0,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Mid Act 2B:',
                    bold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'They execute the plan and come in direct conflict with the Antagonist’s forces.',
                    italic: true,
                  },
                ],
              },
              {
                children: [
                  {
                    text: "While the First Battle may have been a bit of an accident involving low-level henchmen, in which the Antagonist didn't know who the Protagonist was, the enemy forces no longer underestimates them and their Allies. The Second Battle will bring the Protagonist and Allies in direct contact with higher-level forces of the Antagonist – forces with more agency. This could be an infiltration scene, for example, in which the Protagonist tries to sneak into the Antagonist's lair or perhaps tries to steal something the Antagonist wants or needs.",
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'How are the Protagonist and their Allies putting their plan into action?',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: "What is the goal they are trying to achieve? (e.g. stealing an artifact or trying to evaluate the Antagonist's defenses.)",
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'What level of forces do they meet? (e.g. is the team ambushed, do they stumble into a surprise attack, etc.)',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Use this scene to increase tension and leave the Protagonist in a dire situation.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
              {
                children: [
                  {
                    bold: true,
                    text: 'Breakdown:',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Act 2B makes up 25% of the story from 50% - 75%.',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Direct Conflict occurs around the 64% mark.',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            places: [],
            id: 21,
            positionWithinLine: 1,
            positionInBeat: 0,
            imageId: null,
            bookId: null,
            title: 'A Story: External - Second Battle / Second Pinch Point',
            templates: [],
            tags: [],
            beatId: 16,
            lineId: 4,
            color: null,
            characters: [],
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Second Battle Notes:',
                    bold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "The Second Battle which is about to unfold in the next chapter may not be against the Antagonist; it could just be forces that represent the Antagonist’s interests. The battle could be a real battle or a conflict that is the result of the Protagonist taking action, such as setting a trap for the Antagonist that doesn't work.",
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The Protagonist is determined to see this Battle through and feels responsible for the outcome, although the chances of success are slim. This confrontation makes the Protagonist realize they’ve underestimated the Antagonist’s power. ',
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'The Antagonist defeats the Protagonist’s forces or foreshadows what’s at stake in the next major encounter. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'What object symbolizes the danger and conflict? ',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Where’s the flash of color? ',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'What is remarkable about the setting?',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
                type: 'bulleted-list',
              },
              {
                children: [
                  {
                    text: 'This is a section break: something big changes, so be aware that this is a big turning point of your story. Take a breath. Figure out how it impacts your Protagonist. Then continue writing the next chapter.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            fromTemplateId: null,
          },
          {
            bookId: null,
            lineId: 4,
            places: [],
            color: null,
            positionWithinLine: 0,
            templates: [],
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
              },
              {
                children: [
                  {
                    bold: true,
                    text: 'Mid Act 2B:',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Trusted with an important task. ',
                    italic: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Once they have mapped out their strategy, the Protagonist will be given a crucial role. This is their chance to prove themselves and be tested in the real world as the other characters are beginning to trust the Protagonist. To really develop emotional angst and conflict, the Protagonist must be responsible for what happens.',
                  },
                ],
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: 'Show how the team is beginning to trust the Protagonist more.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'What is the crucial role the Protagonist takes on? Why were they given that task?',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: "Decide if the Protagonist will take on personal responsibility or stay arm's length from the conflict.",
                      },
                    ],
                  },
                ],
              },
              {
                children: [
                  {
                    bold: true,
                    text: 'Breakdown:',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Act 2B makes up 25% of the story from 50% - 75%.',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Crucial Role occurs around the 60% mark.',
                      },
                    ],
                  },
                ],
              },
            ],
            beatId: 16,
            tags: [],
            fromTemplateId: null,
            id: 20,
            characters: [],
            title: 'Crucial Role',
            imageId: null,
            positionInBeat: 0,
          },
          {
            lineId: 4,
            beatId: 14,
            title: 'Plan of Attack',
            positionInBeat: 0,
            bookId: null,
            fromTemplateId: null,
            templates: [],
            id: 19,
            places: [],
            color: null,
            description: [
              {
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    bold: true,
                    text: 'Early in Act 2B:',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    italic: true,
                    text: 'Plan of action to thwart the Antagonist’s forces or overcome the main problem.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "The Protagonist is all in, so they formulate a plan of attack. They are going to work around the problem presented in Chapter 11 and take action against the Antagonist. Perhaps they have to stop the Antagonist from doing something, maybe they don't quite understand the Antagonist's plans, or perhaps they don't truly know their identity.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Create a planning session where the Protagonist works with their Allies to use their information to form a plan.',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: "What are the Antagonist's plans? What needs to be done to stop them?",
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: "Will the Protagonist and Allies face off against the Antagonist's forces, or will they try to solve a central problem?",
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Consider pre-planning for future chapters, keeping the Antagonist one step ahead for the time being. How will the Antagonist stop the Protagonist from foiling their plans?',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
                type: 'bulleted-list',
              },
              {
                children: [
                  {
                    text: 'Breakdown:',
                    bold: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Act 2B makes up 25% of the story from 50% - 75%.',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Plan of Attack occurs around the 56% mark.',
                      },
                    ],
                  },
                ],
              },
            ],
            tags: [],
            imageId: null,
            positionWithinLine: 0,
            characters: [],
          },
          {
            beatId: 15,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'Beginning of Act 2B:',
                    bold: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Self-realization or a discovery. Victim to Warrior.',
                    italic: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'This is where the Protagonist goes from Victim to Warrior, from reluctant to deliberate. Up to this point in the story, the Protagonist has been passive and reactive. Now armed with new information, backstory, and the actual risks, they make a conscious decision to move forward. This is also a good point for a big revelation or surprise twist; the Protagonist may discover the extent of the conspiracy against them, making them second guess if they want to continue or if they are the right person for the task. It may be a reevaluation of themselves, leading them to confront their weaknesses and define themselves and the person they want to be. Ultimately, they decide to move forward.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: 'What is it that makes the Protagonist decide to continue on in the face of all they have learned?',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Consider creating a plot twist or revelation that causes the Protagonist to second guess their decision.',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Show the Protagonist displaying true self-reflection, recognizing weaknesses, and deciding who they want to be, but remember they are not yet ready or willing to confront their fatal flaw.',
                      },
                    ],
                  },
                ],
                type: 'bulleted-list',
              },
              {
                children: [
                  {
                    text: 'Breakdown:',
                    bold: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: 'Act 2B makes up 25% of the story from 50% - 75%.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Mirror Stage occurs around the 52% mark.',
                      },
                    ],
                  },
                ],
                type: 'bulleted-list',
              },
            ],
            title: 'Mirror Stage',
            color: null,
            templates: [],
            imageId: null,
            fromTemplateId: null,
            id: 18,
            tags: [],
            places: [],
            bookId: null,
            lineId: 4,
            positionWithinLine: 1,
            positionInBeat: 0,
            characters: [],
          },
          {
            bookId: null,
            color: null,
            title: 'B Story: Internal - Midpoint',
            tags: [],
            lineId: 3,
            characters: [],
            imageId: null,
            id: 17,
            places: [],
            beatId: 13,
            fromTemplateId: null,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Midpoint Notes:',
                    bold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'After the First Battle/First Pinch Point (see Chapter 9), the Protagonist faces new challenges, but remains in a defensive role. They might make some plans, but mostly are waiting for something to happen and reacting to events or circumstances beyond their control. If they try to solve an issue, they are thwarted or make things worse. They might accidentally hurt someone, or their friends and family begin to fear and distrust them (because they have secrets now). They question their identity and worldview, which leads to a personality crisis, which leads to a shift in perspective. ',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'About halfway through the novel marks the point where the Protagonist decides to be proactive. They decide to stop being a victim and vow to do whatever it takes to win. They’ll probably form a new goal, and even if they aren’t sure how to achieve it, they’ll feel a deep conviction toward it. This might be based on rage or anger towards the Antagonist, a newfound perspective, or increased self-confidence.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'This could even literally be the Protagonist looking at themselves in a mirror, wondering who they’ve become. So far, they’ve been refusing their quest. But now, with new determination, they decide to fight back. ',
                  },
                ],
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'What object symbolizes that shift? ',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Where’s the flash of color? ',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'What’s remarkable about the setting?',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'This is a section break: something big changes, so be aware that this is a big turning point of your story. Take a breath. Figure out how it impacts your Protagonist. Then continue writing the next chapter.',
                  },
                ],
              },
            ],
            templates: [],
            positionInBeat: 0,
            positionWithinLine: 1,
          },
          {
            beatId: 13,
            bookId: null,
            templates: [],
            places: [],
            lineId: 3,
            positionInBeat: 0,
            title: 'Truth & Ultimatum',
            imageId: null,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    bold: true,
                    text: 'End of Act 2A:',
                  },
                ],
              },
              {
                children: [
                  {
                    italic: true,
                    text: 'New information, vulnerable share. In or out?',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The Protagonist learns critical new information that changes their whole worldview. Now they know the full extent of the Antagonist\'s forces, the backstory of the problem, and what they are up against. They may also have a new perspective on the Allies, realizing they were not as good as originally thought, or perhaps they realize the Antagonist has a sympathetic point of view. With this new and complete information, the Protagonist must consciously decide whether or not they are "in" for the rest of the journey. If they are, they will be committed to going forward with their eyes open.',
                  },
                ],
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: "What is the new information, and how does it change the Protagonist's worldview?",
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: "What is the Antagonist's perspective? What are their reasons for doing what they are doing?",
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: "How has the Protagonist's perspective changed in regards to the Allies and Antagonist?",
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Create a difficult and intriguing choice on whether or not to move forward – use this as an opportunity to further hook the reader.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    bold: true,
                    text: 'Breakdown:',
                  },
                ],
              },
              {
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Act 2A makes up 25% of the story from 25% - 50%.',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Truth & Ultimatum occurs around the 48% mark.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
                type: 'bulleted-list',
              },
            ],
            id: 16,
            positionWithinLine: 0,
            fromTemplateId: null,
            color: null,
            tags: [],
            characters: [],
          },
          {
            tags: [],
            positionWithinLine: 0,
            imageId: null,
            title: 'Problem Revealed',
            lineId: 3,
            beatId: 11,
            places: [],
            bookId: null,
            templates: [],
            color: null,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'Late in Act 2A:',
                    bold: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Surprise problem or situation. Demanding answers.',
                    italic: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: "The Protagonist feels down and overwhelmed once more as they realize how much they don't know. This has been revealed by the challenges in the previous chapter, and the Protagonist realizes they have been left in the dark; their Allies knew the danger and true level of threat but did not tell the Protagonist. The Protagonist, feeling left out, misunderstood, or like they don't belong, confronts the Allies and demands answers. They may be brushed off initially and told they are not ready or need to further develop their powers, but they will insist.",
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: 'Demonstrate how the Protagonist reacts to the discovery they have been left in the dark.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'How do the Allies react to being confronted?',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: "Create a tense scene that balances the Protagonist's shaken confidence in the Allies and themselves, with a newfound strength to defend themselves and stand up for what they deserve.",
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Breakdown:',
                    bold: true,
                  },
                ],
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: 'Act 2A makes up 25% of the story from 25% - 50%.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Problems Revealed occurs around the 44% mark.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
            ],
            id: 15,
            fromTemplateId: null,
            characters: [],
            positionInBeat: 0,
          },
          {
            positionInBeat: 0,
            fromTemplateId: null,
            title: 'A Story: External – First Battle / First Pinch Point',
            lineId: 3,
            characters: [],
            tags: [],
            imageId: null,
            templates: [],
            id: 14,
            bookId: null,
            color: null,
            places: [],
            beatId: 9,
            positionWithinLine: 1,
            description: [
              {
                children: [
                  {
                    bold: true,
                    text: 'First Battle Notes:',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'After the First Plot Point (see Chapter 6), there are several chapters where the Protagonist is learning about the New World. There needs to be conflict and tension, which builds up to the First Pinch Point. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'This doesn’t have to be a literal battle, but it is the first major interaction with the Antagonist or the forces of evil. The Antagonist might not be visible yet, but they should be the one wielding the strings. The Antagonist is after something, and that something is tied to the Protagonist. Maybe the Antagonist wants something the Protagonist has, or needs them to do something, or has a score to settle. The Protagonist probably still has no idea what’s happening, but they find themselves at the center of a conflict. They may not win, but they do survive. Now the stakes are clear. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'You should make the stakes as dire as possible. Ask yourself, what’s the worst thing that could happen? Then ask, how can I make it even worse for my Protagonist? The stakes should always seem like life and death to the Protagonist… they represent a complete change, the “death” of the former self. If your Protagonist doesn’t have their self-identity shaken to its roots, you need to make this scene bigger.',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'What can you add to make the setting reflect the mood? ',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'What can you add to make it epic? ',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'What can you add to deepen character? ',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'What’s remarkable about the setting?',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'This is a section break: something big changes, so be aware that this is a big turning point of your story. Take a breath. Figure out how it impacts your Protagonist. Then continue writing the next chapter.',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          {
            bookId: null,
            lineId: 3,
            characters: [],
            tags: [],
            beatId: 12,
            color: null,
            templates: [],
            title: 'Forces of Evil',
            positionWithinLine: 1,
            places: [],
            positionInBeat: 0,
            imageId: null,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    bold: true,
                    text: 'Mid Act 2A:',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    italic: true,
                    text: 'Stakes are raised, antagonists revealed.  ',
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'In the previous chapter, the Protagonist reached a status quo and feels a bit more confident. But now the forces of evil make themselves known and a new threat is realized. The Protagonist comes to truly understand what they have become involved in and its real dangers for the first time. This could be a face-to-face battle or a remote attack on a larger scale, but it creates a clearer picture of the Antagonist and their ultimate goal. The Protagonist is humbled by the event.',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Show the Protagonist and their Allies having small successes as they work towards their goal.',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Detail how the Antagonist forces are working toward the same goal, building tension.',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Create a point of conflict where the two forces meet, perhaps in surprise.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: "Demonstrate the Protagonist's new understanding of the Antagonist and hint at the Antagonist's ultimate goal.",
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Portray how the Protagonist is humbled by the attack and their realization of what is actually happening.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
              {
                children: [
                  {
                    bold: true,
                    text: 'Breakdown:',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: 'Act 2A makes up 25% of the story from 25% - 50%.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Forces of Evil occurs around the 40% mark.',
                      },
                    ],
                  },
                ],
                type: 'bulleted-list',
              },
            ],
            id: 13,
            fromTemplateId: null,
          },
          {
            imageId: null,
            places: [],
            beatId: 9,
            color: null,
            positionWithinLine: 0,
            templates: [],
            lineId: 3,
            bookId: null,
            tags: [],
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
              },
              {
                children: [
                  {
                    bold: true,
                    text: 'Mid Act 2A:',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    italic: true,
                    text: 'Small victory as lead proves capable. Fun and games. Begrudging acceptance. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Even though the Protagonist may not have complete control over their abilities, they experience a small victory that proves to Allies and Enemies that they are not incapable or hopeless, and gain some begrudging respect. They prove that they do belong and are beginning to build confidence in themselves.',
                  },
                ],
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: 'What is the small victory the Protagonist achieves?',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'How do their Allies react to it?',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: "How does the Protagonist's self-confidence grow? What does it look like?",
                      },
                    ],
                    type: 'list-item',
                  },
                ],
                type: 'bulleted-list',
              },
              {
                children: [
                  {
                    bold: true,
                    text: 'Breakdown:',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: 'Act 2A makes up 25% of the story from 25% - 50%.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Earning Respect occurs around the 36% mark.',
                      },
                    ],
                  },
                ],
                type: 'bulleted-list',
              },
            ],
            fromTemplateId: null,
            title: 'Earning Respect',
            id: 12,
            characters: [],
            positionInBeat: 0,
          },
          {
            places: [],
            color: null,
            positionWithinLine: 0,
            imageId: null,
            description: [
              {
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Early in Act 2A:',
                    bold: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    italic: true,
                    text: 'Struggle to belong. Frustration and doubt. Trials and challenges. The promise of the premise.',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'This is where the most interesting and exciting things the New World has to offer are presented. As the Protagonist explores the New World, they meet new characters and learn how to navigate it. It is often not all fun and games, as it may also present their main conflict with the Love Interest. There is often also some form of training and/or learning required to harness their powers or use the new information they have gained. As a result, the Protagonist may experience a lot of frustration and self-doubt and like they are not good enough to succeed.',
                  },
                ],
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'What new abilities does the Protagonist have?',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'What do they need to do to grow or control those abilities?',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Clearly demonstrate how the Protagonist feels and doubts themselves, allowing the reader to sympathize and connect with the struggles and feelings of not belonging.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: "Showcase what the world has to offer through the Protagonists' actions and training – use this as an opportunity to wow readers.",
                      },
                    ],
                  },
                ],
              },
              {
                children: [
                  {
                    bold: true,
                    text: 'Breakdown:',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: 'Act 2A makes up 25% of the story from 25% - 50%.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Games & Trials occurs around the 32% mark.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
            ],
            bookId: null,
            id: 11,
            fromTemplateId: null,
            templates: [],
            title: 'Games & Trials',
            tags: [],
            positionInBeat: 0,
            characters: [],
            lineId: 3,
            beatId: 8,
          },
          {
            id: 10,
            imageId: null,
            positionInBeat: 0,
            characters: [],
            beatId: 7,
            tags: [],
            bookId: null,
            fromTemplateId: null,
            positionWithinLine: 1,
            color: null,
            places: [],
            lineId: 3,
            title: 'Enemies & Allies',
            templates: [],
            description: [
              {
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    bold: true,
                    text: 'Beginning of Act 2A',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    italic: true,
                    text: 'Explore new world; meet characters, find their place and role. Introduce all main characters.',
                  },
                ],
              },
              {
                children: [
                  {
                    text: "The Protagonist has passed the Point of No Return and is now in the New World. This can be a magical world or simply an unfamiliar locale or situation. Moving forward, the Protagonist's daily life will be different. There will be new surroundings and circumstances they must adapt to, proving themselves in their new role. By the end of this plot point, most (if not all) the main characters should be introduced, and the Antagonist should at least be hinted at. The enemies in this section do not need to be the Antagonist or their minions; they could be new team members or Allies who feel threatened by the Protagonist's presence. This is also a good time to introduce new Mentors or a Love Interest who may act as a guide.",
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: "What is the Protagonist's new role? How are they uncomfortable and fumbling in finding their way?",
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Who are the other characters in the story? Are they Allies, Enemies, Mentors, or something else?',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Does the Protagonist face hazing or bullying? Do their new Allies meet them with fear and skepticism, or do they take the Protagonist under their wing and support them?',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Introduce the Antagonist and set expectations for what is to come.',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Who is the guide for the Protagonist to assist in traversing the New World?',
                      },
                    ],
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'Breakdown:',
                    bold: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Act 2A makes up 25% of the story from 25% - 50%.',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Enemies & Allies occurs around the 28% mark.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
            ],
          },
          {
            imageId: null,
            fromTemplateId: null,
            positionInBeat: 0,
            id: 8,
            places: [],
            bookId: null,
            lineId: 1,
            templates: [],
            beatId: 6,
            positionWithinLine: 0,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    bold: true,
                    text: 'End of Act 1:',
                  },
                ],
              },
              {
                children: [
                  {
                    italic: true,
                    text: 'Trying to fix ordinary world problems while resisting the lure of the supernatural world. ',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'The Protagonist is still trying to fix issues in the Ordinary World and resist the pull of the Call to Adventure, but now something happens to pull the rug out from under them and send them tumbling into the Point of No Return. They are torn out of their comfort zone and forced into action. This could be a theft, a kidnapping, killing of a pet, loss of financial security, and they must take the mission, or they could be placed in a life or death predicament. Whatever it is, they become personally motivated and have to get involved, even though they still do not want to.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Create a big event that the Protagonist cannot ignore, and make it personal.',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Be sure to use this scene to hook the reader – they have to care about the outcome to continue reading.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Make sure the stakes and tensions are high.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Remember, the Protagonist is not bold at this point – this is still against their will and they feel out of sorts.',
                      },
                    ],
                  },
                ],
                type: 'bulleted-list',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    bold: true,
                    text: 'Breakdown:',
                  },
                ],
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Act 1 makes up the first 25% of the story.',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Pull Out Rug occurs around the 24% mark of the story.',
                      },
                    ],
                  },
                ],
              },
            ],
            characters: [],
            title: 'Pull Out Rug',
            tags: [],
            color: null,
          },
          {
            imageId: null,
            positionInBeat: 0,
            bookId: null,
            fromTemplateId: null,
            beatId: 10,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Late Act 1:',
                    bold: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The new interrupts the old and causes conflict. Reveals dissatisfaction with ordinary.',
                    italic: true,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'The Protagonist refuses to deal with or accept the reality of the Call to Adventure. Intrigue, tension, and mystery – perhaps supernatural events as well – are building, but the Protagonist is trying to put their head in the sand. They do not want to face the new challenge or the New World; they want things to return to how they were. Regret and doubt build as the Protagonist resists the Call to Adventure.',
                  },
                ],
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: 'Continue to build events the Protagonist cannot ignore – how do the events conflict with the Ordinary World?',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Show what makes the Protagonist unable to continue in the Ordinary World.',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: "What is the Protagonist's emotional response to the new developing reality?",
                      },
                    ],
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'Breakdown:',
                    bold: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: 'Act 1 makes up the first 25% of the story.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Head in Sand occurs around the 20% mark of the story.',
                      },
                    ],
                  },
                ],
              },
            ],
            tags: [],
            characters: [],
            templates: [],
            positionWithinLine: 0,
            title: 'Head in Sand',
            places: [],
            lineId: 1,
            id: 7,
            color: null,
          },
          {
            tags: [],
            id: 6,
            color: null,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
              },
              {
                children: [
                  {
                    bold: true,
                    text: 'Mid Act 1:',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    italic: true,
                    text: 'Something extraordinarily different happens they can’t ignore. Major setback.',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "The Call to Adventure can be an invitation, a mission, or an event. Whatever form it takes, it cannot be ignored and sets the Protagonist on the path to the New World. This event must be something major that cannot be dismissed and cannot be resolved on its own. The door to the Protagonist's old problems is closed, and they have no choice but to focus on the new issues arising.",
                  },
                ],
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: 'What is the Call to Adventure? For example, it could be the arrival of a mysterious stranger with paranormal abilities, a natural disaster, a kidnapping, etc.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'How does the Call prevent the Protagonist from focusing on their previous goals?',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'With the character and their flaws in mind, how does the Protagonist react to the Call? How do they begin to push back against it?',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: "What is the Protagonist's emotional state in light of the Call? Are they mad or perhaps depressed over having their original plans foiled?",
                      },
                    ],
                  },
                ],
                type: 'bulleted-list',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Breakdown:',
                    bold: true,
                  },
                ],
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: 'Act 1 makes up the first 25% of the story.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Call to Adventure occurs around the 16% mark of the story.',
                      },
                    ],
                  },
                ],
                type: 'bulleted-list',
              },
            ],
            title: 'Call to Adventure',
            templates: [],
            imageId: null,
            places: [],
            characters: [],
            bookId: null,
            positionWithinLine: 0,
            fromTemplateId: null,
            beatId: 5,
            positionInBeat: 0,
            lineId: 1,
          },
          {
            fromTemplateId: null,
            imageId: null,
            id: 4,
            title: 'Grasping at Straws',
            characters: [],
            color: null,
            positionInBeat: 0,
            templates: [],
            places: [],
            lineId: 1,
            tags: [],
            beatId: 4,
            positionWithinLine: 0,
            bookId: null,
            description: [
              {
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    bold: true,
                    text: 'Mid Act 1:',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    italic: true,
                    text: 'Trying to regain control of the Ordinary World, but setbacks mount.',
                  },
                ],
              },
              {
                children: [
                  {
                    text: "Things are really starting to fall apart. Whatever it is the Protagonist wants, they're not having success; while trying to regain control, their problems are worsening. The Protagonist is given a peek into a different world and begins to feel a pull toward something else, and they start to second guess their choices. This development may make them critical of the Ordinary World and their relationships within it. However, they cannot yet be fully honest with themselves and want to maintain control and stay in the Ordinary World.",
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    children: [
                      {
                        text: "Consider the Protagonist's flaw and create new events to distract them from their original goal.",
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'How do these events offer a glimpse of the New World and what is to come?',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: "How does the Protagonist's perspective of the Ordinary World change?",
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'What does the Protagonist do to try to maintain control?',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
                type: 'bulleted-list',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Breakdown:',
                    bold: true,
                  },
                ],
              },
              {
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Act 1 makes up the first 25% of the story.',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Grasping at Straws occurs around the 12% mark of the story.',
                      },
                    ],
                  },
                ],
                type: 'bulleted-list',
              },
            ],
          },
          {
            description: [
              {
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    bold: true,
                    text: 'Early in Act 1:',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    italic: true,
                    text: 'Something unique or strange happens, but they dismiss it. ',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "Something peculiar happens – something that's unusual for the Protagonist in the Ordinary World. It doesn't fit in the Protagonist's main worldview, so they'll probably dismiss it or ignore it. Readers might be clued in, but the Protagonist is too distracted or busy thinking about other things (such as trying to fulfill a want or deal with a problem) to really recognize the full consequences of what this peculiar event means.",
                  },
                ],
              },
              {
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Create an event that foreshadows future problems.',
                      },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Decide upon and portray the distraction(s) for the Protagonist that keeps them from realizing the actual ramifications of the event.',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'To help build tension, consider allowing the reader to fully understand the implications of the peculiar event while the Protagonist remains oblivious.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
                type: 'bulleted-list',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    bold: true,
                    text: 'Breakdown:',
                  },
                ],
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: 'Act 1 makes up the first 25% of the story.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Something Peculiar occurs around the 8% mark of the story.',
                      },
                    ],
                  },
                ],
              },
            ],
            title: 'Something Peculiar',
            id: 3,
            imageId: null,
            beatId: 3,
            characters: [],
            tags: [],
            bookId: null,
            lineId: 1,
            fromTemplateId: null,
            positionWithinLine: 0,
            color: null,
            templates: [],
            places: [],
            positionInBeat: 0,
          },
          {
            imageId: null,
            color: null,
            lineId: 1,
            title: 'Really Bad Day',
            places: [],
            positionWithinLine: 0,
            bookId: null,
            templates: [],
            positionInBeat: 0,
            tags: [],
            beatId: 2,
            characters: [],
            fromTemplateId: null,
            description: [
              {
                children: [
                  {
                    text: '--- Add Your Details Above this Line ---',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'Beginning of Act 1: ',
                    bold: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    italic: true,
                    text: 'Ordinary World, Empathy, Conflict. Flaw and Lack. Want, Problem, Need.',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    text: 'The first chapter introduces the Ordinary World. On this particular day the Protagonist wants something but immediately runs into a problem or a conflict which stops or prevents them from getting it. This allows readers to connect with the Protagonist and shows they are missing something they need to achieve their goal, though they may not be fully aware what that something is.',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'bulleted-list',
                children: [
                  {
                    children: [
                      {
                        text: 'Introduce readers to the Protagonist and their Ordinary World',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: 'Establish a three-dimensional character with flaws, desires, problems, and a unique personality.',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Show the Protagonist behaving as their normal self in the Ordinary World – demonstrate what they want, a problem they have, and hint at what they will need to achieve it.',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'What does the Protagonist need but is not self-aware enough to realize?',
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        text: "What is the Protagonist's character flaw? The shard of glass from years before, healed over, no longer recognized, but still causing harm.",
                      },
                    ],
                    type: 'list-item',
                  },
                ],
              },
              {
                children: [
                  {
                    text: 'Breakdown:',
                    bold: true,
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Act 1 makes up the first 25% of the story.',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Really Bad Day should comprise approximately 4% of the story.',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
                type: 'bulleted-list',
              },
            ],
            id: 1,
          },
        ],
        beats: {
          1: {
            children: {
              2: [],
              3: [],
              4: [],
              5: [],
              6: [],
              7: [],
              8: [],
              9: [],
              10: [],
              11: [],
              12: [],
              13: [],
              14: [],
              15: [],
              16: [],
              17: [],
              18: [],
              19: [],
              20: [],
              21: [],
              22: [],
              23: [],
              24: [],
              25: [],
              26: [],
              null: [
                2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
                25, 26,
              ],
            },
            heap: {
              2: null,
              3: null,
              4: null,
              5: null,
              6: null,
              7: null,
              8: null,
              9: null,
              10: null,
              11: null,
              12: null,
              13: null,
              14: null,
              15: null,
              16: null,
              17: null,
              18: null,
              19: null,
              20: null,
              21: null,
              22: null,
              23: null,
              24: null,
              25: null,
              26: null,
            },
            index: {
              2: {
                title: 'auto',
                templates: [],
                id: 2,
                position: 0,
                time: 0,
                fromTemplateId: null,
                autoOutlineSort: true,
                expanded: true,
                bookId: 1,
              },
              3: {
                bookId: 1,
                position: 1,
                time: 0,
                autoOutlineSort: true,
                id: 3,
                title: 'auto',
                fromTemplateId: null,
              },
              4: {
                fromTemplateId: null,
                title: 'auto',
                id: 4,
                position: 2,
                bookId: 1,
                autoOutlineSort: true,
                time: 0,
              },
              5: {
                title: 'auto',
                position: 3,
                fromTemplateId: null,
                time: 0,
                autoOutlineSort: true,
                id: 5,
                bookId: 1,
              },
              6: {
                title: 'auto',
                fromTemplateId: null,
                id: 6,
                position: 5,
                time: 0,
                bookId: 1,
                autoOutlineSort: true,
              },
              7: {
                autoOutlineSort: true,
                title: 'auto',
                fromTemplateId: null,
                time: 0,
                position: 6,
                bookId: 1,
                id: 7,
              },
              8: {
                fromTemplateId: null,
                time: 0,
                id: 8,
                autoOutlineSort: true,
                title: 'auto',
                position: 7,
                bookId: 1,
              },
              9: {
                title: 'auto',
                fromTemplateId: null,
                id: 9,
                time: 0,
                bookId: 1,
                position: 8,
                autoOutlineSort: true,
              },
              10: {
                fromTemplateId: null,
                id: 10,
                bookId: 1,
                position: 4,
                time: 0,
                autoOutlineSort: true,
                title: 'auto',
              },
              11: {
                position: 10,
                title: 'auto',
                bookId: 1,
                id: 11,
                autoOutlineSort: true,
                time: 0,
                fromTemplateId: null,
              },
              12: {
                autoOutlineSort: true,
                fromTemplateId: null,
                bookId: 1,
                title: 'auto',
                position: 9,
                id: 12,
                time: 0,
              },
              13: {
                fromTemplateId: null,
                id: 13,
                time: 0,
                autoOutlineSort: true,
                title: 'auto',
                position: 11,
                bookId: 1,
              },
              14: {
                time: 0,
                autoOutlineSort: true,
                title: 'auto',
                fromTemplateId: null,
                position: 13,
                bookId: 1,
                id: 14,
              },
              15: {
                title: 'auto',
                time: 0,
                bookId: 1,
                id: 15,
                fromTemplateId: null,
                autoOutlineSort: true,
                position: 12,
              },
              16: {
                id: 16,
                autoOutlineSort: true,
                bookId: 1,
                position: 14,
                fromTemplateId: null,
                time: 0,
                title: 'auto',
              },
              17: {
                time: 0,
                position: 15,
                autoOutlineSort: true,
                bookId: 1,
                fromTemplateId: null,
                title: 'auto',
                id: 17,
              },
              18: {
                title: 'auto',
                bookId: 1,
                id: 18,
                autoOutlineSort: true,
                time: 0,
                position: 16,
                fromTemplateId: null,
              },
              19: {
                title: 'auto',
                autoOutlineSort: true,
                bookId: 1,
                fromTemplateId: null,
                time: 0,
                position: 17,
                id: 19,
              },
              20: {
                position: 24,
                time: 0,
                title: 'auto',
                id: 20,
                bookId: 1,
                fromTemplateId: null,
                autoOutlineSort: true,
                expanded: true,
              },
              21: {
                autoOutlineSort: true,
                time: 0,
                id: 21,
                fromTemplateId: null,
                position: 22,
                bookId: 1,
                title: 'auto',
              },
              22: {
                bookId: 1,
                fromTemplateId: null,
                autoOutlineSort: true,
                time: 0,
                id: 22,
                position: 21,
                title: 'auto',
              },
              23: {
                bookId: 1,
                time: 0,
                id: 23,
                title: 'auto',
                position: 20,
                autoOutlineSort: true,
                fromTemplateId: null,
              },
              24: {
                fromTemplateId: null,
                id: 24,
                position: 19,
                bookId: 1,
                title: 'auto',
                time: 0,
                autoOutlineSort: true,
              },
              25: {
                fromTemplateId: null,
                autoOutlineSort: true,
                time: 0,
                position: 18,
                title: 'auto',
                bookId: 1,
                id: 25,
              },
              26: {
                time: 0,
                autoOutlineSort: true,
                title: 'auto',
                fromTemplateId: null,
                position: 23,
                id: 26,
                bookId: 1,
              },
            },
          },
          series: {
            children: {
              1: [],
              null: [1],
            },
            index: {
              1: {
                time: 0,
                position: 0,
                bookId: 'series',
                id: 1,
                autoOutlineSort: true,
                fromTemplateId: null,
                templates: [],
                title: 'auto',
                expanded: true,
              },
            },
            heap: {
              1: null,
            },
          },
        },
        lines: [
          {
            fromTemplateId: null,
            position: 0,
            bookId: 1,
            color: '#6cace4',
            expanded: null,
            characterId: null,
            title: 'Act 1: Hero & Ordinary World',
            id: 1,
          },
          {
            position: 1,
            expanded: null,
            title: 'Act 2A: Exploring New World',
            id: 3,
            color: '#78be20',
            fromTemplateId: null,
            bookId: 1,
          },
          {
            id: 4,
            expanded: null,
            title: 'Act 2B: Bad Guys Close In',
            fromTemplateId: null,
            color: '#e5554f',
            position: 2,
            bookId: 1,
          },
          {
            id: 5,
            fromTemplateId: null,
            title: 'Act 3: Defeat & Victory',
            bookId: 1,
            color: '#ff7f32',
            position: 3,
            expanded: null,
          },
        ],
        hierarchyLevels: {
          0: {
            textColor: '#0b1117',
            borderStyle: 'NONE',
            name: 'Chapter',
            autoNumber: true,
            dark: {
              borderColor: '#c9e6ff',
              textColor: '#c9e6ff',
            },
            backgroundColor: 'none',
            textSize: 24,
            level: 0,
            light: {
              borderColor: '#6cace4',
              textColor: '#0b1117',
            },
            borderColor: '#6cace4',
          },
        },
        name: '24 Chapter Novel Outline',
        file: {
          version: '2022.2.8',
        },
        id: 'pl31',
      }
      const migrated = migrate(templateFile)
      expect(migrated.hierarchyLevels).toEqual({
        1: {
          0: {
            textColor: '#0b1117',
            borderStyle: 'NONE',
            name: 'Chapter',
            autoNumber: true,
            dark: {
              borderColor: '#c9e6ff',
              textColor: '#c9e6ff',
            },
            backgroundColor: 'none',
            textSize: 24,
            level: 0,
            light: {
              borderColor: '#6cace4',
              textColor: '#0b1117',
            },
            borderColor: '#6cace4',
          },
        },
        series: {
          0: {
            textColor: '#0b1117',
            borderStyle: 'NONE',
            name: 'Chapter',
            autoNumber: true,
            dark: {
              borderColor: '#c9e6ff',
              textColor: '#c9e6ff',
            },
            backgroundColor: 'none',
            textSize: 24,
            level: 0,
            light: {
              borderColor: '#6cace4',
              textColor: '#0b1117',
            },
            borderColor: '#6cace4',
          },
        },
      })
    })
  })
})
