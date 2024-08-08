import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

let stringURL = "https://localhost:7067/";

const ProfileScreen = () => {
  const [userEmail, setUserEmail] = useState('');  
  const [userMessage, setUserMessage] = useState('');
  const [userMessageColor, setUserMessageColor] = useState('black');
  const [user, setUser] = useState<{
    email: string;
    name: string;
    profileImageUrl: string;
  } | null>(null);

  const handleSearch = async () => {
    try {
      const response = await fetch(`${stringURL}api/User/get-user?email=${userEmail}`, {
        method: 'GET',
      });

      const status = response.status;

      if (response.ok) {
        const data = await response.json();
        setUser({
          email: data.email,
          name: data.name,
          profileImageUrl: data.profileImageUrl,  
        });
        setUserMessage('Informações do usuário recuperadas com sucesso!');
        setUserMessageColor('green');
      } else {
        console.error('Failed to retrieve user info from backend');
        const responseText = response.text();
        if (status == 400) {
          setUserMessage(`Falha ao recuperar informações do usuário: ${responseText}`);
        } else {
          setUserMessage(`Falha ao recuperar informações do usuário: ${responseText}`);
        }
        setUserMessageColor('black');
        setUser(null);  
      }
    } catch (error) {
      console.error('Error:', error);
      setUserMessage('Erro ao recuperar informações do usuário');
      setUserMessageColor('red');
      setUser(null); 
    }
  };

  return (
    <LinearGradient
      colors={['#e96443', '#904e95', '#227da1']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      locations={[0.2, 0.5, 0.9]}
      style={styles.container}
    >
      <Text style={styles.text}>Procurar dados de usuário por e-mail</Text> 
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite o e-mail do usuário" 
          placeholderTextColor="#888888"
          value={userEmail} 
          onChangeText={setUserEmail} 
          textAlign="center"
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Pesquisar</Text>
      </TouchableOpacity>

      {userMessage !== '' && (
        <View style={styles.messageContainer}>
          <View style={styles.messageBox}>
            <Text style={[styles.message, { color: userMessageColor }]}>{userMessage}</Text>
          </View>
        </View>
      )}

      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userTitle}>Informações do Usuário:</Text>
          <Image
            source={{ uri: user.profileImageUrl, width: 70, height: 70 }}
            style={styles.userImage}
          />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    fontFamily: 'Roboto-Regular',
  },
  inputContainer: {
    width: '80%',
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  button: {
    backgroundColor: '#03a9f4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  messageContainer: {
    marginTop: 20,
    width: '90%',
    alignItems: 'center',
  },
  messageBox: {
    backgroundColor: '#dedcdc',
    borderRadius: 10,
    padding: 15,
    width: '90%',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#fff',
  },
  userInfo: {
    marginTop: 30,
    alignItems: 'center',
  },
  userTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    fontFamily: 'Roboto-Regular',
  },
  userImage: {
    borderRadius: 35,
    marginBottom: 20,
  },
  userName: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 10,
  },
  userEmail: {
    fontSize: 16,
    color: '#b0bec5',
  },
});

export default ProfileScreen;
