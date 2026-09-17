import { useQuery } from '@tanstack/react-query'
import * as cartApi from '../api/cartApi'
import { useAuth } from '../context/AuthContext'

export function useCart() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
  })
}
