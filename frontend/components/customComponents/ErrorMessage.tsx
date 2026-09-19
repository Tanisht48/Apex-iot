import React from 'react';

interface ErrorMessageProps {
  hasError: boolean;
  errorMessage: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ hasError, errorMessage }) =>
  hasError ? (
    <div>
      <span>{errorMessage}</span>
    </div>
  ) : (
    <div />
  );

export default ErrorMessage;