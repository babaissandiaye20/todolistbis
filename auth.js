// Import fetch utility functions
import { fetchGetData } from './fetch.js';

// Function to check if a field is empty
export const isEmpty = (value, fieldName) => {
    if (value === null || value === undefined || value.trim() === '') {
        return `Le champ ${fieldName} est requis`;
    }
    return null;
};

// Function to validate login credentials
export const validateLogin = async (email, password) => {
    // Input validation
    const emailError = isEmpty(email, 'Email');
    const passwordError = isEmpty(password, 'Mot de passe');
    
    if (emailError || passwordError) {
        return {
            success: false,
            error: emailError || passwordError
        };
    }

    try {
        // Fetch users from db.json
        const users = await fetchGetData('http://localhost:3000/users');
        
        // Find user by email
        const user = users.users.find(u => u.email === email);
        
        // Check credentials
        if (user && user.password === password) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(user));
            
            return {
                success: true,
                user: user
            };
        } else {
            return {
                success: false,
                error: 'Email ou mot de passe incorrect'
            };
        }
    } catch (error) {
        return {
            success: false,
            error: 'Erreur de connexion. Veuillez réessayer.'
        };
    }
};

// Function to handle login form submission
export const handleLogin = async (event) => {
    event.preventDefault();
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorElement = document.getElementById('error-message');
    
    console.log('Tentative de connexion:', {
        email: emailInput.value,
        password: passwordInput.value ? '[MASQUÉ]' : 'Vide'
    });

    // Validation des champs
    if (!emailInput.value || !passwordInput.value) {
        errorElement.textContent = 'Veuillez remplir tous les champs';
        errorElement.classList.remove('hidden');
        return;
    }

    try {
        // Récupération des utilisateurs
        const usersData = await fetchGetData('http://localhost:3000/users');
        
        // Vérifiez la structure exacte des données
        console.log('Type de usersData:', typeof usersData);
        console.log('Clés de usersData:', Object.keys(usersData));

        // Modification pour s'adapter à la structure réelle
        const users = Array.isArray(usersData) ? usersData : 
                      usersData.users ? usersData.users : 
                      [];

        const user = users.find(u => u.email === emailInput.value);
        
        if (!user) {
            console.error('Utilisateur non trouvé');
            errorElement.textContent = 'Email ou mot de passe incorrect';
            errorElement.classList.remove('hidden');
            return;
        }

        // Vérification du mot de passe (à remplacer par un hachage sécurisé)
        if (user.password !== passwordInput.value) {
            console.error('Mot de passe incorrect');
            errorElement.textContent = 'Email ou mot de passe incorrect';
            errorElement.classList.remove('hidden');
            return;
        }

        // Connexion réussie
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Connexion réussie');
        window.location.href = 'main.html';

    } catch (error) {
        console.error('Erreur de connexion:', error);
        errorElement.textContent = 'Erreur de connexion. Veuillez réessayer.';
        errorElement.classList.remove('hidden');
    }
};
// Add event listener to login form
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});
function logout() {
    // Clear localStorage
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Add event listener to logout button
document.getElementById('logout').addEventListener('click', logout);

// Add protection to ensure only logged-in users can access this page
document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('user');
    if (!user) {
        // If no user is logged in, redirect to login page
        window.location.href = 'login.html';
    }
});