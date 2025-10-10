import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const googleProvider = new GoogleAuthProvider();

  
  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ Sign-in successful! Redirecting to your dashboard...");
      navigate("/dashboard");
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          alert("❌ No account found with this email.");
          break;
        case "auth/wrong-password":
          alert("❌ Incorrect password. Please try again.");
          break;
        case "auth/invalid-email":
          alert("❌ Invalid email format.");
          break;
        default:
          alert("❌ " + error.message);
      }
    }
  };

  
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      alert(`✅ Welcome back, ${user.displayName || "User"}!`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Sign-In Error:", error);

      let errorMessage = "❌ Google Sign-In failed. Try again later.";

      switch (error.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "❌ Google Sign-In failed. Try again later";
          break;
        case "auth/network-request-failed":
          errorMessage = "⚠️ Network issue — please check your internet connection.";
          break;
        case "auth/popup-blocked":
          errorMessage = "⚠️ Popup was blocked. Please allow popups for this site.";
          break;
        case "auth/cancelled-popup-request":
          errorMessage = "⚠️ You canceled the sign-in process. Try again.";
          break;
      }

      alert(errorMessage);
    }
  };

  
  const handleForgotPassword = async () => {
    if (!email) {
      alert("⚠️ Please enter your email first to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("📧 Password reset email sent! Check your inbox.");
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-email":
          alert("❌ Invalid email address.");
          break;
        case "auth/user-not-found":
          alert("❌ No account found with this email.");
          break;
        default:
          alert("❌ " + error.message);
      }
    }
  };

  return (
    <div className="flex justify-center items-center flex-col min-h-screen">
      <form
        onSubmit={handleSignIn}
        className="w-full max-w-md sm:max-w-lg font-inter"
      >
        <h1 className="text-[24px] sm:text-[32px] font-bold mb-1 font-montserrat">
          Sign In
        </h1>
        <h2 className="font-overlock text-[13px] font-regular mb-4">
          Welcome back! Continue your fitness tracking.
        </h2>

        
        <input
          type="email"
          placeholder="Email"
          className="bg-[#000748] p-2 w-full mb-3 rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

       
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="bg-[#000748] p-2 w-full mb-1 rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-2 top-5 transform -translate-y-1/2 text-gray-600 text-sm"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        
        <p
          onClick={handleForgotPassword}
          className="text-[#06E959] text-sm mb-4 cursor-pointer hover:underline text-right"
        >
          Forgot your password?
        </p>

        
        <button
          type="submit"
          className="bg-[#06E959] hover:bg-[#00d14d] text-white font-montserrat py-2 px-17 sm:px-32 mx-auto block rounded-full font-bold transition duration-300"
        >
          Sign In
        </button>

        
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-600"></div>
          <span className="px-2 text-sm text-gray-400">OR</span>
          <div className="flex-grow h-px bg-gray-600"></div>
        </div>

        
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center w-full bg-white text-black py-2 rounded-full hover:bg-gray-200 transition duration-300 font-semibold"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Sign in with Google
        </button>
      </form>
    </div>
  );
};

export default SignIn;
