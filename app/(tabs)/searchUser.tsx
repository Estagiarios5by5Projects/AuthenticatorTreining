import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const ProfileScreen = () => {
  const [userId, setUserId] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [userMessageColor, setUserMessageColor] = useState('black');

  const handleSearch = async () => {
    try {
      const response = await fetch(`https://localhost:7067/api/User/UserID/${userId}`, {
        method: 'GET',
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("User info received from backend:", data);
        setUserMessage('Informações do usuário recebidas com sucesso!');
        setUserMessageColor('green');
      } else {
        console.error('Failed to retrieve user info from backend');
        setUserMessage('Falha ao recuperar informações do usuário');
        setUserMessageColor('yellow');
      }
    } catch (error) {
      console.error('Error:', error);
      setUserMessage('Erro ao recuperar informações do usuário');
      setUserMessageColor('red');
    }
  };  

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Procurar dados de usuário por ID</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite o ID do usuário"
          placeholderTextColor="#888888"
          value={userId}
          onChangeText={setUserId}
          textAlign="center"
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Pesquisar</Text>
      </TouchableOpacity>
      {userMessage && (
        <Text style={[styles.message, { color: userMessageColor }]}>{userMessage}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 16,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  inputContainer: {
    width: '20%', 
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: 16, 
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    marginTop: 20,
    fontSize: 16,
  },
});

export default ProfileScreen;
