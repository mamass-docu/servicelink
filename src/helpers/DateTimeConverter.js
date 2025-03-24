export const DateTimeConverter = (datetime) => {
  if (!datetime) return null;
  try {
    const date = datetime.toDate();
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(
        2,
        "0"
      )}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  } catch (e) {
    return null;
  }
};

export const timestampToDateStringConverter = (datetime) => {
  if (!datetime) return null;
  try {
    const date = datetime.toDate();
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  } catch (e) {
    return null;
  }
};
