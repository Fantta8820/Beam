import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"; // Funcionalidades do Firestore

// Função para mandar mensagens
export async function sendMessage(app, message, user) {
  const db = getFirestore(app);

  try {
    // Tenta inserir um novo documento na coleção de mensagens
    await setDoc(doc(db, "messages", `${user}_${new Date()}`), {
      message: message,
      user: user,
      sendAt: serverTimestamp(),
    });
  } catch (err) {
    console.log(err);
  }
}

// Função para analisar uma mensagem
export async function handleMessage(app, message, uid, blur) {
  const db = getFirestore(app);

  // Analise se o usuário está digitando ou não
  if (message.length > 0 && !blur) {
    try {
      await updateDoc(doc(db, "users", uid), {
        isTyping: true,
      });
    } catch (err) {
      console.log(err);
    }
  } else {
    try {
      await updateDoc(doc(db, "users", uid), {
        isTyping: false,
      });
    } catch (err) {
      console.log(err);
    }
  }
}
