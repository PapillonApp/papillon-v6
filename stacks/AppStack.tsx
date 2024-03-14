import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

import { setBackgroundFetch } from '../fetch/BackgroundFetch';

export const headerTitleStyles = {
  headerLargeTitleStyle: {
    fontFamily: 'Papillon-Semibold',
    fontSize: 28,
  },
  headerTitleStyle: {
    fontFamily: 'Papillon-Semibold',
  },
  headerBackTitleStyle: {
    fontFamily: 'Papillon-Medium',
  },
};

const AppStack = ({ navigation }) => {
  const views = [
    {
      name: 'TabsStack',
      component: require('./TabsStack').default,
      options: {
        headerShown: false,
      }
    },
    {
      name: 'InsetSettings',
      component: require('./SettingsStack').default,
      options: {
        headerShown: false,
        presentation: 'modal',
      }
    },

    {
      name: 'InsetSchoollife',
      component: require('../views/SchoolLifeScreen').default,
      options: {}
    },
    {
      name: 'InsetEvaluations',
      component: require('../views/EvaluationsScreen').default,
      options: {}
    },
    {
      name: 'InsetConversations',
      component: require('../views/ConversationsScreen').default,
      options: {}
    },
    {
      name: 'InsetConversationsItem',
      component: require('../views/Conversations/MessagesScreen').default,
      options: {}
    },
    {
      name: 'InsetNewConversation',
      component: require('../views/Conversations/NewConversation').default,
      options: {
        headerTitle: 'Nouvelle conversation',
        presentation: 'modal',
      }
    },
    {
      name: 'InsetProfile',
      component: require('../views/Settings/ProfileScreen').default,
      options: {
        headerTitle: 'Mon profil',
        headerBackTitle: 'Préférences',
        presentation: 'modal',
      }
    },
    {
      name: 'InsetMatieres',
      component: require('../views/Settings/CoursColor').default,
      options: {
        headerTitle: 'Gestion des matières',
        presentation: 'modal',
      }
    },
    {
      name: 'Lesson',
      component: require('../views/Cours/LessonScreen').default,
      options: {
        presentation: 'modal',
      }
    },
    {
      name: 'Devoir',
      component: require('../views/Devoirs/HwScreen').default,
      options: {
        presentation: 'modal',
      }
    },
    {
      name: 'Grade',
      component: require('../views/Grades/GradeView').default,
      options: {
        presentation: 'modal',
        headerTintColor: '#fff',
      }
    },
    {
      name: 'GradesSettings',
      component: require('../views/Grades/GradesSettings').default,
      options: {
        presentation: 'modal',
        headerTitle: 'Paramètres des notes',
      }
    },
    {
      name: 'CreateHomework',
      component: require('../views/Devoirs/CreateHomeworkScreen').default,
      options: {
        presentation: 'modal',
      }
    },
    {
      name: 'NewsDetails',
      component: require('../views/News/NewsItem').default,
      options: {
        presentation: 'modal',
      }
    },
    {
      name: 'PdfViewer',
      component: require('../views/Modals/PdfViewer').default,
      options: {
        presentation: 'modal',
      }
    },
  ];

  useEffect(() => {
    setBackgroundFetch();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        screenOptions={
          Platform.OS === 'android'
            ? {
              animation: 'fade_from_bottom',
              navigationBarColor: '#00000000',
            }
            : {
              ...headerTitleStyles,
            }
        }
      >
        {
          views.map((view, index) => (
            <Stack.Screen key={index} name={view.name} component={view.component} options={view.options} />
          ))
        }
      </Stack.Navigator>
    </View>
  );
};

export default AppStack;
