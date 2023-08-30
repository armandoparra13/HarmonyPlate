import React from 'react';
import { useAuth } from '../../Auth'
import { useNavigate } from 'react-router-dom';

/*
export const LoginPage = () => {
  return (
    <div className="LoginPage">
        <h1>This is Log-in Page!</h1>
    </div>
  );
}

*/

function CreateProfilePage() {
  const { logout } = useAuth()
  const navigate = useNavigate();

  async function handleLogout() {

    try {
      await logout();
      navigate('/');
    } catch {

    }

  }

  return (
    <div>
      <div>hi- add profile frontend</div>
      <div>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </div>);
}

export default CreateProfilePage;
