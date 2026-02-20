'use client';

import ThemeToggleStandalone from '../components/ThemeToggleStandalone';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="fixed top-4 right-4">
        <ThemeToggleStandalone />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Growdo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">할 일을 관리하고 보상을 받으세요!!</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            간편 로그인
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => {
                window.location.href = `${API_URL}/oauth2/authorization/google`;
              }}
              className="w-full py-4 px-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                <span className="text-lg">Google로 로그인</span>
              </div>
            </button>

            <button
              onClick={() => {
                window.location.href = `${API_URL}/oauth2/authorization/kakao`;
              }}
              className="w-full py-4 px-6 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-medium transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                </svg>
                <span className="text-lg">카카오로 로그인</span>
              </div>
            </button>

            <button
              onClick={() => {
                window.location.href = `${API_URL}/oauth2/authorization/naver`;
              }}
              className="w-full py-4 px-6 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z" />
                </svg>
                <span className="text-lg">네이버로 로그인</span>
              </div>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              소셜 계정으로 간편하게 로그인하세요
              <br />
              별도 회원가입 없이 바로 이용 가능합니다
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            로그인 시{' '}
            <a href="#" className="text-indigo-500 hover:underline">
              서비스 이용약관
            </a>{' '}
            및{' '}
            <a href="#" className="text-indigo-500 hover:underline">
              개인정보처리방침
            </a>
            에 동의합니다
          </p>
        </div>
      </div>
    </div>
  );
}
