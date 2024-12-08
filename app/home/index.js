import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import app from ".././firebase";
import { logout } from "../../functions/auth";
import "../../global.css";

export default function App() {  
  return (
    <View className="flex w-full h-full justify-center items-center p-16 bg-white">
      <Text className="font-black text-5xl">Beam</Text>
      <Text className="font-semibold text-xl">Home</Text>
      <TouchableOpacity
        className="flex justify-center border border-black p-4 w-1/2 rounded-xl h-12 mt-4"
        onPress={async () => {
          await logout(app);
        }}
      >
        <Text className="text-center">Deslogar</Text>
      </TouchableOpacity>
    </View>
  );
}
