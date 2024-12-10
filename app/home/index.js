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
} from "firebase/firestore";
import { getUserByUid, logout } from "../../functions/auth";
import { sendMessage } from "../../functions/message";
import { router } from "expo-router";
import "../../global.css";

export default function App() {
  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/");
      } else {
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

    return () => unsubscribe();
  }, []);

  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);

  const messageRef = useRef(null);
  let flatListRef = useRef(null);

  return (
    <View className="w-full h-full bg-white">
      <View className="w-full h-[10%] flex flex-row justify-around items-center border border-b-2 border-0 border-gray py-4">
        <Text className="font-black text-2xl">Beam - Home</Text>
        <TouchableOpacity
          className="flex justify-center border border-black w-32 rounded-xl h-12"
          onPress={async () => {
            await logout(app);
          }}
        >
          <Text className="text-center text-sm">Deslogar</Text>
        </TouchableOpacity>
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
            onChangeText={(value) => setMessage(value)}
          />
          <TouchableOpacity
            className="flex justify-center items-center border border-l-2 border-0 border-l-black w-2/12 h-12 bg-white"
            onPress={async () => {
              await sendMessage(app, message, user);
              messageRef.current?.blur();
              setMessage("");
            }}
          >
            <Text className="text-center">Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
