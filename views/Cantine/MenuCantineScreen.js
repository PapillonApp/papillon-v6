/* eslint-disable prettier/prettier */
import * as React from 'react';
import { useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { ContextMenuView } from 'react-native-ios-context-menu';

import { ScrollView } from 'react-native-gesture-handler';

import InfinitePager from 'react-native-infinite-pager';
import DateTimePicker from '@react-native-community/datetimepicker';

import AsyncStorage from '@react-native-async-storage/async-storage';

import PapillonLoading from '../../components/PapillonLoading';

import {
  Album,
  ChefHat,
  CookingPot,
  Leaf,
  MapPin,
  Sprout,
} from 'lucide-react-native';

import GetUIColors from '../../utils/GetUIColors';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import { useAppContext } from '../../utils/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const calcDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

function MenuCantineScreen({ navigation }) {
  const theme = useTheme();
  const pagerRef = useRef(null);
  const insets = useSafeAreaInsets();

  const [today, setToday] = useState(new Date());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [calendarDate, setCalendarDate] = useState(today);
  const [menu, setMenu] = useState({});
  const todayRef = useRef(today);
  const menuRef = useRef(menu);

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);



  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShadowVisible: true,
      headerTransparent: false,
      headerRight: () =>
        Platform.OS === 'ios' ? (
          <ContextMenuView
            previewConfig={{
              borderRadius: 8,
            }}
            menuConfig={{
              menuTitle: calendarDate.toLocaleDateString('fr', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }),
            }}
            onPressMenuItem={({ nativeEvent }) => {
              if (nativeEvent.actionKey === 'notifyAll') {
                notifyAll(cours[calendarDate.toLocaleDateString()]);
              }
            }}
          >
            <DateTimePicker
              value={calendarDate}
              locale="fr-FR"
              mode="date"
              display="compact"
              onChange={(event, date) => {
                setCalendarAndToday(date);
                pagerRef.current.setPage(0);
                if (currentIndex === 0) {
                  setCurrentIndex(1);
                  setTimeout(() => {
                    setCurrentIndex(0);
                  }, 10);
                }
              }}
            />
          </ContextMenuView>
        ) : (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginRight: 2,
            }}
            onPress={() => setCalendarModalOpen(true)}
          >
            <Album size={20} color={UIColors.text} />
            <Text style={{ fontSize: 15, fontFamily: 'Papillon-Medium' }}>
              {new Date(calendarDate).toLocaleDateString('fr', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
              })}
            </Text>
          </TouchableOpacity>
        ),
    });
  }, [navigation, calendarDate, UIColors]);

  const setCalendarAndToday = (date) => {
    setCalendarDate(date);
    setToday(date);
    setCalendarDate(date);
    for (let i = -2; i <= 2; i++) {
      updateMenuForDate(i, date);
    }
  };

  const appctx = useAppContext();

  const updateMenuForDate = async (dateOffset, setDate) => {
    const newDate = calcDate(setDate, dateOffset);
    if (!menuRef.current[newDate.toLocaleDateString()]) {
      // load cache before fetching
      const cacheResult = await AsyncStorage.getItem('@menu');
      if (cacheResult) {
        const cache = JSON.parse(cacheResult);
        if (cache[newDate.toLocaleDateString()]) {
          setMenu((prevMenu) => ({
            ...prevMenu,
            [newDate.toLocaleDateString()]: cache[newDate.toLocaleDateString()],
          }));
        }
      }

      // fetch
      const result = await appctx.dataprovider.getMenu(newDate);
      setMenu((prevMenu) => ({
        ...prevMenu,
        [newDate.toLocaleDateString()]: result,
      }));

      // save to cache
      AsyncStorage.getItem('@menu').then((value) => {
        const c = JSON.parse(value) || {};
        c[newDate.toLocaleDateString()] = result;
        AsyncStorage.setItem('@menu', JSON.stringify(menu));
      });
    }
  };

  const handlePageChange = (page) => {
    const newDate = calcDate(todayRef.current, page);
    setCurrentIndex(page);
    setCalendarDate(newDate);

    for (let i = -2; i <= 2; i++) {
      updateMenuForDate(i, newDate);
    }
  };

  const forceRefresh = async () => {
    const newDate = calcDate(calendarDate, 0);
    const result = await appctx.dataprovider.getMenu(newDate, true);

    const newMenu = menu;
    newMenu[newDate.toLocaleDateString()] = result;
    setMenu(newMenu);
  };

  useEffect(() => {
    todayRef.current = today;
    menuRef.current = menu;
  }, [today, menu]);



  const UIColors = GetUIColors();

  return (
    <View
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container]}
    >
      {Platform.OS === 'android' && calendarModalOpen ? (
        <DateTimePicker
          value={calendarDate}
          locale="fr_FR"
          mode="date"
          display="calendar"
          onChange={(event, date) => {
            if (event.type === 'dismissed') {
              setCalendarModalOpen(false);
              return;
            }

            setCalendarModalOpen(false);

            setCalendarAndToday(date);
            pagerRef.current.setPage(0);
            if (currentIndex === 0) {
              setCurrentIndex(1);
              setTimeout(() => {
                setCurrentIndex(0);
              }, 10);
            }
          }}
        />
      ) : null}

      <InfinitePager
        style={[styles.viewPager]}
        pageWrapperStyle={[styles.pageWrapper]}
        onPageChange={handlePageChange}
        ref={pagerRef}
        pageBuffer={4}
        gesturesDisabled={false}
        renderPage={({ index }) =>
          menu[calcDate(today, index).toLocaleDateString()] ? (
            <CoursPage
              menu={menu[calcDate(today, index).toLocaleDateString()] || []}
              forceRefresh={forceRefresh}
            />
          ) : (
            <View style={[styles.coursContainer, { backgroundColor: UIColors.modalBackground }]}>
              <PapillonLoading
                title="Chargement du menu"
                subtitle="Obtention du menu en cours"
              />
            </View>
          )
        }
      />
    </View>
  );
}

function CoursPage({ menu, forceRefresh }) {


  const [isHeadLoading, setIsHeadLoading] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsHeadLoading(true);

    forceRefresh().then(() => {
      setIsHeadLoading(false);
    });
  }, []);

  function iconLabel(label) {
    if (label === 'Produits locaux') {
      return <MapPin color={UIColors.text} />;
    }
    if (label === 'Menu végétarien') {
      return <Leaf color={UIColors.text} />;
    }
    if (label === 'Issu de l\'Agriculture Biologique') {
      return <Sprout color={UIColors.text} />;
    }
    if (label === 'Assemblé sur place') {
      return <CookingPot color={UIColors.text} />;
    }
    if (label === 'Fait maison - Recette du chef') {
      return <ChefHat color={UIColors.text} />;
    }
  }

  const UIColors = GetUIColors();

  return (
    <ScrollView
      nestedScrollEnabled
      style={[styles.coursContainer, { backgroundColor: UIColors.modalBackground }]}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={isHeadLoading}
          onRefresh={onRefresh}
          colors={[Platform.OS === 'android' ? '#29947A' : null]}
        />
      }
    >
      {menu.length === 0 ? (
        <PapillonLoading
          icon={<Album size={26} color={UIColors.text} />}
          title="Pas de menu aujourd'hui"
          subtitle="Le menu du jour n'est pas encore disponible. Veuillez vous rapprocher de l'administration pour plus d'informations."
          style={{ marginTop: 36 }}
        />
      ) : null}

      {menu.map((_menu, index) => (
        
        
        <View key={index}>

            {(_menu.type.is_lunch !== false) ? (
                <NativeList inset header="Menu du midi">
                    {_menu.first_meal != null ? (
                        <NativeItem key="first_meal" trailing={_menu.first_meal.labels.name}>
                            <NativeText heading="h4">{_menu.first_meal}</NativeText>
                            <NativeText>{meal.labels.name}</NativeText>
                        </NativeItem>
                    ) : null}
                    {_menu.main_meal != null ? (
                        _menu.main_meal.map((meal, index2) => (
                            <NativeItem key={index2} trailing={<NativeText>{meal.labels.map((label) => iconLabel(label.name))}</NativeText>}>
                                <NativeText heading="h4">{meal.name}</NativeText>
                            </NativeItem>
                        ))
                    ) : null}
                    {_menu.side_meal != null ? (
                        _menu.side_meal.map((meal, index2) => (
                            <NativeItem key={index2} trailing={<NativeText>{meal.labels.map((label) => iconLabel(label.name))}</NativeText>}>
                                <NativeText heading="h4">{meal.name}</NativeText>
                            </NativeItem>
                            
                        ))
                    ) : null}
                    {_menu.cheese != null ? (
                        _menu.cheese.map((meal, index2) => (
                            <NativeItem key={index2} trailing={<NativeText>{meal.labels.map((label) => iconLabel(label.name))}</NativeText>}>
                                <NativeText heading="h4">{meal.name}</NativeText>
                            </NativeItem>
                        ))
                    ) : null}
                    {_menu.dessert != null ? (
                        _menu.dessert.map((meal, index2) => (
                            <NativeItem key={index2} trailing={<NativeText>{meal.labels.map((label) => iconLabel(label.name))}</NativeText>}>
                                <NativeText heading="h4">{meal.name}</NativeText>
                            </NativeItem>
                        ))
                    ) : null}
                </NativeList>
            ) : null}

            {(_menu.type.is_dinner !== false) ? (
                <NativeList inset header="Menu du soir">
                    {_menu.first_meal != null ? (
                        <NativeItem key="first_meal">
                            <NativeText heading="h4">{_menu.first_meal}</NativeText>
                        </NativeItem>
                    ) : null}
                    {_menu.main_meal != null ? (
                        _menu.main_meal.map((meal, index2) => (
                            <NativeItem key={index2}>
                                <NativeText heading="h4">{meal.name}</NativeText>
                            </NativeItem>
                        ))
                    ) : null}
                    {_menu.side_meal != null ? (
                        _menu.side_meal.map((meal, index2) => (
                            <NativeItem key={index2}>
                                <NativeText heading="h4">{meal.name}</NativeText>
                            </NativeItem>
                        ))
                    ) : null}
                    {_menu.cheese != null ? (
                        _menu.cheese.map((meal, index2) => (
                            <NativeItem key={index2}>
                                <NativeText heading="h4">{meal.name}</NativeText>
                            </NativeItem>
                        ))
                    ) : null}
                    {_menu.dessert != null ? (
                        _menu.dessert.map((meal, index2) => (
                            <NativeItem key={index2}>
                                <NativeText heading="h4">{meal.name}</NativeText>
                            </NativeItem>
                        ))
                    ) : null}
                </NativeList>
            ) : null}
        
        </View>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewPager: {
    flex: 1,
  },
  pageWrapper: {
    flex: 1,
  }
});

export default MenuCantineScreen;
