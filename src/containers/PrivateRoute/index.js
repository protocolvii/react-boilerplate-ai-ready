import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrRefreshToken } from '../../utils/auth';
import { selectToken, selectExp, selectTokenId, selectRefreshToken, selectRefreshing, selectRefreshErr, selectLastRefreshAt } from '../Auth/selectors';

const PrivateRoute = ({ route }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useSelector(selectToken);
  const expires = useSelector(selectExp);
  const tokenId = useSelector(selectTokenId);
  const refreshToken = useSelector(selectRefreshToken);
  const refreshing = useSelector(selectRefreshing);
  const refreshErr = useSelector(selectRefreshErr);
  const lastRefreshAt = useSelector(selectLastRefreshAt);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        await getOrRefreshToken(dispatch, { token, expires, tokenId, refreshToken, refreshing, refreshErr, lastRefreshAt }, { isFresh: false });
        if (active) setAuth(true);
      } catch (e) {
        if (active) navigate('/login', { replace: true, state: { from: location } });
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, [dispatch, token, expires, tokenId, refreshToken, refreshing, refreshErr, lastRefreshAt, navigate, location]);

  if (!auth) return null;

  const Component = route.component;
  return <Component route={route} />;
};

export default PrivateRoute;
