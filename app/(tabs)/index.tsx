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
import { router } from "expo-router";

export default function HomeScreen() {
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<any>(null);
  const [searchResult, setSearchResult] = useState<any>();
  const [pickupLocation, setPickupLocation] = useState<any>();

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
        placeholder="Enter Pickup Location..."
        style={{
          marginTop: 40,
          marginLeft: 10,
          borderWidth: 2,
          borderRadius: 5,
          marginRight: 10,
          padding: 5,
        }}
        onChangeText={searchedText}
      />

      {searchResult &&
        !pickupLocation &&
        searchResult.map((item: any, index: number) => {
          return (
            <TouchableOpacity
              key={index}
              style={{ marginLeft: 10, marginTop: 12 }}
              onPress={() => setPickupLocation(item)}
            >
              <Text>
                {item.name} | {item.location.formatted_address}
              </Text>
            </TouchableOpacity>
          );
        })}

      {pickupLocation && (
        <View>
          <Text style={{ marginLeft: 10, marginTop: 10 }}>
            Pickup Location Selected: {pickupLocation.name}
          </Text>
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
          title="Dropoff"
          color="#4169E1"
          onPress={() =>
            router.push({
              pathname: "/dropoff",
              params: {
                name: pickupLocation.name,
                address: pickupLocation.location.formatted_address,
                latitude: pickupLocation.geocodes.main.latitude,
                longitude: pickupLocation.geocodes.main.longitude,
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
    height: "100%",
  },
  dropoffbtn: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 10,
  },
});
