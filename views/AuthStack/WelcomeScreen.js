import React from 'react';
import { StyleSheet, View, Text, Button, ScrollView, StatusBar, Platform, Image } from 'react-native';

import Animated from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';

import { useTheme } from 'react-native-paper';
import { useEffect, useState } from 'react';

import Swiper from 'react-native-swiper'
import { PressableScale } from 'react-native-pressable-scale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function WelcomeScreen({ navigation }) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const images = [
        require('../../assets/welcome_1.png'),
        require('../../assets/welcome_2.png'),
        require('../../assets/welcome_3.png'),
        require('../../assets/welcome_4.png'),
    ];

    // hide header
    React.useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const swiperRef = React.useRef(null);

    const bgColor = ['#29947a', '#296194', '#945C29', '#782994'];

    function nextPage() {
        swiperRef.current.scrollBy(1);
    }

    function prevPage() {
        swiperRef.current.scrollBy(-1);
    }

    return (
        <View style={[styles.container]}>
            <StatusBar barStyle={'light-content'} backgroundColor={'transparent'} />

            <Swiper style={[styles.wrapper]} loop={false} showsPagination={false} ref={swiperRef} loadMinimal={true} loadMinimalSize={4}>
                <View style={[styles.slide, styles.slide_1]}>
                    <Animated.Image source={images[0]} style={[styles.welcome_image, styles.welcome_1]} />

                    <View style={styles.textContainer}>
                        <Text style={[styles.mainText, {color: '#0DFF8B'}]}>
                            Bienvenue sur Papillon !
                        </Text>
                        <Text style={[styles.descTest]}>
                            Papillon est une app qui peut remplacer votre app de vie scolaire que ça soit Pronote, ÉcoleDirecte, ou Skolengo. Entrez juste vos identifiants et c’est parti !
                        </Text>
                    </View>

                    <View style={[styles.buttonsContainer, {paddingBottom: insets.bottom + 24}]}>
                        <PressableScale style={[styles.button, {backgroundColor: '#0DFF8B'}]} onPress={() => nextPage()}>
                            <Text style={[styles.buttonText, {color: '#1E6151'}]}>Découvrir Papillon</Text>
                        </PressableScale>
                        <PressableScale style={[styles.button, styles.buttonTwo]} onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.buttonTextTwo]}>Passer l'introduction</Text>
                        </PressableScale>
                    </View>
                </View>
                <View style={[styles.slide, styles.slide_2]}>
                    <Image source={images[1]} style={[styles.welcome_image, styles.welcome_1]} />

                    <View style={styles.textContainer}>
                        <Text style={[styles.mainText, {color: '#8CF4FB'}]}>
                            Papillon révolutionne l’école
                        </Text>
                        <Text style={[styles.descTest]}>
                            Papillon transforme votre interface scolaire en une expérience intuitive et intelligente, rehaussant ainsi votre application de vie scolaire.
                        </Text>
                    </View>

                    <View style={[styles.buttonsContainer, {paddingBottom: insets.bottom + 24}]}>
                        <PressableScale style={[styles.button, {backgroundColor: '#8CF4FB'}]} onPress={() => nextPage()}>
                            <Text style={[styles.buttonText, {color: '#296194'}]}>Continuer</Text>
                        </PressableScale>
                        <PressableScale style={[styles.button, styles.buttonTwo]} onPress={() => swiperRef.current.scrollBy(-1)}>
                            <Text style={[styles.buttonTextTwo]}>Recommencer l'introduction</Text>
                        </PressableScale>
                    </View>
                </View>
                <View style={[styles.slide, styles.slide_3]}>
                    <Image source={images[2]} style={[styles.welcome_image, styles.welcome_1]} />

                    <View style={styles.textContainer}>
                        <Text style={[styles.mainText, {color: '#FBE28C'}]}>
                            Papillon est sécurisé
                        </Text>
                        <Text style={[styles.descTest]}>
                            L’application est développée par une communauté d’élèves et est open-source. Papillon ne collecte pas vos données et protège votre vie scolaire en ligne.
                        </Text>
                    </View>

                    <View style={[styles.buttonsContainer, {paddingBottom: insets.bottom + 24}]}>
                        <PressableScale style={[styles.button, {backgroundColor: '#FBE28C'}]} onPress={() => nextPage()}>
                            <Text style={[styles.buttonText, {color: '#945C29'}]}>Continuer</Text>
                        </PressableScale>
                        <PressableScale style={[styles.button, styles.buttonTwo]} onPress={() => swiperRef.current.scrollBy(-2)}>
                            <Text style={[styles.buttonTextTwo]}>Recommencer l'introduction</Text>
                        </PressableScale>
                    </View>
                </View>
                <View style={[styles.slide, styles.slide_4]}>
                    <Image source={images[3]} style={[styles.welcome_image, styles.welcome_1]} />

                    <View style={styles.textContainer}>
                        <Text style={[styles.mainText, {color: '#FB8CDC'}]}>
                            Lancez-vous
                        </Text>
                        <Text style={[styles.descTest]}>
                            Prêts pour vous lancer dans l’expérience Papillon ? Vous n’êtes plus qu’à quelques clics d’une grande amélioration de votre scolarité numérique. 
                        </Text>
                    </View>

                    <View style={[styles.buttonsContainer, {paddingBottom: insets.bottom + 24}]}>
                        <PressableScale style={[styles.button, {backgroundColor: '#FB8CDC'}]} onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.buttonText, {color: '#782994'}]}>Commencer avec Papillon</Text>
                        </PressableScale>
                        <PressableScale style={[styles.button, styles.buttonTwo]} onPress={() => swiperRef.current.scrollBy(-3)}>
                            <Text style={[styles.buttonTextTwo]}>Recommencer l'introduction</Text>
                        </PressableScale>
                    </View>
                </View>
            </Swiper>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    wrapper: {
    },
    slide: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'column',

        width: '100%',
        height: '100%',
    },
    slide_1: {
        backgroundColor: '#29947a',
    },
    slide_2: {
        backgroundColor: '#296194',
    },
    slide_3: {
        backgroundColor: '#945C29',
    },
    slide_4: {
        backgroundColor: '#782994',
    },

    welcome_image: {
        width: '100%',
        height: '70%',
        resizeMode: 'cover',
    },

    textContainer: {
        marginHorizontal: 24,
        gap: 4,

        marginTop: -28,
    },
    mainText: {
        fontSize: 20,
        fontFamily: 'Papillon-Semibold',
    },
    descTest: {
        fontSize: 15,
        color: '#ffffff',
    },

    buttonsContainer: {
        paddingHorizontal: 24,
        width: '100%',
        gap: 6,

        position: 'absolute',
        bottom: 0,
    },

    button: {
        flex: 1,
        borderRadius: 12,
        borderCurve: 'continuous',
        paddingVertical: 14,
    },
    buttonTwo: {
        backgroundColor: '#ffffff13',
    },
    buttonText: {
        fontSize: 16,
        fontFamily: 'Papillon-Semibold',
        textAlign: 'center',
    },
    buttonTextTwo: {
        fontSize: 16,
        fontFamily: 'Papillon-Semibold',
        textAlign: 'center',
        color: '#ffffffa9',
    },
});

export default WelcomeScreen;