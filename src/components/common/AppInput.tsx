"use client";

import React, { forwardRef } from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

export type AppInputProps = Omit<TextFieldProps, "variant"> & {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
};

const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ startAdornment, endAdornment, InputProps, ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        variant="outlined"
        fullWidth
        size="medium"
        InputProps={{
          ...InputProps,
          startAdornment: startAdornment ? (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ) : (
            InputProps?.startAdornment
          ),
          endAdornment: endAdornment ? (
            <InputAdornment position="end">{endAdornment}</InputAdornment>
          ) : (
            InputProps?.endAdornment
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 0,
          },
          ...props.sx,
        }}
        {...props}
      />
    );
  }
);

AppInput.displayName = "AppInput";

export default AppInput;
