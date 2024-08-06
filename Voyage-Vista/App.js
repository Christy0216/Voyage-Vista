import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MainScreen from "./screens/MainScreen";
import Login from "./screens/LoginScreen";
import Signup from "./screens/SignupScreen";
import MapScreen from "./screens/MapScreen";
import AddPostScreen from "./screens/AddPostScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SettingScreen from "./screens/SettingScreen";
import PostDetailsScreen from "./screens/PostDetailsScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
// import { auth } from "./firebase";
// import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Main" component={MainScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="AddPost" component={AddPostScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Setting" component={SettingScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  // const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     setIsUserAuthenticated(!!user);
  //   });
  //   return unsubscribe; // Proper cleanup on unmount
  // }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "white" },
          headerTintColor: "black",
        }}
      >
        {/* {isUserAuthenticated ? ( */}
        <Stack.Screen
          name="HomeTabs"
          component={AppTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PostDetailsScreen"
          component={PostDetailsScreen}
          options={{ headerShown: true }} // You can set this to false if you don't want a header for this screen
        />
        <Stack.Screen
          name="FavoritesScreen"
          component={FavoritesScreen}
          options={{ headerShown: true }}
        />
        {/* ) : (
          <Stack.Screen
            name="Auth"
            component={AuthStack}
            options={{ headerShown: false }}
          />
        )} */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
