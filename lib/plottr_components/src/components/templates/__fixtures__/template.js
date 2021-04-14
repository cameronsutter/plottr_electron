export function customTemplate(overrides = {}) {
  return {
    id: 'pl28c903',
    type: 'plotlines',
    name: 'This is awesome!',
    description: 'Yeah yeah yeah!',
    link: '',
    ...overrides,
    templateData: {
      chapters: [
        {
          id: 2,
          bookId: 1,
          position: 0,
          title: 'auto',
          time: 0,
          autoOutlineSort: true,
          fromTemplateId: 'proj1',
        },
      ],
      cards: [
        {
          id: 3,
          lineId: 1,
          chapterId: 10,
          beatId: null,
          seriesLineId: null,
          bookId: null,
          positionWithinLine: 0,
          positionInChapter: 0,
          title: 'Third Disaster',
          description: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'description',
                },
              ],
            },
          ],
          tags: [],
          characters: [],
          places: [],
          templates: [],
          imageId: null,
          fromTemplateId: 'proj1',
        },
      ],
      ...overrides.templateData,
    },
  }
}
