import { Navigate } from 'react-router-dom';
import { useAuth } from '../authContext/authContext';
import type { JSX } from 'react';

interface PublicRouteProps {
  children: JSX.Element;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/mis-diccionarios" replace />;
  }

  return children;
}