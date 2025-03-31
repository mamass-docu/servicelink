import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  getCountFromServer,
  where,
  serverTimestamp,
  orderBy,
  setDoc,
} from "firebase/firestore";
import { db } from "../db/firebase";
import store from "../state/store";
import {
  openLoading,
  closeLoading,
  openSpecificLoading,
  closeSpecificLoading,
} from "../state/loadingSlice";
import { useSelector } from "react-redux";

const setIsLoading = (loading) => {
  store.dispatch(loading ? openLoading() : closeLoading());
};

const loadingProcess = async (processFunction, onError = null) => {
  try {
    store.dispatch(openLoading());
    await processFunction();
  } catch (e) {
    console.log("error in loading process", e);
    if (onError != null) onError(e);
  } finally {
    store.dispatch(closeLoading());
  }
};

const specificLoadingProcess = async (processFunction, onError = null) => {
  try {
    store.dispatch(openSpecificLoading());
    await processFunction();
  } catch (e) {
    console.log("error in specific loading process", e);
    if (onError != null) onError(e);
  } finally {
    store.dispatch(closeSpecificLoading());
  }
};

const find = async (collectionName, uid) => {
  return await getDoc(doc(db, collectionName, uid));
};

const all = async (collectionName) => {
  return await getDocs(collection(db, collectionName));
};

const get = async (collectionName, ...whereCond) => {
  return await getDocs(query(collection(db, collectionName), ...whereCond));
};

const set = async (collectionName, uid, data) => {
  return await setDoc(doc(db, collectionName, uid), data, { merge: true });
};

const add = async (collectionName, data) => {
  return await addDoc(collection(db, collectionName), data);
};

const update = async (collectionName, uid, data) => {
  await updateDoc(doc(db, collectionName, uid), data);
};

const remove = async (collectionName, uid) => {
  await deleteDoc(doc(db, collectionName, uid));
};

const count = async (collectionName, ...whereCond) => {
  const snap = await getCountFromServer(
    query(collection(db, collectionName), ...whereCond)
  );

  return snap.data().count;
};

const addNotif = (receiverId, title, body, screen, params) => {
  let data = {
    receiverId: receiverId,
    title: title,
    body: body,
    screen: screen,
    // seen: false,
    prompt: false,
    sentAt: serverTimestamp(),
  };
  if (params) data["params"] = params;
  addDoc(collection(db, "notifications"), data);
};

const addNotifWhenHasNotif = (receiverId, key, title, body, screen, params) => {
  getDoc(doc(db, "settings", receiverId)).then((snap) => {
    if (snap.exists() && snap.data()[key]) {
      let data = {
        receiverId: receiverId,
        title: title,
        body: body,
        screen: screen,
        // seen: false,
        prompt: false,
        sentAt: serverTimestamp(),
      };
      if (params) data["params"] = params;
      addDoc(collection(db, "notifications"), data);
    }
  });
};

const setNotifPrompt = (id) => {
  updateDoc(doc(db, "notifications", id), { prompt: true });
};

const updateAllAsSeen = (userId, screen) => {
  get(
    "notifications",
    where("receiverId", "==", userId),
    where("screen", "==", screen)
  ).then(({ docs }) =>
    docs.forEach((item) => {
      deleteDoc(doc(db, "notifications", item.id));
    })
  );
  // get(
  //   "notifications",
  //   where("receiverId", "==", userId),
  //   where("screen", "==", screen),
  //   where("seen", "==", false)
  // ).then(({ docs }) =>
  //   docs.forEach((item) => {
  //     updateDoc(doc(db, "notifications", item.id), {
  //       seen: true,
  //       prompt: true,
  //     });
  //   })
  // );
};

const getNotifCount = async (userId) => {
  const snap = await getCountFromServer(
    query(
      collection(db, "notifications"),
      where("receiverId", "==", userId)
      // where("seen", "==", false)
    )
  );
  return snap.data().count;
};

export {
  useSelector,
  setIsLoading,
  loadingProcess,
  specificLoadingProcess,
  get,
  all,
  find,
  add,
  set,
  getNotifCount,
  update,
  setNotifPrompt,
  updateAllAsSeen,
  count,
  orderBy,
  remove,
  addNotif,
  addNotifWhenHasNotif,
  where,
  serverTimestamp,
};
