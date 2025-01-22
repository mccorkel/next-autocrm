import { Theme } from '@aws-amplify/ui-react';

export const theme: Theme = {
  name: 'auto-crm-theme',
  tokens: {
    colors: {
      background: {
        primary: { value: '#F0F8FF' },  // Light blue background
        secondary: { value: '#FFFFFF' }  // White for cards
      },
      font: {
        primary: { value: '#333333' },  // Dark grey for text
        secondary: { value: '#666666' }, // Medium grey for secondary text
        interactive: { value: '#1E90FF' } // Bright blue for interactive elements
      },
      border: {
        primary: { value: '#000000' },   // Black for borders
        secondary: { value: '#CCCCCC' }  // Light grey for secondary borders
      }
    },
    components: {
      card: {
        backgroundColor: { value: '{colors.background.secondary}' },
        borderColor: { value: '{colors.border.primary}' },
        borderWidth: { value: '1px' }
      },
      heading: {
        color: { value: '{colors.font.primary}' }
      },
      text: {
        color: { value: '{colors.font.primary}' }
      },
      button: {
        primary: {
          backgroundColor: { value: '{colors.font.interactive}' },
          color: { value: '{colors.background.secondary}' }
        },
        link: {
          color: { value: '{colors.font.interactive}' }
        }
      },
      table: {
        borderColor: { value: '{colors.border.primary}' },
        head: {
          backgroundColor: { value: '{colors.background.primary}' },
          color: { value: '{colors.font.primary}' }
        },
        body: {
          color: { value: '{colors.font.primary}' }
        }
      },
      field: {
        label: {
          color: { value: '{colors.font.primary}' }
        }
      }
    }
  }
}; 