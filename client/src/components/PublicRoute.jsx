import React from 'react'
import {Navigate} from 'react-router-dom'


//register,login(Public Routes)
const PublicRoute = (props) => {
    
    //if user logged in
    if(localStorage.getItem('token')){
        return <Navigate to='/'/>;
    }
    else{
        return props.children;
    }
}

export default PublicRoute
