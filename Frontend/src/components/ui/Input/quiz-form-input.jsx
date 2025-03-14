import React, { forwardRef } from "react";
import { TextInput } from ".";

export const QuizFormInput = forwardRef((props, ref) => {
  return (
    <TextInput
      ref={ref}
      {...props}
      style={{
        borderRadius: 8,
      }}
      labelStyle={{
        marginBottom: 2,
      }}
    />
  );
});
