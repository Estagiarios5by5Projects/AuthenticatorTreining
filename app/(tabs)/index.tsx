import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, ScrollView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function HomeScreen() {
  const [user, setUser] = useState<{
    email: string;
    name: string;
    picture: string;
  } | null>(null);

  const [tokenMessage, setTokenMessage] = useState<string | null>(null);
  const [tokenMessageColor, setTokenMessageColor] = useState<string>('black'); 

  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [userMessageColor, setUserMessageColor] = useState<string>('black'); 

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
      const response = await fetch(`https://localhost:7067/validate-token?accessToken=${token}`, {
        method: 'GET',
      });

      const status = response.status;
      const statusText = response.statusText;
      const responseBody = await response.text();

      const responseText = `${status} ${responseBody} ${statusText}`;

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log("Data received from backend:", data);
          setTokenMessage(responseText);
          setTokenMessageColor('green'); 
        } catch (error) {
          console.error('Failed to parse response:', responseText);
          setTokenMessage(responseText);
          setTokenMessageColor('green');  
        }
      } else {
        console.error('Failed to send token to backend:', responseText);
        setTokenMessage('Falha ao enviar token para o backend');
        setTokenMessageColor('yellow');  
      }
    } catch (error) {
      console.error('Error:', error);
      setTokenMessage('Erro ao enviar token para o backend');
      setTokenMessageColor('red');  
    }
  };

  const sendUserInfoToBackend = async (name: string, email: string) => {
    try {
      const response = await fetch('https://localhost:7067/api/User', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        console.log("User info sent to backend successfully");
        setUserMessage('Informações do usuário enviadas com sucesso!');
        setUserMessageColor('green');
      } else {
        console.error('Failed to send user info to backend');
        setUserMessage('Falha ao enviar informações do usuário');
        setUserMessageColor('yellow');
      }
    } catch (error) {
      console.error('Error:', error);
      setUserMessage('Erro ao enviar informações do usuário');
      setUserMessageColor('red');
    }
  };

  const getResponse = async () => {
    if (response) {
      console.log("Response received:", response);
      switch (response.type) {
        case 'error':
          console.log("An error occurred");
          setTokenMessage('An error occurred during authentication');
          setTokenMessageColor('red');
          break;
        case 'cancel':
          console.log("Authentication was canceled");
          setTokenMessage('Authentication was canceled');
          setTokenMessageColor('yellow');
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

            // Enviar informações do usuário ao backend
            await sendUserInfoToBackend(userLogin.name, userLogin.email);

          } catch (e) {
            console.warn('ERROR', e);
            setTokenMessage('Failed to fetch user data');
            setTokenMessageColor('red');
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
          <ScrollView style={styles.messageContainer}>
            {tokenMessage && (
              <Text style={[styles.message, { color: tokenMessageColor }]}>{tokenMessage}</Text>
            )}
            {userMessage && (
              <Text style={[styles.message, { color: userMessageColor }]}>{userMessage}</Text>
            )}
          </ScrollView>
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
  messageContainer: {
    marginTop: 20,
  },
  message: {
    fontSize: 16,
    marginVertical: 5,
  },
});
