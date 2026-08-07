"use client";

import React, { forwardRef } from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectProps } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export type AppSelectProps = SelectProps & {
  options: SelectOption[];
  helperText?: string;
  placeholder?: string;
};

const AppSelect = forwardRef<HTMLDivElement, AppSelectProps>(
  ({ label, options, helperText, error, placeholder, fullWidth = true, size = "medium", id, ...props }, ref) => {
    const labelId = id ? `${id}-label` : undefined;

    return (
      <FormControl fullWidth={fullWidth} error={error} size={size} ref={ref}>
        {label && <InputLabel id={labelId}>{label}</InputLabel>}
        <Select
          labelId={labelId}
          id={id}
          label={label}
          sx={{
            borderRadius: 0,
            ...props.sx,
          }}
          {...props}
        >
          {placeholder && (
            <MenuItem value="" disabled>
              <em>{placeholder}</em>
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

AppSelect.displayName = "AppSelect";

export default AppSelect;
