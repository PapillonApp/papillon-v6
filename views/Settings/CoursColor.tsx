import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, Modal, ScrollView } from 'react-native';
import { Haptics } from 'expo';
import { FileSystem, DocumentPicker } from 'expo-document-picker';
import { CircleEllipsisIcon, MoreVertical, Lock } from './Icons';
import { ColorPicker, Preview, Panel1, HueSlider, Swatches } from 'react-native-color';
import { NativeList, NativeItem, NativeText } from './NativeComponents';
import { Menu, Divider } from 'react-native-paper';
import { GetUIColors } from './Theme';
import { formatCoursName } from './Helpers';
import SyncStorage from 'sync-storage';
import ContextMenuButton from './ContextMenuButton';

const CoursColor: React.FC = ({ navigation }) => {
  const [savedColors, setSavedColors] = useState<any>(JSON.parse(SyncStorage.get('savedColors')));
  const [colorModalOpen, setColorModalOpen] = useState<boolean>(false);
  const [colorModalColor, setColorModalColor] = useState<string>('');
  const [currentEditedSubject, setCurrentEditedSubject] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const UIColors = GetUIColors();

  useEffect(() => {
    if (!SyncStorage.get('savedColors')) {
      SyncStorage.set('savedColors', JSON.stringify({}));
    }
  }, []);

  const onSelectColor = (color: string) => {
    setColorModalColor(color);
  };

  const onSave = () => {
    let newCol = { ...savedColors };
    newCol[currentEditedSubject] = {
      ...newCol[currentEditedSubject],
      color: colorModalColor,
    };
    setSavedColors(newCol);
    SyncStorage.set('savedColors', JSON.stringify(newCol));
    setColorModalOpen(false);
  };

  const ApplyRandomColors = () => {
    let newCol: any = {};

    Object.keys(savedColors).forEach((key) => {
      newCol[key] = {
        ...savedColors[key],
        color: '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0'),
      };
    });

    setSavedColors(newCol);
    SyncStorage.set('savedColors', JSON.stringify(newCol));
  };

  const ResetColors = () => {
    Alert.alert(
      'Reset Colors?',
      'Are you sure you want to reset the colors? This action is irreversible.',
      [
        {
          text: 'Reset',
          onPress: () => {
            setSavedColors({});
            SyncStorage.set('savedColors', JSON.stringify({}));
          },
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const exportColors = async () => {
    await FileSystem.writeAsStringAsync(
      FileSystem.documentDirectory + 'Papillon_CouleursMatieres_' + new Date().toISOString() + '.json',
      JSON.stringify(savedColors)
    );

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const ImportColors = async () => {
    const file = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
    });

    if (file.assets.length > 0) {
      const data = await FileSystem.readAsStringAsync(file.assets[0].uri);
      const json = JSON.parse(data);

      let newCol = JSON.parse(SyncStorage.get('savedColors'));

      Object.keys(json).forEach((key) => {
        newCol[key] = json[key];
      });

      Alert.alert(
        'Import Colors',
        'Do you really want to import these colors?',
        [
          {
            text: 'Import',
            onPress: () => {
              setSavedColors(newCol);
              SyncStorage.set('savedColors', JSON.stringify(newCol));

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
            style: 'destructive',
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    }
  };

  // add dice button in header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        if (Platform.OS === 'ios') {
          return (
            <ContextMenuButton
              isMenuPrimaryAction={true}
              accessible={true}
              accessibilityLabel="Menu"
              menuConfig={{
                menuTitle: '',
                menuItems: [
                  {
                    actionKey: 'randomColor',
                    actionTitle: 'Apply Random Colors',
                    icon: {
                      type: 'IMAGE_SYSTEM',
                      imageValue: {
                        systemName: 'dice',
                      },
                    },
                  },
                  {
                    menuTitle: 'Import / Export',
                    icon: {
                      type: 'IMAGE_SYSTEM',
                      imageValue: {
                        systemName: 'square.and.arrow.up',
                      },
                    },
                    menuItems: [
                      {
                        actionKey: 'exportColors',
                        actionTitle: 'Export Colors',
                        icon: {
                          type: 'IMAGE_SYSTEM',
                          imageValue: {
                            systemName: 'square.and.arrow.up',
                          },
                        },
                      },
                      {
                        actionKey: 'importColors',
                        actionTitle: 'Import Colors',
                        icon: {
                          type: 'IMAGE_SYSTEM',
                          imageValue: {
                            systemName: 'square.and.arrow.down',
                          },
                        },
                      },
                    ],
                  },
                  {
                    menuTitle: '',
                    menuOptions: ['displayInline', 'destructive'],
                    menuItems: [
                      {
                        actionKey: 'resetColor',
                        actionTitle: 'Reset Colors',
                        menuAttributes: ['destructive'],
                        icon: {
                          type: 'IMAGE_SYSTEM',
                          imageValue: {
                            systemName: 'arrow.uturn.left',
                          },
                        },
                      },
                    ],
                  },
                ],
              }}
              onPressMenuItem={({ nativeEvent }) => {
                if (nativeEvent.actionKey == 'randomColor') {
                  Alert.alert(
                    'Replace Colors?',
                    'Are you sure you want to modify the colors? This action is irreversible.',
                    [
                      {
                        text: 'Modify',
                        onPress: () => {
                          ApplyRandomColors();
                        },
                        style: 'destructive',
                      },
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                    ],
                    { cancelable: true }
                  );
                } else if (nativeEvent.actionKey == 'resetColor') {
                  Alert.alert(
                    'Reset Colors?',
                    'Are you sure you want to reset the colors? This action is irreversible.',
                    [
                      {
                        text: 'Reset',
                        onPress: () => {
                          ResetColors();
                        },
                        style: 'destructive',
                      },
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                    ],
                    { cancelable: true }
                  );
                } else if (nativeEvent.actionKey == 'exportColors') {
                  exportColors();
                } else if (nativeEvent.actionKey == 'importColors') {
                  ImportColors();
                }
              }}
            >
              <TouchableOpacity>
                <CircleEllipsisIcon color={UIColors.primary}></CircleEllipsisIcon>
              </TouchableOpacity>
            </ContextMenuButton>
          );
        } else {
          return (
            <TouchableOpacity
              onPress={() => {
                setMenuOpen(true);
              }}
            >
              <MoreVertical size={22} color={UIColors.primary}></MoreVertical>
            </TouchableOpacity>
          );
        }
      },
    });
  }, [navigation]);

  return (
    <ScrollView style={{ backgroundColor: UIColors.background, flex: 1 }}>
      <View style={{ padding: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: 'Papillon-Medium', fontSize: 20, color: UIColors.text }}>Couleurs des Matières</Text>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={{
                backgroundColor: UIColors.primary + 'AA',
                borderRadius: 50,
                padding: 7,
                paddingHorizontal: 10,
                justifyContent: 'center',
              }}
              onPress={() => {
                ApplyRandomColors();
              }}
            >
              <Text style={{ fontFamily: 'Papillon-Semibold', fontSize: 14, color: '#FFF' }}>Aléatoire</Text>
            </TouchableOpacity>
          )}
        </View>
        <NativeList>
          {Object.keys(savedColors).map((key) => {
            if (savedColors[key].color && savedColors[key].originalCourseName) {
              return (
                <NativeItem
                  key={key}
                  leading={
                    <TouchableOpacity
                      style={{
                        backgroundColor: savedColors[key].color,
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        margin: 5,
                      }}
                      onPress={() => {
                        setColorModalOpen(true);
                        setColorModalColor(savedColors[key].color);
                        setCurrentEditedSubject(key);
                      }}
                    ></TouchableOpacity>
                  }
                  onPress={() => {
                    setColorModalOpen(true);
                    setColorModalColor(savedColors[key].color);
                    setCurrentEditedSubject(key);
                  }}
                  trailing={
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: 15,
                        margin: -15,
                        marginRight: -20,
                      }}
                    >
                      <LockToggle
                        color={savedColors[key].color}
                        value={savedColors[key].locked}
                        onValueChange={(value) => {
                          setSavedColors({
                            ...savedColors,
                            [key]: {
                              ...savedColors[key],
                              locked: value,
                            },
                          });
                        }}
                      />

                      <ContextMenuButton
                        isMenuPrimaryAction={true}
                        menuConfig={{
                          menuTitle: '',
                          menuItems: [
                            {
                              actionKey: 'delete',
                              actionTitle: 'Supprimer',
                              menuAttributes: ['destructive'],
                              icon: {
                                type: 'IMAGE_SYSTEM',
                                imageValue: {
                                  systemName: 'trash',
                                },
                              },
                            },
                          ],
                        }}
                        onPressMenuItem={({ nativeEvent }) => {
                          if (nativeEvent.actionKey === 'delete') {
                            let newCol = JSON.parse(SyncStorage.get('savedColors'));
                            delete newCol[key];
                            setSavedColors(newCol);
                            SyncStorage.set('savedColors', JSON.stringify(newCol));
                          }
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            Platform.OS === 'android' && moreActions(key);
                          }}
                          style={{
                            padding: 15,
                            margin: -15,
                          }}
                        >
                          <MoreVertical size={20} color={UIColors.text + '75'} />
                        </TouchableOpacity>
                      </ContextMenuButton>
                    </View>
                  }
                >
                  <NativeText heading="b">{formatCoursName(savedColors[key].originalCourseName)}</NativeText>
                  <NativeText heading="subtitle2">{savedColors[key].color.toUpperCase()}</NativeText>
                </NativeItem>
              );
            } else {
              return null;
            }
          })}
        </NativeList>

        <View style={{ height: 20 }} />

        <Modal visible={colorModalOpen} animationType="fade" transparent={true}>
          <View style={[styles.colorModalContainer]}>
            <View style={[styles.colorModal, { backgroundColor: UIColors.element }]}>
              <ColorPicker style={styles.picker} value={colorModalColor} onComplete={onSelectColor}>
                <Preview textStyle={{ fontFamily: 'Papillon-Semibold' }} />
                <Panel1 />
                <HueSlider />
                <Swatches />
              </ColorPicker>

              <View style={[styles.modalActions, { borderColor: UIColors.border }]}>
                <TouchableOpacity style={[styles.modalAction]} onPress={() => setColorModalOpen(false)}>
                  <Text style={[styles.modalActionText]}>Annuler</Text>
                </TouchableOpacity>
                <View style={{ width: 1, height: 47, backgroundColor: UIColors.border + '99' }} />
                <TouchableOpacity style={[styles.modalAction]} onPress={onSave}>
                  <Text style={[styles.modalActionText, { color: colorModalColor }]}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const LockToggle: React.FC<{ value: boolean; onValueChange: (value: boolean) => void; color: string }> = ({
  value,
  onValueChange,
  color,
}) => {
  const [locked, setLocked] = useState<boolean>(value);
  const UIColors = GetUIColors();

  return (
    <TouchableOpacity
      onPress={() => {
        setLocked(!locked);
        onValueChange(!locked);
      }}
      style={[
        {
          backgroundColor: UIColors.text + '15',
          padding: 7,
          borderRadius: 100,
          margin: 5,
          marginRight: 0,
        },
        locked
          ? {
              backgroundColor: UIColors.theme === 'dark' ? UIColors.text : UIColors.primary,
            }
          : {},
      ]}
    >
      <Lock
        size={19}
        color={locked ? UIColors.modalBackground : UIColors.text}
        style={[!locked ? { opacity: 0.4 } : {}]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  colorModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000aa',
  },
  colorModal: {
    width: '70%',
    borderRadius: 20,
    borderCurve: 'continuous',
  },

  picker: {
    gap: 14,
    padding: 18,
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 48,
    borderTopWidth: 1,
  },
  modalAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalActionText: {
    fontFamily: 'Papillon-Semibold',
    fontSize: 16,
  },

  colorPreview: {
    width: 48,
    height: 20,
    borderRadius: 6,
    borderCurve: 'continuous',
    marginRight: 2,
  },
});

export default CoursColor;
