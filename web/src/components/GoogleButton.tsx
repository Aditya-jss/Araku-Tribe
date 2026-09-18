import { FaGoogle } from 'react-icons/fa6'

export function GoogleButton() {
  return (
    <a
      href="/api/auth/google/login"
      className="flex w-full items-center justify-center gap-2 rounded border py-2.5 font-medium hover:bg-gray-50"
    >
      <FaGoogle />
      Continue with Google
    </a>
  )
}
