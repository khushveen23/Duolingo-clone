export interface KeyPhrase {
  id: string;
  phrase: string;
  translation: string;
  audioLanguage?: string;
}

export interface GrammarTip {
  id: string;
  title: string;
  summary: string;
  content: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
  examples?: {
    source: string;
    target: string;
  }[];
}

export interface UnitGuidebookData {
  unitId: number;
  unitOrder: number;
  unitTitle: string;
  unitDescription: string;
  themeColor: {
    bg: string;
    border: string;
    badge: string;
    lightBg: string;
  };
  keyPhrasesTitle: string;
  keyPhrases: KeyPhrase[];
  grammarTips: GrammarTip[];
}

export const GUIDEBOOKS: Record<number, UnitGuidebookData> = {
  1: {
    unitId: 1,
    unitOrder: 1,
    unitTitle: "Unit 1: Foundations",
    unitDescription: "Explore grammar tips and key phrases for this unit",
    themeColor: {
      bg: "bg-duo-green",
      border: "border-duo-green-dark",
      badge: "text-duo-green bg-green-50 border-green-200",
      lightBg: "bg-emerald-50/60",
    },
    keyPhrasesTitle: "Greet people and introduce yourself",
    keyPhrases: [
      {
        id: "p1-1",
        phrase: "¡Hola! ¿Cómo te llamas?",
        translation: "Hello! What is your name?",
        audioLanguage: "es-ES",
      },
      {
        id: "p1-2",
        phrase: "Mucho gusto, me llamo Carlos.",
        translation: "Nice to meet you, my name is Carlos.",
        audioLanguage: "es-ES",
      },
      {
        id: "p1-3",
        phrase: "Buenos días, ¿cómo estás hoy?",
        translation: "Good morning, how are you today?",
        audioLanguage: "es-ES",
      },
      {
        id: "p1-4",
        phrase: "Muy bien, gracias. ¿Y tú?",
        translation: "Very well, thank you. And you?",
        audioLanguage: "es-ES",
      },
      {
        id: "p1-5",
        phrase: "Por favor y muchas gracias.",
        translation: "Please and thank you very much.",
        audioLanguage: "es-ES",
      },
      {
        id: "p1-6",
        phrase: "Hasta luego, que tengas un buen día.",
        translation: "See you later, have a good day.",
        audioLanguage: "es-ES",
      },
    ],
    grammarTips: [
      {
        id: "gt1-1",
        title: "Masculine vs. Feminine Nouns",
        summary: "In Spanish, every noun has a gender (masculine or feminine).",
        content:
          "Nouns ending in '-o' are almost always masculine and use the article 'el'. Nouns ending in '-a' are usually feminine and use the article 'la'.",
        table: {
          headers: ["Masculine (el)", "Feminine (la)", "Meaning"],
          rows: [
            ["el niño", "la niña", "the boy / the girl"],
            ["el hombre", "la mujer", "the man / the woman"],
            ["el pan", "la manzana", "the bread / the apple"],
            ["el libro", "la mesa", "the book / the table"],
          ],
        },
        examples: [
          { source: "El niño come pan.", target: "The boy eats bread." },
          { source: "La niña bebe agua.", target: "The girl drinks water." },
        ],
      },
      {
        id: "gt1-2",
        title: "The Verb 'Ser' (To Be)",
        summary: "Use 'ser' for identity, nationality, and permanent traits.",
        content:
          "Unlike English where 'to be' has am/is/are, Spanish verbs conjugate based on the subject pronoun.",
        table: {
          headers: ["Pronoun", "Conjugation (Ser)", "Example"],
          rows: [
            ["Yo", "soy", "Yo soy un hombre (I am a man)"],
            ["Tú", "eres", "Tú eres una niña (You are a girl)"],
            ["Él / Ella", "es", "Él es Carlos (He is Carlos)"],
            ["Nosotros", "somos", "Nosotros somos amigos (We are friends)"],
          ],
        },
      },
      {
        id: "gt1-3",
        title: "Omitting Subject Pronouns",
        summary: "In Spanish, pronouns like 'Yo' or 'Tú' are often optional.",
        content:
          "Because verb endings like '-o' in 'bebo' already tell you who is doing the action, native speakers often drop 'Yo': 'Bebo agua' means the same as 'Yo bebo agua'.",
      },
    ],
  },
  2: {
    unitId: 2,
    unitOrder: 2,
    unitTitle: "Unit 2: Daily Life & Dining",
    unitDescription: "Explore grammar tips and key phrases for this unit",
    themeColor: {
      bg: "bg-duo-blue",
      border: "border-duo-blue-dark",
      badge: "text-duo-blue bg-blue-50 border-blue-200",
      lightBg: "bg-sky-50/60",
    },
    keyPhrasesTitle: "Order food and talk about family",
    keyPhrases: [
      {
        id: "p2-1",
        phrase: "Una mesa para dos personas, por favor.",
        translation: "A table for two people, please.",
        audioLanguage: "es-ES",
      },
      {
        id: "p2-2",
        phrase: "Quisiera pedir un vaso de agua fría.",
        translation: "I would like to order a glass of cold water.",
        audioLanguage: "es-ES",
      },
      {
        id: "p2-3",
        phrase: "¿Tienen opciones vegetarianas en el menú?",
        translation: "Do you have vegetarian options on the menu?",
        audioLanguage: "es-ES",
      },
      {
        id: "p2-4",
        phrase: "La comida está realmente deliciosa.",
        translation: "The food is really delicious.",
        audioLanguage: "es-ES",
      },
      {
        id: "p2-5",
        phrase: "¿Nos puede traer la cuenta, por favor?",
        translation: "Could you bring us the check, please?",
        audioLanguage: "es-ES",
      },
      {
        id: "p2-6",
        phrase: "Mi hermano vive en una casa grande con mi familia.",
        translation: "My brother lives in a big house with my family.",
        audioLanguage: "es-ES",
      },
    ],
    grammarTips: [
      {
        id: "gt2-1",
        title: "Plural Nouns and Articles",
        summary: "Make nouns plural by adding -s or -es.",
        content:
          "When a noun becomes plural, its article must match: 'el' becomes 'los' and 'la' becomes 'las'.",
        table: {
          headers: ["Singular", "Plural", "Meaning"],
          rows: [
            ["el taco", "los tacos", "the tacos"],
            ["la manzana", "las manzanas", "the apples"],
            ["el restaurante", "los restaurantes", "the restaurants"],
            ["la mujer", "las mujeres", "the women"],
          ],
        },
      },
      {
        id: "gt2-2",
        title: "Adjective Placement & Agreement",
        summary: "In Spanish, descriptive adjectives come AFTER the noun.",
        content:
          "Adjectives must also match the gender and number of the noun they describe: 'casa grande' (feminine singular), 'libros rojos' (masculine plural).",
        examples: [
          { source: "Una casa pequeña", target: "A small house" },
          { source: "El café caliente", target: "The hot coffee" },
        ],
      },
    ],
  },
  3: {
    unitId: 3,
    unitOrder: 3,
    unitTitle: "Unit 3: Exploration & Travel",
    unitDescription: "Explore grammar tips and key phrases for this unit",
    themeColor: {
      bg: "bg-duo-purple",
      border: "border-duo-purple-dark",
      badge: "text-duo-purple bg-purple-50 border-purple-200",
      lightBg: "bg-purple-50/60",
    },
    keyPhrasesTitle: "Discuss traveling solo and navigating the city",
    keyPhrases: [
      {
        id: "p3-1",
        phrase: "No he viajado solo antes, así que estoy un poco preocupado.",
        translation: "I haven't traveled solo before, so I'm a little worried.",
        audioLanguage: "es-ES",
      },
      {
        id: "p3-2",
        phrase: "¿Revisarán mi visa en el control de pasaportes?",
        translation: "Will they check my visa at passport control?",
        audioLanguage: "es-ES",
      },
      {
        id: "p3-3",
        phrase: "Sí, por favor muestre su pasaporte a la persona en control de pasaportes.",
        translation: "Yes, please show your passport to the person at passport control.",
        audioLanguage: "es-ES",
      },
      {
        id: "p3-4",
        phrase: "Este es el lugar más lejano de casa al que he viajado.",
        translation: "This is the farthest away from home I've ever traveled.",
        audioLanguage: "es-ES",
      },
      {
        id: "p3-5",
        phrase: "¿Dónde está la estación de tren más cercana?",
        translation: "Where is the nearest train station?",
        audioLanguage: "es-ES",
      },
      {
        id: "p3-6",
        phrase: "Gire a la derecha y luego camine dos cuadras todo recto.",
        translation: "Turn right and then walk two blocks straight ahead.",
        audioLanguage: "es-ES",
      },
    ],
    grammarTips: [
      {
        id: "gt3-1",
        title: "Asking for Directions with '¿Dónde está...?'",
        summary: "Use '¿Dónde está...?' to ask where any place is located.",
        content:
          "Key direction phrases include 'a la derecha' (to the right), 'a la izquierda' (to the left), and 'todo recto' (straight ahead).",
        examples: [
          { source: "¿Dónde está el hotel?", target: "Where is the hotel?" },
          { source: "¿Dónde está el aeropuerto?", target: "Where is the airport?" },
        ],
      },
      {
        id: "gt3-2",
        title: "Formal vs. Informal (Tú vs. Usted)",
        summary: "Use 'Usted' when speaking with officials, clerks, and strangers.",
        content:
          "At airports, hotel receptions, and border control, native speakers use the formal 'Usted' to show polite respect.",
        table: {
          headers: ["Informal (Tú)", "Formal (Usted)", "Meaning"],
          rows: [
            ["¿De dónde eres?", "¿De dónde es usted?", "Where are you from?"],
            ["Por favor, muestra tu boleto", "Por favor, muestre su boleto", "Please show your ticket"],
            ["¿Cómo te llamas?", "¿Cómo se llama usted?", "What is your name?"],
          ],
        },
      },
    ],
  },
};
