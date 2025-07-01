import React from "react";
import RegisterForm from "../components/auth/RegisterForm";

const RegisterPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">회원가입</h1>
      <RegisterForm />
      <div className="mt-4">
        이미 계정이 있으신가요? <a href="/login" className="text-blue-600 underline">로그인</a>
      </div>
    </div>
  );
};

export default RegisterPage;
