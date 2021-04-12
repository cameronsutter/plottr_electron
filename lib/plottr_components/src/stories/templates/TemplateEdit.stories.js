import React from 'react'

import TemplateEdit from '../../components/templates/TemplateEdit'

export default {
  title: 'Plottr/templates/TemplateEdit',
  component: TemplateEdit,
  argTypes: {
    darkMode: { control: 'boolean' },
  },
}

const TEMPLATE = {
  id: 'pl1',
  type: 'plotlines',
  name: '7 Point Plot Structure',
  description: 'A plot structure by Dan Wells',
  version: '2021.2.19',
  templateData: {
    cards: [
      {
        id: 1,
        lineId: 1,
        beatId: 7,
        seriesLineId: null,
        bookId: null,
        positionWithinLine: 0,
        positionInChapter: 0,
        title: 'Hook',
        description: [
          {
            children: [
              {
                text: '',
              },
            ],
          },
        ],
        tags: [],
        characters: [],
        places: [],
        templates: [],
        imageId: null,
        fromTemplateId: null,
      },
      {
        id: 2,
        lineId: 1,
        beatId: 6,
        seriesLineId: null,
        bookId: null,
        positionWithinLine: 0,
        positionInChapter: 0,
        title: 'Plot Turn 1',
        description: [
          {
            children: [
              {
                text: '',
              },
            ],
          },
        ],
        tags: [],
        characters: [],
        places: [],
        templates: [],
        imageId: null,
        fromTemplateId: null,
      },
      {
        id: 3,
        lineId: 1,
        beatId: 5,
        seriesLineId: null,
        bookId: null,
        positionWithinLine: 0,
        positionInChapter: 0,
        title: 'Pinch 1',
        description: [
          {
            children: [
              {
                text: '',
              },
            ],
          },
        ],
        tags: [],
        characters: [],
        places: [],
        templates: [],
        imageId: null,
        fromTemplateId: null,
      },
      {
        id: 4,
        lineId: 1,
        beatId: 4,
        seriesLineId: null,
        bookId: null,
        positionWithinLine: 0,
        positionInChapter: 0,
        title: 'Midpoint',
        description: [
          {
            children: [
              {
                text: '',
              },
            ],
          },
        ],
        tags: [],
        characters: [],
        places: [],
        templates: [],
        imageId: null,
        fromTemplateId: null,
      },
      {
        id: 5,
        lineId: 1,
        beatId: 3,
        seriesLineId: null,
        bookId: null,
        positionWithinLine: 0,
        positionInChapter: 0,
        title: 'Pinch 2',
        description: [
          {
            children: [
              {
                text: '',
              },
            ],
          },
        ],
        tags: [],
        characters: [],
        places: [],
        templates: [],
        imageId: null,
        fromTemplateId: null,
      },
      {
        id: 6,
        lineId: 1,
        beatId: 2,
        seriesLineId: null,
        bookId: null,
        positionWithinLine: 0,
        positionInChapter: 0,
        title: 'Plot Turn 2',
        description: [
          {
            children: [
              {
                text: '',
              },
            ],
          },
        ],
        tags: [],
        characters: [],
        places: [],
        templates: [],
        imageId: null,
        fromTemplateId: null,
      },
      {
        id: 7,
        lineId: 1,
        beatId: 1,
        seriesLineId: null,
        bookId: null,
        positionWithinLine: 0,
        positionInChapter: 0,
        title: 'Resolution',
        description: [
          {
            children: [
              {
                text: '',
              },
            ],
          },
        ],
        tags: [],
        characters: [],
        places: [],
        templates: [],
        imageId: null,
        fromTemplateId: null,
      },
    ],
    beats: [
      {
        id: 1,
        bookId: 1,
        position: 6,
        title: 'auto',
        time: 0,
        templates: [],
        autoOutlineSort: true,
        fromTemplateId: null,
      },
      {
        id: 2,
        bookId: 1,
        position: 5,
        title: 'auto',
        time: 0,
        templates: [],
        autoOutlineSort: true,
        fromTemplateId: null,
      },
      {
        id: 3,
        bookId: 1,
        position: 4,
        title: 'auto',
        time: 0,
        templates: [],
        autoOutlineSort: true,
        fromTemplateId: null,
      },
      {
        id: 4,
        bookId: 1,
        position: 3,
        title: 'auto',
        time: 0,
        templates: [],
        autoOutlineSort: true,
        fromTemplateId: null,
      },
      {
        id: 5,
        bookId: 1,
        position: 2,
        title: 'auto',
        time: 0,
        templates: [],
        autoOutlineSort: true,
        fromTemplateId: null,
      },
      {
        id: 6,
        bookId: 1,
        position: 1,
        title: 'auto',
        time: 0,
        templates: [],
        autoOutlineSort: true,
        fromTemplateId: null,
      },
      {
        id: 7,
        bookId: 1,
        position: 0,
        title: 'auto',
        time: 0,
        templates: [],
        autoOutlineSort: true,
        fromTemplateId: null,
      },
    ],
    lines: [
      {
        id: 1,
        bookId: 1,
        color: '#6cace4',
        title: 'Main Plot',
        position: 0,
        characterId: null,
        expanded: null,
        fromTemplateId: null,
      },
      {
        id: 2,
        bookId: 'series',
        color: '#6cace4',
        title: 'Main Plot',
        position: 0,
        characterId: null,
        expanded: null,
        fromTemplateId: null,
      },
    ],
  },
}

const Template = (args) => (
  <TemplateEdit {...args} cancel={() => {}} saveEdit={() => {}} template={TEMPLATE} />
)

export const Example = Template.bind({})
Example.args = {
  darkMode: false,
}
