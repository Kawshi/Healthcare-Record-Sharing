import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-gray-600">Page not found</p>
        <Link className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white" to="/">Go Home</Link>
      </div>
    </div>
  );
}
