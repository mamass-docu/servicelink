import axios from "axios";

const uploadImage = async (file, filename) => {
  const formData = new FormData();
  const imageExtension = file.fileName.substring(
    file.fileName.lastIndexOf(".")
  );

  const param = {
    uri: file.uri,
    type: "image/jpeg",
    name: filename + imageExtension,
  };

  formData.append("file", param);
  formData.append("upload_preset", "upload_file");

  const res = await axios.post(
    "https://api.cloudinary.com/v1_1/diwwrxy8b/image/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return res.data.secure_url;
};

// const deleteImage = async (url) => {
//   const publicId = url.substring(url.lastIndexOf("/") + 1).split(".")[0];
//   const timestamp = Math.floor(new Date().getTime() / 1000);
//   const signature = "bfd09f95f331f558cbd1320e67aa8d488770583e";
//   console.log(publicId, timestamp);
//   const formData = new FormData();
//   // formData.append("file", file);
//   formData.append("api_key", "216332692591753");
//   formData.append("upload_preset", "upload_file");
//   formData.append("public_id", publicId);
//   formData.append("timestamp", timestamp);
//   formData.append("signature", signature);

//   const res = await axios.post(
//     "https://api.cloudinary.com/v1_1/diwwrxy8b/image/destroy",
//     {
//       public_id: publicId,
//       api_key: "216332692591753",
//       timestamp,
//       signature,
//     }
//   );

//   console.log(res.data);
// };

export { uploadImage };
