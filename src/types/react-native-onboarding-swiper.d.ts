// Fichier : src/types/react-native-onboarding-swiper.d.ts

declare module 'react-native-onboarding-swiper' {
  import * as React from 'react';
    import { TextStyle, ViewStyle } from 'react-native';

  // Déclare un type simplifié pour le composant (peut être ajusté si nécessaire)
  interface OnboardingProps {
    // CORRECTION APPLIQUÉE ICI : Remplacement de Array<{...}> par { ... }[]
    pages: {
      backgroundColor: string;
      image: React.ReactNode;
      title: string;
      subtitle: string;
      titleStyles?: TextStyle;
      subTitleStyles?: TextStyle;
      containerStyles?: ViewStyle;
    }[]; // <--- Utilisation de la syntaxe de tableau T[]
    
    onSkip: () => void;
    onDone: () => void;
    
    // Props additionnelles
    bottomBarColor?: string;
    showSkip?: boolean;
    showNext?: boolean;
    showDone?: boolean;
    
    // Ajoutez toute autre prop de composant que vous utilisez, par exemple :
    // nextLabel?: React.ReactNode; 
    // skipLabel?: React.ReactNode;
    // DoneButtonComponent?: React.ComponentType<any>;
  }

  const Onboarding: React.FC<OnboardingProps>;
  export default Onboarding;
}