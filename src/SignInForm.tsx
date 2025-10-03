"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, FormEvent } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    formData.set("flow", "signIn");
    
    void signIn("password", formData).catch((error: any) => {
      let toastTitle = "";
      if (error?.message?.includes("Invalid password")) {
        toastTitle = "Senha inválida. Tente novamente.";
      } else if (error?.message?.includes("Account not found")) {
        toastTitle = "Conta não encontrada. Verifique o email.";
      } else {
        toastTitle = "Não foi possível fazer login. Verifique suas credenciais.";
      }
      toast.error(toastTitle);
      setSubmitting(false);
    });
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Entrar no Sistema</h2>
          <p className="mt-2 text-sm text-gray-600">Faça login com suas credenciais</p>
        </div>
      </div>
      
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
      >

        <input
          className="auth-input-field"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className="auth-input-field"
          type="password"
          name="password"
          placeholder="Senha"
          required
          minLength={6}
        />
        <button className="auth-button" type="submit" disabled={submitting}>
          Entrar
        </button>
      </form>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Credenciais de teste:</strong><br/>
          Admin: admin@eagle.com / 123456<br/>
          Usuário: silfrancys92@gmail.com / 123456
        </p>
      </div>
    </div>
  );
}
