import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import LoginButton from '../auth/LoginButton';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { Users, LayoutDashboard, FileSpreadsheet } from 'lucide-react';
import { SiCoffeescript } from 'react-icons/si';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: userProfile } = useGetCallerUserProfile();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                <span>Attendance</span>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPath === '/'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  }`}
                >
                  <LayoutDashboard className="inline-block mr-2 h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/employees"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPath.startsWith('/employees')
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  }`}
                >
                  <Users className="inline-block mr-2 h-4 w-4" />
                  Employees
                </Link>
                <Link
                  to="/monthly-report"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPath === '/monthly-report'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  }`}
                >
                  <FileSpreadsheet className="inline-block mr-2 h-4 w-4" />
                  Monthly Report
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {userProfile && (
                <div className="hidden sm:block text-sm text-muted-foreground">
                  Welcome, <span className="font-medium text-foreground">{userProfile.name}</span>
                </div>
              )}
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Employee Attendance System</p>
            <p>
              Built with <SiCoffeescript className="inline h-4 w-4 text-amber-600" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  window.location.hostname
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
