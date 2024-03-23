import React, { useState, useEffect } from 'react';
import { Alert, Animated, ScrollView, ActivityIndicator, Modal, StatusBar, Platform, View, TouchableOpacity, StyleSheet, Button } from 'react-native';

import { Text } from 'react-native-paper';
import * as InAppPurchases from '@legeek01/expo-in-app-purchases';
import GetUIColors from '../../utils/GetUIColors';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

interface Product {
  productId: string;
  title: string;
  description: string;
  price: string;
}

const PaymentScreen = ({ navigation }: { navigation: any }) => {
  const UIColors = GetUIColors();
  const [products, setProducts] = useState<Product[]>([]);

  const [hasAlreadyBought, setHasAlreadyBought] = useState<boolean>(false);
  const [currentlyBuying, setCurrentlyBuying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // restore purchases button in header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setCurrentlyBuying(true);
            InAppPurchases.getPurchaseHistoryAsync().then((history: any) => {
              setCurrentlyBuying(false);
              
              if (history.results.length > 0) {
                setHasAlreadyBought(true);
                AsyncStorage.setItem('hasAlreadyBought', 'true');
              }
              else {
                setHasAlreadyBought(false);
                AsyncStorage.setItem('hasAlreadyBought', 'false');
              }

              Alert.alert(
                'Achats restaurés',
                'Tous vos achats ont été restaurés avec succès.',
                [
                  {
                    text: 'OK',
                    style: 'default',
                  },
                ],
                {
                  cancelable: true,
                }
              );
            });
          }}
        >
          <NativeText heading="p" style={{color: UIColors.primary, fontFamily : 'Papillon-Medium', fontSize: 17}}>
            Restaurer
          </NativeText>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  React.useLayoutEffect(() => {
    return () => {
      InAppPurchases.disconnectAsync();
    };
  }, []);

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        await InAppPurchases.connectAsync();
      } catch (error) {
      }
      const { responseCode, results } = await InAppPurchases.getProductsAsync([
        'chenille2',
        'cocon2',
        'papillon2',
      ]);
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        console.log('Products', results);
        setProducts(results);
      }

      AsyncStorage.getItem('hasAlreadyBought').then((value) => {
        if (value === 'true') {
          setHasAlreadyBought(true);
        }
      });

      setLoading(false);
    };

    getProducts();
  }, []);

  async function subGrade(productID: string) {
    const item = products.find((item) => item.productId === productID);
    if (item) {
      setCurrentlyBuying(true);
      InAppPurchases.purchaseItemAsync(item.productId).then(() => {
        setCurrentlyBuying(false);
      });
    }
  }

  // purchase listener
  useEffect(() => {
    InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }: any) => {
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        results.forEach((purchase: any) => {
          if (!purchase.acknowledged) {
            console.log(`Successfully purchased ${purchase.productId}`);
            // Process transaction here and unlock content...
            InAppPurchases.finishTransactionAsync(purchase, true);

            AsyncStorage.setItem('hasAlreadyBought', 'true').then(() => {
              setHasAlreadyBought(true);
            });
          }
        });
      }
    });
  }, []);

  return (
    <View style={{
      flex: 1,
      backgroundColor: UIColors.modalBackground,
    }}>
      <LinearGradient
        colors={['#29947a88', '#29947a00']}
        locations={[0, 0.3]}
        style={{
          flex: 1,
        }}
      >
        <ScrollView
          contentInsetAdjustmentBehavior='automatic'
        >
          <Modal
            animationType="fade"
            transparent={true}
            visible={currentlyBuying}
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#000000a5',
              gap: 10,
            }}>
              <ActivityIndicator color="#ffffff" />
              <NativeText heading="p" style={{color: '#ffffff'}}>
                Communication avec l'App Store...
              </NativeText>
            </View>
          </Modal>

          <NativeText style={[styles.donateEmoji]}>
            💸🦋💚
          </NativeText>

          <View
            style={[styles.donateTitle]}
          >
            <NativeText style={[styles.donateTitleText]}>
              Soutenez une application créée pour vous.
            </NativeText>
          </View>

          {hasAlreadyBought && (
            <NativeList style={{
              shadowColor: '#000000',
              shadowOpacity: 0.15,
              shadowRadius: 4,
              shadowOffset: {
                width: 0,
                height: 0,
              },
            }}>
              <NativeItem
                leading={
                  <NativeText heading="h1">
                    🎉
                  </NativeText>
                }
              >
                <NativeText heading="h4">
                  Merci pour votre soutien !
                </NativeText>
                <NativeText heading="p2" style={{fontSize: 15}}>
                  Vos dons permettent de financer les coûts de développement et aident les développeurs à continuer à travailler sur l'application.
                </NativeText>
              </NativeItem>
            </NativeList>
          )}

          <NativeText style={[styles.donateDescription]}>
            Papillon est une application libre développée majoritairement par des lycéens sur leur temps libre. Elle est gratuite et sans publicité. Si vous souhaitez soutenir le projet, vous pouvez faire un don à notre équipe pour financer les coûts de développement et faire perdurer l'application.
          </NativeText>

          { !loading ? (
            <NativeList 
              inset
              header="Pourboire unique">
              {products.map((product) => (
                <NativeItem
                  key={product.productId}
                  onPress={() => subGrade(product.productId)}

                  leading={
                    <NativeText heading="h1" style={{fontSize: 30}}>
                      {
                        product.productId === 'chenille2' ? '🐛' :
                          product.productId === 'cocon2' ? '🪺' :
                            '🦋'
                      }
                    </NativeText>
                  }
                  trailing={
                    <NativeText heading="p" style={{marginLeft: 5}}>
                      {product.price}
                    </NativeText>
                  }
                >
                  <NativeText heading="h4">
                    {product.title}
                  </NativeText>
                  <NativeText heading="p2">
                    {product.description}
                  </NativeText>
                </NativeItem>
              ))}
            </NativeList>
          ) : (
            <NativeList 
              header="Pourboire unique"
            >
              <NativeItem
                leading={
                  <ActivityIndicator />
                }
              >
                <NativeText heading="p2">
                  Chargement des options disponibles...
                </NativeText>
              </NativeItem>
            </NativeList>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  donateTitle: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 20,
  },
  donateTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Papillon-Semibold',
  },
  donateTitleEmphaseText: {
    color: '#32AB8E',
  },

  donateDescription: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    fontSize: 15,
    lineHeight: 20,
    opacity: 0.6,
  },

  donateEmoji: {
    fontSize: 42,
    textAlign: 'left',
    paddingTop: 20,
    paddingLeft: 20,
    letterSpacing: 10,
  },
});

export default PaymentScreen;
