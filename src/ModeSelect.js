import React, { useState } from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

export default function ModeSelect({ name, mode, setMode, options }) {
  const handleChange = (event) => {
    console.log('mode select', event.target.value)
    setMode(event.target.value);
  };

  return (
    <div>
      <InputLabel id='demo-simple-select-label'>{name} Mode</InputLabel>
      <Select
        labelId='demo-simple-select-label'
        id='demo-simple-select'
        value={mode}
        onChange={handleChange}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </Select>
    </div>
  );
}
