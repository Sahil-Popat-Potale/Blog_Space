import React from 'react'; 
import { Routes, Route, Link } from 'react-router-dom'; 
import Home from './pages/Home'; 
import Login from './pages/Login'; 
import Register from './pages/Register'; 
import Profile from './pages/Profile'; 
import PostDetail from './pages/PostDetail'; 
import CreatePost from './pages/CreatePost';

export default function App(){ 
    return (
        <div>
            <nav style={{padding:10,borderBottom:'1px solid #ddd'}}>
                <Link to='/'>Home</Link>
                <Link to='/create'>Create</Link>
                <Link to='/login'>Login</Link>
                <Link to='/register'>Register</Link>
                <Link to='/profile'>Profile</Link>
            </nav>
            
            <div style={{padding:20}}>
                <Routes>
                    <Route path='/' element={<Home/>}/>
                    <Route path='/login' element={<Login/>}/>
                    <Route path='/register' element={<Register/>}/>
                    <Route path='/profile' element={<Profile/>}/>
                    <Route path='/posts/:id' element={<PostDetail/>}/>
                    <Route path='/create' element={<CreatePost/>}/>
                    </Routes>
            </div>
        </div>
    );
}
