import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function sendMessage(app, message, user) {
  const db = getFirestore(app);

  try {
    await setDoc(doc(db, "messages", `${user}_${new Date()}`), {
      message: message,
      user: user,
      sendAt: serverTimestamp(),
    });

    console.log("Success");
  } catch (err) {
    console.log(err);
  }
}

export async function handleMessage(app, message, uid, blur) {
  const db = getFirestore(app);

  if (message.length > 0 && !blur) {
    try {
      await updateDoc(doc(db, "users", uid), {
        isTyping: true,
      });

      console.log("Success");
    } catch (err) {
      console.log(err);
    }
  } else {
    try {
      await updateDoc(doc(db, "users", uid), {
        isTyping: false,
      });

      console.log("Success");
    } catch (err) {
      console.log(err);
    }
  }
}
