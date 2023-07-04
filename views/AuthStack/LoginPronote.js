import * as React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';

import { TextInput, Button, Dialog, Text, Portal } from 'react-native-paper';

import { useState } from 'react';

import { useTheme } from '@react-navigation/native';

function DialogLoginUnavailable({ visible, hide }) {
    const { colors } = useTheme();

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={hide}>
                <Dialog.Title>Service indisponible</Dialog.Title>
                <Dialog.Content>
                    <Text>
                        Le service que vous avez sélectionné est indisponible pour le moment.
                    </Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={hide}>OK</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}

function LoginPronote({ navigation }) {
  const { colors } = useTheme();

  const [dialogVisible, setDialogVisible] = useState(false);

  function btnClicked() {
    // open dialog
    setDialogVisible(true);
  }

  function closeDialog() {
    // close dialog
    setDialogVisible(false);
  }

  return (
    <ScrollView>

        <DialogLoginUnavailable visible={dialogVisible} hide={() => {closeDialog()}} />

        <TextInput
            label="Identifiant"
            mode="outlined"
            style={[styles.input]}
            left={<TextInput.Icon icon="account-outline" />}
        />

        <TextInput
            label="Mot de passe"
            mode="outlined"
            style={[styles.input]}
            left={<TextInput.Icon icon="lock-outline" />}
            secureTextEntry={true}
        />

        <View style={[styles.buttons]}>
            <Button
            icon="help-circle-outline"
            mode="contained-tonal"
            style={[styles.button]}>
                Besoin d'aide ?
            </Button>

            <Button
            icon="login"
            mode="contained"
            onPress={btnClicked}
            style={[styles.button]}>
                Se connecter
            </Button>
        </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
    input: {
        marginHorizontal: 14,
        marginBottom: 8,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: 14,
        gap: 8,
    },
    button: {
        flex: 1,
        marginTop: 8,
    }
});

export default LoginPronote;