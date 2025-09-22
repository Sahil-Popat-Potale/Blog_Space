import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Footer from './pages/Footer';
import NavBar from './pages/NavBar';
import './styles/app.css';

export default function App(){ 
    return (
        <div className="app-root">
            <NavBar />            
            <div className="app-content">
                <Routes>
                    <Route path='/' element={<Home/>}/>
                    <Route path='/login' element={<Login/>}/>
                    <Route path='/register' element={<Register/>}/>
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path='/profile' element={<Profile/>}/>
                    <Route path='/posts/:id' element={<PostDetail/>}/>
                    <Route path='/create' element={<CreatePost/>}/>
                </Routes>
            </div>
            <Footer />
        </div>
    );
}
