import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  addDataToDb,
  collection,
  db,
  onSnapshot,
  query,
} from "../../config/firebase";

export default function HomeScreen() {
  const params = useLocalSearchParams();
  // console.log(params);

  const {
    pickupLatitude,
    pickupLongitude,
    pickupAddress,
    pickupName,
    dropoffLatitude,
    dropoffLongitude,
    dropoffAddress,
    dropoffName,
  } = params;

  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<any>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [vehicle, setVehicle] = useState<string | null>(null);
  const [lineCoords, setLineCoords] = useState<any[]>([]);

  useEffect(() => {
    getLocation();
    rideStatusListener();
    if (
      pickupLatitude &&
      pickupLongitude &&
      dropoffLatitude &&
      dropoffLongitude
    ) {
      setLineCoords([
        {
          latitude: Number(pickupLatitude),
          longitude: Number(pickupLongitude),
        },
        {
          latitude: Number(dropoffLatitude),
          longitude: Number(dropoffLongitude),
        },
      ]);
    }
  }, [pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude]);

  const getLocation = () => {
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
  };

  const rideStatusListener = async () => {
    const q = query(collection(db, "Ride"));
    onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const rideStatus = doc.data().status;
        const rideId = doc.id;
        if (rideStatus === "accepted") {
          Alert.alert(`Ride Accepted`);
        }
        //  else if (rideStatus === "rejected") {
        //   Alert.alert(`Ride Rejected`);
        // }
      });
    });
  };

  const rates: { [key: string]: number } = {
    bike: 70,
    rickshaw: 110,
    mini: 170,
    AcCar: 224,
  };

  function calculateFare(vehicle: string) {
    const baseFare = rates[vehicle];
    const distance = calcCrow(
      Number(pickupLatitude),
      Number(pickupLongitude),
      Number(dropoffLatitude),
      Number(dropoffLongitude)
    );
    const fare = baseFare * distance;

    if (isNaN(fare) || fare <= 0) {
      Alert.alert("Error", "Unable to calculate fare. Please check inputs.");
      return;
    }

    setFare(Math.round(fare));
    setVehicle(vehicle);

    Alert.alert(
      "Estimated Fare!",
      `Your Est. fare will be ${Math.round(fare)}`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: sendDataToDb },
      ]
    );
  }

  function calcCrow(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
  }

  function toRad(Value: number) {
    return (Value * Math.PI) / 180;
  }

  const sendDataToDb = async () => {
    if (fare === null || vehicle === null) {
      Alert.alert("Error", "Fare or vehicle type is missing.");
      return;
    }

    const ride = {
      pickup: {
        pickupLatitude,
        pickupLongitude,
        pickupAddress,
        pickupName,
      },
      dropOff: {
        dropoffLatitude,
        dropoffLongitude,
        dropoffAddress,
        dropoffName,
      },
      fare,
      vehicle,
      status: "pending",
    };

    try {
      await addDataToDb(ride);
      Alert.alert("Ride request is pending.");
    } catch (e) {
      Alert.alert(
        "Error",
        "There was an issue adding the data. Please try again."
      );
      console.error("Error adding document: ", e);
    }
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.mapview}
          region={{
            latitude: Number(pickupLatitude),
            longitude: Number(pickupLongitude),
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }}
        >
          <Marker
            coordinate={{
              latitude: Number(pickupLatitude),
              longitude: Number(pickupLongitude),
            }}
            title={params.pickupName ? String(params.pickupName) : undefined}
          />

          <Marker
            coordinate={{
              latitude: Number(dropoffLatitude),
              longitude: Number(dropoffLongitude),
            }}
            title={params.dropoffName ? String(params.dropoffName) : undefined}
          />
          {lineCoords.length > 0 && (
            <Polyline
              coordinates={lineCoords}
              strokeColor="#FF6347"
              strokeWidth={3}
            />
          )}
        </MapView>
      )}

      <View style={styles.cardContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <TouchableOpacity
            style={styles.card}
            onPress={() => calculateFare("bike")}
          >
            <Image
              source={require("../../assets/bik.png")}
              style={styles.cardImage}
            />
            <Text style={styles.cardText}>Bike</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => calculateFare("rickshaw")}
          >
            <Image
              source={require("../../assets/rickshaw.png")}
              style={styles.cardImage}
            />
            <Text style={styles.cardText}>Rickshaw</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => calculateFare("mini")}
          >
            <Image
              source={require("../../assets/mini.png")}
              style={styles.cardImage}
            />
            <Text style={styles.cardText}>Mini</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => calculateFare("AcCar")}
          >
            <Image
              source={require("../../assets/ac.png")}
              style={styles.cardImage}
            />
            <Text style={styles.cardText}>Ac Car</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
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
  cardContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#efefef",
    paddingVertical: 10,
  },
  scrollContainer: {
    paddingHorizontal: 15,
  },
  card: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    width: 120,
    height: 100,
  },
  cardImage: {
    width: 80,
    height: 80,
    marginBottom: 6,
  },
  cardText: {
    color: "black",
    fontWeight: "bold",
    paddingBottom: 6,
  },
});
