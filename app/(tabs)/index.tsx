import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Button, StatusBar } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
 
WebBrowser.maybeCompleteAuthSession();

export default function HomeScreen() {
  const [user, setUser] = useState<{
    email: string;
    name: string;
    picture: string;
  } | null>(null);

  const [message, setMessage] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.GOOGLE_CLIENT_ID,
    redirectUri: "http://localhost:8081"
  });

  const callAuthGoogle = () => {
    console.log('callAuthGoogle foi chamada');
    promptAsync();
  };

  const sendTokenToBackend = async (token: string) => {
    try {
      const response = await fetch(`https://localhost:7067/auth/callback?code=${token}`, {
        method: 'GET',
      });
      console.log(token);
      if (response.ok) {
        const data = await response.json();
        console.log("Data received from backend:", data);
        setMessage('Token enviado com sucesso!');
      } else {
        console.error("Failed to send token to backend", response.toString());
        setMessage('Falha ao enviar token para o backend');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Erro ao enviar token para o backend');
    }
  };

  const getResponse = async () => {
    if (response) {
      console.log("Response received:", response);
      switch (response.type) {
        case 'error':
          console.log("An error occurred");
          console.log(response);
          break;
        case 'cancel':
          console.log("Authentication was canceled");
          break;
        case 'success':
          console.log("Authentication succeeded");
          try {
            const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
              headers: {
                Authorization: `Bearer ${response.authentication?.accessToken}`,
              },
            });
            const userLogin = await res.json();
            console.log("User data received:", userLogin);
            setUser({
              email: userLogin.email,
              name: userLogin.name,
              picture: userLogin.picture,
            });
  
            // Enviar token ao backend
            await sendTokenToBackend(response.authentication?.accessToken || '');
          } catch (e) {
            console.warn('ERROR', e);
          }
          break;
        default:
          break;
      }
    }
  };
  
  useEffect(() => {
    console.log('useEffect foi chamada');
    getResponse();
  }, [response]);

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.userInfo}>
          <Text style={styles.titulo}>Bem-vindo</Text>
          <Image
            source={{ uri: user.picture, width: 70, height: 70 }}
            style={styles.userImage}
          />
          <Text style={styles.loginText}>{user.name}</Text>
          <Text style={styles.loginText}>{user.email}</Text>
          <TouchableOpacity style={styles.button} onPress={() => setUser(null)}>
            <Text style={styles.buttonText}>Sair</Text>
          </TouchableOpacity>
          {message && (
            <Text style={styles.message}>{message}</Text>
          )}
        </View>
      ) : (
        <View style={styles.container}>
          <Text style={styles.titulo}>TESTE PARA AUTENTICAÇÃO OAUTH2 GOOGLE</Text>
          <Text style={styles.loginText}>Login com Google</Text>
          <TouchableOpacity style={styles.button} onPress={callAuthGoogle}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      )}
      <StatusBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', 
  },
  userInfo: {
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24, 
    fontWeight: 'bold',
    marginBottom: 40, 
    textAlign: 'center',
    color: '#ffffff', 
  },
  loginText: {
    fontSize: 20, 
    marginBottom: 30,
    color: '#ffffff', 
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
  userImage: {
    borderRadius: 40,
  },
  message: {
    marginTop: 20,
    fontSize: 40,
    color: 'red', // ou outra cor de sua escolha
  },
});