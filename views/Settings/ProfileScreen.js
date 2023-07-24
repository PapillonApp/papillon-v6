import * as React from 'react';
import { View, ScrollView, Pressable, StyleSheet, Image, StatusBar, Platform, Alert } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';

import prompt from 'react-native-prompt-android';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as ImagePicker from 'expo-image-picker';

import { useState, useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';

import { getUser } from '../../fetch/PronoteData/PronoteUser';

import ListItem from '../../components/ListItem';
import PapillonIcon from '../../components/PapillonIcon';

import { Mail, Phone, Edit, Pencil, Trash2, Contact2 } from 'lucide-react-native';

function ProfileScreen({ navigation }) {
    const theme = useTheme();

    const [userData, setUserData] = React.useState({});
    const [profilePicture, setProfilePicture] = React.useState("");

    useEffect(() => {
        getUser(false).then((result) => {
            setUserData(result);
            setProfilePicture(result.profile_picture);
        })
    }, []);

    async function EditProfilePicture() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5
        });

        if (!result.canceled) {
            AsyncStorage.getItem('old_profile_picture').then((result) => {
                if (result == null) {
                    AsyncStorage.setItem('old_profile_picture', userData.profile_picture);
                }
            });

            setProfilePicture(result.assets[0].uri);
            AsyncStorage.setItem('custom_profile_picture', result.assets[0].uri);
        }
    }

    function ResetProfilePic() {
        Alert.alert(
            'Réinitialiser la photo de profil',
            'Êtes-vous sûr de vouloir réinitialiser la photo de profil ?',
            [
                {text: 'Réinitialiser', isPreferred: true, onPress: () => FullResetProfilePic(), style: 'destructive'},
                {text: 'Annuler', style: 'cancel'},
            ]
        );
    }

    function FullResetProfilePic() {
        AsyncStorage.removeItem('custom_profile_picture');
        AsyncStorage.getItem('old_profile_picture').then((result) => {
            setProfilePicture(result);
        });
    }

    function ResetName() {
        Alert.alert(
            'Réinitialiser le nom utilisé',
            'Êtes-vous sûr de vouloir réinitialiser le nom utilisé ?',
            [
                {text: 'Réinitialiser', isPreferred: true, onPress: () => FullResetName(), style: 'destructive'},
                {text: 'Annuler', style: 'cancel'},
            ]
        );
    }

    function FullResetName() {
        AsyncStorage.removeItem('custom_name');
        AsyncStorage.getItem('old_name').then((result) => {
            setUserData({...userData, name: result});
        });
    }

    function EditName() {
        prompt(
            'Modifier le nom utilisé',
            'Utilisez un prénom ou un pseudonyme différent dans l\'app Papillon',
            [
                {text: 'Modifier', isPreferred: true, onPress: name => ModifyName(name)},
                {text: 'Réinitialiser', style: 'destructive' , onPress: () => ResetName()},
                {text: 'Annuler', style: 'cancel'},
            ],
            {
                type: 'plain-text',
                defaultValue: userData ? userData.name : '',
                placeholder: 'Prénom'
            }
        );
    }

    function ModifyName(name) {
        AsyncStorage.getItem('custom_name').then((result) => {
            if (result == null) {
                AsyncStorage.setItem('old_name', userData.name);
            }
        });

        AsyncStorage.setItem('custom_name', name);
        setUserData({...userData, name: name});
    }
    
    return (
        <ScrollView style={{flex: 1}}>
            <View style={styles.profileContainer}>
                { profilePicture !== "" ?
                    <Pressable style={({ pressed }) => [styles.profilePictureContainer, {opacity: pressed ? 0.6 : 1 }]} onPress={() => EditProfilePicture()}>
                        <Image style={styles.profilePicture} source={{uri: profilePicture}} />

                        <View style={[styles.profilePictureEdit]}>
                            <Pencil size={18} color="#fff" />
                        </View>
                    </Pressable>
                : null }

                <Text style={styles.name}>{userData.name}</Text>
                <Text style={styles.userData}>{userData.class} - {userData.establishment}</Text>
            </View>

            { userData.email !== "" & userData.phone !== "" ?
                <View style={{gap: 9}}>
                    <Text style={styles.ListTitle}>Données de contact</Text>
                    { userData.email !== "" ?
                        <ListItem
                            title="Adresse e-mail"
                            subtitle={userData.email}
                            color="#565EA3"
                            left={
                                <PapillonIcon
                                    icon={<Mail size={24} color="#565EA3" />}
                                    color="#565EA3"
                                    size={24}
                                    small
                                />
                            }
                        />
                    : null }
                    { userData.phone !== "" && userData.phone !== "+" ?
                        <ListItem
                            title="Téléphone"
                            subtitle={userData.phone}
                            color="#B9670F"
                            left={
                                <PapillonIcon
                                    icon={<Phone size={24} color="#B9670F" />}
                                    color="#B9670F"
                                    size={24}
                                    small
                                />
                            }
                        />
                    : null }
                    { userData.ine !== "" ?
                        <ListItem
                            title="Numéro INE"
                            subtitle={userData.ine}
                            color="#0065A8"
                            left={
                                <PapillonIcon
                                    icon={<Contact2 size={24} color="#0065A8" />}
                                    color="#0065A8"
                                    size={24}
                                    small
                                />
                            }
                        />
                    : null }
                </View>
            : null }

            <View style={{gap: 9, marginTop: 24}}>
                <Text style={styles.ListTitle}>Options</Text>
                <ListItem
                    title="Modifier le nom utilisé"
                    subtitle="Utilisez un prénom ou un pseudonyme différent dans l'app Papillon"
                    color="#29947A"
                    left={
                        <PapillonIcon
                            icon={<Edit size={24} color="#FFF" />}
                            color="#29947A"
                            size={24}
                            small
                            fill
                        />
                    }
                    onPress={() => EditName()}
                />
                <ListItem
                    title="Réinitialiser la photo de profil"
                    subtitle="Utilise la photo de profil par défaut"
                    color="#B42828"
                    left={
                        <PapillonIcon
                            icon={<Trash2 size={24} color="#FFF" />}
                            color="#B42828"
                            size={24}
                            small
                            fill
                        />
                    }
                    onPress={() => ResetProfilePic()}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    profileContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 32,
    },
    profilePicture: {
        width: 86,
        height: 86,
        borderRadius: 100,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#00000020',
    },
    name: {
        fontSize: 22,
        fontFamily: 'Papillon-Semibold',
        marginBottom: 4,
    },
    userData: {
        fontSize: 15,
        marginBottom: 4,
        opacity: 0.6,
    },
    ListTitle: {
        paddingLeft: 29,
        fontSize: 15,
        fontFamily: 'Papillon-Medium',
        opacity: 0.5,
    },
    profilePictureEdit: {
        position: 'absolute',
        bottom: 14,
        right: -3,
        backgroundColor: '#29947A',
        borderRadius: 100,
        padding: 6,
        elevation: 2,
        borderColor: '#ffffff20',
        borderWidth: 1,
    },
});

export default ProfileScreen;