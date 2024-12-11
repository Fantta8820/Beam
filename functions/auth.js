import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"; // Funcionalidades de autenticação do Firebase
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"; // Funcionalidade do Firestore
import { router } from "expo-router"; // Router para rediresionar para outra página

// Função de cadastro
export async function signUp(app, email, password, name) {
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    // Cria o usuário no Firebase Authentication
    const user = await createUserWithEmailAndPassword(auth, email, password);

    // Cria o usuário no Firestore
    await setDoc(doc(db, "users", user.user.uid), {
      name: name,
      email: user.user.email,
      isTyping: false,
    });

    router.replace("/home/");
  } catch (err) {
    console.log(err.code);

    return err.code;
  }
}

// Função de login
export async function signIn(app, email, password) {
  const auth = getAuth(app);

  try {
    // Tentar logar com as credenciais do usuário
    await signInWithEmailAndPassword(auth, email, password);

    router.replace("/home/");
  } catch (err) {
    console.log(err.code);

    return err.code;
  }
}

// Função para analisar erros de login e registro
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

// Função de deslogar
export async function logout(app) {
  const auth = getAuth(app);

  try {
    await signOut(auth);

    router.replace("/");
  } catch (err) {
    console.log(err.code);
  }
}

// Função para pegar o usuário através do ID
export async function getUserByUid(app, uid) {
  const db = getFirestore(app);

  // Analise se existe algum usuário na coleção users com o uid disponibilizado
  const docRef = doc(db, "users", uid);
  const userValue = await getDoc(docRef);

  if (userValue.exists()) {
    return userValue.data().name;
  }

  return "Usuário não encontrado";
}
