import { useContext } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import AuthContext from './AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import CreatePost from './pages/CreatePost';
import Footer from './pages/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import NavBar from './pages/NavBar';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import WelcomeBS from './pages/WelcomeBS';
import './styles/app.css';

export default function App(){ 
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const hideNavOn = ['/'];

    return (
        <div className="app-root">
            {!hideNavOn.includes(location.pathname) && <NavBar />}            
            <div className="app-content">
                <Routes>
                    {user && user.role === 'admin' && <Route path="/admin" element={<AdminDashboard />} />}
                    <Route path='/' element={<WelcomeBS/>}/>
                    <Route path='/home' element={<Home/>}/>
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
