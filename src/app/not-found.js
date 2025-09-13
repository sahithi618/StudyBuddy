"use client"
import { useRouter } from "next/navigation";

function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-full pt-16 pb-12 bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="relative">
          <div className="text-9xl font-bold text-gray-200">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Page Not Found
            </h1>
          </div>
        </div>
        <p className="mt-2 text-lg text-gray-600">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go Back
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;