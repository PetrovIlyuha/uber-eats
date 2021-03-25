import React from 'react'

interface FormErrorProps {
  message: string;
}

interface MessagesMap {
  [name: string]: string;
}

const messages: MessagesMap = {
  notStrongPassword: "Strong password should include one of special characters !@#, at least 1 Capital letter and one numerical value",
  shortPassword: "Password must be at least 8 characters long"
}

const FormError: React.FC<FormErrorProps> = ({message}) => {
  return (
    <span className="font-medium text-red-400">
      {messages[message] ? messages[message] : message}
    </span>
  )
}

export default FormError
