"use client";

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' }
];

const BLUE = '#2563eb';

export function LanguagePicker() {
  const { language, setLanguage } = useLanguage();

  const handleChange = (event: SelectChangeEvent<string>) => {
    setLanguage(event.target.value as 'en' | 'es' | 'fr' | 'de' | 'ja');
  };

  return (
    <Select
      value={language}
      onChange={handleChange}
      variant="outlined"
      size="small"
      MenuProps={{
        PaperProps: {
          elevation: 2,
          sx: {
            backgroundColor: 'white',
            mt: 0.5,
            '& .MuiList-root': {
              padding: 0,
              backgroundColor: 'white',
            },
            '& .MuiMenuItem-root': {
              minHeight: 40,
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: alpha(BLUE, 0.2),
              },
              '&.Mui-selected': {
                backgroundColor: BLUE,
                color: 'white',
                '&:hover': {
                  backgroundColor: BLUE,
                },
              },
            },
          },
        },
      }}
      sx={{
        minWidth: 150,
        backgroundColor: 'white',
        '& .MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(0, 0, 0, 0.12)',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(0, 0, 0, 0.24)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: BLUE,
        },
      }}
    >
      {languages.map((lang) => (
        <MenuItem 
          key={lang.code} 
          value={lang.code}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <span style={{ fontSize: '1.2em' }}>{lang.flag}</span>
          <span>{lang.name}</span>
        </MenuItem>
      ))}
    </Select>
  );
} 