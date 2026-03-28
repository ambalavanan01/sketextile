import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "orders": "Orders",
        "cart": "Cart",
        "profile": "Profile",
        "admin": "Admin Dashboard",
        "delivery": "Delivery Partner"
      },
      "common": {
        "buy": "Buy Now",
        "add_cart": "Add to Cart",
        "search": "Search products...",
        "filter": "Filter",
        "stock": "Stock",
        "price": "Price",
        "reviews": "Reviews",
        "description": "Description",
        "track_order": "Track Order"
      },
      "auth": {
        "login": "Login",
        "signup": "Sign Up",
        "logout": "Logout",
        "admin_login": "Admin Login",
        "delivery_login": "Delivery Login"
      }
    }
  },
  ta: {
    translation: {
      "nav": {
        "home": "முகப்பு",
        "orders": "ஆர்டர்கள்",
        "cart": "கூடை",
        "profile": "சுயவிவரம்",
        "admin": "நிர்வாகி",
        "delivery": "டெலிவரி பார்ட்னர்"
      },
      "common": {
        "buy": "இப்போது வாங்கு",
        "add_cart": "கூடையில் சேர்க்க",
        "search": "தேடுக...",
        "filter": "வடிகட்டி",
        "stock": "இருப்பு",
        "price": "விலை",
        "reviews": "மதிப்பாய்வு",
        "description": "விளக்கம்",
        "track_order": "ஆர்டர் கண்காணிப்பு"
      },
      "auth": {
        "login": "உள்நுழைய",
        "signup": "பதிவு செய்க",
        "logout": "வெளியேறு",
        "admin_login": "நிர்வாகி உள்நுழைவு",
        "delivery_login": "டெலிவரி பார்ட்னர் உள்நுழைவு"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", 
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
