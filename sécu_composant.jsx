import React, { useState } from 'react';
import { signUp, login, verifyToken } from './security-module'; 
// Importer les fonctions d'inscription, de connexion et de vérification de token du module de sécurité et d'authentification

const SecurityComponent = () => {
  const [form, setForm] = useState({ // Utiliser l'état local pour stocker les données du formulaire
    email: '',
    password: '',
  });
  const [error, setError] = useState(null); // Utiliser l'état local pour stocker les erreurs éventuelles
  const [token, setToken] = useState(null); // Utiliser l'état local pour stocker le token JWT éventuel

  const handleChange = (event) => { 
    // Créer une fonction pour mettre à jour l'état local en fonction des changements de formulaire
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSignUp = async (event) => { 
    // Créer une fonction d'inscription qui envoie les données du formulaire à la fonction signUp du module de sécurité et d'authentification
    event.preventDefault();
    try {
      const user = await signUp(form.email, form.password); 
      // Appeler la fonction d'inscription avec les données du formulaire
      console.log(user); 
      // Afficher le nouvel utilisateur dans la console
    } catch (err) {
      setError(err.message); 
      // Afficher l'erreur dans l'état local
    }
  };

  const handleLogin = async (event) => { 
    // Créer une fonction de connexion qui envoie les données du formulaire à la fonction login du module de sécurité et d'authentification
    event.preventDefault();
    try {
      const token = await login(form.email, form.password); // Appeler la fonction de connexion avec les données du formulaire
      setToken(token); // Mettre à jour l'état local avec le token JWT
      console.log(verifyToken(token)); // Afficher les données décodées du token JWT dans la console
    } catch (err) {
      setError(err.message); // Afficher l'erreur dans l'état local
    }
  };

  return (
    <div>
      {error && <p>{error}</p>}
      <form>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} />
        <button type="submit" onClick={handleSignUp}>Sign Up</button>
        <button type="submit" onClick={handleLogin}>Login</button>
      </form>
      {token && <p>Token: {token}</p>}
    </div>
  );
};

export default SecurityComponent;