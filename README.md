Alright Akshara 😄 — here’s a **clean, professional README.md** for your **NutriSmart project**.
You can copy-paste this directly into GitHub 👇

---

# 🥗 NutriSmart – AI-Powered Nutrition Tracker

NutriSmart is an **AI-driven food analysis and nutrition tracking application** that helps users understand their meals better by simply uploading a food image. The system uses **Google Gemini AI** to estimate nutritional values like calories, protein, carbohydrates, and fats.

---

## 🚀 Features

* 📷 Upload food images for analysis
* 🤖 AI-based nutrition estimation using Gemini API
* 🍽️ Meal tracking with history
* 💧 Hydration (water intake) tracking
* ⚡ Fast and responsive UI (React + Vite)
* 🔥 Real-time analysis and results

---

## 🧠 How It Works

1. User uploads a food image
2. Image is converted into base64 format
3. The image is sent to Gemini AI
4. AI analyzes the food and returns:

   * Calories
   * Protein
   * Carbohydrates
   * Fats
5. Data is stored and displayed to the user

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS

### Backend / AI

* Google Gemini API
* Firebase (Firestore Database)

### Tools & Libraries

* dotenv
* lucide-react
* recharts

---

## 📂 Project Structure

```
NutriSmart/
│── src/
│   ├── components/
│   ├── services/
│   ├── types/
│   ├── lib/
│── public/
│── package.json
│── vite.config.ts
│── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/NutriSmart.git
cd NutriSmart
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Setup Environment Variables

Create a `.env` file and add:

```env
GEMINI_API_KEY=your_api_key_here
```

---

### 4️⃣ Run the project

```bash
npm run dev
```

---

## 📊 Database Structure

### 🍽️ Meals Collection

* userId
* imageUrl
* analysis
* timestamp

### 💧 Hydration Collection

* userId
* amountMl
* timestamp

---

## 🎯 Use Cases

* Daily nutrition tracking
* Fitness and diet monitoring
* Health awareness
* Smart food analysis

---

## 🔮 Future Enhancements

* Voice-based food input 🎤
* Multi-language support 🌍
* Barcode scanning 📦
* Personalized diet recommendations 🧠
* Mobile app version 📱

---

