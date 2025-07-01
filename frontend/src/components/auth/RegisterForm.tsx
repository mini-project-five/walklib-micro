import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email || !userName || !userPassword) {
      setError("모든 필드를 입력해 주세요.");
      return;
    }

    try {
      const response = await fetch("/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userName, userPassword }),
      });

      if (response.ok) {
        setSuccess(true);
        setEmail("");
        setUserName("");
        setUserPassword("");
        if (onSuccess) onSuccess();
      } else {
        const data = await response.text();
        setError(data || "회원가입에 실패했습니다.");
      }
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <Input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="이름"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="비밀번호"
        value={userPassword}
        onChange={(e) => setUserPassword(e.target.value)}
        required
      />
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">회원가입이 완료되었습니다!</div>}
      <Button type="submit" className="w-full">
        회원가입
      </Button>
    </form>
  );
};

export default RegisterForm;
