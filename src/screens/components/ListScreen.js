import React from "react";
import EmptyScreen from "./EmptyScreen";
import { ScrollView, View } from "react-native";

export default function ListScreen({
  contentContainerStyle,
  renderItem,
  data,
  emptyMessage,
  keyExtractor,
  horizontal,
  showsHorizontalScrollIndicator,
  displayCondition,
}) {
  return (
    <>
      {data.length == 0 ? (
        <EmptyScreen message={emptyMessage} />
      ) : (
        <ScrollView
          contentContainerStyle={contentContainerStyle}
          horizontal={horizontal}
          showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        >
          {data.map((item) => (
            <View key={keyExtractor ? keyExtractor(item) : item.id}>
              {renderItem(item)}
            </View>
          ))}
        </ScrollView>
      )}
    </>
  );
}
