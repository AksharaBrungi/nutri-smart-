🥗 NutriSmart – AI-Powered Nutrition Tracker
NutriSmart is an AI-driven food analysis and nutrition tracking application that helps users understand their meals better by simply uploading a food image. The system uses Google Gemini AI to estimate nutritional values like calories, protein, carbohydrates, and fats.

🚀 Features
📷 Upload food images for analysis
🤖 AI-based nutrition estimation using Gemini API
🍽️ Meal tracking with history
💧 Hydration (water intake) tracking
⚡ Fast and responsive UI (React + Vite)
🔥 Real-time analysis and results
🧠 How It Works
User uploads a food image

Image is converted into base64 format

The image is sent to Gemini AI

AI analyzes the food and returns:

Calories
Protein
Carbohydrates
Fats
Data is stored and displayed to the user

🛠️ Tech Stack
Frontend
React.js
Vite
Tailwind CSS
Backend / AI
Google Gemini API
Firebase (Firestore Database)
Tools & Libraries
dotenv
lucide-react
recharts
📂 Project Structure
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
⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/your-username/NutriSmart.git
cd NutriSmart
2️⃣ Install dependencies
npm install
3️⃣ Setup Environment Variables
Create a .env file and add:

GEMINI_API_KEY="AIzaSyBY3gTkOUWnWB_Hf3-wMTRnQaglliCS-zQ"
4️⃣ Run the project
npm run dev
📊 Database Structure
🍽️ Meals Collection
userId
imageUrl
analysis
timestamp
💧 Hydration Collection
userId
amountMl
timestamp
🎯 Use Cases
Daily nutrition tracking
Fitness and diet monitoring
Health awareness
Smart food analysis
🔮 Future Enhancements
Voice-based food input 🎤
Multi-language support 🌍
Barcode scanning 📦
Personalized diet recommendations 🧠
Mobile app version 📱
