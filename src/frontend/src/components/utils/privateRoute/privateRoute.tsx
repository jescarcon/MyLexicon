import { Navigate } from 'react-router-dom'
import type { JSX } from 'react'
import { useAuth } from '../authContext/authContext'

interface PrivateRouteProps {
  children: JSX.Element
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/" replace />
}