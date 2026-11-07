import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { Button } from '../components/common/Button';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token && !email) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    authService.verifyEmail(token, email)
      .then((res) => {
        setStatus('success');
        setMessage(res.message || 'Email verified successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Verification link expired or invalid.');
      });
  }, [token, email]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-10 px-6 shadow-xl rounded-3xl border border-slate-200 dark:border-slate-800 text-center sm:px-10 space-y-4">
          {status === 'verifying' && (
            <>
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Verifying your School Email...
              </h3>
              <p className="text-xs text-slate-500">Please wait while we confirm your student credentials.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Account Verified!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">{message}</p>
              <Button
                className="w-full mt-4"
                onClick={() => navigate('/')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Enter SchoolConnect
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Verification Failed
              </h3>
              <p className="text-xs text-rose-600">{message}</p>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate('/login')}
              >
                Back to Sign In
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
