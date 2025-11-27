import { Metadata } from "next"
import RegisterForm from "@/components/auth/RegisterForm"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Sign Up | SmartDocConverter",
  description: "Create your SmartDocConverter account",
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-600">
              SmartDocConverter
            </h2>
            <p className="text-sm text-gray-600">Professional Document Tools</p>
          </div>
        </Link>

        <div className="rounded-xl bg-white px-8 py-10 shadow-xl">
          <RegisterForm />
        </div>

        <div className="mt-6 text-center text-xs text-gray-600">
          <p>
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
