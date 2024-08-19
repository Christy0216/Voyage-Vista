import { Platform } from "react-native";
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
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import { ThemeProvider } from "./context/ThemeContext";
import WeatherScreen from "./screens/WeatherScreen";
import { auth } from "./firebase/firebaseSetUp";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NotificationProvider } from "./context/NotificationContext";
import * as Notifications from "expo-notifications";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Main") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Map") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "AddPost") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Setting") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "skyblue",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Main" component={MainScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="AddPost" component={AddPostScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Setting" component={SettingScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsUserAuthenticated(!!user);
      });
  
      return unsubscribe; // Cleanup subscription on unmount
    }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserAuthenticated(!!user);
    });
    return unsubscribe; // Proper cleanup on unmount
  }, []);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: "white" },
              headerTintColor: "black",
            }}
          >
            {isUserAuthenticated ? (
              <>
                <Stack.Screen
                  name="HomeTabs"
                  component={AppTabs}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="PostDetailsScreen"
                  component={PostDetailsScreen}
                  options={{ headerShown: true }}
                />
                <Stack.Screen
                  name="FavoritesScreen"
                  component={FavoritesScreen}
                  options={{ headerShown: true }}
                />
                <Stack.Screen
                  name="WeatherScreen"
                  component={WeatherScreen}
                  options={{ headerShown: true }}
                />
              </>
            ) : (
              <Stack.Screen
                name="Auth"
                component={AuthStack}
                options={{ headerShown: false }}
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </NotificationProvider>
    </ThemeProvider>
  );
}
