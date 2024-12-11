import React, { useEffect, useState, useRef } from "react"; // Funcionalidades básicas do React
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import app from "../firebase"; // Configuração do Firebase
import { onAuthStateChanged, getAuth } from "firebase/auth"; // Funcionalidades de autenticação do Firebase
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore"; // Funcionalidades do Firestore
import { getUserByUid, logout } from "../../functions/auth"; // Funções de autenticação
import { sendMessage, handleMessage } from "../../functions/message"; // Funções de mensagens
import { router } from "expo-router"; // Router para rediresionar para outras páginas
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"; // ícone
import Ionicons from "@expo/vector-icons/Ionicons"; // ícone

export default function App() {
  const [user, setUser] = useState(""); // Estado do usuário atual

  useEffect(() => {
    // Configuração inicial do Firebase
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Análise da existência de um usuário
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/");
      } else {
        setUserUID(currentUser.uid); // Define o ID do usuário atual
        setUser(await getUserByUid(app, currentUser.uid)); // Define as informações do usuário atual
      }
    });

    // Analisa a chegada de novas mensagens
    const unsubscribeMessages = onSnapshot(
      query(collection(db, "messages"), orderBy("sendAt", "asc")),
      (snapshot) => {
        // Atualiza o estado com as novas mensagens
        setAllMessages(snapshot.docs.map((doc) => doc.data()));
      }
    );

    // Analisa se existe usuários digitando
    const unsubscribeUsersTyping = onSnapshot(
      query(collection(db, "users"), where("isTyping", "==", true)),
      (snapshot) => {
        // Atualiza o estado com usuários que estão digitando
        setUsersTyping(
          snapshot.docs
            .filter((doc) => doc.data().name !== user)
            .map((doc) => doc.data())
        );
      }
    );

    return () => {
      // Limpa os listeners quando o componente é desmontado
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeUsersTyping) unsubscribeUsersTyping();
    };
  }, [user, router]); // Dependências do useEffect

  const [userUID, setUserUID] = useState(""); // ID do usuário atual
  const [message, setMessage] = useState(""); // Mensagem atual
  const [allMessages, setAllMessages] = useState([]); // Todas as mensagens
  const [usersTyping, setUsersTyping] = useState([]); // Usuários que estão digitando

  const messageRef = useRef(null); // Referência ao input de mensagem
  let flatListRef = useRef(null); // Referência a lista de mensagens

  return (
    // Código da página
    <View className="w-full h-full bg-white">
      {/* Header da Página */}
      <View className="w-full h-32 border border-b-2 border-0 border-gray py-4">
        <View className="flex flex-col justify-center items-center">
          <Text className="font-black text-xl">Beam - Home</Text>
          <TouchableOpacity
            className="flex flex-row items-center justify-center h-12 gap-2"
            onPress={async () => {
              await logout(app);
            }}
          >
            <MaterialCommunityIcons name="exit-run" size={20} color="black" />
            <Text>Sair</Text>
          </TouchableOpacity>
        </View>
        {usersTyping.length === 1 ? (
          <Text className="text-center font-thin">
            {usersTyping[0].name} está digitando...
          </Text>
        ) : usersTyping.length === 2 ? (
          <Text className="text-center font-thin">
            {usersTyping[0].name} e {usersTyping[1].name} estão digitando
          </Text>
        ) : usersTyping.length > 2 ? (
          <Text className="text-center font-thin">
            {usersTyping[0].name}, {usersTyping[1].name} e mais{" "}
            {usersTyping.length - 2} estão digitando
          </Text>
        ) : (
          <Text className="text-center font-thin">
            Seja bem vindo ao nosso chat global
          </Text>
        )}
      </View>
      {/* Mensagens */}
      <View className="w-full flex-1">
        {allMessages.length > 0 ? (
          <FlatList
            data={allMessages}
            renderItem={({ item }) => (
              <View className="mr-16 ml-4 flex flex-row">
                <Text
                  className={`text-lg text-justify ${
                    item.user !== user ? "text-red-500" : "text-blue-300"
                  }`}
                >
                  {item.user}:{" "}
                </Text>
                <Text className="text-lg text-justify">{item.message}</Text>
              </View>
            )}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 48 }}
            ref={(ref) => (flatListRef = ref)}
            onContentSizeChange={() => flatListRef.scrollToEnd()}
            onLayout={() => flatListRef.scrollToEnd()}
          />
        ) : (
          <Text className="text-lg text-center text-gray-500">
            Nenhuma mensagem foi enviada ainda
          </Text>
        )}
      </View>
      {/* Input de mensagem */}
      <View className="w-full flex justify-end items-end absolute inset-x-0 bottom-0 h-[10%]">
        <View className="flex flex-row justify-around items-center w-full text-center border border-black caret-gray-300">
          <TextInput
            placeholder="Mensagem"
            ref={messageRef}
            className="w-10/12 h-12 pl-4 bg-white"
            value={message}
            onChangeText={(value) => {
              setMessage(value);
              handleMessage(app, value, userUID, false);
            }}
            onBlur={() => handleMessage(app, message, userUID, true)}
          />
          <TouchableOpacity
            className="flex flex-row gap-4 justify-center items-center w-2/12 h-12 bg-white"
            onPress={async () => {
              if (message.length > 0) {
                await sendMessage(app, message, user);
                messageRef.current?.blur();
                setMessage("");
              }
            }}
          >
            <Ionicons name="send" size={16} color="gray" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
