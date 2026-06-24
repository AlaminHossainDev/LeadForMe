"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  guestMode: boolean;
  setGuestMode: (val: boolean) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Initialise guestMode state from localStorage directly to avoid setState in effect
  const [guestMode, setGuestModeState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("leadforme_guest_mode");
      return saved === "true";
    }
    return true; // Default to guest mode so the preview is immediately interactive!
  });

  const [theme, setThemeState] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("leadforme_theme");
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
      } else {
        const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        setThemeState(prefersLight ? "light" : "dark");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("leadforme_theme", theme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setGuestMode = (val: boolean) => {
    setGuestModeState(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("leadforme_guest_mode", String(val));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        // Turn off guest mode if logged in
        setGuestMode(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setGuestMode(true); // Default back to guest mode
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        guestMode,
        setGuestMode,
        loginWithGoogle,
        logout,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
}
