import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where
} from "firebase/firestore";

import { db, auth } from "./firebase";

export async function saveGameResult(result) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be logged in."
    );
  }

  const gameRef =
    collection(db, "gameResults");

  await addDoc(gameRef, {
    userId: user.uid,
    subject:
      result.subject || "",
    topic:
      result.topic || "",
    total:
      Number(result.total) || 0,
    known:
      Number(result.known) || 0,
    unknown:
      Number(result.unknown) || 0,
    score:
      Number(result.score) || 0,
    accuracy:
      Number(result.accuracy) || 0,
    weakTopics:
      result.weakTopics || [],
    createdAt:
      serverTimestamp()
  });
}

export async function getGameResults() {
  const user = auth.currentUser;

  if (!user) {
    return [];
  }

  const gameRef =
    collection(db, "gameResults");

  const gameQuery =
    query(
      gameRef,
      where(
        "userId",
        "==",
        user.uid
      )
    );

  const snapshot =
    await getDocs(gameQuery);

  return snapshot.docs.map(
    (gameDoc) => ({
      id: gameDoc.id,
      ...gameDoc.data()
    })
  );
}