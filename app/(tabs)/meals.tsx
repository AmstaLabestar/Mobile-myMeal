import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import api from "../../src/api/api";

const COLORS = {
  primary: "#FF6347",
  background: "#F9F9F9",
  card: "#FFFFFF",
  text: "#333333",
  price: "#228B22",
  placeholderText: "#A0A0A0",
};

interface Meal {
  _id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

export default function MealsScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/meals");
        setMeals(res.data.data || res.data);
      } catch (e: any) {
        console.error("Erreur fetch meals:", e.response?.data || e.message);
        setError("Impossible de charger les repas.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  // 💥 CORRECTION PRINCIPALE ICI 💥
  // On vérifie si 'meals' est un tableau. Si ce n'est pas le cas, on utilise un tableau vide [].
  const filteredMeals = Array.isArray(meals)
    ? meals.filter(
        (meal) =>
          meal.name.toLowerCase().includes(search.toLowerCase()) ||
          meal.description?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.text }}>
          Chargement des repas...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={50}
          color={COLORS.primary}
        />
        <Text style={{ color: COLORS.primary, fontWeight: "bold", marginTop: 10 }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Tous nos Repas</Text>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchBar}>
        <Ionicons
          name="search-outline"
          size={20}
          color={COLORS.placeholderText}
          style={{ marginRight: 10 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un repas..."
          placeholderTextColor={COLORS.placeholderText}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* MEALS LIST */}
      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.cardImage,
                    {
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: COLORS.background,
                    },
                  ]}
                >
                  <Ionicons
                    name="image-outline"
                    size={40}
                    color={COLORS.placeholderText}
                  />
                </View>
              )}

              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}

                <View style={styles.cardFooter}>
                  <Text style={styles.cardPrice}>
                    {item.price.toLocaleString()} FCFA
                  </Text>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="search-outline"
              size={50}
              color={COLORS.placeholderText}
              style={{ marginBottom: 10 }}
            />
            <Text style={{ textAlign: "center", color: COLORS.text }}>
              {search
                ? "Aucun repas trouvé."
                : "Aucun repas disponible."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  header: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.placeholderText + "30",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardImage: {
    width: 100,
    height: 100,
  },
  cardText: {
    flex: 1,
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.placeholderText,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPrice: {
    fontSize: 16,
    color: COLORS.price,
    fontWeight: "700",
  },
});