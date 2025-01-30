import { defineFunction } from '@aws-amplify/backend';

export const feedbackProcessor = defineFunction({
  name: 'feedbackProcessor',
  entry: './handler.ts'
}); 