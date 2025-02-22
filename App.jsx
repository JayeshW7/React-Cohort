import Header from "./components/Header";
import Main from "./components/Main";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, SignIn, SignUp, UserButton } from "@clerk/clerk-react";

export default function App() {
    return (
        <Router>
            <Header />
            <div className="auth-buttons">
                <SignedOut>
                    <Navigate to="/login" replace />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>

            <Routes>
                <Route path="/" element={<SignedIn><Main /></SignedIn>} />
                <Route
                    path="/login"
                    element={
                        <SignedOut>
                            <div className="auth-container">
                                <SignIn />
                            </div>
                        </SignedOut>
                    }
                />

                <Route
                    path="/signup"
                    element={
                        <SignedOut>
                            <div className="auth-container">
                                <SignUp />
                            </div>
                        </SignedOut>
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}
