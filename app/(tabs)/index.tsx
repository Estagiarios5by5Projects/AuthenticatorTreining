  import React, { useEffect, useState } from 'react';
  import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, ScrollView } from 'react-native';
  import * as WebBrowser from 'expo-web-browser';
  import * as Google from 'expo-auth-session/providers/google';
  import { LinearGradient } from 'expo-linear-gradient';

  WebBrowser.maybeCompleteAuthSession();
  let currentId = 0;  // Variável global para simular ID auto-incremental

  let stringURL = "https://localhost:7067/";

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

    const [tokenRedisMenssage, setTokenRedisMessage] = useState<string | null>(null);
    const [tokenRedisMessageColor, setTokenRedisCollor] = useState<string>('black'); 

    const generateAutoIncrementId = () => {
      currentId += 1;
      return currentId.toString();
    };

    const [request, response, promptAsync] = Google.useAuthRequest({
      clientId: process.env.GOOGLE_CLIENT_ID,
      redirectUri: "http://localhost:8081"
    });

    const callAuthGoogle = () => {
      console.log('callAuthGoogle foi chamada');
      promptAsync();
    };

    const sendTokenToBackend = async (token: string): Promise<boolean> => {
      try {
        const response = await fetch(`${stringURL}validate-token?accessToken=${token}`, {
          method: 'GET',
        });
    
        const status = response.status;
        const responseBody = await response.text();
    
        if (response.ok) {
            setTokenMessage('Token validado com sucesso');
            setTokenMessageColor('green');
            return true;
        } else {
          console.error('Failed to send token to backend:', responseBody);
          setTokenMessage('Falha ao validar o token com o backend');
          setTokenMessageColor('red');
          return false;
        }
      } catch (error) {
        console.error('Error:', error);
        setTokenMessage('Erro ao validar o token com o backend');
        setTokenMessageColor('red');
        return false;
      }
    };

    const sendUserInfoToBackend = async (id: string, name: string, email: string, picture: string) => {
      try {
        const response = await fetch(`${stringURL}api/User/insert-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            IdUser: id,
            name,
            email,
            ProfileImageUrl: picture,
          }),
        });
    
        const status = response.status;
        const statusText = response.statusText;
        const responseBody = await response.text();
        const responseText = `${status} ${statusText}: ${responseBody}`;
    
        if (response.ok) {
          console.log("User info sent to backend successfully");
          setUserMessage('Informações do usuário enviadas com sucesso!');
          setUserMessageColor('green');
        } else {
          console.error('Failed to send user info to backend:', responseText);
          setUserMessage(`Falha ao enviar informações do usuário`);
          setUserMessageColor('yellow');
        }
      } catch (error) {
        console.error('Error:', error);
        setUserMessage('Erro ao enviar informações do usuário');
        setUserMessageColor('red');
      }
    };  

    const sendTokenToRedis = async (IdUserToken: string, AccessTokenGoogle: string, 
      RefreshTokenGoogle: string, AccessTokenGoogleExpiresIn: string) => {
      try {
        const response = await fetch(`${stringURL}insert-token-redis?IdUserToken=${IdUserToken}&AccessTokenGoogle=${AccessTokenGoogle}
          &RefreshTokenGoogle=${RefreshTokenGoogle}&AccessTokenGoogleExpiresIn=${AccessTokenGoogleExpiresIn}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        const status = response.status;
        const statusText = response.statusText;
        const responseBody = await response.text();
        const responseText = `${status} ${statusText}: ${responseBody}`;
    
        if (response.ok) {
          console.log("Token info sent to Redis successfully");
          setTokenRedisMessage('Token do usuário enviadas com sucesso ao Redis!');
          setTokenRedisCollor('green');
        } else {
          console.error('Failed to send user token to Redis:', responseText);
          setTokenRedisMessage(`Falha ao enviar token do usuário ao Redis`);
          setTokenRedisCollor('yellow');
        }
      } catch (error) {
        console.error('Error:', error);
        setTokenRedisMessage('Erro ao enviar informações do usuário');
        setTokenRedisCollor('red');
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
    
              const tokenIsValid = await sendTokenToBackend(response.authentication?.accessToken || '');
    
              if (tokenIsValid) {
                const userId = generateAutoIncrementId();
                await sendUserInfoToBackend(userId, userLogin.name, userLogin.email, userLogin.picture);
    
                await sendTokenToRedis(
                  process.env.GOOGLE_CLIENT_ID?.toString() || '', 
                  response.authentication?.accessToken || '', 
                  response.authentication?.refreshToken || '', 
                  response.authentication?.expiresIn?.toString() || ''
                );
              }
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
      <LinearGradient
        colors={['#e96443', '#904e95', '#227da1']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        locations={[0.2, 0.5, 0.9]}  
        style={styles.container}
      >
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
            <View style={styles.messageContainer}>
              <View style={styles.messageBox}>
                <ScrollView contentContainerStyle={styles.messageContent}>
                  {tokenMessage && (
                    <Text style={[styles.message, { color: tokenMessageColor }]}>{tokenMessage}</Text>
                  )}
                  {userMessage && (
                    <Text style={[styles.message, { color: userMessageColor }]}>{userMessage}</Text>
                  )}
                  {tokenRedisMenssage && (
                    <Text style={[styles.message, { color: tokenRedisMessageColor }]}>{tokenRedisMenssage}</Text>
                  )}
                </ScrollView>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.loginContainer}>
            <Text style={styles.titulo}>Teste para autenticação Oauth2 Google</Text>
            <Text style={styles.loginText}>Login com Google</Text>
            <TouchableOpacity style={styles.button} onPress={callAuthGoogle}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        )}
        <StatusBar />
      </LinearGradient>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    userInfo: {
      alignItems: 'center',
    },
    loginContainer: {
      alignItems: 'center',
    },
    titulo: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 40,
      textAlign: 'center',
      color: '#ffffff',
      fontFamily: 'Roboto-Regular',
    },
    loginText: {
      fontSize: 20,
      marginBottom: 30,
      color: '#b0bec5',
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
      fontSize: 18,
      fontWeight: 'bold',
    },
    userImage: {
      borderRadius: 35,
      marginBottom: 20,
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
      width: '200%',  
    },
    messageContent: {
      fontSize: 16,
      alignItems: 'center',   
    },
    message: {
      fontSize: 16,
      marginVertical: 5,
      color: '#fff',   
    },
  });
  