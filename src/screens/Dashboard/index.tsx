import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect } from 'react';
import { useState } from 'react';
import {ActivityIndicator} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import { HightlightCard } from '../../components/HightlightCard';
import { TransactionCard,TransactionCardProps } from '../../components/TransactionCard';


import { 
    Container,
    Header,
    Icon,
    Photo,
    User,
    UserGreeting,
    UserInfo,
    UserName,
    UserWrapper,
    HightlightCards,
    Transactions,
    Title,
    TransactionList,
    LogoutButton,
    LoadContainer
 } from './styles';
 import {useTheme} from 'styled-components';
import { useAuth } from '../../hooks/auth';

 export interface DataListProps extends TransactionCardProps{
     id: string;
 }

 interface HightlightProps{
   amount:string;
   lastTransaction:string;
 }

 interface HightlightData{
   entries:HightlightProps;
   expensives:HightlightProps;
   total:HightlightProps;
 }

export function Dashboard(){
    const theme = useTheme();
    const {signOut, user} = useAuth();
    const [isLoading,setIsLoading]=useState(true);
    const [transactions,setTransactions]=useState<DataListProps[]>([]);
    const [hightlightData,setHightlightData]= useState<HightlightData>({} as HightlightData);
    async function loadTransactions(){
        const dataKey = '@gofinances:transactions_user:'+user.id;
        const response = await AsyncStorage.getItem(dataKey);
        const transactions = response ? JSON.parse(response) : [];

        let entriesTotal = 0;
        let expensiveTotal = 0;

        function getLastTransactionDate(
          collection: DataListProps[],
          type: 'positive' | 'negative'
          ){
        const collectionFiltered = collection
          .filter(transaction => transaction.type === type);

          if(collectionFiltered.length===0){
            return 0;
          }

          const lastTransaction = new Date(
          Math.max.apply(Math, collectionFiltered
            .map(transaction => new Date(transaction.date).getTime())))
            return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString('pt-BR',{month:'long'})}`
  
          
        }
    
        const transactionsFormatted: DataListProps[] = transactions
        .map((item: DataListProps) => {
    
          if(item.type === 'positive'){
            entriesTotal += Number(item.amount);
          }else{
            expensiveTotal += Number(item.amount)
          }
          const amount = Number(item.amount)
          .toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });
    
          const date = Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          }).format(new Date(item.date));
    
          return {
            id: item.id,
            name: item.name,
            amount,
            type: item.type,
            category: item.category,
            date,
          }
    
        });
    
        setTransactions(transactionsFormatted);

        const lastTransactionsEntries = getLastTransactionDate(transactions, 'positive')
        const lastTransactionsExpensives = getLastTransactionDate(transactions, 'negative')

        const totalInterval = lastTransactionsExpensives === 0 
        ? 'Não há transações'
        : `01 a ${lastTransactionsExpensives}`


       

        const total = entriesTotal - expensiveTotal;

        setHightlightData({
          entries:{
            amount:entriesTotal
            .toLocaleString('pt-BR',{
              style: 'currency',
              currency:'BRL'
            }),
            lastTransaction:lastTransactionsEntries === 0 ? 'Não há transações' :`Última entrada dia ${lastTransactionsEntries}`
          },
          expensives:{
            amount:expensiveTotal
            .toLocaleString('pt-BR',{
              style: 'currency',
              currency:'BRL'
            }),
            lastTransaction:lastTransactionsExpensives === 0 ?'Não transações':`Última saída dia ${lastTransactionsExpensives}`
          },
          total:{
            amount: total.toLocaleString('pt-BR',{
              style:'currency',
              currency:'BRL'
            }),
            lastTransaction:totalInterval
          }
        });
        
        setIsLoading(false)
    
      }
    

    useEffect(()=>{
        loadTransactions();
    },[])

    useFocusEffect(useCallback(()=>{
      loadTransactions();
    },[]))


    return(
        <Container>
          {
            isLoading? 
            <LoadContainer>
              <ActivityIndicator
               color={theme.colors.primary}
               size="large"
               />
            </LoadContainer>:
            <>
          <Header>
          <UserWrapper>
             <UserInfo>
                 <Photo
                  source={{uri:user.photo}}/>
                 <User>
                     <UserGreeting>Olá, </UserGreeting>
                     <UserName>{user.name}</UserName>
                 </User>
             </UserInfo>
             <LogoutButton onPress={signOut}>
                <Icon name="power"/>
             </LogoutButton>
             </UserWrapper>

          </Header>
          <HightlightCards>
            <HightlightCard 
                type='up'
                title="Entradas"
                amount={hightlightData.entries.amount}
                lastTransaction={hightlightData.entries.lastTransaction}
            />
            <HightlightCard 
                type="down"
                title="Saídas"
                amount={hightlightData.expensives.amount}
                lastTransaction={hightlightData.expensives.lastTransaction}
            />
            <HightlightCard 
                type="total"
                title="Total"
                amount={hightlightData.total.amount}
                lastTransaction={hightlightData.total.lastTransaction}
            />
            </HightlightCards>

            <Transactions>
                <Title>Listagem</Title>

                <TransactionList
                    data={transactions}
                    keyExtractor={item => item.id}
                    renderItem={({item})=> <TransactionCard data={item}
                    
                     />}
                />
                               
            </Transactions>
            </>
          }
            
        </Container>
    )
}