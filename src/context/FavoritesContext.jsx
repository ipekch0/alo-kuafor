import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }
    }, []);

    const toggleFavorite = (salon) => {
        let newFavorites;
        const exists = favorites.find(f => f.id === salon.id);

        if (exists) {
            newFavorites = favorites.filter(f => f.id !== salon.id);
            toast.success('Favorilerden çıkarıldı');
        } else {
            newFavorites = [...favorites, salon];
            toast.success('Favorilere eklendi');
        }

        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    };

    const isFavorite = (salonId) => {
        return favorites.some(f => f.id === salonId);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);
