import React from 'react';
import { StyleSheet, View, Button, ScrollView, StatusBar, RefreshControl, Platform } from 'react-native';

import { Text, useTheme } from 'react-native-paper';

import { useEffect, useState } from 'react';

import { getNews } from '../fetch/PronoteData/PronoteNews';
import ListItem from '../components/ListItem';

import { Newspaper } from 'lucide-react-native';
import { set } from 'react-native-reanimated';

function relativeDate(date) {
    const now = new Date();
    const diff = now - date;

    if (diff < 1000 * 60) {
        return 'À l\'instant';
    } else if (diff < 1000 * 60 * 60) {
        return Math.floor(diff / (1000 * 60)) + ' minutes';
    } else if (diff < 1000 * 60 * 60 * 24) {
        return Math.floor(diff / (1000 * 60 * 60)) + ' heures';
    } else if (diff < 1000 * 60 * 60 * 24 * 7) {
        return Math.floor(diff / (1000 * 60 * 60 * 24)) + ' jours';
    } else if (diff < 1000 * 60 * 60 * 24 * 30) {
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 7)) + ' semaines';
    } else if (diff < 1000 * 60 * 60 * 24 * 365) {
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 30)) + ' mois';
    } else {
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365)) + ' ans';
    }
}

function NewsScreen({ navigation }) {
    const theme = useTheme();

    const [news, setNews] = useState([]);
    let finalNews = [];

    function editNews(news) {
        // invert the news array
        let newNews = news.reverse();

        return newNews;
    }

    const [isHeadLoading, setIsHeadLoading] = useState(false);

    useEffect(() => {
        setIsHeadLoading(true);
        getNews().then((news) => {
            setIsHeadLoading(false);
            setNews(editNews(JSON.parse(news)));
            finalNews = editNews(JSON.parse(news));
        });
    }, []);

    const onRefresh = React.useCallback(() => {
        setIsHeadLoading(true);
        getNews(true).then((news) => {
            setNews(editNews(JSON.parse(news)));
            finalNews = editNews(JSON.parse(news));
            setIsHeadLoading(false);
        });
    }, []);

    function normalizeText(text) {
        // remove accents and render in lowercase
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    // add search bar in the header
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerSearchBarOptions: {
                placeholder: 'Rechercher une actualité',
                cancelButtonText : 'Annuler',
                onChangeText: (event) => {
                    let text = event.nativeEvent.text.trim();

                    if (text.length > 2) {
                        let newNews = [];

                        finalNews.forEach((item) => {
                            if (normalizeText(item.title).includes(normalizeText(text)) || normalizeText(item.content).includes(normalizeText(text))) {
                                newNews.push(item);
                            }
                        });

                        setNews(newNews);
                    }
                    else {
                        setNews((finalNews));
                    }
                }
            }
        });
    }, [navigation]);

    return (
      <ScrollView style={styles.container} contentInsetAdjustmentBehavior='automatic'
      refreshControl={
        <RefreshControl refreshing={isHeadLoading} onRefresh={onRefresh} colors={[Platform.OS === 'android' ? '#29947A' : null]} />
      }>
        { Platform.OS === 'ios' ?
            <StatusBar animated barStyle={'light-content'} />
        :
            <StatusBar animated barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor='transparent' />
        }
        
        { news.length > 0 ?
            <View style={styles.newsList}>
                {news.map((item, index) => {
                    let content = item.content.trim();
                    if (content.length > 50) {
                        content = content.substring(0, 50) + '...';
                    }

                    return (
                        <ListItem
                            key={index}
                            title={item.title}
                            subtitle={content}
                            icon={<Newspaper color='#29947A' size={24} />}
                            color='#29947A'
                            onPress={() => navigation.navigate('NewsDetails', {news: item})}
                            right={<Text style={{fontSize: 13, opacity: 0.5}}>il y a {relativeDate(new Date(item.date))}</Text>}
                        />
                    );
                })}
            </View>
        : null }
      </ScrollView>
    );
}

const styles = StyleSheet.create({
    newsList: {
        marginTop: 16,
        marginBottom: 16,
        gap: 10,
    },
});

export default NewsScreen;