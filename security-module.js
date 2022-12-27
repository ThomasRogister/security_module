const jwt = require("jsonwebtoken"); // Importer la dépendance jwt pour signer et vérifier les jetons JWT
const bcrypt = require("bcryptjs"); // Importer la dépendance bcrypt pour hasher et comparer les mots de passe
const mongoose = require("mongoose"); // Importer la dépendance mongoose pour accéder à la base de données MongoDB

const secret = "mon-secret-secret"; // Définir une chaîne secrète pour signer les jetons JWT

const UserSchema = new mongoose.Schema({
  email: {
    // Définir le schéma de modèle pour les utilisateurs avec un champ de courrier électronique unique et requis
    type: String,
    required: true,
    unique: true,
  },
  password: {
    // Définir le schéma de modèle pour les utilisateurs avec un champ de mot de passe requis
    type: String,
    required: true,
  },
});

UserSchema.pre("save", async function (next) {
  // Ajouter un hook de pré-enregistrement pour hasher le mot de passe avant de l'enregistrer
  if (!this.isModified("password")) {
    // Vérifier si le mot de passe a été modifié
    return next();
  }
  const salt = await bcrypt.genSalt(); // Générer un sel aléatoire avec bcrypt
  this.password = await bcrypt.hash(this.password, salt); // Hasher le mot de passe avec le sel généré
});

UserSchema.methods.comparePassword = function (password) {
  // Ajouter une méthode d'instance au schéma de modèle pour comparer les mots de passe hashed
  return bcrypt.compare(password, this.password); // Comparer le mot de passe donné avec le mot de passe hashé de l'utilisateur
};

const User = mongoose.model("User", UserSchema); // Créer le modèle de données MongoDB à partir de notre schéma de modèle

function generateToken(user) {
  // Créer une fonction pour générer un JWT à partir d'un utilisateur
  return jwt.sign(user, secret, { expiresIn: "1h" }); // Signer le JWT avec la chaîne secrète et une durée de validité d'une heure
}

function verifyToken(token) {
  // Créer une fonction pour vérifier un JWT
  return jwt.verify(token, secret); // Vérifier le JWT avec la chaîne secrète
}

async function signUp(email, password) {
  // Créer une fonction d'inscription qui prend en entrée un courrier électronique et un mot de passe
  const user = new User({ email, password }); // Créer un nouvel utilisateur avec le courrier électronique et le mot de passe donnés
  await user.save(); // Enregistrer l'utilisateur dans la base de données
  return user; // Renvoyer l'utilisateur
}

async function login(email, password) {
  // Créer une fonction de connexion qui prend en entrée un courrier électronique et un mot de passe
  const user = await User.findOne({ email }); // Trouver l'utilisateur avec le courrier électronique donné dans la base de données
  if (!user) {
    // Si l'utilisateur n'existe pas, renvoyer une erreur
    throw new Error("Invalid email or password");
  }
  const validPassword = await user.comparePassword(password); // Comparer le mot de passe donné avec le mot de passe hashé de l'utilisateur
  if (validPassword) {
    // Si le mot de passe est valide
    const token = generateToken({ id: user._id }); // Générer un JWT avec l'ID de l'utilisateur
    return token; // Renvoyer le JWT
  } else {
    // Si le mot de passe n'est pas valide
    throw new Error("Invalid email or password"); // Renvoyer une erreur
  }
}

module.exports = {
  // Exporter les fonctions signUp, login et verifyToken
  signUp,
  login,
  verifyToken,
};
