import { isEmpty } from '../isEmpty'

describe('isEmpty', () => {
  describe('given a null or undefined text value', () => {
    it('should produce true', () => {
      expect(isEmpty(null)).toBeTruthy()
      expect(isEmpty(undefined)).toBeTruthy()
    })
  })
  describe('given an empty array', () => {
    it('should produce true', () => {
      expect(isEmpty([])).toBeTruthy()
    })
  })
  describe('given an array with an empty first paragraph', () => {
    describe('and a subsequent paragraph that has text', () => {
      it('should produce false', () => {
        expect(
          isEmpty([
            {
              children: [
                {
                  text: '',
                },
              ],
              type: 'paragraph',
            },
            {
              children: [
                {
                  text: 'Hi there!',
                },
              ],
              type: 'paragraph',
            },
          ])
        ).toBeFalsy()
      })
    })
    describe('and a nested paragraph that has text', () => {
      it('should produce false', () => {
        expect(
          isEmpty([
            {
              children: [
                {
                  children: [
                    {
                      text: 'Hi there!',
                    },
                  ],
                  type: 'paragraph',
                },
              ],
              type: 'paragraph',
            },
          ])
        ).toBeFalsy()
      })
      describe('and that paragraph is not the first of the nested paragraphs', () => {
        expect(
          isEmpty([
            {
              children: [
                {
                  children: [
                    {
                      text: '',
                    },
                  ],
                  type: 'paragraph',
                },
                {
                  children: [
                    {
                      text: 'Hi there!',
                    },
                  ],
                  type: 'paragraph',
                },
              ],
              type: 'paragraph',
            },
          ])
        ).toBeFalsy()
      })
    })
    describe('and subsequent paragraphs that are also empty', () => {
      it('should produce true', () => {
        expect(
          isEmpty([
            {
              children: [
                {
                  text: '',
                },
              ],
              type: 'paragraph',
            },
            {
              children: [
                {
                  text: '',
                },
              ],
              type: 'paragraph',
            },
          ])
        ).toBeTruthy()
      })
    })
  })
  describe('given a test case from the wild', () => {
    describe('that is not empty', () => {
      it('should produce false', () => {
        const TEST_CASE_FROM_THE_WILD = [
          {
            children: [
              {
                text: '',
              },
            ],
            type: 'paragraph',
          },
          {
            type: 'paragraph',
            children: [
              {
                text: 'ff',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                text: '',
              },
            ],
          },
          {
            children: [
              {
                text: 'dvvs',
              },
            ],
            type: 'paragraph',
          },
          {
            children: [
              {
                text: '',
              },
            ],
            type: 'paragraph',
          },
          {
            children: [
              {
                text: '',
              },
            ],
            type: 'paragraph',
          },
          {
            children: [
              {
                text: '',
              },
            ],
            type: 'paragraph',
          },
          {
            children: [
              {
                text: '',
              },
              {
                type: 'link',
                url: 'https://getplottr.com/our-roadmap',
                children: [
                  {
                    text: '',
                  },
                ],
              },
              {
                text: '',
              },
            ],
          },
        ]
        expect(isEmpty(TEST_CASE_FROM_THE_WILD)).toBeFalsy()
      })
    })
  })
})
