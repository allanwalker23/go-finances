
import React,{ 
    createContext,
    ReactNode,
    useContext,
    useState,
    useEffect
 } from 'react';

import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Name } from '../screens/CategorySelect/styles';

const {CLIENT_ID} = process.env;
const {REDIRECT_URI}= process.env
interface AuthProviderProps{
    children: ReactNode;
}

interface IAuthContextData{
    user: User;
    signInWithGoogle():Promise<void>;
    signInWithApple():Promise<void>;
    signOut():Promise<void>;
    userStorageLoading:boolean;
}

interface AuthorizationResponse{
    params:{
        access_token:string;
    };
    type:string;
}

interface User{
    id:string;
    name:string;
    email:string;
    photo?:string;
}

export const AuthContext = createContext({} as IAuthContextData)
function AuthProvider({children}:AuthProviderProps){

    const [user,setUser]= useState<User>({} as User);
    const [userStorageLoading,setUserStorageLoading]=useState(true);
    const userStorageKey = '@gofinances:user';
 

    async function signInWithGoogle(){
        try {
            const RESPONSE_TYPE = 'token';
            const SCOPE = encodeURI('profile email');
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`;

            const {type, params} = await AuthSession
            .startAsync({authUrl}) as AuthorizationResponse;

            if(type === 'success'){
                const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`)
                const userInfo = await response.json();
                 if(type === 'success'){
                     const userLogged={
                        id: String(userInfo.id),
                        email: userInfo.email!,
                        name: userInfo.given_name!,
                        photo: userInfo.picture!
                     }
                     setUser(userLogged)
                     await AsyncStorage.setItem(userStorageKey,JSON.stringify(userLogged))
                 }
                

                
                
            }
            
        } catch (error:any) {
            throw new Error(error);
        }
    }

    async function signInWithApple(){
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes:[
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL
                ]
            });

            if(credential){
                const userLogged={
                    id: String(credential.user),
                    email: credential.email!,
                    name: credential.fullName!.givenName!,
                    photo: 'https://ui-avatars.com/api/?name='+credential.fullName?.givenName+'&length=1'
                }

                setUser(userLogged)
                await AsyncStorage.setItem('@gofinances:user',JSON.stringify(userLogged));
            }

        } catch (error:any) {
            throw new Error(error)
        }
    }

    async function signOut() {
        setUser({} as User);
        await AsyncStorage.removeItem(userStorageKey)

    }

    useEffect(()=>{
        async function loadStorageData(){
            const userStorage = await AsyncStorage.getItem(userStorageKey);
            if(userStorage){
                const userLogged = JSON.parse(userStorage) as User;
                setUser(userLogged);
            }

            setUserStorageLoading(false);
        }

        loadStorageData();
    },[])
    return(
        <AuthContext.Provider value={{
            user,
            signInWithGoogle,
            signInWithApple,
            signOut,
            userStorageLoading
            }}>
            {children}
        </AuthContext.Provider>
    )
}

function useAuth(){
    const context = useContext(AuthContext);

    return context;
}

export {AuthProvider,useAuth}