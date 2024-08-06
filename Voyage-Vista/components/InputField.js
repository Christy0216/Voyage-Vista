import { View, Text, TextInput } from 'react-native'
import React from 'react'

export default function InputField({label, value, onChangeText, placeholder, secure}) {
  return (
    <View>
      <Text>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secure}
      />
    </View>
  )
}