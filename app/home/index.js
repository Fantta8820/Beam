import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import app from ".././firebase";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { getUserByUid, logout } from "../../functions/auth";
import { sendMessage, handleMessage } from "../../functions/message";
import { router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import "../../global.css";

export default function App() {
  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/");
      } else {
        setUserUID(currentUser.uid);
        setUser(await getUserByUid(app, currentUser.uid));
      }
    });

    const unsubscribe = onSnapshot(
      query(collection(db, "messages"), orderBy("sendAt", "asc")),
      (snapshot) => {
        let allMessages = [];

        snapshot.docs.map((doc) => {
          allMessages.push(doc.data());
        });

        setAllMessages(allMessages);
      }
    );

    const unsubscribeUser = onSnapshot(
      query(collection(db, "users"), where("isTyping", "==", true)),
      (snapshot) => {
        let usersTyping = [];

        snapshot.docs.map((doc) => {
          if (doc.data().name !== user) {
            usersTyping.push(doc.data());
          }
        });

        setUsersTyping(usersTyping);
      }
    );

    return () => {
      unsubscribe();
      unsubscribeUser();
    };
  }, [user]);

  const [user, setUser] = useState("");
  const [userUID, setUserUID] = useState("");
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [usersTyping, setUsersTyping] = useState([]);

  const messageRef = useRef(null);
  let flatListRef = useRef(null);

  return (
    <View className="w-full h-full bg-white">
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
