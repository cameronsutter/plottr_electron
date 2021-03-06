import React from 'react'
import { mount } from 'enzyme'

import RichTextEditor from '../RichTextEditor'

describe('links', () => {
  it('should be rendered with href attributes', () => {
    const html = mount(
      <RichTextEditor
        recentFonts={['Forum']}
        fonts={['Forum', 'IBM Plex Serif', 'Lato', 'Yellowtail']}
        text={[
          {
            children: [
              { text: '"A single man in possession of good fortune must be in want of a wife."' },
            ],
            type: 'paragraph',
          },
          {
            children: [{ text: 'https://www.google.com' }],
            type: 'link',
            url: 'https://www.google.com',
          },
        ]}
      />
    )

    expect(
      html.find('a').filterWhere((item) => item.prop('href') === 'https://www.google.com')
    ).toHaveLength(1)
  })
})
