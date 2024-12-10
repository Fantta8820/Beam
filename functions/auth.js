import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { router } from "expo-router";

export async function signUp(app, email, password, name) {
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    const user = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", user.user.uid), {
      name: name,
      email: user.user.email,
    });

    router.replace("/home/");
  } catch (err) {
    console.log(err.code);

    return err.code;
  }
}

export async function signIn(app, email, password) {
  const auth = getAuth(app);

  try {
    await signInWithEmailAndPassword(auth, email, password);

    router.replace("/home/");
  } catch (err) {
    console.log(err.code);

    return err.code;
  }
}

export function analyzeError(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email":
      return "O e-mail inserido é inválido.";
    case "auth/email-already-in-use":
      return "Este e-mail já está em uso.";
    case "auth/weak-password":
      return "A senha deve ter pelo menos 6 caracteres.";
    case "auth/invalid-credential":
      return "Credenciais inválidas.";
    default:
      return "Ocorreu um erro inesperado. Tente novamente.";
  }
}

export async function logout(app) {
  const auth = getAuth(app);

  try {
    await signOut(auth);

    router.replace("/");
  } catch (err) {
    console.log(err.code);
  }
}

export async function getUserByUid(app, uid) {
  const db = getFirestore(app);

  const docRef = doc(db, "users", uid);
  const userValue = await getDoc(docRef);

  if (userValue.exists()) {
    return userValue.data().name;
  }

  return "Usuário não encontrado";
}
