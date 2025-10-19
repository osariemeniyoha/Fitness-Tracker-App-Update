#  FitTrack – Your Personalized Fitness Tracker

FitTrack is a modern, responsive fitness tracking web application built with React + Firebase, designed to help users monitor their workouts, nutrition, and goals all in one place.  
It focuses on user progress, goal management, and data synchronization, ensuring a smooth and engaging fitness experience.



##  Features

###  1. Authentication & Profile
- Secure sign-up and login using Firebase Authentication.  
- User profile displaying personal info, activity stats, and goals.  
- Editable profile page to update basic details (name, age, weight, etc.).  
- Responsive sidebar navigation across all pages.  



###  2. Goals Management
- Create and manage fitness goals (e.g., weight loss, calorie targets).  
- Save goals directly to Firestore for persistence.  
- Automatic progress tracking — progress updates when workouts are completed.  
- Displays active, pending, and completed goals with progress bars.  



###  3. Workout Tracking
- Add workouts (exercise name, duration, and calories burned).  
- Automatically syncs with user goals to reflect real-time progress.  
- Displays completed workouts and total calories burned.  
- Stores all workout data in Firestore under each user.  



###  4. Nutrition Tracking
- Search for foods via Nutritionix API using food names (e.g., “banana”, “rice”).  
- Displays nutritional information such as calories, protein, carbs, and fat.  
- Log daily meals — breakfast, lunch, dinner, and snacks.  
- Daily overview shows total calories consumed.  
 



###  5. Nutrition History
- View past food logs and total calorie intake per day.  
- Helps users track eating patterns and maintain consistency.  


###  6. Responsive Sidebar Navigation
- Clean, consistent sidebar UI across all pages.  
- Links to Dashboard, Goals, Workout, Nutrition, Profile, etc.  
- Compatible for smaller screens.  



##  Tech Stack

| Category | Technology |
|-----------|-------------|
| Frontend | React.js, Vite |
| Styling | Tailwind CSS |
| Authentication | Firebase Auth |
| Database | Firestore |
| API Integration | Nutritionix API ExerciseDB API (RapidAPI) |
| Hosting |  Netlify |
| Phone local Host| ngrok |


