import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import app from "../firebase";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { signIn, analyzeError } from "../../functions/auth";
import { router } from "expo-router";
import "../../global.css";

export default function App() {
  useEffect(() => {
    // Configuração para analisar se existe um usuário logado
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Redireciona para a página inicial se o usuário estiver logado
        router.replace("/home/");
      }
    });

    // Retorna a função de unsubscribe para limpar a escuta quando o componente for desmontado
    return unsubscribe;
  }, []);

  const [email, setEmail] = useState(""); // Armazena o email do usuário
  const [password, setPassword] = useState(""); // Armazena a senha do usuário
  const [showPassword, setShowPassword] = useState(false); // Controla se a senha deve ser mostrada
  const [error, setError] = useState(""); // Armazena possíveis erros de autenticação

  return (
    <View className="flex w-full h-full justify-center items-center p-16 bg-white">
      {/* Formulário de Login */}
      <Text className="font-black text-5xl">Beam</Text>
      <Text className="font-semibold text-xl">Entrar</Text>
      <TextInput
        placeholder="Email"
        className="w-full text-center border border-black my-4 rounded-xl caret-gray-300"
        value={email}
        onChangeText={(value) => setEmail(value)}
      />
      <TextInput
        placeholder="Senha"
        value={password}
        secureTextEntry={!showPassword}
        className="w-full text-center border border-black rounded-xl caret-gray-300"
        onChangeText={(value) => setPassword(value)}
      />
      <Text
        onPress={() => setShowPassword(!showPassword)}
        className="text-xs mt-1 mb-4"
      >
        {!showPassword ? "Mostrar" : "Ocultar"} senha
      </Text>
      <TouchableOpacity
        className="w-full flex justify-center bg-black h-12 rounded-xl"
        onPress={async () => {
          const error = await signIn(app, email, password);

          setError(analyzeError(error));
        }}
      >
        <Text className="text-center text-white">Entrar</Text>
      </TouchableOpacity>
      <Link className="mt-4" href="/">
        <Text className="text-blue-400 text-center">
          Não possui uma conta? Criar.
        </Text>
      </Link>
      <Text className="font-semibold text-red-500 text-center mt-4">
        {error}
      </Text>
    </View>
  );
}
