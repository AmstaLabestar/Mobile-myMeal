import { useRouter } from 'expo-router';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { Alert } from 'react-native';
import api from '../api/api';

// ===== TYPES =====

interface Meal {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  cooker: { _id: string; nom: string; prenom: string };
}

export interface CartItem {
  id: string;
  mealId: string;
  name: string;
  price: number;
  quantity: number;
  cookerId: string;
  cooker: string;
  description?: string;
  imageUrl?: string;
}

export type OrderStatus =
  | "reçu"
  | "acceptée"
  | "refusée"
  | "préparée"
  | "en_livraison"
  | "livrée"
  | "cancelled"; 

export interface Order {
  id: string; 
  date: string;
  total: number;
  status: OrderStatus;
  itemsCount: number;
  items: CartItem[];
  createdAt?: string;
  deliveryAddress?: string;
  deliveryOption?: string;
}

interface CartOrderContextType {
  // Panier
  cartItems: CartItem[];
  addToCart: (meal: Meal) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;

  // Commandes
  orders: Order[];
  createOrderFromCart: (deliveryAddress: string, deliveryOption: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  loadOrders: () => Promise<void>;
}

// ===== CRÉATION DU CONTEXT =====
const CartOrderContext = createContext<CartOrderContextType | undefined>(undefined);

// ===== PROVIDER =====
export const CartOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  // === VIDER LE PANIER ===
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // === RETIRER DU PANIER ===
  const removeFromCart = useCallback((itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  }, []);
  
  // === CALCULER LE TOTAL ===
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // === AJOUTER AU PANIER ===
  const addToCart = useCallback((meal: Meal) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.mealId === meal._id);
      
      // VÉRIFICATION DE L'HOMOGÉNÉITÉ DU CUISINIER 
      if (prevItems.length > 0) {
        const firstCookerId = prevItems[0].cookerId;
        
        if (meal.cooker._id !== firstCookerId) {
          Alert.alert(
            "Panier non vide", 
            "Vous ne pouvez commander que des repas du même cuisinier à la fois."
          );
          return prevItems; 
        }
      }

      if (existingItem) {
        return prevItems.map((item) =>
          item.mealId === meal._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prevItems,
        {
          id: `${meal._id}-${Date.now()}`,
          mealId: meal._id,
          name: meal.name,
          price: meal.price || 0,
          quantity: 1,
          cookerId: meal.cooker._id,
          cooker: `${meal.cooker.prenom} ${meal.cooker.nom}`,
          description: meal.description,
          imageUrl: meal.imageUrl,
        },
      ];
    });
  }, []);

  // === MODIFIER QUANTITÉ ===
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);
  
  // ===================================
  // ✅ CORRIGÉ : CHARGEMENT DES COMMANDES DEPUIS L'API
  // ===================================
  const loadOrders = useCallback(async () => {
    try {
      const response = await api.get('/order/my-orders'); 
      
      console.log('📦 Données brutes du backend:', JSON.stringify(response.data, null, 2));
      
      const rawOrders = response.data.data?.orders || response.data.orders || [];
      
      // ✅ MAPPING CORRECT avec toutes les données nécessaires
      const formattedOrders: Order[] = rawOrders.map((order: any) => {
        // Extraire les items avec gestion des cas où meal peut être juste un ID
        const items: CartItem[] = (order.orderItems || order.items || []).map((item: any) => {
          const meal = item.meal || {};
          const cooker = meal.cooker || {};
          
          return {
            id: item._id || `item-${Date.now()}-${Math.random()}`,
            mealId: typeof meal === 'string' ? meal : (meal._id || ''),
            name: meal.name || 'Article',
            price: item.price || meal.price || 0,
            quantity: item.quantity || 1,
            cookerId: typeof cooker === 'string' ? cooker : (cooker._id || ''),
            cooker: cooker.prenom && cooker.nom 
              ? `${cooker.prenom} ${cooker.nom}` 
              : 'Cuisinier',
            description: meal.description,
            imageUrl: meal.imageUrl,
          };
        });

        // Calculer le nombre total d'items
        const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
        
        // Calculer le total si manquant
        const total = order.totalAmount 
          || order.total 
          || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        return {
          id: order._id,
          date: order.createdAt || order.date || new Date().toISOString(),
          createdAt: order.createdAt,
          total: total,
          status: order.status || 'reçu',
          itemsCount: itemsCount,
          items: items,
          deliveryAddress: order.deliveryAddress,
          deliveryOption: order.deliveryOption,
        };
      });
      
      console.log('✅ Commandes formatées:', JSON.stringify(formattedOrders, null, 2));
      
      setOrders(formattedOrders);
    } catch (error: any) {
      console.error("❌ Erreur de chargement des commandes:", error);
      console.error("Détails:", error.response?.data);
    }
  }, []);

  // ===================================
  // ✅ CORRIGÉ : CRÉER UNE COMMANDE
  // ===================================
  const createOrderFromCart = useCallback(
    async (deliveryAddress: string, deliveryOption: string) => {
      if (cartItems.length === 0) {
        Alert.alert('Erreur', 'Le panier est vide');
        return;
      }

      // Validation de l'adresse pour livraison
      if (deliveryOption === 'livraison' && !deliveryAddress) {
        Alert.alert('Erreur', 'Veuillez fournir une adresse pour la livraison.');
        return;
      }

      try {
        const cookerId = cartItems[0].cookerId;
        const orderData = {
          cookerId: cookerId,
          orderItems: cartItems.map(item => ({ 
            meal: item.mealId, 
            quantity: item.quantity,
            price: item.price // ✅ Ajout du prix pour calcul côté backend
          })),
          deliveryOption: deliveryOption,
          paymentMethod: 'cash',
          ...(deliveryOption === 'livraison' && { deliveryAddress }),
        };

        console.log('📤 Envoi de la commande:', orderData);

        // 1. Appel API POST
        const response = await api.post('/order', orderData); 
        
        console.log('📥 Réponse du serveur:', response.data);
        
        // 2. Récupération de la commande créée
        const newOrder = response.data.data?.order || response.data.order;
        
        if (!newOrder) {
          throw new Error('La commande n\'a pas été retournée par le serveur');
        }

        // 3. Formatage de la nouvelle commande
        const formattedItems: CartItem[] = (newOrder.orderItems || []).map((item: any) => {
          const meal = item.meal || {};
          const cooker = meal.cooker || {};
          
          return {
            id: item._id || `item-${Date.now()}`,
            mealId: typeof meal === 'string' ? meal : (meal._id || ''),
            name: meal.name || 'Article',
            price: item.price || meal.price || 0,
            quantity: item.quantity || 1,
            cookerId: typeof cooker === 'string' ? cooker : (cooker._id || ''),
            cooker: cooker.prenom && cooker.nom 
              ? `${cooker.prenom} ${cooker.nom}` 
              : 'Cuisinier',
          };
        });

        const formattedOrder: Order = {
          id: newOrder._id,
          date: newOrder.createdAt || new Date().toISOString(),
          createdAt: newOrder.createdAt,
          total: newOrder.totalAmount || cartTotal,
          status: newOrder.status || 'reçu',
          itemsCount: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
          items: formattedItems,
          deliveryAddress: newOrder.deliveryAddress,
          deliveryOption: newOrder.deliveryOption,
        };

        // 4. Mise à jour de l'état
        setOrders((prevOrders) => [formattedOrder, ...prevOrders]);
        clearCart();

        const orderId = newOrder._id;
        const shortId = `${orderId.slice(0, 4)}...${orderId.slice(-5)}`;

        Alert.alert(
          "Commande réussie ✅", 
          `Votre commande (${shortId}) a été enregistrée !`
        );
  
      } catch (error: any) {
        console.error("❌ Échec de la création de la commande:", error);
        console.error("Détails:", error.response?.data);
        Alert.alert(
          "Erreur", 
          error.response?.data?.message || "Une erreur est survenue lors de l'enregistrement de la commande."
        );
      }
    },
    [cartItems, cartTotal, clearCart]
  );

  // ===================================
  // ANNULER UNE COMMANDE
  // ===================================
  const cancelOrder = useCallback(async (orderId: string) => {
    try {
      await api.patch(`/order/${orderId}/cancel`); 

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );
      
      Alert.alert("Annulation", "La commande a été annulée avec succès.");
    } catch (error: any) {
      console.error("❌ Échec de l'annulation:", error);
      Alert.alert(
        "Erreur", 
        error.response?.data?.message || "Impossible d'annuler la commande."
      );
    }
  }, []);

  return (
    <CartOrderContext.Provider
      value={{
        // Propriétés du Panier
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        // Propriétés des Commandes
        orders,
        createOrderFromCart,
        cancelOrder,
        loadOrders, 
      }}
    >
      {children}
    </CartOrderContext.Provider>
  );
};

// ===== HOOK PERSONNALISÉ =====
export const useCartOrder = () => {
  const context = useContext(CartOrderContext);
  if (!context) {
    throw new Error('useCartOrder doit être utilisé dans CartOrderProvider');
  }
  return context;
};