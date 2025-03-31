import { get, update, where, serverTimestamp } from "../helpers/databaseHelper";
import { auth } from "./firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const updateCustomerUserName = (id, name) => {
  try {
    get("bookings", where("customerId", "==", id)).then(({ docs }) =>
      docs.map((bookingDoc) =>
        update("bookings", bookingDoc.id, { customerName: name })
      )
    );
    get("ratings", where("ratedById", "==", id)).then(({ docs }) =>
      docs.map((reviewDoc) =>
        update("ratings", reviewDoc.id, { ratedBy: name })
      )
    );
  } catch (error) {
    console.error("Error updating usernames:", error);
  }
};

export const updateProviderUserName = (id, name) => {
  try {
    get("bookings", where("providerId", "==", id)).then(({ docs }) =>
      docs.map(async (bookingDoc) =>
        update("bookings", bookingDoc.id, { providerName: name })
      )
    );

    get("providerServices", where("providerId", "==", id)).then(({ docs }) =>
      docs.map(async (doc) =>
        update("providerServices", doc.id, { providerName: name })
      )
    );
  } catch (error) {
    console.error("Error updating usernames:", error);
  }
};

export const updateProviderUserImage = (id, image) => {
  try {
    get("providerServices", where("providerId", "==", id)).then(({ docs }) =>
      docs.map(async (doc) =>
        update("providerServices", doc.id, { providerImage: image })
      )
    );
  } catch (error) {
    console.error("Error updating usernames:", error);
  }
};

export const updateCustomerUserImage = (id, image) => {
  try {
    get("ratings", where("ratedById", "==", id)).then(({ docs }) =>
      docs.map((reviewDoc) =>
        update("ratings", reviewDoc.id, { ratedByImage: image })
      )
    );
  } catch (error) {
    console.error("Error updating usernames:", error);
  }
};

export const logout = async (userId, setUserId, removeLogin) => {
  if (removeLogin) {
    try {
      AsyncStorage.removeItem("email");
      AsyncStorage.removeItem("password");
    } catch (e) {}
  }

  await update("users", userId, {
    isOnline: false,
    lastSeen: serverTimestamp(),
  });

  await auth.signOut();

  setUserId(null);
};
