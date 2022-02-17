export default {
  type: "object",
  properties: {
    folder: { type: 'string' },
    bucketName: { type: 'string' }
  },
  // required: ['name']
} as const;
