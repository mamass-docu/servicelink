import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";

export default function ProfileImageScreen({
  image,
  name,
  style,
  textSize,
  resizeMode,
}) {
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   if (!image) return
    
  //   const prefetchImage = async () => {
  //     setLoading(true)
  //     try {
  //       await Image.prefetch(image);
  //     } catch (error) {
  //       console.error('Error prefetching image:', error);
  //     } finally{
  //       setLoading(false)
  //     }
  //   };

  //   prefetchImage();
  // }, [image]);

  return (
    <>
      {image ? (
        <View style={{...style, borderWidth:0}}>
          <Image
            source={{ uri: image }}
            style={{
              width: style.width,
              height: style.height,
              borderRadius: style.borderRadius,
              // borderWidth: style.borderWidth,
              // borderColor: "transparent",
              // margin: style.margin,
              // marginRight: style.marginRight,
              // marginLeft: style.marginLeft,
              // marginTop: style.marginTop,
              // marginBottom: style.marginBottom,
              // padding: style.padding,
              // paddingRight: style.paddingRight,
              // paddingLeft: style.paddingLeft,
              // paddingTop: style.paddingTop,
              // paddingBottom: style.paddingBottom,
            }}
            resizeMode={resizeMode}
            onLoadEnd={() => setLoading(false)}
          />
          {loading && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: style.borderRadius,
                // borderWidth:style.borderWidth,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </View>
      ) : (
        <View
          style={{
            ...style,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#FFB800",
          }}
        >
          <Text
            style={{
              fontSize: textSize ?? 20,
              color: "#fff",
            }}
          >
            {name ? name.trim().charAt(0).toUpperCase() : "N/A"}
          </Text>
        </View>
      )}
    </>
  );
}
