import React from 'react';
<<<<<<< HEAD
<<<<<<< HEAD
import {NavigationContainer} from '@react-navigation/native';
import { AuthRoutes } from './auth.routes';

import { useAuth } from '../hooks/auth';
import { AppRoutes } from './App.routes';
export function Routes(){

    const {user} = useAuth();

    return(
        <NavigationContainer>
            {user.id? <AppRoutes/>:<AuthRoutes/>}
        </NavigationContainer>
    );
}
=======
=======
>>>>>>> fork/main
import { NavigationContainer } from '@react-navigation/native';

import { AuthRoutes } from './auth.routes';
import { AppRoutes } from './app.routes';

import { useAuth } from '../hooks/auth';

export function Routes() {
  const { user } = useAuth();

  return(
    <NavigationContainer>
      {user.id? 
        <AppRoutes/> : 
        <AuthRoutes/>
      }
    </NavigationContainer>
  )
<<<<<<< HEAD
}
>>>>>>> fork/main
=======
}
>>>>>>> fork/main
