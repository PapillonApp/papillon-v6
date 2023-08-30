import React from 'react';
import { StyleSheet, View, Button, ScrollView, StatusBar, useWindowDimensions, Platform } from 'react-native';

import { Text, useTheme } from 'react-native-paper';

import RenderHtml from 'react-native-render-html';

import ListItem from '../../components/ListItem';
import { BarChart4, Link, File } from 'lucide-react-native';

function NewsHeader({ news }) {
    const theme = useTheme();

    return (
        <View style={[Platform.OS === 'ios' ? styles.newsHeader : styles.newsHeaderAndroid]}>
            <Text style={[styles.newsTitle]}>{news.title}</Text>
            <Text style={[styles.newsDate]}>{new Date(news.date).toLocaleDateString('fr', {weekday: 'long', day: '2-digit', month: 'short'})} - {news.author}</Text>
        </View>
    );
}

function NewsItem({ route, navigation }) {
    const { news } = route.params;
    const theme = useTheme();
    const { width } = useWindowDimensions();

    // change the header of the screen
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: (props) => <NewsHeader {...props} news={news} />,
            headerBackTitleVisible: false,
        });
    }, [navigation, news]);

    const source = {
        html: news.html_content[0].texte.V,
    }

    return (
      <ScrollView style={styles.container}>
        { Platform.OS === 'ios' ?
            <StatusBar animated barStyle={'light-content'} />
        :
            <StatusBar animated barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor='transparent' />
        }

        { news.survey ?
            <ListItem
                title="Cette actualité contient un sondage"
                subtitle="Vous ne pouvez pas répondre au sondage depuis l'application Papillon."
                icon={<BarChart4 color="#B42828" size={24} />}
                color="#B42828"
                onPress={() => {}}
                style={{marginTop: 14}}
            />
        : null }
        
        <View style={styles.newsTextContainer}>
            { source.html ? 
                <RenderHtml
                    contentWidth={width}
                    source={source}
                    baseStyle={theme.dark ? styles.baseStyleDark : styles.baseStyle}
                />
            : null }
        </View>

        { news.attachments.length > 0 ? (
            <View style={[styles.homeworkFiles, {backgroundColor: theme.dark ? '#222222' : '#ffffff'}]}>
            { news.attachments.map((file, index) => (
                <View style={[styles.homeworkFileContainer, {borderColor: theme.dark ? '#ffffff10' : '#00000010'}]} key={index}>
                <PressableScale style={[styles.homeworkFile]} weight="light" activeScale={0.9} onPress={() => openURL(file.url)}>
                    { file.type == 0 ? (
                    <Link size={20} color={theme.dark ? "#ffffff" : "#000000"} />
                    ) : (
                    <File size={20} color={theme.dark ? "#ffffff" : "#000000"} />
                    ) }

                    <View style={[styles.homeworkFileData]}>
                    <Text style={[styles.homeworkFileText]}>{file.name}</Text>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={[styles.homeworkFileUrl]}>{file.url}</Text>
                    </View>
                </PressableScale>
                </View>
            )) }
            </View>
        ) : null }
      </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    newsTextContainer: {
        margin: 14,
    },

    baseStyle: {
        fontSize: 16,
    },
    baseStyleDark: {
        fontSize: 16,
        color: '#ffffff',
    },

    newsHeader: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
    },
    newsHeaderAndroid: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 0,
    },
    newsTitle: {
        fontSize: 16,
        fontWeight: 700,
        fontFamily: 'Papillon-Semibold',
    },
    newsDate: {
        fontSize: 13,
        opacity: 0.5,
    },

    homeworkFiles: {
        margin: 14,
        marginTop: 0,
        borderRadius: 8,
        overflow: 'hidden',
    },

    homeworkFileContainer: {
        borderTopWidth: 1,
    },
    homeworkFile: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    
    homeworkFileData: {
        gap: 2,
        flex: 1,
    },
    
    homeworkFileText: {
        fontSize: 17,
        fontWeight: 400,
        fontFamily: 'Papillon-Semibold',
    },
    homeworkFileUrl: {
        fontSize: 15,
        fontWeight: 400,
        fontFamily: 'Papillon-Medium',
        opacity: 0.5,
    },
});

export default NewsItem;