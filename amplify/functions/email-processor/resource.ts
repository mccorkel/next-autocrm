import { defineFunction } from '@aws-amplify/backend';

export const emailProcessor = defineFunction({
  name: 'emailProcessor',
  entry: './handler.ts'
}); 