import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { CompanySelector } from "./components/CompanySelector";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ClientDashboard } from "./components/client/ClientDashboard";
import { NoCompanyView } from "./components/NoCompanyView";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MobileInspection } from "./components/MobileInspection";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rota para aplicação mobile de vistoria */}
        <Route path="/vistoria-mobile/:inspectionId" element={<MobileInspection />} />
        
        {/* Rota principal da aplicação */}
        <Route path="/*" element={<MainApp />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

function MainApp() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-blue-600">🦅 Eagle Vistoria</h2>
          <Authenticated>
            <CompanySelector />
          </Authenticated>
        </div>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1">
        <Content />
      </main>
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const activeCompany = useQuery(api.companies.getActiveCompany);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Unauthenticated>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Sistema de Vistorias
              </h1>
              <p className="text-xl text-gray-600">
                Faça login para acessar o sistema
              </p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {!activeCompany ? (
          <NoCompanyView />
        ) : activeCompany.role === "admin" ? (
          <AdminDashboard />
        ) : (
          <ClientDashboard />
        )}
      </Authenticated>
    </div>
  );
}
