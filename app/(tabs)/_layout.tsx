import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {

  const insets = useSafeAreaInsets(); 

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: '#4DB6AC',
        tabBarInactiveTintColor: '#9E9E9E',
        

        tabBarStyle: {
          position: 'absolute',
          

          bottom: insets.bottom, 
          left: 20,
          right: 20,

          height: 70,

          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          borderTopWidth: 0,

          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 15,
          elevation: 8,

          paddingTop: 2,
          paddingBottom: 2,
          
        },

        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 0.5,
        },
      }}
    >

      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? '#E0F2F1' : 'transparent',
              padding: 3,
              borderRadius: 14,
            }}>
              <MaterialCommunityIcons name="home" size={23} color={color} />
            </View>
          ),
        }}
      />

      {/* ADOPCIÓN */}
      <Tabs.Screen
        name="adoption"
        options={{
          title: 'Adopción',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? '#FCE4EC' : 'transparent',
              padding: 4,
              borderRadius: 14,
            }}>
              <MaterialCommunityIcons name="heart" size={23} color={color} />
            </View>
          ),
        }}
      />

      {/* CITAS */}
      <Tabs.Screen
        name="citas"
        options={{
          title: 'Citas',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? '#E3F2FD' : 'transparent',
              padding: 4,
              borderRadius: 14,
            }}>
              <MaterialCommunityIcons name="calendar" size={23} color={color} />
            </View>
          ),
        }}
      />

      {/* PERFIL */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? '#F3E5F5' : 'transparent',
              padding: 4,
              borderRadius: 14,
            }}>
              <MaterialCommunityIcons name="account" size={23} color={color} />
            </View>
          ),
        }}
      />

    </Tabs>
  );
}
