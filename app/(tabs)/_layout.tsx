import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,

        tabBarActiveTintColor: '#4DB6AC',
        tabBarInactiveTintColor: 'gray',

        // 🔥 ESTILO FLOTANTE
        tabBarStyle: {
          position: 'absolute',
          bottom: 15,
          left: 15,
          right: 15,
          elevation: 8,

          backgroundColor: 'white',
          borderRadius: 25,
          height: 70,

          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 10,

          borderTopWidth: 0,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -4,
        },
      }}
    >

      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="house.fill" color={color} />
          ),
        }}
      />

      {/* PERDIDAS / EXPLORE */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Perdidas',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="magnifyingglass" color={color} />
          ),
        }}
      />

      {/* ADOPCION */}
      <Tabs.Screen
        name="adoption"
        options={{
          title: 'Adopción',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="heart.fill" color={color} />
          ),
        }}
      />

      {/* CITAS */}
      <Tabs.Screen
        name="citas"
        options={{
          title: 'Citas',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="calendar" color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
