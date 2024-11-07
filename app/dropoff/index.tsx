import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Button,
} from "react-native";
import MapView from "react-native-maps";
import { useState, useEffect } from "react";

import * as Location from "expo-location";

import { Marker } from "react-native-maps";
import { router, useLocalSearchParams } from "expo-router";

export default function HomeScreen() {
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<any>(null);
  const [searchResult, setSearchResult] = useState<any>();
  const [dropoffLocation, setDropoffLocation] = useState<any>();

  const params = useLocalSearchParams();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync();
      setLocation(location);

      // Location.watchPositionAsync(
      //   { accuracy: 6, distanceInterval: 1, timeInterval: 2000 },
      //   (location) => {
      //     setLocation(location);
      //   }
      // );
    })();
  }, []);

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  const searchedText = (text: string) => {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: "fsq3vFHPaRiCR4XeOaUvbAoLM2CIw+TICYoMwO8RQkSHuJ4=",
      },
    };

    fetch(
      `https://api.foursquare.com/v3/places/search?query=${text}&ll=${location.coords.latitude},${location.coords.longitude}`,
      options
    )
      .then((response) => response.json())
      .then((response) => setSearchResult(response.results))
      .catch((err) => console.error(err));
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter Dropoff Location..."
        style={{
          marginTop: 10,
          marginLeft: 10,
          borderWidth: 2,
          borderRadius: 6,
          marginRight: 10,
          padding: 5,
        }}
        onChangeText={searchedText}
      />

      {searchResult &&
        !dropoffLocation &&
        searchResult.map((item: any, index: any) => {
          return (
            <TouchableOpacity
              key={index}
              style={{ marginLeft: 10, marginTop: 12 }}
              onPress={() => setDropoffLocation(item)}
            >
              <Text>
                {item.name} | {item.location.formatted_address}
              </Text>
            </TouchableOpacity>
          );
        })}

      {params && (
        <View style={{ marginLeft: 10, marginTop: 10 }}>
          <Text>Pickup Location Selected: {params.name}</Text>
        </View>
      )}

      {dropoffLocation && (
        <View style={{ marginLeft: 10, marginTop: 10 }}>
          <Text>Dropoff Location Selected: {dropoffLocation.name}</Text>
        </View>
      )}

      {location && (
        <MapView
          style={styles.mapview}
          region={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0002,
            longitudeDelta: 0.0001,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title={"My Home"}
          />
        </MapView>
      )}

      <TouchableOpacity style={styles.dropoffbtn}>
        <Button
          title="Car Selection"
          color="#4169E1"
          onPress={() =>
            router.push({
              pathname: "/carSelection",
              params: {
                pickupName: params.name,
                pickupAddress: params.address,
                pickupLatitude: params.latitude,
                pickupLongitude: params.longitude,
                dropoffName: dropoffLocation.name,
                dropoffAddress: dropoffLocation.location.formatted_address,
                dropoffLatitude: dropoffLocation.geocodes.main.latitude,
                dropoffLongitude: dropoffLocation.geocodes.main.longitude,
              },
            })
          }
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapview: {
    width: "100%",
    height: "80%",
  },
  dropoffbtn: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 10,
  },
});
