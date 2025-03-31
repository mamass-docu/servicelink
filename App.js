import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppProvider } from "./AppProvider";

import { All } from "./registeredScreens/All";
import { Providers } from "./registeredScreens/Providers";
import { Customers } from "./registeredScreens/Customers";
import { enableScreens } from "react-native-screens";
import { Provider } from "react-redux";
import store from "./src/state/store";

enableScreens();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppProvider>
          {/* <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: "none",
              contentStyle: { backgroundColor: "white" },
            }}
          > */}
          <All />
          {/* </Stack.Navigator> */}
        </AppProvider>
      </NavigationContainer>
    </Provider>
  );
}
