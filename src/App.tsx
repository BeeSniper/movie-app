import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomeScreen } from './screens/home/HomeScreen';
import { FavoritesScreen } from './screens/favorites/FavoritesScreen';
import { LoginScreen } from './screens/login/LoginScreen';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <div className="app-container">
            <Header />
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/favorites" element={<FavoritesScreen />} />
              <Route path="/login" element={<LoginScreen />} />
            </Routes>
          </div>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
