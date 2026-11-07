import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-4">
        <GraduationCap className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100">404</h1>
      <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-2">
        Classroom or Page Not Found
      </h2>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
        The link you followed may have expired, or the classroom location might have changed.
      </p>
      <Link to="/">
        <Button size="sm" leftIcon={<Home className="w-4 h-4" />}>
          Return to School Home
        </Button>
      </Link>
    </div>
  );
};
