import { useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MapView, { Marker, Callout } from 'react-native-maps';


import mapMarker from '../../images/map-marker.png';
import * as Location from 'expo-location';

import api from '../../services/api';
import {
  Button,
  Container,
  ContainerCallout,
  ContainerFooter,
  ContainerMap,
  Icon,
  TextCallout,
  TextFooter
} from './styles';

import IAssociation from '../../dto/Issociation';

type Coords = {
  latitude: number;
  longitude: number;
}
export function OrphanagesMap() {

  const [associations, setAssociations] = useState<IAssociation[]>([] as IAssociation[]);
  const [currentLocation, setCurrentLocation] = useState<Coords | null>(null);

  const navigation = useNavigation();

  function handlerNavigateToOrphanageDetails(id: number) {
    navigation.navigate('OrphanageDetails', { id });
  }

  function handleNavigateToCreateOrphanage() {
    navigation.navigate('SelectMapPosition');
  }

  async function getMyLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert("é necessário habilitar a permissão para acesso a sua localização");
      return;
    }
    let localization = await Location.getCurrentPositionAsync();
    setCurrentLocation(localization.coords);

  }

  // sempre que o usuário sair e voltar da tela, ela é disparada
  useFocusEffect(() => {
    getMyLocation();
    api.get('associations/all').then(response => {
      setAssociations(response.data);
    }).catch(error => console.log(error));
  });

  return (
    <Container>
      {currentLocation &&
        <MapView
          style={{ width: "100%", height: '100%' }}
          showsUserLocation={true}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008
          }}
          loadingEnabled
        >
          {
            associations.map(association => (
              <Marker
                key={association.id}
                icon={mapMarker}
                coordinate={{
                  latitude: association.latitude,
                  longitude: association.longitude,
                }}
                calloutAnchor={{ x: 2.7, y: 0.8 }}
              >
                <Callout
                  tooltip={true}
                  onPress={() => handlerNavigateToOrphanageDetails(association.id)}
                >
                  <ContainerCallout>
                    <TextCallout>{association.name}</TextCallout>
                  </ContainerCallout>
                </Callout>
              </Marker>
            ))
          }
        </MapView>
      }

      <ContainerFooter style={{ elevation: 3, shadowOffset: { width: 0, height: 3 } }}>
        <TextFooter> {associations.length} associação </TextFooter>

        <Button onPress={handleNavigateToCreateOrphanage}>
          <Icon name="plus" size={20} color="#fff" />
        </Button>
      </ContainerFooter>

    </Container>
  );
}

