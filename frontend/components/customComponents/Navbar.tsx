'use client';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from '../../lib/auth';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import Image from 'next/image';
import logoBtn from '../assets/Logo Icon Button.svg';
import { WrapperContainer } from './WrapperContainer';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const router = useRouter(); // Use the Next.js router
  const pathname = usePathname();
  const [active, setActive] = useState('Organisation');

  const handleClick = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = () => {
    signOut();
    router.push('/login'); // Redirect to login page after sign out
  };

  const handleGoBack = () => {
    if (!pathname) {
      return; // If pathname is undefined, exit the function
    }

    // Check if the route contains '/device' and navigate accordingly
    if (pathname.includes('/device')) {
      router.push('/organisations');
    }
    // Check if the route contains '/settings' and navigate accordingly
    else if (pathname.includes('/settings')) {
      const orgIdMatch = pathname.match(/organisations\/([^\/]*)/); // Extract the org ID from the path
      const orgId = orgIdMatch ? orgIdMatch[1] : null;

      if (orgId) {
        router.back();
      } else {
        router.push('/organisations');
      }
    }
    // Fallback for other routes
    else {
      router.back();
    }
  };

  return (
    <WrapperContainer className="border-b border-border rounded-none pb-0">
      <div className="w-full flex justify-between items-center gap-4">
        {/* Left side (logo and Organisation link) */}
        <div className="left-nav flex items-center gap-6">
          {/* Go Back Button */}
          {pathname !== '/organisations' && (
            <div
            className="flex items-center cursor-pointer text-white hover:text-blue-600 transition duration-200"
            onClick={handleGoBack}
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
          </div>
          )}

          {/* Logo */}
          <Image
            src={logoBtn}
            className="cursor-pointer w-10 h-10"
            style={{ paddingBottom: '15px' }}
            alt="Apex IoT Logo"
          />

          {/* Organisation Link */}
          <Link href="/organisations">
            <div
              onClick={() => setActive('Organisation')}
              className={`${
                active === 'Organisation'
                  ? 'border-b-4 border-secondary-foreground'
                  : ''
              } text-sm font-medium pb-3 px-2 cursor-pointer`}
            >
              Organisation
            </div>
          </Link>
        </div>

        {/* Right side (theme switch and sign out) */}
        <div className="right-nav flex items-center gap-6">
          <Switch onClick={handleClick} />
          <div
            className="text-sm font-bold underline cursor-pointer"
            onClick={handleSignOut}
          >
            Sign Out
          </div>
        </div>
      </div>

      {/* Adjust padding at the bottom to remove the gap between items and the separator line */}
      <div className="mt-0 w-full border-t border-border"></div>
    </WrapperContainer>
  );
};
