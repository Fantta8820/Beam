import {
  getFirestore,
  doc,
  setDoc,  
  serverTimestamp
} from "firebase/firestore";

export async function sendMessage(app, message, user) {
  const db = getFirestore(app);

  try {
    await setDoc(doc(db, "messages", `${user}_${new Date()}`), {
      message: message,
      user: user,
      sendAt: serverTimestamp()
    });

    console.log("Success");
  } catch (err) {
    console.log(err);
  }
}
