import { Outlet } from "react-router-dom";

// Navbar and Footer will be built in Module 3 (Products UI).
// For now this is a clean shell that renders child routes.
export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar goes here */}
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Footer goes here */}
    </div>
  );
}
