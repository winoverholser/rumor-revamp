export default {
    name: 'iFrameLink',
    title: 'iFrame Link',
    type: 'document',
    fields: [
      {
        name: 'title',
        title: 'Title',
        type: 'string',
      },
      {
        name: 'url',
        title: 'URL',
        type: 'url'
      },
      {
          name: 'thumb',
          title: 'Thumbnail',
          type: 'image'
      },
      {
          name: 'thumbHover',
          title: 'Hover Thumbnail',
          type: 'image'
      }
    ],
  }