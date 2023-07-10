import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearErrorMessage,
  onChecking,
  onLogin,
  onLogout,
} from '../store/auth/authSlice';
import { generacionApi } from '../api';
import { PrivateRoutes } from '../models/routes';
// import { useEffect } from 'react';
// import { useEffect } from 'react';
// import { useEffect } from 'react';

export const useAuthStore = () => {
  const { status, user, errorMessage } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  console.log(user);
  if (!user) {
    console.log('El objeto de usuario está vacío');
  }

  const startLogin = async ({ email, password }) => {
    dispatch(onChecking());
    // const token = localStorage.getItem('token');
    // console.log(token, 'login');
    // if (!token) return dispatch(onLogout());
    try {
      const { data } = await generacionApi.post(
        '/auth',
        {
          email,
          password,
        },
        {
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );

      localStorage.setItem('token', data.token);
      localStorage.setItem('token-init-date', new Date().getTime());
      localStorage.setItem('name', data.name);

      dispatch(onLogin(data, data.token));

      console.log(data, data.token, user.name);
      navigate(PrivateRoutes.DASHBOARD, { replace: true });
    } catch (error) {
      dispatch(onLogout('Error en autenticación'));
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  };

  const startRegister = async ({ email, password, name }) => {
    dispatch(onChecking());

    try {
      const { data } = await generacionApi.post(
        '/auth/new',
        {
          email,
          password,
          name,
        },
        {
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );

      window.localStorage.setItem('token', data.token);
      window.localStorage.setItem('token-init-date', new Date().getTime());
      dispatch(onLogin({ name: data.name, uid: data.uid, email: data.email }));
      navigate(PrivateRoutes.DASHBOARD, { replace: true });
    } catch (error) {
      dispatch(onLogout(error.response.data?.msg || '--'));
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  };

  const checkAuthToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return dispatch(onLogout());

    try {
      const { data } = await generacionApi.get('/auth/renew');
      console.log(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('token-init-date', new Date().getTime());
      dispatch(onLogin(data));
    } catch (error) {
      localStorage.clear();
      dispatch(onLogout());
    }
  };

  const startLogout = () => {
    localStorage.clear();
    dispatch(onLogout());
  };
  const videosLearningPath = async ({ id, tema, title, url }) => {
    await generacionApi.post(
      '/auth/videos',
      {
        id,
        tema,
        title,
        url,
      },
      {
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  };

  return {
    //*Properties
    status,
    user,
    errorMessage,

    //*methods
    startLogin,
    startRegister,
    checkAuthToken,
    startLogout,
    videosLearningPath,
  };
};
